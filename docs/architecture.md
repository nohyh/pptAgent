# Architecture

## Core Rule

Presentation JSON is the single source of truth.

The app should use structured Presentation JSON for rendering, editing, saving, checking, and PPTX export.

Debug data is not product data. Raw AI output, image planning decisions, provider failure reasons, and generation traces may be printed or logged for development, but they must not be stored inside final Presentation JSON.

## Project Flow

```text
User input
-> AI generates PPT outline / per-slide text
-> user edits text and selects style
-> AI classifies each slide type
-> AI selects a matching template
-> AI generates image prompts when needed
-> image model generates assets when needed
-> AI/program fills template slots
-> Presentation JSON
-> check overflow / out-of-bounds / overlap
-> React renders slides
-> user manually edits in the React editor
-> app updates Presentation JSON
-> check again
-> PPTX export
```

This document is only for project-level understanding. Detailed rules for how AI should create PPT content or apply a specific PPT-making style should live in a dedicated skill later.

## Current Focus

The first full generation loop now works. The current architectural priority is V2 persistence: save generated Presentation JSON, reopen it, continue manual editing, and export from the same JSON source of truth.

Active focus:

- store Presentation JSON without changing its shape;
- reopen saved projects into the existing React editor;
- keep manual edits writing back to the same Presentation JSON;
- keep image planning separate from final Presentation JSON;
- keep React preview and PPTX export aligned through the shared JSON model.

Deferred focus:

- Redis/RQ task queues and real progress bars;
- post-generation AI chat editing;
- AI-generated final HTML, PPTX, SVG, or arbitrary page code.
- text overflow/layout safety checks;
- export quality rewrites.

## Rendering and Export

React preview and PptxGenJS export should both read from the same Presentation JSON.

If a value affects rendering or export, it should be represented in Presentation JSON.

## User Edits

User edits are handled by the React editor and should update Presentation JSON directly.

Post-generation AI chat editing is intentionally out of the current product scope. The current priority is template quality, image generation, schema normalization, validation, and export fidelity.

Confirmed edit flow:

```text
user manual edit
-> app updates Presentation JSON
-> app checks overflow / out-of-bounds / overlap
-> React renders updated slides
```

If AI editing is reintroduced later, it must not rewrite final HTML, PPTX, SVG, or arbitrary page code. It should return a schema-checked operation against Presentation JSON, such as JSON Patch, and the app should apply it only after validation.

## AI Role, High Level

AI is used to help generate structured presentation data.

In the current scope, AI may help with:

- generating PPT outline / per-slide text
- classifying slide types
- selecting matching templates
- generating image prompts
- filling template slots
- choosing whether an image should come from stock search or AI image generation

AI should not replace the app's structured data model. The app remains responsible for checking results, rendering slides, supporting manual edits, and exporting PPTX.

## Image Flow

Image generation is a two-step process:

```text
pending image slots
-> image planning
-> provider fulfillment
-> normal image src in Presentation JSON
```

Image planning metadata is temporary orchestration data. The final slide element should contain only the resolved image `src` and normal image fields.

Stock images should use provider-side crop/fit behavior when available so the result fills the template frame without deformation. AI image generation should use the physical slide-adjusted frame ratio, not just raw percentage width/height.
