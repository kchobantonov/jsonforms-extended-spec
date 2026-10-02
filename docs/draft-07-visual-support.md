# Draft-07 visual authoring audit

Audited 2026-10-01 against the Antd and shadcn renderer sources. This is an
implementation assessment, not a portable conformance guarantee for every renderer.

Sources: [official metaschema](https://json-schema.org/draft-07/schema),
[validation vocabulary](https://json-schema.org/draft-07/draft-handrews-json-schema-validation-01),
and [core vocabulary](https://json-schema.org/draft-07/draft-handrews-json-schema-01).

## Conclusion

The renderers cannot yet promise complete visual authoring for every Draft-07
schema. Many common structures have dedicated editors, and unconstrained values
have a mixed-type editor. Validation support does not establish that every legal
structure can be reached through the form. No renderer can create a valid instance
of an unsatisfiable schema, including the boolean schema `false`.

## Editing coverage

| Feature | Current assessment |
| --- | --- |
| string, number, integer, boolean | Dedicated controls exist in both renderers. |
| null, type arrays, omitted type, unconstrained values | Shared mixed-type selection and editors exist. Not a proof for arbitrary combinations of keywords. |
| properties and nested objects | Generated or explicit detail layouts, including static and dynamic fields together. |
| additionalProperties and propertyNames | Add, rename, delete, value editing and name validation exist. Literal and empty keys have dedicated handling. |
| patternProperties | Both AdditionalProperties implementations now use the shared resolver, combining all matching patterns through allOf. A shadcn regression test verifies fields contributed by two overlapping object patterns. Arbitrary compositions remain subject to the limitations below. |
| homogeneous items | Array editing exists, including object details and scalar collections. |
| tuple items and additionalItems | Dedicated tuple/tail editors exist. Position semantics constrain deletion; this is not an ordinary reorderable array. |
| enum and const | Scalar enum and titled constant choices exist. Shadcn dropdowns, radio groups, and enum cells now use structural equality for object/array values reloaded from JSON, with regression coverage. Composite enum support across other renderer families remains uncertified. |
| allOf, anyOf, oneOf | Dedicated composition renderers exist, but coverage is partial. Shared schemaForType drops these keywords while constructing typed editor schemas. Whole-document validation can still reject data; the delegated editor may omit applicable structure. |
| if / then / else | No general branch-aware layout generation found in the audited renderers. Branches that introduce fields need explicit layout/renderer support; they cannot be dismissed as validation-only. |
| dependencies | Property dependency checks alone are validation. Schema dependencies that introduce fields have the same authoring concern as conditional schemas. |
| $ref, $id, definitions | Local reference resolution is used. Arbitrary remote retrieval, URI scope combinations and recursive editing are not certified. Hosts must supply resolvable schemas; browser fetching is not a renderer guarantee. |
| recursive schemas | The official metaschema mounts in both renderers. Deeper recursive branch creation and all editing transitions remain unverified. A shadcn mount reports a non-self-contained combinator subschema for AJV. |
| title, description | Used as labels/help; UI schema and translations may override presentation. |
| default, examples | Defaults are used in some creation paths. These annotations do not promise universal initialization or example-selection controls. |
| readOnly, writeOnly | Read-only behavior and password controls exist. writeOnly is not a universal security or masking guarantee; presentation may need explicit options. |
| format | Some formats have specialized controls; others use text entry. Lack of a special picker is not itself an authoring gap. |
| contentEncoding, contentMediaType | File/encoded-content controls exist for supported cases; arbitrary media does not have a universal visual editor. |

Evidence paths in the renderer repository: `jsonforms-react-renderer-common/src/mixed.ts`
(`schemaForType`, `isMixedSchema`), `mixedTree.ts`, both renderer registries and
Object/AdditionalProperties/Tuple/AllOf/AnyOf/OneOf implementations, and shadcn
`controls/EnumControl.tsx`. Paths are relative to `packages/`.

## Validation-only exclusions

Bounds (`minimum`, `maximum`, exclusive bounds, `multipleOf`), string length and
pattern, item/property counts, uniqueness, required names and property dependencies
need not have separate editors. Existing controls plus correctly located validation
feedback are sufficient. `not` and `contains` are not expected to have dedicated
widgets; an editor must still expose the underlying value shape. This audit does
not certify every error-placement combination or validator plugin.

## Metaschema example and verification

[Draft-07 metaschema](../examples/draft-07-metaschema/README.md) uses the exact
upstream document as its schema. Its data is a sample inventory JSON Schema.
The metaschema's `type: ["object", "boolean"]`, recursive references, arbitrary
`default`/`const` values, schema maps and composition arrays exercise multiple
editing paths without altering the source schema to hide limitations.

Verified: catalog/schema validation, and initial React DOM mounting with the
sample data in both Antd and shadcn without a missing-renderer fallback.
Not verified: every nested interaction, visual browser layout, external references,
or that every valid schema document can be authored from an empty value.
A schema document passing metaschema validation can still have unresolved refs or
be unsatisfiable. Validate the authored schema with the intended validator before
using it to validate instances.

Priority follow-up: conditional/schema-dependency field discovery;
composition-preserving mixed delegation;
recursive editing tests; composite enum parity across renderer families.
