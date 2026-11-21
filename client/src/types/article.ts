export type ArticleSourceType = 'HOSPITAL' | 'SUPPLIER'

export interface NormalizedArticle {
  id: string
  title: string
  sku?: string
  gtin?: string
  manufacturer?: string
  packagingUnit?: string
  brand?: string
  category?: string
  description?: string
}
