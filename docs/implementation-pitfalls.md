# Renderer implementation pitfalls

Companion to the [implementation guide](implementation-guide.md). These entries describe portable behavior and acceptance checks, not instructions to reproduce a particular codebase. Consult [spec.md](spec.md) for option definitions and [renderer-and-demo.md](renderer-and-demo.md) for detailed presentation requirements.

## P01 — Values are compared by JSON content

**Trap:** Compare enum/const object or array choices by runtime reference identity, or serialize every choice into the stored value.

**Behavior:** Reloaded structurally equal values remain selected; choosing them preserves their JSON types. Object member order is immaterial; array order matters. Missing, null, false, zero and empty string remain distinct.

**UI-library adaptation:** If a native select/radio accepts only scalar values, use unique internal option IDs and map them back to the original JSON values on selection. Do not use stringified objects as React keys: different objects become `[object Object]`. Internal IDs must not enter form data; translated labels must not determine identity.

**Check:** Parse data separately from the schema and reload it. Object/array dropdowns, radios, cards and cells retain selection. See [choice controls](../examples/choice-controls/README.md).

## P02 — Property keys are literal data

**Trap:** Interpret dots, slashes, brackets or an empty key as navigation syntax; trim imported names.

**Behavior:** Address exact keys with the platform's correct path encoding. Separate display labels from binding paths. Renaming/deleting affects only the intended key and preserves values.

**Check:** Edit `legacy.key`, `notes/1`, `items[0]`, `""` and whitespace-bearing keys independently. See [additional properties](../examples/additional-properties/README.md).

## P03 — Pattern constraints intersect

**Trap:** Use the first matching patternProperties schema, or treat patterns as alternatives.

**Behavior:** Every applicable pattern constrains the property. Declared properties can also match patterns. Additional-properties applicability is not a first-match fallback.

**Check:** Two matching patterns contribute different object fields; expose both and validate both. See [Draft-07 audit](draft-07-visual-support.md).

## P04 — Selecting a type does not discard composition

**Trap:** Delete allOf/anyOf/oneOf to avoid redispatch, or infer a type from minimum/maxLength alone.

**Behavior:** Preserve the conjunction with the selected type. Exclude alternatives only when incompatibility is established. An impossible allOf branch stays a contradiction. Do not deduplicate oneOf alternatives or confuse an incomplete value with an impossible editing branch. Number and integer overlap; child schemas have independent types.

**Check:** String/integer alternatives expose the matching editor; untyped alternatives and overlapping oneOf still validate correctly. Test termination separately. Reference/conditional support must be declared honestly. See [mixed control](../examples/mixed-control/README.md).

## P05 — Numeric editor intent is not encoded in JSON

**Trap:** Recompute Integer selection from every whole-number value, undoing the user's Number selection; reset or round data when switching numeric editors.

**Behavior:** Preserve explicit numeric editor intent during editing. Integer selected for 2.5 produces a local error without rounding existing data; Number selected for 2 remains selected. A fresh mount may infer again because JSON stores no editor choice.

**Check:** Switch 2 to Number, enter 2.5, switch to Integer, then correct it. Verify both form and cell editing paths. See [mixed control](../examples/mixed-control/README.md).

## P06 — Document validity and displayed-branch feedback differ

**Trap:** Assume absence of document errors proves that the displayed branch is valid, or publish local branch errors as document errors.

**Behavior:** validateActiveBranch defaults true; the control option overrides global config. Local feedback explains why a displayed branch rejects data even when another branch accepts it. False skips extra compilation and validation while retaining document validation. Only active branches do this work; respect validation visibility.

**Check:** A long string is document-valid via Long text while Short text is displayed. Compare enabled/disabled feedback and verify unchanged host validity. Check compilation reuse and nested validation cost. See [mixed control](../examples/mixed-control/README.md).

## P07 — Enclosing fields are not a second scalar editor

**Trap:** Generate a whole-value editor after removing a composition keyword, producing an unrestricted duplicate scalar input; omit enclosing object fields entirely.

