import type { AttributeSchema, DynamicInputValue } from './input'

export type ClarificationMode = 'BUYER' | 'SUPPLIER'

export interface ClarificationItem {
  id: string
  attributeKey: string
  schema: AttributeSchema
  llmGeneratedQuestion: string
  customQuestion?: string
  isDealbreaker: boolean
  selected?: boolean
  answerValue?: DynamicInputValue
  supplierNotes?: string
}

export interface ClarificationPacket {
  id: string
  comparisonId?: string
  buyerNotes?: string
  items: ClarificationItem[]
  status?: 'DRAFT' | 'DISPATCHED' | 'ANSWERED' | 'EVALUATED'
  createdAt?: string
}
