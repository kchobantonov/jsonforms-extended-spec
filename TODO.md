# Design and implementation backlog

The published JSON schemas describe the implemented authoring vocabulary. A
feature appearing in SPEC.md does not by itself qualify for a schema definition.
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
other overlay examples in SPEC.md are retained design notes, not current API
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
That setting is implemented in `util/interpolate.ts` and consumed by
`MarkupLabelRenderer.tsx`; it does not enable an overlay resolver. Its current
configuration schema remains, with a description limited to interpolation.

## FUTURE — other designs

| Feature | Work needed | Published schemas |
| --- | --- | --- |
| Timezone conversion and selectors | Settle source/display/save zone semantics, daylight-saving ambiguity, time-only reference dates and draft lifecycle, then implement. | No `timezone`, `saveTimezone`, `showTimezoneSelector` or `timezoneChangeMode` definitions. |
| Layout `start` and `responsive` hints | Define placement, breakpoints, precedence and interaction with span/wrap/splitters, then implement. | Removed reserved definitions from child sizing. |
| Remote choice providers | Define acquisition, cancellation, refresh, typed values and permissions separately from overlays. | No provider vocabulary. |
| Markdown images and raw HTML | Decide whether these capabilities are wanted and define separate security profiles before implementation. | No enabling options; both supported Markdown profiles exclude these features. |

## TODO — implementation and support verification

| Feature | Remaining work | Published schemas |
| --- | --- | --- |
| Mixed-control `<type>-detail` options | Implement lookup and dispatch for each supported type; test nested paths and registry precedence. The current mixed renderer does not consume these keys. | Removed seven type-specific detail definitions. Ordinary `detail` remains supported. |
| Composite dialog Remove action | Implement `showRemoveButton` and `removeLabel`, including ownership, confirmation and mutation guards, or formally retire this proposed footer action. A cell's existing remove action is a separate feature. | Removed both option definitions from UI/cell/global configuration. |
| `showClearButton` | Resolve whether a separate option is needed alongside `clearable`, and implement a consumer before exposing it. | Removed the unused global definition. |
| Separate read-only and disabled presentation | Core provides the setting, but the reference adapter does not consistently consume separate read-only state. Verify mutation guards and presentation throughout controls/cells before advertising the opt-in. | `separateReadonlyFromDisabled` is typed as an existing core setting, with an explicit adapter-support caveat. It is not a promise of renderer support. |
| Config resolution and compound defaults | Align namespace consumption, temporal versus flat restrict resolution, and compound-value merging across adapters. Base lodash merges arrays by index; Monaco/grid replace local option bags wholesale. | Only traced config locations are declared. Unsupported namespaced defaults, global structural control options and layoutDefaults.minItemWidth were removed. See the complete configuration review in AUDIT.md. |
| Interpolation/markup beyond Label | Integrate the text pipeline into other text-bearing elements and test translation ordering. | Shared option shapes do not promise support on every element. |
| Pending validation and submit integration | Finish a consistent pending-analysis contract, stale-result handling and host submit policy. Preserve the implemented owner-based additional-error store. | No speculative pending-state configuration. |
| File additional-error publication | Verify/publish local read and conversion failures through the existing owner-based error integration; test cleanup and valid committed data. | Duration and registered cron validation use the schema validator; invalid duration drafts retain local feedback and pending-edit validity without additional-error publication. |
| Container pre-touch summaries | Define and implement touch-aware descendant summaries consistently across container families. | Existing indicator/filter options describe their implemented uses, not universal coverage. |
| Structured diagnostics | Implement consistent stable codes and reporting across all required paths. | A diagnostic requirement in prose is not proof of a runtime emitter. |

The implementation audit uses the Ant Design adapter plus its shared renderer
logic and installed JSON Forms core. Relevant evidence includes
`jsonforms-react-renderer-common/src/layoutSizing.ts`,
`jsonforms-react-antd-renderers/src/complex/MixedRenderer.tsx`,
`jsonforms-react-antd-renderers/src/cells/CompositeDetailDialog.tsx`,
`jsonforms-react-extended-renderers/src/util/interpolate.ts`, and
`jsonforms-react-extended-renderers/src/util/additionalErrors.tsx`.
The portable feature descriptions remain independent of component-library APIs.

## Promotion checklist

1. Settle the design and update the single specification.
2. Implement the feature in the reference renderer or shared core.
3. Add behavioral tests, including unsupported and invalid-input cases.
4. Add only the implemented authoring shape to the schemas, with positive and
   negative schema vectors and a worked example.
5. Remove or narrow the corresponding backlog entry in the same change.
