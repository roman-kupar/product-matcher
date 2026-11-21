import React from 'react'
import { Card, Tag, Typography, Space, Row, Col } from 'antd'
import {
  MedicineBoxOutlined,
  ShopOutlined,
  BarcodeOutlined,
  InboxOutlined,
  BuildOutlined,
  NumberOutlined,
} from '@ant-design/icons'
import type { NormalizedArticle, ArticleSourceType } from '../types'

const { Text, Title } = Typography

export interface ArticleSummaryCardProps {
  article: NormalizedArticle
  sourceType: ArticleSourceType
  compact?: boolean
  extra?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const SOURCE_CONFIG = {
  HOSPITAL: {
    label: 'Hospital Internal',
    color: 'blue',
    icon: <MedicineBoxOutlined />,
    badgeBorder: '#91caff',
    bg: '#f0f7ff',
  },
  SUPPLIER: {
    label: 'Supplier Catalog',
    color: 'purple',
    icon: <ShopOutlined />,
    badgeBorder: '#d3adf7',
    bg: '#f9f0ff',
  },
}

export const ArticleSummaryCard: React.FC<ArticleSummaryCardProps> = ({
  article,
  sourceType,
  compact = false,
  extra,
  className,
  style,
}) => {
  const config = SOURCE_CONFIG[sourceType]

  if (compact) {
    return (
      <Card
        size="small"
        className={className}
        style={{
          borderLeft: `4px solid ${config.color === 'blue' ? '#1677ff' : '#722ed1'}`,
          ...style,
        }}
        styles={{ body: { padding: '10px 14px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Space size={6} wrap style={{ marginBottom: 4 }}>
              <Tag color={config.color} icon={config.icon} style={{ margin: 0, fontSize: 11 }}>
                {config.label}
              </Tag>
              {article.sku && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  SKU: <Text code style={{ fontSize: 11 }}>{article.sku}</Text>
                </Text>
              )}
            </Space>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: '18px' }}>
              <Text ellipsis={{ tooltip: article.title }}>{article.title}</Text>
            </div>
            <Space size={12} wrap style={{ marginTop: 4, fontSize: 11 }}>
              {article.manufacturer && (
                <Text type="secondary">
                  <BuildOutlined style={{ marginRight: 3 }} />
                  {article.manufacturer}
                </Text>
              )}
              {article.packagingUnit && (
                <Text type="secondary">
                  <InboxOutlined style={{ marginRight: 3 }} />
                  {article.packagingUnit}
                </Text>
              )}
            </Space>
          </div>
          {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
        </div>
      </Card>
    )
  }

  return (
    <Card
      size="small"
      className={className}
      style={{
        borderTop: `3px solid ${config.color === 'blue' ? '#1677ff' : '#722ed1'}`,
        height: '100%',
        ...style,
      }}
      styles={{ body: { padding: '14px 16px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Tag color={config.color} icon={config.icon} style={{ margin: 0, fontWeight: 500 }}>
          {config.label}
        </Tag>
        {extra && <div>{extra}</div>}
      </div>

      <Title level={5} style={{ margin: '0 0 12px 0', fontSize: 14, lineHeight: '20px' }}>
        {article.title}
      </Title>

      <Row gutter={[12, 10]} style={{ fontSize: 12 }}>
        <Col span={12}>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>
            <NumberOutlined style={{ marginRight: 4 }} />
            SKU
          </Text>
          <Text code style={{ fontSize: 12 }}>
            {article.sku ?? '—'}
          </Text>
        </Col>

        <Col span={12}>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>
            <BarcodeOutlined style={{ marginRight: 4 }} />
            GTIN / EAN
          </Text>
          <Text code style={{ fontSize: 12 }}>
            {article.gtin ?? '—'}
          </Text>
        </Col>

        <Col span={12}>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>
            <BuildOutlined style={{ marginRight: 4 }} />
            Manufacturer
          </Text>
          <Text strong style={{ fontSize: 12 }}>
            {article.manufacturer ?? '—'}
          </Text>
        </Col>

        <Col span={12}>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>
            <InboxOutlined style={{ marginRight: 4 }} />
            Packaging Unit
          </Text>
          <Text style={{ fontSize: 12 }}>
            {article.packagingUnit ?? '—'}
          </Text>
        </Col>
      </Row>
    </Card>
  )
}

export default ArticleSummaryCard
