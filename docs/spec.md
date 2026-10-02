# JSON Forms Extended UI Model — Consolidated Specification

**Status:** consolidated v1 draft for review.\
**Scope:** portable UI-model semantics and runtime/renderer behaviour layered
on JSON Forms.\
**Out of scope:** visual-editor UX, palette/inspector design, editor
migrations, editor design mode, and implementation-specific source organization.

## About this document

**Published schema scope:** the JSON schemas describe implemented authoring
features in the reference renderer set. Design proposals and unimplemented
requirements are tracked in [TODO.md](todo.md). In particular, all `$dynamic`
overlay descriptions and examples below are **FUTURE design notes**, not an
approved contract or current feature. No normative wording in those notes
establishes current conformance requirements.

This is the single specification for the package. It consolidates the portable
model, accepted amendments, container indicators, validator extensions, renderer
behavior and host requirements. Historical issue lists and implementation status
reports are not normative. Source hashes and the reconciliation record are in
[provenance.json](../provenance.json).

MUST and MUST NOT state requirements; SHOULD allows a documented reason to
deviate; MAY is optional. A renderer declares its capabilities and validator
profile. A schema-valid document does not prove that any particular renderer
implements it. Unsupported capabilities require a diagnostic or a documented
fallback that preserves data.

Sections 1–28 define the model and renderer behavior. Section 29 defines the
schema artifacts and validation boundary. Section 30 covers host integration,
demo behavior and accessibility. Appendix A records proposals that are **not
part of v1 conformance**. The examples are portable assets, with explicit host
requirements in [the catalog](../examples/catalog.json).

## Contents

