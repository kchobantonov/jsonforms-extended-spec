# Web and TypeScript implementation notes

Companion to the [portable guide](implementation-guide.md). These are platform techniques, not required architecture for other languages.

## AG Grid and other data grids

A visual cell renderer does not automatically define a filter value. Supply a value getter or appropriate filter-value hook derived from the authored summary. Resolve Label i18n and interpolation under the same policy as display, then use plain text for Markdown. For Control summaries resolve the bound display value, rather than passing the whole object. Preserve native column overrides according to documented precedence.

Keep row binding separate from visual summary text: editing Boston must update the contact city, not replace the contact object with “Boston”. Sorting/filtering must retain the underlying row identity for editing and deletion.

Cache resolved summaries with invalidation for data, row, locale, config and summary changes. Bound cache growth. Keep cell renderer identity stable so updates do not remount focused editors. Verify stale closures as well as excessive recomputation.

## JavaScript value and path semantics

Object.is and strict equality do not compare parsed JSON objects by content. Use JSON-value structural equality for choice selection; stringify is not sufficient if object key order varies. Do not conflate 0, false, empty string, null and undefined. JSON has a number type; explicit Integer/Number editor intent needs separate state.

Do not pass literal JSON property names blindly into dotted path utilities. Encode JSON Pointer segments correctly and respect the form library's own data-path conventions. Kotlin or another language needs equivalent semantics, not the same string utilities.

## UI component integration

Use the library's native invalid state and accessible feedback APIs. Checkbox/switch feedback often needs explicit placement. Toggling an input suffix or feedback wrapper can remount the input and lose focus. Keep DOM structure stable through validation transitions and test typing rather than only snapshots.

For flex/grid layouts check min-width: 0, minmax(0, 1fr), and explicit overflow containment where appropriate. Horizontal overflow settings can affect the other axis; verify tab bars in a real browser. Keyboard focus indicators must remain visible after clipping changes.

## Validation lifecycle

A memoized compiler is not free validation. Reuse a validator only under a compatible schema/validator identity; data edits can still invoke it. Validate active branches only and bypass compilation when validateActiveBranch is false. Nested branch feedback should not leak into host document validity. Reference compilation may require root context; do not advertise unsupported refs merely because errors are caught.

Keep local validation results immutable and avoid mutating shared validator error arrays. Verify validation modes, translated overrides, duplicate messages and cleanup. Benchmark representative scalar, large-object and nested cases before claiming negligible overhead.

## Porting to other platforms

Map logical placements to native components: field error below the editor, cell feedback associated with its cell, object errors at the object boundary. Document unavailable platform capabilities and the alternative experience. Browser-specific choices such as an AG Grid valueGetter, CSS overflow or React context are implementation details; their observable behavior is what a port must preserve.

## Example provenance

This is a job-application example, inspired by the Svelte demo's
`packages/jsonforms-svelte-demo-common/src/lib/examples/job` schema, UI schemas,
translations and host actions. Its applicant/job-preference/experience/reference/
résumé/declaration workflow is the basis for further expansion. This is an adaptation,
not a direct port: Svelte app-store actions and dynamic defaults are not copied.
