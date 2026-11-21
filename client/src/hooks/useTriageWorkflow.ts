import { useState, useCallback } from 'react'
import { message } from 'antd'
import type { TriageItem, AttributeComparisonRow } from '../types'
import { INITIAL_TRIAGE_DATA } from '../mock'

export interface UseTriageWorkflowResult {
  items: TriageItem[]
  selectedId: string
  setSelectedId: (id: string) => void
  selectedItem: TriageItem | null
  simulateEnrichment: () => void
  handleSelectMissing: (attr: AttributeComparisonRow) => void
  updateItemStatus: (id: string, updates: Partial<TriageItem>) => void
}

export function useTriageWorkflow(): UseTriageWorkflowResult {
  const [items, setItems] = useState<TriageItem[]>(INITIAL_TRIAGE_DATA)
  const [selectedId, setSelectedId] = useState<string>('1')

  const selectedItem = items.find((item) => item.id === selectedId) ?? null

  const handleSelectMissing = useCallback((attr: AttributeComparisonRow) => {
    message.info(`Dispatched inquiry to supplier for attribute: ${attr.label}`)
  }, [])

  const updateItemStatus = useCallback((id: string, updates: Partial<TriageItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }, [])

  const simulateEnrichment = useCallback(() => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key === '3') {
          return {
            ...item,
            status: 'RE_EVALUATED',
            score: 91,
            deltaScore: 29,
          }
        }
        return item
      }),
    )
    message.success('Simulated LLM closed-loop spec enrichment for ART-7712')
  }, [])

  return {
    items,
    selectedId,
    setSelectedId,
    selectedItem,
    simulateEnrichment,
    handleSelectMissing,
    updateItemStatus,
  }
}
