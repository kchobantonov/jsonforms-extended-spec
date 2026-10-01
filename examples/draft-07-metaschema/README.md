# Draft-07 metaschema

Demo: **Spec: Draft-07 metaschema** (`#spec-draft-07-metaschema`).

`schema.json` is an unmodified copy fetched from https://json-schema.org/draft-07/schema on 2026-10-01. Its canonical `$id` is retained. The example data is a schema for inventory items, not an inventory item. Editing the data therefore authors a JSON Schema document.

The root Control exercises the mixed object/boolean editor. Explore `properties`, `items`, `required`, and arbitrary values such as `default` and `examples`. Recursive schema values must be expanded on demand rather than eagerly generating an infinite form. This is a coverage example, not a claim of complete Draft-07 visual support.

Metaschema validation checks the structure of the authored schema; it does not guarantee that references resolve, regular expressions compile in every implementation, or that the schema admits any valid instance. In particular, `false` is a valid schema with no valid instances.

See [the visual authoring audit](../../docs/draft-07-visual-support.md) for limitations.
