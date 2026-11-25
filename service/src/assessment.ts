import { completeJson } from './llm.ts'

export type AttributeStatus = 'MATCH' | 'MISMATCH' | 'MISSING'
export type Verdict = 'EQUIVALENT' | 'NEEDS_INFO' | 'NOT_EQUIVALENT'
export type LocalizedText = { en: string; de: string }

type Values = Record<string, string | null>

/** Hospital requirements and product values per attribute; the keys are the category's fixed attribute list. */
export interface AssessmentInput {
  article: { name: string; attributes: Values }
  product: { name: string; supplier: string; attributes: Values }
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
For each attribute, decide whether the supplier value is functionally equivalent to the hospital requirement.
Treat spelling variants, brand-specific names and equal values in other notation as MATCH (e.g. "Luer-Lok" = "Luer-Lock").
The manufacturer does not matter.
Return exactly one row per given attribute, with a short reasoning (under 20 words) in English and German.`

const text = { type: 'string' }

/** Output shape the model is constrained to. */
const JUDGEMENT_SCHEMA = {
  name: 'attribute_judgement',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['rows'],
    properties: {
      rows: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          // Reasoning comes before status, so the model decides after explaining.
          required: ['attribute', 'reasoning', 'status'],
          properties: {
            attribute: text,
            reasoning: {
              type: 'object',
              additionalProperties: false,
              required: ['en', 'de'],
              properties: { en: text, de: text },
            },
            status: { type: 'string', enum: ['MATCH', 'MISMATCH'] },
          },
        },
      },
    },
  },
}

const normalize = (value: string) => value.trim().toLowerCase()

/**
 * Clear cases are decided in code: no value -> MISSING, identical value -> MATCH.
 * Only attributes whose values differ are sent to the LLM for judgement.
 */
export async function assess(input: AssessmentInput): Promise<Assessment> {
  const toJudge: AssessmentRow[] = []
  const rows: AssessmentRow[] = Object.entries(input.article.attributes).map(([attribute, required]) => {
    const offered = input.product.attributes[attribute] ?? null
    if (offered === null) return { attribute, required, offered, status: 'MISSING' }
    const row: AssessmentRow = { attribute, required, offered, status: 'MATCH' }
    if (required !== null && normalize(required) !== normalize(offered)) toJudge.push(row)
    return row
  })

  if (toJudge.length > 0) {
    const prompt = JSON.stringify({
      hospitalArticle: input.article.name,
      supplierProduct: `${input.product.name} (${input.product.supplier})`,
      attributes: toJudge.map(({ attribute, required, offered }) => ({ attribute, required, offered })),
    })
    const judged = parseJudgement(await completeJson(SYSTEM_PROMPT, prompt, JUDGEMENT_SCHEMA))
    for (const row of toJudge) {
      const verdict = judged.get(row.attribute)
      if (!verdict) throw new Error(`LLM did not judge attribute "${row.attribute}"`)
      Object.assign(row, verdict)
    }
  }

  const has = (status: AttributeStatus) => rows.some((r) => r.status === status)
  const matches = rows.filter((r) => r.status === 'MATCH').length
  return {
    verdict: has('MISMATCH') ? 'NOT_EQUIVALENT' : has('MISSING') ? 'NEEDS_INFO' : 'EQUIVALENT',
    score: rows.length ? Math.round((matches / rows.length) * 100) : 0,
    rows,
    assessedAt: new Date().toISOString(),
  }
}

/** Validates the LLM answer instead of trusting it; anything malformed is rejected. */
function parseJudgement(answer: unknown): Map<string, { status: AttributeStatus; reasoning: LocalizedText }> {
  const rows = (answer as { rows?: unknown })?.rows
  if (!Array.isArray(rows)) throw new Error('LLM answer has no "rows" array')

  const result = new Map<string, { status: AttributeStatus; reasoning: LocalizedText }>()
  for (const row of rows as Record<string, unknown>[]) {
    const reasoning = row.reasoning as Partial<LocalizedText> | undefined
    if (
      typeof row.attribute === 'string' &&
      (row.status === 'MATCH' || row.status === 'MISMATCH') &&
      typeof reasoning?.en === 'string' &&
      typeof reasoning.de === 'string'
    ) {
      result.set(row.attribute, { status: row.status, reasoning: { en: reasoning.en, de: reasoning.de } })
    }
  }
  return result
}