**Behavior:** Preserve enclosing object fields alongside branch fields. A scalar branch has one value editor. A single applicable branch renders without redundant tabs/selectors; that presentation does not rewrite oneOf semantics.

**Check:** Test enclosing plus branch object fields, scalar oneOf with and without explicit type, and a single narrowed branch.

## P08 — Errors belong to their data location

**Trap:** Show only a table-level descendant notice; use raw data as truthiness to decide validity; assume checkboxes and switches display an input library's feedback automatically.

**Behavior:** The invalid cell/control carries local feedback. Containers retain direct errors and a separate localized descendant notice. A notice such as “Some items contain errors” is renderer-generated, not an AJV keyword error. Respect hidden validation and count opt-ins.

**Check:** The second row's boolean value is the string `"false"`. Mark that cell as well as the table summary. Correcting it removes both applicable indicators. Check direct array contains errors independently from row errors.

## P09 — Error translations have defined precedence

**Trap:** Let a generic validator locale overwrite authored field/keyword translations, or invent a conflicting translation lookup scheme.

**Behavior:** Follow the spec's i18n prefixes and error lookup order, preserving localized validator messages as fallback. Document the namespace so applications know which keys are reserved. Do not translate stored data.

**Check:** Override a reviewers contains message with a lead-reviewer explanation, switch locale, and check both local and container feedback.

## P10 — Object and collection boundaries convey ownership

**Trap:** Remove an object Group because it lacks a title, render an empty static-fields frame, or stack object and additional-properties borders without purpose.

**Behavior:** Preserve resolved grouping and title/i18n behavior. Keep dynamic content within its object boundary. A VerticalLayout explicitly binding child properties is a distinct authoring choice.

**Check:** Titled/untitled objects with static-only, dynamic-only and mixed fields. Confirm label and action ownership, and pagination inside the collection. See [additional properties](../examples/additional-properties/README.md).

## P11 — Summaries are part of table behavior

**Trap:** Filter raw objects or Markdown source while displaying a readable summary; use a different interpolation context for search.

**Behavior:** Label summaries resolve translations, permitted interpolation and markup to searchable plain text. Control summaries expose their bound displayed value. Keep row context distinct from form-root context and preserve access gates. Sorting/filtering must not mutate data.

**Check:** A Contact summary displays Boston and matches a Boston filter. Formatting syntax does not pollute search. Repeat after row edits and locale changes. See [web notes](implementation-web-typescript.md).

## P12 — Editing must preserve focus and identity

**Trap:** Recreate cell renderer components or change an input's wrapper structure on each keystroke/error transition.

**Behavior:** Keep the edited control mounted where practical; preserve caret, focus and selection while values and errors update. Stable identity must not freeze stale summaries or callbacks.

**Check:** Type several characters while validation changes and filtering is enabled. No dropped characters, focus jumps or stale values. Keyboard focus remains visible; pointer selection does not require an extra persistent focus ring.

## P13 — Array positions and missing values need care

**Trap:** Clear an array item by assigning undefined, confuse null with absence, or treat tuple positions as freely reorderable homogeneous items.

**Behavior:** Follow collection removal and tuple rules. Preserve meaningful positions and distinguish missing values from explicit null. Sorting/filtering should not change the underlying indices used by edit/delete actions.

**Check:** Edit/delete an item under sorting and pagination; test tuple tails and mixed items. Do not create sparse arrays accidentally.

## P14 — Confirmation depends on actual discarded data

**Trap:** Prompt on every scalar discriminator change, ignore configured policy, or replace useful branch data without the required prompt.

**Behavior:** Follow operation-specific policies. Under complex confirmation, a supported discriminator-only transition is not meaningful discarded content; additional user data can be. Always/never remain explicit overrides.

**Check:** Switch with only a discriminator, then with populated branch fields, under all policies. See [choice controls](../examples/choice-controls/README.md).

## P15 — Options and disabled states must survive delegation

**Trap:** Merge defaults over explicit false, lose read-only state in a detail dialog, or apply global settings after local overrides.

**Behavior:** Preserve documented option precedence and distinguish absent options from false/zero. Carry permission, validation, i18n and root-data context through cell/detail/branch dispatch.

