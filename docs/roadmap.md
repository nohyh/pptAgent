# Roadmap

This project should progress in phases. Current phase boundaries should be respected.

## V0: Frontend-Only PPT Editor

Goal: build a polished frontend demo without backend or real AI.

Scope:

- React + Vite + TypeScript frontend
- Tailwind CSS + shadcn/ui
- Zustand editor state
- mock Presentation JSON
- slide thumbnail list
- editable slide canvas
- element selection
- right-side property panel
- theme/style selection
- simple image fit/crop controls when practical
- PptxGenJS export
- stabilize Presentation JSON Schema

Do not add:

- backend
- database
- auth
- Redis/RQ
- real AI calls
- object storage

## V1: FastAPI + Single Model Generation

Goal: generate Presentation JSON from user input.

Scope:

- FastAPI backend
- Pydantic models
- one OpenAI-compatible text model
- endpoint to generate PPT JSON

No database yet.

## V2: Persistence

Goal: make generated decks saveable and reopenable.

Scope:

- PostgreSQL
- SQLAlchemy 2.0
- Alembic
- save projects
- read projects

## V3: Images, Templates, and Normalization

Goal: improve visual quality and reliability through better templates, controlled image generation, and stricter Presentation JSON normalization.

Scope:

- template library expansion
- template metadata and slot rules
- image prompt generation
- image generation
- image regeneration
- Presentation JSON schema normalization
- preview/export consistency checks
- layout safety checks

Do not add:

- post-generation AI chat editing
- element-level AI editing
- JSON Patch edit flows

## V4: Productization

Goal: make the product easier to use beyond the prototype flow.

Scope:

- project management polish
- import/export workflow polish
- template selection and management polish
- user-facing error states
- basic product analytics if needed

## V5: Lightweight Model Router

Goal: add lightweight Model Router and model call logs.

Scope:

- lightweight model router
- model request logging

## V6: Async Tasks and Progress

Goal: add Redis, RQ, task status, and generation progress.

Scope:

- Redis
- RQ
- task status
- generation progress
