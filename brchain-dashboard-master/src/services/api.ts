// Camada centralizada de comunicacao com a API do Ramon.
// Em dev, o ADM corre em http://localhost:3000 e a API Python em http://localhost:8000.
// Em prod, defina NEXT_PUBLIC_API_URL no .env.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export type ModerationStatus = "pending" | "approved" | "rejected";

export interface Article {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  url: string | null;
  image: string | null;
  source_name: string | null;
  published_at: string | null;
  categories: string[];
  dominant_category: string;
  status: ModerationStatus;
  category_admin: string | null;
  topic: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
}

export interface ArticleListResponse {
  limit: number;
  category: string | null;
  source_name: string | null;
  status: ModerationStatus | null;
  items: Article[];
}

export interface TagsResponse {
  categorias: { nome: string; keywords: string[]; sinonimos: string[] }[];
  topicos: string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data?.detail || JSON.stringify(data);
    } catch {
      detail = await response.text();
    }
    throw new Error(`API ${response.status}: ${detail || response.statusText}`);
  }
  return (await response.json()) as T;
}

export const api = {
  listPending: (limit = 50) =>
    request<ArticleListResponse>(`/moderation/pending?limit=${limit}`),
  listApproved: (limit = 50) =>
    request<ArticleListResponse>(`/moderation/approved?limit=${limit}`),
  listRejected: (limit = 50) =>
    request<ArticleListResponse>(`/moderation/rejected?limit=${limit}`),
  moderate: (
    articleId: string,
    body: {
      status: ModerationStatus;
      category_admin?: string;
      topic?: string;
      moderated_by?: string;
    }
  ) =>
    request<Article>(`/moderation/${articleId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  tags: () => request<TagsResponse>(`/tags`),
  ingest: () =>
    request<{
      user_id: string;
      stats: { fetched: number; unique: number; inserted: number };
      executed_at: string;
    }>(`/ingest`, { method: "POST" }),
  login: (email: string, senha: string) =>
    request<{
      userId: string;
      userName: string;
      userRole: "admin" | "user";
      token: string;
    }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),
};
