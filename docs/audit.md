# Authoring-schema audit

Audited on 2026-09-27 against the local `jsonforms-react-renderers` checkout at
`e931e46c237f371dc283c291746640d653a32190` and its installed JSON Forms core
`3.9.0-alpha.1`. The historical comparison used
`jsonforms-vuetify-webcomponent/packages/example/src/core/jsonschema/specification`.

## Result

The source documents and worked examples were transferred successfully. The
schemas were not a complete description of the implemented inputs: several
known values were accepted without type checking, and serialized rule validation
accepted unsupported function strings. This audit corrects those gaps below.

This is a source and authoring-validation audit, not a live renderer certification.
Unknown extensions and vendor option bags deliberately remain open. The remaining
adapter differences below prevent claiming that every schema-valid setting has
the same behavior in the reference renderer.

## Source reconciliation

- The source checkout HEAD equals `provenance.json`'s recorded commit.
- All 15 recorded SHA-256 document hashes match the source files.
- All 32 source `examples/spec` directories exist in this package's catalog.
- All 156 source JSON assets are present: 143 are structurally identical and 13
  differ. None are missing.
- Twelve changed assets are schema/data/UI-schema triples in categorization,
  object-control, string-controls and tuple-control. They replace domain-specific
  property names consistently. The remaining change is temporal-controls' data
  schema: positional tuple `prefixItems` was converted to draft-07 `items`.
- Every heading from the source consolidated specification remains verbatim
  except its final renderer roadmap. That content was reorganized into
  capability declarations, host contracts and the backlog. Heading preservation
  alone is not proof of semantic equivalence; the reconciliation record also
  documents accordion state, configuration, format, layout and proposal changes.
- Registry and host examples were converted from framework-bound TypeScript to
  standalone `.mjs` hooks where needed. The package tests their imports and the
  UI schemas returned by the object and tuple registries.

The published schemas describe current authoring inputs. `start`/`responsive`
are reserved, and `showRemoveButton` remains unimplemented.
`separateReadonlyFromDisabled` is described without claiming renderer support.

## Coverage reviewed

The implementation review used both Ant Design renderer registries, their cell
registries, the shared extended renderer registry, shared renderer utilities,
and core model/default/mapper/runtime code. These families have corresponding
schema definitions; renderer selection still depends on the bound data schema.

| Implementation family | Authoring coverage |
| --- | --- |
| Core Control, Label, VerticalLayout, HorizontalLayout, Group, Category, Categorization | Common elements, labels, scopes, recursion, rules and layout options |
| Text, multiline, password/OTP, native fallback, numeric/integer/slider, boolean/toggle | Control options and data-schema-driven dispatch; OTP length constraints remain in the data schema |
| Enum, oneOf choices, radio, enum arrays, chips, multiselect | Choice options, variants, suggestions and array behavior |
| Date, time, date-time, file | Display/save formats, views, bounds, restriction and file options |
| Objects, arrays/tables, expandable arrays, ListWithDetail | Details, summaries, labels, sorting, add/remove and validation indicators |
| Mixed, tuple, allOf/anyOf/oneOf and scalar composition | Shared Control vocabulary, detail schemas and confirmation settings |
| Color, cron, duration, mask, null | Extended control options and ordinary schema/registered-format validation |
| Monaco and AG Grid | Extended control options, editor settings and open vendor option bags |
| SplitLayout/splitter, Spacer, ImageView, Separator, Link | Extended element shapes and sizing |
| Button, TemplateLayout, Template, Slot, markup Label | Action/template fields, named composition, markup/security/interpolation settings |
| Base and extended cells | Cell overrides reuse known control-option shapes; registry availability still limits actual cell support |
| Core config | Defaults, read-only settings and version-specific separation setting |

No missing registered element discriminator was found. A renderer such as cron
is a specialized Control, not a separate UI element type. The portable sizing vocabulary uses layout options.

## Corrections made

1. Added [a standalone rule schema](../schemas/jsonforms-rule.schema.json). Both UI
   profiles reference it.
