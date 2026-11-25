import { useEffect, useState } from 'react'
import { App as AntdApp, Button, Card, Empty, Input, Segmented, Space, Typography } from 'antd'
import { api } from '../api'
import { useSettings } from '../i18n/settings'
import type { OpenQuestion, SupplierSummary } from '../types'

const { Text } = Typography

interface Props {
  suppliers: SupplierSummary[]
  /** Bumped by the parent after any change, to reload the questions. */
  version: number
  onAnswered: () => void
  onError: (error: unknown) => void
}

/** The supplier's inbox: each supplier sees only questions about its own products; answers go into its catalog. */
export function SupplierView({ suppliers, version, onAnswered, onError }: Props) {
  const { t } = useSettings()
  const { message } = AntdApp.useApp()
  const [selected, setSelected] = useState<string | null>(null)
  const [questions, setQuestions] = useState<OpenQuestion[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const supplier = selected ?? suppliers[0]?.name

  useEffect(() => {
    if (supplier) api.questions(supplier).then(setQuestions).catch(onError)
  }, [supplier, version, onError])

  const submit = async (question: OpenQuestion) => {
    if (!supplier) return
    try {
      await api.answer(supplier, question.id, drafts[question.id].trim())
      message.success(t('msg.answerSaved'))
      onAnswered()
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Segmented
        value={supplier}
        onChange={setSelected}
        options={suppliers.map((s) => ({ value: s.name, label: t('supplier.tab', { supplier: s.name, count: s.openQuestions }) }))}
      />
      {questions.length === 0 && <Empty description={t('supplier.empty')} />}
      {questions.map((q) => {
        const draft = drafts[q.id]?.trim() ?? ''
        const attribute = t(`attr.${q.attribute}`)
        return (
          <Card key={q.id} size="small" title={q.product.name} extra={<Text type="secondary">{q.product.supplier}</Text>}>
            <Text>{t('supplier.question', { attribute, product: q.product.name, articleNo: q.product.articleNo })}</Text>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input
                placeholder={attribute}
                value={drafts[q.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                onPressEnter={() => draft && submit(q)}
              />
              <Button type="primary" disabled={!draft} onClick={() => submit(q)}>
                {t('supplier.submit')}
              </Button>
            </Space.Compact>
          </Card>
        )
      })}
    </Space>
  )
}
