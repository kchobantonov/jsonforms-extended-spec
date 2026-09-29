# Renderer selection guide

This framework-neutral index complements spec.md. It records semantic renderer
roles, not implementation filenames. Several roles may share an implementation;
a role existing in the specification does not claim support in every package.

## Selection procedure

1. Resolve the control scope and references against the root schema.
2. Check applicable explicit presentation options using the tester-input rules
   in §5.3. Reject incompatible schemas rather than matching an option alone.
3. Prefer specialized schema matches over generic controls.
4. Dispatch table/grid values through the cell registry at the row/property path.
   A registered form control alone does not establish cell support.
5. Preserve control identity across ordinary data and validation updates.

Do not use registration order as a substitute for a missing specialized tester.
When equally ranked framework adapters intentionally override a shared renderer,
document that tie and its ordering in the implementation.

## Capability inventory and specification coverage

| Generic role | Selection / purpose | Detailed contract |
| --- | --- | --- |
| String input; integer input; number input | Scalar type fallback | §18.19, §18.28 |
| Boolean checkbox; boolean switch | Boolean, explicit toggle presentation | §18.19 |
| Enum/constant choice; titled finite choice | enum, const, finite oneOf | §18.5 |
| Radio choices | Explicit radio presentation on finite choices | §18.5 |
| Suggested-string input | anyOf allowing free strings and string choices | §18.5 |
| Scalar composition input | Composition reducible to one scalar editor | §18.15 |
| Password; one-time password | Password format / OTP presentation | §18.19, §18.24 |
| Numeric slider; formatted numeric input | Range/format-specific scalar presentation | §18.19 |
| Date; time; date-time; duration | Temporal format and editing options | §18.2a, §18.19 |
| File; color; mask; null; cron | Specialized string/null profiles | §18.18, §18.25, §18.27 |
| Object editor; additional-property editor | Object fields and dynamic keys | §18.16 |
| Mixed-value editor | Genuinely unconstrained or multi-type values | §18.20 |
| Array table | Primitive and flat object arrays | §18.7–18.14, §5.3a |
| Expandable array; list with detail | Nested items / explicit detail selection | §18.21 |
| Tuple editor | Positional item schemas | §18.11, §18.23 |
| Enum array / checkbox group | Unique finite item choices | §18.29 |
| Chips; multi-select | Explicit applicable array variants | §5.4, §18.29 |
| All-of composition; any-of composition; one-of composition | General composition fallback | §18.15 |
| Vertical layout; horizontal layout; group | Structural layout and disclosure | §6–§8 |
| Category tabs; category accordion; category stepper | Default and explicit category presentations | §8 |
| Label; markup label; image view; separator; link; spacer; action button | Display, spacing, and action elements | §7, §10, §13–§14 |
| Split layout; template layout; named template; slot | Extended layout and delegation | §7, §13, §22 |
| Data grid; code editor | Explicit extended editor selection | §18.18, §18.26 |
| Scalar cells; choice cells; formatted cells | Compact equivalents of scalar controls | §18.14, §18.19 |
| Composite summary/detail cell | Object/array cell fallback with detail editing | §18.13 |

Native-input overrides and framework template languages are family conventions;
they must document applicability without becoming mandatory portable variants.
The inventory groups related presentations; individual format contracts remain
in spec.md. A renderer set must publish omissions rather than silently claiming
full coverage from this index.

## Reviewed priority relationships

React Antd's reviewed registry uses the following ranks. They are audit evidence,
not required numeric constants for Svelte, Vue, React, or another framework.

| Applicable presentation | Reviewed rank | Must beat |
| --- | --- | --- |
| Generic text | 1 | No specialized match |
| Basic enum / scalar / object | 2 | Generic text where applicable |
| Automatic array table | 3 | Generic array fallback |
| Nested expandable array / list with detail | 4 | Automatic table |
| Explicit table | 5 | Nested expandable array |
| Finite array checkbox choices | 5 | Automatic table |
| Explicit chips / multi-select | 6 | Automatic finite-array choices |
| Generic allOf / anyOf / oneOf | 3 | Generic mixed fallback must not swallow composition |
| Scalar composition | 4 | Generic composition |
| Titled finite choices / suggested string | 5 | Generic composition and scalar fallback |

Explicit formats such as radio, password, OTP, temporal pickers, and extended
editors must outrank their applicable generic scalar fallback. Generic mixed
selection must exclude already-resolved specialized schemas; a high mixed rank
is safe only with a narrow applicability predicate.

## Required selection regression cases

- String array: one value cell per row, adjacent remove action, cell validation
  and array summary; no stacked item forms by default.
- Flat object array containing enum and titled oneOf enum properties: table
  columns with working choices and retained stored values.
- Array containing const choices and invalid strings: nonempty choice list,
  cell errors and array summary, respecting validation visibility.
- Free-string plus enum anyOf: editable suggested-string input, not branch tabs.
- Referenced allOf object with an untyped branch containing a string property:
  string input for that property, not a mixed-type selector.
- Nested object array: automatic detail presentation; explicit table overrides
  it and dispatches object/array columns through composite cells.
- Unique finite array: checkbox choices by default; applicable explicit chips
  or multi-select wins. Non-finite and duplicate-permitting schemas are tested
  separately against each variant's applicability.
- Every specialized cell: selection tested independently from form renderers.

Tests should exercise the registered renderer set with real schema/UI-schema
fixtures and incompatible cases, not only call each renderer in isolation.
