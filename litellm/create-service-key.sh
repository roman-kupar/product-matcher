#!/usr/bin/env sh
# Creates a LiteLLM virtual key that may only use "assessment-model" and writes the
# service's LLM settings to service/.env. The key is never printed.
#
#   sh litellm/create-service-key.sh      (from the repo root, with the gateway running)
set -eu
cd "$(dirname "$0")/.."

if [ -e service/.env ]; then
  echo "service/.env already exists; delete it first to create a new key." >&2
  exit 1
fi

MASTER_KEY=$(grep -E '^LITELLM_MASTER_KEY=' litellm/.env | cut -d= -f2-)
RESPONSE=$(curl -sf -m 15 http://localhost:4000/key/generate \
  -H "Authorization: Bearer $MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"models":["assessment-model"],"key_alias":"article-enricher-service"}') || {
  echo "Gateway request failed. Is it running (docker compose -f litellm/docker-compose.quickstart.yml up -d)?" >&2
  exit 1
}
KEY=$(printf '%s' "$RESPONSE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).key??""))')

if [ -z "$KEY" ]; then
  echo "Key generation failed. Is the gateway running (docker compose -f litellm/docker-compose.quickstart.yml up -d)?" >&2
  exit 1
fi

umask 077
printf 'LLM_BASE_URL=http://localhost:4000/v1\nLLM_API_KEY=%s\nLLM_MODEL=assessment-model\n' "$KEY" > service/.env
echo "Wrote service/.env (virtual key restricted to assessment-model)."
