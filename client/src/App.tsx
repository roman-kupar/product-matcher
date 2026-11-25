import { useState } from 'react'
import { App as AntdApp, Segmented, Space, Typography, theme } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { HospitalView } from './components/HospitalView'
import { SupplierView } from './components/SupplierView'
import { assess } from './assess'
import { useSettings, type Lang } from './i18n/settings'
import { CATALOG_PRODUCTS, HOSPITAL_ARTICLES, REQUIREMENTS } from './mockData'
import type { Assessment, CatalogProduct, SupplierQuestion } from './types'

const { Title, Text } = Typography

const assessProduct = (product: CatalogProduct) => assess(REQUIREMENTS[product.hospitalArticleId], product)

export default function App() {
  const { t, lang, setLang, dark, setDark } = useSettings()
  const { message } = AntdApp.useApp()
  const { token } = theme.useToken()

  const [view, setView] = useState<'HOSPITAL' | 'SUPPLIER'>('HOSPITAL')
  const [selectedId, setSelectedId] = useState('3')
  const [products, setProducts] = useState(CATALOG_PRODUCTS)
  const [assessments, setAssessments] = useState<Record<string, Assessment>>(() =>
    Object.fromEntries(CATALOG_PRODUCTS.map((p) => [p.id, assessProduct(p)])),
  )
  const [questions, setQuestions] = useState<SupplierQuestion[]>([])

  const askSupplier = (productId: string) => {
    const product = products.find((p) => p.id === productId)!
    const missing = assessments[productId].rows.filter(
      (r) => r.status === 'MISSING' && !questions.some((q) => q.productId === productId && q.attribute === r.attribute),
    )
    setQuestions((prev) => [
      ...prev,
      ...missing.map((r) => ({ id: `${productId}:${r.attribute}`, productId, attribute: r.attribute })),
    ])
    message.success(t('msg.questionsSent', { count: missing.length, supplier: product.supplier }))
  }

  const answer = (questionId: string, value: string) => {
    const question = questions.find((q) => q.id === questionId)!
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answer: value } : q)))
    setProducts((prev) =>
      prev.map((p) => (p.id === question.productId ? { ...p, attributes: { ...p.attributes, [question.attribute]: value } } : p)),
    )
    message.success(t('msg.answerSaved'))
  }

  const reRun = (productId: string) => {
    const next = assessProduct(products.find((p) => p.id === productId)!)
    setAssessments((prev) => ({ ...prev, [productId]: { ...next, previousScore: prev[productId].score } }))
  }

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, color: token.colorText }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>{t('app.title')}</Title>
            <Text type="secondary">{t('app.subtitle')}</Text>
          </div>
          <Space wrap>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { label: t('view.hospital'), value: 'HOSPITAL' },
                { label: t('view.supplier', { count: questions.filter((q) => q.answer === undefined).length }), value: 'SUPPLIER' },
              ]}
            />
            <Segmented<Lang>
              value={lang}
              onChange={setLang}
              options={[
                { label: 'EN', value: 'en' },
                { label: 'DE', value: 'de' },
              ]}
            />
            <Segmented
              value={dark ? 'dark' : 'light'}
              onChange={(v) => setDark(v === 'dark')}
              options={[
                { value: 'light', icon: <SunOutlined />, title: t('settings.light') },
                { value: 'dark', icon: <MoonOutlined />, title: t('settings.dark') },
              ]}
            />
          </Space>
        </div>

        {view === 'HOSPITAL' ? (
          <HospitalView
            articles={HOSPITAL_ARTICLES}
            selectedId={selectedId}
            onSelect={setSelectedId}
            products={products}
            assessments={assessments}
            questions={questions}
            onAskSupplier={askSupplier}
            onReRun={reRun}
          />
        ) : (
          <SupplierView questions={questions} products={products} onAnswer={answer} />
        )}
      </div>
    </div>
  )
}
