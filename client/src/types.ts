import type { ArticleStatus, AttributeKey, AttributeStatus, Category, Verdict } from './enums'
import type { Language } from './i18n/languages'

export type LocalizedText = Record<Language, string>

/** A row of the hospital's article master data (sample-challenge-v01.xlsx). */
export interface HospitalArticle {
  id: string
  name: string
  category: Category
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

/** Attribute -> value. `null` means the source does not state it. */
export type Attributes = Partial<Record<AttributeKey, string | null>>

/** A product from a supplier catalog (product_catalog_*.pdf). */
export interface CatalogProduct {
  id: string
  category: Category
  supplier: string
  name: string
  articleNo: string
  source: string
  attributes: Attributes
}

export interface Assessment {
  verdict: Verdict
  score: number
  previousScore?: number
  /** ISO timestamp, so changes between runs are traceable. */
  assessedAt: string
  rows: {
    attribute: AttributeKey
    required: string | null
    offered: string | null
    status: AttributeStatus
    /** LLM explanation, only for attributes the LLM judged. */
    reasoning?: LocalizedText
  }[]
}

export interface SupplierQuestion {
  id: string
  productId: string
  attribute: AttributeKey
  answer?: string
}

// ---- API responses (see service/src/store.ts) ----

export interface ArticleSummary extends HospitalArticle {
  status: ArticleStatus
}

export interface Candidate {
  product: CatalogProduct
  assessment: Assessment | null
  questions: SupplierQuestion[]
}

export interface ArticleDetail extends ArticleSummary {
  candidates: Candidate[]
}

export interface SupplierSummary {
  name: string
  openQuestions: number
}

export interface OpenQuestion extends SupplierQuestion {
  product: CatalogProduct
}
