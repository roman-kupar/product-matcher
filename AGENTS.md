# AGENTS.md

> Operational guidelines, strict safety boundaries, and workflow instructions for AI agents working in `product-matcher`.

---

## 1. Project Overview

- Repository: `product-matcher` (Monorepo)
- Structure:
  - `client/`: React 19 UI with Vite and TypeScript
  - `service/`: Node.js service with TypeScript (ESM)
- Package Manager: `npm` (Workspaces enabled)

---

## 2. Hard Boundaries & Forbidden Actions (CRITICAL)

Agents must strictly adhere to the following negative constraints. Violation of these rules is considered a critical error.

### 2.1. Git & Version Control
- NEVER execute `git commit` or `git push`**: Only the human developer is authorized to stage, commit, and push changes.
- NEVER run destructive git commands**: Do not run `git reset --hard`, `git checkout -- .`, `git clean -fd`, `git rebase`, or force branch deletions.
- NEVER alter remotes or create/delete branches** without explicit instruction.

### 2.2. Environment & Secrets
- NEVER create, edit, or delete `.env` or `.env.*` files**: Do not add, modify, or strip variables from local or production environment files.
- NEVER read, output, or expose secrets, tokens, or credentials**: Never log API keys, private keys, authentication tokens, or passwords to files, terminal output, or chat summaries.
- Use mock / sample configurations only**: If a configuration template is needed, refer to `.env.example` without touching active environment files.

### 2.3. Destructive & Mutating System Changes
  - NEVER execute mutating or irreversible operations without explicit prior approval:
  - Deleting existing files, directories, or assets.
  - Adding, removing, or upgrading dependencies (`npm install <pkg>`, `npm uninstall <pkg>`, `npm update`).
  - Running database migrations, seed scripts with destructive behavior, or external network mutations.
  - Modifying build toolchain configurations (`vite.config.ts`, `tsconfig*.json`, `eslint.config.js`) unless explicitly requested.
- Always ask for confirmation: If an action carries side effects or alters project infrastructure, present the proposed command and rationale to the developer first and wait for approval.

### 2.4. Scope & Diff Limits (Max +200 Lines)
  - NEVER make monolithic changes exceeding +200 lines:
  - Keep all code modifications atomic, incremental, and modular.
  - Any single continuous task or edit must not exceed +200 lines of change.
  - If a feature or refactor requires more than 200 lines, break it down into explicit, self-contained milestones and complete them sequentially.
  - Provide a concise diff review before proceeding to subsequent steps.

---

## 3. Standard Development Workflow

### 3.1. Development & Build Commands
| Scope | Task | Command | Description |
| :--- | :--- | :--- | :--- |
| **All** | Dev | `npm run dev` | Start all workspace dev servers |
| **All** | Build | `npm run build` | Build all workspaces (`client` & `service`) |
| **All** | Lint | `npm run lint` | Lint all workspaces |
| **client** | Dev | `npm run dev:client` | Start Vite dev server for React UI |
| **client** | Build | `npm run build:client` | Type check and bundle the client |
| **client** | Lint | `npm run lint:client` | Run ESLint across the client |
| **service** | Dev | `npm run dev:service` | Start Node service in watch mode |
| **service** | Build | `npm run build:service` | Compile the service |
| **service** | Lint | `npm run lint:service` | Type check the service (`tsc --noEmit`) |

### 3.2. Verification Before Handoff
Before marking any task as complete:
1. Lint Verification: Execute `npm run lint` (or package-specific lint) and verify zero errors/warnings.
2. Type Verification: Execute `npm run build` (or package-specific build) to verify strict compilation.
3. Fix all introduced warnings and errors prior to requesting user review.

---

## 4. Coding Standards & Conventions

- React & TypeScript:
  - Modern React 19 patterns (functional components, idiomatic hooks).
  - Explicit typing for props, state, and function return values. Avoid `any`; use `unknown` with type guards where necessary.
  - Strict null/undefined checks.
- Code Organization:
  - Colocate related components, styles, types, and utility functions logically within `src/`.
  - Prefer small, single-responsibility components and composable custom hooks.
- Minimal Invasive Changes:
  - Only touch files relevant to the active user request.
  - Respect existing formatting, naming conventions, and style rules across the codebase.

---

## 5. Agent Interaction Protocol

1. Clarify Ambiguities: If the user prompt is underspecified or has architectural trade-offs, ask clarifying questions before writing code.
2. Explain Before Broad Edits: Outline the planned changes briefly before initiating edits across multiple files.
3. Reference Files Accurately: When citing files, use clickable links (e.g., `[Component.tsx](file:///...)`).
4. Summarize Transparently: At the end of each turn, summarize what was modified, how it was verified, and next steps for the user.
