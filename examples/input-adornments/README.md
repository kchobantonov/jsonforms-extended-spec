# Input adornments

**Example ID:** `input-adornments`\
**Demo entry:** **Spec: Input adornments** (`#spec-input-adornments`)\
**Spec:** [§18.3a](../../docs/spec.md#183a-input-adornments)

The Categorization has separate String, Number, Choice, Password, Date,
Date-time, Time, Duration, Cron, and Color tabs. Each tab uses the same
underlying form data and exposes that input type for visual comparison.

This authoring fixture shows a literal currency prefix, a translated unit and
help icon in one suffix, single icon objects on both sides of a field, a
translated text tooltip, and a select suffix that must coexist with its arrow.
Date, date-time, time, duration, cron, and color fields exercise start
placement beside picker icons; Reference, Category, cron, duration, and password
exercise end placement beside clear, dropdown, picker, and reveal controls.
The semantic `information`, `account`, `schedule`, and `lock` IDs require a
renderer/host icon map;
no particular icon library is part of the UI model.

## Files

`schema.json` defines numeric, text and choice values. `data.json` contains
ordinary editable data without adornment text. `uischema.json` exercises all
three value shapes and groups the controls into translated tabs. `translations.json` provides matching English and Bulgarian
keys with authored English fallbacks.

## Adapter checks

1. Render all fields, then switch between English and Bulgarian. Text, icon
   names and tooltips update; data stays byte-for-byte equal. The literal `€`
   and `#` remain unchanged.
2. Focus the help icon with a keyboard and read its localized tooltip and
   accessible label. Hover works too. With a missing icon mapping, show the
   localized label as text.
3. Edit and clear weight. The stored value remains numeric and never contains
   `kg`; existing clear controls and validation remain usable.
4. Check Date, Date-time, Time, Duration, Cron, and Color. Start adornments
   appear before native picker icons, swatches, or triggers. Type into the
   text-entry surfaces and open each picker without losing focus or caret state.
5. Clear Reference and open Category. Clear and dropdown icons remain visible
   and operable before end adornments. Toggle the password reveal icon without
   changing stored data; its reveal and clear controls remain distinct from the
   informational suffix. Cron and Duration picker actions remain usable.
6. Follow a library's established slot order when it defines one; document
   that convention. Check narrow widths and right-to-left layout.
7. On a renderer/variant without adornment support, report the capability gap.

The spec package validates the authored fixture and behavior vectors. Focused
Svelte and React renderer tests exercise adornment composition and placement.
The remaining visual and interaction checks above should be repeated per
renderer family and host.
