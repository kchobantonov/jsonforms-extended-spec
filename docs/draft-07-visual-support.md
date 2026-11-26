# Draft-07 visual authoring checklist

JSON Schema validation and visual authoring are separate capabilities. A
renderer may validate a document that its controls cannot create or edit.
Each renderer project should publish a capability table and executed tests for
the Draft-07 features it supports. No renderer can create a valid instance of
an unsatisfiable schema, including the boolean schema `false`.

## Editing cases to verify

| Feature | Acceptance question |
| --- | --- |
| Scalars, null, type arrays, omitted type | Can the user reach every applicable JSON type, including null and unconstrained values? |
| Properties and nested objects | Do generated and explicit details expose static and dynamic fields together? |
| additionalProperties, propertyNames, patternProperties | Can users add, rename, delete and edit literal keys, including empty keys? Do all matching patterns constrain a property? |
| Homogeneous and tuple arrays | Can users edit items while preserving tuple positions and additionalItems semantics? |
| enum and const | Do choices preserve object/array values and JSON types after reload? |
| allOf, anyOf, oneOf | Does the editor preserve composition, expose applicable branches and retain document validation? |
| if / then / else and dependencies | Does field discovery follow the active condition without rewriting the validator schema? |
| $ref, $id, definitions and recursion | Are local references resolved in scope, and are recursive children created one at a time? |
| readOnly, writeOnly, formats and content keywords | Are supported presentation, editing and security effects documented separately? |

Bounds, length, pattern, counts, uniqueness, required names and dependencies
may use ordinary editors with correctly located validation feedback. `not` and
`contains` need not have dedicated widgets, but the underlying value shape
must remain editable where the schema permits it. Arbitrary remote reference
retrieval is a host capability, not an implicit renderer guarantee.

## Metaschema example

[Draft-07 metaschema](../examples/draft-07-metaschema/README.md) uses the upstream
document as its schema and a sample inventory JSON Schema as data. Its type
array, recursive references, arbitrary default/const values, schema maps and
composition arrays exercise multiple editing paths. Rendering the sample
without a missing-renderer fallback is only an initial check. Test nested
interactions, editing from an empty value, browser layout, and reference scope
separately. A schema document can pass metaschema validation while containing
unresolved references or an unsatisfiable combination.

For normative semantics, see [the specification](spec.md),
[implementation guidance](implementation-guide.md), and
[pitfalls](implementation-pitfalls.md). Renderer projects record their own
support and executed evidence.
