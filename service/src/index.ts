import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { assess, type AssessmentInput } from './assessment.ts'
import { config } from './config.ts'

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const isValues = (v: unknown): v is Record<string, string | null> =>
  typeof v === 'object' && v !== null && Object.values(v).every((x) => x === null || typeof x === 'string')

function isAssessmentInput(body: unknown): body is AssessmentInput {
  const { article, product } = (body ?? {}) as Partial<AssessmentInput>
  return (
    typeof article?.name === 'string' &&
    isValues(article.attributes) &&
    typeof product?.name === 'string' &&
    typeof product.supplier === 'string' &&
    isValues(product.attributes)
  )
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  if (url.pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
  }

  if (url.pathname === '/api/assessments' && req.method === 'POST') {
    let body: unknown
    try {
      body = await readJson(req)
    } catch {
      return send(res, 400, { error: 'Body must be valid JSON' })
    }
    if (!isAssessmentInput(body)) return send(res, 400, { error: 'Expected { article, product } with attributes' })

    try {
      return send(res, 200, await assess(body))
    } catch (error) {
      console.error('[service] Assessment failed:', error)
      return send(res, 502, { error: 'Assessment failed', detail: error instanceof Error ? error.message : String(error) })
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
