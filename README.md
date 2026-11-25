# Product Matcher

Finds equivalent supplier products for hospital articles, assesses them attribute by attribute with an LLM, and asks the supplier for any missing data.

- **client:** React UI with a hospital view and a supplier view.
- **service:** Node API, data store and LLM assessment.
- **litellm:** a gateway between the service and the model provider.

Design decisions and trade-offs are in [docs/DECISIONS.md](docs/DECISIONS.md).

## Setup

The gateway reads its keys from `litellm/.env`:

```bash
printf 'LITELLM_MASTER_KEY=sk-%s\nLITELLM_SALT_KEY=sk-%s\n' \
  "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > litellm/.env
```

By default the gateway uses a local model, which needs [Ollama](https://ollama.com) running on the host with `ollama pull qwen2.5:1.5b`. To use a hosted model instead, add two lines to `litellm/.env`, in [LiteLLM's model format](https://docs.litellm.ai/docs/providers):

```bash
LLM_PROVIDER_MODEL=<provider>/<model>
LLM_PROVIDER_API_KEY=<your key>
```

If the hosted model fails, the gateway falls back to the local one.

## Run with Docker

```bash
docker compose up -d --build
sh litellm/create-service-key.sh    # once: writes the service's gateway key to service/.env
docker compose up -d service        # restart the service with that key
```

Open http://localhost:8080.

## Run locally

```bash
npm install
docker compose -f litellm/docker-compose.quickstart.yml up -d   # gateway only
sh litellm/create-service-key.sh                                # once
npm run dev                                                     # client and service
```

Open http://localhost:5173. Check everything with `npm run lint` and `npm run build`.

## Structure

```
.
├── client
│   └── src
│       ├── api
│       │   └── client.ts
│       ├── App.tsx
│       ├── features
│       │   ├── hospital
│       │   │   ├── CandidateCard.tsx
│       │   │   └── HospitalView.tsx
│       │   └── supplier
│       │       └── SupplierView.tsx
│       ├── hooks
│       │   └── useHashView.ts
│       ├── i18n
│       │   ├── languages.ts
│       │   └── settings.tsx
│       ├── main.tsx
│       ├── model
│       │   ├── enums.ts
│       │   └── types.ts
│       └── theme
│           ├── palette.ts
│           └── themes.ts
├── docs
│   └── DECISIONS.md
└── service
    └── src
        ├── assessment
        │   ├── assessment.ts
        │   └── llm.ts
        ├── config.ts
        ├── data
        │   ├── seed.ts
        │   └── store.ts
        ├── domain
        │   └── types.ts
        └── index.ts
```

## Architecture

```
 Hospital buyer ─┐
                 ├─▶  client  ──/api──▶  service  ──▶  LiteLLM  ──▶  model provider
 Supplier ───────┘   (React UI)          (Node API)    (gateway)     (fallback: Ollama)
                                             │
                                             ▼
                                           store
                                 (articles, products, questions)
```

The client only talks to the service, and the service only talks to the model through the gateway, using an alias (`assessment-model`). In Docker, nginx serves the client and forwards `/api` to the service. In development, Vite does the same.

**Workflow**

1. **Select:** the buyer picks a hospital article. The service lists catalog products of the same category as candidates.
2. **Assess:** for each attribute, code decides the clear cases (missing, identical, coded values). The LLM judges only the rest, and code computes the verdict and score.
3. **Ask:** for missing attributes, the buyer sends questions, routed to that product's supplier only.
4. **Answer:** the supplier answers in their own view. The answer is stored as catalog data on the product.
5. **Re-assess:** the buyer re-runs the assessment and sees the change, e.g. *Needs info 80%* → *Equivalent 100%*. An article where no candidate matches shows as *No equivalent*.

```
 select ─▶ assess ─▶ ask ─▶ answer ─▶ re-assess
              ▲                           │
              └───────────────────────────┘
```
