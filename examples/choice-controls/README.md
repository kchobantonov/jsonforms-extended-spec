# Example: choice controls

**Example ID:** `choice-controls`\
**Demo entry:** **Spec: Choice controls** (`#spec-choice-controls`)\
**Domain:** appointment options\
**Specs covered:**

- [Radio-choice layout and interaction](../../docs/spec.md#185-choice-and-suggested-string-controls)
- [Choice identity and existing values](../../docs/spec.md#185-choice-and-suggested-string-controls)
- [Honest rendering of invalid data](../../docs/spec.md#185-choice-and-suggested-string-controls)
- [Choice and suggested-string controls](../../docs/spec.md#185-choice-and-suggested-string-controls)
- [Choice searchability](../../docs/spec.md#185-choice-and-suggested-string-controls)
- [`vertical` orientation](../../docs/spec.md#185-choice-and-suggested-string-controls)

## Validation state

Validated with Ajv (`allErrors`, `strict: false`), the supplied data produces
exactly one error:

| Instance path | Keyword | Message |
| --- | --- | --- |
| `/supplier` | `enum` | must be equal to one of the allowed values |

## Orientation

`options.vertical` is the single orientation encoding, and it means the same
thing here as on a checkbox group — see
[the specification](../../docs/spec.md#185-choice-and-suggested-string-controls).

| Control | Orientation |
| --- | --- |
| Processing speed | Absent, so horizontal, wrapping when the row runs out of space. |
| Workspace | `vertical: true`, stacked — the labels are long enough that a row reads poorly. |
| Billing department | `vertical: true` on constant-based `oneOf` choices. |

The orientation is announced with `aria-orientation`, so assistive technology
describes the arrangement actually on screen rather than a default.

## What to try

**Nothing is preselected.** `region` has no value, and mounting must not choose
the first option. Check the Data tab: the property is still absent.

**Value identity survives.** `priority` is an integer enum holding `2`. It must
stay the number `2`, never the string `"2"` — labels and widget identifiers are
presentation, not the identity of the stored value.

**Labels translate, values do not.** `department` has `i18n: "department"`, so
core looks up `department.fin`. Switch the demo to Bulgarian: the label becomes
"Финанси" while the stored value stays `"fin"`.

**An out-of-domain value is preserved.** `supplier` holds `"Legacy"`, which is not
in its enum. No radio is selected, the value stays in the data, and validation
reports it. A renderer must not select the nearest option or clear the field to
make the widget look valid.

## Fallback behaviour

| Situation | Result |
| --- | --- |
| No `format: "radio"` | Ordinary enum selection — a dropdown — not radios. |
| `vertical` absent | Horizontal. Only an explicit `true` stacks. |
| Two choices with the same translated label | Both still render. They are keyed by value, so distinct values stay distinct choices. |

## Conformance scope

This walkthrough describes the portable contract. Renderer support must be checked
by a host adapter; the package validates the authored assets, not live UI behavior.

## Searchable choices

**Office location and Handling team ask for `options.autocomplete: true`**, so
their dropdowns take a query. The same Office location appears again below without
the option, which is **this family's default**: not searchable.

That default is a choice, and section 18 allows it — "preserves the renderer
family's documented default. No universal default is imposed" — but it differs
from Material, where searching is on unless `autocomplete: false`. A document
that relies on Material's default will render a plain dropdown here. See
[the specification](../../docs/spec.md#185-choice-and-suggested-string-controls).

**Search Handling team for `Oper`.** It matches **Operations**, the visible
label, not the stored constant `ops` — searching for `ops` finds nothing. The
labels come from the branch titles and go through the translator, so the same
search works in Bulgarian against the Bulgarian labels.

**Type something no choice matches.** A localized "No matching choices" appears,
and pressing Enter stores nothing: "search text is not itself a new allowed
value." For a field that *should* accept other values, the encoding is
`options.suggestion` on a plain string, not this.

## Standalone host setup

Load the JSON assets listed in [the catalog](../catalog.json) into a host
with the relevant renderer capabilities. Register the trusted tester functions
exported by `uischemas.mjs` for the Card detail modes tab. The generated example
module includes these registrations for demo hosts.


## Feature navigation

Explore one feature at a time using the tabs: **Horizontal radio**, **Vertical radio**, **Constant choices**, **Value identity**, **Searchable choices**. Tab titles are localized in English and Bulgarian. The tabs share the existing form data.


## Choice cards
The Choice cards tab covers image data URLs (explicitly enabled in config),
selected content, rich translated labels, typed values, a disabled card and
automatic labels. Card branch forms covers explicit Email detail and generated
Postal detail. Switching populated branch forms uses the shared confirmation
policy. English and Bulgarian translations accompany the card UI.

Card branch forms explicitly uses `confirmation.branchChange: "complex"`. A discriminator-only value switches immediately; entered branch details require confirmation. Branch switch without prompt uses `never`. The default oneOf policy remains `always`.

Card validation demonstrates an absent required choice, an invalid imported enum value, and an invalid email within a selected branch, with English and Bulgarian messages.

Object and array choices demonstrates preloaded nested object and array constants in dropdowns, radios, and table cells. These values must remain selected after JSON reload. This also provides a parity fixture for renderer families whose composite choice support is not yet certified.


## Card detail modes

The **Card detail modes** tab presents the same `cardContact` value twice:

- `choices[].detail: "GENERATE"` bypasses the matching registry entry and shows
  the generated branch fields, including the discriminator.
- `choices[].detail: "REGISTERED"` uses `uischemas.mjs` for Email. Its custom
  **Registered email address** label makes registry selection visible, and its
  layout omits the discriminator already controlled by the cards.

Edit either email address and the other presentation updates. Switch to Postal
mail (confirm discarding populated details): no registry entry matches that
branch, so REGISTERED falls back to generation and both show Street and City.
The existing Card branch forms tab retains its inline Email detail for comparison.
The new tab and registered label have English and Bulgarian translations.

See the [implementation guide](../../docs/implementation-guide.md#choice-card-branch-details)
for executed renderer coverage of this example.
