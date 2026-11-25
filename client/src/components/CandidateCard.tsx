import { Button, Card, Collapse, Space, Table, Tag, Typography } from 'antd'
import { ReloadOutlined, SendOutlined } from '@ant-design/icons'
import type { Assessment, AttributeStatus, CatalogProduct, SupplierQuestion, Verdict } from '../types'

const { Text } = Typography

const VERDICT: Record<Verdict, { label: string; color: string }> = {
  EQUIVALENT: { label: 'Equivalent', color: 'success' },
  NEEDS_INFO: { label: 'Needs info', color: 'warning' },
  NOT_EQUIVALENT: { label: 'Not equivalent', color: 'error' },
}

const STATUS: Record<AttributeStatus, string> = { MATCH: 'success', MISMATCH: 'error', MISSING: 'warning' }

interface Props {
  product: CatalogProduct
  assessment: Assessment
  questions: SupplierQuestion[]
  onAskSupplier: () => void
  onReRun: () => void
}

export function CandidateCard({ product, assessment, questions, onAskSupplier, onReRun }: Props) {
  const { verdict, score, previousScore, rows } = assessment
  const missing = rows.filter((r) => r.status === 'MISSING').map((r) => r.attribute)
  const unasked = missing.filter((a) => !questions.some((q) => q.attribute === a))
  const open = questions.filter((q) => q.answer === undefined).length
  const answered = questions.filter((q) => q.answer !== undefined && missing.includes(q.attribute)).length

  return (
    <Card
      size="small"
      title={
        <Space>
          {product.name}
          <Text type="secondary">· {product.supplier}</Text>
        </Space>
      }
      extra={
        <Tag color={VERDICT[verdict].color}>
          {VERDICT[verdict].label} · {previousScore !== undefined && `${previousScore}% → `}
          {score}%
        </Tag>
      }
    >
      <Space orientation="vertical" style={{ width: '100%' }}>
        {missing.length > 0 && <Text>Missing data: {missing.join(', ')}</Text>}
        <Space>
          {unasked.length > 0 && (
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={onAskSupplier}>
              Ask supplier ({unasked.length})
            </Button>
          )}
          {open > 0 && <Tag color="processing">Waiting for supplier ({open})</Tag>}
          {answered > 0 && open === 0 && <Tag color="success">Supplier answered, re-run to update</Tag>}
          <Button size="small" icon={<ReloadOutlined />} onClick={onReRun}>
            Re-run assessment
          </Button>
        </Space>
        <Collapse
          ghost
          size="small"
          items={[
            {
              key: 'details',
              label: 'Details',
              children: (
                <>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="attribute"
                    dataSource={rows}
                    columns={[
                      { title: 'Attribute', dataIndex: 'attribute' },
                      { title: 'Hospital', dataIndex: 'required' },
                      { title: 'Supplier', dataIndex: 'offered', render: (v: string | null) => v ?? '—' },
                      { title: '', dataIndex: 'status', render: (s: AttributeStatus) => <Tag color={STATUS[s]}>{s}</Tag> },
                    ]}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Art.-Nr. {product.articleNo} · Source: {product.source}
                  </Text>
                </>
              ),
            },
          ]}
        />
      </Space>
    </Card>
  )
}
