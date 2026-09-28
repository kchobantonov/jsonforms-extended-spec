# Migration and authoring-schema audit

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

## Migration evidence

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

The source schema properties omitted during migration mostly have recorded
reasons: `start`/`responsive` are reserved, `trim` sizing is excluded, generic
`saveFormat` was replaced by format-specific names, and `gridHeight`/`gridWidth`
are obsolete spellings. `map` accesses in choice renderers are JavaScript array
methods, not an authoring option. `showRemoveButton` remains unimplemented.
Core's legacy `config.trim` and `separateReadonlyFromDisabled` are now described
explicitly without claiming renderer support.

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
| Core config | Defaults, read-only aliases and version-specific separation setting |

No missing registered element discriminator was found. A renderer such as cron
is a specialized Control, not a separate UI element type. Legacy `columns`
layout code is still exported upstream but is no longer registered; it does not
justify restoring the replaced sizing vocabulary.

## Corrections made

1. Added [a standalone rule schema](schemas/jsonforms-rule.schema.json). Both UI
   profiles reference it; old common-profile definition references remain aliases.
2. Validate nested condition schemas against the standard draft-07 meta-schema.
   Reject incomplete AND/OR/LEAF nodes even when a second condition shape would
   otherwise let them pass. Allow core's empty AND/OR lists.
3. Reject serialized `condition.validate` strings. Core checks for a function;
   it does not compile strings. Function conditions belong to trusted host code.
4. Type `readOnly` as well as `readonly`, including options on layout elements.
   Add the core config aliases, the separation setting, and annotated legacy trim.
5. Type the implemented `showArrayTableSortButtons` and
   `showArrayLayoutSortButtons` compatibility flags. Their runtime OR with
   `showSortButtons` is documented; false does not negate another true flag.
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

## Remaining implementation differences

| Finding | Evidence and consequence |
| --- | --- |
| Config namespace consumption is uneven | The follow-up audit removed unconsumed namespace declarations. Published config paths now identify actual readers. Namespaced equivalents remain a possible adapter change, not a current feature. |
| Core read-only support exceeds adapter verification | Core `mappers/util.ts` and `mappers/cell.ts` use `separateReadonlyFromDisabled`. Several renderer paths rely on enabled state; mutation guards and presentation need adapter tests before enabling separation throughout a form. |
| Restrict resolution differs by control | Core seeds flat `restrict: false`. Array/property controls read flat merged settings; temporal `effectiveRestrict` ignores the flat key and resolves local options, then `jsonformsExtended.restrict`, then true. Both actual inputs are documented. The portable uniform contract still requires host/adapter work. |
| Vendor settings are intentionally open | Monaco's `options` and AG Grid's option bag are third-party APIs, not a complete portable schema vocabulary. This audit does not certify each vendor property or callback. |
| Unknown options remain accepted | `additionalProperties: true` preserves extension interoperability. Passing validation does not prove a misspelled or unrecognized option works. |
| Dynamic overlays and pending integration remain incomplete | See [TODO.md](TODO.md); retained design text is not evidence of current implementation. |

No source renderer implementation was changed by this audit. These runtime gaps
are recorded instead of treating schema acceptance as proof of support.

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
read-only aliases, core config types, categorization, sorting flags, cells and
editor defaults. `pnpm run check` runs them together with all existing fixtures,
reference/link checks, the site build and the packed-consumer check. The tests
use bundled schemas and require neither source checkout nor a network request.

## Complete configuration property review

The first audit inferred too much from a renderer merging `config` with local
options. A merge does not establish that later code reads a particular key,
and a single specialized consumer does not establish a shared global default.
This follow-up traces **all 113 previously declared paths**, including nested
objects and Monaco members. It removes 30 declarations and adds 9 confirmed
paths at their consumed location, leaving 92 declared paths. These counts include
container properties, not just scalar settings.

The complete evidence record is
[config-consumption.json](conformance/config-consumption.json). Its evidence paths
are relative to the source checkout identified above. A coverage test requires
every published named config path to have a record, and checks that removed paths
are no longer declared. Unknown extension keys remain accepted; absence from the
vocabulary does not mean `additionalProperties` has become false.

### Field-specific options

- `elementLabelProp`: local in ArrayLayout; ListWithDetail exceptionally reads
  a merged default. Author the data path on the control.
- `childLabelProp`: local ArrayLayout fallback only.
- `detail`: core lookup and composite cells read local options. Tuple position
  layout exceptionally reads merged options. A detail UI schema belongs to the
  control whose schema its scopes address.
