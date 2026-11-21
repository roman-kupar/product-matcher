import type { EquivalenceStatus } from './comparison'

export interface TriageItem {
  id: string
  key: string
  articleId: string
  buyerArticle: string
  supplierArticle: string
  status: EquivalenceStatus
  score: number
  deltaScore?: number
}
