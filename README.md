# article-enricher

A monorepo containing the frontend web application and backend service.

## Structure

- [`webclient/`](./webclient): Frontend React 19 UI built with Vite and TypeScript.
- [`service/`](./service): Backend Node.js service built with TypeScript (native ESM).

## Getting Started

### Development
```bash
# Run both frontend and backend
npm run dev

# Or run individually
npm run dev:webclient
npm run dev:service
```

### Build
```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build:webclient
npm run build:service
```

### Lint & Type Check
```bash
# Check both projects
npm run lint

# Or check individually
npm run lint:webclient
npm run lint:service
```
