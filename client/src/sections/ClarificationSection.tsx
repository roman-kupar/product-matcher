import React from 'react'
import { Card, Space, Tag, Typography, Segmented } from 'antd'
import { ClarificationPacketBuilder } from '../components'
import type { ClarificationPacket, ClarificationMode } from '../types'

const { Text } = Typography

interface ClarificationSectionProps {
  mode: ClarificationMode
  onModeChange: (mode: ClarificationMode) => void
  activePacket: ClarificationPacket
  isSubmitting: boolean
  onDispatch: (packet: ClarificationPacket) => void
  onSubmit: () => void
}

export const ClarificationSection: React.FC<ClarificationSectionProps> = ({
  mode,
  onModeChange,
  activePacket,
  isSubmitting,
  onDispatch,
  onSubmit,
}) => (
  <Card
    size="small"
    title={
      <Space align="center">
        <span>Clarification Packet Workflow</span>
        <Tag color={mode === 'BUYER' ? 'blue' : 'green'}>
          Mode: {mode === 'BUYER' ? 'Mode A (Buyer Builder)' : 'Mode B (Supplier Form)'}
        </Tag>
      </Space>
    }
    extra={
      <Space align="center">
        <Text type="secondary" style={{ fontSize: 12 }}>Workflow Role:</Text>
        <Segmented
          size="small"
          value={mode}
          onChange={(val) => onModeChange(val as ClarificationMode)}
          options={[
            { label: 'Buyer: Review & Send', value: 'BUYER' },
            { label: 'Supplier: Answer & Submit', value: 'SUPPLIER' },
          ]}
        />
      </Space>
    }
  >
    <ClarificationPacketBuilder
      mode={mode}
      initialPacket={activePacket}
      onDispatch={onDispatch}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  </Card>
)
