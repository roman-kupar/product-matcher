/** All settings come from environment variables (optionally loaded from service/.env). */
export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || '127.0.0.1',
  llm: {
    /** Any OpenAI-compatible endpoint: LiteLLM (default), Ollama, OpenAI, ... */
    baseUrl: process.env.LLM_BASE_URL || 'http://localhost:4000/v1',
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || '',
  },
}
