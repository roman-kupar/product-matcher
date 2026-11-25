import { config } from '../config.ts'

interface ChatCompletion {
  choices?: { message?: { content?: string | null } }[]
}

/**
 * Sends one prompt to an OpenAI-compatible chat endpoint and returns the parsed JSON answer.
 * The JSON schema constrains the model's output shape; callers still validate the result.
 */
export async function completeJson(system: string, user: string, schema: { name: string; schema: object }): Promise<unknown> {
  const { baseUrl, apiKey, model } = config.llm
  if (!model) throw new Error('LLM_MODEL is not set')

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey && { Authorization: `Bearer ${apiKey}` }) },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_schema', json_schema: { ...schema, strict: true } },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  })

  if (!response.ok) {
    throw new Error(`LLM request failed (${response.status}): ${(await response.text()).slice(0, 300)}`)
  }
  const content = ((await response.json()) as ChatCompletion).choices?.[0]?.message?.content
  if (!content) throw new Error('LLM returned an empty answer')
  return JSON.parse(content)
}
