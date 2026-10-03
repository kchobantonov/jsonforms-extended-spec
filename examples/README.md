# Specification examples

These 47 example groups share the portable [specification](../docs/spec.md). Each
folder contains authored JSON, English/Bulgarian translations and a walkthrough.
The [catalog](catalog.json) lists files and required host capabilities.

| Example | Primary spec section |
| --- | --- |
| [Additional errors: server and editor](additional-errors/README.md) | [15.6](../docs/spec.md#156-renderer-published-additional-errors) |
| [Additional items pagination: shipping](additional-items-pagination/README.md) | [18.21.1](../docs/spec.md#18211-collection-pagination-and-whole-row-details) |
| [Additional properties](additional-properties/README.md) | [18.16](../docs/spec.md#1816-object-controls-and-dynamic-properties) |
| [AG Grid: portable options and native overrides](ag-grid/README.md) | [18.18.1](../docs/spec.md#18181-data-grid-array-control) |
| [Array choices and tokens](array-choices/README.md) | [18.29](../docs/spec.md#1829-array-choices-and-tokens) |
| [Array controls](array-controls/README.md) | [18.21](../docs/spec.md#1821-expandable-arrays-and-list-with-detail) |
| [Array detail modes: generated and registered](array-detail-modes/README.md) | [18.6](../docs/spec.md#186-shared-detail-ui-schema-selection) |
| [Boolean controls](boolean-controls/README.md) | [18.19](../docs/spec.md#1819-scalar-controls-and-temporal-editing) |
| [Button actions](button-actions/README.md) | [14](../docs/spec.md#14-button-actions-and-script) |
| [Categorization: tabs, stepper, accordion](categorization/README.md) | [8.6](../docs/spec.md#86-categorization) |
| [Choice controls](choice-controls/README.md) | [18.5](../docs/spec.md#185-choice-and-suggested-string-controls) |
| [Code editor](code-editor/README.md) | [18.26](../docs/spec.md#1826-code-editor-profile) |
| [Collection pagination: recruitment](collection-pagination/README.md) | [18.21.1](../docs/spec.md#18211-collection-pagination-and-whole-row-details) |
| [Color control](color-control/README.md) | [18.27](../docs/spec.md#1827-file-and-color-profile-details) |
| [Combinators and schema conditions](combinators/README.md) | [18.15](../docs/spec.md#1815-combinator-controls) |
| [Conditional fields: generated and authored layouts](conditional-fields/README.md) | [Appendix A](../docs/spec.md#conditional-fields) |
| [Container validation indicator](container-validation-indicator/README.md) | [8.3](../docs/spec.md#83-the-container-validation-indicator) |
| [Cron control](cron-control/README.md) | [18.25](../docs/spec.md#1825-cron-control) |
| [Destructive-change confirmation](destructive-confirmation/README.md) | [14.3](../docs/spec.md#143-shared-destructive-change-confirmation) |
| [Draft-07 metaschema](draft-07-metaschema/README.md) | [29](../docs/spec.md#29-json-schema-artifacts-and-validation-boundary) |
| [Editor details: objects, mixed types, and cells](editor-details/README.md) | [18.6](../docs/spec.md#186-shared-detail-ui-schema-selection) |
| [File control](file-control/README.md) | [18.18.4](../docs/spec.md#18184-file-control) |
| [Group layout](group-layout/README.md) | [8.1](../docs/spec.md#81-group) |
| [JSON editor: any JSON type](json-editor/README.md) | [18.20](../docs/spec.md#1820-mixed-value-controls-and-navigation) |
| [JSON inference: paste data without a schema](json-inference/README.md) | [18.20](../docs/spec.md#1820-mixed-value-controls-and-navigation) |
| [Kitchen sink: job application](kitchen-sink/README.md) | [24](../docs/spec.md#24-examples-requirement) |
| [Label interpolation](label-interpolation/README.md) | [9](../docs/spec.md#9-internationalizable-text) |
| [Layout sizing](layout-sizing/README.md) | [6](../docs/spec.md#6-layout-types-and-sizing) |
| [Markup labels](markup-label/README.md) | [10](../docs/spec.md#10-markdown-policy) |
| [Mixed control](mixed-control/README.md) | [18.20](../docs/spec.md#1820-mixed-value-controls-and-navigation) |
| [Null control](null-control/README.md) | [18](../docs/spec.md#18-renderer-behaviour-specifications) |
| [Numeric controls: numbers and integers](numeric-controls/README.md) | [18.19](../docs/spec.md#1819-scalar-controls-and-temporal-editing) |
| [Object control](object-control/README.md) | [18.16](../docs/spec.md#1816-object-controls-and-dynamic-properties) |
| [Password control](password-control/README.md) | [18.24](../docs/spec.md#1824-one-time-password-presentation) |
| [Pre-touch error filtering](pre-touch-errors/README.md) | [15.7](../docs/spec.md#157-pre-touch-error-filtering) |
| [Presentation elements](presentation/README.md) | [13](../docs/spec.md#13-imageview-separator-link-and-templates) |
| [Property pagination: booking](property-pagination/README.md) | [18.21.1](../docs/spec.md#18211-collection-pagination-and-whole-row-details) |
| [Recursive tree: files and folders](recursive-tree/README.md) | [Appendix A](../docs/spec.md#recursive-node-tree-presentation) |
| [Split layout](split-layout/README.md) | [7.3](../docs/spec.md#73-splitter) |
| [String controls](string-controls/README.md) | [18.18.6](../docs/spec.md#18186-masked-string-control) |
| [Table row details: recruitment](table-row-details/README.md) | [18.21.1](../docs/spec.md#18211-collection-pagination-and-whole-row-details) |
| [Template layout: string and native profiles](template-layout/README.md) | [13.5](../docs/spec.md#135-templatelayout) |
| [Templates and slots: named UI schema reuse](template-slots/README.md) | [13.4](../docs/spec.md#134-template-and-slot) |
| [Temporal controls](temporal-controls/README.md) | [18.19](../docs/spec.md#1819-scalar-controls-and-temporal-editing) |
| [Tree: maximum five levels](tree-max-depth/README.md) | [Appendix A](../docs/spec.md#finite-tree-depth) |
| [Tuple control](tuple-control/README.md) | [18.11](../docs/spec.md#1811-tuple-control-positional-array-fields) |
| [Validator profile (Ajv)](validator-profile/README.md) | [15.9](../docs/spec.md#159-data-schemas-rules-and-validator-profile) |

## Loading and validation

Pass `schema.json`, `uischema.json` and `data.json` to the form host. Apply
`config.json` and `translations.json` where present. Create a translator for the
active locale and rebuild it when that locale changes. Register optional detail
UI schemas separately; a JSON editor cannot preserve function-valued testers.

Two examples export trusted tester functions in `uischemas.mjs`. Button and
template examples offer optional native hooks in `host.mjs`. String template
engines and script evaluation are separate capabilities and permissions.

Invalid initial data demonstrates validation and preservation. The portable
package checks schema/UI/config authoring; the renderer adapter suite checks
interaction and business-data validation with its chosen validator profile.
The [negative authoring cases](../conformance/expected-invalid.json) are explicit.
The static site displays documentation and assets; it never executes the examples.

## Consuming the catalog

`@chobantonov/jsonforms-extended-spec/examples` exports every catalog entry with
its JSON assets and optional UI-schema registry. `pnpm generate:examples` rebuilds
that module, and test/build/pack run generation automatically. Consumers add the
`spec-` ID prefix at registration; no framework-specific per-example list is needed.

English example titles should begin with the feature named by the stable example ID. Add a domain or further explanation after a colon when useful. IDs remain stable when titles are clarified.

## Generic JSON and inferred forms

- [JSON editor: any JSON type](json-editor/README.md) starts without data and uses an explicit `{}` schema.
- [JSON inference: paste data without a schema](json-inference/README.md) omits schema and data; apply JSON in the Data editor to generate a form.

Catalog assets are optional. Preserve omitted schema/data rather than replacing them with `{}`/`null`; those values have different meanings.

- [Array detail modes](array-detail-modes/README.md): default, generated, registered, fallback, and inline layouts.

- [Editor details](editor-details/README.md): object generation, per-type mixed layouts, and registered cell editors.

- [Templates and slots](template-slots/README.md): named registry lookup, fallback and nested overrides.

## Conditional fields

See [conditional field presentation and graphical authoring](../docs/conditional-fields.md).
Use `options.conditionalFields: true` on an object Control or the default
`config.jsonformsExtended.conditionalFields`. Local false opts out.
