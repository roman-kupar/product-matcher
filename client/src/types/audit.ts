export type AuditActorRole = 'LLM' | 'BUYER' | 'SUPPLIER' | 'SYSTEM'

export type AuditEventType =
  | 'INITIAL_SCAN'
  | 'QUESTIONS_SENT'
  | 'SUPPLIER_ANSWERED'
  | 'LLM_RE_EVALUATED'
  | 'MANUAL_OVERRIDE'

export interface FieldChange {
  field: string
  previousValue?: string
  newValue: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  type: AuditEventType
  title: string
  actor: {
    name: string
    role: AuditActorRole
  }
  summary?: string
  fieldChanges?: FieldChange[]
  notes?: string
}
