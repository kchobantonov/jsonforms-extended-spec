# Specification examples

These 32 example groups share the portable [specification](../SPEC.md). Each
folder contains authored JSON, English/Bulgarian translations and a walkthrough.
The [catalog](catalog.json) lists files and required host capabilities.

| Example | Primary spec section |
| --- | --- |
| [Additional errors: server and editor](additional-errors/README.md) | [15.6](../SPEC.md#156-renderer-published-additional-errors) |
| [Additional properties](additional-properties/README.md) | [18.16](../SPEC.md#1816-object-controls-and-dynamic-properties) |
| [Array choices and tokens](array-choices/README.md) | [18.29](../SPEC.md#1829-array-choices-and-tokens) |
| [Array controls](array-controls/README.md) | [18.21](../SPEC.md#1821-expandable-arrays-and-list-with-detail) |
| [Boolean controls](boolean-controls/README.md) | [18.19](../SPEC.md#1819-scalar-controls-and-temporal-editing) |
| [Button actions](button-actions/README.md) | [14](../SPEC.md#14-button-actions-and-script) |
| [Categorization: tabs, stepper, accordion](categorization/README.md) | [8.6](../SPEC.md#86-categorization) |
| [Choice controls](choice-controls/README.md) | [18.5](../SPEC.md#185-choice-and-suggested-string-controls) |
| [Code editor](code-editor/README.md) | [18.26](../SPEC.md#1826-code-editor-profile) |
| [Color control](color-control/README.md) | [18.27](../SPEC.md#1827-file-and-color-profile-details) |
| [Combinators and schema conditions](combinators/README.md) | [18.15](../SPEC.md#1815-combinator-controls) |
| [Container validation indicator](container-validation-indicator/README.md) | [8.3](../SPEC.md#83-the-container-validation-indicator) |
| [Cron control](cron-control/README.md) | [18.25](../SPEC.md#1825-cron-control) |
| [Destructive-change confirmation](destructive-confirmation/README.md) | [14.3](../SPEC.md#143-shared-destructive-change-confirmation) |
| [File control](file-control/README.md) | [18.18.4](../SPEC.md#18184-file-control) |
| [Group layout](group-layout/README.md) | [8.1](../SPEC.md#81-group) |
| [Label interpolation](label-interpolation/README.md) | [9](../SPEC.md#9-internationalizable-text) |
| [Layout sizing](layout-sizing/README.md) | [6](../SPEC.md#6-layout-types-and-sizing) |
| [Markup labels](markup-label/README.md) | [10](../SPEC.md#10-markdown-policy) |
| [Mixed control](mixed-control/README.md) | [18.20](../SPEC.md#1820-mixed-value-controls-and-navigation) |
| [Null control](null-control/README.md) | [18](../SPEC.md#18-renderer-behaviour-specifications) |
| [Number and integer controls](numeric-controls/README.md) | [18.19](../SPEC.md#1819-scalar-controls-and-temporal-editing) |
| [Object control](object-control/README.md) | [18.16](../SPEC.md#1816-object-controls-and-dynamic-properties) |
| [Password control](password-control/README.md) | [18.24](../SPEC.md#1824-one-time-password-presentation) |
| [Pre-touch error filtering](pre-touch-errors/README.md) | [15.7](../SPEC.md#157-pre-touch-error-filtering) |
| [Presentation elements](presentation/README.md) | [13](../SPEC.md#13-imageview-separator-link-and-templates) |
| [Split layout](split-layout/README.md) | [7.3](../SPEC.md#73-splitter) |
| [String controls](string-controls/README.md) | [18.18.6](../SPEC.md#18186-masked-string-control) |
| [Template layout: string and native profiles](template-layout/README.md) | [13.5](../SPEC.md#135-templatelayout) |
| [Temporal controls](temporal-controls/README.md) | [18.19](../SPEC.md#1819-scalar-controls-and-temporal-editing) |
| [Tuple control](tuple-control/README.md) | [18.11](../SPEC.md#1811-tuple-control-positional-array-fields) |
| [Validator profile (Ajv)](validator-profile/README.md) | [15.9](../SPEC.md#159-data-schemas-rules-and-validator-profile) |

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
