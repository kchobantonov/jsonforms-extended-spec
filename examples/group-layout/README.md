# Example: group layout

**Example ID:** `group-layout`\
**Demo entry:** **Spec: Group layout** (`#spec-group-layout`)\
**Domain:** supplier record\
**Specs covered:**

- [Group](../../docs/spec.md#81-group)
- [Layout types and semantics](../../docs/spec.md#81-group)

A Group is the plainest container there is — "an ordinary Group presents
related controls as a labelled section". The tabs show its disclosure and
indicator options, then a Group with cover, header and action regions.

## Files

| File | Role |
| --- | --- |
| `schema.json` | Supplier properties; the interest is in the arrangement, not the data. |
| `uischema.json` | The existing Group cases plus a Card regions tab with cover, authored heading and footer. |
| `data.json` | Half the properties filled, so the data indicator has something to distinguish. |
| `config.json` | `showUnfocusedDescription` and the image-data URL permission needed by the self-contained cover and header artwork. |
| `translations.json` | English and Bulgarian, including the indicator's accessible label. |

## What the form contains

```text
Supplier record
  Identity            plain group              -> a labelled section, always open
  Contact             collapsible              -> open, and marked as holding data
    Additional details  collapsible, collapsed -> nested, closed, also holds data
  Insurance           collapsible, collapsed   -> closed, and holds nothing
  Audit               collapsed, NOT collapsible -> stays open; collapsed is ignored
```

## Expected behaviour

### A plain group is just a section

**Identity** has no options at all. It draws a labelled section with no
disclosure control, and its contents are always present. Its default visual
treatment "belongs to the renderer family and does not require a variant" —
there is no `variant: "card"` to author.

Note it also contains a `HorizontalLayout`, so a group composes with the
sizing model rather than replacing it.

### `collapsible` adds a disclosure control

**Contact** is collapsible and opens by default, because `collapsed` defaults
to false. The header is "an accessible disclosure control", so it can be
reached and operated from the keyboard.

For the suggested presentation, make the whole header the disclosure target,
keep the title at the leading edge, and put the data marker and chevron at the
trailing edge. The marker's tooltip uses its localized accessible name. Use
the UI framework's standard collapsible component and the application's theme;
see [§8.1 presentation recommendations](../../docs/spec.md#81-group).

### `collapsed` initializes, and only when collapsible

**Insurance** starts closed. **Audit** asks for `collapsed: true` but never
asks for `collapsible`, so the option is ignored and the group stays an
ordinary open section — "ignored unless collapsible is true".

Note that a closed group's children are still in the document; the disclosure
hides them. Validation and data are unaffected by expansion, which is the point
of "collapsing must not clear data or suppress validation".

### `showDataIndicator` marks the groups holding something

**Contact** and **Additional details** are marked; **Insurance** is not,
because none of its properties has a value. That asymmetry is what makes the
indicator worth anything — an indicator on everything says nothing.

The marker carries a localized accessible label, "Contains data", rather than
relying on the visual dot alone. **Switch the demo to Bulgarian** and it
translates with everything else.

### Groups nest

**Additional details** sits inside **Contact**, collapsible inside
collapsible, and each keeps its own state: opening the outer one does not open
the inner.

## Fallback behaviour

| Situation | Result |
| --- | --- |
| No options | A labelled section, always open, with no disclosure control. |
| `collapsible: true`, no `collapsed` | Collapsible, open. |
| `collapsed: true` without `collapsible` | Ignored. |
| `collapsed` set to a non-boolean | Ignored; the static fallback applies. |
| `showDataIndicator: true`, no descendant holds data | No marker. |
| A collapsed group | Children remain in the document, validated as normal. |

## Cover, header and footer

The **Card regions** tab in `uischema.json` demonstrates the optional structural
regions. A self-contained courtyard photograph fills the 800px-wide card cover.
Two authored header Labels provide the title and smaller supporting text. The
footer follows the body with space on both sides of its divider.
The group starts
collapsed, showing its cover, single heading area, disclosure control and
indicator. Opening it reveals the controls and footer inside that frame.
Activating a footer button must not toggle the disclosure. Closing the Group hides
the controls and footer without changing data. Hiding the Group hides every region.
The image uses the ordinary ImageView URL and alternative-text rules; the
buttons use ordinary action dispatch and enabled/read-only behavior. The two
buttons select English or Bulgarian through the demo host's `setLocale` action.
The card's width limit comes from its parent VerticalLayout item constraint.

## Not covered: `collapsed` driven from data

§8's worked example binds `collapsed` through `$dynamic`:

```json
"$dynamic": { "options": { "collapsed": { "bind": "data.hideDetails" } } }
```

The fixture uses static `collapsed` only. Dynamic binding is a separate
capability and must be verified in the selected renderer.

Two consequences worth knowing when it is implemented:

- expansion must **synchronize** when the effective boolean changes, while
  leaving local header clicks alone in between;
- `$dynamic` is "one-way resolution, not a writable binding" — reopening a
  group locally must not write back to the bound property.

## Conformance scope

This walkthrough describes the portable contract. Renderer support must be checked
by a host adapter; the package validates the authored assets, not live UI behavior.

## Standalone host setup

Load the JSON assets listed in [the catalog](../catalog.json) into a host
with the relevant renderer capabilities. No framework registration module is
required by this package.


## Feature navigation

Explore one feature at a time using the tabs: **Identity group**, **Contact group**, **Insurance group**, **Audit group**, **False and zero**, and **Card regions**. Tab titles are localized in English and Bulgarian. The tabs share the existing form data.

## Consolidated demo coverage

The False and zero tab starts collapsed with `false` and `0`: both count as present data.
