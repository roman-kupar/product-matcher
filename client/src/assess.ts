import { AttributeStatus, Verdict, type AttributeKey } from './enums'
import type { Assessment, Attributes, CatalogProduct } from './types'

const normalize = (value: string) => value.trim().toLowerCase()

/**
 * Mock of the LLM equivalence check: compares each required attribute with the product's value.
 * Will be replaced by a server-side LLM call.
 */
export function assess(requirements: Attributes, product: CatalogProduct): Assessment {
  const rows = (Object.entries(requirements) as [AttributeKey, string | null][]).map(([attribute, required]) => {
    const offered = product.attributes[attribute] ?? null
    const status: AttributeStatus =
      offered === null
        ? AttributeStatus.Missing
        : normalize(offered) === normalize(required ?? '')
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

  return { verdict, score: Math.round((matches / rows.length) * 100), rows }
}
