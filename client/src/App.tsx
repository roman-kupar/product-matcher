import React, { useState } from 'react'
import { Card, Space, Typography, Table, Tag, Row, Col, Divider, Button, message, Switch } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ThunderboltOutlined, SwapOutlined, TableOutlined } from '@ant-design/icons'
import {
  EquivalenceBadge,
  ArticleSummaryCard,
  EnrichmentAuditTimeline,
  AttributeDiffTable,
  type EquivalenceStatus,
} from './components'
import type { NormalizedArticle, AuditLogEntry, AttributeComparisonRow } from './types'

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

const SAMPLE_HOSPITAL_ARTICLE: NormalizedArticle = {
  id: 'HOSP-10042',
  title: 'Surgical Gloves Powder-Free Sterile Size 7.5 Latex',
  sku: 'SG-75-LAT-PF',
  gtin: '04012345678901',
  manufacturer: 'Hartmann MedTech AG',
  packagingUnit: 'Box of 50 pairs',
}

const SAMPLE_SUPPLIER_ARTICLE: NormalizedArticle = {
  id: 'SUPP-9921',
  title: 'Peha-soft Powder-Free Surgical Latex Gloves Sz 7.5',
  sku: '942204-PF',
  gtin: '04012345678901',
  manufacturer: 'Hartmann MedTech AG',
  packagingUnit: 'Box of 50 pairs (dispenser carton)',
}

const SAMPLE_AUDIT_EVENTS: AuditLogEntry[] = [
  {
    id: 'evt-1',
    timestamp: '2026-11-20 09:14',
    type: 'INITIAL_SCAN',
    title: 'Initial LLM Extraction & Matching',
    actor: { name: 'Gemini Pipeline v2.4', role: 'LLM' },
    summary: 'Catalog cross-reference completed. Candidate match identified with score 62% (status: NEEDS_INFO due to missing sterility standard).',
    fieldChanges: [
      { field: 'Equivalence Score', newValue: '62%' },
      { field: 'Equivalence Status', newValue: 'NEEDS_INFO' },
    ],
  },
  {
    id: 'evt-2',
    timestamp: '2026-11-20 11:30',
    type: 'QUESTIONS_SENT',
    title: 'Clarification Questionnaire Dispatched',
    actor: { name: 'Sarah L. (Procurement Lead)', role: 'BUYER' },
    summary: 'Automated questionnaire sent to supplier requesting EN 455 sterile certification and exact carton packaging units.',
  },
  {
    id: 'evt-3',
    timestamp: '2026-11-21 08:45',
    type: 'SUPPLIER_ANSWERED',
    title: 'Supplier Specification Submission',
    actor: { name: 'Hartmann MedTech Rep (Klaus V.)', role: 'SUPPLIER' },
    summary: 'Supplier confirmed sterile gamma radiation certification and updated packaging hierarchy.',
    fieldChanges: [
      { field: 'Packaging Unit', previousValue: 'Box of 50', newValue: 'Box of 50 pairs (dispenser carton)' },
      { field: 'Sterility Standard', previousValue: 'Unspecified', newValue: 'EN 455-1/-2 Sterile Gamma' },
    ],
  },
  {
    id: 'evt-4',
    timestamp: '2026-11-21 08:46',
    type: 'LLM_RE_EVALUATED',
    title: 'Automated Re-evaluation & Verification',
    actor: { name: 'Gemini Pipeline v2.4', role: 'LLM' },
    summary: 'Extracted attributes verified against hospital master spec. Match confidence escalated to 96% with full equivalence verified.',
    fieldChanges: [
      { field: 'Equivalence Score', previousValue: '62%', newValue: '96%' },
      { field: 'Score Delta', newValue: '+34%' },
      { field: 'Equivalence Status', previousValue: 'NEEDS_INFO', newValue: 'MATCHED' },
    ],
    notes: 'All mandatory hospital clinical requirements satisfied.',
  },
]

