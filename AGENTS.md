# AGENTS.md

## Project Overview

This project is an AI-powered PPT editor and generator.

High-level product flow is documented in `docs/architecture.md`.

```text
User input -> Presentation JSON -> React editor -> JSON Patch edits -> PPTX export
```

The most important architectural rule:

```text
Presentation JSON is the single source of truth.
```

The app should not let AI directly generate final HTML, PPTX, SVG, or arbitrary page code as the primary product data. AI should generate or modify structured JSON that follows the project schema.

## Current Phase

Current target: V0.

V0 scope:

- Frontend-only PPT editor
- Mock presentation data
- Editable slide canvas
- Element selection
- Right-side property panel
- Style selection
- Simple image crop or fitting controls when practical
- PptxGenJS export
- Define and stabilize Presentation JSON Schema

Hard boundary:

- Do not add backend, database, auth, Redis, RQ, storage services, or real AI calls during V0 unless explicitly requested.
- Do not implement future-phase infrastructure early.
- Keep changes scoped to the current phase.
- Do not write code for future phases unless the user explicitly moves the project to that phase or directly requests that specific future-phase work.
- If a requested implementation would cross the current phase boundary, stop and ask for confirmation before coding.

## Docs Reading Rules

Before coding, read only the docs relevant to the task.

- Product roadmap or phase planning: read `docs/roadmap.md`.
- Overall architecture decisions: read `docs/architecture.md`.
- UI or styling work: read `docs/design.md` if it exists; otherwise follow the Design Direction below.
- Presentation JSON or deck data work: read `docs/schema.md`.

Always follow this `AGENTS.md` first. Detailed docs provide context, but current phase boundaries still apply.

## Architecture Rules

- Keep Presentation JSON as the central data model.
- React preview and PPTX export must both read from the same Presentation JSON.
- For AI edits after user changes, AI should return JSON Patch and the application should apply it.
  - patch format is not finalized yet
  - target only the affected slide or element according to the current schema draft
  - apply the patch in application code after validation
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

### Simplicity First

- Implement the minimum code needed to satisfy the request.
- Do not add speculative features.
- Do not introduce abstractions for single-use code.
- Avoid generic plugin systems, workflow engines, dynamic layout engines, or complex template engines during V0.
- Prefer explicit data structures over clever abstractions while the Presentation JSON Schema is still evolving.
- Do not implement V1/V2/V3/V4/V5 code while the current target is V0 unless explicitly requested.

### Surgical Changes

- Touch only files required for the task.
- Do not refactor unrelated code.
- Do not reformat unrelated files.
- Match the existing project style.
- Remove only unused code created by your own changes.
- Do not treat draft schema fields as final unless the task explicitly says the schema is finalized.

### Goal-Driven Execution

For non-trivial tasks, define success criteria before implementation.

Example:

```text
1. Define Presentation JSON types -> verify TypeScript compiles
2. Render mock deck from JSON -> verify slide preview works
3. Add element selection -> verify selected element appears in property panel
```

## Design Direction

The initial visual style is warm editorial / parchment-inspired.

Before implementing frontend UI, check the project docs for design guidance. If `docs/design.md` exists, follow it as the source of truth for UI color, typography, spacing, component styling, and overall visual direction.

Use:

- Warm paper background
- Serif headings
- Warm neutral text colors
- Terracotta accent
- Subtle borders and ring shadows
- Clean editorial spacing

Avoid:

- Cool blue-gray UI
- Purple or blue AI gradients
- Heavy shadows
- Random decorative blobs
- Overly futuristic styling

Do not use copyrighted brand names, logos, or proprietary fonts directly in the product UI. Use a neutral theme name such as `Warm Editorial`.

## Frontend Guidelines

- Use TypeScript types for all deck, slide, element, theme, and template structures.
- Keep editor state in Zustand.
- Use TanStack Query only for server data once backend exists.
- Keep canvas rendering deterministic and based only on Presentation JSON.
- Avoid hidden layout state that is not stored in JSON.
- Prefer stable element identity once the schema defines it.
- Prefer small, focused components:
  - `SlideCanvas`
  - `SlideThumbnailList`
  - `ElementRenderer`
  - `PropertiesPanel`
  - `ThemePicker`
  - `ExportButton`
- Keep PPT export mapping close to the Presentation JSON schema.

## Commands

Frontend:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Backend, later:

```bash
uvicorn app.main:app --reload
pytest
alembic upgrade head
```

## Testing Instructions

During V0:

- At minimum, run TypeScript build before considering work complete.
- Test PPTX export manually after changes to Presentation JSON or exporter code.
- Add small unit tests for schema helpers and exporter mapping when practical.

Later:

- Add backend API tests with pytest.
- Add schema validation tests for AI output.
- Add exporter tests for common slide layouts.

## Security

- Never commit API keys, tokens, or secrets.
- Keep `.env` files out of git.
- Use `.env.example` for required environment variables.
- Do not log full user documents or private prompts in production logs.
- Do not store generated files in public paths unless intended.

## PR / Commit Guidelines

- Keep changes scoped to the current phase.
- Do not introduce future-phase infrastructure early.
- Mention which phase the change belongs to, for example:
  - `[V0] Add slide canvas`
  - `[V1] Add FastAPI generation endpoint`
  - `[V2] Add presentation persistence`
- Run available lint/build/test commands before committing.
