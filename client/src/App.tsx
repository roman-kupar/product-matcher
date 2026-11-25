import { useEffect, useEffectEvent, useState } from 'react'
import { App as AntdApp, Segmented, Space, Typography, theme } from 'antd'
import { ExperimentOutlined } from '@ant-design/icons'
import { api } from './api'
import { HospitalView } from './components/HospitalView'
import { SupplierView } from './components/SupplierView'
import { View } from './enums'
import { LANGUAGES, type Language } from './i18n/languages'
import { useSettings } from './i18n/settings'
import { THEMES, type ThemeMode } from './theme/themes'
import type { ArticleDetail, ArticleSummary, SupplierSummary } from './types'
import { useHashView } from './useHashView'

const { Title, Text } = Typography

export default function App() {
  const { t, language, setLanguage, themeMode, setThemeMode } = useSettings()
  const { message } = AntdApp.useApp()
  const { token } = theme.useToken()
  const [view, setView] = useHashView()

  const [selectedId, setSelectedId] = useState('3')
  const [articles, setArticles] = useState<ArticleSummary[]>([])
  const [detail, setDetail] = useState<ArticleDetail | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([])
  const [runningId, setRunningId] = useState<string | null>(null)
  // The server is the source of truth: after every change, bump the version to reload.
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)

  const showError = (error: unknown) => message.error(error instanceof Error ? error.message : String(error))
  // Effect events are not dependencies, so showing an error can never re-trigger a fetch.
  const onLoadError = useEffectEvent(showError)

  useEffect(() => {
    Promise.all([api.articles(), api.suppliers()])
      .then(([a, s]) => {
        setArticles(a)
        setSuppliers(s)
      })
      .catch(onLoadError)
  }, [version])

  useEffect(() => {
    api.article(selectedId).then(setDetail).catch(onLoadError)
  }, [selectedId, version])

  const runAssessment = async (articleId: string, productId: string) => {
    setRunningId(productId)
    try {
      await api.assess(articleId, productId)
      reload()
    } catch (error) {
      showError(error)
    } finally {
      setRunningId(null)
    }
  }

  const askSupplier = async (articleId: string, productId: string) => {
    try {
      const created = await api.askSupplier(articleId, productId)
      const supplier = detail?.candidates.find((c) => c.product.id === productId)?.product.supplier ?? ''
      message.success(t('msg.questionsSent', { count: created.length, supplier }))
      reload()
    } catch (error) {
      showError(error)
    }
  }

  const openQuestions = suppliers.reduce((sum, s) => sum + s.openQuestions, 0)

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, color: token.colorText }}>
      {/* Bottom padding keeps content clear of the demo bar. */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 104px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>{t('app.title')}</Title>
            <Text type="secondary">{t('app.subtitle')}</Text>
          </div>
          <Space wrap>
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
            articles={articles}
            selectedId={selectedId}
            onSelect={setSelectedId}
            detail={detail?.id === selectedId ? detail : null}
            runningId={runningId}
            onRunAssessment={runAssessment}
            onAskSupplier={askSupplier}
          />
        ) : (
          <SupplierView suppliers={suppliers} version={version} onAnswered={reload} onError={showError} />
        )}
      </div>

      {/* Demo only: in production, hospital and supplier are separate users with separate access. */}
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 12px',
          background: token.colorBgElevated,
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        <Text type="secondary">
          <ExperimentOutlined /> {t('demo.viewAs')}
        </Text>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { label: t('view.hospital'), value: View.Hospital },
            { label: t('view.supplier', { count: openQuestions }), value: View.Supplier },
          ]}
        />
      </div>
    </div>
  )
}
