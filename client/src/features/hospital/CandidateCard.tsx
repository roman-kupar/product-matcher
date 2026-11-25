import { Button, Card, Collapse, Space, Table, Tag, Typography } from 'antd'
import { ReloadOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons'
import { useSettings } from '../../i18n/settings'
import { AttributeStatus, Verdict, type AttributeKey } from '../../model/enums'
import type { Assessment, Candidate } from '../../model/types'

const { Text } = Typography

const VERDICT_COLOR: Record<Verdict, string> = {
  [Verdict.Equivalent]: 'success',
  [Verdict.NeedsInfo]: 'warning',
  [Verdict.NotEquivalent]: 'error',
}

const STATUS_COLOR: Record<AttributeStatus, string> = {
  [AttributeStatus.Match]: 'success',
  [AttributeStatus.Mismatch]: 'error',
  [AttributeStatus.Missing]: 'warning',
}

interface Props {
  candidate: Candidate
  /** True while the LLM assessment for this candidate is running. */
  running: boolean
  onRunAssessment: () => void
  onAskSupplier: () => void
}

export function CandidateCard({ candidate, running, onRunAssessment, onAskSupplier }: Props) {
  const { t } = useSettings()
  const { product, assessment, questions } = candidate

  const missing = assessment?.rows.filter((r) => r.status === AttributeStatus.Missing).map((r) => r.attribute) ?? []
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
        assessment ? (
          <Tag color={VERDICT_COLOR[assessment.verdict]}>
            {t(`verdict.${assessment.verdict}`)} ·{' '}
            {assessment.previousScore !== undefined && `${assessment.previousScore}% → `}
            {assessment.score}%
          </Tag>
        ) : (
          <Tag>{t('candidate.notAssessed')}</Tag>
        )
      }
    >
      <Space orientation="vertical" style={{ width: '100%' }}>
        {missing.length > 0 && (
          <Text>{t('candidate.missing', { attributes: missing.map((a) => t(`attr.${a}`)).join(', ') })}</Text>
        )}
        <Space wrap>
          {unasked.length > 0 && (
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={onAskSupplier}>
              {t('candidate.ask', { count: unasked.length })}
            </Button>
          )}
          {open > 0 && <Tag color="processing">{t('candidate.waiting', { count: open })}</Tag>}
          {answered > 0 && open === 0 && <Tag color="success">{t('candidate.answered')}</Tag>}
          <Button
            size="small"
            type={assessment ? 'default' : 'primary'}
            icon={assessment ? <ReloadOutlined /> : <RobotOutlined />}
            loading={running}
            onClick={onRunAssessment}
          >
            {t(assessment ? 'candidate.reRun' : 'candidate.run')}
          </Button>
        </Space>
        {assessment && <AssessmentDetails assessment={assessment} source={t('candidate.source', { articleNo: product.articleNo, source: product.source })} />}
      </Space>
    </Card>
  )

}

function AssessmentDetails({ assessment, source }: { assessment: Assessment; source: string }) {
  const { t, language } = useSettings()
  return (
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
                dataSource={assessment.rows}
                columns={[
                  { title: t('candidate.colAttribute'), dataIndex: 'attribute', render: (a: AttributeKey) => t(`attr.${a}`) },
                  { title: t('candidate.colHospital'), dataIndex: 'required', render: (v: string | null) => v ?? '—' },
                  { title: t('candidate.colSupplier'), dataIndex: 'offered', render: (v: string | null) => v ?? '—' },
                  {
                    title: '',
                    dataIndex: 'status',
                    render: (s: AttributeStatus) => <Tag color={STATUS_COLOR[s]}>{t(`status.${s}`)}</Tag>,
                  },
                  {
                    title: t('candidate.colReasoning'),
                    key: 'reasoning',
                    // Rows without LLM reasoning were decided in code: no value, identical value, or different code.
                    render: (_, row) => (
                      <Text type="secondary">
                        {row.reasoning?.[language] ??
                          t(
                            row.status === AttributeStatus.Missing
                              ? 'candidate.notStated'
                              : row.status === AttributeStatus.Mismatch
                                ? 'candidate.codeMismatch'
                                : 'candidate.identical',
                          )}
                      </Text>
                    ),
                  },
                ]}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {source} · {t('candidate.assessedAt', { time: new Date(assessment.assessedAt).toLocaleString(language) })}
              </Text>
            </>
          ),
        },
      ]}
    />
  )
}
