# Renderer implementation pitfalls

Companion to the [implementation guide](implementation-guide.md). These entries describe portable behavior and acceptance checks, not instructions to reproduce a particular codebase. Consult [spec.md](spec.md) for option definitions and [renderer-and-demo.md](renderer-and-demo.md) for detailed presentation requirements.

## P01 — Values are compared by JSON content

**Trap:** Compare enum/const object or array choices by runtime reference identity, or serialize every choice into the stored value.

**Behavior:** Reloaded structurally equal values remain selected; choosing them preserves their JSON types. Object member order is immaterial; array order matters. Missing, null, false, zero and empty string remain distinct.

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