2. Validate nested condition schemas against the standard draft-07 meta-schema.
   Reject incomplete AND/OR/LEAF nodes even when a second condition shape would
   otherwise let them pass. Allow core's empty AND/OR lists.
3. Reject serialized `condition.validate` strings. Core checks for a function;
   it does not compile strings. Function conditions belong to trusted host code.
4. Type `readonly` in options on layout elements.
   Add the core config read-only setting and the separation setting.
5. Type `showSortButtons` for array reordering.
6. Type confirmed flat renderer defaults for array presentation, descriptions
   and choices. The follow-up audit removed global label-path, detail and summary
   declarations: these are per-control inputs with only isolated merged-config
   exceptions.
7. Check `vertical`, `showNavButtons`, and labels on Categorization. Require
   Category or nested Categorization children, as core's model specifies.
8. Apply known control-option shapes inside extended `cells` overrides while
   retaining the stricter cell detail shape.
9. Type flat Monaco/grid defaults and nested Monaco settings. The follow-up
   removed unconsumed namespaced defaults and checked every named config
   property against its consumer. Remove
   unconsumed `rows` declarations: editor rows belong in `monaco.rows`. Remove
   the unconstrained control `filter` declaration: observed `options.filter(...)`
   calls filter arrays of choices; they do not read a UI authoring option.

## Implementation support

Renderer-specific audit findings and the configuration reader inventory are
maintained in the [React gap report](https://github.com/kchobantonov/jsonforms-react-renderers/blob/master/docs/jsonforms-react-antd-implementation-gaps.md).
Schema validation does not certify adapter support. Vendor settings remain open,
and portable proposals remain in [the design backlog](todo.md).

## Assessment of the older schema attempt

The separation of `rule.json`, `uischema.json` and `uischemas.json` was useful.
The standalone rule entry point is retained in the new package's naming scheme.
The old documents should not replace the current schemas:

- `rule.json`'s composite children reference only a loose base condition, so
  malformed nested conditions pass. It lacks `failWhenUndefined` typing and the
  newer READONLY/WRITABLE effects. Its arrow-function regex does not establish
  that the host can or will execute a validation function.
- `uischema.json` restricts Control labels to strings although core also supports
  booleans and label objects. Some branches, including Label and Category, omit
  required fields; the Label branch can admit `{}`. Group unnecessarily requires
  a label. Categorization omits rule/i18n/label and nested categorizations.
  Broadly open options do not check the renderer vocabulary.
- `uischemas.json` does not require `tester` or `uischema`, so `[{}]` passes.
  Its exact function-source regex rejects harmless formatting variants and
  does not validate executable JavaScript. Current core ranked registries use
  functions, not JSON strings. This package keeps those examples in `.mjs`;
  their UI documents are validated separately. A serialized registry needs an
  explicit host conversion contract before publishing a schema for it.
- `schema.json` republishes the draft-07 meta-schema under the standard `$id`.
  The current package correctly uses the validator's standard meta-schema;
  custom keywords/formats belong in the validator integration.

## Validation boundary

Regression cases cover standalone and attached rules, malformed nested schemas,
read-only settings, core config types, categorization, sorting flags, cells and
editor defaults. `pnpm run check` runs them together with all existing fixtures,
reference/link checks, the site build and the packed-consumer check. The tests
use bundled schemas and require neither source checkout nor a network request.


## Documentation ownership

The portable contract lives in [the specification](spec.md). Generic selection
roles are in [renderer selection](renderer-selection.md), and detailed host,
layout, editor, settings and acceptance requirements are in the
[renderer/demo guide](renderer-and-demo.md). TypeScript authoring is documented in
[its language guide](../typescript/README.md).

The original model, consolidated model, adjustments, and container-indicator
proposal were reconciled into these documents, schemas and examples. The detailed
renderer/demo requirements were promoted into the active guide; framework-specific
build tools and source filenames were replaced with neutral responsibilities.
Original source hashes and reconciliation decisions remain in `provenance.json`.
Redundant historical copies and the separate coverage map have been removed.
This reconciliation does not certify that every renderer implements every contract.