const SAMPLE_ATTRIBUTE_COMPARISON: AttributeComparisonRow[] = [
  {
    key: 'size_nominal',
    label: 'Glove Size (Nominal)',
    dataType: 'STRING',
    hospitalValue: '7.5 (Medium-Large)',
    supplierValue: '7.5 (Medium-Large)',
    status: 'EXACT_MATCH',
    isClinicalDealbreaker: true,
    llmNote: 'Exact dimensional match verified across both specifications.',
  },
  {
    key: 'material_composition',
    label: 'Material Composition',
    dataType: 'ENUM',
    enumOptions: ['Natural Rubber Latex', 'Nitrile', 'Neoprene', 'Polyisoprene'],
    hospitalValue: 'Natural Rubber Latex (Low Protein)',
    supplierValue: 'Natural Rubber Latex (Low Protein)',
    previousSupplierValue: 'Natural Rubber Latex',
    status: 'EXACT_MATCH',
    isClinicalDealbreaker: true,
    llmNote: 'Supplier submitted low protein certification (<50 µg/g per EN 455-3).',
    enrichmentSource: 'SUPPLIER_RESPONSE',
    updatedBySupplier: true,
  },
  {
    key: 'sterility_status',
    label: 'Sterility & Method',
    dataType: 'ENUM',
    enumOptions: ['Sterile Gamma', 'Sterile EtO', 'Non-Sterile'],
    hospitalValue: 'Sterile Gamma Radiation (EN 556-1)',
    supplierValue: null,
    status: 'MISSING_DATA',
    isClinicalDealbreaker: true,
    llmNote: 'Supplier catalog does not explicitly state sterilization protocol. Clarification required.',
  },
  {
    key: 'cuff_thickness',
    label: 'Cuff Thickness',
    dataType: 'NUMBER_WITH_UNIT',
    unit: 'mm',
    hospitalValue: 0.22,
    supplierValue: 0.20,
    status: 'SOFT_MISMATCH',
    isClinicalDealbreaker: false,
    llmNote: 'Minor 0.02mm variance within clinical tolerance of ±0.03mm (ASTM D3577).',
  },
  {
    key: 'powder_content',
    label: 'Powder Status',
    dataType: 'BOOLEAN',
    hospitalValue: false,
    supplierValue: true,
    status: 'CLINICAL_CONFLICT',
    isClinicalDealbreaker: true,
    llmNote: 'Hospital requires 100% Powder-Free for OR surgical use; candidate is Lightly Powdered.',
  },
]

const App: React.FC = () => {
  const [data, setData] = useState<TriageItem[]>(INITIAL_TRIAGE_DATA)
  const [selectedKey, setSelectedKey] = useState<string>('1')

  const selectedItem = data.find((item) => item.key === selectedKey) ?? data[0]
  const [isReadOnlyDiff, setIsReadOnlyDiff] = useState(false)

  const handleSelectMissing = (attr: AttributeComparisonRow) => {
    message.info(`Dispatched inquiry to supplier for attribute: ${attr.label}`)
  }

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

        {/* Side-by-Side Buyer Comparison View */}
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

        {/* Attribute Comparison Grid (The Engine) */}
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
              <Switch
                size="small"
                checked={isReadOnlyDiff}
                onChange={setIsReadOnlyDiff}
              />
            </Space>
          }
          size="small"
        >
          <Paragraph type="secondary" style={{ marginBottom: 14 }}>
            Row-by-row alignment between hospital requirements and supplier catalog attributes, color-coding match states (Exact Match, Missing Data, Soft Mismatch, Clinical Conflict) with clinical dealbreaker indicators.
          </Paragraph>
          <AttributeDiffTable
            attributes={SAMPLE_ATTRIBUTE_COMPARISON}
            readOnly={isReadOnlyDiff}
            onSelectMissing={handleSelectMissing}
          />
        </Card>

        {/* Supplier Response Screen Reference Spec Preview */}
        <Card title="Supplier Response Screen (Reference Spec Card)" size="small">
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Displayed at the top of the supplier task interface so suppliers know exactly which hospital specification they are reviewing.
          </Paragraph>
          <ArticleSummaryCard
            article={SAMPLE_HOSPITAL_ARTICLE}
            sourceType="HOSPITAL"
            compact={true}
            extra={
              <Button size="small" icon={<SwapOutlined />}>
                Suggest Alternative
              </Button>
            }
          />
        </Card>

        {/* Enrichment Audit Timeline Showcase */}
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
      </Space>
    </div>
  )
}

export default App
