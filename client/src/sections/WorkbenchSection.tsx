import React from 'react'
import { Space, Tag, Typography, Divider, Row, Col, Button } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import {
  EquivalenceBadge,
  ArticleSummaryCard,
  DeltaHighlightWrapper,
  MasterDetailTriageLayout,
} from '../components'
import type { TriageItem, StatusTabConfig } from '../types'
import { SAMPLE_HOSPITAL_ARTICLE, SAMPLE_SUPPLIER_ARTICLE, STATUS_TABS } from '../mock'

const { Title, Text } = Typography

interface WorkbenchSectionProps {
  items: TriageItem[]
  selectedId: string
  onSelect: (id: string) => void
  onSimulateEnrichment: () => void
}

export const WorkbenchSection: React.FC<WorkbenchSectionProps> = ({
  items,
  selectedId,
  onSelect,
  onSimulateEnrichment,
}) => (
  <MasterDetailTriageLayout
    title={
      <Space align="center">
        <span>Hospital Purchaser Workbench</span>
        <Tag color="blue">{items.length} Total Enriched Items</Tag>
      </Space>
    }
    extraHeader={
      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={onSimulateEnrichment}
        size="small"
      >
        Simulate Spec Enrichment
      </Button>
    }
    items={items}
    selectedId={selectedId}
    onSelect={(id) => onSelect(String(id))}
    statusTabs={STATUS_TABS as StatusTabConfig<TriageItem>[]}
    renderListItem={(item: TriageItem) => (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text code style={{ fontSize: 11 }}>{item.articleId}</Text>
          <EquivalenceBadge status={item.status} score={item.score} deltaScore={item.deltaScore} size="small" />
        </div>
        <Text strong style={{ fontSize: 12, display: 'block' }} ellipsis={{ tooltip: item.buyerArticle }}>
          {item.buyerArticle}
        </Text>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }} ellipsis={{ tooltip: item.supplierArticle }}>
          Candidate: {item.supplierArticle}
        </Text>
      </div>
    )}
    renderDetailPane={(item: TriageItem | null) =>
      item ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>INSPECTION WORKSPACE • {item.articleId}</Text>
              <Title level={4} style={{ margin: '2px 0 0 0' }}>{item.buyerArticle}</Title>
            </div>
            <DeltaHighlightWrapper
              isUpdated={item.status === 'RE_EVALUATED'}
              inline={true}
              label="Newly Enriched"
              previousValue="62%"
            >
              <EquivalenceBadge status={item.status} score={item.score} deltaScore={item.deltaScore} size="middle" />
            </DeltaHighlightWrapper>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <ArticleSummaryCard
                article={SAMPLE_HOSPITAL_ARTICLE}
                sourceType="HOSPITAL"
                extra={<Tag color="blue">Hospital Internal</Tag>}
              />
            </Col>
            <Col xs={24} md={12}>
              <ArticleSummaryCard
                article={SAMPLE_SUPPLIER_ARTICLE}
                sourceType="SUPPLIER"
                extra={<Tag color="purple">Supplier Catalog</Tag>}
              />
            </Col>
          </Row>
        </Space>
      ) : null
    }
  />
)
