import { Collapse, Descriptions, Empty, Menu, Space, Spin, Tag, Typography } from 'antd'
import { CandidateCard } from './CandidateCard'
import { ArticleStatus } from '../enums'
import { useSettings } from '../i18n/settings'
import type { ArticleDetail, ArticleSummary } from '../types'

const { Title, Text } = Typography

const STATUS_COLOR: Record<ArticleStatus, string> = {
  [ArticleStatus.EquivalentAvailable]: 'success',
  [ArticleStatus.NeedsInfo]: 'warning',
  [ArticleStatus.NoEquivalent]: 'error',
  [ArticleStatus.NoCandidates]: 'default',
  [ArticleStatus.NotAssessed]: 'processing',
}

interface Props {
  articles: ArticleSummary[]
  selectedId: string
  onSelect: (id: string) => void
  /** The selected article with its candidates; null while loading. */
  detail: ArticleDetail | null
  runningId: string | null
  onRunAssessment: (articleId: string, productId: string) => void
  onAskSupplier: (articleId: string, productId: string) => void
}

export function HospitalView({ articles, selectedId, onSelect, detail, runningId, onRunAssessment, onAskSupplier }: Props) {
  const { t } = useSettings()

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <Menu
        style={{ width: 360, flexShrink: 0, borderRadius: 8 }}
        selectedKeys={[selectedId]}
        onClick={({ key }) => onSelect(key)}
        items={articles.map((a) => ({
          key: a.id,
          title: a.name,
          label: a.name,
          extra: <Tag color={STATUS_COLOR[a.status]} style={{ margin: 0 }}>{t(`articleStatus.${a.status}`)}</Tag>,
        }))}
      />

      {!detail ? (
        <Spin style={{ flex: 1, marginTop: 48 }} />
      ) : (
        <Space orientation="vertical" size="middle" style={{ flex: 1, minWidth: 0 }}>
          <div>
            <Space wrap>
              <Title level={4} style={{ margin: 0 }}>{detail.name}</Title>
              <Tag>{t(`category.${detail.category}`)}</Tag>
            </Space>
            <div>
              <Text type="secondary">{detail.brand} · {t('article.articleNo', { value: detail.articleNo })}</Text>
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
                        {t('article.orderUnitValue', { unit: detail.orderUnit, count: detail.unitsPerOrderUnit, baseUnit: detail.baseUnit })}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('article.annualQuantity')}>{detail.annualQuantity}</Descriptions.Item>
                      <Descriptions.Item label={t('article.gtin')}>{detail.gtin}</Descriptions.Item>
                      <Descriptions.Item label={t('article.mdrClass')}>{detail.mdrClass}</Descriptions.Item>
                      <Descriptions.Item label={t('article.targetPrice')}>
                        {detail.targetPrice} {detail.currency}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </div>

          {detail.candidates.length === 0 && <Empty description={t('article.noCandidates')} />}
          {detail.candidates.map((candidate) => (
            <CandidateCard
              key={candidate.product.id}
              candidate={candidate}
              running={runningId === candidate.product.id}
              onRunAssessment={() => onRunAssessment(detail.id, candidate.product.id)}
              onAskSupplier={() => onAskSupplier(detail.id, candidate.product.id)}
            />
          ))}
        </Space>
      )}
    </div>
  )
}
