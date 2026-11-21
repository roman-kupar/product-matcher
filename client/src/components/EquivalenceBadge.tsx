import React from 'react'
import { Tag, Space, Tooltip } from 'antd'
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'

export type EquivalenceStatus =
  | 'MATCHED'
  | 'NEEDS_INFO'
  | 'CONFLICT'
  | 'AWAITING_SUPPLIER'
  | 'RE_EVALUATED'

export interface EquivalenceBadgeProps {
  status: EquivalenceStatus
  score?: number
  deltaScore?: number
  size?: 'small' | 'middle'
  showTooltip?: boolean
  className?: string
  style?: React.CSSProperties
}

const STATUS_CONFIG: Record<
  EquivalenceStatus,
  {
    label: string
    color: string
    icon: React.ReactNode
    description: string
  }
> = {
  MATCHED: {
    label: 'Matched',
    color: 'success',
    icon: <CheckCircleOutlined />,
    description: 'High confidence match confirmed between items',
  },
  NEEDS_INFO: {
    label: 'Needs Info',
    color: 'warning',
    icon: <QuestionCircleOutlined />,
    description: 'Missing attributes or clarification needed to verify match',
  },
  CONFLICT: {
    label: 'Conflict',
    color: 'error',
    icon: <CloseCircleOutlined />,
    description: 'Contradictory or incompatible specifications found',
  },
  AWAITING_SUPPLIER: {
    label: 'Awaiting Supplier',
    color: 'processing',
    icon: <ClockCircleOutlined />,
    description: 'Pending additional data or confirmation from supplier',
  },
  RE_EVALUATED: {
    label: 'Re-evaluated',
    color: 'purple',
    icon: <SyncOutlined />,
    description: 'Match score recalculated after article enrichment',
  },
}

function formatScore(score: number): string {
  if (score > 0 && score <= 1) {
    return `${Math.round(score * 100)}%`
  }
  return `${Math.round(score)}%`
}

export const EquivalenceBadge: React.FC<EquivalenceBadgeProps> = ({
  status,
  score,
  deltaScore,
  size = 'middle',
  showTooltip = true,
  className,
  style,
}) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.NEEDS_INFO
  const isSmall = size === 'small'

  const badgeContent = (
    <Space orientation="horizontal" size={4} align="center" className={className} style={{ display: 'inline-flex', ...style }}>
      <Tag
        color={config.color}
        icon={config.icon}
        style={{
          margin: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontWeight: 500,
          fontSize: isSmall ? 11 : 12,
          padding: isSmall ? '0 6px' : '2px 8px',
          borderRadius: 4,
        }}
      >
        <span>{config.label}</span>
        {score !== undefined && (
          <span
            style={{
              fontWeight: 700,
              paddingLeft: 4,
              borderLeft: '1px solid currentColor',
              opacity: 0.9,
            }}
          >
            {formatScore(score)}
          </span>
        )}
      </Tag>

      {deltaScore !== undefined && deltaScore !== 0 && (
        <Tag
          bordered={false}
          style={{
            margin: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontWeight: 600,
            fontSize: isSmall ? 10 : 11,
            padding: isSmall ? '0 4px' : '1px 6px',
            borderRadius: 4,
            backgroundColor: deltaScore > 0 ? '#f6ffed' : '#fff1f0',
            color: deltaScore > 0 ? '#389e0d' : '#cf1322',
            border: `1px solid ${deltaScore > 0 ? '#b7eb8f' : '#ffa39e'}`,
          }}
        >
          {deltaScore > 0 ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
          <span>{deltaScore > 0 ? `+${deltaScore}%` : `${deltaScore}%`}</span>
        </Tag>
      )}
    </Space>
  )

  if (!showTooltip) {
    return badgeContent
  }

  const tooltipText = (
    <div>
      <div>{config.description}</div>
      {score !== undefined && (
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
          Match confidence: {formatScore(score)}
          {deltaScore !== undefined && ` (${deltaScore > 0 ? `+${deltaScore}%` : `${deltaScore}%`} delta)`}
        </div>
      )}
    </div>
  )

  return <Tooltip title={tooltipText}>{badgeContent}</Tooltip>
}

export default EquivalenceBadge
