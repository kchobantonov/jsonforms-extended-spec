# Authoring schemas

These schemas describe the implemented authoring subset of [SPEC.md](../SPEC.md),
using the reference renderer implementation as evidence. Provisional and
unimplemented features belong in [TODO.md](../TODO.md), not schema definitions.
They use draft-07 and preserve unknown options and namespaces. Core configuration
settings are also described even when a renderer does not implement their
presentation behavior; their descriptions state that boundary.

| File | Input |
| --- | --- |
| [jsonforms-uischema.schema.json](jsonforms-uischema.schema.json) | Common UI vocabulary |
| [jsonforms-extended-uischema.schema.json](jsonforms-extended-uischema.schema.json) | Implemented extended UI vocabulary |
| [jsonforms-config.schema.json](jsonforms-config.schema.json) | Common configuration |
| [jsonforms-extended-config.schema.json](jsonforms-extended-config.schema.json) | Extended configuration |
| [jsonforms-rule.schema.json](jsonforms-rule.schema.json) | Standalone serialized rule, also referenced by both UI profiles |
| [example.schema.json](example.schema.json) | Example catalog entries |

Register every file by its `$id` before compiling a profile. All `$ref` targets
are bundled, apart from the standard draft-07 meta-schema supplied by validators.
No remote lookup is needed. Use `allErrors: true` for useful authoring feedback;
leave `useDefaults`, coercion and removal of additional properties disabled.

The common UI profile restricts element types to its vocabulary. The extended
profile accepts unknown types for downstream registries while validating all
known elements recursively. Known option types are checked; unknown options are
retained, so spelling checks beyond the declared vocabulary belong in a linter.

Data-schema documents use the standard JSON Schema meta-schema supplied by Ajv.
This package does not publish a copy or an extended replacement. Custom keyword
validation and runtime behavior belong to the chosen validator integration.

Scope resolution, named-child lookup, CSS parsing, expressions, permission
checks and renderer interactions require semantic tests. See the separate
[behavior vectors](../conformance/behavior.json). Deliberate authoring failures in
examples are listed in [expected-invalid.json](../conformance/expected-invalid.json).

`$dynamic` has no schema definition or current conformance vectors. Reserved
layout hints and unimplemented options are likewise omitted. Unknown extension
keys remain permitted for interoperability; this is not validation of their
shape or a promise of support. `dynamicValues.enabled` remains because Label
interpolation already uses it to gate access to data namespaces.

## Standalone rules and runtime registries

Validate a rule JSON document directly with `jsonforms-rule.schema.json`, for
example:

```json
{
  "effect": "SHOW",
  "condition": { "scope": "#/properties/enabled", "schema": { "const": true } }
}
```

Both UI profiles reference this same schema. The old common-profile
`#/$defs/rule` and `#/$defs/condition` references remain available as aliases.
Nested AND/OR conditions are checked recursively, including embedded draft-07
schemas. Empty AND and OR lists are valid core conditions (true and false,
respectively). READONLY and WRITABLE reflect the audited core 3.9.0-alpha.1;
hosts using an older core must check effect support.

Core's `validate` condition requires a JavaScript function. A string containing
function source is not a portable JSON rule and is rejected. Likewise, ranked
`uischemas` registry testers are functions; the worked registries use trusted
`.mjs` modules. A JSON registry containing tester strings needs a separately
specified host adapter; the old function-source regex is not such an adapter.

Known options inside cell overrides are checked as control options. This checks
their shape, not whether every renderer is available as a cell. Monaco and grid
vendor option bags remain open. See [the audit](../AUDIT.md#complete-configuration-property-review)
for every config property and its actual consumer. Global declarations are limited
to traced config paths. Keep field-dependent `elementLabelProp`, `childLabelProp`,
`detail`, `summary` and `cells` on their controls; isolated merged-config readers
do not establish a common global default.
