import type { ArticleDetail, ArticleSummary, Assessment, OpenQuestion, SupplierQuestion, SupplierSummary } from '../model/types'

/** Thin typed wrappers around the service's REST API (proxied to the service in dev, see vite.config.ts). */
async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new Error((data as { error?: string } | null)?.error ?? `HTTP ${response.status}`)
  return data as T
}

const seg = encodeURIComponent

export const api = {
  // Hospital side
  articles: () => request<ArticleSummary[]>('GET', '/articles'),
  article: (id: string) => request<ArticleDetail>('GET', `/articles/${seg(id)}`),
  assess: (articleId: string, productId: string) =>
    request<Assessment>('POST', `/articles/${seg(articleId)}/candidates/${seg(productId)}/assessment`),
  askSupplier: (articleId: string, productId: string) =>
    request<SupplierQuestion[]>('POST', `/articles/${seg(articleId)}/candidates/${seg(productId)}/questions`),

  // Supplier side
  suppliers: () => request<SupplierSummary[]>('GET', '/suppliers'),
  questions: (supplier: string) => request<OpenQuestion[]>('GET', `/suppliers/${seg(supplier)}/questions`),
  answer: (supplier: string, questionId: string, answer: string) =>
    request<SupplierQuestion>('POST', `/suppliers/${seg(supplier)}/questions/${seg(questionId)}/answer`, { answer }),
}
