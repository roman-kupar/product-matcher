import { Collapse, Descriptions, Empty, Menu, Space, Typography } from 'antd'
import { CandidateCard } from './CandidateCard'
import type { Assessment, CatalogProduct, HospitalArticle, SupplierQuestion } from '../types'

const { Title, Text } = Typography

interface Props {
  articles: HospitalArticle[]
  selectedId: string
  onSelect: (id: string) => void
  products: CatalogProduct[]
  assessments: Record<string, Assessment>
  questions: SupplierQuestion[]
  onAskSupplier: (productId: string) => void
  onReRun: (productId: string) => void
}

export function HospitalView({ articles, selectedId, onSelect, products, assessments, questions, onAskSupplier, onReRun }: Props) {
  const article = articles.find((a) => a.id === selectedId)
  const candidates = products.filter((p) => p.hospitalArticleId === selectedId)

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <Menu
        style={{ width: 300, flexShrink: 0, borderRadius: 8 }}
        selectedKeys={[selectedId]}
        onClick={({ key }) => onSelect(key)}
        items={articles.map((a) => ({ key: a.id, label: a.name, title: a.name }))}
      />

      {article && (
        <Space orientation="vertical" size="middle" style={{ flex: 1, minWidth: 0 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>{article.name}</Title>
            <Text type="secondary">{article.brand} · Art.-Nr. {article.articleNo}</Text>
            <Collapse
              ghost
              size="small"
              items={[
                {
                  key: 'master',
                  label: 'Details',
                  children: (
                    <Descriptions size="small" column={2} bordered>
                      <Descriptions.Item label="Order unit">
                        {article.orderUnit} of {article.unitsPerOrderUnit} {article.baseUnit}
                      </Descriptions.Item>
                      <Descriptions.Item label="Annual quantity">{article.annualQuantity}</Descriptions.Item>
                      <Descriptions.Item label="GTIN">{article.gtin}</Descriptions.Item>
                      <Descriptions.Item label="MDR class">{article.mdrClass}</Descriptions.Item>
                      <Descriptions.Item label="Target price">
                        {article.targetPrice} {article.currency}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </div>

          {candidates.length === 0 && <Empty description="No matching products in the supplier catalogs" />}
          {candidates.map((product) => (
            <CandidateCard
              key={product.id}
              product={product}
              assessment={assessments[product.id]}
              questions={questions.filter((q) => q.productId === product.id)}
              onAskSupplier={() => onAskSupplier(product.id)}
              onReRun={() => onReRun(product.id)}
            />
          ))}
        </Space>
      )}
    </div>
  )
}
