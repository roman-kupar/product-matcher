import type { Assessment, AttributeKey, Attributes, CatalogProduct } from './types'

const normalize = (value: string) => value.trim().toLowerCase()

/**
 * Mock of the LLM equivalence check: compares each required attribute with the product's value.
 * Will be replaced by a server-side LLM call.
 */
export function assess(requirements: Attributes, product: CatalogProduct): Assessment {
  const rows = (Object.entries(requirements) as [AttributeKey, string | null][]).map(([attribute, required]) => {
    const offered = product.attributes[attribute] ?? null
    const status =
      offered === null ? 'MISSING' : normalize(offered) === normalize(required ?? '') ? 'MATCH' : 'MISMATCH'
    return { attribute, required: required ?? '—', offered, status } as const
  })

  const matches = rows.filter((r) => r.status === 'MATCH').length
  const verdict = rows.some((r) => r.status === 'MISMATCH')
    ? 'NOT_EQUIVALENT'
    : rows.some((r) => r.status === 'MISSING')
      ? 'NEEDS_INFO'
      : 'EQUIVALENT'

  return { verdict, score: Math.round((matches / rows.length) * 100), rows }
}