**Check:** Global true/local false and global false/local true, including branch feedback, cell markers and confirmation. Disabled controls cannot mutate data through hidden actions.

## P16 — Theme, overflow and accessibility are behavior

**Trap:** Hard-code text colors, rely on native tabs for an overflow menu they do not provide, or let tab labels dictate a split pane's minimum width.

**Behavior:** Use semantic theme tokens, readable selected/disabled/error states and visible keyboard focus. Keep navigation reachable at narrow widths without expanding the document. A scroll strip or accessible overflow menu can satisfy the same need.

**Check:** Light/dark themes, narrow form pane, many tabs, keyboard-only navigation and long translated labels. Avoid unnecessary vertical scrolling in horizontal tab bars.

## P17 — Rich choices and summaries retain security boundaries

**Trap:** Treat custom markup/images as trusted because they occur inside a choice card, or enable broader expression/data access during filtering.

**Behavior:** Reuse markup and URL policies, including configured data-image support. Custom presentation does not remove accessible selection state or permit competing nested interactive controls. Preserve the same access restrictions for rendering and summary evaluation.

**Check:** Unsafe image URLs remain rejected in cards as in image controls; escaped interpolated data remains text. Selection is operable and announced without a visible radio circle.

## P18 — Native lifecycle and packaging matter

**Trap:** Assume mounting proves a usable port, duplicate context identities across package/source imports, or leave callbacks active after unmount.

**Behavior:** Verify host updates, translated settings, reconnect/unmount behavior and published-package consumption. Treat lifecycle implementation as platform-specific, while preserving data and interaction behavior.

**Check:** Mount, update schema/data/locale, disconnect and reconnect. Use the packaged implementation as well as source tests. Test nullable and recursive data without automatically materializing infinite children.

## Portable acceptance vectors

The `port-*` entries in [behavior.json](../conformance/behavior.json) cover representative cases from this guide. They require renderer-specific adapters; passing the specification package checks alone does not execute these UI scenarios.


## P19. Recursive branch selection and finite creation

**Distinction:** Reusing a schema at a child data path is legitimate recursion. Expanding all references or recursively creating defaults before the user chooses a branch can fail to terminate. Compiling an extracted branch without its root definitions can also make a populated folder look like a file.

**Expected behavior:** Use a distinct required discriminator as an editing hint when available, retain original document validation, create one requested node at a time, and preserve siblings. Do not interpret an invalid descendant as a reason to switch its parent branch. An object-to-object branch change must still initialize the selected branch under the usual confirmation policy.

**Check:** Use [recursive-tree](../examples/recursive-tree/README.md): load a folder containing another folder and files; load an invalid file inside a folder; add a single child to an empty folder; choose its branch, edit it and delete it. Separately test schema-only reference cycles and non-terminating required recursion. The example is local-reference coverage, not external resolver certification.

## Dialog movement uses measured geometry

Bound dragging against the dialog's measured rectangle and the viewport, not a
fixed fraction of screen width or height. Allow negative offsets from its initial
position so its top and left edges can reach the viewport origin. Recompute bounds
at the start of each drag after user resizing. Keep the header and window actions
reachable. Verify row and cell dialogs at all four edges, including after resizing;
UI-library centering and transforms must be included in the measured position.

## File search uses names, not payloads

Default grid search values for file cells are decoded filenames, including every filename in a multiple-file cell. Never use the raw data URL or base64 content as the search value. Nameless encodings contribute no filename text. Keep stored values unchanged and preserve explicit host grid overrides. Test both column filtering and quick filtering against filename-only and payload-only queries.

## Dialog height includes its viewport offset

A viewport-relative maximum height must also account for the dialog’s initial top offset and bottom margin. A dialog limited to viewport height minus 32px cannot start 100px down. Keep the header and footer outside the shrinking, scrolling body so users can reach actions without scrolling the modal overlay or page. Apply form-wide dialog defaults before per-dialog overrides, including explicit false.

## Portable layout spacing defaults