- [1. Purpose and portability](#1-purpose-and-portability)
- [2. Reference type declarations](#2-reference-type-declarations)
- [3. Runtime context and the action contract](#3-runtime-context-and-the-action-contract)
- [4. Reuse before adding types](#4-reuse-before-adding-types)
- [5. Established presentation options and canonical variants](#5-established-presentation-options-and-canonical-variants)
- [6. Layout types and sizing](#6-layout-types-and-sizing)
- [7. Wrap, defaults, splitter and Spacer](#7-wrap-defaults-splitter-and-spacer)
- [8. Group and Categorization](#8-group-and-categorization)
- [9. Internationalizable text](#9-internationalizable-text)
- [10. Markdown policy](#10-markdown-policy)
- [11. Dynamic values and path grammar](#11-dynamic-values-and-path-grammar)
- [12. URL and extension security configuration](#12-url-and-extension-security-configuration)
- [13. ImageView, Separator, Link and templates](#13-imageview-separator-link-and-templates)
- [14. Button, actions and script](#14-button-actions-and-script)
- [15. Read-only, restrict and mutation constraints](#15-read-only-restrict-and-mutation-constraints)
- [16. Adaptive behaviour](#16-adaptive-behaviour)
- [17. External context, visibility and security](#17-external-context-visibility-and-security)
- [18. Renderer behaviour specifications](#18-renderer-behaviour-specifications)
- [19. Honest rendering of invalid and out-of-domain data](#19-honest-rendering-of-invalid-and-out-of-domain-data)
- [20. Optional editor and tooling capability catalogues](#20-optional-editor-and-tooling-capability-catalogues)
- [21. Diagnostics](#21-diagnostics)
- [22. Runtime state](#22-runtime-state)
- [23. Reserved portable names](#23-reserved-portable-names)
- [24. Examples requirement](#24-examples-requirement)
- [25. Conformance suites](#25-conformance-suites)
- [26. Normative requirements summary](#26-normative-requirements-summary)
- [27. Verification before implementation](#27-verification-before-implementation)
- [28. Capability declarations](#28-capability-declarations)
- [29. JSON schema artifacts and validation boundary](#29-json-schema-artifacts-and-validation-boundary)
- [30. Host, demo and accessibility contracts](#30-host-demo-and-accessibility-contracts)
- [Appendix A. Proposals outside v1 conformance](#appendix-a-proposals-outside-v1-conformance)

## 1. Purpose and portability

This specification defines a portable extension model for JSON Forms, for web
renderer sets and for non-web implementations such as Kotlin Multiplatform or
Dart.

The normative contract is the **serialized UI-model shape and behavioural
semantics**. TypeScript declarations appearing in this document are reference
representations only; other languages may model the same semantics
differently.

The model SHOULD require no changes to JSON Forms core. A wrapper or
resolution layer MAY preprocess extended UI-schema elements before ordinary
tester dispatch.

### 1.1 Portability classes

| Class | Portable? | Example | Other implementations |
| --- | --- | --- | --- |
| Portable model semantic | Yes | `variant: "chips"`, span/weight | MUST reproduce semantics |
| Common JSON Forms behaviour | Desired | `multi`, `dateFormat`, `dateSaveFormat` | SHOULD support when applicable |
| Renderer enhancement | Desired behaviour | Schema-aware date limits | SHOULD strive to reproduce semantics |
| Renderer-contract escape hatch | No | Underlying component props | Preserve; interpret only for the matching renderer contract |
| Platform integration | No | Web `$el: Element` | May define an equivalent, or omit |
| Runtime escape hatch | No | JavaScript `script` | Preserve; execute only when supported and permitted |

A UI-library brand alone does not uniquely identify an escape-hatch contract.
Two renderer families built on the same design system but different frameworks
may share visual intent while exposing entirely different component props.
Each renderer specification therefore declares a sufficiently unique
namespace. Unknown renderer namespaces MUST be preserved and ignored by
non-matching renderers.

### 1.2 Configuration namespacing

The global configuration bag is shared by every extension that reads it, so
placement of a key is decided by **where the option comes from**:

| Origin | Placement in global `config` |
| --- | --- |
| JSON Forms core, or an established convention of a widely used renderer family | **Top level**, under its established name |
| A portable extension — defined in this specification, but not upstream | Under the **`jsonformsExtended`** namespace |
| Implementation-specific, not in this specification at all | Under a **vendor namespace** chosen by that implementation |

The middle tier exists for collision avoidance: an option defined here today
must not clash with an option upstream defines tomorrow under the same name.

The third tier keeps portable extensions separable from things that exist only
because of one product. Anything under a vendor namespace is by definition
outside the portable model and carries no expectation that another
implementation reproduces it. This document does not name any vendor
namespace; an implementation chooses its own and declares it.

**Per-element `options` are not namespaced.** Only the global `config` bag is.
Three reasons, each independently sufficient:

1. **Some names cannot move.** `variant` is a reserved portable name and a
   dispatch input; `type`, `scope`, `elements`, `rule`, `label`, `src`, `alt`
   and `href` are element fields rather than options. A blanket "namespace
   everything" rule is not expressible for them.
2. **The collision risk is already managed for options.** §23 reserves the
   portable option names, and §1.1 requires unknown renderer namespaces to be
   preserved and ignored. The global `config` bag has no equivalent
   protection, which is exactly why it is the one that needs a namespace.
3. **Tester inputs read element options directly.** Renderer selection reads a
   flat option; moving a selection-bearing option into a nested object would
   break dispatch.

Where an extension needs both forms, mirror the confirmation shape: element
`options.<name>` flat, global `config.jsonformsExtended.<name>`.

**Established names that stay at the top level**, whatever their origin looks
like, because this specification places them explicitly:
`showUnfocusedDescription`, `hideRequiredAsterisk`, `disableAdd`,
`disableRemove`, `restrict`.

**Blocks that live under `jsonformsExtended`:** `layoutDefaults`,
`dynamicValues`, `security`, `markup`, `confirmation`.

A worked shape:

```json
{
  "config": {
    "restrict": true,
    "disableAdd": false,
    "showUnfocusedDescription": true,
    "hideRequiredAsterisk": false,
    "dateSaveFormat": "YYYY-MM-DD",

    "jsonformsExtended": {
      "layoutDefaults": { "gridColumns": 16, "gap": 16, "wrap": false },
      "dynamicValues": { "enabled": false },
      "security": { "allowScriptEvaluation": false },
      "markup": {
        "markdown": { "enabled": true, "profile": "basic" },
        "typography": true
      },
      "confirmation": { "default": "always" },
      "showValidationIndicator": true
    }
  }
}
```

**Namespace keys are literals on the wire.** An implementation may refer to
them through constants in code, but authored UI schemas, configuration
documents, examples and fixtures spell them out. Renaming a namespace is
therefore a breaking change to authored documents and requires a migration,
not merely a constant edit.

**Relocating an existing key** follows a sequence, because authored documents
already use the old spelling: read the namespaced location first and fall back
to the flat one; emit a deprecation diagnostic when only the flat location
resolves; update examples and fixtures; drop the fallback in a release that
says so. New options adopt the correct tier immediately and need no fallback.

## 2. Reference type declarations

A TypeScript implementation may import the model's base types from JSON Forms
core: `BaseUISchemaElement`, `Internationalizable`, `JsonFormsI18nState`,
`JsonSchema`, `Layout`, `Translator`, `UISchemaElement`.

These are reference declarations, not requirements on other platforms.

```ts
export type NamedUISchemaElement = UISchemaElement & {
  name: string;
};
```

### 2.1 `name` belongs to the element model

`name` is a **portable element field**, not an option, and not a renderer
concern. It exists so that one element can refer to another — a
Categorization's initial selection naming a Category, a template addressing a
child — and those references are resolved by the model, before any renderer
sees the element.

Three consequences follow, and each has been got wrong:

- **`name` is not `options.name`.** An option is presentation the renderer
  reads; `name` is identity the model reads. Placing it in `options` puts it
  behind the option-resolution order, where a global config default could
  silently rename an element.
- **`name` is not the element's label.** A label is translated and may change
  with the locale; a name is a stable identifier and MUST NOT be translated.
  Deriving one from the other makes references break when the language
  changes.
- **Uniqueness is scoped to the referencing construct**, not to the document.
  Two Categorizations may each contain a Category named `summary`. A reference
  resolves within its own construct; a duplicate *within* one construct is a
  configuration error and MUST be diagnosed rather than resolved by position.

## 3. Runtime context and the action contract

A reference web context:

```ts
export interface FormContext {
  [key: string]: unknown;
  config?: unknown;
  readonly?: boolean;
  locale?: string;
  translate?: Translator;
  data?: unknown;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  errors?: ErrorObject[];
  additionalErrors?: ErrorObject[];
  fireActionEvent?: <TypeEl extends Element = Element>(
    action: string,
    params: Record<string, unknown> | undefined,
    el: TypeEl,
    element?: UISchemaElement,
  ) => Promise<void>;
}
```

A web-specific action event:

```ts
export type ActionEvent = {
  action: string;
  callback?: (event: ActionEvent) => void | Promise<void>;
  context: FormContext;
  params: Record<string, unknown>;
  $el: Element;
  element?: UISchemaElement;
};
```

`$el` and the DOM `Element` type are explicitly web-specific. Missing optional
action parameters are normalized to `{}` when constructing the event.

## 4. Reuse before adding types

New element types are a last resort. Each of these UI concepts has an existing
representation, and an implementation MUST use it rather than inventing a
parallel one:

| UI concept | Representation |
| --- | --- |
| Editable or viewable data | `Control` |
| Horizontal or vertical structure | Existing layouts |
| Bounded section | `Group` |
| Collapsible section | `Group` + `collapsible` |
| Tabs, stepper, accordion | `Categorization`; `variant` for stepper and accordion |
| Chips, multi-select, table, switch, slider, code editor | `Control` + options |
| Interpolated rich text | Internationalizable element + text options |
| Image | `ImageView` |
| Visual divider | `Separator` |
| Whitespace or flexible push | `Spacer` |
| Command | `Button` |
| Navigation | `Link` |

Deferred, and deliberately not specified here: progress indicators, explicit
breakpoint overrides, grid `start`, validation-gated wizard semantics, and
richer divider features.

## 5. Established presentation options and canonical variants

Existing JSON Forms conventions MUST be retained where they already express
the intended presentation. This model uses **one** encoding per presentation
and does not introduce equivalent variant aliases.

| Presentation | UI-schema encoding | Applicability |
| --- | --- | --- |
| Multiline text | `options.multi: true` | string |
| Masked string | `options.mask` containing a mask pattern | string |
| Boolean switch | `options.toggle: true` | boolean |
| Radio choices | `options.format: "radio"` | supported enum/oneOf choices |
| Searchable choices | `options.autocomplete: true` | supported finite choices |
| Slider | `options.slider: true` | number or integer satisfying the family's range tester |
| Colour | `options.format: "color"` | string; schema `format: "color"` also selects |
| Password | `options.format: "password"` | string; schema `format: "password"` also selects |
| Date | `options.format: "date"` | string; schema `format: "date"` also selects |
| Time | `options.format: "time"` | string; schema `format: "time"` also selects |
| Date and time | `options.format: "date-time"` | string; schema `format: "date-time"` also selects |

A new variant MUST add a documented capability beyond renaming an established
option.

### 5.1 Schema-driven and UI-driven format selection

Schema `format` and UI `options.format` have distinct responsibilities. Schema
format **describes the data**; UI format **requests a presentation** without
changing the data schema. Supporting both is intentional and does not justify
a third encoding through `variant`.

Password, date, time and date-time controls MUST retain schema-driven
selection, including when the host supplies no UI schema and one is generated.
They MUST also support the corresponding UI `options.format` on a string
schema that has no format.

`password` is a presentation convention, not a JSON Schema validation format.
Password-content constraints are expressed separately from the obscured
presentation.

Display format, stored format and renderer selection are three separate
concerns. A plain string schema may use `options.format: "date"` with a save
format of `YYYY-MM` to edit a month, without claiming the stored value
satisfies JSON Schema's full-date format. **UI options MUST NOT rewrite the
schema or disable its validation.** Where the schema does specify a format, a
custom save format MUST remain compatible with it.

Where schema and UI formats conflict, renderer specifications MUST document
the competing tester ranks and the fallback. No universal conflict policy is
imposed here.

### 5.2 Provenance, and why it must be recorded

Every renderer or option declares one of these origins, because a reader
cannot otherwise tell a portable guarantee from a local convention:

- **Core** — element structure or semantics provided by JSON Forms itself.
- **Renderer convention** — behaviour implemented by a named renderer family,
  not necessarily understood by core or by every family.
- **Extension** — behaviour added by this model.
- **Proposal** — a target contract awaiting implementation or review.

Source availability in a neighbouring fork is **not** proof of upstream
support. Unverified provenance MUST be labelled unverified rather than
attributed to upstream.

`variant` is already used by renderer families and is **not** a core dispatch
mechanism with universally defined values. Use `variant` when it selects one
presentation *mode*, and booleans for independent behaviour *within* that
mode — a splitter selects a split-pane layout, while `resizable` controls
whether its dividers can be dragged. Never provide two equivalent selection
encodings for the same presentation.

### 5.3 Global defaults, local options, and tester selection

For supported renderer options, global config supplies defaults and
UI-schema options override them:

```json
{
  "config": { "showUnfocusedDescription": true },
  "uischema": {
    "type": "Control",
    "scope": "#/properties/name",
    "options": { "showUnfocusedDescription": false }
  }
}
```

The control keeps the local `false`. **Explicit `false`, `0` and `""` are
meaningful overrides** wherever the option accepts those values;
truthiness-based fallback MUST NOT replace them with a global default.

**Renderer selection has a separate input contract.** Testers read UI-schema
options; config is exposed to tester context separately but is not merged into
the element. `config.multi: true` therefore does not select a multiline
renderer, even though a renderer later receives `multi` among its applied
options. Author `format` and `variant` selection in the UI schema unless a
tester explicitly documents config-based selection.

Do not assume one merge policy for every structured option. Each structured
option MUST document its own merge behaviour. Source config and authored
UI-schema objects MUST be preserved rather than mutated during merging.

Dedicated contracts take precedence over this general description — read-only
sources follow their documented precedence, confirmation uses its namespaced
defaults, and validator construction settings are not renderer options.
Listing an option in global config neither establishes support in every
renderer nor authorizes it as a selection key.

### 5.3a Renderer selection and default presentations

Renderer names describe capabilities, not source files or framework components.
Use names such as **String input**, **Array table**, and **Suggested-string input**
in conformance reports; file extensions and component class names are not contracts.
The [renderer selection guide](renderer-selection.md) indexes these capabilities,
selection precedence, and regression examples across the detailed sections below.

Selection MUST inspect the resolved schema at the control's scope, including
references and composition context. An untyped enclosing object does not make
its typed property a mixed-value control. Specialized matches MUST take
precedence over their generic fallbacks. Registration order must not accidentally
select a generic renderer for a supported specialized case. Numeric ranks are
implementation details; the observable selection is the portable contract.

The default array table handles primitive items as one editable value per row
and flat object items as property columns. Primitive rows need no numeric item
heading or redundant value-column heading. Nested object arrays use the
expandable/detail presentation described in §18.21. Explicit supported table,
list/detail, chips, multi-select, tuple, or data-grid selection follows its own
applicability contract and overrides the corresponding automatic fallback.
Array item enums select choice **cells**, not a different outer-array renderer.

### 5.4 Additional presentation variants

| Element | Variant | Applicability | Intended UI | Fallback |
| --- | --- | --- | --- | --- |
| Control | `chips` | array of string values | Removable tokens | Automatic array |
| Control | `multi-select` | array + finite choices | Multiple-choice dropdown | Automatic array |
| Categorization | `stepper` | Categorization | Ordered steps | Family default |
| Categorization | `accordion` | Categorization | Expandable sections | Family default |

Renderer specifications MAY add variants but MUST NOT rename canonical ones.
`variant: "auto"` is not canonical output. A canonical variant is **static**;
established options may be dynamic and can affect tester selection.

**The two array-choice variants outrank the automatic checkbox group**, because
explicit selection takes precedence over automatic presentation.

What separates chips from a multi-select is **the item schema, not an
option**: finite items make the adder a chooser, free string items make it a
text box. No separate free-entry option is introduced. `uniqueItems` is
required for `multi-select` and optional for chips, where its absence is
precisely what permits repeated tokens.

**Repeated tokens force an implementation constraint.** Where an array admits
duplicates, removal MUST take the occurrence that was acted on. A component
that keys its tokens by *value* cannot express this — two equal tokens become
one entry and removing either removes both — so a conforming chips
presentation identifies tokens by **position**. A failed lookup MUST return
the array untouched and MUST NOT be reinterpreted as an index identifying
another item.

**Distinct values remain distinct choices even when their translated labels
are identical.** Choices MUST therefore be keyed by value, never by label: two
values whose titles translate to the same string in some locale must still
render as two choices.

### 5.5 Choice searchability

A family MUST document its default for `options.autocomplete`; no universal
default is imposed. Only `true` enables searching, so an element `false`
overrides a config `true`, and absence behaves as `false`.

The consequence is worth stating plainly: **a UI schema written against a
family that defaults to searching renders a plain dropdown in a family that
does not.** `autocomplete` is portable; its absence is not.

A searchable renderer MUST define how displayed choices respond to the query:

- **Labels, not stored values.** A case-insensitive substring of the displayed
  label. For a constant-based `oneOf` that is the branch title, so searching
  for the stored constant finds nothing.
- **Locale follows the labels**, because they come from the translator.
- **Empty results** show a localized empty-result message.
- **Searching filters and never creates.** A search query is not itself a new
  permitted value.

### 5.6 Orientation of choice groups

`options.vertical` is the **only** orientation encoding for a choice group,
and behaves identically on radio groups and checkbox groups. Read it from
the current element first. Radio groups then use
config.jsonformsExtended.radio.vertical, then false. Explicit false overrides a
true default. Checkbox groups retain local-only orientation. Global config.vertical
and tuple.vertical MUST NOT affect choice groups.



| | Behaviour |
| --- | --- |
| Absent or `false` | Choices in a row, wrapping when the row runs out of space |
| `true` | Choices stacked in a column |
| Announced | `aria-orientation` matches what is drawn |
| Not introduced | No `horizontal` alias, no `variant` for orientation, no per-family divergence |

Only an explicit `true` stacks; a missing option is horizontal, not
indeterminate. A group that renders individual controls rather than a grouping
component MUST still declare a grouping role, or there is nothing for the
orientation to describe.

## 6. Layout types and sizing

```ts
type Dimension = number | string;

interface LayoutItemOptions {
  span?: number;
  weight?: number;
  width?: Dimension;
  minWidth?: Dimension;
  maxWidth?: Dimension;
  height?: Dimension;
  minHeight?: Dimension;
  maxHeight?: Dimension;
  start?: number;       // reserved
  responsive?: unknown; // reserved
}

interface LayoutContainerOptions {
  gap?: Dimension;
  wrap?: boolean;
  minItemWidth?: Dimension;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' |
    'space-between' | 'space-around' | 'space-evenly';
  resizable?: boolean;
}

interface HorizontalLayoutOptions extends LayoutContainerOptions {
  gridColumns?: number;
}

interface VerticalLayoutOptions extends LayoutContainerOptions {}
```

Validation: `gridColumns` and `span` are positive integers; `weight` is finite
and greater than zero; dimensions are non-negative where appropriate. On web a
numeric `Dimension` means CSS pixels; other platforms define equivalent
logical units.

### 6.1 Two halves, on two different elements

This distinction makes the rest readable, and confusing the two is the most
common authoring error:

| Where | Configures | Shape |
| --- | --- | --- |
| `options.layout` on a **child** | How that child participates in its parent | `span`, `weight`, `width`, `height`, `minWidth`/`maxWidth`, … |
| Flat `options` on the **layout** | The container itself | `gap`, `wrap`, `align`, `justify`, `minItemWidth`, `gridColumns` |

### 6.2 Modes and precedence

Primary modes: **Auto, Span, Weight, Fixed**. Conflict precedence is
**Fixed > Span > Weight > Auto**. Min and max are constraints, not modes.

Horizontal Auto behaves as weight 1. Vertical Auto means natural content
height. Vertical weight distributes remaining height **only when the parent's
height is definite or resolvable**.

That qualifier is load-bearing and asymmetric. Mapping weight to a zero main
basis on both axes satisfies it in a row and breaks it in a column: a zero
basis in a column collapses the child to nothing whenever the parent's height
is indefinite, which is the ordinary case for a form on a page. A conforming
column therefore starts each child at its **content height** and divides only
the remainder — nothing when the height is indefinite, the leftover when it is
definite. A row keeps the zero basis, where the qualifier does not apply.

### 6.3 The span formula

For usable row width `W`, `G` grid columns and gap `g`:

```text
c = (W - (G - 1) * g) / G
spanWidth(n) = n * c + (n - 1) * g
```

Clamp a span above `gridColumns` and diagnose. Span widths are deterministic;
cross-row column positions align only for pure-span rows.

Where the layout engine cannot measure `W`, the same formula rearranges to one
that does not need it:

```text
spanWidth(n) = (n / G) * W - g * (G - n) / G
```

which a percentage-of-row expression states exactly, because the percentage is
of `W`.

### 6.4 Resolution order for a mixed row

Effective children → gaps and chrome → Fixed → Span against the complete
logical grid → Weight and Auto over the remainder → min/max redistribution.

The final step MAY be delegated to the platform's own layout engine where that
engine performs the same redistribution; computing it explicitly would mean
measuring the row and re-running on every resize to reach the same answer.

### 6.5 Only effective visible children participate

Hidden children **leave layout entirely**. They do not hold a column or its
gap open. Visibility MUST be resolved *before* sizing, and the count that
feeds the arrangement is the count of children that remain.

Comments, framework markers, fragments and placeholders MUST NOT affect
sizing, gaps or splitters.

Structural layouts have **no implicit outer padding**. Gap applies only
between effective visible immediate children, so deep single-child nesting
does not accumulate whitespace.

Unsupported hints are ignored with a diagnostic — a `span` under a Group or
VerticalLayout does not create a horizontal grid.

### 6.6 Options excluded from the portable model

Two encodings are **not** part of this model, and an element carrying either
MUST draw a diagnostic rather than be silently ignored — a form that renders
at the wrong size with nothing to explain it is the worst outcome:

- **A boolean "narrow this control" option.** Controls are full width;
  narrowing is the layout's job, through `options.layout.width` or `maxWidth`.
- **An integer column count on the child** against a fixed grid. The portable
  equivalent is `options.layout.span` against a configurable `gridColumns`.

The second exclusion has a real cost worth recording: a family that reads a
fixed column count and a family that implements this model **do not agree on
layout authoring**, and a UI schema written for one sizes wrongly in the
other. Conformance here is a deliberate choice of this model over the older
convention, not an oversight. An implementation MAY keep the older renderer
available for a host that wants it, but MUST NOT register it at a rank that
outranks the conforming layout — at a higher rank the sizing model could never
take effect.

## 7. Wrap, defaults, splitter and Spacer

### 7.1 Defaults and their resolution order

- `gridColumns`: explicit → `jsonformsExtended.layoutDefaults.gridColumns` →
  family default → **16**.
- `wrap`: explicit → `jsonformsExtended.layoutDefaults.wrap` → **false**.
- `gap`: explicit → `jsonformsExtended.layoutDefaults.gap` → **family
  default**.

The recommended fallback gap is **0 unless a family documents another portable
default** — and a family whose controls carry no horizontal margin of their own
SHOULD document one, because zero makes two controls placed side by side share
an edge.

Such a default MUST be **direction-dependent**, and this is not a detail. A
family whose controls already carry vertical rhythm — a bottom margin on each
field — adds a column gap *on top of* spacing that is already there, so a
single non-zero number double-spaces every vertical form. A row may need a
gutter while a column needs none.

The reason to document a non-zero row default at all: **no UI schema written
for another family sets `gap`**, because those families space children
themselves. A fallback of zero therefore makes every ported UI schema render
with its rows touching, and it reads as the author's mistake rather than the
family's. `gap: 0` at either level restores edge-sharing exactly, so nothing is
taken away.

### 7.2 Wrapping

Wrapping uses resolved fit and minimum constraints. Weight and Auto children
shrink first. With wrap enabled, non-fitting children move to the next row;
without wrap, Span and Fixed children may shrink to their minimum and then
overflow or scroll.

`minItemWidth` is the parent's default minimum. Auto-fit requires `wrap: true`.
Fixed children remain fixed subject to constraints; flexible Span and Weight
arrangements may degrade to equal flexible shares and wrap.

`justify` addresses the main axis; `align` the cross axis.

### 7.3 Splitter

Split-pane selection uses `options.variant: "splitter"` on a HorizontalLayout
or VerticalLayout; the layout type determines the direction.

- Initial sizes come from **normal sizing**, not equal shares.
- **`span` SHOULD NOT be used.** A pane asking for one falls back to Auto
  rather than being sized against a grid a draggable pane does not have.
- Dragged sizes are **runtime state**, not authored data.
- Vertical splitters require a definite height.
- **`wrap` with a splitter is unsupported** and MUST draw a diagnostic: panes
  divide a single axis with separators between neighbours, so there is no
  second row to wrap onto.
- `resizable` defaults to **true**. `false` leaves the separator in place as a
  visual boundary but makes it neither focusable nor draggable.
- Hidden panes leave layout, as elsewhere.

Interactive splitters require platform-appropriate keyboard, focus and
separator accessibility.

### 7.4 Spacer

```ts
interface SpacerElement extends BaseUISchemaElement {
  type: 'Spacer';
  size?: Dimension;
}
```

A Spacer matches on `type` alone; no JSON Schema type or data binding is
required. Top-level `size` supplies intrinsic spacing independently of parent
layout support, defaults to **32**, and uses the shared non-negative
`Dimension` type.

**`size` applies to the parent's main axis** — width in a row, height in a
column — and it is the **parent layout that resolves which**, reading the
Spacer's top-level `size` as a Fixed main-axis dimension. Having the Spacer
ask its parent instead would couple the two in the wrong direction. Where
there is no recognized directional parent, the axis falls back to height,
which is the standalone case.

A Spacer is an ordinary visible layout child, so surrounding gaps apply
normally. It is non-interactive, hidden from assistive technology, and neither
reads nor modifies form data. `options.layout.weight` still applies, so a
Spacer can be a flexible push:

```json
{ "type": "Spacer", "size": 0, "options": { "layout": { "weight": 1 } } }
```

Top-level `size` describes the Spacer itself; `options.layout` controls its
participation in a supporting parent.

### 7.5 Reserved and delegated

`options.layout.start` and `options.layout.responsive` are **reserved**: they
are accepted and ignored, and defined here only so a document carrying them
does not look like a mistake.

## 8. Group and Categorization

### 8.1 Group

An ordinary Group presents related controls as a labelled section. Its default
visual treatment belongs to the renderer family and requires no variant.

| Option | Default | Behaviour |
| --- | --- | --- |
| `collapsible` | `false` | Enables an accessible disclosure control |
| `collapsed` | `false` | Initializes expansion and synchronizes it when the effective boolean changes. Ignored unless `collapsible` is true |
| `showDataIndicator` | `false` | Shows a data-presence indicator when at least one bound descendant contains data |
| `showValidationIndicator` | `false` | Shows an aggregated descendant-error indicator. See §8.3 |

```json
{
  "type": "Group",
  "label": "Additional contact details",
  "options": { "collapsible": true, "collapsed": true, "showDataIndicator": true },
  "elements": [
    { "type": "Control", "scope": "#/properties/alternatePhone" }
  ]
}
```

Collapsible groups preserve field data and validation when closed.

#### Presentation recommendations (non-normative)

Prefer the renderer family's standard disclosure or collapsible component.
Make the full header a keyboard-operable disclosure trigger, with the title
at the leading edge and a state-dependent chevron at the trailing edge.
Place data-presence and validation indicators in a separate trailing status
area beside the chevron, with enough spacing to distinguish them from the
title. Mirror this arrangement for right-to-left layouts.

Give the data-presence marker a localized tooltip using the same text as its
accessible name (§8.2). Keep the disclosure's accessible name based on the
group title so status text does not become part of the title.

A rounded, subtly filled panel with content beneath the header is one suitable
presentation. Colors, spacing, borders, and icons should follow the consuming
application's theme and UI framework. These suggestions introduce no portable
UI Schema options or additional conformance requirements.

Renderer families may have their own presentation options for a Group. Those
are family conventions, not additional portable variants, and belong in that
family's own specification.

### 8.2 The data-presence indicator

Data presence is defined over descendant Controls' **bound values**, including
Controls nested in structural layouts. Resolve each scope in the current data
context, including the current item path when the Group occurs inside an
array. Unrelated form data does not count.

**What counts as data:** `false` and `0` count. Missing and `null` values,
empty or whitespace-only strings, and recursively empty arrays and objects do
not. A container counts if any nested value counts.

**Hidden descendant Controls participate.**

The indicator means **only that data is present**. It does not imply validity,
completion, required-field satisfaction, or unsaved changes — and the wording
must not claim otherwise. "Contains data" is correct; "contains edits" is not,
because the marker is computed from current data and therefore appears for
server-supplied values nobody has touched. An "edited since load" indicator is
a *different* indicator needing a baseline to compare against, and MUST NOT be
built by relabelling this one.

The indicator MUST carry a **localized accessible name**; a visual marker
alone is insufficient. One string serves both the accessible name and any
tooltip, so the two cannot drift apart.

### 8.3 The container validation indicator

An aggregated descendant-error indicator on a container's header. It is a
**navigation aid** — "there is something to fix in here" — not a replacement
for the messages themselves.

| Option | Type | Default | Behaviour |
| --- | --- | --- | --- |
| `showValidationIndicator` | boolean | per container type, below | True shows the aggregated indicator; false hides it |
| `showValidationIndicatorCount` | boolean | `false` | Explicit true requests a count; omitted or false shows the marker and skips counting |

The second exists because the two cost different amounts: presence is an index
lookup, a count needs a pass over the errors.

Enabling the indicator does not enable counting. Counts require explicit
`showValidationIndicatorCount: true` locally or through the namespaced global
configuration; an explicit local false overrides a global true.

**Nested sections and implementation guidance (non-normative).** A parent
includes eligible errors in its descendant sections even if a child's indicator
is disabled or its content is unmounted. Count each matching error entry once
within a container, even when multiple controls or child sections cover its path.
Do not simply sum child counts: their covered errors may overlap. An error can
correctly contribute to both a parent indicator and a child indicator.

The current React implementation caches bound scopes by UI-schema identity and
shares an error-presence index across containers, keyed by validation-result
identities. Parent and child presence checks are independent and short-circuit
on the first matching scope. Explicit counting scans eligible errors against the
container's scopes. No additional validation run is needed.

A proposed optimization is to cache underlying presence results by UI-schema
identity, current data path, and validation-result identities, combining direct
bindings and child results with boolean OR. Such reuse must be independent of
component mounting and indicator visibility, include additional errors, honor
validation visibility, and invalidate when relevant inputs change. Benchmark
before introducing this bookkeeping. Counting may instead reuse sets of matching
error entries, provided overlaps are not counted twice. These are suggestions,
not required algorithms: implementations may use more efficient or more correct
approaches that preserve the specified semantics.

Scope collection includes scoped `ListWithDetail` elements as well as Controls.
A nested `scope: "#"` refers to the current data path without an extra separator.
**Deliberate boundary: bound data, not inferred editor coverage.** Structural
containers aggregate through bound scopes, including hidden descendants. The
broader proposal to narrow these scopes by resolving actual editor layouts is
deferred; its absence is intentional, not an oversight.

Indicator aggregation does not independently resolve the `uischemas` registry,
invoke renderer selection, or inspect mounted controls to infer which fields can
be edited. Repeating resolution could disagree with the renderer's selection
because resolution depends on the schema, path, registry order and host context.
It also duplicates resolution work, introduces recursive-layout/cycle handling
and more cache-invalidation inputs, and makes correctness harder to preserve.
Inspecting mounted controls would additionally miss inactive or unmounted tabs.
These are correctness and performance risks, not a claim of measured overhead.

For example, a container containing a Control bound to `contact` includes eligible
errors under `contact`, even if a registered editor exposes only `contact.email`.
An error in `contact.phone` still belongs to the parent indicator. Containers
inside the selected registered layout aggregate their own descendant scopes;
they do not narrow the ancestor's coverage. Thus an aggregate marker does not
promise that every reported error has an editor in the currently selected view.

Label-cell filtering is a limited, separate rule: it examines Control scopes in
an explicitly supplied detail layout. It does not resolve registered/generated
layouts to infer coverage and must not be treated as a general container algorithm.
Any future editor-coverage design would need a reliable shared resolution contract
and performance evidence before replacing the bound-scope behavior.


**Resolution order:** the element's own `options.showValidationIndicator` →
global `config.jsonformsExtended.showValidationIndicator` → the container
type's default. An explicit `false` at a more specific level overrides `true`
at a less specific one.

**Defaults differ per container type, deliberately:**

| Container | Default | Why |
| --- | --- | --- |
| Array toolbars (table, expandable items, list-with-detail, data grid) | `true` | Matches the existing "show unless hidden" convention for array summaries |
| Array item header | `true` | Item error indication is already required |
| Tuple complex-position summary | `true` | Already required |
| Group | `false` | No indicator existed; a `true` default would change every existing form's appearance |
| Category, tab and step headers | `false` | As above |

A single uniform default would either remove an indicator that is required, or
add indicators to every Group and tab in every existing form. An author who
wants uniformity sets the option once in global config, which is the case this
option exists to serve.

**Applicability.** Any container that renders a header, label row or
navigation entry capable of carrying an indicator. It does **not** apply to
ordinary Controls, which follow the shared control error presentation, nor to
layouts without a header, which have nowhere to put it and MUST NOT grow one.

**What belongs to a container.** An error belongs to a container when its
normalized instance path identifies a descendant of that container's data
scope, **by path segment, not by textual prefix**: `employees.10.name` MUST
NOT count as an error for `employees.1`. For a structural container with no
data scope of its own, resolve each descendant Control's scope in the current
data context — the same resolution the data-presence indicator uses. Mapped
additional errors participate on the same terms as schema errors.

**Setting it to `false` hides only the aggregated indicator.** It MUST NOT
remove or hide the container's **own** errors, hide field-level error text on
descendants, change validation execution or form validity, or affect array
restrictions, mutation guards or any data.

**Hidden descendants count.** Hiding an element preserves its data and does not
exempt it from validation, and eligible errors must remain discoverable
without forcing hidden controls visible merely to show them. An indicator on
the enclosing container is one of the few places such an error can surface.

**Interaction with display policies:**

- Under a validate-and-hide mode, schema errors are hidden from ordinary
  control presentation and the indicator follows; it does not reveal them.
  Under a no-validation mode there are no computed schema errors to aggregate.
  Host-supplied additional errors remain available in all modes.
- Where pre-touch filtering suppresses a keyword before touch, the indicator
  suppresses the same errors — and MUST **recompute** as descendants become
  touched rather than latching its initial state.
- A locale change refreshes the accessible name and any count without a data
  edit.
- A shown count counts the errors the indicator is permitted to represent
  after filtering, not the raw validator error count.

For arrays, `hideArraySummaryValidation: true` also suppresses the child-error
summary. If it and `showValidationIndicator` are supplied together, either request
to hide wins. Neither hides the array's own error explanation.

#### Object and array cell summaries

Compact object and array cells MUST expose eligible errors on the cell value
and its descendants beside the summary, even while the detail editor is closed.
This is cell-level validation feedback, separate from an enclosing collection's
header indicator. Suppressing that header indicator does not suppress cell
feedback. The reference renderers use the existing single-error tooltip and
multi-error summary interaction, including the localized error count in the
expanded summary. A permanent numeric badge beside the cell is not required.

For example, when `rows[0].contact.city` is required but missing, the Contact
cell in row 1 shows an error indicator. An Experience array cell aggregates
errors from its items. Use normalized control paths, including relocation of
`required` errors to the missing property, and match complete path segments:
errors in row 10 must not appear on row 1. Include mapped additional errors and
follow the validation display policies above. Opening details shows the
individual field errors; the compact indicator does not replace those messages.

Object-valued cells using `oneOf`, `anyOf`, or `allOf` follow the same rule.
Include errors on the composition itself as well as eligible descendant errors;
for example, a oneOf value matching two alternatives still needs an indicator
even if neither alternative has a field error. Detail dialogs dispatch the
composed schema through the normal renderer registry. The container-validation
example includes invalid and valid rows for all three combinators.

Keep the summary or scalar editor and its error indicator on the same line.
Reserve space for the indicator rather than wrapping it below the control.
Both Ant Design and shadcn object/array cell renderers provide this feedback,
including when those cells are hosted by AG Grid.

### 8.4 Computing container indicators

This is specified because the obvious implementation does not scale and the
correct one is also the fastest.

**Never scan the error list per container.** That is O(containers × errors) on
every render. Measured over 242 containers in an 880-field form, a per-container
scan costs 3.7 ms at 200 errors and 9.0 ms at 1000 — over half a frame — while
an index stays at 0.067 ms and 0.334 ms.

**Build an ancestor index once per validation.** Walk each error's instance
path and add every ancestor prefix to a set:

```text
error at /emergencyContact/phone
  ->  add ''  ,  'emergencyContact'  ,  'emergencyContact.phone'
```

A container's check becomes a single set lookup. Building costs
O(errors × depth), and depth is three to five in practice.

**Correctness falls out of the shape.** An ancestor set gives the
segment-boundary rule for free: `employees.10.name` inserts `employees`,
`employees.10` and `employees.10.name`, never `employees.1`. A prefix-string
test is exactly where that bug otherwise lives, and there is no prefix test
here.

**Share the index** across containers, keyed on the identity of the errors
array, which validation replaces wholesale. Rebuilding it per container is
worse than the scan it replaces.

**Scope-less containers collect their descendants once**, cached by UI-schema
element identity — the collection depends only on the UI schema and does not
belong in a per-render path at all. One traversal serves both the data-presence
and the validation indicator, which ask different questions of the same set of
bound paths.

### 8.5 Runtime expansion is not UI-schema state

Runtime expansion MUST NOT mutate the UI schema. A renderer initializes
expansion from the effective `collapsed` option and synchronizes when that
boolean changes, whether it came from static configuration or dynamic
resolution.

Header interaction may change local expansion between those updates.
Unrelated re-renders, or replacement UI elements carrying the same effective
boolean, MUST NOT reset the user's local expansion.

Dynamic resolution of `collapsed` is **one-way**. Header interaction does not
write back to the source property: after the bound value becomes true the user
may reopen the Group locally while it remains true, and a later change of the
effective boolean synchronizes expansion again. The header remains an
accessible disclosure control reflecting the current local state.

Undefined resolution falls back to the ordinary static value; an absent
effective `collapsed` defaults to false. **A non-boolean value, including
`null`, is invalid and produces a configuration diagnostic — with no
truthiness coercion.** Disabling dynamic resolution leaves ordinary static
values, subject to the same synchronization behaviour.

### 8.6 Categorization

Ordinary Categorization selects tabs without a variant.

| Option | Default and behaviour |
| --- | --- |
| `variant: "stepper"` | Ordered step presentation |
| `variant: "accordion"` | Vertically stacked disclosures, one open at a time |
| `showNavButtons` | False when absent; true shows Previous/Next actions for the stepper |
| `vertical` | False when absent; true requests vertical category or step presentation |
| `initial` | Optional direct Category `name`; fallback below |

`vertical` is the single Categorization orientation encoding.

Previous and Next operate on **visible** categories and stop at the first and
last visible one. Visibility rules MUST NOT leave navigation pointing at a
hidden or missing category. Hiding the navigation buttons does not itself
require linear navigation or disable header navigation. **Neither stepper
presentation nor `showNavButtons` implies any requirement to validate the
current step before moving.** These actions change runtime selection, not form
data and not the UI schema.

`options.initial` references a direct Category `name`. Sibling names SHOULD be
unique. A missing target falls back to the first visible category **with a
diagnostic** — reported to the author, not rendered to the person filling in
the form, who can do nothing about it.

### 8.7 Container visibility and hidden children

A container's own visibility follows its rule and the applicable rendering
context; it is **not** inferred from how many descendants are visible. A
hidden ancestor suppresses its subtree even where a descendant's own rule
would show it.

A rule on a child hides only that child. To hide a whole Category, put the
rule on the Category element. A Category needs no data scope of its own; its
rule evaluates in the current rendering context.

Hidden immediate children consume no layout space or gaps. **A visible Group
or Category retains its heading, container presentation and navigation entry
even when all its children are hidden.** Such containers MUST NOT be hidden
automatically, and no "hide when empty" option is introduced — this also
preserves categorization for presentation-only sections with no data-bound
controls.

When the selected category becomes hidden, select an available visible
category per the navigation contract. If none remain visible there is no
active category and no stale active panel. A visible but empty category
remains eligible for selection. Visibility and navigation changes preserve
data and do not suspend validation.

### 8.8 Accordion categorization

Matches a Categorization with direct Category children and
`variant: "accordion"`; this explicit match takes precedence over the generic
Categorization renderer. Selection has no JSON Schema type requirement, no
Control scope and no array binding — categories are structural sections and
may contain unbound content or be used with an empty data object. Expandable
array item forms remain a separate, data-bound presentation.

**At most one visible category is open.** Initially open the one named by
`initial`, otherwise the first visible one; an unavailable target produces a
diagnostic. Opening another closes the previous one. Activating the open header
closes it. An explicit all-closed state persists through unrelated updates. If
an active category becomes hidden or is removed, open the first remaining
visible one; when none are visible, no panel is open. **Preserve the selected category's identity across reordering.**

`initial` sets initial selection only. Expansion is runtime UI state and
modifies neither data nor UI schema. Closing a category preserves its data and
validation.

Accordion panels are stacked vertically; the `vertical` orientation option and
the stepper-only `showNavButtons` do not alter this presentation.

## 9. Internationalizable text

```json
{
  "type": "Label",
  "text": "Welcome, {firstName}",
  "i18n": "profile.welcome",
  "options": {
    "interpolate": true,
    "markup": "plain",
    "textParams": { "firstName": "there" }
  },
  "$dynamic": {
    "options": { "textParams": { "firstName": { "bind": "data.firstName" } } }
  }
}
```

Use `textParams`, never action `params`. `interpolate` defaults to `false`;
`markup` is `plain` or `markdown`, default `plain`.

Static `textParams` and expression evaluation work **even when dynamic
resolution is disabled**; only the dynamic namespaces are gated, and only a
parameter's value can reach them (§9.1).

### 9.1 One expression language, and two scopes

Placeholders are **expressions**, and they use the grammar and the language of
§11 rather than a second one of their own. A single `{` opens a placeholder,
`{{` emits a literal `{`, `}}` emits a literal `}` — which is inverted from
the most widely known templating convention, so `{{data.firstName}}` is
literal text and an implementation SHOULD warn when it sees that shape.

**There is one interpolation language in this model, not two.** A text
placeholder and a §11.4 `template` leaf are the same grammar evaluated the
same way; the only difference is where the string comes from and what happens
when it fails (§9.5). An implementation MUST NOT introduce a separate message
syntax for text: a second set of braces with a different escape rule is the
defect this rule exists to prevent.

**The text and the parameters see different things, and that is the point.**

| | may reference |
| --- | --- |
| a `textParams` **value** | `data`, `item`, `config`, `context` (§11.2), subject to the gate; `locale` |
| the **text** | the declared `textParams`, and `locale` |

A translated string MUST NOT be able to name a data path. `{data.customerName}`
written in the text resolves to nothing and is reported, however open the gate
is. The reason is translation, not security: a catalog that names data paths is
coupled to the schema, so renaming a field invalidates every translation in
every language, and a translator is shown a path instead of a name for the
thing being talked about. `You are subscribed to {product}.` is the unit of
translation; `product` is declared once, in the UI schema, where knowledge of
the data model belongs.

Expressions still work **in the text**, over those parameters. That is what
keeps a plural in the catalog, where each language writes its own
(`{seats == 1 ? "seat" : "seats"}`), rather than in the UI schema where only
the authoring language can reach it.

**Where an expression belongs follows from one test: does its shape differ by
language?**

| | belongs in |
| --- | --- |
| a plural or gender conditional | the **text**, because each language branches differently |
| reading data, looking a key up, formatting a number or a date | the **parameter**, because the call is identical in every language |

`{translate("plan." + plan)}` and `{currency(amount, "EUR")}` are the same
expression in English and in Bulgarian, so they belong on the right-hand side.
Put them in the text and every translator has to reproduce them correctly in
every language — and one who drops the `translate(...)` wrapper silently
renders the untranslated key. A catalog entry should carry the words and the
grammar, not the plumbing.

Parameters see the namespaces and **not each other**; a reference from one
parameter to another would need an evaluation order and a cycle check for a
capability an extra parameter already covers.

`interpolate` governs the whole feature: with it, the text is a template and
parameter values are expressions; without it the text is literal and
`textParams` are inert. A parameter value with no placeholder is simply a
literal, so static parameters need nothing extra.

An expression MUST NOT be able to act: no assignment, no statements, no host
function calls beyond those the implementation registers (§9.3), and
own-property lookup only. The binding path grammar in §11.3 is narrower than
the expression grammar: it forbids operators and prototype-related path segments.
CEL may read an explicitly owned JSON key named `constructor` without accessing
an object prototype (§9.7). An implementation whose
evaluator satisfies this needs **no script-evaluation gate**, because there is
nothing to execute. One that compiles expressions into host code does need it,
and is gated like a template engine (§13).

### 9.2 Plural and gender are written by hand

An expression language is not a message format, and the difference is a real
cost that a specification should name rather than hide.

**Plural and gender selection are written as a conditional:**

```
{seats} {seats == 1 ? "seat" : "seats"}
```

This is adequate for languages with two plural categories and inadequate for
languages with more, where the conditional grows a branch per category and the
author must know the rules. Because the whole string including its expression
lives in the **catalog**, each language writes its own test — which is the
mechanism that makes this workable, and the reason a translated string is the
unit of translation rather than a set of parameters.

The canonical expression profile is CEL. ICU message patterns are not part of
this profile. A host offering another message system must identify it as a
separate extension; it cannot interpret canonical expressions differently.

### 9.3 Locale-aware formatting is supplied as functions

A locale decides more than which words are shown. `148.5` is `148,50 €` in
German and `€148.50` in English; `2026-10-01` is `Oct 1, 2026` in English and
`1.10.2026 г.` in Bulgarian.

An implementation MUST make locale-aware number, currency and date formatting
reachable from an expression, and SHOULD do so as **functions the author
calls** rather than by formatting values implicitly on their way into the
text. An implicit rule cannot tell a price from an order number, a year or an
identifier — it would render `2026` as `2,026` — and there is no way to opt
out of it. There is nothing to opt out of with a function.

These functions are part of the implementation's published contract: a
catalog string containing `{currency(amount, "EUR")}` depends on them, and
removing one breaks that string in every language.

A date-only value is a **calendar date**. Formatting it in the viewer's time
zone renders the previous day for readers west of the meridian, which is a
one-day error that appears for some readers only; such a value MUST be
formatted as UTC.

### 9.4 Substitution, escaping and order

**Pipeline:** effective `textParams` → translation and message lookup →
expression evaluation → escaping → safe markup rendering.

The last two are ordered and both are required when the result will be parsed
as markup:

- **Substituted values MUST be escaped before parsing.** A value containing
  `[click](javascript:…)` renders as those characters, never as a link.
- **Only the substituted values are escaped**, never the surrounding text. The
  author's own markup has to keep working, and escaping the finished string
  breaks it.

Escaping after parsing is too late; escaping everything is too much. An
implementation that cannot distinguish the two has not split the template into
literal and expression segments, which is the structure this requires.

URL-bearing positions get no protection from value escaping, because the
destination is the author's own markup. The URL policy (§12) is what covers
them, and it applies to a resolved destination exactly as to a static one.

### 9.5 Absent data is not an authoring error

Two failures look alike and are not:

- **An authoring error** is wrong however the form is filled in — a name the
  text does not declare, a namespace that does not exist, a function that does
  not exist, a type mismatch. It MUST be reported.
- **Absent data is normal.** An optional field nobody has filled in, an empty
  list, an object not yet created: the expression is correct and the value is
  not there *yet*. It MUST render as empty text and MUST NOT be reported.

A form being filled in is mostly empty, so reporting absence would put a
developer-facing message beside much of a fresh form, and a diagnostic that
appears when nothing is wrong is one people learn to ignore.

The line is drawn at the **namespace**: the root of an expression must
resolve — `data`, `item`, `config`, `context`, or a declared parameter — and
anything reached *through* it may be missing without complaint, at any depth,
including an index past the end of a list.

Text and templates still differ in what they do with the result:

- **Text** renders the rest of the string, the unresolved placeholder
  contributing empty text.
- **A `template` leaf** (§11.4) makes the **whole value** undefined, which
  falls back to the static value. A half-resolved `href` is a broken link, not
  a partial one.

An implementation MUST NOT throw out of either path. An expression resolving
to an object or a list has no text form; that is an authoring error, not
`[object Object]`.

### 9.6 Host functions are registered, never passed in

An expression may call only functions the implementation **registers**. A
function placed in `context`, or anywhere else in the data, MUST NOT be
callable — and SHOULD NOT even be readable.

This is what keeps §9.1's "an expression cannot act" true in practice. If a
callback in the data were callable, every host that exposed one would widen
the sandbox without meaning to, and the guarantee would depend on what each
host happened to put in `context` rather than on the model. It is also why
§11.2 says `context` carries **values, not functions**.

Registering a translator is recommended, because a value out of the data is
often a key rather than a word — a plan or a status is the same string in
every language. With `translate` available, a catalog entry can localize such
a value itself, without the UI schema knowing the set of possible values.

### 9.7 A property named `constructor`

Any string is a legal JSON property name, including names that mean something
to the host language. An implementation MUST read such a property like any
other, and MUST NOT let its presence affect the readability of its siblings.

Worth stating because it is easy to fail by accident: an evaluator that
identifies a plain object by inspecting `value.constructor` is defeated by a
data property of that name, and typically rejects the **whole object** rather
than the one field — so an unrelated field becomes unreadable because a
sibling was called `constructor`.

### 9.8 Renderer-owned strings

**No renderer renders a user-visible literal in any single language.** Every
string a renderer produces *itself* — tooltips, dialog buttons, accessible
names, placeholders, empty-state text, index markers — resolves through the
form's translator with a documented default as its fallback.

This covers only strings the **renderer** owns. Labels, descriptions and
titles authored in the UI schema or JSON Schema have their own precedence
(element `i18n`, then schema `i18n`, then the path-derived prefix), and an
unbound element needs an explicit `i18n` prefix because none can be derived.

**Keys, not text, are the lookup.** A key is a dotted identifier in a
namespace. Looking a string up by its own English text makes the catalog key
change whenever the wording does, and gives translators nothing stable to key
against. A renderer set's complete default set SHOULD live in one place, so it
is enumerable and a missing translation degrades to a sensible default rather
than an empty element.

**Interpolation belongs to the translator.** Core performs none: a default
like `Delete {name}` renders literally unless the translator substitutes. A
message showing a raw placeholder to the user is the symptom of a renderer
that skipped this.

**Always supply the default message.** A translator that returns `undefined`
for an absent key renders an empty control. A renderer MUST therefore pass its
documented default with every lookup, never a bare key.

### 9.9 A missing translation falls back to the locale, then to the default

Routing strings through the translator is only half of the problem. If the
fallback is a single table in one language, a form switched to another
language keeps that language wherever its own catalog does not carry the key —
which is **most** keys, because a form's catalog is authored for the form's own
labels, not for the renderer set's internal strings.

Resolution is therefore three-deep:

| Source | When it answers |
| --- | --- |
| The form's catalog | Whenever it carries the key |
| A **locale bundle** for the renderer set's own strings | The form's catalog does not, and that language is carried |
| The documented default | Neither of the above |

The ordering MUST NOT be re-implemented by inspection. The bundle's string is
handed to the translator **as its default message**, so the precedence falls
out of the translator's own contract. A locale falls back to its language —
a regional tag uses the base language's bundle — because reverting to the
default language over a region nobody translated separately is worse.

**Whatever supplies the default message decides the language.** A call site
that passes its own hard-coded default *does* call the translator and looks
correct, while pinning the string to that default in every language whose
catalog lacks the key. This is the single most common way the rule above is
violated while appearing to be followed.

**A test that supplies a translator answering every key cannot detect it.**
Such a guard returns the marker and the site passes. The guard that finds it
renders with a locale and **no translator at all**, which is what a form with
no catalog actually is.

Whether these bundles load synchronously or asynchronously is a family
decision, but strings that are on screen the moment a control mounts SHOULD
resolve synchronously: an asynchronous load shows one language and replaces it
in front of the user.

## 10. Markdown policy

The **basic** profile supports paragraphs and line breaks, bold, italic,
strikethrough, inline code, links, and ordered and unordered lists.

Basic **excludes** raw HTML, images, media, iframes, tables, blockquotes,
headings and fenced code. An implementation MAY offer an extended profile
adding headings, blockquotes, tables and fenced code while retaining every
security rule below.

- All Markdown output MUST be sanitized **after** parsing.
- Markdown link targets MUST pass the URL policy (§12).
- Images and raw HTML are **independently gated**, and HTML remains sanitized
  even when enabled.

**No unsanitized markup may reach the page**, which is what the first rule is
for. An implementation whose parser exposes a token stream MAY build its
output from that stream directly rather than rendering to markup and
sanitizing; doing so satisfies the requirement, because nothing unsanitized is
produced. The set of elements that can be drawn is then an explicit allowlist,
and attributes other than link targets are dropped.

**Excluding a construct means excluding its grammar, not filtering its
output.** In a profile without headings, `# Title` renders as those
characters. Parsing the heading and then discarding the node consumes the `#`
and silently promotes the line to a paragraph, which hides an authoring
mistake instead of showing it. A caveat implementations should not promise
around: excluding one construct can leave its characters to a different rule —
with fenced code excluded, a fence is typically claimed by the inline-code
rule rather than surviving as literal backticks.

**The URL policy is authoritative for link targets.** Markdown parsers
commonly carry a scheme allowlist of their own. Where one does, it MUST NOT be
left in front of the URL policy: two checks in series make the effective
policy their intersection, so a host that widens `allowedSchemes` silently
gets nothing for the schemes the parser dislikes, and a target refused before
parsing produces no node and therefore no diagnostic. A refused target keeps
its text and loses its link.

### 10.1 Requesting markup, and being refused

`options.markup` is set on the element whose text it governs; it is an
**option**, never a distinct element type. An unknown option is preserved and
ignored (§1), so a renderer set without this capability still shows the text;
an unknown *type* renders nothing at all, and the same document would lose its
text entirely.

A request that cannot be honoured — an unknown `markup` value, or Markdown
switched off by the host — MUST report a diagnostic **and** still render the
text. This is deliberately unlike a refused template (§22), which renders its
diagnostic alone: a template is a program whose output is the content, while
text is the content, and is readable unparsed.

Markdown MAY default to enabled, unlike the gates of §12. Those admit
something that acts — a compiler, a data-path resolver, an inline payload that
bypasses the host's CSP. A profile-restricted parser admits only a grammar.

### 10.2 Typography

`options.typography`, defaulting to the host-wide
`jsonformsExtended.markup.typography` and then to `true`, controls whether
rendered text is wrapped in the host UI library's own text components so it
inherits the theme. It MUST be switchable, because those components carry
their own margins, which collide with a form's own spacing (§7). It governs
the wrapper only: turning it off still parses.

A library's text component MUST be told whether it is being handed block
content or a single run. One that renders a true `<p>` cannot wrap block
content, since `<p>` accepts phrasing content only.

### 10.3 Configuration

```json
{
  "jsonformsExtended": {
    "markup": {
      "markdown": { "enabled": true, "profile": "basic" },
      "typography": true
    }
  }
}
```

`profile` is `basic` or `extended`. An unrecognized value falls back to
`basic` without a diagnostic: a profile name is a host setting rather than an
authored one, so there is no author on the page to tell, and the safe
direction for an unknown one is the smaller grammar.

## 11. Dynamic values and path grammar

**FUTURE — design discussion, refinement, then implementation required.**
The following is a retained proposal, not a finalized API. Neither the overlay
shape, path grammar, security policy, resolution order nor lifecycle is committed.
It is excluded from published schemas and current conformance vectors.
See [TODO.md](todo.md#future--dynamic-ui-element-overlays). The existing Label
interpolation feature and its `dynamicValues.enabled` data-access gate are
implemented independently and do not implement this proposal.

`$dynamic` recursively overlays static values on a UI element.

A leaf is **exactly** `{ "bind": "..." }` or `{ "template": "..." }` — one
key, string value. Extra descriptor keys are invalid.

**Only `undefined` means no override.** `null`, `false`, `0` and the empty
string are real overrides. Objects overlay recursively; **arrays replace whole
values**. The source UI schema is never mutated.

Resolution occurs **before testers** and covers nested children, array detail
and generated schemas, and all dispatch paths.

### 11.1 What may not be dynamic

Static denylist: `type`, `scope`, `elements`, `rule`, `i18n`, `name`,
`$dynamic`, and the canonical `options.variant`.

These determine identity and dispatch.

A second, narrower restriction is on the **leaf kind** rather than the
property: translated text may be supplied by `bind` but never by `template`
(§9). The denylist above is about what may not be dynamic at all; this is
about which of the two leaves may supply it. Note that resolution happens before
testers and testers are re-evaluated when values change, so an option that
*participates in selection* can still change which renderer wins. An
implementation SHOULD keep options that dynamic values supply out of tester
inputs, so an arriving value updates a renderer rather than replacing it —
replacing it discards focus and any local state.

### 11.2 Namespaces

`data`, `item`, `locale`, `config`, `context`.

`item` is the nearest enclosing array-detail item, otherwise undefined.
`context` is safe host-exposed values, **not** arbitrary host functions.
`config` MUST NOT expose the `jsonformsExtended` namespace.

### 11.3 Path grammar

```text
data.customer.name
data.items.0.price
data.items[0].price
data.metadata['some key']
data.metadata["field.with.dots"]
context['help host']
locale
```

`.length` is allowed for arrays and strings. **Own-property lookup only.**
`__proto__`, `prototype` and `constructor` are forbidden. **No calls, no
operators, no method invocation.**

That last restriction is what makes `$dynamic` safe without a permission:
nothing is compiled, so enabling dynamic values is **not** permission to
execute anything (§13).

Two consequences an author meets immediately:

- **A path is a fixed string.** Indexing by a form value — a lookup table
  keyed on another field — is not expressible. Host context must be resolved
  per session rather than exposed as a table to index.
- **A binding reads; it cannot derive.** A boolean that depends on a
  comparison cannot be written here. That is what **rules** are for. The
  division is: `$dynamic` reads, rules decide.

### 11.4 Template grammar

The template parser is quote-aware. `{{` emits a literal `{` and `}}` a
literal `}`; a **single** `{` starts a placeholder ending at the matching `}`
outside quoted bracket content.

**This is inverted from the most widely known templating convention**, so
`{{data.firstName}}` is literal text rather than a binding, and an
implementation SHOULD emit a development warning when it sees that shape.

An invalid or unresolved placeholder makes the **whole template** undefined —
not partial — which then falls back to the static value.

`template` uses the **same grammar and the same expression language** as §9's
text interpolation — there is one of each in this model. What differs is the
source and the failure policy: a template's string is authored in the UI
schema and is never translated, and an unresolved placeholder makes the whole
value undefined (§9.3).

It therefore MUST NOT be used for translated text. A template writes a
finished string onto the element, so the catalog is never consulted and the
form shows one language everywhere. For anything a reader sees as a message,
use `i18n` with `interpolate`; `template` is for strings that are not
messages — a URL, an image source, a placeholder.

### 11.5 Reactivity

The resolution layer supplies each renderer with its **effective UI element**
through ordinary reactive properties and updates it when resolved values
change. Renderers consume ordinary effective properties; they **do not**
inspect `$dynamic` descriptors and cannot distinguish a static value from a
resolved one.

There is therefore nothing for a renderer to subscribe to. Three obligations
follow:

1. **Effective identity MUST remain stable while values are unchanged.** This
   reads like a performance note and is not: an implementation that returns a
   fresh element on every pass defeats memoization, re-runs every tester in
   the form on every keystroke, and re-renders every subtree.
2. **Renderers derive from properties during render.** Capturing a value at
   construction — an initializer that runs once, an effect with no
   dependencies — silently ignores every later change. A renderer that
   performs work from a resolved value MUST key that work on the value, and
   discard results that arrive out of order.
3. **The integration updates and rebinds nested dispatches as well as
   top-level ones**, without remounting unchanged renderer selections or
   discarding unrelated local state.

Binding resolution never implies write-back to its source.

## 12. URL and extension security configuration

Recommended configuration:

```json
{
  "restrict": true,
  "jsonformsExtended": {
    "layoutDefaults": { "gridColumns": 16, "gap": 0, "wrap": false },
    "dynamicValues": {
      "enabled": false,
      "namespaces": {
        "data": true, "item": true, "locale": true,
        "config": false, "context": false
      }
    },
    "security": {
      "allowScriptEvaluation": false,
      "urlPolicy": {
        "allowedSchemes": ["https", "http", "mailto"],
        "allowRelative": true,
        "allowImageDataUrls": false
      }
    },
    "markup": {
      "markdown": {
        "enabled": true, "profile": "basic",
        "allowImages": false, "allowHtml": false
      }
    }
  }
}
```

**Defaults when extension config is absent:** `restrict` true unless explicitly
false; dynamic values disabled; script evaluation disabled; schemes
https/http/mailto; relative URLs allowed; image data URLs disallowed; Markdown
enabled on the basic profile with images and HTML off; 16 grid columns, gap 0,
no wrap.

`restrict` resolves from element `options.restrict`, then global
`config.restrict`, then this model's preferred default of **true**. It is not
duplicated under the extension namespace, is unrelated to any validator's own
strict mode, and no separate renderer `strict` option is introduced.

Hosts must resolve this default from the authored config before a core integration
seeds its own defaults: an injected `restrict: false` is not an author choice.
A legacy adapter that reads `jsonformsExtended.restrict` must translate that
setting at its integration boundary; it is not a second portable authoring key.

**URL-bearing targets:** `Link.href`, `ImageView.src` including
scope-resolved sources, and Markdown links and images.

For URL templates, data, item and locale substitutions MUST use
**percent-encoding equivalent to `encodeURIComponent`**. Permitted config and
context substitutions are host-provided URL components. The final URL MUST
pass policy.

**A declared flag must be consulted.** An option such as `allowImageDataUrls`
that appears in the policy type but is read by nothing is worse than an absent
one: setting it produces no effect and no error. Image data URLs, when
enabled, accept image MIME types only. This includes SVG image data URLs; a host
may apply a narrower MIME policy. The image-data flag must not permit other
media types or bypass the host's content security policy.

## 13. ImageView, Separator, Link and templates

```ts
interface ImageViewElement extends BaseUISchemaElement, Internationalizable {
  type: 'ImageView';
  src?: string;
  scope?: string;
  alt: string;
}

interface SeparatorElement extends BaseUISchemaElement {
  type: 'Separator';
  options?: BaseUISchemaElement['options'] & { vertical?: boolean };
}

interface LinkElement extends BaseUISchemaElement, Internationalizable {
  type: 'Link';
  label?: string;
  href: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
}
```

### 13.1 ImageView

A display-only element, not an editable Control. `src`, `scope` and the
required string `alt` are **top-level fields**, not options.

At least one of `src` or `scope` MUST be supplied; both may coexist. If the
effective `src` is defined it is used — **including an empty string, which
intentionally displays no image**. Otherwise `scope` resolves against the
current schema and data context using Control scope semantics, including the
current array-item path.

- The scoped schema must permit strings.
- Empty or missing source data displays no image.
- A non-string value produces a **diagnostic**, and is never coerced to a URL.
- An invalid defined `src` does **not** silently fall through to `scope`.
- `alt: ""` explicitly denotes a decorative image.

Dynamic resolution may override top-level `src` or `alt`; `scope` remains
static under the denylist. Undefined resolution retains the static `src`
fallback if supplied, otherwise `scope` is used. **The URL policy applies
equally to direct, dynamically resolved and scope-bound sources** — no source
precedence depends on how the effective property was produced.

### 13.2 Separator

A display-only element that visually separates sections without reading or
modifying form data. No JSON Schema type or scope is required.

`options.vertical` defaults to false. Parent layout sizing determines the
available extent; a vertical separator requires usable height from its layout
context. It is static: no dragging, resizing or keyboard interaction. Expose
separator semantics and orientation where applicable.

### 13.3 Link

`href` is the static fallback. An **empty `href` is allowed** and renders
non-navigating plain semantics rather than inventing a destination.
`target="_blank"` MUST enforce `noopener` and SHOULD add `noreferrer`
according to host policy.

**Every URL-bearing attribute passes the policy**, not merely the one a
renderer happens to think of as "the link". A refused URL renders as plain
text rather than as a navigable target.

### 13.4 Template and Slot

Template and Slot compose UI-schema elements **structurally**. They are
distinct from the restricted `$dynamic.template` interpolation grammar, and
structural composition alone requires no script permission.

- **Template** resolves a reusable named UI schema from the registry. The
  top-level `name` is required; the lookup finds the first registry entry
  whose name matches. **This is name lookup, not ranked tester selection** —
  testers are not evaluated for it. Duplicate names SHOULD be avoided and
  diagnosed. A missing template renders no substituted content and SHOULD
  produce a diagnostic.
- **Slot** dispatches supplied named content, or a fallback, in the current
  template context.

`Template.elements` supplies named slot contents, merged over inherited
contents with local names taking precedence. Named reuse **preserves the
caller's schema and data path** and does not create a new data object.
Recursive named references MUST be guarded against unbounded expansion.

The same registry also serves ordinary ranked detail selection, combinator
branches and mixed-type forms; these lookup modes MUST NOT be conflated.

### 13.5 TemplateLayout

`template` is the required source string; `elements` contains child UI-schema
elements; optional top-level `lang` selects the engine.

Resolve the language from explicit `lang`, then a configured default, then the
default web profile. **An unknown or unsupported language MUST be diagnosed**
rather than interpreted as another engine.

| Profile | Scope |
| --- | --- |
| A shared web profile | Available independently of the surrounding renderer family's own framework |
| A framework-specific web profile | Uses that framework's template syntax and registered components; not portable across all web renderer sets |
| Native or other profiles | Require a separately declared engine and contract. Web template strings are not directly portable to native renderers. Preserve unsupported documents and report unsupported capability |

A profile exposes to the template: whole-form `data`, core schema `errors`,
`context`, `elements` and `translate`. These are **engine bindings**, not new
core condition fields. `context` may expose additional errors and application
capabilities; **`errors` alone MUST NOT be described as combined validity.**
Live data, error and context changes MUST refresh the bindings without leaving
stale slot editors.

**Children are addressed by name.** Each named child is available to the
template as a placeholder that mounts its delegated renderer. Unnamed children
receive their decimal index as a fallback name; explicit names are recommended.

Two requirements that are easy to satisfy incorrectly:

- **A name collision must not silently steal a slot.** An index fallback MUST
  NOT take a name another child declared, and a child that cannot be addressed
  MUST be reported rather than silently left off the form.
- **A placeholder resolves to the child element itself.** Wrapping it in a
  descriptor object and handing that to the engine breaks any binding that
  iterates the children.

TemplateLayout delegates children **at the original schema and data path** and
preserves normal validation, rules, enabled and read-only behaviour, and
dynamic resolution. Mount and unmount slot content cleanly as template
structure changes, retain correct ownership for repeated placeholders, and
release engine resources on disposal. Report compilation and rendering errors
accessibly — and **distinguish a failure to load the engine from a failure to
render the template**, because they send the reader to entirely different
places.

Template-local UI state MUST NOT inadvertently become form data.

**Markup and executable template profiles are runtime escape hatches**, not
the sanitized Markdown profile and not a security sandbox. Where JavaScript
string compilation or execution is involved they follow the host's trust
policy and the script-evaluation permission. **Enabling `$dynamic` MUST NOT be
treated as permission to execute templates.** Profiles MUST document their
expression, event, raw-HTML and data-write capabilities, and engine two-way
binding MUST NOT bypass read-only, `restrict`, or normal change dispatch.

## 14. Button, actions and script

```ts
type ButtonSemanticColor =
  | 'primary' | 'secondary' | 'alternative'
  | 'success' | 'warning' | 'error';

type Script = string; // async function body

interface ButtonElement extends BaseUISchemaElement, Internationalizable {
  type: 'Button';
  label?: string;
  icon?: string;
  color?: ButtonSemanticColor;
  params?: Record<string, unknown>;
  action?: string;
  script?: Script;
}
```

**Every one of these is a top-level field, not an option.** A renderer that
reads them from `options` leaves a conformant button with no action name and —
worse — **no `params` at all**, because that field has no option spelling.
`params` is what lets one command serve several buttons:

```json
{ "type": "Button", "label": "Deutsch", "action": "setLocale", "params": { "locale": "de" } }
```

Without it, two languages require two action names and the host grows a branch
per language. An implementation MAY additionally read `options.action` and
`options.label` below the top-level fields, for documents already authored
that way.

`action` and `script` are mutually exclusive. **Where an element carries both,
`action` wins** — it is the portable half, and the one a host can intercept.
Carrying both is an authoring error, and a diagnostic SHOULD say so.

Button invokes commands; Link performs navigation. A renderer may offer a
link-like Button appearance through its documented styling options while
preserving button semantics, keyboard activation, disabled behaviour and
pending handling. No portable Button variant is defined for that appearance,
and an action MUST NOT be turned into navigation merely to obtain a visual
treatment.

**Colour names are semantic, not literal.** Each family maps them to its own
palette, which is the point of naming them this way rather than by colour.

### 14.1 The action path

A Button action calls the context's action-firing function and **awaits it**.
It does not call a host handler directly.

- **Pending covers the complete promise**, not the dispatch.
- **Duplicate activation SHOULD be prevented while pending.** The guard must
  not be the pending *state*: a second activation can arrive before the
  re-render that records it, leaving a window in which both get through. A
  synchronous flag, reset in a `finally`, is what closes it.
- **Rejection clears pending and propagates** through ordinary platform error
  handling. It MUST NOT be swallowed.

### 14.2 The script path

`script` is a string containing an **async function body**, with top-level
`await` supported. It is invoked with the action event as `this`, so the body
reads `this.context`, `this.params`, and the platform fields. No positional
argument or wrapper function expression is required.

String evaluation requires `security.allowScriptEvaluation: true`. Enabling it
means the host treats the UI schema as **trusted executable code**. A platform
content-security policy may prohibit runtime evaluation; a renderer MUST NOT
weaken that policy and MUST instead report evaluation-disabled behaviour.

Await completion using the same pending and duplicate-activation rules as
actions.

**A function-valued script is a build-time convenience outside the wire
format.** A platform MAY accept one. Where it does, two rules are forced by
experience:

- **Pass the event as an argument *and* as `this`.** Binding only `this`
  is a trap, because a lambda's `this` is lexical and cannot be bound — such a
  script compiles, runs, and reads the wrong thing with no diagnostic. Passing
  both means neither idiom can be got wrong and a body moved over from the
  string form keeps working.
- **The script permission gates the string form only.** A function the build
  already compiled needs no evaluation permission, and requiring one would be
  theatre.

A function-valued script MUST NOT be stringified into a function body. Doing
so turns a closure expression into something created and immediately
discarded: the button is clicked, nothing happens, and nothing is reported.

Script is a last-resort, non-portable runtime escape hatch. Other platforms
may define another representation, or ignore and preserve unsupported scripts.

### 14.3 Shared destructive-change confirmation

Confirmation is **separate from mutation permission and from validation**. It
never bypasses `restrict`, read-only, disabled state or schema constraints.
Ordinary typing, navigation, adding a new value, and selecting the
already-selected type or branch do not prompt. Picker staging is a separate
interaction contract.

| Policy | Behaviour |
| --- | --- |
| `always` | Confirm covered destructive actions against existing values. No prompt where there is no value to discard. **`false`, `0`, empty strings and empty containers are existing values.** |
| `never` | Perform the otherwise-permitted action without prompting |
| `complex` | Confirm when the value being discarded is a non-empty object or array. **Inspect the old value, not the destination type.** |

**Covered operations:** `typeChange` (mixed-type selection), `branchChange`
(combinator selection), and `delete` (removing a property, item or subtree).
Removing an object or array value from a composite table cell follows `delete`
with catalog ID `compositeCell` and fallback policy `complex`. Empty objects and
arrays clear immediately under `complex`; `always` still prompts for them and
`never` skips confirmation. Cancellation preserves the value. Confirming must
recheck mutation permission and the target so a replacement value is not removed.

Clearing a mixed type follows `typeChange`; clearing a combinator selection
follows `branchChange`. Ordinary input clearing follows the shared clear-value
contract and does **not** become a confirmation on every edit.

For batches, one confirmation covers the operation, and `complex` applies if
any discarded value qualifies. Evaluate the data **actually discarded**,
excluding enclosing properties preserved during a branch change. A non-empty
object has at least one own key; a non-empty array has at least one item,
independently of whether its nested values are empty.

**Resolution order:**

1. Element `options.confirmation[operation]`
2. Config `jsonformsExtended.confirmation.renderers[catalogId][operation]`
3. Config `jsonformsExtended.confirmation.default`
4. Documented fallback: mixed type change and all delete operations use `complex`; other covered
   operations use `always`

**Catalog IDs are stable semantic identifiers, not component names.** For a
delete or rename control hosted inside another renderer, use the **owner of
the action** — a dynamic-property delete belongs to the additional-properties
catalog even when drawn inside a tree.

Additional-property deletion MUST use catalog ID `additionalProperties`;
deleting a tuple trailing item MUST use `additionalItems`. Both use operation
`delete` and fallback `complex`: scalar values (including null, false, zero and
empty strings), empty objects and empty arrays delete without a prompt. Nonempty
objects and arrays require confirmation. Explicit policy overrides still apply. Resolve element `options.confirmation.delete`, then the corresponding
`config.jsonformsExtended.confirmation.renderers` entry, then the global default.
This applies equally to paginated and unpaginated collections. Adding an item or
property does not prompt. Fixed tuple positions cannot be deleted by the trailing
items action. Confirming MUST recheck current permissions, bounds and the target;
replacing, reordering or rebinding the collection invalidates a pending delete.
A renderer may conservatively invalidate the pending delete on any collection
replacement. Use the renderer family's native dialog with translated delete text.

Cancellation leaves committed data, selection and expansion unchanged.
Confirmation performs the operation **once**, after rechecking mutation guards
and its target. A stale confirmation MUST NOT be applied to an unrelated
replacement item. Dialog text is localized and action-specific, with
accessible focus handling.

The runtime resolves configuration into one shared policy; individual UI
libraries MUST NOT give these values different meanings.

## 15. Read-only, restrict and mutation constraints

### 15.1 Read-only sources and precedence

| Source | Spelling and role |
| --- | --- |
| Component property | `readonly: true` establishes form-wide read-only state; element settings cannot override it |
| Global config | `readonly` or `readOnly` supplies a default, subject to core precedence. **Not** an unconditional form-wide lock |
| UI-schema options | Prefer `options.readonly`; accept `options.readOnly` as a compatibility spelling. Requests read-only behaviour independently of schema annotation |
| JSON Schema | `readOnly` is the standard spelling. Lowercase is **not** the schema keyword |

JSON Schema `readOnly` is an **annotation**. Standard validation does not
compare previous and new values, nor enforce immutability because the
annotation is present. The rendering integration enforces editing
restrictions.

Precedence, preserving core's own resolver: form-wide `readonly: true` wins
first, then applicable read-only rules, then explicit UI options, then
explicit config values, then schema `readOnly: true`, then inherited renderer
read-only. Within options or config, the lowercase spelling is checked before
the camel-case one. **An explicit `false` at an earlier level overrides a
later source, including schema and inherited annotations — but cannot override
form-wide `readonly: true`.** Avoid authoring both spellings together.

`separateReadonlyFromDisabled` distinguishes effective read-only state from
enabled state. With the compatibility default `false`, read-only sources
participate in disabling controls. With `true`, the integration and renderer
MUST honour read-only separately from enabled, **including guarding
mutations**. Setting it alone does not prove every renderer supports
inspection without disabling. A family that does not support the separation
MUST declare the capability unsupported rather than let it be assumed.

Do not conflate a disabled widget with a different precedence for read-only
sources, and do not infer precedence from how a widget visually represents
read-only state.

### 15.2 Rules and effective state

| Effect | Condition matches | Condition does not match |
| --- | --- | --- |
| `SHOW` | Visible | Hidden |
| `HIDE` | Hidden | Visible |
| `ENABLE` | Enabled | Disabled |
| `DISABLE` | Disabled | Enabled |
| `READONLY` | Read-only | Writable |
| `WRITABLE` | Writable | Read-only |

`READONLY` and `WRITABLE` are **two-way decisions**, not conditional additions
to an underlying value. They take precedence over element, config and schema
read-only settings; a form-wide `readonly: true` still wins.

**An enabled state does not grant permission to mutate a separately read-only
value.** Read-only and enablement remain distinct wherever the integration
supports separate state.

Serialized rules support schema conditions, `LEAF` equality conditions and
recursive `AND`/`OR` conditions. Empty `AND` is true; empty `OR` is false.
A schema condition contains a valid data-schema document. Core function-valued
`validate` conditions belong to trusted host code: a string containing function
source is not an executable core condition and is not part of the JSON profile.

`failWhenUndefined: true` makes an unresolved condition value fail explicitly.
Without it, the condition schema is validated against the resolved value
**including `undefined`** — so missing data does not necessarily make every
schema condition false.

**Schema-based conditions evaluate data**, not collected additional errors and
not pending editor validation state. A valid-form command guard MUST use the
combined-validity integration rather than assuming a rule observes those
errors.

Hiding an element preserves its data, does not remove its schema constraints,
and does not exempt it from validation. Rule evaluation mutates neither data
nor the authored UI schema.

**Conditional validation and conditional presentation are separate
mechanisms.** A schema condition does not itself define a show or hide rule,
and an implementation MUST NOT infer conditional layouts from validator
support for `if`/`then`/`else` or dependency keywords.

### 15.3 Validation execution and error visibility

| Mode | Automatic schema validation | Schema-error display |
| --- | --- | --- |
| `ValidateAndShow` | Runs; default | Show the errors |
| `ValidateAndHide` | Runs and retains results | Hide schema errors in ordinary control presentation |
| `NoValidation` | Does not compute results | Nothing automatically computed to display |

**Additional errors remain available in all three modes.** `ValidateAndHide`
does not suppress host-supplied additional errors or participating renderer
summaries. Renderer-owned publication options control their own contribution
independently; the validation mode is **not** a universal switch for external
or language-service validation.

Schema-based rules still validate their condition schemas independently of the
mode. A separate validation invocation is not evidence that automatic
validation is enabled.

**An empty error array under `NoValidation` does not prove the form passed.**
Consumers of cached validity MUST distinguish unvalidated, pending, stale,
valid and invalid. Error *visibility* does not determine validity either:
`ValidateAndHide` may retain failures while showing none.

`restrict` remains independent. `NoValidation` does not disable preventive
constraints, mutation guards or action permissions; `restrict: false` does not
disable schema validation. Changing the mode MUST update presentation and
notify integrations **without requiring the user to edit data**.

### 15.4 Change events, context errors and combined validity

| Interface | Error information |
| --- | --- |
| Base change event | Data and core schema errors. **Does not automatically include additional errors** |
| Extended form context | Separate `errors` and `additionalErrors` collections |
| Control error selectors | Combine applicable schema errors and additional errors for that control, subject to display policy. **Mapped display text is not an authoritative validity collection** |

Supporting additional errors for display and context access does **not** imply
the change event's `errors` field includes them.

A host checking only the change event's error count can therefore observe no
schema errors while a renderer-published error still blocks validity. **A host
requiring complete validity MUST consider** current schema results, host and
renderer additional errors, and participating pending validation. Presentation
filtering, hidden messages and translated control strings MUST NOT become the
validity source.

**Notify combined-validity consumers when additional errors or pending state
change, even without a data edit.** Do not rely on a data-change event, and do
not assume an additional-error update triggers one.

### 15.5 Additional-error ownership and changing data paths

Associate renderer-generated errors with their **owning editor and logical
data target**, not with the current array index. Keep ownership and version
metadata in runtime state, outside business data and the authored UI schema.
Publish the instance path using the current pointer to that target. No
business-data identifier is required merely to support ownership.

Where an owner's target moves — deleting an earlier array item shifts the rest
— update the published path. **Leaving the old path associates the error with
another item.** Deleting the owning target removes its owned errors. Identity
MUST NOT be inferred from an index or a display label alone.

Discard asynchronous results for obsolete targets or data versions. Where a
target cannot be reliably matched after external replacement, invalidate stale
renderer-owned results and evaluate the current target rather than guessing a
relocation. **Clear only errors belonging to the affected owner**; preserve
unrelated renderer and host errors.

Host-supplied errors remain under their producer's ownership. Renderers MUST
NOT rewrite arbitrary host error paths, nor clear host errors merely because
their own target moved.

Core data updates recalculate schema errors but **do not** automatically
relocate or remove additional errors.

Participating asynchronous validation MUST expose pending state to validity
consumers during reassociation. **Do not report confirmed validity solely
because stale errors were removed while their replacements are pending.**

### 15.6 Renderer-published additional errors

Additional errors supplement JSON Schema validation with errors supplied by the
application or an integrated service. For example, an application may publish
field errors returned by a server after submission, and a Monaco integration
may bridge complex document diagnostics from its language service into the form.

Constraints handled by the JSON Schema validator, including registered custom
formats or keywords, MUST use the normal schema-validation channel. Duration
format failures and cron failures from a registered validator MUST NOT be
republished as additional errors by their controls. Selecting a renderer through
`options.format` alone does not install a schema constraint.

A renderer that obtains diagnostics outside that validation channel may publish
an additional error against its own path.

Three requirements make this usable rather than a source of collisions:

1. **Publication is opt-in per renderer**, through a documented option
   resolved per element then per config. A renderer that finds a problem does
   not thereby acquire the right to invalidate the form. For Monaco,
   `propagateErrors` optionally controls whether editor diagnostics reach the
   form: disabling it keeps diagnostics in the editor and retracts only that
   editor's published errors. It MUST NOT suppress schema-validation errors or
   application-supplied errors, such as server responses.
2. **Each published error is uniquely owned.** Several renderers, and several
   instances of the same renderer, may target one path; an owner clearing its
   own error MUST NOT remove another's. Ownership is per instance, not per
   renderer type.
3. **An owner's errors are cleared when its subject changes**, and the
   mechanism must survive the host replacing the whole error collection.

**A renderer cannot publish by itself.** Additional errors are a form-level
input, and a renderer has no channel to it. A conforming integration provides
one — a store the renderers write to and the form reads. Two failure modes are
worth naming because both look correct:

- **Observing changes without re-dispatching them does nothing.** A passive
  observer of the form's own updates is never invoked when a renderer
  publishes, because publishing is not a form update.
- **Re-dispatching the whole core state from a stale snapshot reverts
  edits.** A renderer publishes during render, before the enclosing
  component's change handler has run, so a dispatch carrying that render's
  data overwrites the newer value. The publication must be merged into the
  form's state, not replayed over it.

Where no such integration is present, a publishing renderer MUST report the
absence as a diagnostic rather than fail silently.

### 15.7 Pre-touch error filtering

| Option | Default and behaviour |
| --- | --- |
| `enableFilterErrorsBeforeTouch` | False when absent. True enables filtering |
| `filterErrorKeywordsBeforeTouch` | A non-empty array names keywords to suppress before touch. When filtering is enabled, an absent or empty array suppresses **all** otherwise displayable control error text before touch. Ignored when filtering is disabled |

**Touch is blur, not focus.** Receiving focus alone is insufficient, and
leaving the control counts even if the user changed nothing. Touch state is
runtime interaction state, not form data and not an authored value.

**The form remains invalid while a required error is hidden.** Filtering MUST
NOT remove structured errors, suspend validation, modify data, or alter the
collections used by validity consumers. It does not make a rule observe errors
it would not otherwise inspect. Disabling the filter restores ordinary
presentation subject to the validation mode; it does not force errors to
appear under a hiding or non-validating mode.

Apply filtering to the **complete** set of errors eligible for the control,
including mapped additional errors. A non-matching additional error MUST NOT
be lost merely because a matching schema error was suppressed. Matching
additional errors may have their text suppressed; their structured entries and
validity contribution are unchanged.

**A summary that claims the same behaviour must track child touch state** and
MUST NOT permanently suppress a matching error simply because filtering
remains enabled after the child is touched. A family that does not implement
summary participation MUST document that rather than let it be assumed.

### 15.8 Read-only interaction and restrictive editing

Read-only prevents mutation of form data but does not disable every
application command. Renderer-owned mutation actions — add, remove, move,
clear — MUST obey read-only and enabled state.

With `restrict` enabled, supported interactions **prevent** invalid committed
edits rather than reporting them afterwards. Explicit `false` disables
prevention without disabling schema validation or read-only rules.

| Control family | Constraints enforced through interaction |
| --- | --- |
| Arrays, checkbox groups, multi-selects, chips | `minItems` and `maxItems` govern removal and addition |
| Additional-properties editor | `minProperties` and `maxProperties`, counting **all** properties including declared ones |
| Date, time, date-time | Supported inclusive and exclusive bounds constrain picker selection and Apply; complete typed range violations may commit with validation feedback (§18.19) |
| String input | Supported `maxLength` prevents excess entry, accounting for displayed versus stored representation |

**This is a renderer-aware policy, not a promise to turn every schema keyword
into an input filter.** A `pattern` does not imply a mask. Each catalog entry
identifies preventive support separately from validation-only support.

For arrays with restriction enabled:

- Disable or reject additions that would exceed `maxItems`, including add
  buttons, new selections and token creation.
- Disable or reject removals that would fall below `minItems`, including
  deselection, token removal, and clearing a non-empty array.
- **Evaluate batch edits against their resulting size.** A replacement
  preserving the count MUST NOT be blocked merely because the array sits at a
  boundary.
- Apply the same checks to mutation handlers as to visible action state;
  keyboard interaction MUST NOT bypass them.

**Already-invalid data must remain visible and repairable**, never truncated,
padded or rewritten on mount. Allow repairs toward validity in both
directions. Moving an item does not change array size and is not blocked by
count constraints alone.

The same applies to property counts. Renaming without changing the count is
not prohibited by count constraints alone; name and value constraints remain
separate.

For temporal entry, keep partial text as a **local draft** so it can be
completed or corrected. When restricted, picker selection and Apply must obey
supported bounds. Complete typed or pasted range violations may commit with
validation feedback under §18.19. **Do not silently clamp or replace the user's
input.** With restriction disabled, out-of-range picker edits may also commit.
Masking guides syntax independently of `restrict`.

Renderer specifications MUST declare which constraints and interaction paths
support prevention. Validation remains necessary for external data,
unsupported constraints and cross-field conditions.

### 15.9 Data schemas, rules and validator profile

For example, the form schema can make email required when contactByEmail is true:

```json
{
  "type": "object",
  "properties": {
    "contactByEmail": { "type": "boolean" },
    "email": { "type": "string", "minLength": 1 }
  },
  "if": {
    "properties": { "contactByEmail": { "const": true } },
    "required": ["contactByEmail"]
  },
  "then": {
    "required": ["email"]
  }
}
```

An explicit UI rule separately controls the email input's visibility:

```json
{
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/contactByEmail"
    },
    {
      "type": "Control",
      "scope": "#/properties/email",
      "rule": {
        "effect": "SHOW",
        "condition": {
          "scope": "#/properties/contactByEmail",
          "schema": { "const": true },
          "failWhenUndefined": true
        }
      }
    }
  ]
}
```

At the form root, contactByEmail true shows the email control and activates the
schema's required constraint. False or missing hides the control and does not
activate that required constraint. The rule does not create, clear, or transform
email. Existing email values remain subject to their property schema: for
example, {"contactByEmail":false,"email":""} still fails minLength even though
the control is hidden. Hiding is not a validation exemption. Applications must
coordinate schema constraints and presentation so users can resolve errors;
do not silently remove hidden values to achieve validity.

Without the explicit UI rule, conditional required validation alone does not
request that the control be hidden. Automatic UI generation and schema lookup
must not be advertised as a complete conditional-form presentation mechanism.
Properties declared only inside conditional branches require documented renderer
or generation support, or an explicitly authored UI schema with supported scope
resolution. Validator acceptance of those schemas alone does not establish that
an editor will be generated. This distinction introduces no new UI-model option
and does not change the established combinator renderer contracts.

#### Property dependencies: presence, validation, and clearing

In draft-07, an array-valued dependencies entry requires other properties when
its triggering property is present:

```json
{
  "type": "object",
  "properties": {
    "purchaseOrder": { "type": "string" },
    "billingAddress": { "type": "string" }
  },
  "dependencies": {
    "purchaseOrder": ["billingAddress"]
  }
}
```

With draft 2019-09 or later, express the same dependency as
`"dependentRequired": { "purchaseOrder": ["billingAddress"] }`, using a validator
configured for that dialect. Dependency activation tests property presence,
not truthiness or whether a string is nonempty. Dependencies are directional:
billingAddress alone does not require purchaseOrder in this example.

| Data | Result for this schema |
| --- | --- |
| `{}` | Valid; the dependency is inactive. |
| `{"purchaseOrder":"PO-123"}` | Invalid; billingAddress is missing. |
| `{"purchaseOrder":""}` | Invalid; the empty string still occupies the triggering property. |
| `{"purchaseOrder":"","billingAddress":""}` | Valid; both properties exist and neither string has a minimum-length constraint. |
| `{"billingAddress":"Main Street"}` | Valid; the dependency is inactive and the address is preserved. |

Dependencies do not automatically create, show, hide, or delete controls. Use
the ordinary property editors and explicit UI rules where conditional visibility
is wanted. Missing-dependent-property errors SHOULD appear beside the affected
control when it exists; provide discoverable object-level feedback when no such
control is rendered. Apply the shared validation-display rules and retain error
feedback for hidden or otherwise unavailable fields.

Removing the triggering property deactivates that dependency but must not remove
dependent properties or their values. Clearing follows the existing context's
semantics: if an ordinary control unsets purchaseOrder, its dependency becomes
inactive. If a dynamic additional-property string editor clears it to an empty
string while retaining the key, the dependency remains active. Only its explicit
property Delete action removes that key, subject to the shared deletion rules.

A schema-valued draft-07 dependencies entry, or dependentSchemas in newer drafts,
applies an additional schema to the whole containing object when the triggering
property is present. It does not apply only to the triggering property's value,
merge schemas by overwriting constraints, or inherently request another form.
The complete original schema remains authoritative for validation.

See the [JSON Schema conditional-validation reference](https://json-schema.org/understanding-json-schema/reference/conditionals)
for dependency semantics and dialect differences.

#### Rule data scopes and current-form schema references

Ordinary JSON Forms conditions resolve scope in the current rendering context.
At the form root, scope # selects the entire form value. Within an array item's
detail form it selects that item; #/properties/locked selects the item's locked
property, not the root form's locked property. The inspected core also treats
#/ as the current context. Condition scopes are combined with the supplied data
path, not appended to the target Control's own property value.

For example, consider:

``` json
{
  "locked": true,
  "contacts": [
    { "name": "Alex", "locked": false, "notes": "Call in the morning" },
    { "name": "Sam", "locked": true, "notes": "Email only" }
  ]
}
```

A root-level condition with scope #/properties/locked evaluates true. The same
condition on notes inside each contact detail evaluates that contact's locked
value: false for Alex, true for Sam. A READONLY rule therefore permits editing
Alex's notes and prevents editing Sam's, absent a form-wide override:

``` json
{
  "type": "Control",
  "scope": "#/properties/contacts",
  "options": {
    "detail": {
      "type": "VerticalLayout",
      "elements": [
        { "type": "Control", "scope": "#/properties/name" },
        {
          "type": "Control",
          "scope": "#/properties/notes",
          "rule": {
            "effect": "READONLY",
            "condition": {
              "scope": "#/properties/locked",
              "schema": { "const": true },
              "failWhenUndefined": true
            }
          }
        }
      ]
    }
  }
}
```

To validate the whole current item instead, use scope # with a condition schema
such as {"type":"object","properties":{"locked":{"const":true}},
"required":["locked"]}. Required prevents an absent locked property from
satisfying the properties constraint by omission. Reordering items must update
context paths so rules continue to evaluate the correct data.

This scope grammar is distinct from $dynamic paths: data.locked explicitly reads
the whole form's flag, while item.locked reads the nearest array item's flag.
Using $dynamic.options.readonly supplies an effective option, still subject to
read-only precedence; it does not redefine rule scope or override a read-only rule.

**Current-form schema reference — project extension.** The integration makes the
current form schema available to rule validation under the reference /#.
This uses standard JSON Schema $ref with an integration-provided schema resource
identified by /. It avoids duplicating the form schema in each condition:

``` json
{
  "type": "Button",
  "label": "Submit",
  "action": "submit",
  "rule": {
    "effect": "ENABLE",
    "condition": {
      "scope": "#/",
      "schema": { "$ref": "/#" },
      "failWhenUndefined": true
    }
  }
}
```

Placed at the form root, this enables Submit when the form data validates against
the current form schema. Scope selects the data; $ref selects the validation
schema. Inside an item detail, the same scope selects the item even when $ref
references the entire form schema. Do not mistake /# for a root-data escape.

Register/update the schema reference when the schema or validator changes,
preserving original reference bases, IDs, and internal/external reference
resolution. Ensure the alias belongs to the current form: forms sharing a
validator must not replace one another's schema registration. Use isolated
validation contexts or equivalent integration-managed resolution as needed.
Unresolved references must produce a diagnostic, not imply valid data.

This condition checks schema validity only. Host additionalErrors, published
editor diagnostics, and pending validation do not automatically participate.
Use the separate combined-validity integration when a command must also wait for
or reject those states. The /# alias is an extension guarantee, not something
ordinary JSON Forms rule evaluation provides without schema registration.

#### Reusable schema fragments and function conditions

Use schema-based conditions for the portable rule representation. In addition
to the current-form root reference /#, reference a fragment without copying its
schema definition into the rule:

``` json
{
  "effect": "ENABLE",
  "condition": {
    "scope": "#/properties/address",
    "schema": { "$ref": "/#/properties/address" },
    "failWhenUndefined": true
  }
}
```

A shared definition can instead be referenced as
`{"$ref":"/#/$defs/address"}` (or the schema dialect's definitions location).
The data scope and schema fragment must describe the intended validation target.
Reference reuse avoids schema duplication and may reuse compilation; it does not
inherently reuse the form's previous validation result. Validating a fragment
alone also does not test constraints on that value defined elsewhere in the
whole form schema. Do not introduce a new VALIDATION condition type: portable
conditions retain existing JSON Forms syntax and evaluation.

The supported JavaScript/TypeScript core integration also accepts a synchronous
condition.validate function returning a boolean. Its context contains data
(scoped value), fullData, path, uischemaElement, and config. It does not supply
errors, additionalErrors, or pending validation directly. Config access is part
of the inspected core callback contract, not an additional project-only context
field. Keep the current callback context aligned with core. This runtime capability
is not a portable executable representation for Kotlin or other platforms.

A future integration adapter may expose a read-only validation-state snapshot
without modifying core, using the existing function-adaptation mechanism. Such
an extension would need explicit semantics for errors, additional errors,
pending/current state, and reevaluation when validation changes independently of
data. This is a future design possibility, not a currently supported context field
or required implementation. No new validation-state injection is defined here.
For now, use portable schema-reference conditions or application-owned TypeScript
callbacks as described below.

A host can use a closure to read already-computed validation state, avoiding a
second schema validation. For example, in application-owned TypeScript:

``` ts
import { RuleEffect, type Rule } from '@jsonforms/core';

type ValidationSnapshot = {
  current: boolean;
  pending: boolean;
  errors: readonly unknown[];
  additionalErrors: readonly unknown[];
};

function submitRule(
  getValidation: () => ValidationSnapshot | undefined
): Rule {
  return {
    effect: RuleEffect.ENABLE,
    condition: {
      scope: '#',
      validate: () => {
        const state = getValidation();
        return state !== undefined && state.current && !state.pending &&
          state.errors.length === 0 && state.additionalErrors.length === 0;
      }
    }
  };
}
```

Attach the returned rule to the Button. ValidationSnapshot/getValidation are
host-owned application interfaces in this example, not new core context fields
or serialized UI-schema options. additionalErrors must include the host's and
participating renderers' published errors. Pending/current must reflect the latest
data and validation configuration; unavailable or stale results must not count
as valid. The host must arrange rule reevaluation when this state changes, even
without a data edit. Reading a closure alone does not establish that subscription.
The same requirement applies if a host exposes validation state through config.

A function supplied directly by trusted application code needs no string
compilation. JSON cannot carry that function. Where the JavaScript integration
supports serialized condition.validate strings, the string is a complete function
expression accepting context, not the async body syntax of Button.script:

``` json
{
  "effect": "ENABLE",
  "condition": {
    "scope": "#",
    "validate": "(context) => context.data !== undefined"
  }
}
```

This serialized extension requires
jsonformsExtended.security.allowScriptEvaluation true before compilation or
execution and must respect the existing CSP/security contract. No executable
string is portable merely because it is stored in JSON. Disabled/unsupported
execution must be diagnosed and must not be silently treated as a satisfied
condition or dropped to leave a guarded action enabled. The integration must
handle the affected action conservatively for either rule polarity. The callback
must return a boolean synchronously; promises are not valid condition results.

#### Validator profile and default assignment

The web reference integration uses Ajv with the following selected defaults.
These are **Ajv-specific validator construction options**, not UI-schema fields,
JSON Schema keywords, or jsonforms.config properties, and their names are not a
cross-validator API.

| Ajv option | Default | Intended capability |
| --- | --- | --- |
| `allErrors` | true | Collect multiple validation failures rather than stopping at the first. |
| `verbose` | true | Provide richer error metadata for mapping and presentation. |
| `strict` | false | Disable Ajv's strict schema checks; this does not disable instance validation and is unrelated to UI restrict. |
| `addUsedSchema` | false | Avoid automatic registration of schemas supplied to compile/validate; explicit registration remains available. |
| `useDefaults` | true | Assign supported schema defaults to missing properties/items during validation. |
| `$data` | true | Enable supported data-dependent keyword values using Ajv's $data reference extension. |
| `discriminator` | true | Enable Ajv's supported discriminator handling for tagged oneOf schemas. |

The first four settings come from the core validator factory; the extended
profile enables the last three. The profile also registers formats through
ajv-formats and extended formats/keywords and error localization/customization.
Those plugins and project keywords are capabilities, not additional core JSON
Schema guarantees. A host-supplied validator must have its capabilities documented
rather than being assumed to inherit the default factory's setup.

Each UI technology should select a validator offering comparable capabilities
where possible and enable equivalent defaults. Where an engine uses different
APIs, reproduce the observable behavior rather than copying Ajv option names.
Declare unsupported formats, keywords, default assignment, data references, or
discriminator behavior explicitly. A platform need not execute JavaScript to
provide equivalent validation. Compatibility tests should exercise the selected
schema dialect and supported extensions; permissive handling must not silently
claim validation of unsupported constraints.

Distinguish three default mechanisms:

- Renderer display fallbacks, such as a provisional slider thumb position, do
  not themselves write data.
- Explicit Add or permitted type/branch changes initialize values through the
  schema/default-generation mechanism.
- Validator default assignment may change missing properties during validation,
  independently of renderer initialization.

For example, validating {} against
{"type":"object","properties":{"name":{"type":"string","default":"Anonymous"}}}
with useDefaults true can insert name: "Anonymous". Clearing that property to
undefined may therefore cause subsequent validation to restore it. The renderer
must not independently reapply the default during clearing, but permanent absence
cannot be promised when the configured validator assigns defaults. Under this
profile an empty string is not missing; Ajv's separate useDefaults: "empty"
behavior is not enabled. Dynamic string properties cleared to "" retain that
value and key under ordinary default assignment.

Default assignment is nonstandard validator behavior; JSON Schema default alone
does not mandate data mutation. Ajv cannot replace the root argument directly,
and default assignment has supported-location limitations, including combinator
contexts. Do not promise that every default in every schema is applied. See
[Ajv data modification and defaults](https://ajv.js.org/guide/modifying-data.html).

Rule evaluation must leave live form data unchanged even when the form's ordinary
validation profile assigns defaults or uses other mutating keywords. Use a
nonmutating rule-validation profile or validate an isolated value as appropriate,
with matching schema-reference/format support. This includes /# schema-reference
conditions. Clearly distinguish validation of the supplied value from validation
of a normalized copy if normalization is retained. Prevent hidden mutations caused
merely by rendering or evaluating a button condition. Validator-driven mutations
in the ordinary form pipeline must be reflected consistently in form state and
change notifications.

#### Optional validator-specific schema extensions

| Feature | Location | Effect |
| --- | --- | --- |
| `useDefaults: true` | Validator construction | Enables supported default assignment; it is not a schema keyword. |
| `transform` | Schema extension keyword | Applies ordered string transformations that can modify stored values during validation. |
| `dynamicDefaults` | Schema extension keyword | Supplies computed defaults using registered providers. |

For example, this schema requests normalization of a nested string:

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "transform": ["trim", "toUpperCase"]
    }
  }
}
```

With the registered transform implementation, validating
`{"name":" Alice "}` can change the value to `{"name":"ALICE"}`.
This is a data transformation, not presentation formatting or a renderer action.
The `trim` transformation is unrelated to the excluded renderer sizing option
of the same name. The web integration also supplies project transformations
such as capitalize and startCase; their registration does not make them standard
JSON Schema behavior.

Computed defaults are likewise validator behavior, separate from generic
UI-element overrides through $dynamic. Provider availability, evaluation timing,
arguments, and environment dependencies belong to the validator integration's
capability documentation. Do not assume a provider computes a fresh value for
every initialization unless its documented semantics guarantee that behavior.
Browser URL access and JavaScript execution are not required of native ports.

Where a provider compiles or executes a supplied JavaScript string, the existing
jsonformsExtended.security.allowScriptEvaluation policy applies before compilation
and execution. Enabling a validator keyword must not bypass that policy. Other
platforms may offer native providers without supporting JavaScript strings.

The data-mutation and rule-isolation requirements above also apply to these
keywords. Their use must not silently mutate live data during rule evaluation.

#### Extended validator capabilities

The extended validator profile enables registered keywords and authored error
messages by default. Its keyword inventory is the declared compatible
`ajv-keywords` profile, supplemented by `capitalize` and `startCase` transforms.
`capitalize` uppercases the first character and lowercases the rest; `startCase`
splits supported word boundaries and capitalizes words. Transform order is
significant, including normalization before `enum` comparisons.

Computed-default providers include `date`, `time`, `datetime`, `dateUnit`,
`searchParams` and `dynamic`, alongside the keyword plugin's providers. Date/time
providers may accept a format and duration offset; `searchParams` reads an
explicit query parameter in a browser host. These values initialize missing
properties once and never become reactive derived fields. Provider arguments
and environment access must be declared by the host. A non-browser runtime may
omit browser providers and must report that limitation.

`dynamic` compiles a function from its arguments and therefore requires
`jsonformsExtended.security.allowScriptEvaluation` before compilation. Cached
validators must not allow a privileged form's compiled expression to execute in
an unprivileged form. Separate the compilation cache by policy or otherwise
recheck the permission at the execution boundary.

When `errorMessage` wraps underlying validator errors, restore their original
keywords and instance paths for per-field routing and pre-touch filtering, while
applying the authored message. Resolve that message through
`error.errorMessage.<message>` and use its literal text when no translation is
available. Localize validator wording at presentation time so a locale change
refreshes errors without requiring a data edit. Do not assume validator-time
message mutation alone supplies that behavior.

#### Error-message customization and translation

For example, a control can supply an explicit translation prefix:

```json
{
  "type": "Control",
  "scope": "#/properties/name",
  "i18n": "profile.name"
}
```

The existing default core pipeline uses the following precedence when the
control has errors:

1. `profile.name.error.custom`, if resolved, replaces the combined error text
   for that control. Its translation context includes schema, uischema, path,
   and the matching errors.
2. Otherwise, each error is translated separately. For a minLength error, try
   `profile.name.error.minLength`, then `error.minLength`.
3. If neither resolves, try translating the error's message itself, then use
   the fallback message. Core also simplifies its recognized default English
   required-property message for presentation beside the affected control.
4. Combine the resulting per-error messages using the core presentation helper.

The keyword minLength is illustrative; the same lookup applies to other error
keywords. The UI-schema i18n prefix takes precedence over schema i18n metadata;
without either, core derives a prefix from the data path, omitting array indices
and using root for the empty path. A host-supplied translateError callback can
replace the default per-error translation behavior. Missing translation lookups
must preserve the undefined/fallback semantics expected by this pipeline.

For example, a locale catalog for the Control above can provide:

```json
{
  "profile.name.error.minLength": "Enter a longer name.",
  "error.required": "This field is required."
}
```

The first key overrides minLength only for that control prefix. The second is a
global fallback for required errors. To replace every displayed error for the
name control with one message, add `profile.name.error.custom`. Use that key
only when intentionally replacing all its error details. Catalogs are passed
through the form's i18n translator, not through UI options or JSON Forms config.

A minimal TypeScript host using flat catalog keys can use core's createTranslator:

```ts
import { createTranslator } from '@jsonforms/core';

const messages: Record<string, string> = {
  'profile.name.error.minLength': 'Enter a longer name.',
  'error.required': 'This field is required.'
};
const i18n = {
  locale: 'en',
  translate: createTranslator((key, fallback) => messages[key] ?? fallback)
};
// Supply i18n to JsonForms; replace the catalog/translator when locale changes.
```

Return the supplied fallback for an unknown key, including undefined when no
fallback was supplied. Returning the key itself for every miss would stop the
error lookup chain prematurely. Translators may use the context's error.params
for parameterized messages; interpolation syntax belongs to the translator, not
JSON Forms core. An empty-string translation is an intentional resolved value,
not a missing key, and does not clear the underlying validation error.

**AJV localization versus control overrides.** The extended web validator profile
uses ajv-i18n to localize generated AJV messages after failed validation. It reads
the current i18n locale, first tries an exact supported locale, then its language
subtag (for example bg-BG falls back to bg). If no localizer is available, it
leaves the generated messages unchanged. The integration includes Bulgarian
localization. This is validator-adapter behavior, not a portable UI-model option
and not automatic behavior of a caller-supplied AJV instance.

Control translation happens after this validator localization. Thus a localized
AJV message is the fallback, while field-specific and global keyword keys can
still replace it. Prefer stable keyword keys to keys made from raw error text:
AJV message text may change with locale or validator version. ajv-i18n localizes
validator messages; it does not translate labels, buttons, or arbitrary host
additionalErrors. Its wrapper reads the locale when validation runs; refreshing
already-produced messages on a locale change requires the host's localization
or revalidation lifecycle, not a change to form data.

A render-time AJV localization adapter must preserve this precedence too: localize
a copy of the generated error, then apply the normal per-error translation
lookup with that localized message as fallback. Do not return the localizer's
message before checking field-specific and global keyword overrides, and do not
mutate errors stored in form state. Preserve intentionally empty translations.
For example, `reviewers.error.contains` may say “Select Lead for at least one
reviewer.” even when an AJV localizer is active. Verify both a resolved override
and a missing override; the latter must retain the localized AJV fallback.

**Scalar-composition summaries.** These use the same combined-message and
per-error override pipeline. For a Control with `i18n: "quantity"`, supported
overrides include `quantity.error.custom`, `quantity.error.oneOf`,
`quantity.error.anyOf`, and global `error.oneOf` / `error.anyOf`.
`composition.multipleMatches` and `composition.noMatch` customize the renderer's
summary fallback, distinguishing multiple matching oneOf alternatives from no
matching alternative. The ordinary control/keyword/message overrides still take
precedence. Without an explicit composition override, preserve messages already
localized by ajv-i18n or supplied by ajv-errors; do not replace them with an
English summary. More explanatory summaries may replace stock English AJV text.
A custom i18n.translateError callback replaces the default per-error pipeline;
the control's error.custom override still takes precedence over that callback.

The extended validator profile also accepts the optional schema extension
`errorMessage`, provided by ajv-errors. For example, a property schema may be:

```json
{
  "type": "string",
  "minLength": 3,
  "errorMessage": {
    "minLength": "nameTooShort"
  }
}
```

The extended adapter translates the custom message through
`error.errorMessage.nameTooShort`, falling back to `nameTooShort`. A translation
such as "Enter at least three characters" therefore supplies the readable text;
a literal readable message may also be used when no translation is provided.
The adapter unwraps the ajv-errors wrapper into its underlying errors, preserving
their keywords and paths while assigning the custom message. Subsequent core
control-level or keyword-level translations can still override that message.
One custom message may cover several underlying errors; it does not imply a
single error object or erase their individual validation meaning.

**Combined error summaries.** Array and container indicators must retain structured
error boundaries rather than concatenate messages into a sentence or split an
already formatted sentence heuristically. Show each message on a separate list
item with translated field context and one-based array row numbers. Identical
messages from different rows remain separate. Include the total number of
eligible validator errors, including host additional errors, using the same
validation-mode rules as the indicator. Counts describe errors, not visible
controls or rendered list items; intentional empty-string translations must not
change validity or counts.

Use the ordinary control `error.custom`, per-error translator, field keyword,
global keyword, and schema `errorMessage` pipeline described above. Do not invent
a parallel business-message dictionary or replace localized/schema messages
with generic English. Authors should supply actionable domain text through those
existing mechanisms. Resolve field labels through the same i18n keys as the
field; preserve a readable path when a label cannot be resolved.

Initially show at most three entries. Longer summaries offer translated
`validation.showMore` (with remaining `count`) and `validation.showLess` actions.
Expansion affects presentation only. Bound expanded content to the viewport and
allow vertical scrolling, wrapping long messages instead of widening the form.
Interactive actions belong in a keyboard-accessible popover or equivalent
native disclosure, not an interactive ARIA tooltip. A noninteractive hover/focus
preview may accompany the focusable summary trigger. Opening, closing, and
expanding the summary must not modify form data or hide field errors.

The errorMessage keyword is a validator-specific schema extension, not a
UI-schema field, jsonforms.config option, or standard JSON Schema keyword.
Other validator integrations must declare equivalent support or its absence.

Renderer-generated additionalErrors participate in the core control-message
pipeline when mapped to the control's path. They do not automatically pass
through the Ajv validator-message localization wrapper. Participating renderers
must provide meaningful fallback messages and support translation, including
Monaco's single error summary and file-selection failures. Preserve error
ownership, paths, and validity independently of the displayed translation.
Changing locale should refresh displayed messages without requiring a data edit;
this applies to validator errors and renderer-generated additionalErrors alike.

## 16. Adaptive behaviour

This model supports **adaptive layout**, not separate arbitrary UI-schema
branches per device class.

Portable mechanisms: horizontal and vertical layouts; the span, weight and
fixed sizing model; `wrap`; `minItemWidth` auto-fit; natively responsive
widgets; and documented family capability behaviour.

A renderer on a small screen SHOULD use platform-appropriate controls while
preserving semantic intent — a date Control may present a platform date picker
on one device and a desktop picker on another; both are the same Control.

Deeply nested structural layouts remain spacing-neutral.

Explicit named breakpoint overrides are deferred. Renderer specifications may
provide platform-specific enhancements, but portable documents SHOULD rely on
content- and container-driven layout first.

A host MAY select a different UI schema where a product genuinely requires a
substantially different workflow. That is **composition outside the portable
element language**, not a hidden automatic branch inside a Control.

## 17. External context, visibility and security

Rules remain the portable mechanism for data-driven visibility and enablement.

External application state — role, feature flags, entitlements, workflow mode
— may influence which UI schema, config or context the host supplies. A host
may also expose safe values through the permitted dynamic `context` namespace
for non-sensitive presentation options.

> **UI visibility is never an authorization boundary.**

An administrative UI may include controls a restricted UI omits, but the
service MUST independently reject unauthorized operations. Hiding a Button or
Control is presentation, not enforcement.

Recommended patterns, in order:

1. The host selects or composes the authorized UI schema for the current user.
2. Ordinary rules handle conditions based on form data.
3. Safe external context may drive non-structural dynamic values.
4. Renderer and platform escape hatches are **not** an authorization system.

This model does not define portable dynamic replacement of structural fields
such as `elements`, `rule`, `name` or `variant`. Where authorization requires
structural differences, compose or select the UI schema outside the resolver.

## 18. Renderer behaviour specifications

The portable model defines semantics. Each renderer set SHOULD carry its own
behaviour specification documenting: canonical variants supported; established
options and their encodings; schema keywords honoured; default and fallback
behaviour; visual and usability behaviour; accessibility; invalid and
out-of-domain data behaviour; read-only, enabled and constraint behaviour;
internationalization support; useful underlying-library enhancements; and its
escape-hatch namespace.

### 18.1 Catalogue structure and provenance

A catalogue entry describes **runtime behaviour**. Suggested renderer names
are descriptive identifiers, not new serialized types or variants.

Every entry MUST state its provenance (§5.2), including option-level
exceptions to the entry's own origin, and MUST identify:

- Suggested name, visual presentation and interactions.
- Exact selection conditions, including selection with a **generated** UI
  schema, tester rank, and competing renderers.
- Supported options with types, defaults and precedence — **separating
  selection, display, storage and underlying-component properties**.
- Schema keywords used for selection, widget constraints and validation.
  **Validator support alone does not establish widget support.**
- Missing, null, invalid, read-only, disabled and fallback behaviour.
- Applicability per family and version.

Entries MUST include a concrete schema and UI-schema selection example, and at
least one **incompatible-schema** example where selection could otherwise
mislead. Examples supplement applicability rules; they do not replace them.

**A feature present in one family MUST NOT be described as supported by all.**
Package membership and upstream provenance are separate facts.

### 18.2 Separating the effects of a keyword

Every entry must separate these. A keyword may have more than one effect, and
listing it as "supported" is insufficient:

| Effect | What must be explained | Example |
| --- | --- | --- |
| **Selection** | Eligible types, resolved scope, required schema/UI combinations, competing presentations | A date control accepts a string with a schema or UI date format |
| **Presentation** | Changes to the visible widget or available interactions | A meridiem option changes time-picker interaction |
| **Input restriction** | Which edits are prevented, and on which input path | A temporal format bound limits restricted picker choices; complete typed range violations retain validation feedback |
| **Conversion and commit** | Parsing, formatting, stored value, and when edits reach form data | A save format changes serialization; staged actions defer commits |
| **Validation only** | Errors reported without changing the interaction | A `pattern` does not imply a mask or character filter |

### 18.2a Temporal pickers and `views`

`options.views` names the panels a temporal control offers. It is **not
date-only**: a date control takes calendar views, a time control takes time
columns, and a date-time control takes both.

| Control | Admissible views |
| --- | --- |
| Date | `year`, `month`, `day` |
| Time | `hours`, `minutes`, `seconds` |
| Date-time | all six |

The **finest date view named** is where the calendar lands. The time views
name the columns drawn.

Two rules make it safe to author:

- **`views` never changes the save format.** A year/month picker storing a
  full date is a legitimate request, and asking for hours and minutes does not
  stop seconds being stored. An implementation MUST NOT infer one from the
  other — inferring picker granularity from the stored format makes storage
  decide the interaction, which is backwards.
- **An array naming no view of a kind the control uses leaves that half to the
  display format**, rather than blanking it. This matters because a date-time
  control's natural default array contains date views that a time panel must
  not read as "no columns".

A view the control cannot use is accepted and ignored.

**A separate option for whether selecting a value closes the picker is not
introduced.** Some renderer families spell that as its own boolean; here it is
the staging behaviour of `showActions`, and two encodings for one presentation
are forbidden (§5.2).

### 18.3 Shared control behaviours

These apply across the catalogue and are specified once.

**Placeholder hints.** `options.placeholder` supplies a hint shown in an empty
control. It is a hint, never a value, never a default, and never a substitute
for a label.

**Input composition and string length.** Text entry MUST NOT break
composition-based input methods. String length constraints operate on the
**stored representation**; a displayed representation may differ, and a
grapheme is not necessarily one code unit.

**Initial focus.** `options.focus` requests initial focus. At most one element
should claim it; where several do, the first in document order wins and a
diagnostic SHOULD report the rest.

**Descriptions and required markers.** `showUnfocusedDescription` controls
whether a description is visible when the control is unfocused.
`hideRequiredAsterisk` hides the visual required marker **without changing
required validation or accessible required-state information** — a renderer
MUST NOT implement it by removing the accessible required state.

**Clear affordance.** Where a control offers clearing, clearing writes the
shared empty representation and is subject to read-only, enabled and
`restrict`. Clearing is an ordinary edit and does not prompt the destructive
confirmation policy.

### 18.4 Pending edits, commit timing and cancellation

A renderer integration may debounce ordinary edits. This is a behavioural
contract, not a core-managed queue and not a debounce option.

Distinguish the **visible draft**, the **committed data and its validation**,
and the **snapshot delivered to host listeners**. These update at different
times. Neither delay makes validation of an earlier value proof that the
latest draft is valid.

- **Blur SHOULD flush** a pending committable edit before presenting its
  validation errors.
- **An action that consumes form data MUST resolve pending edits** and use the
  resulting data and validation state before proceeding. Do not rely on blur
  alone: keyboard-triggered actions may run without moving focus.
- **Flushing does not** force incomplete drafts into the data model, bypass
  input restrictions, or accept edits explicitly staged until confirmation.
  An unresolved draft MUST NOT silently be treated as committed.
- **Clear supersedes queued edits**, so an old callback cannot restore the
  cleared value.

**Disposal must leave no stale write callback active**, and there are three
ways a queued write outlives its target — only one of which is disposal:

1. **The control is disposed.** Cancel — **do not flush**: flushing on
   disposal can recreate deleted data or write into a different item.
2. **The control is rebound to another path.** The queued write still carries
   the old path and must be cancelled.
3. **The path stays and what it points at changes.** This is the case
   implementations miss: deleting an array item shifts the rest, and a list
   keyed by path does not unmount or rebind the control at that index — it
   re-renders with a different item's data. Neither of the first two
   mechanisms fires.

**The path alone is insufficient evidence that the original target still
exists.** The evidence for the third case is the value arriving from outside,
which MUST be distinguished from **normal host feedback of the
just-committed data** — otherwise the guard cancels ordinary typing, because
a commit lands mid-word and returns as a property while later keystrokes are
still queued. Recording the value last written is sufficient to tell them
apart.

Recheck mutation permissions and target identity before a delayed commit: a
queued edit MUST NOT bypass a later read-only state or restriction.

### 18.5 Choice and suggested-string controls

These are suggested renderer names, not additional UI-schema element types.
All use `Control`. Searchable finite choices and free-text suggestions have
different data semantics even when their widgets look similar.

| Suggested name | Schema applicability | Typical presentation |
| --- | --- | --- |
| Enum choice control | Resolved schema defines `enum`; core also recognizes `const` as a single-choice case | Select one permitted value from a dropdown or searchable list. Supported value types must be declared per renderer. |
| Named choice control | Supported `oneOf` with `const` on each branch; branch `title` supplies a human-readable label when present | Select a label while storing its corresponding constant value. Arbitrary `oneOf` schemas are not finite-choice lists. |
| Autocomplete choice control | Same finite-choice applicability as above, with searchable presentation requested or selected by default | Type a search query to filter permitted choices, then select a value. Search text is not itself a new allowed value. |
| Suggested string control | String schema with UI `options.suggestion` containing an array of strings | Free-text entry with optional suggestions; values outside the suggestions remain permitted if the schema accepts them. |
| String-or-enum control | Supported `anyOf` containing a string enum branch and a non-enum string branch | Offer the enum values as suggestions while allowing values accepted by the other branch. Additional schema constraints still apply. |

The String-or-enum presentation must not be generalized to every `anyOf`.
Renderer-family specifications must define the accepted branch shapes and
fallback to ordinary combinator rendering for unsupported combinations.

#### Choice options and observable effects

| Option or schema keyword | Effect |
| --- | --- |
| UI `autocomplete: true` | Requests searchable finite-choice selection. |
| UI `autocomplete: false` | Requests a non-searchable choice selector. It does not request radio buttons or imply a platform-native select. |
| UI `autocomplete` absent | Preserves the renderer family's documented default. No universal default is imposed. |
| UI `format: "radio"` | Requests visible radio choices through the existing convention. Interactions with other presentation requests must be documented. |
| UI `suggestion` | An array of suggested strings; does not add an enum constraint or authorize values forbidden by the schema. |
| UI `placeholder` | Input/search/empty-selection hint; does not become a stored value. |
| UI `clearable` | Exposes a clear action where supported, subject to enabled/readonly state and the host's empty-value contract. Clearing may produce a validation error. |
| Schema `enum` / `const` | Supplies permitted stored values, affecting both choice construction and validation. |
| Branch `title` and supported i18n metadata | Supplies choice labels without changing stored values. |
| Schema `pattern`, `minLength`, `maxLength` for free-text strings | Validates the stored string; suggestions do not replace these constraints. Input restrictions, if any, must be separately documented. |

Use the established `options.autocomplete` encoding. Searchability does not
mean accepting arbitrary
new values. Likewise, a combobox-shaped widget is not sufficient evidence
of search support: a searchable renderer must define how the displayed
choices respond to the query, including labels, locale, and empty results.
Remote lookup and asynchronous suggestions are not implied by this option.

An example of finite searchable choices:

``` json
{
  "type": "Control",
  "scope": "#/properties/department",
  "options": { "autocomplete": true }
}
```

Here the department property defines its permitted values through `enum`
or a supported constant-based `oneOf`. For a plain string accepting other
values, use suggestions instead:

``` json
{
  "type": "Control",
  "scope": "#/properties/department",
  "options": { "suggestion": ["Engineering", "Finance", "Operations"] }
}
```

#### Radio-choice layout and interaction

Suggested renderer names: `RadioGroupControlRenderer` and
`OneOfRadioGroupControlRenderer`. Select supported enum or oneOf/const choices
with options.format radio, using the existing JSON Forms convention. This does
not apply to arbitrary oneOf branch forms. The orientation and interaction rules
below define the project's shared presentation contract.

`options.vertical` defaults to false: arrange choices horizontally and allow
wrapping. True stacks choices vertically. Use one group label with a label beside
each radio, preserving schema choice order. Preserve original choice value types;
labels and internal widget strings must not become stored values. Provide keyboard
navigation and accessible orientation consistent with the displayed arrangement.

Missing data starts with no selection; mounting must not choose the first option.
Activating the selected radio does not clear it. Use the shared clear action,
including focus/hover visibility, enabled/readonly handling, and dynamic-property
clear semantics. Invalid/out-of-domain data remains available for correction and
must not silently map to an unrelated choice. Group descriptions and errors
follow the shared presentation contract.

Format radio determines the presentation; autocomplete has no effect on this
renderer. No additional radio variant or orientation alias is introduced.

``` json
{
  "schema": { "type": "string", "enum": ["Standard", "Express"] },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "options": { "format": "radio", "vertical": true }
  }
}
```

#### Choice-label translation

For example, the department property may have this schema:

```json
{
  "type": "string",
  "enum": ["eng", "fin"]
}
```

Its control can supply a translation prefix:

```json
{
  "type": "Control",
  "scope": "#/properties/department",
  "i18n": "department"
}
```

Core looks up department.eng and department.fin, falling back to eng and fin
as labels. Non-string enum values use their JSON serialization as the initial
label; their stored values retain their original JSON types. The prefix follows
the core precedence described under error-message translation: UI-schema i18n,
then schema i18n, then the data-path-derived prefix.

For constant-based named choices, explicit branch keys make translations
independent of the fallback title:

```json
{
  "type": "string",
  "oneOf": [
    {
      "const": "eng",
      "title": "Engineering",
      "i18n": "departments.engineering"
    },
    {
      "const": "fin",
      "title": "Finance",
      "i18n": "departments.finance"
    }
  ]
}
```

The exact key departments.engineering supplies the first label, with Engineering
as the fallback; selecting it still stores "eng". Without branch i18n, core
uses the control prefix plus the fallback label: department.Engineering in this
example. Without a title, the fallback label is the string constant itself or
the JSON serialization of a non-string constant. Branch i18n is an exact key,
not a prefix to which the title or value is appended.

Core's multi-choice mapper uses the same label helpers for enum or constant-based
oneOf choices in an array's items, with the array control's translation prefix.
These mappings apply to supported choice presentations such as dropdowns,
searchable choices, and radio groups; they do not turn arbitrary oneOf schemas
into finite choice lists.

Locale changes must refresh available and selected labels without modifying
selection or stored data. Distinct values remain distinct choices even when
their translated labels are identical. Labels and translation keys must never
serve as stored-value identity; follow the identity requirements below.

#### Choice identity and existing values

The selected value MUST retain its JSON type. A numeric option `1` must not
be stored as string `"1"`; the two must remain distinguishable if both are
permitted. Widget identifiers and labels are presentation details, not the
identity of form values. Renderers must declare their supported enum value
types, including any limits for null, booleans, objects, or arrays.

Do not treat a permitted empty string or null as absent merely because the
widget uses that value internally to represent no selection. Unsupported
value shapes need a documented fallback. Unknown existing values must remain
unchanged until an explicit edit and be represented according to section 19;
filtering the list must not silently clear or substitute the current value.

Renderer-family specifications must document default searchability, explicit
option support, registry-dependent selection, matching behavior, label/i18n
mapping, and keyboard interaction. The established existing renderer convention uses
autocomplete by default and a select when `autocomplete` is false; other
families may have different defaults or separately registered renderers.
This distinction does not create a new portable encoding.

### 18.6 Shared detail UI-schema selection

For object controls, array item forms, list-with-detail and any renderer using
the shared mechanism, select the form description in this order:

1. If `options.detail` is an **inline UI-schema element with a `type`**, use it.
2. If `options.detail` is the literal `"GENERATE"`, generate the fallback form
   and **bypass registered UI schemas**. Emit the uppercase spelling; matching
   SHOULD be case-insensitive.
3. Otherwise use the **highest-ranked applicable registered** UI schema.
4. If none matches, generate the fallback form.

Do not invent another registered-form selection string, and do not treat
arbitrary detail strings as registry identifiers.

**Scopes inside a detail form are relative to its object or item schema**, and
the original item data path and root schema reference context are preserved.
UI-schema registry testers select a *form description*; renderer testers
select *components* for the resulting elements. These are separate registries
and separate steps, and MUST NOT be conflated.

Inline, registered and generated detail forms all pass through dynamic
resolution and normal nested dispatch. **Rendering a generated form MUST NOT
initialize or overwrite data.**

**Registry testers** have a different signature from renderer testers. They
MUST be synchronous and side-effect-free, may run more than once during
selection, and MUST NOT mutate data or schema or depend on invocation count.
Return the not-applicable constant to reject; otherwise a finite non-negative
rank, highest wins, first registered wins ties.

**A registry entry that matches an object's own schema can be dispatched back
to itself**, producing an infinite tree that exhausts memory on first render
with nothing thrown — an infinitely deep tree is legal. An implementation
using this registry MUST guard against re-entering the same entry for the same
schema and path, and the guard belongs in the object-rendering path rather
than in any one renderer.

### 18.7 Array add-item initialization

Explicit **Add** initializes a new value. This is separate from validator
default assignment and from provisional display fallbacks.

| Item schema | Initial value |
| --- | --- |
| Explicit default | A **deep copy**, including `false`, `0` or `null` |
| String without a temporal format | Empty string |
| Number or integer | `0` |
| Boolean | `false` |
| Array | Empty array |
| Object without an explicit object default | Populated from declared property defaults; properties without defaults are **not** filled with placeholders |
| Null | `null` |
| String with schema format date, time or date-time | A current temporal value serialized for that format |

**These are initial values, not a guarantee that the item schema is
satisfied.** A missing required property remains an error until supplied;
initializing a number to `0` does not satisfy a minimum of 10.

The temporal case is **schema-driven**. Selecting a date renderer through UI
options alone does not give a plain string schema that initialization
behaviour.

With `restrict` enabled, Add obeys structural constraints, read-only and
enabled state, and the add guard. **A newly added item may still require
completion** — full item validity is not a prerequisite for inserting an
editable item, and this exception does not authorize bypassing ordinary edit
guards or changing existing invalid values.

**Rendering an existing item MUST NOT repeat initialization or replace its
data.** Object and array defaults MUST NOT share mutable instances between new
items, and MUST NOT mutate the schema. Initialization is not a satisfiability
solver: for combinators, do not assume the first usable branch produces a
value valid against the whole schema.

### 18.8 Errors without a rendered target

Schema errors can apply to an object, or to a property with no available
control. Delegating object content to a generated or registered layout does
**not** imply every error can be displayed by a child control.

Provide accessible feedback for object-level errors **near the object
editor**, and make the failure clear even where no corresponding input can be
focused.

Retain field-specific feedback beside available controls. Avoid duplicating
every message at every enclosing level; implementations may combine local
explanations, summary indicators and accessible error lists.

**Hiding a control does not discard its errors or exempt its data from
validation.** Eligible errors must remain discoverable without forcing hidden
controls visible merely to show them.

**Never silently delete, rename or rewrite invalid data to remove an error
that has no rendered target.**

### 18.9 Array-level errors and item summaries

Errors at the array's own path are distinct from descendant errors. A summary
requiring structured array-level errors MUST obtain them from the appropriate
error selector, **not reconstruct them from display text**, and MUST NOT
assume the integration supplies a separate structured array-level property.

Provide an accessible explanation of array-level errors near the array,
**including when it has no items** — `minItems` can fail for an empty array
while a missing property inside an item belongs to that item's detail.

An option that suppresses the child-error summary does **not** suppress the
array's own error explanation. Where a combined summary is used, retain an
appropriate array-level presentation when the summary is hidden.

**Item badges and summaries associate errors by path segment.** An error
belongs to an item when its normalized path identifies that item or a
descendant, not merely a textual prefix: `employees.10.name` MUST NOT count
for `employees.1`. Mapped additional errors follow the same rules. Targeting
must remain accurate after reorder and deletion.

**An indicator that shows only a count communicates nothing to a screen
reader.** Where a marker carries a number, the accessible name carries the
explanation.

### 18.10 Matching constraints: `contains`

`contains` requires matching entries; `minContains` and `maxContains`
constrain **how many entries match**, not the array's total length. Without
`minContains`, `contains` requires at least one match. The count keywords have
no effect without `contains` and require a dialect that supports them.

These constraints do **not** select a renderer, replace items, or prescribe a
schema for every item. They apply across the complete array, including a
tuple's fixed prefix and additional items, without changing positional field
selection. Expose violations through the array-level error contract, including
for an empty array — no item need exist for the error to be discoverable.

Under `restrict`, a family SHOULD prevent a discrete deletion that would take
a satisfied minimum below its required value, **where matching can be
evaluated reliably**. Evaluate against current data and the validator's own
dialect semantics **without mutating data** through default assignment or
transforms. Where reliable evaluation is unavailable, retain validation
feedback and document the limitation rather than guessing which entries match.

This does not require blocking every intermediate edit: incomplete edits and
transferring a status between entries may temporarily violate counts. **Never
automatically add matches, change item values, or delete excess matching
entries.**

### 18.11 Tuple control: positional array fields

Tuple orientation resolves options.vertical, then
config.jsonformsExtended.tuple.vertical, then false. Generic config.vertical and
config.jsonformsExtended.vertical are ignored. Explicit false overrides true.
This default affects only tuples, not choice groups or layouts.

**Extended presentation contract:** `options.showBorder` defaults to `true`
(global defaults may be overridden per control). Enclose the tuple heading,
fixed positions, additional-items section, and array-level error messages in
one subtle visual boundary. Additional items form an inner section with spacing
or a divider rather than a separate card. `showBorder: false` removes the outer
border and its padding for compact embedding, without removing labels, errors,
or the grouping semantics. This remains an array-bound Control, not a Group
layout. `vertical` independently selects a row or column of fixed positions.

For example, coordinates may use
`{"variant":"tuple","vertical":false,"showBorder":false}`; a positional record
with trailing values uses the default border. Array-level validation such as
`maxItems` highlights the tuple heading and error area, not valid Code/Quantity
positions. Child controls retain their own field-level validation feedback.


#### Selection and options

| Schema / UI schema | Selection |
| --- | --- |
| Array with positional schemas (`items: [...]` in older drafts, or `prefixItems: [...]` in draft 2020-12) | Automatically eligible for the tuple control; no variant is necessary. Renderer ranking still applies. |
| Array with a single item schema and equal explicit `minItems` / `maxItems` | Retain ordinary array selection unless tuple presentation is explicitly requested. |
| The same uniform fixed-length array with `options.variant: "tuple"` | Render the specified number of positions using the shared item schema. Bounds must be equal non-negative integers. |
| Uniform array with missing or unequal bounds and `variant: "tuple"`, or a non-array schema | Unsupported configuration; report a configuration diagnostic rather than guessing a positional count. |

`options.vertical` defaults to false: arrange positional fields in a row,
allowing responsive wrapping; true stacks them in a column. Derive labels from
each positional schema's title, with a localized position fallback. Delegate each
value to JSON Forms using its positional schema, array-index data path, and the
original root schema for reference resolution. Do not use a single item schema
for all positions when the schema declares different schemas by index.

There are no Add, Delete, or Reorder actions for the declared positions. Equal
bounds alone do not change the presentation of existing uniform-array controls.
An explicit tuple variant may also be accepted for an already-positional schema,
but editors SHOULD omit that redundant encoding.

#### Labels and internationalization

Tuple support includes labels and internationalization for the whole control,
each positional field, and the additional-items section. Reuse the existing
JSON Forms label, description, error translation, and accessible-name conventions.
The parent Control's label describes the tuple as a whole; it must not be copied
onto every delegated field.

For each field, use its effective delegated Control's explicit label when supplied,
otherwise the positional schema title, otherwise a localized position label such
as "Item 1". Visible position numbering is one-based; data paths remain zero-based.
Use the existing translation-prefix precedence: the delegated UI element's i18n,
then its schema's i18n metadata, then the core path-derived prefix. Resolve labels
through `<prefix>.label` with the readable label as fallback; descriptions and
validation errors retain their existing translation conventions. Schema i18n is
JSON Forms metadata, not a standard JSON Schema validation keyword.

Core's path-derived i18n prefix removes array indices. Consequently, different
tuple positions must not be assumed to receive distinct translation keys merely
because their paths differ. Use explicit positional schema i18n prefixes (or
existing delegated UI-schema i18n metadata) when positions need distinct labels:

```json
{
  "type": "array",
  "items": [
    { "type": "number", "title": "X", "i18n": "coordinates.x" },
    { "type": "number", "title": "Y", "i18n": "coordinates.y" }
  ],
  "minItems": 2,
  "additionalItems": false
}
```

For example, an English translation catalog can contain
`"coordinates.x.label": "Horizontal coordinate"` and
`"coordinates.y.label": "Vertical coordinate"`; another locale supplies translated
values under the same keys. Missing translations fall back to X and Y. This
example uses older-draft positional items syntax; prefixItems carries the same
metadata in draft 2020-12.

Uniform fixed-length arrays share their item schema and its metadata. Localize
the position fallback, but do not infer business-specific names such as X/Y from
indices. Authors needing distinct per-position schema labels can use positional
schemas. No new parallel labels/translations option map is introduced here.

Localize the additional-items heading, position labels, Add/Delete and dialog
edit/open actions, dialog titles, and draft/error feedback through the renderer's
existing translator. Position-label translation accepts the displayed position as
a parameter rather than concatenating a fixed English word with a number. Refresh
labels, descriptions, accessible names, and errors when the locale changes without
changing array values, defaults, selection, or active drafts. Compact complex-value
summaries and their dialog controls must retain the positional field's accessible
identity even when the value is empty.

#### Complex position summaries and dialog details

**Extended contract:** reuse composite-cell summary semantics for complex tuple
positions. Object summaries resolve a Control scope against the position value;
without a usable summary, show localized “View details.” Array summaries resolve
against each item, show up to two usable scalar previews and a localized remaining
count, and fall back to the item count. Missing values show localized “Not set.”

Only the Edit icon opens the detail dialog. Summary text remains selectable.
Displaying a summary or opening a dialog must not create or normalize data.

Use the existing ranked UI-schema registry to select a position-specific Control:
its `options.summary` describes the preview and `options.detail` supplies the
dialog UI schema. A registry entry that is already a layout remains usable
directly as the dialog detail. A tuple-wide inline `options.detail` arranges positions (§18.23); position
dialog details come from the selected position Control or registry entry. No separate tuple position-options map is introduced.

For an object position, a selected registry UI schema can be:

```json
{
  "type": "Control",
  "scope": "#",
  "options": {
    "summary": { "type": "Control", "scope": "#/properties/street" },
    "detail": {
      "type": "VerticalLayout",
      "elements": [
        { "type": "Control", "scope": "#/properties/street" },
        { "type": "Control", "scope": "#/properties/city" }
      ]
    }
  }
}
```

For an array of phone strings, summary scope `#` selects each phone string;
detail scope `#` edits the whole position array. Preserve the original root
schema for reference resolution and the actual array-index data path for edits.

#### Coordinate and business examples

A positional coordinate pair needs no presentation variant (draft-07 example):

```json
{
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "array",
    "items": [
      { "type": "number", "title": "X" },
      { "type": "number", "title": "Y" }
    ],
    "minItems": 2,
    "additionalItems": false
  },
  "uischema": { "type": "Control", "scope": "#" },
  "data": [12, 34]
}
```

This presents `X [12]  Y [34]`. In draft 2020-12, replace the positional
`items` array with `prefixItems` and `additionalItems: false` with `items: false`.
The positional-schema count defines the described prefix, not the required data
length: without minItems, missing trailing positions remain schema-valid unless
other constraints require them. Closing the tail prevents extra positions.
See the [JSON Schema array reference](https://json-schema.org/understanding-json-schema/reference/array).

A uniform coordinate pair can request the same presentation explicitly:

```json
{
  "schema": {
    "type": "array",
    "items": { "type": "number" },
    "minItems": 2,
    "maxItems": 2
  },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "options": { "variant": "tuple", "vertical": false }
  },
  "data": [12, 34]
}
```

Uniform schemas use position labels unless a separate supported label mechanism
is configured; use positional schemas when X/Y titles are important. Other uses
include a lower/upper range pair, width/height/depth dimensions, or a business
record encoded as `[productCode, quantity]` with distinct string/integer schemas.
Such presentation does not itself validate relationships such as lower <= upper.

#### Additional items

For positional schemas, show permitted trailing values in an **Additional items**
section below the fixed fields. Label entries by position; there is no property
name input. With an unconstrained tail (the applicable keyword is true or omitted),
use the mixed renderer with type selection. With a tail schema, delegate using
that schema. Older drafts use additionalItems; draft 2020-12 uses items alongside
prefixItems. Renderer sets must declare their supported schema dialects.

**Suggested presentation:** use a distinct section with a heading and an Add
icon button in its header, consistent with the additional-properties control.
Each trailing item has a positional label and a Delete icon button. Use a plus
icon for Add and a trash/delete icon for Delete, with localized tooltips and
accessible names such as "Add item" and "Delete Item 3". Tooltips supplement,
rather than replace, accessible button names. Preserve keyboard and touch access.

Place the positional label above the complete item editor. For mixed values,
align the type selector and delegated value input on the same row; the label
must not push only the selector down. Allow responsive stacking where necessary.
Use each renderer set's normal container, spacing, and action presentation;
these recommendations do not prescribe a CSS framework or new UI-schema options.

Tail Add/Delete actions obey readonly/disabled state, disableAdd/disableRemove,
and minItems/maxItems prevention under restrict. They must not remove or reorder
the fixed prefix. No reorder affordance is required by this contract. If the tail
is forbidden or existing values exceed the permitted count, preserve those values
and expose their errors and an explicit corrective removal action; never truncate
on load. The same preservation applies to an overlong uniform fixed-length array.

#### Missing positions, defaults, and clearing

Render all declared fields even when data is missing, but do not populate the
array merely by rendering it. An explicit edit at a missing index may initialize
preceding missing positions using the shared **Array Add-item initialization**
contract: deep-copy explicit defaults first; otherwise create the supported
unambiguous type's initial value. This includes empty strings, zero, false, empty
arrays, and objects populated from supported property defaults. Preserve existing
preceding values. Commit the filled prefix and the edited value together, without
creating sparse arrays or relying on undefined-to-null JSON serialization.

For schemas `[string, integer]`, editing the second field to 30 while data is []
produces `["", 30]`. For numeric coordinates, editing Y to 34 first produces
`[0, 34]`. These initial values need not satisfy every constraint: an empty string
with minLength 1 remains an error. If a preceding schema has no unambiguous
supported initialization, retain the edit as a local draft and identify the
position needing input rather than inventing a type or null value. The shared
pending-edit and validity contract applies to such drafts.

Absence and emptiness are distinct: [] has no first position; [""] contains an
empty string at index zero. Clearing an existing string preserves that empty
string. Value clearing must never splice the array, shift later positions, or
write undefined into it. For a type without a natural empty value, such as a
non-nullable number, keep a cleared input as a local draft with appropriate
feedback; do not silently replace it with zero or null. Null is an explicit value
only where the schema permits it. Empty objects and arrays remain present values.

#### Validation placement

Apply the shared validation and pending-edit contracts to tuple fields:

- Array-level errors, including minItems, maxItems, and uniqueItems violations,
  appear beneath the tuple as a whole. An array-level error must not automatically
  mark every positional field invalid.
- Position-specific errors appear beside the corresponding delegated field,
  using its array-index data path.
- Nested errors appear at the relevant fields inside a complex position's detail
  dialog. Keep an accessible error indicator beside the closed summary so errors
  remain discoverable without opening every dialog.
- Feedback for uncommitted input, such as clearing a non-nullable numeric
  position, stays beside that editor and follows the shared pending-edit
  contract. Do not present it as a validator error against a value that has not
  been committed.

This placement applies to validator errors and applicable additionalErrors under
the shared error-display rules. Preserve validation independently of whether a
detail dialog is open.

For example, this older-draft positional schema selects the tuple renderer
without an explicit variant:

```json
{
  "type": "array",
  "items": [
    { "type": "string", "minLength": 1 },
    { "type": "integer", "minimum": 1 }
  ],
  "minItems": 2,
  "additionalItems": false
}
```

| Data | Feedback |
| --- | --- |
| `["Code", 0]` | Minimum error beside Item 2. |
| `["", 3]` | Minimum-length error beside Item 1. |
| `["Code"]` | Array-length error beneath the tuple; Item 2 remains available for entry. |
| `["Code", 3, true]` | Excess-item error beneath the tuple; preserve Item 3 and offer corrective Delete, subject to the shared removal restrictions. |

A missing position does not itself contain an invalid value: in the third
example, minItems fails at the array level. Do not fabricate an integer-type
error for the absent Item 2 or populate it merely to display validation.

#### Complex positional values

Object and array positions SHOULD use compact summaries with an edit/open action,
similar to composite table cells. Open a dialog containing a delegated detail form
for that position. Reuse the existing detail UI schema / ranked registry resolution
and fallback generation mechanisms, retaining the position's schema, data path,
and original root schema. This contract does not introduce a new tuple-specific
per-index detail-option encoding. Apply the shared composite-dialog editing,
readonly, pending-edit, and error-display behavior. Errors must remain discoverable
when the dialog is closed, and opening a missing value must not create it until an
explicit edit requires initialization.

Use a dedicated edit-icon button beside selectable summary text. The detail
dialog uses the renderer set's normal dialog surface, title, content area, and
clearly visible action footer. Edits stay in a private draft until Apply commits
the position once. Cancel, Escape, and other dismissals discard the draft. See
the shared composite-dialog action contract below.

The footer optionally offers **Clear** (empty contents) when `showEmptyButton: true`, reusing the shared composite action,
tooltip, and translation keys (including `composite.empty`); no new tuple option
is introduced. Empty an object position to `{}` or an array position to `[]`.
This draft edit preserves the position and the containing array's length; Apply commits it.
Do not offer **Remove value** for a fixed position or write undefined, create a
hole, or shift subsequent positions. Removing a whole trailing position remains
the Additional Items section's explicit Delete action.

For example, emptying Address in
`[{"street":"Main Street"},["111","222"]]` produces
`[{},["111","222"]]`. Emptying the second position instead produces
`[{"street":"Main Street"},[]]`. Opening either dialog alone changes nothing.

Disable Empty contents when the value is absent or already empty, the control is
readonly/disabled, or `disableRemove` is true. Under `restrict: true`, also
disable it when applicable restrictions forbid the empty value: for example,
object `required` or positive `minProperties`, array positive `minItems`, or
`contains` with a required positive matching count. Evaluate these restrictions
against the position schema, not the containing tuple's length constraints.
With `restrict: false`, allow emptying and report resulting validation errors;
readonly/disabled state and `disableRemove` still apply.


Apply composite clearing according to the positional context: Empty contents
retains {} or [] at the same array index, subject to the shared structural
restrictions. Do not offer Remove value for a fixed position or write undefined
into an array slot. For an additional item, removal belongs to its explicit
Delete action in the additional-items section.

For example, emptying the object in ["Office", {"city": "Sofia"}] produces
["Office", {}]. It must not produce ["Office"], a sparse array, or an implicit
null value. If that object is an additional item rather than a declared position,
its separate Delete action may produce ["Office"], subject to the array's
removal restrictions.

### 18.12 Shared array action options

`disableAdd` and `disableRemove` are booleans, both **false** by default,
resolved from element options over global config, and retained at the **top
level** of config.

| Option | Effect |
| --- | --- |
| `disableAdd` | Prevents inserting items, independently of current array size |
| `disableRemove` | Prevents deleting items, independently of current array size |

These leave existing item values editable unless another rule disables editing,
and **neither disables reorder**. A `false` value merely removes this option's
prohibition; it cannot override read-only or disabled state, core-derived
action restrictions, or count prevention under `restrict`.

**Hide or disable the affordance *and* guard the handler.** Apply the policy to
toolbar actions, row actions, keyboard shortcuts, context menus, duplication,
paste-driven insertion and deletion, and batch operations. **Recheck
permissions after any confirmation** — a confirmation never grants permission
to add or remove.

### 18.13 Composite cell detail editing

Suggested name: **Composite cell**; a project extension usable by ordinary
tables and the AG Grid control. Object and array cells show a summary and an
edit trigger opening a dialog with a JSON Forms form for that cell's value.
Scalar cells continue to use appropriate scalar cell renderers.

| Cell option | Meaning |
| --- | --- |
| `options.cells.<property>.summary` | A Control-shaped summary descriptor. For an object, `scope` selects a value relative to that object. For an array, it selects a value relative to each item; `#` selects a primitive item itself. This is not an arbitrary inline form renderer. |
| `options.cells.<property>.detail` | A UI-schema element or layout defining the dialog form, relative to the cell schema/data. |
| Detail omitted | Dispatch `{ "type": "Control", "scope": "#", "label": false }` for the whole cell value. |
| Summary omitted or unresolved | Localized generated description: array item count, empty-object description, field-not-specified label, or object title/generic details label when no field summary is available. Reserve the unset-value label for missing values. |

Array cells use a localized item count by default. An explicit summary descriptor
enables a short per-item preview: show up to two resolved, nonempty scalar values
in array order, separated by commas, followed by a localized "(+N more)" suffix
for items not represented in the preview. Preserve false and zero as text; skip
null, missing, empty/whitespace-only, and object/array results. The remaining count
includes skipped items, so the preview does not imply those items are absent.
If no usable value resolves, fall back to the total item count. Empty [] shows
"0 items"; an absent array shows the localized unset-value label.

For example, summary { "type": "Control", "scope": "#/properties/name" }
on an array of people can show "Alice, Bob (+3 more)". On an array of phone-number
strings, summary { "type": "Control", "scope": "#" } can show
"555-0100, 555-0200 (+1 more)". No new template language or summary-limit option
is introduced. Both object and array cells retain independent detail configuration.

**Label summaries and row-bound columns.** `options.cells[key].summary` may be
an existing Control preview descriptor or a Label UI-schema element. A Label
is dispatched through the renderer registry. `data` remains the whole form root;
`item` exposes the current row for both property-bound and row-bound columns.
Label summaries omit object/array type icons. Existing localization, interpolation
and escaping rules apply;
for example, `{"type":"Label","text":"{city} · {phone}","options":{"interpolate":true,"textParams":{"city":"{item.contact.city}","phone":"{item.contact.phone}"}}}`.
Label summary text remains selectable for copying; clicking the text does not
open an editor. Show a separate edit icon button only when an explicit `detail`
is configured, with a localized tooltip and accessible name. Without `detail`,
there is no dialog-opening action. This applies to normal tables and AG Grid.
A Label summary without explicit details must not display cell validation errors.
With explicit details, its cell indicator includes only errors under the Control
scopes exposed by that detail layout. For example, Full name editing firstName
and lastName must not inherit a Notes error from the same row. Row and collection
indicators continue to include all their errors. A detail Control scoped to `#`
includes errors throughout its bound value.
A virtual Full name column can interpolate `{item.firstName}` and
`{item.lastName}` and supply a detail layout with controls for those two row
properties. A row-bound column must not offer an action to clear the whole row.

Summary rendering is read-only and does not mutate form data. Updates to the
bound value refresh the summary. Label summaries require the corresponding
Label capability; interpolation is provided by the extended renderer set.

By default, `columnDefs[].field` selects a property of each row. Setting
`scope: "#"` binds the column to the entire row instead; `field` remains a stable
column key used to look up `options.cells[field]` and must not collide with
another column key. No data property is created. `headerName` sets its heading.
For example, `{"field":"applicantSummary","scope":"#","headerName":"Applicant","width":260}`
can use a Label summary containing `{name} — {email}`, with declared
`textParams` reading `{item.name}` and `{item.email}`. Dynamic parameter
resolution requires `config.jsonformsExtended.dynamicValues.enabled: true`.
The gate applies equally to `item`, `data`, `config` and `context`; a Label
cannot bypass it. Namespaces are read from declared `textParams`, while the
translated text references only those parameters. Outside a row summary,
no current row is supplied.

AG Grid sorting and text filters on Label summary columns use the resolved Label text,
including declared interpolation parameters, rather than the underlying object.
The same dynamic-value access gate applies to sorting and filtering; neither may
expose data that the Label is not allowed to read. Native value getters, comparators and filter value getters
may explicitly override this behavior. Sorting does not change the cell editor
binding or the source-row identity.

**Row context and updates.** Use the name `item` in both the form context and
expression namespaces. Resolve it lazily on access; outside an item provider
it is undefined. Runtime row metadata belongs in the form context, not in
UI-schema options. Use `item` consistently in normal tables
and AG Grid; `dataItem`, `itemData` and `rowData` are not additional aliases.
For a nested table, `item` is the nearest table's current source item, while
`data` remains the form root. Sorting, filtering and pagination must not
replace source-item identity with the displayed row index. A property-bound
Contact summary therefore reads `item.contact.city`, not `item.city`.
Changing the row or a referenced root value refreshes its summary.

Interpolated Labels must not flash authored template expressions while the
evaluator loads. Show a compact pending indicator until evaluation is ready;
local row lookup itself needs no asynchronous fetch. Failed loading must also
avoid showing raw expressions.

The row context must survive renderer dispatch, lazy loading and package
boundaries. Providing it must not replace the form's root data or grant
additional expression access. Rendering, sorting and filtering use the same
parameter resolution and access policy. Sorting or filtering must not reveal
values withheld by that policy.

For example, a Label can combine a row name and a root-level form title:

```json
{
  "type": "Label",
  "text": "{name} — {formTitle}",
  "options": {
    "interpolate": true,
    "textParams": {
      "name": "{item.name}",
      "formTitle": "{data.title}"
    }
  }
}
```

This requires `config.jsonformsExtended.dynamicValues.enabled: true`.
The existing rules governing `config`, `context`, localization and escaping
continue to apply; a cell summary does not widen their availability.

**Sizing and grid operations.** Long Label text must not impose a content-based
minimum width that prevents column resizing. Honor configured column minimum
and maximum widths. Prefer truncating the summary within its column; allow
horizontal table scrolling when the combined column widths exceed the available
space. Resizing one column must not redistribute its width into unrelated
columns. Label presentation does not change these rules.

For the Contact summary `Boston · 555-0100`, AG Grid's Contains text filter can
match either `Boston` or `555-0100`. Ascending and descending sorts compare
resolved summary strings, not the raw Contact object or its property name.
Normal tables share the summary contract; this does not require them to provide
AG Grid's filtering UI.

Summary and detail share the column binding. `detail` defines the editor and
`dialog` defines its geometry, as for existing complex cells. A Label summary
without explicit detail is presentation-only and has no edit action. Row-bound
columns have no clear action, since clearing a presentation must not remove
the whole row. Existing Control-based object/array previews retain their
default detail editor. Custom summaries retain eligible validation feedback.
These rules apply equally to normal tables and AG Grid in Ant Design and shadcn.

Use translation keys composite.summary.item, composite.summary.items, and
composite.summary.more with count in the translation context. The details and
unset fallback labels use composite.summary.details and composite.summary.unset.

**Generated descriptions and data previews.** Render actual scalar previews in
normal typography. Prefer secondary, italic text for generated descriptions so
users can distinguish them from stored values, consistently in both Ant Design
and shadcn. Secondary text must remain readable in light and dark themes; wording
must convey the state without relying on color alone.

- A missing/null object or array shows localized "Not set".
- An existing empty object shows "Empty object".
- For a nonempty object with an explicit summary field that is missing, null,
  blank, or not scalar, show "{label} not specified" using the field's localized
  label (for example, "City not specified"). Other fields may still hold data.
- An object without a usable field label may use its title or generic "Details"
  as a generated description.
- An empty array shows "0 items"; an array without usable previews shows its
  total item count. Both are generated descriptions. Usable array previews keep
  normal typography, including their existing count suffix.
- Preserve zero and false as actual data. A city literally named "Contact"
  therefore appears in normal typography, unlike a generated object title.

Use composite.summary.emptyObject for "Empty object" and
composite.summary.unspecified with label in the translation context for
"{label} not specified". Full-text or explanatory tooltips are optional.


Example for an array of employees containing an object-valued address and
an array-valued phoneNumbers property:

``` json
{
  "type": "Control",
  "scope": "#/properties/employees",
  "options": {
    "table": true,
    "cells": {
      "address": {
        "summary": { "type": "Control", "scope": "#/properties/street" },
        "detail": {
          "type": "VerticalLayout",
          "elements": [
            { "type": "Control", "scope": "#/properties/street" },
            { "type": "Control", "scope": "#/properties/city" }
          ]
        }
      },
      "phoneNumbers": {
        "summary": { "type": "Control", "scope": "#" },
        "detail": { "type": "Control", "scope": "#" }
      }
    }
  }
}
```

The address dialog edits the original employee's address at its full form-data
path. Detail scopes are relative to the address, not the employee or root form.
Use singular `detail`; per-cell detail is distinct from the array-level
`options.detail` convention used by item-detail renderers.

**Composite cell type indicators.** Object and array cells omit type markers by
default. Set `showTypeIndicator: true` in the cell's options (including
`options.cells.<property>`) to show `{}` for objects or `[]` for arrays.
The top-level `config.showTypeIndicator` supplies a form-wide default. Resolve
`options.showTypeIndicator ?? config.showTypeIndicator ?? false`; an explicit
cell value of `false` suppresses a global `true`.
The marker is separate from the configured Label or Control summary and must not
change that summary's text. It is decorative, hidden from assistive technology,
and independent of edit, clear, and validation indicators. Empty values retain
localized empty-state text rather than relying on the marker. This option has
no effect on scalar cells and defaults to `false` in both normal tables and AG Grid.

**Extended dialog contract:** editing is transactional. Opening creates a private
draft with the original root schema and path context. Apply commits the edited
value once; Cancel, Escape, the close icon, or backdrop dismissal discard it.
Nested dialog acceptance updates only its enclosing draft until that outer dialog
is accepted. Opening and cancelling emit no form-data changes. Unchanged Apply
also emits no change. Flush pending debounced input before Apply; cancel it on dismissal or an explicit
Empty/Remove action so delayed edits cannot restore discarded contents.
Discard late updates from unmounted draft editors.
Do not overwrite an externally changed target with a stale draft; require reopening.
Preserve validation feedback, enabled/readonly state, and focus restoration.
Apply is not automatically gated on whole-form validity.

| UI option (global default, per-control override) | Default | Meaning |
| --- | --- | --- |
| `showEmptyButton` | `false` | Show Clear inside the dialog, subject to its usual restrictions. |
| `showRemoveButton` | `false` | Show Remove inside the dialog only where the containing context permits removal. Never enables removing a tuple position. |
| `okLabel` | Apply | Text/translation key for committing the draft. |
| `cancelLabel` | Cancel | Text/translation key for discarding the draft. |
| `emptyLabel` | Clear | Text/translation key for the optional empty action. |
| `removeLabel` | Remove | Text/translation key for the optional remove action. |

Reuse the temporal-action convention for explicit labels: translate the supplied
string as a key, falling back to that same string. Without an override use
`composite.apply`, `composite.cancel`, `composite.empty`, and `composite.remove`
with the defaults above. These options affect dialog actions; the external cell
clear icon retains its existing `clearable` contract.

Example: `{"showEmptyButton":true,"okLabel":"address.save","cancelLabel":"address.cancel"}`
with translations `{"address.save":"Save address","address.cancel":"Discard changes"}`.
In a table, place these options on the selected cell descriptor; for a tuple,
use the tuple options or the registry-selected position Control options.


#### Dialog action guidance and pending updates

Apply is the default commit label (replacing the earlier Done wording); Cancel
is the discard label. Temporal pickers retain their existing OK/Cancel defaults.
Keep the option names `okLabel`, `cancelLabel`, `emptyLabel`, and `removeLabel`.
Clear means emptying contents; Remove means unsetting the property. Both remain
opt-in dialog actions and remain subject to contextual restrictions. Use
localized tooltips, available on hover and keyboard focus:

| Action | Translation key | Default tooltip |
| --- | --- | --- |
| Apply | `composite.applyTooltip` | Apply changes and close. |
| Cancel | `composite.cancelTooltip` | Discard changes and close. |
| Clear | `composite.emptyTooltip` | Clear contents, keeping the object or array. |
| Remove | `composite.removeTooltip` | Remove this value from the form data. |

Tooltips supplement visible labels and accessible names; do not require a tooltip
for operating the dialog on touch devices. Give Remove destructive styling.
Fixed tuple positions may offer Clear, never Remove.

**Required lifecycle, independent of framework or debounce library:**

1. Open a private draft. Descendant edits and their validation update that draft,
   not the committed form. Retain the root schema and scoped data path.
2. On Apply, flush pending debounced child edits into the draft **before** reading
   its value. Complete any required asynchronous preparation before accepting;
   do not commit an older value while the last edit is still queued. Recheck
   enabled state and target identity, then commit once and close. An unchanged
   draft produces no data update. Flushing is not permission to commit a partial
   or invalidly parsed input; the shared pending-edit contract still applies.
3. On Cancel, Escape, close-icon activation, or backdrop dismissal, cancel queued
   updates, discard the draft, and close without publishing a form-data update.
   Cancel must not flush changes to the committed form or implement rollback by
   first writing edits and later restoring a snapshot.
4. Clear and Remove supersede earlier pending edits in their target. Cancel those
   queued edits before modifying the draft so Apply cannot restore cleared data.
   These actions remain draft-only until Apply; Cancel also discards them.
5. Unmounting or replacing a draft editor cancels its pending work. Ignore late
   timers and asynchronous completions from a discarded session, including after
   reopening the same dialog. Nested Apply writes only to the enclosing draft;
   cancelling the outer dialog discards the nested edits too.

For example, type a street and immediately click Apply, before its debounce delay
expires: the new street must be committed once. Type and immediately Cancel:
no change is committed, even after waiting past that delay or reopening. Type,
then Clear, then Apply: the result is the empty container, not the queued street.
Recheck restrictions at action execution; do not overwrite an externally changed
target using the stale draft. Implementations should test these sequences,
including keyboard dismissal and nested dialogs, without relying on an arbitrary
sleep to make the expected behavior work. No universal debounce delay or new
UI-schema debounce option is introduced.

Composite cell interaction and clearing are part of the project contract:

- Open the detail dialog only by activating a dedicated edit-icon button, including
  keyboard activation. Clicking or selecting the summary text must not open it.
  Render summary text separately from the button so users can select and copy it
  with normal platform actions. Clicking the summary does not automatically copy
  it to the clipboard. Grid selection/focus must not convert that interaction into
  a dialog trigger or prevent ordinary text selection.
- The edit icon is a real focusable button with a localized accessible name such
  as "Edit Address". It may be visually revealed on cell hover or focus-within;
  it must remain discoverable by keyboard and available on touch devices.
- Add a separate clear X for **Remove value**, following the shared clear-button
  visibility contract. It appears only for a present value when the cell is hovered
  or focused, with equivalent touch access. Empty objects and arrays are still
  present values. Give the action its own localized accessible name and keep it
  separate from both summary selection and the edit trigger.
- Inside the dialog, provide **Apply** and **Cancel**. **Clear** and
  **Remove** are hidden by default and shown only by their explicit options.
  Empty contents assigns {} for an object or [] for an array, retaining the
  container and its property. Remove value unsets the scoped property through
  the normal change mechanism; undefined is an internal removal instruction,
  not a serialized JSON value. Disable redundant Empty contents on an already
  empty container and do not offer removal for an absent value.
- Respect readonly/enabled state for both mutations. Under restrict, Empty
  contents must respect applicable structural restrictions, including minItems,
  minProperties, and required child properties. Do not use it to bypass protected
  deletion rules. Property removal follows the existing context-specific removal
  and clearing rules; distinguish required child properties from the parent
  declaring the cell property required, which still follows the shared
  required-control clearing contract and ordinary validation.
- In a dynamic additional-property context, clearing contents retains the key.
  Removing the key belongs to the explicit property Delete action; do not expose
  a competing generic unset action that bypasses its restrictions.
- If the cell represents an array element itself, never write undefined to that
  slot. Element removal belongs to the owning array's delete action and obeys its
  restrictions. Unsetting an object-valued property within a table row is a
  different operation and must not remove the row or shift array indices.
- Empty/remove actions change only the dialog draft, like delegated field edits.
  Apply commits; Cancel discards all of them. Apply the existing confirmation
  policy where required.

For the people-table example, an address containing street "Main Street" displays
that street as selectable summary text. Only its edit icon opens the configured
address detail layout; clicking the street must not open the dialog. Empty
contents changes address to {}, while Remove value removes address from that
person and leaves their other properties intact. Emptying phoneNumbers produces
[] (zero items); removing it leaves phoneNumbers absent. These different model
states must not be conflated.

### 18.14 Cells render through one frame

A cell dispatches through the **cell registry**, not the renderer registry.
Dispatching a renderer would select the object renderer and inline an entire
detail form inside a table cell.

Scalar cells are bare inputs that draw no field chrome, so anything shown
around a cell comes from a shared **cell frame**: compact validation state —
an error indication and a message reachable by hover **and** by assistive
technology — and deliberately **no label and no inline message**, because a
column header already labels the cell and an explanation under it grows the
row.

Where a cell is produced by a grid's own cell factory rather than a connected
component, the frame must look its errors up explicitly. Wiring such a slot to
a frame that only carries display mode compiles and renders while silently
losing every cell's validation state.

A hover-only tooltip is unreachable by a screen reader once the inline message
is suppressed, so the message MUST also be on the accessible name.

Cell display mode has no effect on a scalar cell, which draws no chrome for it
to suppress. It matters for a **control** dispatched inside a cell, and for a
detail dialog leaving cell mode — so a test asserting "no label" against a
grid of scalar columns passes whether or not the mechanism works.

### 18.15 Combinator controls

Combinator keywords describe validation composition; their presence does not
inherently require a branch selector or multiple forms. **Project presentation
contract:** when composition describes one unambiguous scalar editor, render it
once and preserve the outer Control's label, description, i18n, options, and data
path. Annotation-only branches do not create separate inputs. The branch-form
defaults below apply when distinct editing forms are appropriate; existing
specialized finite-choice renderers retain their selection conventions.

For example, the draft-07 meta-schema defines:

```json
{
  "definitions": {
    "nonNegativeInteger": { "type": "integer", "minimum": 0 },
    "nonNegativeIntegerDefault0": {
      "allOf": [
        { "$ref": "#/definitions/nonNegativeInteger" },
        { "default": 0 }
      ]
    }
  },
  "type": "object",
  "properties": {
    "minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" }
  }
}
```

A Control scoped to `#/properties/minLength` renders one integer input labelled
"Min Length", with minimum 0. The default annotation does not describe another
field, and delegating the input at a branch-local scope must not lose the outer
property's label. Default assignment remains subject to the existing validator
and initialization contracts.

Any schema derived for renderer selection or presentation must not replace the
original validation schema or discard its constraints. Do not shallow-merge
arbitrary allOf branches, or collapse oneOf/anyOf alternatives merely because
their types match. Their intersection, exclusive-match, and alternative-match
semantics remain distinct. If a safe single-editor presentation cannot be
established, retain the supported combinator presentation and full validation.

**Validation-only scalar alternatives and native input restrictions.** When an
unambiguous scalar type is established and branches only add validation
constraints, prefer one scalar editor without branch tabs or a branch selector.
For example:

```json
{
  "type": "integer",
  "anyOf": [
    { "maximum": 10 },
    { "minimum": 20 }
  ]
}
```

One integer input accepts 5 and 25; 15 produces a validation error. Do not copy
both branches' bounds onto the input: minimum 20 and maximum 10 would prevent
valid entries. Even choosing just one branch's bound would exclude values that
the other branch permits.

```json
{
  "type": "integer",
  "oneOf": [
    { "multipleOf": 3 },
    { "multipleOf": 5 }
  ]
}
```

Here 6 and 10 are valid, while 15 is invalid because it matches both branches.
A single integer editor retains that exclusive-match validation; no user branch
selection is necessary. Do not derive an input step from an arbitrary branch.

Native min/max/step, length limits, picker restrictions, and other input
prevention must be safe for the complete composition. Enclosing restrictions
remain applicable. Branch restrictions may be used only when their combined
meaning is reliably established; otherwise leave them to full-schema validation
and error feedback. The restrict option does not authorize an unsafe merge or
the exclusion of valid alternatives. Editing does not reset data or invoke a
branch-change confirmation merely because a different branch now validates.

Preserve specialized finite-choice and string-suggestion conventions. Retain
branch-form presentation when alternatives need distinct editors or layouts, or
when a safe single-editor presentation cannot be established. These rules add
no UI-schema option and do not change the schema's validation semantics.

**Visible scalar-composition errors.** A failed composition must provide localized
feedback beside its single input under the shared validation-display rules.
For the disjoint-range example, 15 fails because no permitted alternative
matches. Present that alternative-match failure rather than displaying both
branch bounds as simultaneous requirements. For the exclusive-multiple example,
15 fails because more than one alternative matches; selecting an editor branch
would not resolve that error.

Summarize failed alternatives without hiding independent enclosing constraints.
For allOf, the individual constraints apply together and their relevant errors
can be shown normally. Preserve structured validator errors and form validity;
do not publish duplicate additionalErrors solely to restore visible feedback.
The error-display projection must not mutate the original errors. Support
localized messages, accessible invalid state, validation visibility settings,
and feedback removal on correction. Host additionalErrors retain their existing
ownership and visibility rules.

| Suggested renderer | Default UI | Data and validation semantics |
| --- | --- | --- |
| OneOfRenderer | A dropdown of branch labels with the selected branch's form below it. | Explicit branch changes may replace branch data after confirmation. Exactly one branch must validate. |
| AnyOfRenderer | Tabs selecting the branch form to display over the same bound value. | Tab navigation alone preserves data; one or more branches may validate. These are editor views, not checkboxes enabling schema branches. |
| AllOfRenderer | The enclosing properties followed by all branch forms in schema order, without a branch selector; a matching registered UI schema may supply a combined form. | All editors address the same value, and every branch constraint remains applicable. |

Branch titles supply human-readable labels through the normal combinator label
and translation machinery, with generated labels when titles are absent. Branch
forms use registered/generated UI schemas at the same scoped data path. Outer
properties are presented independently of selected branch content. The configured
validator evaluates the full schema, not merely the currently visible branch.
The inspected existing renderer `options.variant: "tab"` for oneOf is a renderer-specific
alternative, not a new portable variant or a requirement for other families.
Additional-property editing, when available, follows the object contract below;
options.allowAdditionalPropertiesIfMissing controls availability, not validation.

**Initialization and data preservation.** Opening the form selects a suitable
editor for the existing value without replacing that value with defaults. If the
value matches a later oneOf branch, display that branch. If none matches, a
fallback branch may be displayed alongside validation errors, while retaining
the incoming data for correction. If multiple branches match, selecting one for
display does not resolve the oneOf validation error. With no value, the dropdown
may initially have no selection. Mounting, remounting, or choosing an initial
view must not itself write generated defaults to form data.

**Explicit oneOf branch changes.** When the user selects a different branch,
apply the shared branchChange confirmation policy (fallback always) before
discarding existing values. Once permitted and, when required, confirmed, initialize from the
selected branch's generated defaults and preserve existing values of properties
declared in the enclosing schema's own properties. Those preserved values take
precedence over generated defaults. Replace other branch-specific data; do not
infer preservation merely because two branches contain the same property name.
Cancel preserves both committed data and the previous selection. Disabled or
read-only state prevents data-changing branch switches. Selecting the already
selected branch must not reset it. Branch selection alone does not establish
validity or guarantee all required values have been generated.

``` json
{
  "schema": {
    "type": "object",
    "properties": { "name": { "type": "string" } },
    "oneOf": [
      {
        "title": "Email contact",
        "properties": {
          "kind": { "const": "email", "default": "email" },
          "email": { "type": "string" }
        },
        "required": ["kind", "email"]
      },
      {
        "title": "Phone contact",
        "properties": {
          "kind": { "const": "phone", "default": "phone" },
          "phone": { "type": "string", "default": "" }
        },
        "required": ["kind", "phone"]
      }
    ]
  },
  "uischema": { "type": "Control", "scope": "#" }
}
```

Given `{"name":"Alex","kind":"email","email":"alex@example.com"}`,
initial rendering shows Email contact without changing the data. After an explicit,
confirmed switch to Phone contact, the generated initial value is
`{"name":"Alex","kind":"phone","phone":""}`. Name survives because it is
in the enclosing properties; email is removed, and the phone form is displayed.
A new branch may further constrain name, so preserving it can still leave a
validation error requiring correction. Preservation does not override validation.

Examples for the other default presentations:

``` json
{
  "schema": {
    "type": "object",
    "anyOf": [
      { "title": "Email", "properties": { "email": { "type": "string" } }, "required": ["email"] },
      { "title": "Phone", "properties": { "phone": { "type": "string" } }, "required": ["phone"] }
    ]
  },
  "uischema": { "type": "Control", "scope": "#" }
}
```

Switching tabs does not delete email or phone. A value containing both can satisfy
anyOf; the active tab is presentation state only.

``` json
{
  "schema": {
    "type": "object",
    "allOf": [
      { "title": "Identity", "properties": { "name": { "type": "string" } }, "required": ["name"] },
      { "title": "Contact", "properties": { "email": { "type": "string" } }, "required": ["email"] }
    ]
  },
  "uischema": { "type": "Control", "scope": "#" }
}
```

Both forms are shown by default and edit the same object. Neither branch is
optional. Combining the presentation must not weaken overlapping constraints or
reinterpret allOf as a shallow schema merge.

### 18.16 Object controls and dynamic properties

Suggested renderer name: `ObjectRenderer`. Match a Control whose resolved schema
is an object schema. Basic object dispatch and `options.detail` follow existing
JSON Forms conventions. Additional-property editing and the options below belong
to this project's extended object contract; they are not universal core features.
Dispatch a nested form at the object's data path. An explicit detail UI schema
uses scopes relative to that object; otherwise select a registered detail UI
schema or generate one. A more specific applicable renderer may take precedence.

| Input | Effect on editing |
| --- | --- |
| `options.detail` | Supplies the nested object form using the existing detail convention. |
| `additionalProperties: true` or a schema | Exposes dynamic-property editing; a schema determines additional values' editors and validation. |
| Nonempty `patternProperties` | Exposes editing of pattern-matched properties; apply all matching schemas, not just the first match. |
| `options.allowAdditionalPropertiesIfMissing` | Default false. True exposes dynamic-property editing when additionalProperties is absent. This controls UI availability, not whether schema validation permits extra keys. |
| `additionalProperties: false` | Disallows new keys outside declared properties and pattern matches; it does not prohibit keys allowed by patternProperties. |
| `propertyNames` | Constrains key names, including names proposed during add/rename. |
| `minProperties` / `maxProperties` | With restrict enabled, prevent removals/additions that violate size bounds, counting all keys, including declared properties. Follow the common repair behavior for invalid incoming data. |
| `required` | Prevent removal or rename that would remove a required key under the common restrict contract. |

``` json
{
  "schema": {
    "type": "object",
    "properties": { "title": { "type": "string" } },
    "additionalProperties": { "type": "string" },
    "propertyNames": { "pattern": "^[a-zA-Z][a-zA-Z0-9_]*$" },
    "maxProperties": 5
  },
  "uischema": { "type": "Control", "scope": "#" }
}
```

Here additional values use string editors, the name-entry UI validates proposed
keys, and the five-property limit includes title when present. For a schema that
omits additionalProperties, opt into the editing UI explicitly:

``` json
{
  "schema": { "type": "object" },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "options": { "allowAdditionalPropertiesIfMissing": true }
  }
}
```

Rename must reject collisions instead of overwriting another property's value.
A rename preserves the value, changes the key atomically, and reassesses the
applicable value schema and renderer under the new name. It does not change the
property count. Preserve schema-invalid incoming values for correction rather
than dropping or coercing them. Disabled/read-only state prevents all mutations.

##### Rename into a different value schema

Name validity and value validity are separate. For example:

```json
{
  "type": "object",
  "patternProperties": {
    "^text_": { "type": "string" },
    "^count_": { "type": "integer", "minimum": 0 }
  },
  "additionalProperties": false
}
```

Renaming text_quantity in `{"text_quantity": "five"}` to count_quantity produces
`{"count_quantity": "five"}`. Accept the rename if the name and permissions allow
it, select the integer renderer, and display the type error at the new location.
Do not convert the string to zero, drop it, or reject the name merely because the
retained value is incompatible.

The renderer may display incompatible data using its native input behavior.
A numeric input may appear blank for a nonnumeric string; the ordinary validator
error explains that the stored value is not a number. Do not force conversion,
erase the data, or require a separate always-visible original-value panel.

When the native widget cannot faithfully represent the stored value, a compact
hint icon beside the input is recommended. Show the original JSON value in a
tooltip on hover or keyboard focus, distinguishing strings such as `"5"` from
numbers such as `5`. Keep the normal validator error in its usual location.
The icon must not add a separate row or push the input away from its label.
Readonly controls may still expose the hint for inspection.

Web numeric controls use `numeric.incompatibleValue` (default: "Stored value")
for the accessible hint label and `numeric.clearValue` for a separate clear
label when needed. Translate labels, not raw values; render values as escaped
text. Link the tooltip to its trigger and input with accessible descriptions.
Only an explicit edit or clear changes data; mounting or switching a renderer
must not coerce the original value.

The Rename dialog reports name errors such as collisions or propertyNames
violations. After successful rename, the value control reports value errors
using the normal validation and i18n pipeline. Do not add a confirmation dialog
solely because the applicable validation schema changes. Existing permissions
and applicable confirmation policy still apply.

Property names must retain their exact identity. Additional Properties accepts
literal dots, brackets, Unicode, leading/trailing whitespace, and the empty
string when explicitly enabled and allowed by the schema. Do not trim names or impose a character
blacklist. Schema name restrictions (`propertyNames` and applicable
`patternProperties`/`additionalProperties` rules) still apply. Existing keys and
schema-owned property names cannot be added again; rename must not overwrite a
different property. Readonly state and object size constraints still govern
which operations are available.

**Empty property name policy.** `allowEmptyPropertyNames` is a boolean option
available in global config and `uischema.options`, defaulting to `false`.
An explicitly supplied UI-schema option overrides global config, including
`false` overriding `true`. It applies to Add and Rename in Additional Properties
and to mixed-tree Rename. When disabled, reject names whose `trim().length` is
zero. When enabled, accept empty and whitespace-only names subject to schema
name constraints and collision checks. Preserve every accepted name exactly;
trimming is only a blankness check. The presence of `propertyNames` does not
automatically enable this option, and schema constraints always apply.
Existing empty or whitespace-only keys remain visible and editable and may be
deleted or renamed to a permitted name regardless of this option. This policy
is independent of empty property-value storage and clearing behavior.

**Empty-name presentation.** In the Additional Properties control, an empty
property name has a visually blank label. Do not display the literal text
`""` as a substitute name. Reserve the label/action space needed to keep
Rename/Delete above the value input without adding a separate action row to
ordinary named properties. A mixed editor's type selector and value input must
remain aligned. This is presentation only: the actual key remains the empty
string, and name validation, exact-key addressing, and accessibility of the
action buttons are unchanged. This rule does not change tree-node naming.

**Empty add-name draft feedback.** An exactly empty name input must not show
inline name-validation errors on initial load or after it is cleared or reset,
including an empty-name collision when `allowEmptyPropertyNames` is enabled.
Suppressing that feedback must not bypass validation: Add stays disabled when
the empty name is disallowed, already exists, or violates schema constraints,
or when permissions or applicable property-count limits prevent adding.
A permitted empty name can still be added when the option is enabled. Nonempty
duplicate or invalid drafts retain their ordinary inline validation feedback.
This feedback rule applies to the Add name input, not the Rename dialog.

**Literal-key editing (extended renderer contract).** Core data paths still use
dots as separators. A literal dotted name or empty name must therefore be edited
in an isolated form rooted at that property's value (`scope: "#"`), with updates
written to the containing object using the exact property key. Never construct
a child data path from such a name. This supports nested dynamic objects as well
as scalar values; clearing a value preserves its dynamic property, while Delete
explicitly removes the key. Use own-property access and safe property creation
so names such as `__proto__` do not alter object prototypes.

The web implementation selects the editing strategy as follows. These are
transport details, not additional schema restrictions:

| Property name | Handling |
| --- | --- |
| `a.b` | Isolated value editor; the dot is part of the key, never a separator in a dispatched child path. |
| Empty string (`""`) | Isolated value editor; its root represents the value of the empty-named property, not the containing object. |
| `test[0]`, `part]name[` | Normal delegation with core 3.9.0-alpha.1 or newer; brackets are literal characters. |
| `15` on an object | Remains an object key; do not create an array merely because the segment is numeric. |
| `  name  `, Unicode, `/`, `~`, or other schema-permitted characters | Preserve the exact name. Slash and tilde need escaping when constructing JSON Pointers, not when storing the key. |
| `__proto__` and other names also found on object prototypes | Treat as own data properties. Use safe property definition/copying, never prototype assignment or inherited-property lookup. |

For an isolated editor, read the value with an own-key lookup such as
`parentData[propertyName]`. Its UI schema starts at `scope: "#"`; do not pass
`parentPath + "." + propertyName` as its editing path. When a changed value is
returned, recheck editability and that the property still exists, ignore an
unchanged value, and replace the parent object with a copy containing the exact
key and new value. Add and Rename use the same literal-key discipline; Delete
removes that own key from a copy of the parent object. Check collisions using
own keys so `toString`, for example, is not rejected merely because it exists on
an object prototype.

When the containing object is itself under a dotted dynamic name, repeat this
isolation at that boundary. Nested editors update their immediate isolated
parent, and parent-object updates propagate outward without ever dispatching a
path containing a literal dotted segment.

For example, editing or deleting `"a.b"` in
`{"a.b": 1, "a": {"b": 2}}` must leave `a.b` inside the separate object `a`
unchanged. The parent update replaces the literal key, not the nested value.

The isolated editor must preserve the property's schema, local and recursive
root references, validation mode, renderer/cell registrations, UI-schema registry,
configuration, i18n, and readonly behavior. Validation errors must remain
associated with the actual property in the parent data. Rebase local schema
references without rewriting JSON values inside `default`, `enum`, or `const`.
Add must flush pending name-input changes before validating and creating the
property, including when the empty string is a permitted name.

Additional Properties and the mixed-tree selected-node editor use this isolation
strategy. Ordinary Controls still cannot address literal dots through a core
data path; unsupported direct-path operations must remain blocked rather than
silently editing a different property.

##### Value schemas for dynamic names matching multiple patterns

Evaluate every regex in `patternProperties` against the exact property name;
matching is not first-match selection, and patterns are not implicitly anchored.
Every matching schema applies conjunctively, as with `allOf`. Use the
`additionalProperties` schema only when the name matches neither a declared
`properties` entry nor any pattern. In particular, `additionalProperties: true`
must never replace a matched value schema.

For a dynamic key without a declared property schema, select its editor using
all matching schemas. Compatible scalar constraints should produce one control
with their combined restrictions: `^price_` specifying a number with minimum 0
and `_total$` specifying maximum 1000 give `price_total` one number editor
bounded by 0 and 1000. Reversing pattern declaration order must not change this
behavior. Multiple lower bounds use the strongest lower bound, and multiple
upper bounds use the strongest upper bound.

Do not perform an arbitrary shallow merge of structural or incompatible schemas.
Retain their conjunction when a safe scalar projection is unavailable. Preserve
incoming values and expose validation errors; schema selection must not coerce
or discard data. The original full object schema remains authoritative for
validation, including constraints not projected into native input behavior.

Recompute the applicable schemas after Add/Rename or schema changes, preserving
the renamed property's value. Regexes may be compiled and cached per pattern set;
all patterns still need evaluation for each new name. A value-only change does
not change which names match, although value validation must run again.

The shared **Additional properties (overlapping patterns)** example illustrates
overlap, reversed pattern order, a single match, fallback schemas, and renaming.

##### Pattern-derived errors on existing property controls

A declared property can also match one or more patternProperties schemas. Those
constraints participate in validation of its value; they do not require a second
control in the additional-properties editor. That editor must reject adding a
name already declared by the schema, as well as collisions with existing data.

```json
{
  "type": "object",
  "properties": {
    "price_total": { "type": "number", "title": "Total price" }
  },
  "patternProperties": {
    "^price_": { "minimum": 0 },
    "_total$": { "maximum": 1000 }
  },
  "additionalProperties": false
}
```

The existing price_total control displays the applicable validation error when
its value is -1 (minimum) or 1001 (maximum); 500 satisfies these constraints.
Errors must be associated with the affected data location even when their
constraint is declared under patternProperties rather than properties.

In the AJV/JSON Forms web pipeline, instancePath identifies the affected value
(`/price_total`); schemaPath identifies the constraint (for example,
`#/patternProperties/%5Eprice_/minimum`). Core maps the data location to the
existing control's path. Do not require a schemaPath under properties to display
an error on that control. Equivalent validator integrations must preserve this
distinction. Shared validation-mode and error-presentation settings still apply.

This validation/error-routing requirement does not require merging pattern schemas
into the schema used to select the declared property's renderer. The earlier
requirement to apply all matching schemas describes their validation semantics;
it must not be interpreted as a requirement to create duplicate property controls.

##### Additional-properties editor: interaction and key ownership

Suggested renderer/component name: `AdditionalPropertiesRenderer`. It is hosted
by an applicable object editor, not selected through a new UI-schema type. Show
an input for the **new property name** and an adjacent Add action. Validate the
proposed name using the object's name rules, applicable pattern restrictions,
and collision checks; display actionable errors alongside that input. Add is
unavailable while the name is invalid or already used, or mutation is disabled.
With restrict enabled, also prevent addition at maxProperties. Validate again
in the handler. Successful addition creates the key with an appropriate initial
value and exposes its delegated value editor; reset the name-entry draft.

The property's name and its value have separate validation schemas. For example:

```json
{
  "schema": {
    "type": "object",
    "propertyNames": { "pattern": "^[a-z][a-z0-9_]*$" },
    "additionalProperties": { "type": "string" }
  },
  "uischema": { "type": "Control", "scope": "#" }
}
```

Entering customer_code in the new-name input permits Add when the name is unused
and the other action restrictions allow it. Entering Customer Code displays a
name-validation error and prevents addition. After addition, the value is edited
as a string according to additionalProperties; propertyNames constrains the key,
not that string value. Apply the same name constraints when renaming.

Build the name-input validation schema from the object's propertyNames constraint
and validate the proposed name before mutation. Keep declared-name reservations
and existing-key collision checks separate from that schema validation. When
additionalProperties is false, a new dynamic name must also match at least one
patternProperties pattern; that admission check does not replace validation of
the value against all applicable pattern schemas. Revalidate in Add/Rename handlers,
not only when computing the enabled state. These checks reuse existing validation
and translation behavior; no new UI-schema option is needed.

List dynamic properties with their names, delegated value controls, and Rename
and Delete actions. These actions apply to existing as well as newly added
dynamic keys. Rename opens a dialog initialized with the current name. Validate
as the proposed name changes, show errors in the dialog, and disable Rename
while errors exist or renaming is prohibited. Revalidate on submission. Cancel
leaves the key/value unchanged; successful rename atomically preserves the value
under the validated new key and refreshes its applicable editor/schema.

Use the same name and collision rules as the object contract. With restrict
(the shared option, not strict), Delete must respect minProperties and required
keys; Rename must not remove a required key or create a disallowed name. Counts
include declared and dynamic keys. Readonly/disabled state prevents all mutations.
Action handlers must enforce these rules as well as the visible button state.

**Clearing a value is not deleting its property.** Dynamic rows are derived from
keys present in data. Therefore, a delegated renderer editing a dynamic property
must preserve that key when the user empties the input or activates its clear X.
For a string, both operations store an empty string instead of undefined:

``` json
{ "customNote": "" }
```

The customNote row remains available for further editing. It disappears only
when the explicit Delete action removes the key (or an explicit enclosing
operation replaces/removes the containing data). Required/minLength and other
schema errors may still be displayed; key preservation is not a validation bypass.
Do not substitute a nonempty schema default for a string the user intentionally
emptied. Do not assign undefined, since core update handling or JSON serialization
can remove the property and its dynamic editor.

The rendering integration must communicate dynamic-property context to delegated
value controls, including clear-button handlers and ordinary input-to-value
conversion. Until centralized, each renderer must honor this distinction. A
shared context-aware clear-value/conversion helper is preferred so StringRenderer
and other controls use a consistent policy. This context is runtime metadata,
not a new authored UI-schema option and not related to $dynamic resolution.
Apply it to the dynamic property's own value; nested declared properties retain
their normal semantics rather than inheriting key preservation indiscriminately.

Other value types must use an explicitly defined, JSON-representable clear value
for their editing mode while retaining the key; do not silently choose null or
zero as a universal replacement. Where no suitable empty value exists, retain
the key and current committed value with a local empty draft/validation state
until the value can be committed. Keep the row editable and use Delete for key
removal. These rules specialize the shared clear-control contract in dynamic
property context.

### 18.17 Selection that writes versus selection that displays

A control that selects among alternatives must state whether selection
**writes data** or only **changes what is displayed**:

- **Writes:** a oneOf branch change, a mixed-value type change. These discard
  or replace data and are subject to the confirmation policy, read-only state
  and mutation guards.
- **Displays only:** an anyOf view change, a tab or step change, expanding a
  section. These change runtime selection and **never** touch data.

Conflating the two is how a navigation action becomes destructive. A selection
that only displays MUST NOT be routed through the confirmation policy, and a
selection that writes MUST NOT bypass it.

**An array element's type cannot be cleared.** Where a control offers a type
selector for values inside an array, clearing the type would leave an element
of no type in a typed list; the selector offers the permitted types and no
empty option.

### 18.18 Extended renderer catalogue

These are project extensions. A family that does not implement one preserves
the document and reports unsupported capability.

#### 18.18.1 Data grid array control

**Presentation suggestions (non-normative).** Prefer the renderer family's
standard input and picker components. Let editors fill the available cell
width and height, with compact padding and vertically centered checkboxes.
Use the grid's cell boundaries rather than a second bordered input box.
Avoid doubled focus borders: provide one visible keyboard-focus indication,
owned by either the grid or the editor. Do not suppress both. Empty color
values should show a checkerboard or equivalent empty swatch, rather than
appearing to contain black; the picker's fallback color must not write data.

**Control identity during updates.** Routine data changes, including each
keystroke and validation updates, MUST preserve the mounted editor for the
same logical row and column. They MUST NOT lose keyboard focus, reset the
caret or selection, interrupt IME composition, or close an open picker merely
because form data changed. Keep row identity and cell-renderer component
identity stable across these updates. The same requirement applies to ordinary
form controls in every renderer set. Intentional structural changes (such as
removing the field or selecting a different schema branch) may replace an
editor.

Regression coverage should type several characters into the same input and
verify the DOM element, focus, caret, and committed value after each update,
including validation feedback. Repeat for an ordinary form control and a grid
cell; a static render or a mocked grid alone cannot prove focus preservation.


A grid presentation for arrays, selected by `options.variant: "ag-grid"`. It shares the array contracts above — action
options, item errors, restrict prevention — and adds its own column model.

**Reordering by drag is offered only while the visible order still matches the
data order.** Once a column is sorted or filtered, drag reordering is disabled
and a drop that arrives anyway is ignored: the visible position no longer
identifies the data index, and acting on it moves the wrong row.

Where the grid's own cell factory produces cells, the shared cell frame must
be wired explicitly (§18.14).

#### 18.18.2 Duration control

Selection: a string Control with schema `format: "duration"` or UI
`options.format: "duration"`. **Store a
duration string**, not a number of seconds and not a date-time. Do not imply
that calendar months or years convert to a fixed number of seconds.

The baseline supports non-negative integer years, months, days, hours, minutes
and seconds, or a separate weeks-only representation. Fractional and negative
support must be declared explicitly.

| Option | Default and effect |
| --- | --- |
| `showActions` | True stages picker changes until confirmation; Cancel discards the draft. False commits immediately |
| `okLabel`, `cancelLabel` | Translated confirmation labels |
| `placeholder`, `focus`, `clearable` | Shared behaviours |
| Weeks mode | Cannot be combined with other components in this baseline |
| Zero duration | Serialize zero as the canonical zero form; clearing is a separate operation |

**Components are quantities, not clock fields.** The grammar bounds none of
them: values far above 59 minutes, 23 hours or 11 months are valid durations
and MUST be accepted. A picker that caps them like a time-of-day widget is
wrong twice over — it rejects valid data, and where the cap is enforced by
clamping it **destroys what the user typed with no message**. The only real
bound is the range in which an integer remains exact.

**Equivalent spellings are not the same data.** Ninety minutes and one hour
thirty are the same length but different stored values, and a zero written in
the weeks form is a legal value distinct in text from a zero written any other
way. **Existing data MUST NOT be normalized merely because the renderer
mounted, or because a picker was opened and confirmed without an edit.** The
canonical form says what to write when the user *means* a value, not what to
do with an equivalent one that arrived from elsewhere. Leading zeros are
likewise valid and MUST survive an unedited round trip.

Support direct text entry as well as the picker, with syntax-aware guided
editing that accommodates **all** valid forms rather than excluding some
through an overly narrow pattern. This assistance is part of the duration
contract, not the portable `mask` option.

Allow partial prefixes as local drafts. **An incomplete or invalid non-empty
draft MUST NOT overwrite the last committed value or be replaced with zero.**
Existing invalid data remains visible with a validation error and correctable
through either text or picker.

Validate committed duration values through the JSON Schema validator's
`duration` format support. The duration control MUST NOT publish additional
errors for duration validation. Uncommitted invalid drafts retain local feedback
and participate in the shared pending-edit validity contract, separately from
additional errors and validation of the committed value. UI format selection
alone does not add a schema constraint.

Do not assume temporal minimum and maximum comparisons can order calendar
durations without a separately defined comparison policy.

#### 18.18.3 Colour control

Selection: a string Control with schema `format: "color"` **or**
`options.format: "color"`.

The **stored serialization** is an explicit option, separate from the picker's
internal model and from what is displayed. A renderer MUST NOT change the
stored format because the picker's internal representation differs.

**A format that cannot carry transparency must say so** rather than silently
discarding an alpha channel: where the selected output cannot represent the
edit, report it and leave the value for the user to resolve.

Text entry accepts the documented notations for the configured output and
keeps an incomplete entry as a local draft. Clearing follows the shared clear
contract.

#### 18.18.4 File control

This project extension selects a `Control` targeting a string with schema
`contentEncoding: "base64"`, `format: "byte"`, or `format: "binary"`.
The widget selects one local file, checks supported constraints before reading
it, and converts an accepted file into the representation stored at the scope.
This describes local file attachment, not an implicit network upload.

**Table cells and multiple attachments.** A file cell should use a compact
picker with bounded filename text and accessible select/replace/clear actions.
Follow the same cell framing as other controls: omit repeated field labels
and description paragraphs, retain validation feedback, and avoid large drop
zones or image previews that increase row height. Descriptions in ordinary
controls follow the shared focus and showUnfocusedDescription rules.

The file control also selects arrays with a homogeneous items schema resolving
to a supported file string (including an item $ref). A string selects one file;
an array enables multiple selection and appends accepted encoded values in
chooser order. Tuple, boolean-item and ordinary string-array schemas do not
select this renderer.

Array minItems and maxItems govern the total attachment count. With restrict
enabled, reject an addition that exceeds maxItems and disable removal that
would violate minItems. With restrict disabled, allow count violations and
display the normal schema validation feedback. Do not use string minLength or
maxLength as file-count limits. uniqueItems prevents appending duplicate encoded
values; without it, duplicates remain separate entries and removal identifies
one occurrence by position. Each file uses the item schema's encoding and
file-size constraints; UI file-size options apply to each selected file.

Commit an accepted batch once after reading it. A failed read must preserve
previous attachments. Do not overwrite externally replaced data with a pending
read.

**Local operation feedback versus validation.** A rejected selection that leaves
stored data unchanged SHOULD produce a local warning in the theme's warning
color. It MUST NOT add a validation error or make otherwise valid data invalid.
A file-read failure is a local operation error, shown in the error color while
preserving existing attachments. Neither message belongs in additionalErrors;
normal schema errors for stored values continue through the validation system.

In table cells, show this feedback as a compact severity icon beside the clear
action, with the message available on hover, keyboard focus, and activation.
Do not place a feedback paragraph below the cell editor. Outside cells, themed
feedback text below the control is appropriate. Localize the message and icon's
accessible name. Clear stale feedback after a successful operation or external
value replacement. These messages do not contribute to container error counts.

**Preferred presentation: filename pills.** For multiple-file controls in both
Ant Design and shadcn, prefer compact filename pills with individual remove
actions, a themed select-files button, and a separate localized clear-all
action. This is a presentation recommendation, not a required component or
layout implementation; an alternative may be used if it preserves the same
accessibility, bounded sizing, and attachment-management behavior.

Pills are preferred because the same presentation can fit ordinary form
controls, normal table cells, and AG Grid cells. In a cell, keep the picker and
actions compact, omit repeated field labels and description paragraphs, and
avoid a large drop zone or preview gallery. Long filenames should ellipsize
rather than widen the column, with the full name available on hover and
keyboard focus. Allow wrapping only within a bounded area; use scrolling or
an accessible overflow presentation when needed so adding attachments cannot
grow the row indefinitely. Keep select, remove, and clear-all actions reachable
when the column is narrow.

Clear-all writes an empty array and, when restrict is enabled, must be disabled
if minItems is greater than zero. Readonly and clearable apply to both individual
removal and clear-all. Use localized fallback names when encoding does not
retain filenames. Derive attachment presence from the stored form data so
switching tabs or remounting a table cell does not imply that attachments have
disappeared.

The File control example demonstrates restricted and validation-only arrays
and an array-valued file column alongside a single-file column.


| Schema keyword / UI option | Behavior |
| --- | --- |
| Schema `contentEncoding: "base64"` or `format: "byte"` | Selects the file renderer; the ordinary storage path writes the base64 payload. |
| Schema `format: "binary"` | Existing project storage convention: a data URL including an encoded filename. This is not a general JSON Schema definition of binary serialization. |
| UI `accept` | Explicit file-dialog filter, taking precedence over schema-derived filtering. Supports platform filter syntax such as MIME types and file extensions. |
| Schema `contentMediaType` | Fallback source for the file-dialog filter when UI accept is absent; use it when a meaningful platform filter can be derived. |
| UI `formatMinimum`, `formatMaximum` | Inclusive lower/upper limits on original file size in bytes. |
| UI `formatExclusiveMinimum`, `formatExclusiveMaximum` | Exclusive lower/upper limits on original file size in bytes. |
| Legacy schema-side numeric bounds | Require a separately declared file-size validator profile. Their keyword semantics must be checked by that validator integration. |
| UI `restrict` | Enables preventive file-size enforcement according to section 15. Size validation and error reporting remain active when restriction is disabled. |
| UI `clearable`, `focus` | Shared clear-action and focus behavior. |

Use finite non-negative byte counts for size bounds. Existing adapters also
accept numeric strings; portable examples use numbers. These UI bounds are renderer options, not built-in JSON Schema keywords.
Here the renderer supplies the file-size interpretation. Validator support for
such keywords on an encoded string must not be assumed: it would require
compatible keyword definitions and decoding/size semantics. Do not claim that
ordinary temporal format comparison validates attachment size.

Example schema for an attachment:

``` json
{
  "type":"string",
  "contentEncoding":"base64",
  "contentMediaType":"application/pdf"
}
```

UI schema:

``` json
{
  "type":"Control",
  "scope":"#",
  "options":{"accept":".pdf,application/pdf","formatMaximum":5242880,"restrict":true}
}
```

Resolve the picker filter as explicit UI accept first, then a filter derived
from contentMediaType, otherwise no additional filter. An explicitly empty
accept means no filter; do not treat it as absent and restore the schema
fallback. These hints alter picker behavior without asserting that file
contents have been validated. MIME metadata, file extensions, and chooser
filters alone do not establish content conformance.

Use the selected file's byte-size metadata (File.size on web) before reading
or encoding it. This measures original bytes, not the length of the base64 or
data-URL string. With restriction enabled, reject size-invalid selections
immediately: do not invoke conversion or write the rejected file to form data.
Keep the previous committed value unchanged on rejection, clear the rejected
native selection, and expose the error so the form does not appear valid
merely because its previous value passed validation. With restriction disabled,
conversion may proceed, but the size error still contributes to validity.

Publish renderer-detected size/read/conversion failures through the combined
additionalErrors integration, not solely local control display text. Own errors
per control instance, preserve host errors, and display one localized summary
beneath the control. Include constraint/limit information in params as useful.
Remove stale owned errors on successful replacement, explicit clear, or cancel.
Pending reads and errors must participate in the same command-validity
integration described for Monaco; ordinary schema rules do not acquire this
dependency automatically.

**Cancelling the file chooser leaves no selected file and clears the scoped
form value**, including when a previous attachment was present. Apply the same
empty-value contract as the explicit Clear action; required validation may
then report an error. Aborting an in-progress attachment also leaves no
selection or stored attachment. Distinguish cancellation from an invalid-file
rejection as described above. Platform adapters must detect cancellation where
possible and document limitations rather than silently claiming this behavior
while retaining stale data. Stale asynchronous reads must not restore a cleared
or cancelled value. All mutations remain subject to readonly/enabled state.

Previously stored encoded values may lack file metadata. Do not advertise
size validation for those values unless a validator/decoder actually provides
it; selection-time checks are a distinct capability. No conversion is needed
to determine the size of a newly selected file.

#### 18.18.5 Code editor

An embedded editor for string values, selected by a documented option.

- The editor's language may be fixed or supplied per element.
- **Publication of the editor's own diagnostics as additional errors is
  opt-in**, defaults to off, and follows §15.6: one owned error per editor
  instance, unique per instance so it cannot collide with another's on the
  same path, cleared by its owner when the underlying problem clears.
- The editor's accessible name falls back to a translated default where the
  control has no label.
- Loading the editor is asynchronous: **distinguish failure to load the editor
  from failure within it**, and report both accessibly.

#### 18.18.6 Masked string control

Suggested name: **Masked string control**. Presentation: a text field that
uses a mask to guide entry of characters and separators, for example a
reference displayed as `123-456`. This is an existing convention in the
inspected existing renderer/existing renderer families, not a new extended element type or a
claim of support in every JSON Forms renderer set.

Applicability: a `Control` targeting a string schema, with a mask pattern
in `options.mask`. Schema `pattern` alone does not select this renderer.
The generic mask-pattern option
must be distinguished from the boolean `mask` toggle on temporal controls;
a boolean temporal option must not by itself request a generic masked field.
Exact tester ranks and handling of competing specialized string presentations
belong in renderer-family specifications.

| Option or keyword | Default / supported form | Effect |
| --- | --- | --- |
| UI `mask` | Pattern string, e.g. `###-###` | Guides character entry and inserts mask literals. Additional mask forms require explicit renderer-family documentation. |
| Default mask tokens | `#`: ASCII digit; `@`: ASCII letter; `*`: ASCII letter or digit | Defines accepted characters at each token position in the inspected profile. |
| UI `returnMaskedValue` | Boolean; false | False stores the unmasked value; true stores the value including mask literals. |
| UI `tokens` | Token definitions; absent uses defaults | Customizes accepted characters. The inspected profile accepts regex strings or token objects containing a pattern, and falsy entries remove tokens. Additional token-object fields are masking-library-specific. |
| UI `maskReplacers` | Existing compatibility option | Alternative token configuration. Prefer `tokens` for new documents; when both are present, the inspected profile uses `tokens` rather than merging both configurations. |
| UI `tokensReplace` | Boolean; true | Controls whether supplied tokens replace the masking library's default token definitions. This differs from overriding entries in the renderer's token map. |
| UI `eager` | Boolean; false | Requests eager insertion of mask literals according to the supported masking-library contract. |
| UI `reversed` | Boolean; false | Requests mask processing from the end according to the supported masking-library contract. |
| UI `placeholder` | String; renderer-family default | Provides an entry hint; document whether the mask itself is the fallback placeholder. |
| UI `restrict` with schema `maxLength` | Input restriction when enabled | May limit input length; implementations must distinguish displayed mask length from stored-value length. |
| Schema `pattern`, `minLength`, `maxLength` | String validation keywords | Validate the stored string. They do not implicitly define mask tokens or mask structure. |

Example: a reference with six stored digits and a display separator.

JSON Schema for the property:

``` json
{
  "type": "string",
  "pattern": "^[0-9]{6}$"
}
```

UI schema:

``` json
{
  "type": "Control",
  "scope": "#/properties/reference",
  "options": {
    "mask": "###-###",
    "returnMaskedValue": false,
    "placeholder": "123-456"
  }
}
```

The field displays `123-456` and stores `123456`. If
`returnMaskedValue: true` is chosen, the schema must instead describe the
stored representation containing the separator. The renderer must not
rewrite the schema when this option changes.

Input masks guide structure; they do not prove completeness or business
validity. Unlike the temporal mask contract, a generic mask does not imply
that partial input is withheld until the mask is complete. Renderer-family
specifications must state commit timing, paste and deletion behavior,
empty-value handling, and treatment of existing values that do not fit.
Shared focus, clearable, readonly, description, and validation presentation
remain applicable. Existing data must not be silently normalized solely
because the renderer is mounted.

Cross-platform implementations must document their mask/token grammar and
regex compatibility. Function-valued masking-library options are not portable
serialized UI-model features. Conformance examples should cover masked versus
unmasked storage, custom tokens, incomplete input, separators versus length
limits, and selection alongside temporal controls.

### 18.19 Scalar controls and temporal editing

#### Schema references and renderer applicability

For example, this form schema uses a local reference:

```json
{
  "type": "object",
  "definitions": {
    "birthday": {
      "type": "string",
      "format": "date"
    }
  },
  "properties": {
    "birthDate": {
      "$ref": "#/definitions/birthday"
    }
  }
}
```

```json
{
  "type": "Control",
  "scope": "#/properties/birthDate"
}
```

The resolved string/date schema makes the date control eligible just as an
inline definition would; the registry still determines the winning renderer.
The control edits birthDate, not definitions.birthday. A schema reference
identifies the value's schema and does not relocate its data. This example uses
definitions; use the definition container supported by the selected schema
dialect, such as $defs where applicable.

Referenced schemas participate in renderer selection and schema-driven behavior,
including supported formats and bounds. Nested object, array, detail, and cell
dispatch must retain the original root-schema reference context and the correct
scoped data path. Do not detach a referenced fragment in a way that loses its
reference bases or access to required definitions.

Each integration must declare its supported schema dialects and reference forms.
Do not promise support for external references, anchors, or other reference
mechanisms solely because its validator accepts them. An unresolved reference
must produce a diagnostic without modifying data or silently treating the value
as unconstrained.

Finding a property through a combinator or conditional subschema is a schema
lookup, not proof that a branch is active or that all applicable constraints have
been combined. Likewise, reference lookup must not be described as an automatic
merge of every keyword beside $ref. Apply supported dialect semantics and state
any renderer-resolution limitations explicitly. Whole-form validation remains
authoritative; an editing schema selected for a control does not replace it.


#### Boolean checkbox and switch controls

Suggested renderer names: `BooleanControlRenderer` and
`BooleanToggleControlRenderer`. Match a Control targeting a boolean schema.
Use a checkbox by default; options.toggle true requests a switch through the
existing JSON Forms convention. Do not introduce a switch variant. Present the
boolean widget with its associated label and shared description/error feedback.

True and false are real stored values. Displaying missing data must not write
false or otherwise initialize the value. Distinguish an unanswered value from
false: use an indeterminate checkbox, or an accessible "Not set" indication when
the selected widget cannot represent an indeterminate state. User interaction
commits a boolean; indeterminate is presentation state, not a third stored value.
Null is not a valid boolean unless the schema explicitly permits it; nullable
mixed-type editing follows the mixed-value contract.

Do not use truthiness to interpret invalid incoming values. For example, the
string "false" must not be shown as checked. Preserve invalid incoming data for
correction, expose validation feedback, and do not present it as a valid true or
false selection. Disabled/read-only state prevents changes.

This feedback also applies to checkbox and switch cells in normal tables and
grids. A field error such as a type failure at `/team/1/active` MUST be indicated
on the second row's Active cell, with its localized validation message available
through the local error indicator. An indeterminate state alone is insufficient.
The array's child-error summary (for example, "Some items contain errors.") is
renderer-generated aggregation, not an additional validator error, and MUST NOT
replace the cell's feedback. Correcting the value MUST clear the local error
when validation succeeds.

Clearing follows the shared clear-control contract and is distinct from switching
off: switching off stores false. False still counts as a present value for the
clear affordance. In dynamic-property context clearing must retain the key under
the context-aware clear-value policy rather than removing the row; it must not
invent a universal third boolean value.

Required status means the property must be present, not that it must be true.
A required boolean with value false satisfies presence and type requirements.
Native checkbox required behavior must not introduce an unintended true-only
constraint. To require agreement, authors can explicitly constrain the schema
with const true; neither checkbox nor switch presentation implies that rule.

``` json
{
  "schema": {
    "type": "object",
    "properties": { "notifications": { "type": "boolean" } },
    "required": ["notifications"]
  },
  "uischema": {
    "type": "Control",
    "scope": "#/properties/notifications",
    "options": { "toggle": true }
  }
}
```

Here both true and false are valid answers; absence is invalid. A true-only
agreement field instead uses {"type":"boolean","const":true} as its property
schema, with required on the enclosing object when presence is also required.
Validation remains authoritative independently of the visual widget state.

#### Password control interaction

Suggested renderer name: `PasswordControlRenderer`. Match a Control targeting a
string schema with schema format password or UI options.format password. These
selection paths retain the existing password convention; the reveal behavior
below is a project interaction requirement, not a universal upstream feature.

Start with the value obscured. Provide a keyboard-operable reveal/hide action
with a localized accessible name, "Show password" or "Hide password", reflecting
the action it will perform. Toggling changes presentation only: it must not write
form data, trigger a value-change event, alter validation, or mark the value dirty.
Reveal state is local runtime UI state, never serialized into data or UI schema.
Do not introduce another portable option solely to disable the reveal action.

Keep reveal and clear actions distinct, with separate accessible names and hit
targets. Clearing follows the shared clear-control contract, including retaining
an empty string for a dynamic property. Ordinary string constraints and readonly/
disabled mutation rules still apply. Password presentation itself imposes no
complexity rules or additional content validation.

``` json
{
  "schema": { "type": "string" },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "options": { "format": "password" }
  }
}
```

The equivalent schema-driven selection is a string schema with format password
and an ordinary Control; it also works with generated UI schema.

#### Multiline string control

Suggested renderer name: `MultiStringControlRenderer`. Select a Control targeting
a string schema with `options.multi: true`, following the existing JSON Forms
convention. Present a multiline text input with the shared label, description,
validation, focus, and clear behavior. Preserve entered whitespace and line breaks.

| UI option | Default | Behavior |
| --- | --- | --- |
| `multi` | false | True requests multiline entry for a string schema. |
| `rows` | 3 | Positive integer specifying initial visible text rows, excluding labels, descriptions, and validation messages. It does not limit content length. |
| `resizable` | true | Allows manual vertical resizing where supported by the platform. False removes that affordance; overflowing content remains scrollable. |

Rows and textarea resizing are project target options. The positive resizable
name follows the common option vocabulary, with behavior defined by element
context: on this control it affects the textarea, not its parent layout.
Explicit layout height constraints take precedence over rows, and manual resizing
must respect applicable layout bounds. On platforms without manual resizing,
preserve scrolling and access to the full content. Automatic content-driven
height growth is outside this contract for now.

``` json
{
  "schema": {
    "type": "object",
    "properties": { "notes": { "type": "string", "maxLength": 2000 } }
  },
  "uischema": {
    "type": "Control",
    "scope": "#/properties/notes",
    "options": { "multi": true, "rows": 4, "resizable": false }
  }
}
```

Use the shared layout sizing options to control width. The portable contract
excludes the trim sizing option and introduces no negative no-resize alias.
With restrict enabled, maxLength participates in supported entry prevention;
minLength and pattern retain their validation roles. Clearing follows the shared
contract, including preserving an empty string and its key in dynamic-property
context. Neither sizing nor resizing changes the stored string.

#### Number and integer controls

Suggested renderer names: `NumberControlRenderer` and `IntegerControlRenderer`.
Match a Control bound to the corresponding resolved numeric schema type; numeric-
looking string values do not make a string schema eligible. Render a numeric
input, optionally with increment/decrement actions, using the shared label,
validation, focus, and clear-control contracts. Store numbers, not display text.
These are existing JSON Forms control conventions; the behavior below defines
this project's target numeric interaction contract.

| Input | Effect |
| --- | --- |
| `options.step` | Explicit stepping increment; takes precedence over multipleOf-derived stepping. Must be finite and positive. It does not redefine schema validity. |
| `multipleOf` | Schema validation constraint; also supplies the default stepping increment when suitable for the numeric type. |
| `minimum` / `maximum` | Inclusive bounds; with restrict enabled, guard step actions and completed typed/pasted commits. |
| `exclusiveMinimum` / `exclusiveMaximum` | Exclusive bounds in the configured schema dialect; preserve exclusivity in input handling, not merely validation text. |
| `restrict` | Shared preferred default true. Applies supported preventive constraints; false does not disable schema validation. |

Resolve number stepping as options.step, then schema.multipleOf, then 0.1.
For integers use options.step, then a suitable schema.multipleOf-derived increment,
then 1. An integer increment must be a positive integer; do not copy a fractional
multipleOf directly into an integer spinner. A fractional explicit integer step
is invalid configuration and needs a diagnostic. When a fractional multipleOf
cannot directly supply an integer increment, use the integer fallback while
retaining the multipleOf validation constraint. Stepping is not a guarantee that
the resulting value satisfies all schema constraints.

``` json
{
  "schema": {
    "type": "number",
    "minimum": 0,
    "maximum": 10,
    "multipleOf": 0.25
  },
  "uischema": { "type": "Control", "scope": "#" }
}
```

This suggests quarter-unit increments. Adding options.step changes the increment
only; it does not change the accepted multiples. Schema multipleOf is measured
against zero, not relative to the input's minimum or current value. Native input
step-mismatch behavior must not silently become a different schema rule.

Integer input must not silently truncate fractional values. Keep incomplete text
such as a sign as a local draft rather than committing NaN or another invented
value. Apply supported bounds to completed typed/pasted commits as well as step
actions; native min/max attributes alone do not establish enforcement. Preserve
out-of-range incoming data for correction and follow the common restrict repair
policy. Do not round or clamp values merely to fit a bound or stepping increment.
Handle decimal arithmetic without exposing binary floating-point artifacts as
user edits. Clearing follows the shared empty-value contract, including dynamic-
property key preservation.

Decimal precision is not a separate portable option here. Renderer-specific
precision settings must document whether they affect display, rounding, or stored
values; no arbitrary rounding or loss of supplied precision is implied by this
contract.

#### Numeric parsing and representation limits

Parse the complete input before committing a number. Do not accept a numeric
prefix while silently discarding the rest of the user's entry. For example,
1.9 must not become integer 1 through truncation. An integer editor may reject
exponent notation as an unsupported entry syntax, but it must not interpret 1e3
as 1. If that syntax is accepted, parse its complete numeric meaning and then
apply integer and other applicable constraints.

Never commit NaN or positive/negative infinity as numeric form values. Preserve
incomplete or unsupported input as an appropriate local draft with feedback,
following the existing commit and restrictive-editing contracts. Do not replace
it with zero, null, or another invented value to make conversion succeed.

Each implementation must declare its supported numeric range and precision.
Detect an input outside those capabilities before committing a silently changed
integer. For example, ordinary JavaScript Number conversion changes the decimal
integer text 9007199254740993 to 9007199254740992, and 1e309 overflows to infinity.
Checking only that a converted value is finite is insufficient to detect the
integer precision loss. Apply documented decimal precision behavior without
silently introducing arbitrary rounding.

Do not work around representation limits by converting a numeric field into a
stored string, or by adding minimum/maximum constraints to the author's schema.
A host may explicitly choose another representation and compatible schema when
its domain requires it. Unsupported numeric entry needs a clear diagnostic or
editing limitation, not a false claim of full numeric support.

Values already rounded by parsing or transport before reaching the renderer
cannot be reconstructed from the received number. Preserve this distinction
between limitations of the incoming data representation and conversion of new
user-entered text. Existing invalid data remains subject to the shared display
and correction contract.

#### Slider control

Suggested renderer name: `SliderControlRenderer`. Select a numeric/integer
Control with options.slider true and the range tester's required minimum,
maximum, and default. Retain this existing JSON Forms selection convention;
a string schema is not eligible merely because its data looks numeric.

Render a labelled horizontal track with minimum/maximum labels and a current-
value indication. Provide keyboard operation and accessible value information.
Shared descriptions, validation, readonly/disabled, and clear behavior apply.

Use schema.multipleOf as the increment, otherwise 1. The numeric text input's
options.step precedence does not automatically apply to sliders. Preserve integer
values for integer schemas even when multipleOf is fractional. Bounds determine
the track range; respect exclusive limits and applicable preventive constraints.
Schema multipleOf is measured from zero, not from minimum. A native widget whose
steps start at minimum must be adapted so it does not invent another allowed set.

``` json
{
  "schema": {
    "type": "integer",
    "minimum": 1,
    "maximum": 6,
    "default": 2,
    "multipleOf": 2
  },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "options": { "slider": true }
  }
}
```

Here selectable valid values are 2, 4, and 6, not 1, 3, and 5. Keep the declared
bounds distinct from the available step positions. If no valid position exists,
diagnose the incompatible range rather than manufacturing a value. No arbitrary
epsilon or rounding may silently weaken an exclusive bound or integer constraint.

Zero is a real current value and must not be replaced by a default through a
truthiness fallback. Missing data may use schema.default as a visual thumb
position, but must be visibly and accessibly identified as "Not set" until edited.
Mounting or rerendering must not commit that default. Invalid incoming values
remain available for correction; do not coerce strings/null to numbers or silently
clamp stored data to the track. If the widget cannot display the incoming value,
show the actual invalid value and associated error separately from its provisional
thumb position, without misrepresenting that position as committed data.

Clearing follows the shared clear-value contract: ordinary controls return to a
missing state, while dynamic-property controls preserve their key under the
context-aware policy. Required validation remains active. A fallback thumb
position after clearing must not immediately recommit a value. Disabling restrict
does not disable validation or require a finite slider to represent every
out-of-range value as a selectable position.

#### Temporal controls: preferred interaction

Date, Time, and Date-time controls SHOULD provide a picker as the preferred
selection interaction: a calendar for dates, a time picker for times, and
combined or coordinated pickers for date-times. The picker should make valid
choices discoverable and apply supported schema bounds to its selections.

Controls SHOULD also allow direct keyboard entry as a complementary path.
A format-aware input mask should guide users through the expected date/time
parts and separators, using the effective display format and locale. Keep
the expected format visible through a placeholder or accessible hint. Hosts
may disable masking with `options.mask: false` where supported.

The mask guides input structure; it does not establish calendar validity or
replace schema validation. Incomplete edits should remain local while being
entered rather than prematurely replacing stored data. Completed typed input
and picker selections must use the same save-format contract and remain
subject to the same schema validation. Native platform pickers may differ
visually while preserving these interaction semantics.

#### Temporal controls: schema-driven behavior

The following is the behavioral contract for schema-aware Date, Time, and
Date-time controls. Renderer-family support must be documented separately;
it must not be inferred merely from validator support.

| Schema keyword | Behavioral meaning for the widget | Validation distinction |
| --- | --- | --- |
| `type: "string"` | Establishes the intended value domain. | A picker still serializes a string, not a native Date object. |
| `format` | `date`, `time`, or `date-time` can select the corresponding renderer without an explicit UI format. | Validation depends on the validator's format configuration. |
| `formatMinimum` | Inclusive lower bound: when restricted, prevent picker selections before the bound. | Complete typed values may commit with range feedback, as described below; external values still require validation. |
| `formatExclusiveMinimum` | Exclusive lower bound: the boundary itself is not selectable. | Exclusivity must be preserved at the picker's supported precision. |
| `formatMaximum` | Inclusive upper bound: prevent picker choices after the bound. | Does not authorize clamping existing data. |
| `formatExclusiveMaximum` | Exclusive upper bound: the boundary itself is not selectable. | Same precision requirements as the lower exclusive bound. |
| `pattern`, `minLength`, `maxLength` | Do not automatically define calendar limits or a date mask. | Validate the serialized string; any additional input restriction must be explicitly documented. |
| Parent `required` | Required indication and clear/empty interaction according to the renderer contract. | Required-property presence and valid string content are separate constraints. |
| `readOnly` | Prevent data-changing interactions when honored by the integration's readonly policy. | This is an annotation, not a value-validity constraint. |

The preventive bound behavior above follows effective `restrict` (section 15).

The four format-bound keywords are extensions supplied by `ajv-formats`,
not built-in JSON Schema keywords. Ajv validation requires a schema `format`
with comparison support; UI `options.format` cannot supply that requirement.
Literal bounds and `$data` references are separate support capabilities.
A renderer claiming literal-bound support must not imply that it resolves
`$data` bounds. See [Ajv's format comparison documentation](https://ajv.js.org/packages/ajv-formats.html).

For Date control, bounds operate on calendar dates. An exclusive bound on
2026-09-19 excludes that date; the adjacent selectable dates are September
20 for a lower bound and September 18 for an upper bound.

For Time control, the picker compares time-of-day values at its supported
precision. A minute-resolution picker cannot blindly truncate a lower bound
of 09:30:30 to 09:30: its earliest valid minute is 09:31. Exclusive bounds
must select the next/previous representable value satisfying the comparison,
with midnight and empty ranges handled explicitly. Fractional-second support
must be declared rather than inferred from an accepted parse format.

For Date-time control, compare complete date-time values. Restrict calendar
dates first, and apply time-of-day limits only on the corresponding boundary
date. For a lower bound of September 19 at 14:00, September 19 must exclude
earlier times while September 20 must not inherit the 14:00 lower limit.
Recompute limits using the currently selected date, including uncommitted
picker selection when confirmation actions are enabled. An exclusive bound
may move the earliest/latest available date across midnight.

With confirmation actions enabled, changing the date can make the existing draft
time invalid. Under restrict, preserve that draft, display a translated range
explanation in the picker, and disable Apply until the complete date-time satisfies
all supported bounds. Guard the Apply handler as well as the button state. For
example, changing June 16 at 09:00 to June 15 must not apply June 15 at 09:00 when
the minimum is June 15 at 12:00. Do not silently clamp the time. Correcting the
draft re-enables Apply; Cancel discards it without changing committed data.
With restrict false, allow an out-of-range draft to be committed; ordinary schema
validation and error reporting remain independent of this preventive UI check.

For text entry, a parseable temporal value outside the supported range may be
committed even with restrict enabled. Show the range validation error on the control and let the user
correct the value. For example, typing June 15 at 09:00 with a minimum of
June 15 at 12:00 retains that entered value in the model and reports the violation;
a restricted picker must prevent committing that same selection. The committed
range error must participate in form validity through schema validation or the
established additionalErrors mechanism when renderer-side validation is needed.
Do not silently clamp the typed value. This allowance concerns range violations;
it does not authorize silently normalizing an impossible date or clock value.

Temporal feedback for an unapplied value describes the **local draft**, not a
validation failure of the committed form data. It may use error styling to explain
why Apply is disabled, but must not automatically publish an additionalError against
a still-valid committed value. With explicit Apply/Cancel, Cancel clears the draft
feedback and leaves committed data and its validation unchanged. A form-level action
must follow the host's explicit policy for open confirmation drafts: require the
user to Apply/Cancel, or deliberately operate on committed data. It must never
silently apply the draft.

This feedback is also required when there are no confirmation buttons. If a typed
or picker edit cannot be committed because it is incomplete, invalid, or outside
supported restrictions, provide an associated explanation near the temporal input
or within its open picker. Do not leave the user with an unexplained rejected edit.
Ordinary unresolved input still participates in the shared pending-edit policy so
submission cannot silently consume an older value. A valid committed value and an
unresolved edit are separate states; keeping draft feedback local must not hide
that pending state from the integration. Once an invalid value is actually committed
(for example through text entry or with restrict false), normal validation/error
propagation applies.

Use the existing translator for all temporal draft feedback, including the reason
Apply is unavailable. The DateTime range message uses the key dateTime.outOfRange
with the fallback "Select a date and time within the allowed range." Equivalent
date/time feedback must follow the same i18n conventions. Translate any explanatory
bound labels and format displayed bounds using the active display format and locale;
do not expose raw validator/debug text as the only explanation. Feedback must have
an accessible association with the editor, update when the draft, bounds, or locale
changes, and clear when corrected or discarded. Ordinary partial input need not
produce a disruptive alert on every keystroke.

When multiple schema bounds apply, eligible picker values should satisfy
all of them. An empty intersection must not manufacture a valid-looking
selection. Preserve existing invalid data and expose validation errors;
picker bounds are not a substitute for validating typed, pasted, or
externally supplied values. Renderer-specific limits may affect picker
behavior but never alter schema validation.

Each renderer specification must state its comparison timezone/offset policy,
precision, behavior for invalid bounds, and support for dynamic bounds.
These details are especially important when displayed local time differs
from the stored offset or when daylight-saving transitions occur.

#### Temporal controls: UI options and defaults

The following established option meanings and observed default profile are
based on the inspected existing renderer and neighboring existing renderer renderer families.
They are not a claim of identical support in official existing renderer or every
existing renderer release. Preserve the semantic effects when implementing another
renderer family; document any unsupported behavior and fallback.

| UI option | Domain and default profile | Observable effect |
| --- | --- | --- |
| `format` | `date`, `time`, `date-time`; absent uses ordinary selection | Selects a temporal presentation for a string even without schema format. |
| `dateFormat` | String; localized `L`, fallback `YYYY-MM-DD` | Display and typed-input parsing format; supplies the default placeholder and mask. |
| `timeFormat` | String; localized `LT`, fallback `H:mm` | Display/parsing format; seconds in the format enable seconds interaction in the inspected profile. |
| `dateTimeFormat` | String; localized `L LT`, fallback `YYYY-MM-DD HH:mm` | Combined display/parsing format and seconds interaction. |
| `dateSaveFormat` | String; `YYYY-MM-DD` | Serialization after a successful edit. |
| `timeSaveFormat` | String; `HH:mm:ssZ` | Serialization after a successful edit, including offset under this format. |
| `dateTimeSaveFormat` | String; `YYYY-MM-DDTHH:mm:ssZ` | Serialization of the combined date/time after an edit. |
| `mask` | Boolean; enabled unless false | Derives a temporal input mask from display format; incomplete nonempty masked edits are staged instead of immediately replacing form data. This is distinct from a generic String Mask control's mask-pattern option. |
| `ampm` | Boolean; false, Time and Date-time | Requests 12-hour picker interaction; display and save formats remain separate settings. |
| `showActions` | Boolean; false | False commits picker selection directly; true stages it until OK, with Cancel discarding pending picker edits. This does not defer all text-input commits. |
| `okLabel`, `cancelLabel` | Strings; `OK`, `Cancel` | Translated labels for confirmation actions. |
| `placeholder` | String; defaults to effective display format | Replaces the input hint without changing parsing or storage. |
| `focus` | Boolean | Requests initial input focus where supported. |
| `clearable` | Boolean; shared inspected bindings default to true when enabled | Exposes a clear action; empty-value serialization follows the renderer/host clear-value contract. Required validation remains independent. |
| `views` | Date-only array drawn from `year`, `month`, `day`; absent uses default picker navigation | Restricts selectable calendar views, e.g. year/month selection without a day grid. This does not automatically change `dateSaveFormat`. |
| `pickerIcon` | Renderer-specific icon representation | Changes the picker trigger icon where supported; icon names are not cross-library portable. |

The inspected JavaScript profile uses Day.js format tokens and expands
localized formats before building the mask. Another platform must document
its compatible token subset or translation; it must not silently interpret
these strings using an incompatible formatter dialect. Accepted input formats
and parser strictness must also be stated. Parsing successfully does not
establish schema validity.

Configuration defaults and per-control options are distinct from tester
selection: merging global configuration into renderer options does not imply
that a tester reads that same merged object. Document the actual selection
path as well as option precedence.


### 18.20 Mixed-value controls and navigation

``` json
{
  "schema": { "type": ["string", "integer", "boolean", "null", "object", "array"] },
  "uischema": { "type": "Control", "scope": "#" }
}
```

Initialize the type selection from the existing value without replacing or
coercing it. An integer is also admissible under number. Preserve out-of-domain
incoming data for correction and display validation errors. Explicitly choosing
a different type initializes its value through the normal default-generation
mechanism. Apply the shared typeChange confirmation policy: fallback complex
confirms replacement of a nonempty object/array, without routine prompts for
simple values. Explicit configuration can require or suppress confirmation.
Selecting the current type must not reset it. Disabled/read-only state prevents
these mutations. Both mixed and oneOf changes use the shared confirmation
policy, with their documented operation-specific fallbacks.

Selecting null writes JSON null; clearing removes the selection/value using the
shared clear-value contract. Empty string, null, and absence remain distinct.
For an array item, do not offer a clear-type action and guard the handler against
unsetting the slot. This applies to ordinary array items, additional tuple items,
and fixed tuple positions. Type changes replace the value at the same index;
selecting null, when allowed, writes actual JSON null and retains its tree node
and type selection. With primitive/leaf nodes visible, a null item remains
selectable and its detail panel must allow changing its type.

Deleting an item is a separate array action that removes the position and obeys
the array's restrictions; fixed tuple positions cannot be deleted. Clearing a
value, such as changing a string to an empty string, remains distinct from
clearing its type. Never create undefined values or sparse array slots: their
serialization as null is not equivalent to storing an actual null value and
must not be used to conceal an invalid internal data state.

The clear X follows shared focus/hover and data-presence rules. Choosing a type
does not guarantee that the remaining schema constraints validate.

**Value schema and delegated rendering.** Resolve references in the scoped
schema and derive an independent rendering schema for each allowed type. Narrow
type to the selected single type and exclude type-inapplicable keywords from the
rendering view so testers choose the appropriate editor. Retain applicable
constraints, formats, annotations, and reference context. A schema default is
usable only when compatible with the selected type; otherwise use normal
initialization for that type. Keep the original schema authoritative for full
validation and never mutate the caller's schema during normalization.

Where dispatch expects the enclosing schema and original Control scope, replace
only the scoped subschema in a copied enclosing schema. Preserve the original
data path and root-reference context. Normalize unconstrained array items into
an editable mixed-type schema when necessary, without weakening constrained or
false item schemas. Select the value editor through normal JSON Forms registry
and UI-schema delegation, rather than hardcoding one widget for each type.

`options["<type>-detail"]` supplies a type-specific detail UI schema (for example,
`object-detail` or `array-detail`), taking precedence over general detail for that
type. Otherwise use ordinary registered/generated UI schemas. This is an extended
option convention; UI schemas and resulting controls still pass through shared
dynamic resolution and normal dispatch.

**Primitive layout.** For string, integer/number, and boolean values, place the
type selector on the left and the delegated value editor immediately to its
right. Align the actual input controls despite differing labels, descriptions,
and validation messages; avoid duplicating labels solely to achieve alignment.
The value area takes remaining width. Boolean editing follows the same aligned
row. Null or no selection displays the type selector without a value editor.
Responsive layouts may stack controls when necessary while preserving order.

**Object/array layout.** Complex values open a navigation workspace with a
resizable splitter: a searchable tree on the left and the selected node's editor
on the right. This avoids rendering deeply nested structures as progressively
indented, nested forms. Navigation changes the viewed path, not the data.
Provide accessible splitter resizing, tree navigation, selection, and named
controls without depending on a particular component library.

The tree represents object properties and array items. Search filters nodes by
field label/path and retains the ancestors needed to locate matches. Provide a
"Show primitive values" toggle for leaf nodes such as strings, numbers, booleans,
and null; default off so the tree emphasizes objects and arrays. This toggle and
search are local presentation state, not filters on stored data or validation.
Selection and the selected node's detail editor are independent of tree-row
visibility. Preserve the search text and the "Show primitive values" setting
across navigation, rename, and type changes. Apply the active filters normally:
do not force a nonmatching selected row or its ancestors into the filtered
results, and do not clear the search to reveal a selection.

For example, with search "customer", renaming customer to client selects client
and keeps its detail panel open at the new data path. If client does not match
the active filter, its tree row remains hidden while its logical tree selection
is retained. Clearing or changing the search to include client reveals that same
selected row. Similarly, hiding primitive rows, or changing a selected complex
value to a primitive while primitive rows are hidden, must not close its detail
panel or redirect selection to the root. Explicit View navigation may select a
filtered-out node without changing the filters; open its ancestor chain for
when it becomes visible. Reconcile selection to a surviving node only when the
selected data path actually ceases to exist, not merely when its row is hidden.

Hovering or focusing a tree row exposes applicable delete and rename actions.
Keyboard users must have equivalent access. Rename applies to object-property
keys, not array indices, and follows the additional-property contract: validate
names, reject collisions, preserve values, and reassess the schema at the new
path. Update tree selection after rename. Deletion updates the owning object or
array and reconciles selection to a surviving node. Apply the shared delete confirmation policy (fallback complex); cancel leaves
data and selection unchanged.

After an explicit deletion, reconcile selection using complete data-path segments:
- If the selected node or one of its ancestors was removed, select the nearest
  surviving parent.
- Deleting an unrelated object property preserves selection. For example,
  deleting `item` must not affect selection of `itemCode`.
- Deleting an earlier array element shifts the selected surviving item's index
  down by one, preserving any descendant suffix. With
  `["Alice","Bob","Carol"]`, selecting Carol at index 2 and deleting Alice keeps
  Carol selected at index 1. A selected `people.2.name` becomes `people.1.name`.
  Deleting index 1 must not classify index 10 as its descendant.
- Preserve active search and primitive-visibility filters during reconciliation.
  Subsequent edits must use the reconciled path, not the removed or previous index.

For external array replacements without stable item identity or an explicit
mutation description, do not infer identity from equal values or promise to
follow the same item. Reconcile against the new structure, discard stale target
state, and apply the shared pending-edit rules so queued work cannot be redirected
to a different item.

Use the shared `restrict` option (preferred default true), not a new strict
option. Prevent deletion below parent minProperties/minItems and removal of
required properties, and apply maxProperties/maxItems to additions. Enforce
constraints in handlers as well as action availability; count all properties.
Rename preserves property count but must obey required-key and name rules.
Readonly/disabled prevents mutations regardless of restrict. Inherit schema
`readOnly` through every ancestor and into delegated detail editors; an editable
root does not authorize editing a locked descendant. Recheck current permissions
in delete/rename handlers and when accepting a previously opened confirmation.

The web integration requires JSON Forms core 3.9.0-alpha.1 or newer. Its data
paths use dots as separators and treat brackets literally: `test[0]` names a
property, while `test.0` addresses an array element. Additional-property Add and
Rename accept brackets (subject to schema name validation); edit, clear, rename,
and delete must preserve literal keys, including under bracketed parent keys.
Numeric object keys remain object keys.

**Literal-key tree navigation and editing (extended contract).** Tree node
identity must preserve exact property-key segments. A literal `"a.b"`, nested
`a` → `b`, and an empty key are distinct nodes. Use an unambiguous internal
encoding for keys that cannot be represented by ordinary core paths. Such IDs
are tree state only: never dispatch them to core or persist them in form data.
Show an empty key as `""` so it remains discoverable and searchable.

Selecting a node below a literal dotted or empty key opens an isolated form
rooted at its value, using the applicable value schema and preserving references,
validation, i18n, configuration, readonly state, and renderer registrations.
Translate nested View/drill-in actions back to the parent tree so the existing
tree and selected-node panel remain coordinated. Preserve the selected editor
when filtering or hiding primitives removes its visible tree row.

Write changes through a copy of the mixed renderer's data using exact own-key
segments, then dispatch at the mixed renderer's valid root path. Rename and
Delete similarly copy the actual parent object/array. Do not interpret brackets
or dots inside a property name as nested paths. Recheck permissions and ancestor
`readOnly` constraints at mutation time; apply parent `minProperties`/`minItems`
restrictions when restriction mode is enabled. Rename validates the actual
parent schema's name constraints, preserves whitespace, prevents collisions,
and selects the new node identity. Array deletion must rebase the selected index
without confusing similarly named object keys. An obsolete editor must not
recreate a property that has already been removed.

For example, with `{"": {"asd": {"": "value"}}}`, selecting the innermost
`""` node edits that string without applying the enclosing object's
`propertyNames` constraints at a deeper level. A name constraint belongs to the
object schema that declares it; it is not inherited by arbitrary nested objects.

This support does not change core path syntax for ordinary Controls. A delegated
aggregate object form that would expose schema-declared dotted/empty keys
through ordinary core paths must remain view-only; select the individual tree
node to edit its value through the isolated editor. Other direct-path integrations
must likewise protect unsupported operations rather than mutate a different key.

Resolve the actual
parent schema, including references and applicable patterns, rather than guessing
constraints from the currently displayed child.

**Drilling into complex values.** In a parent's form, a nested object or array
is represented compactly by its type selector followed by a "View" action,
commonly an eye icon. Activating View selects that node in the left tree,
reveals its location, and replaces the right panel with its own editor. It must
not open another recursively nested workspace or copy the value elsewhere.

The selected complex node's right panel places its type selector across the full
width above its delegated object/array form, allowing direct type changes there.
The tree root may use its already-visible workspace type selector instead of
duplicating it. Descendant complex fields in that form again use compact View
references. Breadcrumbs or equivalent ancestor navigation support returning to
parent nodes. All delegated edits operate on the original node path. Reconcile
the tree and detail panel after type changes, deletion, rename, and external
data updates without redirecting an edit to the wrong array item/property.
### 18.21 Expandable arrays and list with detail

**List overflow.** The list navigation pane SHOULD have a bounded height and
scroll vertically only when its items exceed that height. Scrolling the list
must not scroll or replace the selected item's detail editor. This also applies
when ListWithDetail is nested inside a cell or row detail dialog. The Ant Design
and shadcn reference renderers cap the list at 20rem; shorter lists retain their
natural height. This bound applies with pagination disabled as well as to an
overflowing page when pagination is enabled. It does not change selection,
item indices, or add/delete restrictions.

**Long list labels (presentation recommendation).** Prefer a single-line label
with an ellipsis over horizontal scrolling caused only by long text. Keep the
item's action buttons visible and let the label use the remaining width. Widening
the list pane should reveal more of the label; typing a longer value should not
keep increasing the list's horizontal scroll range. Selecting the item exposes
the full value in its detail editor, so the navigation label need not display
all of that text at once.

Horizontal scrolling remains appropriate when the pane is too narrow for the
non-shrinking controls, such as the item avatar and action buttons. Keep those
controls reachable rather than clipping them. A tooltip showing the full label
on hover or keyboard focus is an optional enhancement, not a requirement; retain
the full accessible name even when the visible label is truncated. For example,
a long company name may appear as "Northwind…" in the list while its complete
value remains editable in the selected item's Company field.


#### Expandable array-item forms

Suggested renderer name: `ArrayLayoutRenderer`. This is an existing JSON Forms
renderer presentation convention: a Control bound to an object array with nested
item structure normally selects expandable item forms. The reviewed tester uses
isObjectArrayWithNesting at rank 4; exact dispatch still depends on the registry,
including explicit table requests. No accordion variant is needed for this array
presentation. Each panel corresponds to a data item, unlike structural Categories.

**Suggested layout.** Render a bounded section with the array label in a top
toolbar, a child-validation summary indicator, and an Add action at the trailing
edge. Below it, stack item disclosure panels. Each header contains a one-based
index marker, an item label, an indication of item errors, optional Move up/down
actions, a Delete action, and an expansion affordance. Keep action buttons separate
from the disclosure activation target so deleting or moving does not toggle the
panel. Expanded content contains the delegated item form at the item's data path,
with enough spacing for its controls; do not require a particular card library.
An empty array shows a localized empty-state message while retaining the toolbar.

| UI option | Default and behavior |
| --- | --- |
| `initCollapsed` | False: initially open the first item if present. True: initially close all items. Initialization only, not a continuously controlled expansion value. |
| `collapseNewItems` | False: open the newly added item. True: leave it closed and preserve existing expansion. |
| `elementLabelProp` | Optional item-relative dotted data path for its header label. Follow Shared array item labels for choice translations, first-primitive-property fallback, readable item fallback, and preservation of zero/false values. |
| `detail` | Existing item-detail UI-schema convention; delegate at the item path. Otherwise use registered/generated item UI schemas. |
| `showSortButtons` | False: hide reorder actions. True: show Move up/down, disabled at array boundaries or when mutation is prohibited. |
| `hideAvatar` | False: show the index marker. True: hide that marker, without suppressing accessible item identity or validation feedback. |
| `hideArraySummaryValidation` | False: show child-error summary. True: hide that summary only; retain validation and field/item error feedback. |
| `restrict` | Shared preferred default true: enforce minItems/maxItems and applicable mutation restrictions. |

Default to at most one open item; opening another closes the previous item and
all items may be closed. Categorization accordion also allows an explicit all-closed state. Multiple-open presentation is renderer-specific for now,
not another portable option. Preserve expansion through ordinary rerenders;
collapsing must not clear data or suppress validation. Track the logical item
through renderer-owned reorder operations rather than transferring expansion to
the item now at its old index. Reconcile deletion/external replacement without
editing the wrong item; do not inject business-data IDs solely for UI state.

Add initializes an item using its schema/default-generation mechanism, dispatches
the array change, and applies collapseNewItems after insertion. With restrict,
maxItems disables/prevents Add and minItems disables/prevents Delete. Disabled or
read-only state prevents all mutations. Delete follows the shared confirmation policy (fallback complex), using a
localized dialog when required; cancel preserves data and expansion. Recheck guards on confirmation and
ensure the operation still targets the intended item. Reordering changes stored
array order, not merely visual sorting. Guard handlers as well as visible buttons.

Provide keyboard-operable disclosure and actions, localized names/tooltips, and
expanded-state relationships. Index styling is optional; item identity and errors
must remain understandable without color or hover alone.

``` json
{
  "schema": {
    "type": "array",
    "minItems": 1,
    "maxItems": 5,
    "items": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "address": {
          "type": "object",
          "properties": { "city": { "type": "string" } }
        }
      }
    }
  },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "label": "Contacts",
    "options": {
      "elementLabelProp": "name",
      "initCollapsed": false,
      "collapseNewItems": false,
      "showSortButtons": true,
      "detail": {
        "type": "VerticalLayout",
        "elements": [
          { "type": "Control", "scope": "#/properties/name" },
          { "type": "Control", "scope": "#/properties/address" }
        ]
      }
    }
  }
}
```

Here item headers use contact names, item forms edit name and address, Add is
prevented at five entries and Delete at one when restrict is enabled. Reordering
remains available within boundaries and does not change the item count.

#### List with detail

Suggested renderer name: `ListWithDetailRenderer`. This existing JSON Forms
convention selects `type: "ListWithDetail"` bound to an object-array schema.
No Control variant is needed. Show an array toolbar with label, optional child-
validation summary, and Add action above a selectable item list on the left and
a delegated detail form on the right. Render the list and detail as panes separated
by a draggable vertical divider so users can adjust their relative widths. Use the
renderer family's native splitter/resizable component where available. The default
split MUST be resizable; no extra layout element is required in the UI schema.
The list may scroll independently; avoid requiring fixed pixel widths and adapt
the arrangement to available space. Resizing MUST preserve selection, data, pending
edits and validation. Ordinary edits and selection changes MUST NOT reset the
user's pane sizes. Apply the keyboard, focus and accessibility requirements in §7
to the divider, including when form data is read-only.
List rows show item labels, selection/error state, and applicable reorder/delete
actions. Keep actions separate from row selection and make them keyboard accessible.

| Option | Behavior |
| --- | --- |
| `elementLabelProp` | Item-relative label path; otherwise use the shared generated item-label fallback. |
| `detail` | Item form UI schema, with scopes relative to the item; otherwise use registered/generated UI schemas. |
| `showSortButtons` | Default false; true exposes Move up/down within array boundaries. |
| `hideArraySummaryValidation` | Default false; true hides the array child-error summary without disabling validation. |
| `restrict` | Shared preferred default true; apply minItems/maxItems and mutation constraints. |

Initially no item is selected, and the detail panel displays a localized selection
prompt. An empty array displays an empty-state message while Add remains available
when allowed. Selection/navigation do not modify data. Add generates an initial
item value and selects the new item for immediate editing. Edits in the detail
panel update that item's original path. Reordering changes stored array order and
preserves selection of the logical item. Deleting the selected item clears
selection; deleting another item preserves the selected item at its new path.
Deletion uses the same confirmation behavior as expandable array-item forms;
cancellation preserves data and selection. Recheck the intended item and mutation
guards when confirming, including after external data changes. Disabled/read-only
state prevents mutations; navigation remains distinct from editing.

``` json
{
  "schema": {
    "type": "array",
    "minItems": 1,
    "maxItems": 5,
    "items": {
      "type": "object",
      "properties": { "name": { "type": "string" }, "notes": { "type": "string" } }
    }
  },
  "uischema": {
    "type": "ListWithDetail",
    "scope": "#",
    "options": {
      "elementLabelProp": "name",
      "showSortButtons": true,
      "detail": {
        "type": "VerticalLayout",
        "elements": [
          { "type": "Control", "scope": "#/properties/name" },
          { "type": "Control", "scope": "#/properties/notes", "options": { "multi": true } }
        ]
      }
    }
  }
}
```


### 18.21.1 Collection pagination and whole-row details

This is a target contract. Schema acceptance does not establish renderer support.
Renderer families MUST publish gaps until implemented. Expandable table rows are
optional family capabilities, not required by this contract.

**Pagination.** `options.pagination` is false, true, or an object with
`pageSize` (positive integer, default 5) and `pageSizeOptions` (nonempty,
unique positive integers, default [5, 10, 25, 50]). True enables the defaults;
false disables pagination. An object enables it. If the initial pageSize is not
in the choices, include it in the rendered selector without rewriting options.
Hide unnecessary page navigation, but retain a size selector when it can change
the visible result. Do not reserve empty rows to fill a page.

Pagination defaults to enabled for ordinary array tables and AG Grid; it defaults
to disabled for expandable arrays and ListWithDetail. Fixed tuple positions,
choice/token controls and mixed trees are not paginated by this option.
Element options override config.jsonformsExtended.array.pagination, then the
presentation default. Flat config.pagination is not a supported default. Resolve the whole value, not a merge across config levels.

For dynamic object properties use `options.additionalProperties.pagination`,
with the same shape and default true. Its defaults come from
config.jsonformsExtended.additionalProperties.pagination, then true. There is
no flat config.additionalProperties fallback.
It applies only to dynamic entries; declared fields stay outside the paginated
region. This UI option does not change JSON Schema additionalProperties semantics.

For tuple trailing values use `options.additionalItems.pagination`, resolved against
`config.jsonformsExtended.additionalItems.pagination`, then true. This applies to
values after the fixed prefix (draft-07 `additionalItems`, or `items` following
`prefixItems` in newer drafts), including existing disallowed trailing values
that need corrective removal. Fixed positions remain outside pagination and
item labels and edits retain their absolute array indices. Bounds apply to the
whole array. Pagination never permits adding values forbidden by the schema.

All three scoped config pagination settings accept false, true, or the page-size
object. False disables pagination by default for that collection kind; local true
or an object can enable it again. Missing additional-properties or additional-items
settings enable pagination with page size 5. Resolve the whole pagination value,
not a merge of page-size fields across levels. For example:

```json
{
  "jsonformsExtended": {
    "array": { "pagination": false },
    "additionalProperties": { "pagination": false },
    "additionalItems": { "pagination": { "pageSize": 5 } }
  }
}
```

Pagination is a view over the complete collection, never slicing stored data.
Validation, duplicate-name checks, bounds, counts and summaries cover every page.
Provide a way to locate items with errors on other pages. Sorting/filtering precede
paging; edits target original items, not displayed row indices. Paging and page-size
changes never reorder data. Reconcile the current page after deletions; reveal newly
added items. Rename retains logical property identity and focus. Page-size changes
retain the first visible item where possible. Selection survives page navigation;
external replacement must not redirect a pending edit to another item.
Pending editor drafts must be committed, retained or explicitly cancelled under
the shared editing contract; navigation must never silently discard them.
Use localized labels and keyboard-accessible page and size controls.
Place the primary pager in a distinct footer below the current entries, inside
the collection boundary, for tables, additional items and additional properties.
Keep Add in the collection header. Use consistent end alignment and spacing
within each renderer family. For unusually tall scrolling collections, an optional
second pager at the top MUST share the same page and page-size state as the footer.

AG Grid controls MUST support portable `options.pagination`, `options.columnDefs`
and `options.rowDetail`; authors MUST NOT need `agGridOptions` to use these features.
For AG Grid, resolve portable pagination using the same local options, scoped
configuration and defaults as regular tables. Explicit `agGridOptions.pagination`,
`paginationPageSize` and `paginationPageSizeSelector` override only their
corresponding resolved settings. Native false values are explicit overrides.
Do not show two independent pagers.

| Portable setting | Explicit native override under `options.agGridOptions` |
| --- | --- |
| `options.pagination` enabled/disabled | `pagination` |
| Resolved `pagination.pageSize` | `paginationPageSize` |
| Resolved `pagination.pageSizeOptions` | `paginationPageSizeSelector` |
| `options.columnDefs` | `columnDefs` replaces the whole list |

For example, portable page size 6 with native `paginationPageSize: 2` MUST show
2 rows per page. Portable columns Name then Email with native columns Email then
Name MUST use the native order and definitions. An explicit native empty column
list overrides a nonempty portable list. Missing native settings retain the
portable behavior; pagination and column overrides MUST NOT change row-detail
configuration. See the [AG Grid comparison example](../examples/ag-grid/README.md).

**Table columns.** `options.columnDefs` selects and orders the top-level item
properties shown in an array table or AG Grid. Each entry has a `field` property name
and optional positive numeric `width`, `minWidth`, and `maxWidth` in CSS pixels.
Widths are table layout constraints; content must not overflow into adjacent cells.
Regular table data columns support interactive resizing through a visible header
handle. Pointer dragging and keyboard resizing must honor minWidth/maxWidth,
work in both text directions, and preserve data, selection, and pending edits.
Authored width is the initial width; user-resized widths persist through ordinary
row edits and pagination for the mounted table. Selection and action columns do
not need resize handles. Provide an accessible localized name and current/min/max
values for each resize handle.
Omitting the option retains automatic columns. An empty list shows only table
selection/actions. Columns with `scope: "#"` bind to the whole row as described
in the cell-summary contract; their field is a stable presentation key. Other unknown fields are ignored; duplicate fields use the first entry.
Authors should specify minWidth <= maxWidth and keep width within these bounds.
Column visibility never removes data or validation, or limits row detail fields.
`options.cells[field]` continues to configure editors and composite cell details.
These portable definitions do not expose arbitrary AG Grid column callbacks or APIs.
Explicit `agGridOptions.columnDefs` replaces the portable column list as a whole,
including its order and widths, and supports native groups and computed columns.
Matching item fields retain their JSON Forms editors unless a native definition
overrides them. Switching to AG Grid alone preserves portable column, pagination
and row-detail settings.

**Whole-row details.** `options.rowDetail` is opt-in on array tables and grids.
It requires presentation `dialog` or `panel`. It is independent of
`options.cells.<property>.detail`, which edits just one cell value.
Resolve the row form from rowDetail.detail, then the existing registered item UI
schema lookup, then generation. Explicit detail is a UI-schema element/layout.
Scopes and rules are item-relative; preserve root-schema references, i18n,
enabled/read-only inheritance and the selected item's original data path.

Dialog presentation adds a localized Edit details action to each row. Do not make
summary text itself the trigger. Edit a deep isolated draft of the whole item;
Apply commits atomically, Cancel/close discards it under the existing draft and
confirmation contracts. Recheck identity and mutation guards on Apply; stale
external replacements must not be overwritten. Read-only users may inspect details.
Panel presentation shows a selectable table beside a persistent item editor;
placement is right (default) or bottom, and resizable defaults true.
For panel presentation, use the renderer family's native splitter/resizable
component where available: right placement has a draggable vertical divider
between the table and detail; bottom placement has a draggable horizontal divider.
`options.rowDetail.resizable: false` disables interactive resizing while retaining
the two-pane layout. The default MUST allow users to resize both placements.
Resizing MUST preserve row selection, data, pending edits and validation; ordinary
edits and selection changes MUST NOT reset the user's pane sizes. Apply §7's
keyboard, focus and accessibility requirements to the divider. Dialog presentation
does not introduce a table/detail splitter.
`options.rowDetail.collapsed` sets initial visibility: `true` starts with the detail
pane hidden; omitted or `false` starts visible. It applies to both placements.
The localized show/hide action beside Add toggles visibility without clearing the
selected row or changing data.
While the detail pane is visible, the table MUST visually highlight the row whose
details it displays, using the renderer family's selected-row styling and an
accessible current-row indication (for example, `aria-current="true"`). The
highlight follows detail selection and disappears when the pane is hidden; reopening
the pane restores the highlight for its selected row. Detail selection is independent
of bulk-delete checkbox selection: highlighting a row MUST NOT check its deletion
checkbox, and checking a deletion checkbox MUST NOT change the detail selection.
Clicking a row or its ordinary cells updates detail selection without revealing a
hidden pane. The explicit row Edit details action selects that row and reveals the
pane if hidden. Hiding details leaves the table visible and usable.
This is an initial state, not a controlled visibility value: ordinary data updates
must preserve the user's choice. Placement, resizable and collapsed are invalid
on dialog presentation.

For example, `"rowDetail": { "presentation": "panel", "placement": "bottom", "collapsed": true }`
starts with only the table visible. Panel edits follow ListWithDetail's
immediate update contract; show its selection prompt when nothing is selected.
Inline cells may coexist with either presentation.

**Sizing.** Reuse shared layout sizing; do not add pagination-specific height
fields. Pagination bounds item count, not pixel height. Resizable panes require a
bounded containing layout for independent scrolling. Wide tables scroll horizontally
inside their content region; toolbar actions remain reachable. Dialog bodies scroll
within the viewport while their title and actions remain reachable. Preserve focus
indicators and validation access. Scrolling is independent of pagination.
Virtualization is optional and must preserve identity, drafts and accessibility.

Focused fixtures: collection-pagination, table-row-details, ag-grid, property-pagination, additional-items-pagination.
A future kitchen-sink should use separate domain tabs (for example recruitment
with resumes, booking with dates/times, and inventory with tables), not one
artificial model containing unrelated fields. It complements focused examples.

### 18.21.2 Detail dialog geometry and interaction

Cell editors accept `options.cells[field].dialog` (or `options.dialog` on the composite cell itself). Whole-row editors accept `options.rowDetail.dialog` when `presentation` is `"dialog"`. Both renderer sets support the same object:

```json
{
  "width": 900,
  "height": "75vh",
  "maximizable": true,
  "draggable": true,
  "resizable": true
}
```

Numbers are CSS pixels; strings are CSS dimensions. Omitted width and height keep the renderer's default sizing. The dialog is constrained to the viewport with a margin. Maximize/restore is available by default; `maximizable: false` hides it. Maximizing preserves the normal geometry for restore. Dragging from the title and resizing from the bottom corner are opt-in and unavailable while maximized. Closing resets position and maximization. Geometry changes never apply or discard form edits; Apply and Cancel retain their existing semantics.

Shadcn detail dialogs initially focus the dialog container rather than selecting the first input. Composite cell edit and remove actions appear on hover or keyboard focus and remain visible on touch devices. The remove icon uses the destructive theme color.

The Table row details: recruitment example demonstrates separate cell and row dialog sizes.

**Recommended presentation behavior.** The following are UX recommendations
(SHOULD), rather than requirements for identical pixels or framework-specific
markup. They apply to both cell and whole-row dialogs, including dialogs opened
from AG Grid.

- **Initial position:** open centered in the available viewport, independently of
  the pointer or invoking row. A framework's slightly higher vertical placement
  is acceptable if the entire dialog remains accessible. Apply drag offsets
  relative to this initial position; do not replace the centering transform.
- **Viewport bounds:** constrain requested dimensions to the available viewport
  with a visible margin. Re-clamp after viewport changes. Keep the title,
  close/restore controls, and footer reachable when moving or resizing.
- **Layout and scrolling:** use a header, a flexible body, and a footer. Keep the
  body immediately below the header, including when maximized; extra height
  belongs to the body rather than gaps between sections. Let only the body
  scroll automatically when its contents exceed the available space. Avoid
  unnecessary scrollbars and competing nested scroll areas. Keep header and
  footer visible independently of body scrolling.
- **Footer:** place Cancel and Apply at the bottom inline end (bottom right in
  left-to-right layouts), in the renderer's usual order and style. Increasing
  dialog height should move the footer to the bottom, not leave it floating
  halfway down the dialog.
- **Move and resize:** when enabled, use the title area as the drag handle and
  provide a discoverable resize affordance. Buttons in the title must remain
  clickable without starting a drag. Enforce a usable minimum size so the
  header and footer cannot overlap. Geometry changes must preserve the current
  editor state, active tab, and unsaved values.
- **Maximize and restore:** place the action next to Close in the header, using
  the renderer's native icon-button styling and a translated accessible label
  and tooltip. Maximize uses the available viewport with a margin; Restore
  returns to the prior normal size and position. Disable moving and manual
  resizing while maximized. Opening a new editing session starts with the
  configured normal geometry.
- **Focus and input:** opening should not select an input's text automatically.
  Prefer initial focus on the dialog container or heading, retain keyboard
  focus within the modal, and return it to the invoking control on close.
  Preserve standard keyboard access to Close, Cancel, Apply, and
  maximize/restore. Pointer dragging must not be necessary to reach content.
- **Embedded hosts:** React and web component hosts should present equivalent
  layout and theme behavior. Portaled content must retain its theme variables
  and styles, including inside a shadow root. Verify normal and maximized
  states on narrow viewports and in light/dark themes.

These recommendations describe the intended interaction contract; they do not
assert that every renderer implements every geometry edge case. In particular,
viewport-change handling, minimum resize bounds, and keyboard alternatives for
manual movement/resizing should be checked when evaluating renderer support.


### 18.21.3 Scroll regions and renderer styling

Scrolling SHOULD preserve the renderer's theme and standard pointer, wheel,
touch, and keyboard behavior. Scrollbars SHOULD appear only when content
overflows; both axes must remain reachable where content can exceed the pane.
Do not hide overflow merely to conceal a scrollbar.

Use independent scroll regions for bounded list navigation and fixed-height
side/bottom detail panes. The collection pane and detail editor must each remain
reachable when the splitter reduces their space. Dialogs keep the header and
action footer outside the scrolling body, as described in §18.21.2. List
navigation retains the 20rem reference height limit described in §18.21.
Pagination and scrolling complement one another: pagination limits item count,
while scrolling handles oversized items or a constrained viewport.

**Renderer integration decisions:**

- **shadcn:** use the official Radix-based shadcn Scroll Area for list navigation,
  row detail panes, and detail dialog bodies. Use its themed vertical and
  horizontal scrollbars as needed. Keep the pinned component available in both
  the React demo and web component hosts, with the same behavior and theme.
- **Ant Design:** retain native scrolling. Ant Design has no general-purpose
  Scroll Area component in its public component catalog. The recommended styling
  is a subtle theme-token thumb and transparent track, respecting light/dark
  mode and platform accessibility preferences. This is a styling recommendation;
  themed native scrollbar styling is not yet claimed as implemented by the
  reference renderer.

Apply bounds at collection and pane boundaries rather than introducing a
separate scrollbar around every field or ordinary form section. Expanded array
forms may still grow vertically when many items are expanded; pagination or
virtualization remains a possible improvement, not a promise of current support.
These presentation recommendations do not change validation, selection,
pagination defaults, or deletion policy.

### 18.21.4 Suggested collection UX improvements

The following are suggestions for further design and verification across normal
tables, AG Grid, lists with detail, and expandable item panels. They do not
introduce new configuration options or assert reference-renderer support.
Existing normative validation, access, pagination and confirmation rules still
apply.

- **Errors in hidden row fields.** Consider a row-level error indicator that
  includes fields absent from the visible columns. Activating it could open
  the row detail and select the relevant tab or field.
- **Errors across pages.** Consider a collection-wide error count and a
  “Go to first error” action that reveals the affected page and item. Counts
  and navigation should respect the existing error-visibility policy.
- **Stable selection.** Verify that sorting, filtering and pagination retain
  the selected source item's identity. Define a predictable result after
  deleting the selected item, such as selecting a neighbouring item or showing
  the no-selection state. Avoid silently displaying a different item's detail
  because its visible index matches the previous selection.
- **Pending detail edits.** Audit every dismissal or navigation route against
  the existing discard-confirmation policy: Cancel, close button, Escape,
  backdrop click, switching rows and hiding a detail panel. Preserve the
  distinction between staged dialog edits and live panel edits.
- **Markdown summaries in grid operations.** Prefer readable text for sorting
  and filtering, excluding Markdown delimiters such as `**` and `~~`.
  For example, a summary displayed as bold “Boston” should filter and sort as
  “Boston”. Retain the same interpolation access gates; do not extract values
  from hidden or refused content.
- **Keyboard interaction.** Verify that hover-revealed edit and clear actions
  also appear on keyboard focus, dialog closure returns focus to its opener
  or a sensible surviving control, and column/pane resize handles support
  keyboard operation.
- **Empty and filtered collections.** Distinguish “No items” from “No matching
  items”. If an added item is excluded by an active filter, consider explaining
  the result and offering a way to reveal it without silently clearing filters.
- **Combined layout stress cases.** Check narrow panes, long translated labels,
  validation counts, action buttons, nested dialogs and long summaries together.
  Keep actions reachable and apply overflow at the appropriate collection or
  pane boundary.

**Reference implementation progress.** The React Ant Design and shadcn tables
now provide collection-wide displayed-error counts and navigation to the first
affected source row, including another page. Where row details are configured,
the action opens them; selecting a nested detail tab or focusing the exact field
is not yet implemented. Row detail action areas include descendant error counts.
AG Grid uses readable Markdown summary text for sorting/filtering and explains
when a newly added item is filtered out, with an explicit Clear filters action.
These additions reuse validation results through a shared path index and cache
resolved grid summaries with a bounded cache invalidated by form/config/locale
changes. No additional validation pass is required.

Suggested priorities are readable Markdown sorting/filtering, navigation to
errors in hidden fields, and stable selection through collection changes.
Object/array summary error indicators and bounded expandable collections remain
covered by their respective validation and overflow sections.

### 18.22 Item labels

Use options.elementLabelProp to select an item-relative dotted data path, such
as department or contact.name. This is a data path, not a JSON Schema pointer.
Without an explicit path, use the first primitive property identified by the
shared schema helper. If no usable label is available, provide a readable,
localizable item fallback, such as "Item 1". Preserve 0 and false as meaningful
labels rather than treating them as missing.

For example, the employees property has this schema:

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "department": {
        "type": "string",
        "oneOf": [
          { "const": "eng", "title": "Engineering" },
          { "const": "fin", "title": "Finance" }
        ]
      }
    }
  }
}
```

```json
{
  "type": "Control",
  "scope": "#/properties/employees",
  "options": {
    "elementLabelProp": "department"
  }
}
```

An item containing {"department":"eng"} displays Engineering, or its translated
choice label, rather than the raw constant eng. Resolve the selected property's
schema and use the existing enum/constant-based oneOf label helpers where
applicable. Ordinary values remain data text; do not treat arbitrary user-entered
strings as translation keys. Unsupported or invalid existing values must not
cause data mutation merely to obtain a label.

Editing the selected property or changing locale refreshes the displayed item
label without changing selection or expansion. A label is presentation, not an
item identifier; duplicate labels must not merge items or redirect actions.
For elementLabelProp, dots remain path separators; this does not establish
literal-dot addressing. Brackets are literal characters with core 3.9.0-alpha.1
or newer. The Additional Properties isolated-editor contract below handles
literal dotted names without interpreting them as paths. Do not introduce an additional authoring alias for elementLabelProp.
### 18.23 Tuple position layouts

An inline `options.detail` layout on a tuple arranges its fixed positions. Its
Control scopes use schema positions, for example `#/items/0` in draft-07 or
`#/prefixItems/0` in draft 2020-12. A uniform fixed-length tuple uses `#/items/0`
for its first synthetic position. Layouts dispatch normally, preserving Group,
visibility, sizing and composition semantics. The supplied layout replaces the
ordinary `vertical` row/column choice. `options.layout` remains the child's
sizing request to its parent; it never contains a tuple form.

A position Control may supply a label, summary and dialog detail. The tuple
position layout must not be forwarded as the dialog layout for every position.
Invalid or undeclared position scopes produce a diagnostic. Omitted positions
remain in data and validation, and their errors remain discoverable in the tuple
summary. Cyclic registry delegation must be diagnosed and stopped; a registry
Control at `#` without a more specific detail must not redispatch itself forever.

### 18.24 One-time password presentation

A string password Control may request `options.variant: "otp"`. Both `minLength` and `maxLength` must be present; `maxLength` gives the box
count. Otherwise fall back to the ordinary password field. Equal bounds describe
a fixed-length code; lower `minLength` permits optional trailing boxes.
Use separate character boxes with normal paste and keyboard navigation. Keep
masking, labels, readonly state and string validation. Commit partial codes as entered so ordinary `minLength` validation describes
the current value. In table cells, retain ordinary password masking rather than
requiring a row of character boxes. It must not coerce numeric-looking codes into numbers or drop zeros.

### 18.25 Cron control

Select a string Control with schema `format: "cron"` or UI `options.format:
"cron"`. The value is a six-field string in this order: seconds, minutes, hours,
day of month, month, day of week. Day-of-month and day-of-week constraints are
combined with AND. Do not silently accept five-field Unix cron, seven-field
Quartz cron, or `@reboot` as this dialect. The aliases `@yearly`, `@annually`,
`@monthly`, `@weekly`, `@daily`, `@midnight` and `@hourly` expand to their
six-field schedules; an unchanged value keeps its original spelling.

Support `*`, comma lists, inclusive ranges and positive steps. Field ranges are
0–59 seconds/minutes, 0–23 hours, 1–31 days of month, 1–12 months, and 0–7 days
of week (0 and 7 denote Sunday). The reference profile also supports named months
and weekdays, `?` in the day fields, and the documented `L`, `W` and `#` day
selectors. A host must register a validator for this format; a string format
annotation alone does not establish cron validation or schedule execution.
Register cron validation as a JSON Schema format or keyword extension and report
its failures through normal schema validation. The cron control MUST NOT
republish those failures as additional errors.

The picker asks for a period first: minute, hour, day, week, month or year.
Only the relevant selectors are shown. These are editing views of the same
expression, not separate stored modes. Choosing an upper time unit pins lower
wildcard time units to zero when needed: choosing hour 9 from all wildcards
produces `0 0 9 * * *`. It must not pin day or month wildcards to one.

Keep raw text available for syntax the picker cannot faithfully represent.
Opening and accepting without a semantic edit preserves the original spelling.
Invalid text remains visible with feedback; do not replace it with a default
schedule. `showActions` defaults to true: picker edits are staged until Apply,
and Cancel discards them. False commits picker changes immediately. Text entry
uses the ordinary string-edit contract. Clearing removes the value and does not
create an all-wildcards schedule. Readonly and disabled guards apply to both paths.

Example: Scheduled jobs.

### 18.26 Code-editor profile

`options.format: "code"` requests the code-editor profile. `language` is a fixed
language identifier; `:language` is a root-data path and takes precedence.
Language changes update the current editor model. An absent or unusable language
falls back to plaintext. These presentation choices never change schema format.

Ordinary code is a string. With `language: "json"` and `convertJson: true`,
serialize the JSON value for editing and commit only successfully parsed JSON.
Keep invalid JSON as an editable draft; it must not overwrite committed data.
Keep the original schema and data path for validation and updates.

| Option | Meaning |
| --- | --- |
| `monaco.rows` | Fixed height measured in text rows |
| `monaco.autoGrow` | Grow with the model line count |
| `monaco.minRows`, `monaco.maxRows` | Positive integer auto-grow limits |
| `monaco.options` | Standalone editor options for this named web profile |
| `monaco.initActions` | Named editor actions to run after initialization |
| `propagateErrors` | Opt-in publication of one owned summary, default false |

The Monaco profile uses Monaco itself. Its model/worker URIs must isolate
instances; associate JSON schema diagnostics with the intended model only.
Clean up owned subscriptions, models and observers without disposing host-owned
resources. Maximize/restore, Escape, container resizing and independent editor
instances must work. Theme changes must not overwrite a custom host theme or
retarget unrelated editors. Worker loading and styles must work in production
and in a ShadowRoot where that host is supported.

Language-service diagnostics remain inside the editor unless publication is
explicitly enabled. Publish error-level diagnostics only; warnings and hints do
not invalidate the form. Retraction, language switching and target changes
follow §15.6. JSON parse errors and pending language analysis remain distinct.

### 18.27 File and color profile details

File limits measure the original file bytes, not base64 text length. Numeric UI
`formatMinimum`, `formatMaximum`, `formatExclusiveMinimum` and
`formatExclusiveMaximum` provide these limits. Do not pass numeric byte limits
to an unmodified string-format comparison keyword in the validator.

The color profile writes `hex` (default), `hex3`, `rgb` or `hsb`. Alpha extends
`hex` to eight digits, `rgb` to `rgba(...)`, and `hsb` to `hsba(...)`.
`hex3` refuses transparency instead of discarding it. Hex output includes `#`;
functional output separates arguments with comma-space. HSB is a stored
representation, not CSS; convert it before drawing a swatch.

Accept #RGB, #RRGGBB and #RRGGBBAA, integer RGB channels in 0–255, and
comma-separated HSL/HSB input with optional alpha. HSL is accepted as input but
is not a save-format option in this profile. Reject unsupported input honestly:
no fallback black and no data mutation on mount. Normalize hue into [0,360),
round hue and percentages to whole units, and alpha to two decimal places when
serializing an actual edit. Eight-digit hex uses 8-bit alpha precision.

`colorTextEntry` defaults to true; false leaves the picker without text entry.
The picker retains a clear action when `clearable` permits it. Its initial
channel view follows the configured save format on each opening. Switching the
channel view alone does not change the storage format or data.

### 18.28 Input, clear and required-state details

```json
{
  "type": "Control",
  "scope": "#/properties/name",
  "options": {
    "placeholder": "Enter your full name"
  }
}
```

The string placeholder supplies presentation text only. It never initializes a
value, becomes stored data, or changes validation. An explicit empty string
suppresses the renderer's fallback placeholder. Without a supplied placeholder,
the renderer may use its documented fallback, such as the effective display
format for temporal inputs or a localizable empty-selection prompt.

Replacing a date/time placeholder does not change parsing, masking, or saved
representation. Authors should keep the hint consistent with the actual input
format. A placeholder supplements the label and description; it must not replace
the control's accessible label or be the only persistent source of essential
instructions.

The supplied text is not implicitly a translation key. Existing support does
not establish a universal placeholder lookup under the control's i18n prefix.
Hosts may supply localized text, including changing text through the generic
$dynamic.options.placeholder mechanism. Renderers receive the resulting ordinary
option without interpreting dynamic descriptors. This adds no new translation
syntax; renderer-provided fallback prompts should be localizable.

Only controls with an appropriate hint presentation need display this option.
Passing placeholder to a widget without such presentation, such as a checkbox,
does not establish meaningful placeholder support. Updating the hint must not
change the value, selection, or input focus.

#### Input composition and Unicode string length

Input-method editors may compose text through intermediate stages before a user
accepts the completed input. Preserve that composition session. Masks,
normalization, reactive rendering, and delayed updates must not overwrite the
active draft or prematurely treat it as a finalized value. Apply completed-edit
restrictions without preventing valid text from being composed. An action that
consumes form data must not mistake an unfinished composition for a completed
edit; coordinate it with the pending-edit contract below. Underlying widget
support may satisfy these requirements without renderer-specific event handlers.

Restrictive string-length handling must measure the stored string using the
selected validator's supported JSON Schema length semantics. JSON Schema strings
are sequences of Unicode code points; HTML maxlength measures UTF-16 code units.
A direct mapping is therefore not equivalent for all valid input. See
[JSON Schema string model](https://json-schema.org/draft/2020-12/json-schema-core)
and HTML maxlength.

For example:

```json
{ "type": "string", "maxLength": 1 }
```

The value "😀" contains one Unicode code point but two UTF-16 code units. A
native maxlength of 1 can prevent this schema-valid value. Do not equate string
length in UTF-16 code units with schema length, or silently substitute the number
of visually perceived characters: combining sequences can contain multiple code
points. Declare validator compatibility limitations rather than silently changing
schema semantics.

When restrict is enabled, check supported completed edits consistently across
typing and paste. Do not split Unicode characters when enforcing a limit. For
masked or formatted inputs, distinguish display characters from the stored
representation to which the schema constraint applies. A native input attribute
may assist editing only where its behavior is compatible with that contract.

Preserve invalid incoming data for correction; do not truncate it automatically
on rendering. Allow correction toward validity under the existing restrictive
editing policy, and retain validation errors for values that remain invalid.
Composition handling must preserve the user's editing position and must not
introduce duplicate or stale commits when composition ends.

#### Shared initial focus

```json
{
  "type": "Control",
  "scope": "#/properties/name",
  "options": {
    "focus": true
  }
}
```

The boolean focus option defaults to false. True requests initial focus on the
primary input when the control mounts and is visible and focusable. It does not
override disabled state or platform focus constraints. Readonly does not itself
imply that an otherwise focusable input cannot receive focus.

Ordinary data updates, validation results, and rerenders must not repeatedly
reclaim focus. The request must not automatically reveal a hidden category,
expand a collapsed panel, or open a picker or dialog. Do not interpret initial
focus as an instruction to navigate to a currently unavailable control.

The generic $dynamic mechanism may supply the effective options.focus value;
the renderer still receives an ordinary option. Changing that value is not an
imperative "focus now" command and does not introduce a continuous focus binding.
Actual remounting and platform/widget autofocus behavior require integration
coverage, particularly for conditionally rendered controls and repeated items.

When several controls request initial focus, there is no portable guaranteed
winner. Authors should identify one intended initial target per active view.
Dialog focus management and returning focus after closing an editor remain
separate interaction responsibilities.

#### Shared descriptions and required markers

| Option | Default | Behavior |
| --- | --- | --- |
| `showUnfocusedDescription` | false | Show the applicable schema description while the control is focused. True also shows it when unfocused. No description is shown for a hidden control or when no description exists. |
| `hideRequiredAsterisk` | false | True hides the visual required asterisk without changing required validation or accessible required-state information. |

``` json
{
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Enter your full name." }
    },
    "required": ["name"]
  },
  "uischema": {
    "type": "Control",
    "scope": "#/properties/name",
    "options": {
      "showUnfocusedDescription": true,
      "hideRequiredAsterisk": true
    }
  }
}
```

Here the description remains visible when unfocused and the asterisk is hidden,
but the property is still required. Determine required status from the applicable
schema and form binding, not from the displayed marker. Expose that status to
assistive technology independently of the asterisk.

Description visibility must not suppress validation errors that the active
validation-display contract requires showing. Description and error text may
appear together. Associate visible help and errors with their input accessibly.
Renderer-specific wrapper suppression must preserve accessible naming and error
associations rather than silently discarding them. This section does not define
or revise the behavior of label: false; that remains a separate review topic.

#### Required properties, markers, and clearing

For example:

```json
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": { "type": "string" }
  }
}
```

The containing object's required array requires the name key to exist. Here
{"name":""} is valid, while {} is not. Add minLength: 1 to the string schema
when an empty string must also be rejected. Required presence does not itself
require a truthy value or permit a value of the wrong type. See
[JSON Schema required properties](https://json-schema.org/understanding-json-schema/reference/object#required).

The existing core mapper derives a control's required flag by resolving its
parent schema and checking that parent's required array. This is not a complete
evaluation of every conditional or composed requirement. For example:

```json
{
  "type": "object",
  "properties": {
    "contactByEmail": { "type": "boolean" },
    "email": { "type": "string", "minLength": 1 }
  },
  "if": {
    "properties": { "contactByEmail": { "const": true } },
    "required": ["contactByEmail"]
  },
  "then": {
    "required": ["email"]
  }
}
```

With {"contactByEmail":true}, validation requires email, although a simple
parent-required lookup does not infer that active requirement for the marker.
With contactByEmail false or absent, this conditional does not require email.
If email is present, its string/minLength constraints still apply. The required
entry inside if ensures that an absent contactByEmail does not activate then.
This example uses a dialect supporting if/then.

Validation errors must remain available even when a renderer cannot infer the
corresponding required marker. Document conditional/composed required-state
coverage rather than claiming uniform support. Hiding the asterisk does not
change validation or the accessible required state supplied by the binding.

Ordinary required value controls remain clearable under the shared clearing
contract; clearing may produce a required or other validation error. This does
not override structural restrictions on array removal or dynamic-key deletion.
In a dynamic additional-property context, clearing a string retains its key with
an empty string value; it does not implicitly delete that property. Explicit
Delete or Rename must obey the applicable required-key restrictions when restrict
is enabled. Retaining a key satisfies presence only, not constraints such as
minLength. Existing readonly/enabled guards apply to all these operations.

#### Shared clear-control behavior

Editable value controls, including string, integer/number, temporal, choice, and
oneOf dropdown controls, support `options.clearable`, default true. False opts
out of the clear affordance. Disabled/read-only controls must not expose an
operable clear action. Required status alone does not remove clearing: the cleared
value can produce a required or other schema-validation error.

Show the clear X icon only when the control has a value to clear and either the
control contains keyboard focus or the pointer hovers over the control. Keep the
icon available while focus or the pointer moves onto the clear button. Hide it
when there is no value, or neither condition applies. Presence is not truthiness:
false and zero are values. This uses the control's storage/empty-value contract,
not the Group's recursive data-presence indicator. A selected oneOf branch is
also clearable even when its branch fields are empty.

The clear button must have a localized accessible name and keyboard activation;
focus within the control makes it available without requiring hover. Clearing
uses the renderer/host clear-value contract and normal change dispatch, rather
than applying a schema default or selecting the first available choice. It must
not silently turn an absent value into JSON null unless that is the established
storage contract. Existing mutation restrictions still apply where relevant.

For a oneOf dropdown, clearing returns the selector to **no selection** and
removes the selected branch form. When branch data would be discarded, use the
same confirmation and cancellation behavior as a branch switch. Preserve values
of properties declared in the enclosing schema under the oneOf preservation
contract; clear the branch-specific value without initializing another branch.
If there are no enclosing properties to preserve, clear the scoped value using
the normal clear-value contract. Clearing must not immediately trigger automatic
selection of the first or a fitting branch. The clear icon disappears once there
is no selection; preserved enclosing properties remain editable independently.
### 18.29 Array choices and tokens


**Origin:** Automatic enum-array checkbox selection is an existing JSON Forms
renderer convention. `options.variant: "multi-select"` and
`options.variant: "chips"` are project extensions. An editor entry named
"Checkbox group" emits the existing enum-array schema and an ordinary Control,
without a presentation variant.

| Suggested renderer name | Matching schema and UI schema | Behavior-changing inputs |
| --- | --- | --- |
| EnumArrayRenderer | Control for an array with uniqueItems true and string items with enum, or item oneOf branches each defining const; no variant required. | vertical arranges checkboxes in supporting families; restrict applies minItems/maxItems prevention. |
| MultiSelectControlRenderer | Control with variant multi-select for the same finite, unique array-choice shapes. Explicit selection takes precedence over automatic checkboxes. | Compact dropdown/list supporting multiple selections; schema choices supply values and labels. No free-entry values. |
| ChipsControlRenderer | Control with variant chips for homogeneous string items, optionally limited by enum or string-valued oneOf/const choices. | Free token entry when unconstrained by finite choices; finite choices restrict token values. uniqueItems controls duplicate allowance. |

Examples of the two extension encodings:

``` json
{
  "schema": {
    "type": "array",
    "uniqueItems": true,
    "items": { "type": "string", "enum": ["Email", "SMS"] }
  },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "options": { "variant": "multi-select" }
  }
}
```

``` json
{
  "schema": {
    "type": "array",
    "items": { "type": "string", "minLength": 1 }
  },
  "uischema": {
    "type": "Control",
    "scope": "#",
    "options": { "variant": "chips" }
  }
}
```

For finite-choice chips, use the first example's schema with variant chips.
The schema determines whether entry is free or choice-limited; no separate
free-entry option is introduced. Item constraints apply to each stored value,
not the joined display text. Preserve choice value types and constant titles
rather than storing display labels. Chips in this contract store strings;
numeric/object token conversion is not implied.

Apply the common restrict contract to additions/removals and batch changes:
minItems/maxItems bound the array size. With uniqueItems true, prevent creating
duplicate selections; otherwise free-entry chips may retain repeated strings.
Remove the selected occurrence when duplicates exist. Do not silently deduplicate,
coerce, or discard invalid incoming values. Preserve existing value order when
rendering and removing entries; append new selections/tokens in interaction order.
Partial token input remains a local draft until explicitly committed. Validation
of item constraints remains active independently of restrict; token presentation
does not itself imply a mask or automatic prevention for every schema keyword.
Disabled/read-only controls must prevent additions and removals. Provide accessible
selection and token-removal controls. Component-specific styling/search props are
not additional portable options in this contract.

#### Multi-choice identity, applicability, and safe removal

**Origin:** shared typed-choice and mutation requirements applied to existing
JSON Forms multi-choice renderers. This introduces no new option and does not
require every choice widget to support every JSON value type.

A renderer's tester must match only choice value types that its selection,
addition, and removal logic supports. Recognizing item oneOf branches containing
const is not by itself evidence of support for object or array constants. When
a shape is unsupported, leave it eligible for an appropriate alternative renderer
rather than selecting a widget that cannot edit it correctly.

Use consistent value identity across selected-state display, duplicate prevention,
and removal. Preserve distinctions such as numeric 1 versus string "1"; false
and zero are actual choices, not removal signals or absent values. Translated
labels and string-coerced widget identifiers do not establish stored-value identity.
If structured constants are supported, compare their JSON contents consistently
with schema value equality rather than relying on object reference identity.

A removal request for a value that is no longer present must not change unrelated
items. Recheck the target against current data before dispatching or applying the
mutation. Never interpret a failed lookup as an array index identifying another
item. In presentations allowing repeated values, removal must identify the intended
occurrence under the existing token/array identity contract.

For example, a finite choice with const {"code":"eng"} must recognize an existing
selected value with the same JSON contents even if it was loaded as a different
object instance. If the user then removes it, remove that matching value; if it
has already disappeared through another update, do not remove the last item or
another choice instead. A renderer unable to provide these semantics must not
claim structured-constant support.

General editable arrays remain subject to uniqueItems validation, but checkbox-
style duplicate prevention must not be presumed to cover arbitrary object forms.
Document any preventive uniqueness support separately for those renderers. Do
not silently deduplicate, reorder, or discard existing array data to satisfy
uniqueItems. Preserve invalid incoming duplicates for correction under the shared
editing and validation contracts.


## 19. Honest rendering of invalid and out-of-domain data

A renderer MUST NOT silently replace existing form data with a different
allowed value merely because the current value is not among the available
choices.

Where supplied data falls outside the allowed set, **preserve the underlying
value until the user explicitly changes it.** Acceptable presentations
include: showing the unknown value in an invalid state; showing the control
unselected while displaying the actual value with a validation message; adding
a marked non-valid current-value entry; or using a custom-value facility
without implying validity.

**The renderer MUST NOT select the first valid option as a substitute.**

> The UI represents actual form data. It does not invent nearby valid data to
> make the widget look valid.

The same rule governs repair: existing invalid data stays visible and
editable, never truncated, padded, normalized or rewritten on mount.

## 20. Optional editor and tooling capability catalogues

Capability catalogues describe available presentations for editors and
tooling. They are **not part of the serialized model** and are not required
for runtime rendering or conformance. Runtime selection continues through the
ordinary tester and renderer registry; catalogue metadata neither constrains
nor replaces it.

Tooling may display friendly names while emitting the established encodings —
"Multiline text" emitting `options.multi: true`. Such an identifier is
metadata, **not** a `variant` value, and choosing a display name MUST NOT
silently rewrite the data schema.

Non-normative editor guidance: expose schema format separately from UI
presentation. A schema-format edit changes the data contract; a presentation
edit writes UI options. Selecting a widget should not silently add, remove or
change a schema format. Conflicting schema and UI formats, and incompatible
save formats, should be made visible.

### 20.1 Authoring the model in a typed language

Where a model document is authored in a statically typed language rather than
as JSON, the types can check what the documents themselves cannot: that a
`scope` addresses a property the schema declares.

This is a development-time aid over an **unchanged** document — the output is
an ordinary UI schema, indistinguishable to a renderer — so it may be adopted
per form and never becomes a portability requirement.

Three rules are decisions about the **model**, not about any language, and any
implementation offering this must make them:

- **A dotted property name has no scope, so it must be refused rather than
  mis-addressed.** The path grammar has no escape (§11.3), so a property
  containing a dot yields a pointer that is well-formed, resolves to nothing,
  and reports no error. Refusing it at authoring time is the only honest
  answer; the name remains legal and its data valid (§18.16).
- **Pointer-reserved characters are escaped, not refused.** A property name
  containing `/` or `~` *is* addressable once escaped per the JSON Pointer
  rules, so it stays available. The general rule: **where a correct pointer
  exists, produce it; where none can, refuse.**
- **A property named like a keyword is unremarkable.** A property called
  `properties`, `items` or `type` addresses correctly, because the keyword and
  the property name occupy different positions in the pointer.

Where such types are **narrower** than the model — a curated set of CSS
lengths, say — the usual risk inverts: a false rejection turns a correct
document into a build failure. Those types must be calibrated deliberately and
kept testable.

## 21. Diagnostics

Runtime diagnostics SHOULD carry stable machine-readable codes:

```ts
interface UIDiagnostic {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
}
```

Representative codes: `layout.multipleSizingModes`, `layout.spanUnsupported`,
`layout.spanClamped`, `dynamic.invalidBinding`, `dynamic.pathNotFound`,
`dynamic.forbiddenPath`, `dynamic.invalidTemplate`, `variant.inapplicable`,
`variant.unsupported`, `i18n.missingKey`, `i18n.missingParameter`,
`categorization.initialNotFound`, `action.unhandled`,
`script.evaluationDisabled`, `script.evaluationFailed`.

**Diagnostics address the author, not the person filling in the form.** A
misconfigured element is not something the user can act on, so a diagnostic is
reported to the author rather than rendered into the form — with the exception
of failures that leave visible content missing, which need an accessible
explanation in place as well.

**A declared diagnostic that nothing emits is worse than none**, because the
condition it names then appears to be handled.

## 22. Runtime state

Runtime interaction state MUST NOT mutate the UI schema: selected category,
current step, accordion and Group expansion, splitter position, pending action
state, focus and hover, and renderer-internal widget state.

Applications may persist runtime state separately. Template-local and
editor-local state MUST NOT become form data.

## 23. Reserved portable names

```text
variant   layout    span      weight    width     height
gridColumns         gap       wrap      minItemWidth
resizable rows      align     justify   collapsible
collapsed showDataIndicator   interpolate
markup    textParams          initial   responsive
name      size      $dynamic
```

Renderer-specific namespaces MUST NOT redefine these with incompatible
meanings.

## 24. Examples requirement

An example catalogue MUST accompany this model.

Examples MUST use understandable business domains with realistic names,
labels, descriptions, data and constraints. Placeholder identifiers such as
`aProp`, `x` or `z` are not acceptable.

Recommended domains: person and contact records, employee onboarding, customer
profiles, products and orders, appointments, projects and tasks, invoices and
payments, applications and review workflows.

Each example should include a JSON Schema, a UI schema, realistic data,
dictionaries in at least two languages, validation constraints, the expected
renderer behaviour, fallback behaviour, a description of the intended visual
and usability result, and a stable identifier.

The catalogue must cover **multiple representations of the same schema shape**
— an array of choices as tokens, as a multi-select and as automatic checkboxes
— and must include invalid supplied data outside the allowed set.

**Every specified behaviour carries a worked example.** An example is not
illustration: writing one is how a contract is discovered to be unimplementable,
ambiguous or already broken. An example that cannot be made to work is a
finding about the specification, not a failure of the example.

## 25. Conformance suites

Portable implementations MUST share machine-readable conformance vectors.

Current areas: implemented interpolation namespace access and safety;
undefined, null, false, zero and empty behaviour; template escaping and invalid
templates; URL policy; the expression core
subset; Markdown profiles and security; the span formula; mixed sizing;
vertical Auto; wrap and auto-fit; hidden effective children; Spacer sizing and
gaps; splitter initial sizing; variant applicability and fallback;
out-of-domain value preservation; and interpolation capability and fallback.

Future overlay path grammar, recursive resolution and URL substitution vectors
remain in the design backlog; they are not part of this release.

**Security conformance is REQUIRED**: prototype protection, URL policy,
script-evaluation gating and Markdown sanitization.

## 26. Normative requirements summary

Implementations **MUST**:

- preserve unknown options, extensions and renderer namespaces;
- preserve actual form data rather than substituting valid-looking
  alternatives;
- protect against prototype pollution;
- apply the URL policy to static, dynamic and Markdown URL-bearing values;
- gate string script evaluation;
- sanitize Markdown;
- keep structural fields, `name` and canonical `variant` static;
- keep runtime state out of the UI schema;
- honour effective-visible-child layout semantics;
- provide safe fallbacks;
- provide platform-appropriate accessibility for interactive variants;
- treat visibility as presentation, never as authorization.

Implementations **SHOULD**:

- support applicable canonical variants;
- preserve useful established options;
- reproduce mature renderer enhancements where semantically useful;
- publish renderer behaviour specifications;
- support business-friendly example and conformance coverage.

## 27. Verification before implementation

Verify against the exact targeted core and renderer versions: core type names
and inheritance; rule effects and read-only behaviour; how the `restrict`
policy maps to renderer mutation paths; native option names and testers;
date and time display and save options; supported temporal schema
constraints; native Categorization orientation and stepper encodings;
translator and key conventions and `textParams` integration; tolerance of
unknown `$dynamic`; resolver coverage for nested, detail and generated
schemas; effective-element caching and identity; content-security-policy
behaviour for string script evaluation; the expression dialect and its locale
data; and
Markdown parser and sanitizer behaviour.

**Verify empirically rather than by inference.** Several rules in this
document exist because a plausible reading of an upstream contract turned out
to be wrong in a way that was silent.

## 28. Capability declarations

Each renderer family publishes its supported element types, canonical variants,
formats, options, validator dialect/extensions, runtime integrations and known
limitations. Registration rank and escape-hatch namespaces belong in that
family's documentation. A native runtime can offer an equivalent grid/editor
without claiming exact compatibility with a named web integration.

The serialized spec and examples do not depend on a selected component library.
Use the chosen UI library's components when it supports the required interaction.
Reuse parsing, paths, state, validation and serialization logic across adapters;
keep component rendering and library-specific props inside their adapters.

## 29. JSON schema artifacts and validation boundary

The common config schema includes the audited core's `readonly`, `readOnly`,
`separateReadonlyFromDisabled` and legacy `trim` settings. Describing a core
setting does not establish renderer support: separate read-only presentation
needs adapter verification, and portable sizing continues to exclude `trim`.
The reference core version and implementation differences are recorded in
[the audit](audit.md).


The schemas in this package use JSON Schema draft-07. Their `$id` values resolve
under the documentation site's `schemas/` path. Register all the schemas by `$id`
for offline validation; no network resolver is required.

| Artifact | Validates |
| --- | --- |
| `jsonforms-uischema.schema.json` | Common UI element profile and shared definitions |
| `jsonforms-extended-uischema.schema.json` | Implemented extended UI vocabulary, recursively through layouts and details |
| `jsonforms-config.schema.json` | Common defaults and shared extension configuration |
| `jsonforms-extended-config.schema.json` | Extended configuration and security blocks |
| `example.schema.json` | Example catalog entry and host requirements |
| `jsonforms-rule.schema.json` | Standalone serialized rules, shared by both UI profiles |

Unknown options and extension namespaces remain open. Known fields retain their
types and constraints. The common UI profile has a closed element vocabulary;
the extended profile accepts unknown types for downstream registries. Acceptance
of an unknown element is not evidence that it will render.

JSON Schema `default` values in these **authoring schemas** are annotations.
Tools must not enable mutation/default assignment while checking an authored UI
schema or config. This is separate from a form validator deliberately applying
defaults to business data under §15.9.

Structural checks cover option shapes, nested UI elements, mutually exclusive
Button action/script fields. Future dynamic descriptors are not defined. They cannot prove
that a Control scope resolves, a named category exists, a CSS length is useful,
an expression is safe to execute, a bound is comparable, or a renderer behaves
correctly. Those require semantic and behavioral conformance tests. Neither a
schema nor an editor grants script permissions.

Example data-schema documents are checked using the standard draft-07 meta-schema
bundled with Ajv. This package does not republish or extend the JSON meta-schema.
Custom keyword shapes and behavior belong to the selected validator integration;
standard meta-schema validation does not check those extensions. Applications
using another dialect must select its corresponding validator and meta-schema.

The test suite validates every example's data-schema document, UI schema, config,
registry UI schemas and catalog metadata. Deliberately malformed authoring cases
are enumerated by exact JSON Pointer in `conformance/expected-invalid.json`;
validation must fail at those locations, and the remaining document must pass.
Runtime diagnostics such as an unknown template language can be structurally
valid and are described in each example's walkthrough. Invalid **data** is not an
invalid example: it is often the subject of the example. This package does not
claim renderer conformance or execute scripts embedded in example documents.

## 30. Host, demo and accessibility contracts

The detailed host and demo acceptance requirements are maintained in
[Renderer and demo guide](renderer-and-demo.md). See the
[documentation coverage map](audit.md) for historical sources.

### 30.1 Host parity and reusable behavior

Framework-native and web-component hosts use the same data/schema semantics,
renderer and cell registries, configuration, locale, validation mode and action
contracts. Switching hosts preserves current data and settings. Web components
install actual component styles in their ShadowRoot and support styled portals,
workers and overlays there. The host's color scheme must follow the selected
mode, including system-mode changes.

Renderers use the underlying UI library's real controls, pickers, dialogs,
menus, tree and split panes when available. A host may adapt a library primitive
for accessibility or the portable behavior; it must preserve the library's
keyboard, focus and theme contracts. Core logic must not require that library.

### 30.2 Demo workspace

A demo exposes the example, live data, schema, UI schema, registered UI schemas,
translations and config. JSON editors have Reload and Apply actions; invalid
JSON leaves the active model intact. Apply updates only the edited property.
Reload restores the example asset in the editor and does not apply it implicitly.

The desktop form/data view starts near 75%/25% and uses resizable panes that can
make either side larger. Keep usable minimum sizes and keyboard resizing where
available. RTL reverses the inline direction; narrow screens can stack panes.
Form-only mode hides demo chrome while retaining data, theme, locale, validation
and configuration. Exiting restores the previous workspace.

Expose light/dark/system, LTR/RTL, locale, readonly, validation mode, restrict
(default true), description visibility and required-marker settings. Distinguish
component-library settings from portable config. Example selection has stable
links and groups related features. Display the current validation error count;
keep schema errors, additional errors and pending analysis distinguishable.

### 30.3 Accessibility and testing

Every interactive element is keyboard reachable with a visible focus indicator.
Icon actions have localized names; tooltips also work on focus and supplement
those names. Dialogs manage focus and restore it to a surviving trigger.
Disclosure, selection, disabled, required and error state are exposed through
appropriate platform semantics. Color alone never carries validity or state.

Light and dark modes cover controls, overlays, editors, validation and icons.
Use logical inline layout in RTL; data and schema paths are unchanged.

Test integration through the complete renderer registry where dispatch can
compete. Cover typed values, restrictions, readonly/hidden behavior, empty versus
absent values, localization, pending edits, external updates and target identity.
Verify scalar controls and table cells through their respective registries.
Test JSON shapes and emitted values rather than snapshots of a library's internal
markup. Build packages, demos and web components separately; test representative
light/dark, RTL, narrow-screen and ShadowRoot behavior where applicable.

## Appendix A. Proposals outside v1 conformance

### A.1 Timezone conversion and selector design

`timezone`, `saveTimezone`, `showTimezoneSelector` and `timezoneChangeMode` remain
proposals. They are not finalized portable options, and permissive schemas must
not be read as promising their implementation. A future profile must settle
source-zone interpretation, fixed-offset syntax and range, daylight-saving gaps
and ambiguities, reference dates for time-only named-zone conversion, selector
versus display/storage precedence, draft cancellation and external replacement.

Display conversion preserves the stored instant; changing an offset while
keeping wall-clock fields changes the represented instant. These are distinct
operations. Date-only values remain calendar dates. Format token `Z` emits an
offset; `[Z]` is a literal and cannot safely label a non-UTC clock as UTC.
Opening, displaying or changing locale must never rewrite incoming values.

### A.2 Capability support versus target requirements

The dynamic overlay proposal still requires design discussion and refinement
before implementation. Structured diagnostics, complete pending-validity
integration and universal container pre-touch filtering remain implementation
work tracked in [TODO.md](todo.md). They are not claims of current support.
A reference implementation may support only part of them. Implementations must
publish limitations rather than treating a schema definition or a worked example
as proof of runtime support. External choice providers have no canonical option
in this version; any relationship to a future overlay resolver still needs design.

### Array panel collapsing

All array presentations (table, expandable items, list with detail, and AG Grid)
support `options.collapsible` and `options.collapsed`, with the same meaning as
Group. Both default to false. UI options override namespaced config, then legacy
flat config. `collapsed` sets the initial state and resynchronizes only when its
effective value changes. Without `collapsible`, the body is always visible.

Collapse hides the array body, preserving mounted editors, data, selection,
sorting and item expansion. The header, validation indicator and actions remain
visible. A keyboard-accessible toggle exposes `aria-expanded` and `aria-controls`.
This is independent of `initCollapsed` and `collapseNewItems`, which affect items.
Changing form data must not reset panel expansion.

### Kitchen-sink integration example

The [job-application kitchen sink](../examples/kitchen-sink/README.md) combines
shared controls, normal tables, AG Grid and detail editors with English/Bulgarian
authoring catalogs. It includes valid and deliberately invalid data fixtures.
Phone validation is an explicit international syntax pattern; it does not prove
reachability. Standard email/date/time format validation must be enabled by the
host. See the example for component coverage and library-locale requirements.


### Direct errors on arrays and objects

Normal tables and AG Grid MUST use the same array feedback semantics. Show
translated errors belonging to the array itself (such as minItems, maxItems,
and uniqueItems) first. Below those messages, show a localized notice that
items contain errors. Show the child-error count only when
`showValidationIndicatorCount` is explicitly enabled through the applicable UI
options or configuration; the default notice has no count. This notice helps
users discover errors hidden by pagination. Do not expand child field messages
into the array header tooltip. Keep navigation to the first invalid item.

Object feedback MUST include only errors belonging to the object itself, without
a child-error notice or count. A required-property error belongs to the missing
property, rather than the containing object, for this purpose. When the object's
resolved detail is a Group, place its direct-error indicator beside the group
title. For a detail without a group header (such as VerticalLayout), place direct
error messages above the fields in the error color. This object feedback is
separate from independently configured validation indicators on other layout
sections. Local field tooltips continue to show their translated validation
messages without a path prefix.

Implementations SHOULD reuse the validation path index and memoize direct-error
formatting. Child summaries need only presence unless counts are requested; they
should not translate or format all descendant errors. Equivalent implementations
with better performance or correctness may be used.


#### Validation in Additional Properties and Additional Items

Errors must be discoverable inside the form, not only in a host's data or demo
panel. Use the established error icon, error color, translated messages and
accessible tooltip behavior. A schema validation error remains part of form
validity; a rejected local operation that preserves valid data remains local
operation feedback as described in the File control section.

**Additional Properties:** show `additionalProperties` rejections beside the
section heading, naming each offending property and displaying its translated
validation message. Match these errors to the owning object's validation path;
do not treat them as errors on an unrelated declared field. Preserve literal
property names, including names containing dots or slashes. Show validation of
an individual property's value on its editor. Removing or validly renaming a
rejected property clears the corresponding feedback after validation. Keep
invalid existing properties visible and correctable without silently deleting
them. An error at the object path, such as `minProperties`, remains object-level
feedback under the rules above.

**Additional Items:** distinguish constraints on the whole tuple from errors in
an individual trailing item. Errors such as `minItems`, `maxItems`, `uniqueItems`,
and a forbidden tail (`additionalItems: false` in the supported positional
schema dialect) belong to the tuple as a whole. Show their actual translated
messages at the tuple boundary; do not arbitrarily assign them to one trailing
item or repeat them on every item. A forbidden-tail message SHOULD also be
available beside the Additional Items heading, where corrective removal is
available. A constraint involving both fixed and trailing positions must retain
its tuple-wide meaning.

Errors on a specific item belong on that item's editor. When Additional Items
is paginated, its heading SHOULD include a localized notice that trailing items
contain errors, including those on other pages. Include a count only when
`showValidationIndicatorCount` is enabled; omit fixed-prefix errors from this
tail notice. Navigation should reveal the first invalid trailing item. Keep
errors for omitted tuple positions discoverable at the tuple boundary.

These are presentation requirements and recommendations, not a requirement to
rescan or format all validation errors on every render. Reuse indexed validation
results, format tooltip details on demand, and preserve validation-mode filtering.
The Additional Items header notice and navigation describe the intended behavior;
host implementations may still need to add them even when tuple-level messages
and item-level validation are already supported.


#### Property-name validation and rename drafts

A `propertyNames` violation MUST be associated with the offending property name,
not its value editor or an unqualified message at the object boundary. For example,
`propertyNames: { "pattern": "^sensor-", "minLength": 9 }` rejects `sensor-x`.
Show an error indicator beside that name, with the translated length constraint
in its tooltip. A name error must not imply that the numeric sensor value is
invalid. When the validator supplies both a specific constraint error and the
wrapper “property name is invalid”, prefer the specific explanation and avoid
repeating the wrapper. Preserve key identity for empty and special-character names.

Add and Rename MUST check the full applicable property-name schema, including
length, pattern, enum, composition, and references supported by the validator.
Checking only a pattern is insufficient. An unchanged existing invalid name
must still display its validation error when the rename dialog opens. A proposed
invalid name must show localized feedback beside the rename input and must not
be silently accepted. Duplicate-name checks must allow retaining the current
name without bypassing its schema constraints. Preserve the original property
and value until a valid rename is committed; cancellation must not mutate data.

Name validation must not depend on whether a host explicitly supplies a validator.
Use the host validator where available, or an equivalent supported validator;
do not silently weaken length or other supported constraints to pattern-only
checks. Keep name errors distinct from `additionalProperties` rejection and from
validation errors in the property's value.


#### Object titles and layout boundaries

A bound object Control represents a data boundary. A VerticalLayout arranging
controls with scopes such as `#/properties/object/properties/field` does not
itself establish an object boundary.

Preserve the resolved detail UI schema: do not replace an explicitly authored or
registered Group with VerticalLayout. Preserve its title, i18n, rules, nested
Groups and layout behavior. Generated nested object details may use Group;
generated root details may use VerticalLayout. Render the object's resolved
title once and respect explicit title suppression.

A bound nested object SHOULD have one visual boundary containing both static
fields and Additional Properties. When its resolved detail is a Group, that
Group supplies the boundary; place the dynamic-property section within it rather
than adding an enclosing object frame. With other detail layouts, the object
renderer may supply the single boundary. Additional Properties inside an object
boundary SHOULD use spacing and a section heading without another enclosing
border. Independently authored nested Groups keep their own boundaries.

For a dynamic-only object, omit the empty static-fields region, but retain the
object boundary and its title when present. An untitled object still represents
a bound object; a plain VerticalLayout remains unframed. Direct object errors
belong beside its title, or above its content when there is no title.

The Object control example compares titled and explicitly untitled objects for
static-only, dynamic-only, and mixed property schemas in separate feature tabs.
This rule supersedes earlier guidance to unwrap outer object Groups.


### Choice cards

A Control with `options.format: "cards"` selects the choice-card renderer (rank
21) when its resolved schema has `enum` or `oneOf`. Without this explicit format,
normal renderer selection applies. Selection MUST NOT depend on current data
validity or availability of images. An enum takes precedence if both occur.

An enum or a oneOf made entirely of const branches selects a value, retaining its
JSON type and using structural equality. Other oneOf schemas select a branch.
`options.choices` optionally customizes entries; omitted entries use generated
value labels or branch titles. An entry identifies exactly one `value` (value
mode) or zero-based `branch` (branch mode), with optional `label`, `i18n`,
`disabled`, `content`, `selectedContent`, and `detail`. Entries MUST identify
existing choices without duplicate identifiers. The i18n prefix resolves
`<prefix>.label`, falling back to label and then the generated label. Without
an explicit entry prefix, use `<control-prefix>.choices.<index>.label`.

Card content permits Label (including supported markup), ImageView, and nested
VerticalLayout/HorizontalLayout elements. Inputs, links, buttons and executable
templates MUST NOT be placed inside cards. Unsupported content falls back to the
choice label. Existing translation, markup sanitization and image URL policies
apply, including host opt-in for image data URLs. A textual label remains visible
and supplies the accessible name even if an image is blocked or cannot load.

The whole card selects its radio. Native or equivalent radio-group keyboard,
focus, disabled, and accessible-name behavior is required. Selection MUST remain
visible independently of image changes, using a distinct selected border. The radio circle is visually hidden by default; `options.showRadio: true`
shows it. Hiding the circle MUST preserve radio semantics, keyboard interaction,
and a visible focus outline on the whole card. `selectedContent` replaces content when selected; if only one is given,
use it for both states. A disabled choice cannot be selected by interaction.

For schema branches, `detail` is the selected branch's editable UI schema, scoped
relative to the controlled value. If omitted, use normal generated/registered
branch detail. Display it below the card group, outside the selectable region.
Preserve the selected branch while its form is incomplete or invalid. Switching
uses the existing oneOf branch-change defaults, enclosing-property preservation,
and confirmation policy; clicking the current card does not discard data.
Validation remains visible at the control and detail fields.

The Choice controls example includes automatic cards, typed const choices,
image cards, translated markup, selected content, disabled choices, and branch
forms with explicit and generated details.

Choice-card borders, backgrounds, focus outlines and error colors MUST follow the
active renderer theme. Branch cards accept `options.confirmation.branchChange:
"never"` to suppress the destructive-switch prompt, using the shared confirmation
policy. This changes prompting only; branch data replacement still occurs.
