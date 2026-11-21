import { useState, useCallback } from 'react'
import { message } from 'antd'
import type { ClarificationPacket, ClarificationMode } from '../types'
import { SAMPLE_CLARIFICATION_PACKET } from '../mock'

export interface UseClarificationWorkflowResult {
  packetMode: ClarificationMode
  setPacketMode: (mode: ClarificationMode) => void
  activePacket: ClarificationPacket
  isPacketSubmitting: boolean
  handleDispatchPacket: (packet: ClarificationPacket) => void
  handleSupplierPacketSubmit: (onSuccessCallback?: () => void) => void
}

export function useClarificationWorkflow(): UseClarificationWorkflowResult {
  const [packetMode, setPacketMode] = useState<ClarificationMode>('BUYER')
  const [activePacket, setActivePacket] = useState<ClarificationPacket>(SAMPLE_CLARIFICATION_PACKET)
  const [isPacketSubmitting, setIsPacketSubmitting] = useState(false)

  const handleDispatchPacket = useCallback((packet: ClarificationPacket) => {
    setActivePacket(packet)
    message.success(`Clarification packet dispatched to supplier (${packet.items.length} questions included)`)
    setPacketMode('SUPPLIER')
  }, [])

  const handleSupplierPacketSubmit = useCallback((onSuccessCallback?: () => void) => {
    setIsPacketSubmitting(true)
    setTimeout(() => {
      setIsPacketSubmitting(false)
      message.success('Supplier answers received! Triggered automated LLM re-evaluation webhook.')
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    }, 800)
  }, [])

  return {
    packetMode,
    setPacketMode,
    activePacket,
    isPacketSubmitting,
    handleDispatchPacket,
    handleSupplierPacketSubmit,
  }
}
