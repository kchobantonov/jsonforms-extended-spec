# Design and implementation backlog

Reviewed against current React source and tests on 2026-10-02. Completed
features are not pending proposals; remaining parity work is identified below.

The published JSON schemas describe the implemented authoring vocabulary. A
feature appearing in spec.md does not by itself qualify for a schema definition.
This backlog separates proposals from implementation work. Source issue lists
can be stale; check the current reference code before promoting an item.

- **FUTURE:** discuss and refine the design before implementing it.
- **TODO:** complete or verify implementation and behavior tests before exposing
  the option in the published schemas.

Unknown extension keys remain allowed by the schemas. Such acceptance does not
validate the feature's shape or claim it is supported. We do not publish a second
schema containing speculative options.

## FUTURE — dynamic UI-element overlays

`$dynamic` is not implemented and its design is not final. Section 11 and all
other overlay examples in spec.md are retained design notes, not current API
contracts. The proposed `bind`/`template` descriptors and their conformance
vectors have been removed from the published schemas and current test vectors.

Before implementation, resolve:

- The use cases and boundary between overlays, rules, interpolation, host context
  and any future remote choice provider.
- Descriptor shape, path/expression syntax, supported namespaces and the
  distinction between missing, null, false, zero and empty values.
- Which fields may change, especially options that influence renderer selection.
- Trust boundaries, own-property access, prototype protection, permitted context
  values, URL substitution and permissions.
- Resolution timing across nested, generated and detail UI schemas; stable
  identity, async replacement policy, focus and local-state preservation.
- Diagnostics, fallback behavior, and migration/versioning of the eventual API.

Then implement the resolver and integration tests before adding schema shapes.

**Existing feature to preserve:** Label interpolation already uses
`jsonformsExtended.dynamicValues.enabled` to expose data/item/config/context.
That setting controls interpolation; it does not enable an overlay resolver. Its current
configuration schema remains, with a description limited to interpolation.

## FUTURE — other designs

| Feature | Work needed | Published schemas |
| --- | --- | --- |
| Timezone conversion and selectors | Settle source/display/save zone semantics, daylight-saving ambiguity, time-only reference dates and draft lifecycle, then implement. | No `timezone`, `saveTimezone`, `showTimezoneSelector` or `timezoneChangeMode` definitions. |
| Layout `start` and `responsive` hints | Define placement, breakpoints, precedence and interaction with span/wrap/splitters, then implement. | Removed reserved definitions from child sizing. |
| Remote choice providers | Define acquisition, cancellation, refresh, typed values and permissions separately from overlays. | No provider vocabulary. |
| Markdown images and raw HTML | Decide whether these capabilities are wanted and define separate security profiles before implementation. | No enabling options; both supported Markdown profiles exclude these features. |

## Proposed authoring features awaiting design or implementation

Composite-dialog removal settings,
a separate clear-button option, pending-analysis/submit policy, touch-aware
container summaries, and structured diagnostics require a settled contract and
behavioral evidence before their authoring shapes are promoted. Their absence
from the published schemas is intentional; permissive extension keys do not
promise support.

Implementation-specific findings are tracked in the
[React renderer TODO](https://github.com/kchobantonov/jsonforms-react-renderers/blob/master/docs/TODO.md)
and [React renderer gaps](https://github.com/kchobantonov/jsonforms-react-renderers/blob/master/docs/jsonforms-react-antd-implementation-gaps.md).
Those findings are not requirements to reproduce a particular adapter's behavior.

## Promotion checklist

1. Settle the design and update the single specification.
2. Implement the feature in the reference renderer or shared core.
3. Add behavioral tests, including unsupported and invalid-input cases.
4. Add only the implemented authoring shape to the schemas, with positive and
   negative schema vectors and a worked example.
5. Remove or narrow the corresponding backlog entry in the same change.

## Collection presentation implementation tracking

Antd and shadcn have pagination, row-detail and collection examples with runtime
regression tests. Remaining work is interaction/accessibility coverage, browser
layout checks and parity in other renderer families. Do not treat those open
checks as absence of the implemented features.

## Renderer/schema/authoring audit (React, 2026-09-29)

This is a targeted source audit, not proof of complete option parity.
- OTP: implemented by Antd PasswordOtpControl/AntdOtp; documented in §18.24.
  Extended JSON schema already accepts it through open string variant. Added
  discoverable variant examples and TypeScript string variant support.
  Shadcn now supports segmented OTP, masked password fallback, reveal and clear,
  including partial input and paste. This closes the OTP gap, not all renderer parity gaps.
- TypeScript OptionsFor is explicitly a curated subset, not generated from JSON
  schemas. Array variants tuple/chips/multi-select were missing and are now typed.
  Applicability involving enum choices, bounds or format still needs runtime checks.
- Shadcn RadioGroupControl used orientation instead of the canonical vertical option;
  React fix accompanies this audit.
- Shadcn multiLine is a compatibility alias for multi, and array labelRef is a
  family fallback; do not publish them as new portable names.
- Shadcn FileControlRenderer reads accept as a fallback for schema contentMediaType.
  Decide whether this remains family-specific before declaring a portable option.
- Split/layout options need a separate element-aware parity review. Properties
  such as action/params belong to Button schemas; array map/filter calls are not
  UI options. A raw text scan cannot establish conformance.
- Collection pagination and rowDetail have runtime implementations and tests in
  Antd and shadcn. The earlier pending-runtime assessment is superseded; remaining
  work is coverage and renderer-family parity.
- Add systematic per-capability vectors linking tester selection, option
  declarations, authoring acceptance, and renderer behavior. Open schemas accepting
  an option must never be interpreted as evidence that a renderer implements it.

## TODO — remaining Draft-07 visual behavior

Conditional object field discovery is implemented for the documented opt-in
slice; broader composition coverage remains open. Track executable work in the
[React renderer TODO](https://github.com/kchobantonov/jsonforms-react-renderers/blob/master/docs/TODO.md#draft-07-visual-support-follow-up).

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

## Completed since the migration audit

Mixed type-specific details, shared editor detail modes, conditional object field
discovery and Template/Slot examples now have documented authoring contracts and
regression coverage. Their implemented slices are in the published schemas.
Remaining conditional-composition and named-template diagnostic/cycle gaps stay
in the React backlog. The drag-and-drop editor itself remains future work.
