/** Attribute -> value; `null` means the source does not state it. */
export type Values = Record<string, string | null>

export interface HospitalArticle {
  id: string
  name: string
  category: string
  brand: string
  articleNo: string
  annualQuantity: number
  orderUnit: string
  unitsPerOrderUnit: number
  baseUnit: string
  gtin: string
  mdrClass: string
  targetPrice: number
  currency: string
}

export interface CatalogProduct {
  id: string
  category: string
  supplier: string
  name: string
  articleNo: string
  source: string
  attributes: Values
}

export interface SupplierQuestion {
  id: string
  productId: string
  attribute: string
  answer?: string
}

export type ArticleStatus = 'EQUIVALENT_AVAILABLE' | 'NEEDS_INFO' | 'NO_EQUIVALENT' | 'NO_CANDIDATES' | 'NOT_ASSESSED'
