import pandas as pd
import networkx as nx
import json
import ast

rules = pd.read_csv("delta_lake/gold/association_rules.csv")
rules["antecedent"] = rules["antecedent"].apply(ast.literal_eval)
rules["consequent"] = rules["consequent"].apply(ast.literal_eval)

G = nx.DiGraph()
for _, row in rules.iterrows():
    for ant in row["antecedent"]:
        for con in row["consequent"]:
            G.add_edge(ant, con, weight=row["lift"], confidence=row["confidence"])

pagerank = nx.pagerank(G)

graph_data = {
    "nodes": [
        {"id": n, "degree": G.degree(n), "pagerank": round(pagerank[n], 4)}
        for n in G.nodes()
    ],
    "links": [
        {"source": u, "target": v, "lift": round(d["weight"], 3), "confidence": round(d["confidence"], 3)}
        for u, v, d in G.edges(data=True) if d["weight"] > 1.0
    ]
}

with open("delta_lake/gold/network_graph.json", "w") as f:
    json.dump(graph_data, f)

print(f"Done! {len(graph_data['nodes'])} nodes, {len(graph_data['links'])} links")