# Architecture

## Core Rule

Presentation JSON is the single source of truth.

The app should use structured Presentation JSON for rendering, editing, saving, checking, and PPTX export.

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
-> user edits
-> AI returns JSON Patch
-> app applies JSON Patch
-> check again
-> PPTX export
```

This document is only for project-level understanding. Detailed rules for how AI should create PPT content or apply a specific PPT-making style should live in a dedicated skill later.

## Rendering and Export

React preview and PptxGenJS export should both read from the same Presentation JSON.

If a value affects rendering or export, it should be represented in Presentation JSON.

## User Edits

For user-requested AI edits, AI should return JSON Patch instead of rewriting the whole JSON.

The application applies the patch and then runs checks again.

Confirmed edit flow:

```text
user edit request
-> AI returns JSON Patch
-> app applies JSON Patch
-> app checks overflow / out-of-bounds / overlap
-> React renders updated slides
```

## AI Role, High Level

AI is used to help generate or modify structured presentation data.

AI may later help with:

- generating PPT outline / per-slide text
- classifying slide types
- selecting matching templates
- generating image prompts
- filling template slots
- returning JSON Patch for user edits

AI should not replace the app's structured data model. The app remains responsible for applying JSON Patch, checking results, rendering slides, and exporting PPTX.
