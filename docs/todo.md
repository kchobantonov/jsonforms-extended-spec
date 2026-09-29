# Design and implementation backlog

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

Mixed-control type-specific detail options, composite-dialog removal settings,
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
