from pydantic import BaseModel, Field

class AgentRequest(BaseModel):
    query: str

class AgentResponse(BaseModel):
    result: str

from typing import Dict, List

class NewsItem(BaseModel):
    title: str
    summary: str
    sentiment_score: int = Field(..., ge=0, le=100)
    source_url: str
    published_at: str

class NewsBatch(BaseModel):
    items: list[NewsItem]

class BlueprintSchema(BaseModel):
    market_phase: str = Field(description="Current market phase e.g. 'Fear', 'Greed', 'Neutral', 'Recession'")
    risk_level: int = Field(description="Risk level from 1 (Safe) to 10 (High Risk)", ge=1, le=10)
    key_takeaways: List[str] = Field(description="Top 3 key takeaways summary", max_items=3)
    action_guide: str = Field(description="Concrete action guide for the user")
    recommended_portfolio: Dict[str, int] = Field(description="Portfolio allocation percentage, e.g. {'Cash': 50, 'Bitcoin': 50}")
    reasoning: str = Field(description="Logical reasoning behind the advice")
