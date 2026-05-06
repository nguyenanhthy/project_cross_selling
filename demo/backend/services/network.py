from __future__ import annotations

from typing import List, Literal

import networkx as nx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

router = APIRouter()


def get_network(request: Request) -> dict:
    graph_data = getattr(request.app.state, "network", None)
    if graph_data is None:
        raise HTTPException(status_code=500, detail="Network graph not loaded")
    return graph_data


class NetworkNode(BaseModel):
    id: str
    degree: int
    in_degree: int
    out_degree: int
    pagerank: float


class NetworkLink(BaseModel):
    source: str
    target: str
    lift: float
    confidence: float


class NetworkStats(BaseModel):
    total_nodes: int
    total_edges: int
    avg_degree: float
    most_connected: List[str]


class NetworkResponse(BaseModel):
    nodes: List[NetworkNode]
    links: List[NetworkLink]
    stats: NetworkStats


class NeighborResponse(BaseModel):
    center: str
    nodes: List[NetworkNode]
    links: List[NetworkLink]


class TopMetricItem(BaseModel):
    category: str
    score: float
    rank: int


class TopMetricResponse(BaseModel):
    metric: Literal["degree", "pagerank"]
    top: List[TopMetricItem]


def build_graph(graph_data: dict) -> nx.DiGraph:
    graph = nx.DiGraph()
    for node in graph_data.get("nodes", []):
        graph.add_node(node["id"])
    for link in graph_data.get("links", []):
        graph.add_edge(
            link["source"],
            link["target"],
            lift=link.get("lift", 0.0),
            confidence=link.get("confidence", 0.0),
        )
    return graph


@router.get("/network", response_model=NetworkResponse)
def network_overview(graph_data: dict = Depends(get_network)) -> NetworkResponse:
    graph = build_graph(graph_data)
    pagerank_scores = nx.pagerank(graph, weight="lift") if graph.number_of_nodes() else {}

    links = [
        NetworkLink(**link)
        for link in graph_data.get("links", [])
        if link.get("lift", 0.0) > 1.0
    ]

    nodes = []
    for node in graph_data.get("nodes", []):
        node_id = node["id"]
        nodes.append(
            NetworkNode(
                id=node_id,
                degree=graph.degree(node_id),
                in_degree=graph.in_degree(node_id),
                out_degree=graph.out_degree(node_id),
                pagerank=pagerank_scores.get(node_id, 0.0),
            )
        )

    nodes_sorted = sorted(nodes, key=lambda n: n.degree, reverse=True)
    avg_degree = (
        sum(node.degree for node in nodes) / len(nodes) if nodes else 0.0
    )
    stats = NetworkStats(
        total_nodes=len(nodes),
        total_edges=len(links),
        avg_degree=avg_degree,
        most_connected=[node.id for node in nodes_sorted[:5]],
    )

    return NetworkResponse(nodes=nodes, links=links, stats=stats)


@router.get("/network/neighbors", response_model=NeighborResponse)
def network_neighbors(
    category: str = Query(..., min_length=1),
    graph_data: dict = Depends(get_network),
) -> NeighborResponse:
    graph = build_graph(graph_data)
    if category not in graph:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")

    neighbors = set(graph.successors(category)) | set(graph.predecessors(category))
    sub_nodes = [category, *sorted(neighbors)]

    pagerank_scores = nx.pagerank(graph, weight="lift") if graph.number_of_nodes() else {}
    node_items = [
        NetworkNode(
            id=node_id,
            degree=graph.degree(node_id),
            in_degree=graph.in_degree(node_id),
            out_degree=graph.out_degree(node_id),
            pagerank=pagerank_scores.get(node_id, 0.0),
        )
        for node_id in sub_nodes
    ]

    sub_links = [
        NetworkLink(**link)
        for link in graph_data.get("links", [])
        if link.get("source") in sub_nodes and link.get("target") in sub_nodes
    ]

    return NeighborResponse(center=category, nodes=node_items, links=sub_links)


@router.get("/network/top", response_model=TopMetricResponse)
def network_top(
    metric: Literal["degree", "pagerank"] = Query("degree"),
    limit: int = Query(10, ge=1, le=100),
    graph_data: dict = Depends(get_network),
) -> TopMetricResponse:
    graph = build_graph(graph_data)
    if metric == "pagerank":
        scores = nx.pagerank(graph, weight="lift") if graph.number_of_nodes() else {}
    else:
        scores = {node: graph.degree(node) for node in graph.nodes}

    sorted_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_items = [
        TopMetricItem(category=node, score=score, rank=index + 1)
        for index, (node, score) in enumerate(sorted_scores[:limit])
    ]

    return TopMetricResponse(metric=metric, top=top_items)