- `summary`: local tuple/composite-cell options.
- `cells`: local in the base table; the grid exceptionally reads merged options.
  Keep column-specific overrides on the array control.

### Merge behavior

The scalar precedence claim needs care for compound values. Base renderers often
use `lodash.merge`, which merges arrays by index; an empty local suggestions,
views or pre-touch-keyword list does not necessarily clear a global list. Monaco
and AG Grid use shallow spreads: a local `monaco` or `agGridOptions` object replaces
the global bag wholesale. The previously advertised recursive grid merge is not
the current implementation. The intended portable merge contract remains adapter
work; these schemas describe the actual accepted shapes and locations.

### Every reviewed path

`Consumed` means a traced reader exists; it does not mean every renderer uses the
setting. `Core` means core consumes it but renderer support varies. `Core default
only` identifies legacy `trim`. Removed paths have their local or alternate
location explained in the evidence record.

| Config path | Source finding | Declared now |
| --- | --- | --- |
| `config.:language` | Consumed | Yes |
| `config.agGridOptions` | Consumed | Yes |
| `config.allowAdditionalPropertiesIfMissing` | Consumed | Yes |
| `config.allowEmptyPropertyNames` | Consumed | Yes |
| `config.ampm` | Consumed | Yes |
| `config.autocomplete` | Consumed | Yes |
| `config.cancelLabel` | Consumed | Yes |
| `config.childLabelProp` | Local only | No |
| `config.clearable` | Consumed | Yes |
| `config.collapseNewItems` | Consumed | Yes |
| `config.convertJson` | Consumed | Yes |
| `config.dateFormat` | Consumed | Yes |
| `config.dateSaveFormat` | Consumed | Yes |
| `config.dateTimeFormat` | Consumed | Yes |
| `config.dateTimeSaveFormat` | Consumed | Yes |
| `config.defaultTemplateLang` | Consumed | Yes |
| `config.detail` | Renderer specific | No |
| `config.disableAdd` | Consumed | Yes |
| `config.disableRemove` | Consumed | Yes |
| `config.elementLabelProp` | Renderer specific | No |
| `config.enableFilterErrorsBeforeTouch` | Consumed | Yes |
| `config.filterErrorKeywordsBeforeTouch` | Consumed | Yes |
| `config.focus` | Consumed | Yes |
| `config.height` | Consumed | Yes |
| `config.hideArraySummaryValidation` | Consumed | Yes |
| `config.hideAvatar` | Consumed | Yes |
| `config.hideRequiredAsterisk` | Consumed | Yes |
| `config.initCollapsed` | Consumed | Yes |
| `config.jsonformsExtended` | Container | Yes |
| `config.jsonformsExtended.accept` | Unsupported location | No |
| `config.jsonformsExtended.agGridOptions` | Unsupported location | No |
| `config.jsonformsExtended.allowAdditionalPropertiesIfMissing` | Unsupported location | No |
| `config.jsonformsExtended.allowEmptyPropertyNames` | Unsupported location | No |
| `config.jsonformsExtended.cancelLabel` | Unsupported location | No |
| `config.jsonformsExtended.cells` | Unsupported location | No |
| `config.jsonformsExtended.collapsed` | Consumed | Yes |
| `config.jsonformsExtended.collapsible` | Consumed | Yes |
| `config.jsonformsExtended.colorSaveFormat` | Consumed | Yes |
| `config.jsonformsExtended.colorTextEntry` | Consumed | Yes |
| `config.jsonformsExtended.confirmation` | Consumed | Yes |
| `config.jsonformsExtended.confirmation.default` | Consumed | Yes |
| `config.jsonformsExtended.confirmation.renderers` | Consumed | Yes |
| `config.jsonformsExtended.confirmation.renderers.*.branchChange` | Consumed | Yes |
| `config.jsonformsExtended.confirmation.renderers.*.delete` | Consumed | Yes |
| `config.jsonformsExtended.confirmation.renderers.*.typeChange` | Consumed | Yes |
| `config.jsonformsExtended.convertJson` | Unsupported location | No |
| `config.jsonformsExtended.defaultTemplateLang` | Consumed | Yes |
| `config.jsonformsExtended.dynamicValues` | Consumed | Yes |
| `config.jsonformsExtended.dynamicValues.enabled` | Consumed | Yes |
| `config.jsonformsExtended.emptyLabel` | Unsupported location | No |
| `config.jsonformsExtended.height` | Unsupported location | No |
| `config.jsonformsExtended.initial` | Unsupported location | No |
| `config.jsonformsExtended.language` | Unsupported location | No |
| `config.jsonformsExtended.layoutDefaults` | Consumed | Yes |
| `config.jsonformsExtended.layoutDefaults.gap` | Consumed | Yes |
| `config.jsonformsExtended.layoutDefaults.gridColumns` | Consumed | Yes |
| `config.jsonformsExtended.layoutDefaults.minItemWidth` | Unsupported location | No |
| `config.jsonformsExtended.layoutDefaults.wrap` | Consumed | Yes |
| `config.jsonformsExtended.markup` | Consumed | Yes |
| `config.jsonformsExtended.markup.markdown` | Consumed | Yes |
| `config.jsonformsExtended.markup.markdown.enabled` | Consumed | Yes |
| `config.jsonformsExtended.markup.markdown.profile` | Consumed | Yes |
| `config.jsonformsExtended.markup.typography` | Consumed | Yes |
| `config.jsonformsExtended.monaco` | Unsupported location | No |
| `config.jsonformsExtended.monaco.autoGrow` | Unsupported location | No |
| `config.jsonformsExtended.monaco.initActions` | Unsupported location | No |
| `config.jsonformsExtended.monaco.maxRows` | Unsupported location | No |
| `config.jsonformsExtended.monaco.minRows` | Unsupported location | No |
| `config.jsonformsExtended.monaco.options` | Unsupported location | No |
| `config.jsonformsExtended.monaco.rows` | Unsupported location | No |
| `config.jsonformsExtended.okLabel` | Unsupported location | No |
| `config.jsonformsExtended.propagateErrors` | Consumed | Yes |
| `config.jsonformsExtended.resizable` | Unsupported location | No |
| `config.jsonformsExtended.restrict` | Consumed | Yes |
| `config.jsonformsExtended.security` | Consumed | Yes |
| `config.jsonformsExtended.security.allowScriptEvaluation` | Consumed | Yes |
| `config.jsonformsExtended.security.urlPolicy` | Consumed | Yes |
| `config.jsonformsExtended.security.urlPolicy.allowImageDataUrls` | Consumed | Yes |
| `config.jsonformsExtended.security.urlPolicy.allowRelative` | Consumed | Yes |
| `config.jsonformsExtended.security.urlPolicy.allowedSchemes` | Consumed | Yes |
| `config.jsonformsExtended.showActions` | Unsupported location | No |
| `config.jsonformsExtended.showBorder` | Unsupported location | No |
| `config.jsonformsExtended.showDataIndicator` | Consumed | Yes |
| `config.jsonformsExtended.showEmptyButton` | Unsupported location | No |
| `config.jsonformsExtended.showValidationIndicator` | Consumed | Yes |
| `config.jsonformsExtended.showValidationIndicatorCount` | Consumed | Yes |
| `config.jsonformsExtended.table` | Unsupported location | No |
| `config.jsonformsExtended.width` | Unsupported location | No |
| `config.language` | Consumed | Yes |
| `config.mode` | Consumed | Yes |
| `config.monaco` | Consumed | Yes |
| `config.monaco.autoGrow` | Consumed | Yes |
| `config.monaco.initActions` | Consumed | Yes |
| `config.monaco.maxRows` | Consumed | Yes |
| `config.monaco.minRows` | Consumed | Yes |
| `config.monaco.options` | Consumed | Yes |
| `config.monaco.rows` | Consumed | Yes |
| `config.multi` | Consumed | Yes |
| `config.okLabel` | Consumed | Yes |
| `config.placeholder` | Consumed | Yes |
| `config.propagateErrors` | Consumed | Yes |
| `config.readOnly` | Core | Yes |
| `config.readonly` | Core | Yes |
| `config.resizable` | Consumed | Yes |
| `config.restrict` | Consumed | Yes |
| `config.separateReadonlyFromDisabled` | Core | Yes |
| `config.showActions` | Consumed | Yes |
| `config.showArrayLayoutSortButtons` | Consumed | Yes |
| `config.showArrayTableSortButtons` | Consumed | Yes |
| `config.showBorder` | Consumed | Yes |
| `config.showNavButtons` | Consumed | Yes |
| `config.showSortButtons` | Consumed | Yes |
| `config.showUnfocusedDescription` | Consumed | Yes |
| `config.suggestion` | Consumed | Yes |
| `config.summary` | Local only | No |
| `config.theme` | Consumed | Yes |
| `config.timeFormat` | Consumed | Yes |
| `config.timeSaveFormat` | Consumed | Yes |
| `config.trim` | Core default only | Yes |
| `config.vertical` | Consumed | Yes |
| `config.views` | Consumed | Yes |
| `config.width` | Consumed | Yes |
