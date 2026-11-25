import { useState } from 'react'
import { App as AntdApp, Segmented, Space, Typography, theme } from 'antd'
import { HospitalView } from './components/HospitalView'
import { SupplierView } from './components/SupplierView'
import { assess, assessmentKey, findCandidates } from './assess'
import { AttributeStatus, View } from './enums'
import { LANGUAGES, type Language } from './i18n/languages'
import { useSettings } from './i18n/settings'
import { THEMES, type ThemeMode } from './theme/themes'
import { useHashView } from './useHashView'
import { CATALOG_PRODUCTS, HOSPITAL_ARTICLES } from './mockData'
import type { Assessment, SupplierQuestion } from './types'

const { Title, Text } = Typography

/** Initial run: assess every article against its candidates. */
const initialAssessments = (): Record<string, Assessment> =>
  Object.fromEntries(
    HOSPITAL_ARTICLES.flatMap((article) =>
      findCandidates(article, CATALOG_PRODUCTS).map((p) => [assessmentKey(article.id, p.id), assess(article, p)]),
    ),
  )

export default function App() {
  const { t, language, setLanguage, themeMode, setThemeMode } = useSettings()
  const { message } = AntdApp.useApp()
  const { token } = theme.useToken()

  const [view, setView] = useHashView()
  const [selectedId, setSelectedId] = useState('3')
  const [products, setProducts] = useState(CATALOG_PRODUCTS)
  const [assessments, setAssessments] = useState(initialAssessments)
  const [questions, setQuestions] = useState<SupplierQuestion[]>([])

  const askSupplier = (articleId: string, productId: string) => {
    const product = products.find((p) => p.id === productId)!
    const missing = assessments[assessmentKey(articleId, productId)].rows.filter(
      (r) => r.status === AttributeStatus.Missing && !questions.some((q) => q.productId === productId && q.attribute === r.attribute),
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

  const reRun = (articleId: string, productId: string) => {
    const key = assessmentKey(articleId, productId)
    const article = HOSPITAL_ARTICLES.find((a) => a.id === articleId)!
    const next = assess(article, products.find((p) => p.id === productId)!)
    setAssessments((prev) => ({ ...prev, [key]: { ...next, previousScore: prev[key].score } }))
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
                { label: t('view.hospital'), value: View.Hospital },
                { label: t('view.supplier', { count: questions.filter((q) => q.answer === undefined).length }), value: View.Supplier },
              ]}
            />
            <Segmented<Language>
              value={language}
              onChange={setLanguage}
              options={(Object.keys(LANGUAGES) as Language[]).map((value) => ({ value, label: LANGUAGES[value].label }))}
            />
            <Segmented<ThemeMode>
              value={themeMode}
              onChange={setThemeMode}
              options={(Object.keys(THEMES) as ThemeMode[]).map((value) => ({
                value,
                icon: THEMES[value].icon,
                title: t(`theme.${value}`),
              }))}
            />
          </Space>
        </div>

        {view === View.Hospital ? (
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
