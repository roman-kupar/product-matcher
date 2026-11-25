import { completeJson } from './llm.ts'

export type AttributeStatus = 'MATCH' | 'MISMATCH' | 'MISSING'
export type Verdict = 'EQUIVALENT' | 'NEEDS_INFO' | 'NOT_EQUIVALENT'
export type LocalizedText = { en: string; de: string }

type Values = Record<string, string | null>

/** Hospital requirements and product values per attribute; the keys are the category's fixed attribute list. */
export interface AssessmentInput {
  article: { name: string; attributes: Values }
  product: { name: string; supplier: string; attributes: Values }
  /** Attributes with a fixed code list (e.g. MDR class): compared exactly, never sent to the LLM. */
  exactAttributes?: string[]
}

export interface AssessmentRow {
  attribute: string
  required: string | null
  offered: string | null
  status: AttributeStatus
  reasoning?: LocalizedText
}

export interface Assessment {
  verdict: Verdict
  score: number
  rows: AssessmentRow[]
  assessedAt: string
}

const SYSTEM_PROMPT = `You are a procurement expert for hospital medical consumables.
Decide whether the supplier value of one attribute is functionally equivalent to the hospital requirement.
Treat spelling variants, brand-specific names and equal values in other notation as MATCH (e.g. "Luer-Lok" = "Luer-Lock").
The manufacturer does not matter.
Catalog abbreviations: VE = Verpackungseinheit (sales unit, this is the pack size), UK = Umkarton (outer carton of several VE),
G = Gauge, Stück/Stk = pieces.
First copy hospitalValue and supplierValue character for character from the input, then compare only those values.
Give a short reasoning (under 20 words) in English and German, then the status.`

const text = { type: 'string' }

/** Output shape the model is constrained to: one judgement for one attribute. */
const JUDGEMENT_SCHEMA = {
  name: 'attribute_judgement',
  schema: {
    type: 'object',
    additionalProperties: false,
    // Field order is the order the model writes in: quote both values, explain, then decide.
    required: ['hospitalValue', 'supplierValue', 'reasoning', 'status'],
    properties: {
      hospitalValue: text,
      supplierValue: text,
      reasoning: { type: 'object', additionalProperties: false, required: ['en', 'de'], properties: { en: text, de: text } },
      status: { type: 'string', enum: ['MATCH', 'MISMATCH'] },
    },
  },
}

/** Case- and whitespace-insensitive form, used for identical-value checks and quote verification. */
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()

/**
 * Clear cases are decided in code: no value -> MISSING, identical value -> MATCH,
 * coded attribute with a different value -> MISMATCH.
 * Every other attribute is judged by the LLM in its own call (all calls run in parallel).
 */
export async function assess(input: AssessmentInput): Promise<Assessment> {
  const rows: AssessmentRow[] = await Promise.all(
    Object.entries(input.article.attributes).map(async ([attribute, required]): Promise<AssessmentRow> => {
      const offered = input.product.attributes[attribute] ?? null
      if (offered === null) return { attribute, required, offered, status: 'MISSING' }
      if (required === null || normalize(required) === normalize(offered)) return { attribute, required, offered, status: 'MATCH' }
      if (input.exactAttributes?.includes(attribute)) return { attribute, required, offered, status: 'MISMATCH' }
      return { attribute, required, offered, ...(await judge(attribute, required, offered)) }
    }),
  )

  const has = (status: AttributeStatus) => rows.some((r) => r.status === status)
  const matches = rows.filter((r) => r.status === 'MATCH').length
  return {
    verdict: has('MISMATCH') ? 'NOT_EQUIVALENT' : has('MISSING') ? 'NEEDS_INFO' : 'EQUIVALENT',
    score: rows.length ? Math.round((matches / rows.length) * 100) : 0,
    rows,
    assessedAt: new Date().toISOString(),
  }
}

/**
 * Asks the LLM about a single attribute and validates the answer instead of trusting it.
 * Grounding: the model must quote both values first, and the quotes must match the input,
 * so a judgement based on a misread value (e.g. "both say IIa") is rejected.
 */
async function judge(
  attribute: string,
  required: string,
  offered: string,
): Promise<{ status: AttributeStatus; reasoning: LocalizedText }> {
  // Only the two values are sent, under the same names the answer must quote them with.
  const prompt = JSON.stringify({ attribute, hospitalValue: required, supplierValue: offered })
  const answer = (await completeJson(SYSTEM_PROMPT, prompt, JUDGEMENT_SCHEMA)) as Record<string, unknown> | null
  const reasoning = answer?.reasoning as Partial<LocalizedText> | undefined

  if (
    (answer?.status !== 'MATCH' && answer?.status !== 'MISMATCH') ||
    typeof reasoning?.en !== 'string' ||
    typeof reasoning.de !== 'string'
  ) {
    throw new Error(`LLM returned an invalid judgement for "${attribute}"`)
  }
  const quotes = { hospital: answer.hospitalValue, supplier: answer.supplierValue }
  if (!isQuoteOf(quotes.hospital, required) || !isQuoteOf(quotes.supplier, offered)) {
    throw new Error(
      `LLM misquoted the values for "${attribute}": got ${JSON.stringify(quotes)}, expected ${JSON.stringify({ hospital: required, supplier: offered })}`,
    )
  }
  return { status: answer.status, reasoning: { en: reasoning.en, de: reasoning.de } }
}

const isQuoteOf = (quote: unknown, value: string) => typeof quote === 'string' && normalize(quote) === normalize(value)
