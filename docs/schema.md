# Presentation JSON Schema Draft

Presentation JSON is the central data contract of the project, but the exact schema is not finalized yet.

During V0, schema design is exploratory. Do not treat the fields below as a final protocol.

The schema needs to eventually support:

- React rendering
- element selection
- property editing
- JSON Patch application
- overflow / out-of-bounds / overlap checks
- PptxGenJS export

## Core Concepts

The schema will likely need concepts for:

- presentation-level metadata, such as title and style
- slides
- slide elements

Slide data will likely need concepts for:

- identity
- layout or template reference
- slide role/type
- elements

Element data will likely need concepts for:

- identity
- type
- content
- position and size
- style when needed

## Element Types

Likely initial V0 types:

- text
- image
- shape

Possible later types:

- table
- chart, if needed

## Required Layout Fields

The exact layout representation is not finalized yet.

One likely option is absolute canvas coordinates:

- x
- y
- width
- height

Whatever representation is chosen, it should be consistent enough for both React rendering and PptxGenJS export.

## Theme Fields

Theme/style data may include the values needed by the current UI and export:

- colors
- fonts
- optional radius or shadow values

## Image Metadata

Image elements may eventually support:

- source url
- crop or fit settings when implemented
- generation prompt later

## Schema Stability

Do not lock schema fields too early.

Once the schema is declared stable, schema changes should update:

- TypeScript types
- mock data
- renderer
- property panel
- exporter
- validators
- docs
