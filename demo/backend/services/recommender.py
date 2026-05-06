from __future__ import annotations

from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

router = APIRouter()


def get_rules(request: Request) -> List[dict]:
    rules = getattr(request.app.state, "rules", None)
    if rules is None:
        raise HTTPException(status_code=500, detail="Rules not loaded")
    return rules


class CategoryResponse(BaseModel):
    categories: List[str]
    total: int


class RecommendationItem(BaseModel):
    rank: int
    suggested_categories: List[str]
    confidence: float
    lift: float
    strength: Literal["strong", "moderate", "weak"]


class RecommendationResponse(BaseModel):
    category: str
    total_rules: int
    recommendations: List[RecommendationItem]


class RuleItem(BaseModel):
    antecedent: List[str]
    consequent: List[str]
    confidence: float
    lift: float
    strength: Literal["strong", "moderate", "weak"]


class RulesResponse(BaseModel):
    total: int
    rules: List[RuleItem]


class StatsResponse(BaseModel):
    total_rules: int
    total_categories: int
    avg_confidence: float
    avg_lift: float
    strong_rules: int
    moderate_rules: int
    weak_rules: int


def strength_label(lift: float) -> Literal["strong", "moderate", "weak"]:
    if lift > 2:
        return "strong"
    if lift >= 1:
        return "moderate"
    return "weak"


@router.get("/categories", response_model=CategoryResponse)
def list_categories(rules: List[dict] = Depends(get_rules)) -> CategoryResponse:
    categories = sorted({category for rule in rules for category in rule["antecedent"]})
    return CategoryResponse(categories=categories, total=len(categories))


@router.get("/recommend", response_model=RecommendationResponse)
def recommend(
    category: str = Query(..., min_length=1),
    top_k: int = Query(5, ge=1, le=100),
    rules: List[dict] = Depends(get_rules),
) -> RecommendationResponse:
    matched = [rule for rule in rules if category in rule["antecedent"]]

    if not matched:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")

    matched.sort(key=lambda item: item["lift"], reverse=True)
    top_rules = matched[:top_k]

    recommendations = [
        RecommendationItem(
            rank=index + 1,
            suggested_categories=rule["consequent"],
            confidence=rule["confidence"],
            lift=rule["lift"],
            strength=strength_label(rule["lift"]),
        )
        for index, rule in enumerate(top_rules)
    ]

    return RecommendationResponse(
        category=category,
        total_rules=len(matched),
        recommendations=recommendations,
    )


@router.get("/rules", response_model=RulesResponse)
def list_rules(
    sort_by: Literal["lift", "confidence"] = Query("lift"),
    order: Literal["asc", "desc"] = Query("desc"),
    limit: int = Query(100, ge=1, le=1000),
    rules: List[dict] = Depends(get_rules),
) -> RulesResponse:
    reverse = order == "desc"
    sorted_rules = sorted(rules, key=lambda item: item[sort_by], reverse=reverse)
    limited = sorted_rules[:limit]

    rule_items = [
        RuleItem(
            antecedent=rule["antecedent"],
            consequent=rule["consequent"],
            confidence=rule["confidence"],
            lift=rule["lift"],
            strength=strength_label(rule["lift"]),
        )
        for rule in limited
    ]

    return RulesResponse(total=len(rules), rules=rule_items)


@router.get("/stats", response_model=StatsResponse)
def stats(rules: List[dict] = Depends(get_rules)) -> StatsResponse:
    total_rules = len(rules)
    total_categories = len({category for rule in rules for category in rule["antecedent"]})
    avg_confidence = (
        sum(rule["confidence"] for rule in rules) / total_rules if total_rules else 0
    )
    avg_lift = sum(rule["lift"] for rule in rules) / total_rules if total_rules else 0
    strong_rules = sum(1 for rule in rules if rule["lift"] > 2)
    moderate_rules = sum(1 for rule in rules if 1 <= rule["lift"] <= 2)
    weak_rules = sum(1 for rule in rules if rule["lift"] < 1)

    return StatsResponse(
        total_rules=total_rules,
        total_categories=total_categories,
        avg_confidence=avg_confidence,
        avg_lift=avg_lift,
        strong_rules=strong_rules,
        moderate_rules=moderate_rules,
        weak_rules=weak_rules,
    )
