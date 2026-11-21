import React from 'react'
import { Card, Space, Row, Col, Tag } from 'antd'
import { EquivalenceBadge, ArticleSummaryCard } from '../components'
import { SAMPLE_HOSPITAL_ARTICLE, SAMPLE_SUPPLIER_ARTICLE } from '../mock'

export const ComparisonSection: React.FC = () => (
  <Card
    title={
      <Space align="center">
        <span>Buyer Comparison View (Side-by-Side Header)</span>
        <EquivalenceBadge status="MATCHED" score={96} deltaScore={18} size="small" />
      </Space>
    }
    size="small"
  >
    <Row gutter={[16, 16]} align="stretch">
      <Col xs={24} md={12}>
        <ArticleSummaryCard
          article={SAMPLE_HOSPITAL_ARTICLE}
          sourceType="HOSPITAL"
          extra={<Tag color="blue">Internal Master</Tag>}
        />
      </Col>
      <Col xs={24} md={12}>
        <ArticleSummaryCard
          article={SAMPLE_SUPPLIER_ARTICLE}
          sourceType="SUPPLIER"
          extra={<Tag color="purple">Suggested Match</Tag>}
        />
      </Col>
    </Row>
  </Card>
)
