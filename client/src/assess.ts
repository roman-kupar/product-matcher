import { ArticleStatus, AttributeStatus, Verdict } from './enums'
import { CATEGORY_ATTRIBUTES, REQUIREMENTS } from './mockData'
import type { Assessment, CatalogProduct, HospitalArticle } from './types'

const normalize = (value: string) => value.trim().toLowerCase()

/** Assessments are per (hospital article, product) pair. */
export const assessmentKey = (articleId: string, productId: string) => `${articleId}:${productId}`

/** Matching: candidates are catalog products of the same category. */
export const findCandidates = (article: HospitalArticle, products: CatalogProduct[]) =>
  products.filter((p) => p.category === article.category)

/**
 * Mock of the LLM equivalence check: compares the category's attributes one by one.
 * Will be replaced by a server-side LLM call.
 */
export function assess(article: HospitalArticle, product: CatalogProduct): Assessment {
  const requirements = REQUIREMENTS[article.id] ?? {}
  const rows = (CATEGORY_ATTRIBUTES[article.category] ?? []).map((attribute) => {
    const required = requirements[attribute] ?? null
    const offered = product.attributes[attribute] ?? null
    const status: AttributeStatus =
      offered === null
        ? AttributeStatus.Missing
        : required === null || normalize(offered) === normalize(required)
          ? AttributeStatus.Match
          : AttributeStatus.Mismatch
    return { attribute, required: required ?? '—', offered, status }
  })

  const has = (status: AttributeStatus) => rows.some((r) => r.status === status)
  const matches = rows.filter((r) => r.status === AttributeStatus.Match).length
  const verdict = has(AttributeStatus.Mismatch)
    ? Verdict.NotEquivalent
    : has(AttributeStatus.Missing)
      ? Verdict.NeedsInfo
      : Verdict.Equivalent

  return {
    verdict,
    score: rows.length ? Math.round((matches / rows.length) * 100) : 0,
    rows,
    assessedAt: new Date().toISOString(),
  }
}

/** An article's status is derived from its candidates' verdicts; the best candidate wins. */
export function articleStatus(assessments: Assessment[]): ArticleStatus {
  const has = (verdict: Verdict) => assessments.some((a) => a.verdict === verdict)
  if (assessments.length === 0) return ArticleStatus.NoCandidates
  if (has(Verdict.Equivalent)) return ArticleStatus.EquivalentAvailable
  if (has(Verdict.NeedsInfo)) return ArticleStatus.NeedsInfo
  return ArticleStatus.NoEquivalent
}