Absent layout/config spacing resolves to 16 CSS pixels for rows and columns, with wrap false and gridColumns 16. JSON Schema default annotations do not insert values by themselves; implement the fallback at runtime. Remove native outer field margins within managed layouts rather than adding them to the gap. Test adjacent fields, adjacent collections, mixed children, nested layouts and explicit zero. A family-specific preference does not justify a different fallback.


## Expansion settings belong to the presentation boundary

Group and mixed outer frames share collapsed/collapsible settings; accordion categories share collapsed while permitting all panels to close. Array-item initialization and tree-node expansion remain independent. Test local false overriding global true, reopening by the user, unrelated data updates, and a later configuration change.


## Required fields in table columns

A table header replaces the repeated cell label, so it must carry the required marker for its bound item property. Resolve hideRequiredAsterisk at cell, collection and global levels without changing validation. Test a required and optional column together, then toggle the setting after mount. A required collection does not make all its columns required.


## Discriminator branch layouts

When a branch selector already sets a const-valued discriminator, an authored branch UI schema can omit its redundant one-option field. Label the selector with the discriminator's user-facing name, retain the discriminator in data and validation, and apply the branch layouts recursively through the UI schema registry. Do not globally hide every const field: explicit branch layouts express author intent.

## Clearing externally loaded branch data

A remembered oneOf selection must not leave a phantom branch editor after the bound node is removed by external data replacement. Clear the selector and branch fields for a missing node, or an empty object matching no branch. Do not erase legitimate scalar values or invalid nonempty data merely because validation fails. Test replacement after a branch was previously displayed, as well as a fresh empty mount.

## Equivalent composition feedback

Document validation may report the same missing property through multiple alternatives, and local active-branch validation may report it again. Present equivalent errors once: compare instance path, keyword, parameters and message, rather than schema location alone. Preserve different constraint parameters, messages and targets. Deduplication of displayed branch feedback must not alter document validation or its emitted errors.

## Unselected object branches in array slots

Adding an object-choice node must follow its enclosing default, not implicitly choose the first branch when the authored flow requires a choice. The tree examples declare default: {} on node unions, with whole-object defaults on File/Folder branches. Per-property discriminator defaults can mutate an empty node during AJV branch probing.

Clearing an object-only oneOf array item retains {} and its index. Writing undefined would serialize to null. Clearing an optional object property can remove it. Do not apply object placeholders to scalar or nullable unions; distinguish actual array parents from numeric object-property names.

## Required discriminator feedback on the selector

When branch layouts omit a discriminator field, its required error must still be visible on the branch selector, with native invalid styling, accessible invalid state and translated guidance. A container indicator alone does not identify what the user must choose. Match the missing property at the exact node path; sibling and descendant failures must not mark the wrong selector. Respect the configured validation visibility.

## Validation indicators on collapsed array items

When container indicators are enabled, each array item header must indicate errors at its own data path and in its descendants, even while collapsed. An indicator on the outer collection alone does not identify which item to open. Respect local indicator overrides and validation visibility; valid sibling items must remain unmarked.

## Scoped JSON drafts in mixed controls

Code editors validate a section while local references still belong to the document schema. Assign each editor a unique model and schema registration; preserve registrations owned by other editors. Keep malformed text across blur and contribute an owner-scoped additional error instead of overwriting stored data. Gate Apply/submit on these errors so an older parsed value cannot silently replace the visible draft. Schema diagnostics should remain Monaco markers and ordinary AJV errors, not duplicate additional errors.

## Nested array selection and composed table cells

The presence of item properties does not make an array suitable for a table by default. Apply nested-array detection before selecting the default table presentation; explicit table options can still opt in. Such tables need a composite detail cell for anyOf, oneOf and allOf values as well as object, array and mixed types. Keep specialized enum and scalar cells ahead of the composite fallback.

Executable renderer regressions cover Draft-07 allOf/anyOf/oneOf default panels and an explicit table with a string-or-array anyOf column in Antd and shadcn.


## Domain trees versus JSON structure trees

