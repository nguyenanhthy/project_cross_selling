from __future__ import annotations

import ast
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.network import router as network_router
from services.recommender import router as recommender_router


def resolve_data_path() -> Path:
    env_path = os.getenv("DATA_PATH")
    if env_path:
        return Path(env_path).resolve()

    resolved = Path(__file__).resolve()
    root = resolved.parents[1] if len(resolved.parents) > 1 else resolved.parent
    default_path = root / "delta_lake" / "gold"
    return default_path.resolve()


def load_rules(data_path: Path) -> List[dict]:
    rules_path = data_path / "association_rules.csv"
    if not rules_path.exists():
        raise FileNotFoundError(f"Rules file not found at {rules_path}")

    df = pd.read_csv(rules_path)
    required = {"antecedent", "consequent", "confidence", "lift"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in association_rules.csv: {missing}")

    rules = []
    for _, row in df.iterrows():
        try:
            antecedent = json.loads(row["antecedent"])
            consequent = json.loads(row["consequent"])
        except (json.JSONDecodeError, ValueError):
            antecedent = ast.literal_eval(row["antecedent"])
            consequent = ast.literal_eval(row["consequent"])

        rules.append(
            {
                "antecedent": antecedent,
                "consequent": consequent,
                "confidence": float(row["confidence"]),
                "lift": float(row["lift"]),
            }
        )
    return rules


def load_network(data_path: Path) -> dict:
    network_path = data_path / "network_graph.json"
    if not network_path.exists():
        raise FileNotFoundError(f"Network file not found at {network_path}")

    with network_path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    return data


@asynccontextmanager
async def lifespan(app: FastAPI):
    data_path = resolve_data_path()
    app.state.data_path = data_path
    app.state.rules = load_rules(data_path)
    app.state.network = load_network(data_path)
    yield


app = FastAPI(title="Cross-Selling Recommendation API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)

app.include_router(recommender_router)
app.include_router(network_router)


class HealthResponse(BaseModel):
    status: str
    rules_loaded: int
    nodes: int


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    rules_loaded = len(getattr(app.state, "rules", []))
    nodes_loaded = len(getattr(app.state, "network", {}).get("nodes", []))
    return HealthResponse(status="ok", rules_loaded=rules_loaded, nodes=nodes_loaded)
