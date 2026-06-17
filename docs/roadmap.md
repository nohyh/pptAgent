# Roadmap

This roadmap reflects the current project state after the first complete PPT generation loop succeeded.

Current practical phase:

```text
V2 persistence
```

Original V2 to V6 phases are still valid, but the recommended order is adjusted:

```text
V2 -> V5 -> V4 -> V6
```

Reason: the app can now generate a usable PPT with working image fulfillment and acceptable export quality. V1.5 and the first V3 pass are sufficient for starting persistence. Remaining template polish and product details can continue incrementally.

## Phase Status

| Phase | Status | Main Problem Solved | Relative Size |
| --- | --- | --- | --- |
| V0 Frontend-only editor | Mostly done | Build a local editable PPT preview and export demo | Done |
| V1 FastAPI generation | Mostly done | Generate Presentation JSON from user input | Done |
| V1.5 Stabilization | Mostly done | Make the existing main loop reliable and diagnosable | Medium |
| V3 Images, templates, normalization | First pass mostly done | Make generated PPTs visually useful and structurally stable | Large |
| V2 Persistence | Active next | Save and reopen generated decks | Large |
| V5 Lightweight model logs/router | Later | Make AI/provider failures traceable | Medium |
| V4 Productization | Later | Improve user-facing workflow and errors | Medium/Large |
| V6 Async tasks and progress | Deferred | Real progress bar, task status, queueing, retry/cancel | Very large |

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

Current note:

- The frontend preview and PPTX export both read from Presentation JSON.
- Keep this rule. Do not add a separate HTML/PPTX/SVG generation source of truth.

## V1: FastAPI + Single Model Generation

Goal: generate Presentation JSON from user input.

Scope:

- FastAPI backend
- Pydantic models
- one OpenAI-compatible text model
- endpoint to generate PPT JSON
- outline generation
- PPT content generation
- template hydration

Current note:

- The main loop has run end to end.
- V1 should now be treated as mostly complete, with remaining work moved into V1.5 stabilization.
- No database yet.

## V1.5: Generation Stabilization

Goal: make the current end-to-end generation loop reliable enough to tune and demo repeatedly.

Scope:

- development-only raw AI output tracing
- clearer 422 failure causes
- image fulfillment fallback behavior
- final Presentation JSON cleanliness
- basic smoke checks for generated decks

Checklist:

- Keep `[OUTLINE_AI]` logging for raw outline output in development.
- Keep `[PPT_AI]` logging for raw PPT content output in development.
- Keep `[IMAGE_PLAN]` logging for each image slot decision.
- Standardize log prefixes so failures can be searched quickly.
- Do not save raw AI output, image plan data, or debug traces into final Presentation JSON.
- Keep prompt length limits and template contracts as the primary guard against text overflow.
- Allow stock image fallback to AI image generation.
- Allow AI image generation fallback to stock image search.
- Clarify whether `pageCount - 1` is intentionally reserving a thanks page.
- Keep routes thin and keep orchestration in services.
- Keep provider calls in `app/ai/client.py` and `app/images/providers.py`.

Do not add yet:

- Redis/RQ queue
- user accounts
- production analytics
- post-generation AI chat editing
- template linter/checker work
- text overflow checks
- layout safety checks
- export rewrites

## V2: Persistence

Goal: make generated decks saveable and reopenable.

Problem solved:

- A generated PPT should not disappear after refresh.
- The user should be able to open previous projects and continue editing.
- Future progress/task/history features need stable project IDs.

Scope:

- PostgreSQL
- SQLAlchemy 2.0
- Alembic
- project model
- save project
- read project
- update project
- list projects

Suggested minimum version:

- Store Presentation JSON as the project source of truth.
- Save generated and manually edited decks.
- Reopen a saved deck in the editor.
- Keep auth out of scope unless explicitly requested.
- Keep version history out of scope for the first persistence pass.

Recommended timing:

- Do this now.
- Persistence should save stable Presentation JSON, not unstable intermediate generation artifacts.

## V3: Images, Templates, and Normalization

Goal: improve visual quality and reliability through better templates, controlled image generation, and stricter Presentation JSON normalization.

