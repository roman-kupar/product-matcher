import React from 'react'
import { Table, Tag, Typography, Button, Space, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  AlertOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { DeltaHighlightWrapper } from './DeltaHighlightWrapper'
import type { AttributeComparisonRow, MatchStatus } from '../types'

const { Text, Paragraph } = Typography

export interface AttributeDiffTableProps {
  attributes: AttributeComparisonRow[]
  onSelectMissing?: (attribute: AttributeComparisonRow) => void
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
}

const STATUS_CONFIG: Record<
  MatchStatus,
  {
    label: string
    color: string
    icon: React.ReactNode
    rowBg?: string
  }
> = {
  EXACT_MATCH: {
    label: 'Exact Match',
    color: 'success',
    icon: <CheckCircleOutlined />,
    rowBg: '#f6ffed',
  },
  MISSING_DATA: {
    label: 'Missing Data',
    color: 'warning',
    icon: <QuestionCircleOutlined />,
    rowBg: '#fffbe6',
  },
  SOFT_MISMATCH: {
    label: 'Soft Mismatch',
    color: 'processing',
    icon: <InfoCircleOutlined />,
    rowBg: '#e6f4ff',
  },
  CLINICAL_CONFLICT: {
    label: 'Clinical Conflict',
    color: 'error',
    icon: <CloseCircleOutlined />,
    rowBg: '#fff1f0',
  },
}

function formatValue(value: string | number | boolean | null | undefined, unit?: string): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <Text type="secondary" italic>Missing</Text>
  }
  if (typeof value === 'boolean') {
    return value ? <Tag color="blue">Yes</Tag> : <Tag color="default">No</Tag>
  }
  if (unit) {
    return <Text>{value} <Text type="secondary" style={{ fontSize: 11 }}>{unit}</Text></Text>
  }
  return <Text>{String(value)}</Text>
}

export const AttributeDiffTable: React.FC<AttributeDiffTableProps> = ({
  attributes,
  onSelectMissing,
  readOnly = false,
  className,
  style,
}) => {
  const columns: ColumnsType<AttributeComparisonRow> = [
    {
      title: 'Attribute Specification',
      key: 'attribute',
      width: 220,
      render: (_, record) => {
        const isCritical = record.isClinicalDealbreaker || record.isCritical
        return (
          <Space direction="vertical" size={2}>
            <Space align="center" size={6} wrap>
              <Text strong style={{ fontSize: 13 }}>{record.label}</Text>
              {isCritical && (
                <Tooltip title="Clinical Dealbreaker: Any discrepancy disqualifies the match">
                  <Tag color="red" icon={<AlertOutlined />} style={{ margin: 0, fontSize: 10 }}>
                    Dealbreaker
                  </Tag>
                </Tooltip>
              )}
            </Space>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Key: <Text code style={{ fontSize: 11 }}>{record.key}</Text>
            </Text>
          </Space>
        )
      },
    },
    {
      title: 'Hospital Requirement',
      key: 'hospitalValue',
      width: 200,
      render: (_, record) => (
        <div style={{ background: '#f5f5f5', padding: '6px 10px', borderRadius: 4, display: 'inline-block', minWidth: 120 }}>
          {formatValue(record.hospitalValue, record.unit)}
        </div>
      ),
    },
    {
      title: 'Supplier Candidate Spec',
      key: 'supplierValue',
      width: 260,
      render: (_, record) => {
        const hasUpdate =
          record.previousSupplierValue !== undefined &&
          record.previousSupplierValue !== null &&
          record.previousSupplierValue !== record.supplierValue

        const isNewlyEnriched = Boolean(record.updatedBySupplier || hasUpdate)

        const innerContent = (
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', padding: '6px 10px', borderRadius: 4, display: 'inline-block', minWidth: 140 }}>
            {hasUpdate ? (
              <Space align="center" size={6} wrap>
                <Text delete type="secondary" style={{ fontSize: 11 }}>
                  {formatValue(record.previousSupplierValue, record.unit)}
                </Text>
                <ArrowRightOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
                <span style={{ fontWeight: 600 }}>{formatValue(record.supplierValue, record.unit)}</span>
              </Space>
            ) : (
              formatValue(record.supplierValue, record.unit)
            )}
          </div>
        )

        return (
          <DeltaHighlightWrapper
            isUpdated={isNewlyEnriched}
            previousValue={record.previousSupplierValue ? String(record.previousSupplierValue) : undefined}
            label="Newly Enriched"
          >
            {innerContent}
          </DeltaHighlightWrapper>
        )
      },
    },
    {
      title: 'Match Assessment & LLM Reasoning',
      key: 'assessment',
      render: (_, record) => {
        const status = record.status || record.matchStatus || 'MISSING_DATA'
        const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.MISSING_DATA
        const note = record.llmNote || record.llmReasoning

        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Tag color={config.color} icon={config.icon} style={{ margin: 0, fontWeight: 500, fontSize: 11 }}>
              {config.label}
            </Tag>
            {note && (
              <Paragraph
                type="secondary"
                style={{
                  margin: 0,
                  fontSize: 11,
                  lineHeight: '16px',
                  background: 'rgba(0,0,0,0.02)',
                  padding: '4px 6px',
                  borderRadius: 4,
                }}
              >
                <RobotOutlined style={{ marginRight: 4, color: '#1677ff' }} />
                {note}
              </Paragraph>
            )}
          </Space>
        )
      },
    },
    ...(!readOnly && onSelectMissing
      ? [
          {
            title: 'Action',
            key: 'action',
            width: 130,
            render: (_: unknown, record: AttributeComparisonRow) => {
              const status = record.status || record.matchStatus
              if (status === 'MISSING_DATA') {
                return (
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<QuestionCircleOutlined />}
                    onClick={() => onSelectMissing(record)}
                  >
                    Request Info
                  </Button>
                )
              }
              if (status === 'SOFT_MISMATCH' || status === 'CLINICAL_CONFLICT') {
                return (
                  <Button
                    size="small"
                    icon={<ThunderboltOutlined />}
                    onClick={() => onSelectMissing(record)}
                  >
                    Clarify
                  </Button>
                )
              }
              return <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
            },
          },
        ]
      : []),
  ]

  return (
    <div className={className} style={style}>
      <Table
        columns={columns}
        dataSource={attributes}
        rowKey="key"
        pagination={false}
        size="small"
        bordered
        rowClassName={(record) => {
          const status = record.status || record.matchStatus
          if (status === 'CLINICAL_CONFLICT') return 'conflict-row'
          if (status === 'MISSING_DATA') return 'missing-row'
          return ''
        }}
      />
    </div>
  )
}

export default AttributeDiffTable
