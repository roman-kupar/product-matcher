import { assess, type Assessment } from '../assessment/assessment.ts'
import { ATTRIBUTE_OPTIONS, CATALOG_PRODUCTS, CATEGORY_ATTRIBUTES, HOSPITAL_ARTICLES, REQUIREMENTS, SEED_QUESTIONS } from './seed.ts'
import type { ArticleStatus, CatalogProduct, HospitalArticle, SupplierQuestion } from '../domain/types.ts'

export interface StoredAssessment extends Assessment {
  previousScore?: number
}

/**
 * In-memory data, seeded from the sample files. Every read and write goes through the functions
 * below, so a database (e.g. Postgres) can replace this without changing the routes.
 */
const articles: HospitalArticle[] = structuredClone(HOSPITAL_ARTICLES)
const products: CatalogProduct[] = structuredClone(CATALOG_PRODUCTS)
const assessments = new Map<string, StoredAssessment>()
const questions: SupplierQuestion[] = structuredClone(SEED_QUESTIONS)

export class NotFoundError extends Error {}
export class BadRequestError extends Error {}

const keyOf = (articleId: string, productId: string) => `${articleId}:${productId}`

function findArticle(id: string): HospitalArticle {
  const article = articles.find((a) => a.id === id)
  if (!article) throw new NotFoundError(`Article ${id} not found`)
  return article
}

/** Matching: a product is a candidate if it belongs to the article's category. */
function findCandidate(article: HospitalArticle, productId: string): CatalogProduct {
  const product = products.find((p) => p.id === productId && p.category === article.category)
  if (!product) throw new NotFoundError(`Product ${productId} is not a candidate for article ${article.id}`)
  return product
}

const candidatesOf = (article: HospitalArticle) => products.filter((p) => p.category === article.category)

/** Derived from the candidates' verdicts (best wins); never stored. */
function statusOf(article: HospitalArticle): ArticleStatus {
  const candidates = candidatesOf(article)
  const verdicts = candidates.flatMap((p) => assessments.get(keyOf(article.id, p.id))?.verdict ?? [])
  if (candidates.length === 0) return 'NO_CANDIDATES'
  if (verdicts.length === 0) return 'NOT_ASSESSED'
  if (verdicts.includes('EQUIVALENT')) return 'EQUIVALENT_AVAILABLE'
  if (verdicts.includes('NEEDS_INFO')) return 'NEEDS_INFO'
  return 'NO_EQUIVALENT'
}

// ---- Hospital side ----

export const listArticles = () => articles.map((a) => ({ ...a, status: statusOf(a) }))

export function getArticle(id: string) {
  const article = findArticle(id)
  return {
    ...article,
    status: statusOf(article),
    candidates: candidatesOf(article).map((product) => ({
      product,
      assessment: assessments.get(keyOf(article.id, product.id)) ?? null,
      questions: questions.filter((q) => q.productId === product.id),
    })),
  }
}

/** Runs the LLM assessment for one article/product pair and keeps the previous score for comparison. */
export async function runAssessment(articleId: string, productId: string): Promise<StoredAssessment> {
  const article = findArticle(articleId)
  const product = findCandidate(article, productId)
  const requirements = REQUIREMENTS[article.id] ?? {}

  const result = await assess({
    article: {
      name: article.name,
      attributes: Object.fromEntries((CATEGORY_ATTRIBUTES[article.category] ?? []).map((a) => [a, requirements[a] ?? null])),
    },
    product: { name: product.name, supplier: product.supplier, attributes: product.attributes },
    exactAttributes: Object.keys(ATTRIBUTE_OPTIONS),
  })

  const previous = assessments.get(keyOf(articleId, productId))
  const stored: StoredAssessment = { ...result, previousScore: previous?.score }
  assessments.set(keyOf(articleId, productId), stored)
  return stored
}

/** Creates one question per missing attribute that has not been asked yet. */
export function askSupplier(articleId: string, productId: string): SupplierQuestion[] {
  const article = findArticle(articleId)
  const product = findCandidate(article, productId)
  const assessment = assessments.get(keyOf(articleId, productId))
  if (!assessment) throw new NotFoundError('Run the assessment first')

  const created = assessment.rows
    .filter((r) => r.status === 'MISSING' && !questions.some((q) => q.productId === product.id && q.attribute === r.attribute))
    .map((r) => ({ id: `${product.id}:${r.attribute}`, productId: product.id, attribute: r.attribute }))
  questions.push(...created)
  return created
}

// ---- Supplier side (every query is scoped to one supplier) ----

export const listSuppliers = () =>
  [...new Set(products.map((p) => p.supplier))].map((name) => ({
    name,
    openQuestions: supplierQuestions(name).length,
  }))

export function supplierQuestions(supplier: string) {
  return questions
    .filter((q) => q.answer === undefined)
    .flatMap((q) => {
      const product = products.find((p) => p.id === q.productId && p.supplier === supplier)
      return product ? [{ ...q, product, options: ATTRIBUTE_OPTIONS[q.attribute] ?? null }] : []
    })
}

/** Stores the answer and writes it into the supplier's catalog data. */
export function answerQuestion(supplier: string, questionId: string, answer: string): SupplierQuestion {
  const question = questions.find((q) => q.id === questionId)
  const product = products.find((p) => p.id === question?.productId && p.supplier === supplier)
  if (!question || !product) throw new NotFoundError(`Question ${questionId} not found for ${supplier}`)
  const options = ATTRIBUTE_OPTIONS[question.attribute]
  if (options && !options.includes(answer)) throw new BadRequestError(`Answer must be one of: ${options.join(', ')}`)

  question.answer = answer
  product.attributes[question.attribute] = answer
  return question
}
