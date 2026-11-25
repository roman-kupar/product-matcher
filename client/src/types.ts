/** A row of the hospital's article master data (sample-challenge-v01.xlsx). */
export interface HospitalArticle {
  id: string
  name: string
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

/** Attribute name -> value. `null` means the source does not state it. */
export type Attributes = Record<string, string | null>

/** A product from a supplier catalog (product_catalog_*.pdf). */
export interface CatalogProduct {
  id: string
  hospitalArticleId: string
  supplier: string
  name: string
  articleNo: string
  source: string
  attributes: Attributes
}

export type AttributeStatus = 'MATCH' | 'MISMATCH' | 'MISSING'
export type Verdict = 'EQUIVALENT' | 'NEEDS_INFO' | 'NOT_EQUIVALENT'

export interface Assessment {
  verdict: Verdict
  score: number
  previousScore?: number
  rows: { attribute: string; required: string; offered: string | null; status: AttributeStatus }[]
}

export interface SupplierQuestion {
  id: string
  productId: string
  attribute: string
  text: string
  answer?: string
}
