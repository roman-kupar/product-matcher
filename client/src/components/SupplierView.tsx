import { useState } from 'react'
import { Button, Card, Empty, Input, Space, Typography } from 'antd'
import type { CatalogProduct, SupplierQuestion } from '../types'

const { Text } = Typography

interface Props {
  questions: SupplierQuestion[]
  products: CatalogProduct[]
  onAnswer: (questionId: string, answer: string) => void
}

/** The supplier's inbox: answer open questions; answers are written into the supplier's catalog. */
export function SupplierView({ questions, products, onAnswer }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const open = questions.filter((q) => q.answer === undefined)

  if (open.length === 0) {
    return <Empty description="No open questions. Ask a supplier from the hospital view first." />
  }

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {open.map((q) => {
        const product = products.find((p) => p.id === q.productId)
        const draft = drafts[q.id]?.trim() ?? ''
        return (
          <Card key={q.id} size="small" title={product?.name} extra={<Text type="secondary">{product?.supplier}</Text>}>
            <Text>{q.text}</Text>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input
                placeholder={q.attribute}
                value={drafts[q.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                onPressEnter={() => draft && onAnswer(q.id, draft)}
              />
              <Button type="primary" disabled={!draft} onClick={() => onAnswer(q.id, draft)}>
                Submit
              </Button>
            </Space.Compact>
          </Card>
        )
      })}
    </Space>
  )
}
