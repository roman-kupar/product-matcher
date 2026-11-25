import { Collapse, Descriptions, Empty, Menu, Space, Tag, Typography } from 'antd'
import { CandidateCard } from './CandidateCard'
import { articleStatus, assessmentKey, findCandidates } from '../assess'
import { ArticleStatus } from '../enums'
import { useSettings } from '../i18n/settings'
import type { Assessment, CatalogProduct, HospitalArticle, SupplierQuestion } from '../types'

const { Title, Text } = Typography

const STATUS_COLOR: Record<ArticleStatus, string> = {
  [ArticleStatus.EquivalentAvailable]: 'success',
  [ArticleStatus.NeedsInfo]: 'warning',
  [ArticleStatus.NoEquivalent]: 'error',
  [ArticleStatus.NoCandidates]: 'default',
}

interface Props {
  articles: HospitalArticle[]
  selectedId: string
  onSelect: (id: string) => void
  products: CatalogProduct[]
  assessments: Record<string, Assessment>
  questions: SupplierQuestion[]
  onAskSupplier: (articleId: string, productId: string) => void
  onReRun: (articleId: string, productId: string) => void
}

export function HospitalView({ articles, selectedId, onSelect, products, assessments, questions, onAskSupplier, onReRun }: Props) {
  const { t } = useSettings()
  const article = articles.find((a) => a.id === selectedId)
  const candidates = article ? findCandidates(article, products) : []
  const statusOf = (a: HospitalArticle) =>
    articleStatus(findCandidates(a, products).map((p) => assessments[assessmentKey(a.id, p.id)]))

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <Menu
        style={{ width: 360, flexShrink: 0, borderRadius: 8 }}
        selectedKeys={[selectedId]}
        onClick={({ key }) => onSelect(key)}
        items={articles.map((a) => {
          const status = statusOf(a)
          return {
            key: a.id,
            title: a.name,
            label: a.name,
            extra: <Tag color={STATUS_COLOR[status]} style={{ margin: 0 }}>{t(`articleStatus.${status}`)}</Tag>,
          }
        })}
      />

      {article && (
        <Space orientation="vertical" size="middle" style={{ flex: 1, minWidth: 0 }}>
          <div>
            <Space wrap>
              <Title level={4} style={{ margin: 0 }}>{article.name}</Title>
              <Tag>{t(`category.${article.category}`)}</Tag>
            </Space>
            <div>
              <Text type="secondary">{article.brand} · {t('article.articleNo', { value: article.articleNo })}</Text>
            </div>
            <Collapse
              ghost
              size="small"
              items={[
                {
                  key: 'master',
                  label: t('article.details'),
                  children: (
                    <Descriptions size="small" column={2} bordered>
                      <Descriptions.Item label={t('article.orderUnit')}>
                        {t('article.orderUnitValue', { unit: article.orderUnit, count: article.unitsPerOrderUnit, baseUnit: article.baseUnit })}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('article.annualQuantity')}>{article.annualQuantity}</Descriptions.Item>
                      <Descriptions.Item label={t('article.gtin')}>{article.gtin}</Descriptions.Item>
                      <Descriptions.Item label={t('article.mdrClass')}>{article.mdrClass}</Descriptions.Item>
                      <Descriptions.Item label={t('article.targetPrice')}>
                        {article.targetPrice} {article.currency}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </div>

          {candidates.length === 0 && <Empty description={t('article.noCandidates')} />}
          {candidates.map((product) => (
            <CandidateCard
              key={product.id}
              product={product}
              assessment={assessments[assessmentKey(article.id, product.id)]}
              questions={questions.filter((q) => q.productId === product.id)}
              onAskSupplier={() => onAskSupplier(article.id, product.id)}
              onReRun={() => onReRun(article.id, product.id)}
            />
          ))}
        </Space>
      )}
    </div>
  )
}
