import { Button, Card, Collapse, Space, Table, Tag, Typography } from 'antd'
import { ReloadOutlined, SendOutlined } from '@ant-design/icons'
import { useSettings } from '../i18n/settings'
import type { Assessment, AttributeKey, AttributeStatus, CatalogProduct, SupplierQuestion, Verdict } from '../types'

const { Text } = Typography

const VERDICT_COLOR: Record<Verdict, string> = { EQUIVALENT: 'success', NEEDS_INFO: 'warning', NOT_EQUIVALENT: 'error' }
const STATUS_COLOR: Record<AttributeStatus, string> = { MATCH: 'success', MISMATCH: 'error', MISSING: 'warning' }

interface Props {
  product: CatalogProduct
  assessment: Assessment
  questions: SupplierQuestion[]
  onAskSupplier: () => void
  onReRun: () => void
}

export function CandidateCard({ product, assessment, questions, onAskSupplier, onReRun }: Props) {
  const { t } = useSettings()
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
        <Tag color={VERDICT_COLOR[verdict]}>
          {t(`verdict.${verdict}`)} · {previousScore !== undefined && `${previousScore}% → `}
          {score}%
        </Tag>
      }
    >
      <Space orientation="vertical" style={{ width: '100%' }}>
        {missing.length > 0 && (
          <Text>{t('candidate.missing', { attributes: missing.map((a) => t(`attr.${a}`)).join(', ') })}</Text>
        )}
        <Space>
          {unasked.length > 0 && (
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={onAskSupplier}>
              {t('candidate.ask', { count: unasked.length })}
            </Button>
          )}
          {open > 0 && <Tag color="processing">{t('candidate.waiting', { count: open })}</Tag>}
          {answered > 0 && open === 0 && <Tag color="success">{t('candidate.answered')}</Tag>}
          <Button size="small" icon={<ReloadOutlined />} onClick={onReRun}>
            {t('candidate.reRun')}
          </Button>
        </Space>
        <Collapse
          ghost
          size="small"
          items={[
            {
              key: 'details',
              label: t('candidate.details'),
              children: (
                <>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="attribute"
                    dataSource={rows}
                    columns={[
                      { title: t('candidate.colAttribute'), dataIndex: 'attribute', render: (a: AttributeKey) => t(`attr.${a}`) },
                      { title: t('candidate.colHospital'), dataIndex: 'required' },
                      { title: t('candidate.colSupplier'), dataIndex: 'offered', render: (v: string | null) => v ?? '—' },
                      {
                        title: '',
                        dataIndex: 'status',
                        render: (s: AttributeStatus) => <Tag color={STATUS_COLOR[s]}>{t(`status.${s}`)}</Tag>,
                      },
                    ]}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t('candidate.source', { articleNo: product.articleNo, source: product.source })}
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
