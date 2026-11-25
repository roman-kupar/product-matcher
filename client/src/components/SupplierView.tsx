import { useState } from 'react'
import { Button, Card, Empty, Input, Segmented, Space, Typography } from 'antd'
import { useSettings } from '../i18n/settings'
import type { CatalogProduct, SupplierQuestion } from '../types'

const { Text } = Typography

interface Props {
  questions: SupplierQuestion[]
  products: CatalogProduct[]
  onAnswer: (questionId: string, answer: string) => void
}

/** The supplier's inbox: each supplier sees only questions about its own products; answers go into its catalog. */
export function SupplierView({ questions, products, onAnswer }: Props) {
  const { t } = useSettings()
  const suppliers = [...new Set(products.map((p) => p.supplier))]
  const [supplier, setSupplier] = useState(suppliers[0])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const openFor = (name: string) =>
    questions.filter((q) => q.answer === undefined && products.find((p) => p.id === q.productId)?.supplier === name)
  const open = openFor(supplier)

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Segmented
        value={supplier}
        onChange={setSupplier}
        options={suppliers.map((name) => ({ value: name, label: t('supplier.tab', { supplier: name, count: openFor(name).length }) }))}
      />
      {open.length === 0 && <Empty description={t('supplier.empty')} />}
      {open.map((q) => {
        const product = products.find((p) => p.id === q.productId)
        const draft = drafts[q.id]?.trim() ?? ''
        return (
          <Card key={q.id} size="small" title={product?.name} extra={<Text type="secondary">{product?.supplier}</Text>}>
            <Text>
              {t('supplier.question', { attribute: t(`attr.${q.attribute}`), product: product?.name ?? '', articleNo: product?.articleNo ?? '' })}
            </Text>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input
                placeholder={t(`attr.${q.attribute}`)}
                value={drafts[q.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                onPressEnter={() => draft && onAnswer(q.id, draft)}
              />
              <Button type="primary" disabled={!draft} onClick={() => onAnswer(q.id, draft)}>
                {t('supplier.submit')}
              </Button>
            </Space.Compact>
          </Card>
        )
      })}
    </Space>
  )
}
