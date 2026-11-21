import React, { useState } from 'react'
import { Card, Space, Typography, Table, Tag, Row, Col, Divider, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ThunderboltOutlined } from '@ant-design/icons'
import { EquivalenceBadge, type EquivalenceStatus } from './components'

const { Title, Text, Paragraph } = Typography

interface TriageItem {
  key: string
  articleId: string
  buyerArticle: string
  supplierArticle: string
  status: EquivalenceStatus
  score: number
  deltaScore?: number
}

const INITIAL_TRIAGE_DATA: TriageItem[] = [
  {
    key: '1',
    articleId: 'ART-9041',
    buyerArticle: 'Industrial Hex Bolt M8x40 (Steel 8.8)',
    supplierArticle: 'Hex Head Screw DIN 933 M8x40 8.8 Galvanized',
    status: 'MATCHED',
    score: 96,
    deltaScore: 18,
  },
  {
    key: '2',
    articleId: 'ART-8820',
    buyerArticle: 'Hydraulic Seal Ring 25x35x7 NBR',
    supplierArticle: 'Radial Shaft Seal 25-35-7 NBR Standard',
    status: 'RE_EVALUATED',
    score: 84,
    deltaScore: 12,
  },
  {
    key: '3',
    articleId: 'ART-7712',
    buyerArticle: 'LED Indicator 24V Green IP67',
    supplierArticle: 'Pilot Lamp 24V Green IP65',
    status: 'NEEDS_INFO',
    score: 62,
  },
  {
    key: '4',
    articleId: 'ART-6540',
    buyerArticle: 'Circuit Breaker 16A Type C 3-Pole',
    supplierArticle: 'MCB 16A 3P Curve B 6kA',
    status: 'CONFLICT',
    score: 41,
    deltaScore: -14,
  },
  {
    key: '5',
    articleId: 'ART-5401',
    buyerArticle: 'Ball Bearing 6204 2RS C3',
    supplierArticle: 'Deep Groove Ball Bearing 6204-ZZ',
    status: 'AWAITING_SUPPLIER',
    score: 71,
  },
]

const App: React.FC = () => {
  const [data, setData] = useState<TriageItem[]>(INITIAL_TRIAGE_DATA)
  const [selectedKey, setSelectedKey] = useState<string>('1')

  const selectedItem = data.find((item) => item.key === selectedKey) ?? data[0]

  const columns: ColumnsType<TriageItem> = [
    {
      title: 'Article ID',
      dataIndex: 'articleId',
      key: 'articleId',
      width: 110,
      render: (val: string) => <Text code>{val}</Text>,
    },
    {
      title: 'Buyer Specification',
      dataIndex: 'buyerArticle',
      key: 'buyerArticle',
    },
    {
      title: 'Supplier Candidate',
      dataIndex: 'supplierArticle',
      key: 'supplierArticle',
    },
    {
      title: 'Equivalence State',
      key: 'status',
      width: 220,
      render: (_, record) => (
        <EquivalenceBadge
          status={record.status}
          score={record.score}
          deltaScore={record.deltaScore}
          size="small"
        />
      ),
    },
  ]

  const simulateEnrichment = () => {
    setData((prev) =>
      prev.map((item) => {
        if (item.key === '3') {
          return {
            ...item,
            status: 'RE_EVALUATED',
            score: 91,
            deltaScore: 29,
          }
        }
        return item
      }),
    )
  }

  return (
    <div style={{ maxWidth: 1180, margin: '32px auto', padding: '0 24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <header>
          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Article Enricher Triage
              </Title>
              <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                Automated matching & spec enrichment verification
              </Paragraph>
            </div>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={simulateEnrichment}
            >
              Simulate Spec Enrichment
            </Button>
          </Space>
        </header>

        {/* Status Palette Showcase */}
        <Card title="<EquivalenceBadge /> States & Variations" size="small">
          <Space orientation="horizontal" size={[12, 12]} wrap>
            <EquivalenceBadge status="MATCHED" score={96} deltaScore={18} />
            <EquivalenceBadge status="RE_EVALUATED" score={85} deltaScore={12} />
            <EquivalenceBadge status="NEEDS_INFO" score={62} />
            <EquivalenceBadge status="AWAITING_SUPPLIER" score={70} />
            <EquivalenceBadge status="CONFLICT" score={41} deltaScore={-14} />
          </Space>
        </Card>

        {/* Split View: Buyer Triage List + Detail Panel Header */}
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={15}>
            <Card
              title="Buyer Triage List Rows"
              size="small"
              extra={<Tag color="blue">{data.length} Items</Tag>}
            >
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                size="small"
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: [selectedKey],
                  onChange: (keys) => {
                    if (keys[0]) setSelectedKey(String(keys[0]))
                  },
                }}
              />
            </Card>
          </Col>

          {/* Detail Panel Header Showcase */}
          <Col xs={24} lg={9}>
            <Card title="Detail Panel Header Preview" size="small">
              {selectedItem && (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Detail Panel Header
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Title level={4} style={{ margin: 0 }}>
                        {selectedItem.buyerArticle}
                      </Title>
                    </div>
                  </div>

                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, border: '1px solid #f0f0f0' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                      Active Equivalence State
                    </Text>
                    <EquivalenceBadge
                      status={selectedItem.status}
                      score={selectedItem.score}
                      deltaScore={selectedItem.deltaScore}
                      size="middle"
                    />
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 13 }}>Candidate Spec:</Text>
                    <Paragraph type="secondary" style={{ marginTop: 4 }}>
                      {selectedItem.supplierArticle}
                    </Paragraph>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Supplier Task Queue Summary Badge
                    </Text>
                    <div style={{ marginTop: 6 }}>
                      <EquivalenceBadge
                        status={selectedItem.status}
                        score={selectedItem.score}
                        size="small"
                      />
                    </div>
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  )
}

export default App
