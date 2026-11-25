import { useState } from 'react'
import { Segmented, Typography, message } from 'antd'
import { HospitalView } from './components/HospitalView'
import { SupplierView } from './components/SupplierView'
import { assess, questionFor } from './assess'
import { CATALOG_PRODUCTS, HOSPITAL_ARTICLES, REQUIREMENTS } from './mockData'
import type { Assessment, CatalogProduct, SupplierQuestion } from './types'

const { Title, Text } = Typography

const assessProduct = (product: CatalogProduct) => assess(REQUIREMENTS[product.hospitalArticleId], product)

export default function App() {
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
      ...missing.map((r) => ({ id: `${productId}:${r.attribute}`, productId, attribute: r.attribute, text: questionFor(r.attribute, product) })),
    ])
    message.success(`${missing.length} question(s) sent to ${product.supplier}`)
  }

  const answer = (questionId: string, value: string) => {
    const question = questions.find((q) => q.id === questionId)!
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answer: value } : q)))
    setProducts((prev) =>
      prev.map((p) => (p.id === question.productId ? { ...p, attributes: { ...p.attributes, [question.attribute]: value } } : p)),
    )
    message.success('Answer saved to supplier catalog')
  }

  const reRun = (productId: string) => {
    const next = assessProduct(products.find((p) => p.id === productId)!)
    setAssessments((prev) => ({ ...prev, [productId]: { ...next, previousScore: prev[productId].score } }))
  }

  return (
    <div style={{ maxWidth: 1180, margin: '32px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Article Enricher</Title>
          <Text type="secondary">Find equivalent supplier products and fill in missing data</Text>
        </div>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { label: 'Hospital', value: 'HOSPITAL' },
            { label: `Supplier (${questions.filter((q) => q.answer === undefined).length})`, value: 'SUPPLIER' },
          ]}
        />
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
  )
}
