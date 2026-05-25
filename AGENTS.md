# AGENTS.md

## Project Overview

This project is an AI-powered PPT editor and generator.

High-level product flow is documented in `docs/architecture.md`.

```text
User input -> Presentation JSON -> React editor -> manual editor edits -> PPTX export
```

The most important architectural rule:

```text
Presentation JSON is the single source of truth. C:\CODE\web_code\pptAgent\src\types\presentation.ts 
```

The app should not let AI directly generate final HTML, PPTX, SVG, or arbitrary page code as the primary product data. In the current V1 direction, AI generates structured Presentation JSON from user input; post-generation AI chat editing is intentionally out of scope.

## Current Phase

Current target: V1

## Docs Reading Rules

Before coding, read only the docs relevant to the task.

- Product roadmap or phase planning: read `docs/roadmap.md`.
- Overall architecture decisions: read `docs/architecture.md`.
- UI or styling work: read `design` if it exists; otherwise follow the Design Direction below.
Always follow this `AGENTS.md` first. Detailed docs provide context, but current phase boundaries still apply.

## Architecture Rules

- Keep Presentation JSON as the central data model.
- React preview and PPTX export must both read from the same Presentation JSON.
- Post-generation AI chat editing is not part of the current scope.
  - Do not add or revive AI chat-based slide editing unless explicitly requested.
  - If this capability is reintroduced later, AI edits must modify structured Presentation JSON only, preferably through validated JSON Patch or another schema-checked operation.
- Use templates and template slots to control visual output.
- Add checks for schema correctness and basic layout safety before saving or exporting.
- Template rules should live with the template files. When working on templates or layouts, inspect the template directory README/metadata once that directory exists.
- Validation rules should live with the validation code. When validation utilities or scripts exist, use them instead of inventing a parallel validation system.

## Coding Agent Behavior Rules

These rules apply to Codex, Claude Code, and other AI coding agents working on this repository.

### Think Before Coding

- Do not assume unclear requirements.
- If the task has multiple possible interpretations, briefly state the options before implementing.
- For multi-step changes, give a short plan before editing.
- Prefer asking a clarifying question over making risky architecture decisions.
- For architecture-related changes, preserve the current phase boundaries unless explicitly asked.
- Do not cross phase boundaries because a later-phase idea appears in the docs.
- -Users sometimes offer suboptimal or even incorrect suggestions. After careful consideration, reject these suggestions and provide reasons.

### Simplicity First

- Implement the minimum code needed to satisfy the request.
- Do not add speculative features.
- Do not introduce abstractions for single-use code.
- Prefer explicit data structures over clever abstractions while the Presentation JSON Schema is still evolving.
-Do not modify the code for the next stage at this stage. unless explicitly requested.

### Surgical Changes

- Touch only files required for the task.
- Do not refactor unrelated code.
- Do not reformat unrelated files.
- Match the existing project style.
- Remove only unused code created by your own changes.
- Do not treat draft schema fields as final unless the task explicitly says the schema is finalized.
- **Strictly limit changes to what was requested.** Do not rename variables, extract helper functions, add CSS classes, change indentation, or make any other "cleanup" changes unless they are directly required by the requested feature. Every extra change makes code review harder — the reviewer cannot distinguish intentional changes from accidental ones.

### Goal-Driven Execution

For non-trivial tasks, define success criteria before implementation.

Example:

```text
1. Define Presentation JSON types -> verify TypeScript compiles
2. Render mock deck from JSON -> verify slide preview works
3. Add element selection -> verify selected element appears in property panel
```

## Others

- You can check the progress of your last task by viewing the git commit history.
## Commands

Frontend (run from `frontend/`):

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

Backend (run from `backend/`):

```bash
cd backend
# 激活虚拟环境 (Activate virtual environment)
# Windows PowerShell: .venv\Scripts\Activate.ps1
# Windows CMD: .venv\Scripts\activate.bat
# Linux/macOS: source .venv/bin/activate

uvicorn main:app --reload
pytest
alembic upgrade head
```


## Security

- Never commit API keys, tokens, or secrets.
- Keep `.env` files out of git.
- Use `.env.example` for required environment variables.
- Do not log full user documents or private prompts in production logs.
- Do not store generated files in public paths unless intended.
