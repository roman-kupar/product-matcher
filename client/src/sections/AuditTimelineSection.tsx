import React from 'react'
import { Card, Space, Tag, Typography } from 'antd'
import { EquivalenceBadge, EnrichmentAuditTimeline } from '../components'
import { SAMPLE_AUDIT_EVENTS } from '../mock'

const { Paragraph } = Typography

export const AuditTimelineSection: React.FC = () => (
  <Card
    title={
      <Space align="center">
        <span>Lifecycle Audit Trail (<EquivalenceBadge status="MATCHED" score={96} size="small" />)</span>
        <Tag color="green">4 Events Recorded</Tag>
      </Space>
    }
    size="small"
  >
    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
      Transparent timeline tracking every automated and human lifecycle stage (Initial LLM Scan → Questions Sent → Supplier Answered → LLM Re-evaluated), logging who changed which field and when.
    </Paragraph>
    <EnrichmentAuditTimeline events={SAMPLE_AUDIT_EVENTS} highlightLatest={true} />
  </Card>
)