Project recursive child collections onto named nodes; do not introduce a tree
entry for each scalar field or the intermediate children array. Carry the original
node schema, root references, absolute data path, permissions and validation into
the detail renderer. Never expand a recursive schema to construct navigation:
walk the finite data instead. Reuse native collection actions so defaults and
confirmation behavior are preserved. Array deletion/reordering must update node
selection without silently editing a sibling at a reused index.

## An unrestricted schema is not an omitted schema

An explicit `{}` accepts every JSON value; an omitted schema allows a host such as JSON Forms React to infer one from data. Preserve missing initial data as absence, not null. When switching the demo to an omitted schema, remove its previous Monaco schema registration without removing registrations belonging to other editors. Inferred constraints describe the sample and are not an authored business schema.

The current JSON Forms core generator expects an object root. A demo adapter can infer a wrapped property (`Generate.jsonSchema({ value: data }).properties.value`) to support root arrays, scalars and null, and use an unrestricted runtime schema while data is absent. Do not store that runtime fallback as the authored schema; recompute inference when data changes.


### Temporary inference workaround — upstream #2478

Track [JSON Forms PR #2478](https://github.com/eclipsesource/jsonforms/pull/2478),
which includes non-object root inference and regeneration when data changes.
The React demo adapter (`demoSchema.ts`, called from `App.tsx`) is temporary for
the installed 3.9.0-alpha.1 dependency. Remove it after upgrading to a released
version containing the fix, not merely after the PR merges. First verify absent
data, explicit null, every scalar type, arrays, objects, and replacement of data
with a different root type. Then pass the omitted schema directly to JSON Forms
and retain the example regressions against that upstream path. The Monaco
stale-schema cleanup is separate and should remain.

## Cleared mixed scalars versus absent values

A mixed type selector owns the selected value's type. Clearing its string input
stores the empty string and keeps String selected. Clearing a number or integer
input stores zero and keeps its selected type; clearing the type removes the
value where absence is permitted. Scope this behavior to the exact mixed value
path, including root and tree-detail values, so ordinary optional scalar fields
retain their clearing semantics. Check both the clear icon and deleting all text.

## Detail strings are selection instructions

Do not dispatch a detail string as a UI-schema element. Resolve it through core's
findUISchema with the item schema, registry, schema scope, data path, and root
schema. GENERATE bypasses the registry; other strings consult it. Test using a
matching registered layout, since generation and registry fallback look identical
without one. DEFAULT does not force nested presentation, but does not suppress
nesting required by the item schema either.

A generated detail may be a Control that delegates to an object renderer. Carry
GENERATE into that delegated control, otherwise it can re-enter registry lookup.
Do not inherit a mixed root's field layout into unrelated descendant schemas.

## Named templates are separate from ranked detail lookup

Resolve Template.name against entry.uischema.name in registry order without
calling testers. Slot.name resolves the inherited caller-content map, with local
named children overriding it; fallback is the first Slot.elements child.
Preserve schema, path and enabled state through both dispatches. A UI-model name
is not a data binding. Named-only registry entries should return -1 from testers
so ordinary detail selection does not accidentally choose them.

The template-slots example covers supplied content, fallback, empty slots and
nested overrides. React shared-renderer tests execute these cases, and Antd and
shadcn integration tests render the example through their native registries. Missing-name
diagnostics, duplicate-name diagnostics and cycle protection remain gaps in the
current React implementation; do not treat its silent behavior as certification
of those normative requirements.

## Image diagnostics must fit their container

Do not print a refused image URL or embedded data payload in the form. Use a
short warning with an icon and an explanation available on hover, keyboard focus
and touch. Keep the explanation bounded and wrap long text; allow Escape to
close it. Source refusal must still prevent the image from loading. The shared
React ImageView renderer implements this presentation for its consumers.

## Conditional presentation is not schema rewriting

Resolve branch activity independently of error visibility and preserve the original
validator schema. Moving a field in a graphical editor changes its layout, not its
data scope. Branch-only fields can be placed explicitly in details; inactive values
must survive toggling. In Draft-07 a closed base object still rejects properties
introduced only by another subschema; visual discovery cannot legalize those values.
