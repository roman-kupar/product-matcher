import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { config } from './config.ts'
import {
  BadRequestError,
  NotFoundError,
  answerQuestion,
  askSupplier,
  getArticle,
  listArticles,
  listSuppliers,
  runAssessment,
  supplierQuestions,
} from './store.ts'

type Handler = (params: string[], body: unknown) => unknown

/** Method + path pattern -> handler. Captured path segments are passed as params (URL-decoded). */
const routes: [method: string, pattern: RegExp, handler: Handler][] = [
  ['GET', /^\/api\/health$/, () => ({ status: 'ok', uptime: process.uptime() })],

  // Hospital side
  ['GET', /^\/api\/articles$/, () => listArticles()],
  ['GET', /^\/api\/articles\/([^/]+)$/, ([id]) => getArticle(id)],
  ['POST', /^\/api\/articles\/([^/]+)\/candidates\/([^/]+)\/assessment$/, ([id, productId]) => runAssessment(id, productId)],
  ['POST', /^\/api\/articles\/([^/]+)\/candidates\/([^/]+)\/questions$/, ([id, productId]) => askSupplier(id, productId)],

  // Supplier side
  ['GET', /^\/api\/suppliers$/, () => listSuppliers()],
  ['GET', /^\/api\/suppliers\/([^/]+)\/questions$/, ([supplier]) => supplierQuestions(supplier)],
  [
    'POST',
    /^\/api\/suppliers\/([^/]+)\/questions\/([^/]+)\/answer$/,
    ([supplier, questionId], body) => {
      const answer = (body as { answer?: unknown } | null)?.answer
      if (typeof answer !== 'string' || !answer.trim()) throw new BadRequestError('Expected { answer: string }')
      return answerQuestion(supplier, questionId, answer.trim())
    },
  ],
]

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new BadRequestError('Body must be valid JSON')
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost')

  for (const [method, pattern, handler] of routes) {
    const match = req.method === method ? pattern.exec(pathname) : null
    if (!match) continue
    try {
      const body = method === 'POST' ? await readJson(req) : null
      return send(res, 200, await handler(match.slice(1).map(decodeURIComponent), body))
    } catch (error) {
      if (error instanceof NotFoundError) return send(res, 404, { error: error.message })
      if (error instanceof BadRequestError) return send(res, 400, { error: error.message })
      console.error(`[service] ${method} ${pathname} failed:`, error)
      // Remaining failures come from the LLM call (gateway down, invalid answer, timeout).
      return send(res, 502, { error: error instanceof Error ? error.message : String(error) })
    }
  }

  send(res, 404, { error: 'Not Found' })
})

server.listen(config.port, config.host, () => {
  console.log(`[service] Backend server running on http://${config.host}:${config.port}`)
})

function shutdown(signal: string) {
  console.log(`[service] Received ${signal}. Shutting down gracefully...`)
  server.close(() => {
    console.log('[service] Server closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
