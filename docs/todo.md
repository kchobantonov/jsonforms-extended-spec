# Design and implementation backlog

The published JSON schemas describe the authoring vocabulary. A
feature appearing in spec.md does not by itself qualify for a schema definition.
This backlog separates proposals from implementation work. Renderer projects
record their own coverage and implementation issues.

- **FUTURE:** discuss and refine the design before implementing it.
- **TODO:** complete or verify implementation and behavior tests before exposing
  the option in the published schemas.

Unknown extension keys remain allowed by the schemas. Such acceptance does not
validate the feature's shape or claim it is supported. We do not publish a second
schema containing speculative options.

## TODO — portable input adornment verification

The serialized `startAdornment` / `endAdornment` contract is specified in
[§18.3a](spec.md#183a-input-adornments), with a tabbed
[example](../examples/input-adornments/README.md). Complete the fixture's visual
interaction checklist across families, locales, narrow widths, and writing
directions. Add explicit
unsupported-variant diagnostics where a renderer cannot provide a coherent
input boundary. The authoring and behavior vectors alone are not evidence of
those remaining adapter checks.

<a id="future--dynamic-ui-element-overlays"></a>

## EXPERIMENTAL — dynamic UI-element overlays

`$dynamic` is an experimental profile, not a static v1 conformance requirement.
The common/extended static schemas and canonical conformance vectors remain
separate from the experimental descriptor schema and adapter tests.

### Experimental profile

- Element-shaped patches and ordered rules, restricted `bind`/`template` paths,
  CEL expressions and explicitly opted-in trusted functions.
- Authored object patches versus complete descriptor values; fallback, JSON
  safety, own-property access and prototype protection.
- Config-only `jsonformsExtended.dynamic.enabled` activation and host-owned `external`, also exposed
  to templates as `context.external`; immutable
  environment snapshots and reevaluation when input namespaces change.
- Resolution before renderer/cell selection, parent-consumed metadata, and
  nested/detail occurrences.
- Group `cover`, `header`, and `footer` children resolve through dynamic
  dispatch. Verify region updates, the effective header Label's accessible
  name, and preservation of the mounted body editor.
- Immediate draft discard on editor replacement, scope-change editing sessions,
  and adapter-specific focus handoff and cancellation. Verify coverage for every
  claimed editor boundary.
- The experimental `jsonforms-dynamic-uischema.schema.json`, TypeScript authoring
  helpers, and the combined [playground](../examples/dynamic-playground/README.md),
  including its External editor and static host-derived alternative.

The normative experimental behavior and limitations are in
[spec §11](spec.md#11-dynamic-values-and-path-grammar). Adapter resolver, lifecycle
and demo tests are evidence only for the scenarios they execute.

### Remaining decisions and verification

- Additional namespace-permission policies across adapters. Activation is settled:
  `jsonformsExtended.dynamic.enabled`; the Label interpolation gate is independent.
- Broader CEL function coverage and consistent evaluation-cost limits across engines.
- Additional environment exposure beyond current core validation `errors`.
  Host/editor errors and a separate mutable `state` API are not part of this profile.
- A universal focus/cancellation protocol and a recorded coverage matrix for
  renderer families, internal editor changes, nested/generated/registered details,
  cells, templates, web components and additional adapters.
- API versioning and the evidence required before promotion into portable
  conformance or the published common/extended static schemas.

Remote choice providers remain a separate design; overlays do not introduce
network acquisition, refresh or cancellation vocabulary for choices.

**Existing feature to preserve:** Label interpolation uses
`jsonformsExtended.dynamicValues.enabled` and its namespace gates. It is separate
from the overlay resolver and does not grant CEL or trusted-function activation.

## FUTURE — other designs

| Feature | Work needed | Published schemas |
| --- | --- | --- |
| Timezone conversion and selectors | Settle source/display/save zone semantics, daylight-saving ambiguity, time-only reference dates and draft lifecycle, then implement. | No `timezone`, `saveTimezone`, `showTimezoneSelector` or `timezoneChangeMode` definitions. |
| Layout `start` and `responsive` hints | Define placement, breakpoints, precedence and interaction with span/wrap/splitters, then implement. | Removed reserved definitions from child sizing. |
| Remote choice providers | Define acquisition, cancellation, refresh, typed values and permissions separately from overlays; see the [external resources design](external-resources-proposal.md). | No provider vocabulary. |
| Markdown images and raw HTML | Decide whether these capabilities are wanted and define separate security profiles before implementation. | No enabling options; both supported Markdown profiles exclude these features. |

## Proposed authoring features awaiting design or implementation

Composite-dialog removal settings,
a separate clear-button option, pending-analysis/submit policy, touch-aware
container summaries, and structured diagnostics require a settled contract and
behavioral evidence before their authoring shapes are promoted. Their absence
from the published schemas is intentional; permissive extension keys do not
promise support.

Implementation-specific findings belong in each renderer project.

## Promotion checklist

1. Settle the design and update the single specification.
2. Implement the feature in an adapter or shared core.
3. Add behavioral tests, including unsupported and invalid-input cases.
4. Add only the implemented authoring shape to the schemas, with positive and
   negative schema vectors and a worked example.
5. Remove or narrow the corresponding backlog entry in the same change.

## Authoring and renderer evidence

TypeScript `OptionsFor` is a curated subset, not generated from JSON schemas.
Applicability involving enum choices, bounds or format still needs runtime checks.
Add per-capability vectors linking tester selection, option declarations,
authoring acceptance, and renderer behavior. Open schemas accepting an option
must never be interpreted as evidence that a renderer implements it.

## TODO — remaining Draft-07 visual behavior

Broader conditional composition coverage remains open. Each renderer project
tracks its own executable work.

- Extend conditional discovery and authored placement across anyOf/oneOf,
  referenced branches and named templates, with reference-scope regressions.
- Add contains matching-item feedback and explanations of not failures. Do not
  infer editable fields from a negated schema.
- Implement boolean false presentation with absence as the quiet default:
  hide absent optional forbidden fields and exclude them from add choices.
  Existing forbidden data must have visible feedback and an allowed removal
  path, without automatic deletion. Root false and required false properties
  need an impossibility explanation, since deleting data cannot make them valid.
  In a graphical schema editor, prohibitions remain visible to the author.
- Settle explicit default/example actions and writeOnly summary/preview policy.
- Broaden reference-scope coverage and assess useful format/content editors.

## FUTURE — graphical authoring for Draft-07 constraints

Provide constraint panels and reference selection, preserve unsupported keywords
on round trips, and keep inactive-branch preview state separate from runtime data.
Drag/drop must preserve field bindings and unknown options. These editor features
are planned work, not implemented capabilities or new published option shapes.
See [conditional authoring guidance](conditional-fields.md).

## Completed authoring work

Mixed type-specific details, shared editor detail modes, conditional object field
discovery and Template/Slot examples now have documented authoring contracts and
regression coverage. Their implemented slices are in the published schemas.
Remaining conditional-composition and named-template diagnostic/cycle gaps belong
in renderer backlogs. The drag-and-drop editor itself remains future work.
