from datetime import datetime
from typing import Any, Literal, List, Optional

from pydantic import BaseModel, Field, EmailStr


class IngestionStatsResponse(BaseModel):
    fetched: int
    unique: int
    inserted: int


ModerationStatus = Literal["pending", "approved", "rejected"]


class ArticleResponse(BaseModel):
    id: str
    title: str | None = None
    description: str | None = None
    content: str | None = None
    url: str | None = None
    image: str | None = None
    source_name: str | None = None
    published_at: datetime | None = None
    categories: list[str] = Field(default_factory=list)
    dominant_category: str = "Geral"
    score: float | None = None
    raw_score: float | None = None
    click_count: int = 0
    impression_count: int = 0
    normalized_category_scores: dict[str, float] = Field(default_factory=dict)
    status: ModerationStatus = "pending"
    category_admin: str | None = None
    topic: str | None = None
    moderated_at: datetime | None = None
    moderated_by: str | None = None


class ArticleListResponse(BaseModel):
    limit: int
    category: str | None = None
    source_name: str | None = None
    status: ModerationStatus | None = None
    items: list[ArticleResponse] = Field(default_factory=list)


class ModerationRequest(BaseModel):
    status: ModerationStatus
    category_admin: str | None = None
    topic: str | None = None
    moderated_by: str | None = None


class TagItem(BaseModel):
    nome: str
    keywords: list[str] = Field(default_factory=list)
    sinonimos: list[str] = Field(default_factory=list)


class TagsResponse(BaseModel):
    categorias: list[TagItem] = Field(default_factory=list)
    topicos: list[str] = Field(default_factory=list)


class LoginRequest(BaseModel):
    email: str
    senha: str


class LoginResponse(BaseModel):
    userId: str
    userName: str
    userRole: Literal["admin", "user"]
    token: str


class FeedResponse(BaseModel):
    user_id: str
    limit: int
    refresh: bool
    generated_at: datetime
    ingestion: IngestionStatsResponse
    items: list[ArticleResponse] = Field(default_factory=list)


class IngestionResponse(BaseModel):
    user_id: str
    stats: IngestionStatsResponse
    executed_at: datetime


class ClickRequest(BaseModel):
    article_id: str


class FeedbackRequest(BaseModel):
    article_id: str
    action: Literal["gostei", "nao_gostei"]


class RankingEntryResponse(BaseModel):
    category: str
    score: float


class FeedbackResponse(BaseModel):
    user_id: str
    article_id: str
    action: str
    dominant_category: str
    ranking: list[RankingEntryResponse] = Field(default_factory=list)
    updated_at: datetime


class UserEventResponse(BaseModel):
    id: str
    action: str | None = None
    article_id: str | None = None
    article_title: str | None = None
    dominant_category: str | None = None
    categories: list[str] = Field(default_factory=list)
    created_at: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ProfileResponse(BaseModel):
    user_id: str
    preferences: dict[str, float] = Field(default_factory=dict)
    normalized_preferences: dict[str, float] = Field(default_factory=dict)
    updated_at: datetime | None = None
    created_at: datetime | None = None
    recent_events: list[UserEventResponse] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    mongodb: str
    checked_at: datetime
    collections: dict[str, int] = Field(default_factory=dict)


# NOVOS SCHEMAS — Adicionados para o fluxo real de cadastro de usuários

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Nome do usuário")
    email: EmailStr = Field(..., description="E-mail válido e único")
    phone: Optional[str] = Field(default="", description="Telefone opcional")
    password: str = Field(..., min_length=4, description="Senha do usuário")


class UserRegisterResponse(BaseModel):
    status: str = "success"
    message: str
    user_id: str
