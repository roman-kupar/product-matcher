import React from 'react'
import { Timeline, Tag, Typography, Space, Empty, Card } from 'antd'
import {
  RobotOutlined,
  SendOutlined,
  FormOutlined,
  SyncOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { AuditLogEntry, AuditEventType, AuditActorRole } from '../types'

const { Text, Paragraph } = Typography

export interface EnrichmentAuditTimelineProps {
  events: AuditLogEntry[]
  highlightLatest?: boolean
  className?: string
  style?: React.CSSProperties
}

const EVENT_CONFIG: Record<
  AuditEventType,
  {
    label: string
    color: string
    icon: React.ReactNode
  }
> = {
  INITIAL_SCAN: {
    label: 'Initial LLM Scan',
    color: 'blue',
    icon: <RobotOutlined />,
  },
  QUESTIONS_SENT: {
    label: 'Questions Sent',
    color: 'orange',
    icon: <SendOutlined />,
  },
  SUPPLIER_ANSWERED: {
    label: 'Supplier Answered',
    color: 'green',
    icon: <FormOutlined />,
  },
  LLM_RE_EVALUATED: {
    label: 'LLM Re-evaluated',
    color: 'purple',
    icon: <SyncOutlined />,
  },
  MANUAL_OVERRIDE: {
    label: 'Manual Override',
    color: 'cyan',
    icon: <UserOutlined />,
  },
}

const ROLE_COLORS: Record<AuditActorRole, string> = {
  LLM: 'geekblue',
  SUPPLIER: 'green',
  BUYER: 'blue',
  SYSTEM: 'default',
}

export const EnrichmentAuditTimeline: React.FC<EnrichmentAuditTimelineProps> = ({
  events,
  highlightLatest = true,
  className,
  style,
}) => {
  if (!events || events.length === 0) {
    return <Empty description="No audit events recorded" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  const timelineItems = events.map((event, index) => {
    const isLatest = highlightLatest && index === events.length - 1
    const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.INITIAL_SCAN

    return {
      dot: (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: isLatest ? '#1677ff' : '#f0f0f0',
            color: isLatest ? '#fff' : '#595959',
            fontSize: 12,
            border: isLatest ? '2px solid #91caff' : '1px solid #d9d9d9',
          }}
        >
          {config.icon}
        </span>
      ),
      children: (
        <div
          style={{
            background: isLatest ? '#f6ffed' : '#ffffff',
            border: `1px solid ${isLatest ? '#b7eb8f' : '#f0f0f0'}`,
            borderRadius: 6,
            padding: '10px 14px',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
            <Space size={6} wrap align="center">
              <Text strong style={{ fontSize: 13 }}>
                {event.title}
              </Text>
              <Tag color={config.color} style={{ margin: 0, fontSize: 11 }}>
                {config.label}
              </Tag>
              {isLatest && (
                <Tag color="success" style={{ margin: 0, fontSize: 10, fontWeight: 600 }}>
                  Current State
                </Tag>
              )}
            </Space>

            <Space size={4} align="center">
              <ClockCircleOutlined style={{ fontSize: 11, color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {event.timestamp}
              </Text>
            </Space>
          </div>

          <div style={{ marginTop: 4 }}>
            <Space size={6} align="center">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Actor:
              </Text>
              <Text style={{ fontSize: 12, fontWeight: 500 }}>{event.actor.name}</Text>
              <Tag color={ROLE_COLORS[event.actor.role]} style={{ margin: 0, fontSize: 10 }}>
                {event.actor.role}
              </Tag>
            </Space>
          </div>

          {event.summary && (
            <Paragraph type="secondary" style={{ margin: '6px 0 0 0', fontSize: 12 }}>
              {event.summary}
            </Paragraph>
          )}

          {event.fieldChanges && event.fieldChanges.length > 0 && (
            <Card
              size="small"
              bordered
              style={{
                marginTop: 8,
                backgroundColor: isLatest ? '#ffffff' : '#fafafa',
                borderColor: isLatest ? '#d9f7be' : '#f0f0f0',
              }}
              styles={{ body: { padding: '6px 10px' } }}
            >
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                FIELD UPDATES:
              </Text>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                {event.fieldChanges.map((change, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Text code style={{ fontSize: 11 }}>
                      {change.field}
                    </Text>
                    {change.previousValue !== undefined && (
                      <>
                        <Text delete type="secondary" style={{ fontSize: 11 }}>
                          {change.previousValue || 'none'}
                        </Text>
                        <ArrowRightOutlined style={{ fontSize: 10, color: '#bfbfbf' }} />
                      </>
                    )}
                    <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                      {change.newValue}
                    </Tag>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {event.notes && (
            <Text italic type="secondary" style={{ display: 'block', marginTop: 6, fontSize: 11 }}>
              Note: {event.notes}
            </Text>
          )}
        </div>
      ),
    }
  })

  return (
    <div className={className} style={style}>
      <Timeline items={timelineItems} style={{ marginTop: 8 }} />
    </div>
  )
}

export default EnrichmentAuditTimeline