Problem solved:

- Generated PPTs should look like designed decks, not random filled rectangles.
- Images should match the template frame without deformation.
- Placeholder images should be rare.
- Template quality is controlled through curated templates and prompt length limits.

Scope:

- template library expansion
- template metadata and slot rules
- image prompt generation
- stock image search
- AI image generation
- image fallback rules
- Presentation JSON schema normalization

Checklist:

- Treat `minimalist` as the current proven template family.
- Fix or hide template families with no AI-fillable slots.
- Require empty `content` slots to have `description` and `recommendlength`.
- Require editable numeric slots to have `description` and `recommendlength`.
- Keep thanks/fixed tail slides out of AI fill requests.
- Ensure image placeholders use the agreed pending image marker.
- Keep Pexels `orientation` as a rough search filter.
- Keep Pexels CDN crop parameters for exact frame fit.
- Use physical slide-adjusted dimensions when resolving image aspect ratio.
- Allow fallback between stock and AI image providers before using placeholder.
- Keep image planning metadata out of saved Presentation JSON.
- Add basic no-pending-image validation before returning the final deck.
- Produce at least two usable template sets before considering this phase complete.

Do not add:

- post-generation AI chat editing
- element-level AI editing
- JSON Patch edit flows
- template linter/checker work unless explicitly requested
- text overflow checks
- layout safety checks
- export quality rewrites

## V4: Productization

Goal: make the product easier to use beyond the prototype flow.

Problem solved:

- Users should understand generation failures.
- Users should be able to recover from errors without starting over.
- Template selection, image handling, and export should feel deliberate.

Scope:

- project management polish
- import/export workflow polish
- template selection and management polish
- user-facing error states
- editor empty/loading/error states
- basic image replacement workflow
- export success/failure feedback
- basic product analytics if needed

Suggested order:

- First improve error states around generation.
- Then improve template selection so only usable templates are selectable.
- Then improve manual editing and export polish.
- Add analytics only if there is a clear product question to answer.

## V5: Lightweight Model Router and Logs

Goal: add lightweight model configuration and model/provider call logs.

Problem solved:

- It should be clear which stage failed: outline, PPT content, image plan, AI image, stock image, hydration, validation, or export.
- Prompt tuning needs structured samples and timings.
- Model switching should not require editing scattered files.

Scope:

- lightweight model config
- model request logging
- provider call logging
- request ID propagation
- stage-level timing
- prompt version labels
- development diagnostics

Suggested minimum version:

- Add one request ID per generation.
- Log stage name, model/provider, duration, success/failure, and concise failure reason.
- Keep full raw AI output available in development logs only.
- Do not log full private user documents or private prompts in production.
- Do not store logs in Presentation JSON.

Recommended timing:

- Do after the first V2 persistence pass, unless debugging needs become more urgent.
- V6 progress reporting will be easier if each stage already has a name and timing.

## V6: Async Tasks and Progress

Goal: add background task execution, task status, and real generation progress.

Problem solved:

- PPT generation is a long-running task.
- The frontend should not wait on one blocking HTTP request.
- Users need real progress, failure stage, retry/cancel, and refresh recovery.

Scope:

- Redis or equivalent queue backend
- RQ or equivalent worker
- task creation endpoint
- task status endpoint
- task result endpoint
- generation progress stages
- timeout handling
- retry/cancel behavior
- stale task cleanup

Suggested stages:

- queued
- outline_generating
- ppt_generating
- template_hydrating
- image_planning
- image_fulfilling
- validating
- completed
- failed

Recommended timing:

- Do this after V1.5, V3 core reliability, and V5 logging.
- Real progress needs reliable stage boundaries; otherwise it only makes failures more visible without improving them.

## Current Recommended Work Order

1. V2: add persistence for saving, reopening, updating, and listing projects.
2. V3 maintenance: keep improving templates manually and expose only usable template families.
3. V5: add lightweight request/stage logs and model config.
4. V4: improve user-facing states and export/editor polish incrementally.
5. V6: add async jobs and real progress after stages are reliable.
