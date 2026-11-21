import React from 'react'
import { Card, Space, Tag, Typography, Switch } from 'antd'
import { TableOutlined } from '@ant-design/icons'
import { AttributeDiffTable } from '../components'
import type { AttributeComparisonRow } from '../types'
import { SAMPLE_ATTRIBUTE_COMPARISON } from '../mock'

const { Text, Paragraph } = Typography

interface AttributeDiffSectionProps {
  isReadOnly: boolean
  onReadOnlyChange: (checked: boolean) => void
  onSelectMissing: (attr: AttributeComparisonRow) => void
}

export const AttributeDiffSection: React.FC<AttributeDiffSectionProps> = ({
  isReadOnly,
  onReadOnlyChange,
  onSelectMissing,
}) => (
  <Card
    title={
      <Space align="center">
        <TableOutlined />
        <span>Attribute Diff & Clinical Specification Grid</span>
        <Tag color="geekblue">5 Attributes Evaluated</Tag>
      </Space>
    }
    extra={
      <Space align="center">
        <Text type="secondary" style={{ fontSize: 12 }}>Supplier Read-Only Mode:</Text>
        <Switch size="small" checked={isReadOnly} onChange={onReadOnlyChange} />
      </Space>
    }
    size="small"
  >
    <Paragraph type="secondary" style={{ marginBottom: 14 }}>
      Row-by-row alignment between hospital requirements and supplier catalog attributes, color-coding match states (Exact Match, Missing Data, Soft Mismatch, Clinical Conflict) with clinical dealbreaker indicators.
    </Paragraph>
    <AttributeDiffTable
      attributes={SAMPLE_ATTRIBUTE_COMPARISON}
      readOnly={isReadOnly}
      onSelectMissing={onSelectMissing}
    />
  </Card>
)
