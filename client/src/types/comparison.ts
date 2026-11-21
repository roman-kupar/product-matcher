export type MatchStatus =
  | 'EXACT_MATCH'
  | 'MISSING_DATA'
  | 'SOFT_MISMATCH'
  | 'CLINICAL_CONFLICT'

export type AttributeDataType =
  | 'BOOLEAN'
  | 'NUMBER_WITH_UNIT'
  | 'ENUM'
  | 'STRING'

export type EnrichmentSource = 'CATALOG' | 'SUPPLIER_RESPONSE'

export interface AttributeComparisonRow {
  key: string
  label: string
  dataType: AttributeDataType
  unit?: string
  enumOptions?: string[]
  hospitalValue: string | number | boolean | null
  supplierValue: string | number | boolean | null
  previousSupplierValue?: string | number | boolean | null
  status: MatchStatus
  isClinicalDealbreaker: boolean
  llmNote?: string
  enrichmentSource?: EnrichmentSource
  // Compatibility aliases
  matchStatus?: MatchStatus
  isCritical?: boolean
  llmReasoning?: string
  updatedBySupplier?: boolean
}
