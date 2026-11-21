# Input adornments

**Example ID:** `input-adornments`\
**Demo entry:** **Spec: Input adornments** (`#spec-input-adornments`)\
**Spec:** [§18.3a](../../docs/spec.md#183a-input-adornments)

The single page groups String, Multiline, Masked, Number, Integer, Choice, Password,
Date, Date-time, Time, Duration, Cron, and Color. Each group shows three
independent fields side by side: start adornment only, end adornment only,
and both adornments. Scroll the page to compare every supported input type
without switching tabs.

This authoring fixture shows a literal currency prefix, a translated unit and
help icon in one suffix, single icon objects on both sides of a field, a
translated text tooltip, and a select suffix that must coexist with its arrow.
Date, date-time, time, duration, cron, and color fields exercise start
placement beside picker icons; the end-only and both fields exercise suffix
placement beside clear, dropdown, picker, and reveal controls.
The semantic `information`, `account`, `schedule`, and `lock` IDs require a
renderer/host icon map;
no particular icon library is part of the UI model.

## Files

`schema.json` defines numeric, text and choice values. `data.json` contains
ordinary editable data without adornment text. `uischema.json` exercises all
three placements on one page. `translations.json` provides matching English
and Bulgarian keys with authored English fallbacks.

## Adapter checks

1. Render all fields, then switch between English and Bulgarian. Text, icon
   names and tooltips update; data stays byte-for-byte equal. The literal `€`
   and `#` remain unchanged. Verify that each group shows start only, end
   only, and both placements at the same time.
2. Focus the help icon with a keyboard and read its localized tooltip and
   accessible label. Hover works too. With a missing icon mapping, show the
   localized label as text.
3. Edit and clear weight. The stored value remains numeric and never contains
   `kg`; existing clear controls and validation remain usable. Where the
   browser provides a number stepper, hover to reveal it, increment and
   decrement, then clear. The stepper, clear button, and end adornment remain
   separate and clickable.
4. Check Date, Date-time, Time, Duration, Cron, and Color. Start adornments
   appear before native picker icons, swatches, or triggers. Type into the
   text-entry surfaces and open each picker without losing focus or caret state.
   The adornment must not cover the Color swatch or the Cron and Duration
   triggers.
5. Clear a String field and open Choice. Clear and dropdown icons remain visible
   and operable before end adornments. Toggle the password reveal icon without
   changing stored data; its reveal and clear controls remain distinct from the
   informational suffix. Cron and Duration picker actions remain usable. A
   conditional clear button appears before the persistent password reveal
   button without moving it, and neither action covers the suffix.
6. Follow a library's established slot order when it defines one; document
   that convention. Check narrow widths and right-to-left layout.
7. On a renderer/variant without adornment support, report the capability gap.
8. At rest, on hover, while focused, and while editing, compare the position
   of values, adornments, picker triggers, steppers, and clear buttons. No
   element should jump, disappear, or overlap. On Date, Date-time, and Time,
   preserve the renderer's usual clear visibility policy; when clear normally
   appears on hover or focus, it is hidden at rest. Hovering a tooltip must
   not change document width or horizontal scroll.

The spec package validates the authored fixture and behavior vectors. Focused
Svelte and React renderer tests exercise adornment composition and placement.
The remaining visual and interaction checks above should be repeated per
renderer family and host.
