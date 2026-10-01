# Example: object control

**Example ID:** `object-control`\
**Demo entry:** **Spec: Object control** (`#spec-object-control`)\
**Domain:** customer profile\
**Specs covered:**

- [Object controls and additional-property editing](../../docs/spec.md#1816-object-controls-and-dynamic-properties)
- [Object-level errors and errors without rendered targets](../../docs/spec.md#1816-object-controls-and-dynamic-properties)
- [Honest rendering of invalid data](../../docs/spec.md#1816-object-controls-and-dynamic-properties)

An object control's whole job is to produce **other** controls, so there are
only two questions worth asking of it: where the nested form came from, and
what happens to an error that belongs to the object rather than to any field
inside it.

Neither has a single answer. The first has three sources and a precedence
order with one rule that surprises people; the second has three outcomes
depending on where core maps the error.

> **Dynamic properties are a separate example.** Keys that are data rather than
> schema — `additionalProperties`, `patternProperties`, `propertyNames`,
> renaming, the empty-name policy — are covered in
> [additional-properties](../additional-properties/README.md). This example is
> about objects whose properties the schema declares.

## Files

| File | Role |
| --- | --- |
| `schema.json` | Ten objects: seven that differ in where their layout comes from, three that fail in ways no single field can explain. |
| `uischema.json` | Five controls carry `options.detail`, in four different forms; the rest take what they are given. |
| `uischemas.mjs` | Registry entries for `address` and `handover`. A **`.ts` file**, because a registry entry carries a tester function and a function is not JSON. The `handover` entry is never used, on purpose. |
| `data.json` | Two required properties missing, one empty object, one undeclared key, one unmet dependency. The objects that demonstrate layout are all valid, so the error table stays about errors. |
| `config.json` | `showUnfocusedDescription` and `restrict`, both top level. |
| `translations.json` | English and Bulgarian, including messages for the three object-level failures. |

## What the form contains

```text
Customer profile
  Identity      generated layout        -> legalName required and missing
  Contact       options.detail          -> Phone before Email, reversing the schema
  Address       registered UI schema    -> Street/Postcode, City, then...
    Coordinates   nested object         -> ...an object inside the nested form
  Handover      detail: "GENERATE"      -> beats its own registry entry
  ---
  Schedule      detail: Categorization  -> a detail is any layout
  Notes         detail with no "type"   -> silently ignored
  ---
  Compliance    detail: Group(Group)    -> outer label dropped, inner kept
  ---
  Preferences   minProperties: 1, {}    -> fails on the object
  Routing       additionalProperties: false, holds "legacyZone"
  Billing       dependencies, PO without a cost centre
```

## Validation state

Validated with Ajv (`allErrors`, `strict: false`), the supplied data is
**invalid**, with five errors:

| Keyword | Path | Belongs to |
| --- | --- | --- |
| `required` | `/identity` | the missing `legalName` |
| `required` | `/address` | the missing `city` |
| `minProperties` | `/preferences` | **the object** |
| `additionalProperties` | `/routing` | **the object** |
| `dependencies` | `/billing` | **the object** |

Two field errors and three object errors. The split is the point.

## Expected behaviour

### Where the layout comes from

**Identity** has neither `options.detail` nor a registry entry, so the layout is
**generated** from the schema — which means schema property order: Legal name,
then Trading name.

**Contact** carries `options.detail` on its control, and that detail puts
**Phone before Email** — the reverse of the schema's order. The reversal is
what proves the detail was used, and that its scopes (`#/properties/phone`)
resolved against *the object*, not the root.

**Address** carries no detail. Its layout comes from the **UI-schema registry**,
whose tester matches on the schema's title, and puts Street and Postcode on one
row above City. The practical difference from `options.detail` is reach:
`options.detail` is part of the serialized UI model and travels with the form,
while a registry entry is host code that applies to every matching object
wherever it appears.

**Coordinates** is an object inside Address, dispatched at its own data path
from the registered layout — nesting is just dispatch, all the way down.

**Handover** has a registry entry *and* `detail: "GENERATE"` on its control.
GENERATE wins, so the layout is generated in schema order — Contact name,
Window, Gate code. The registry entry reverses that order precisely so the
difference is visible: had it been used, Gate code would come first.

This is the precedence rule that catches people out. `"GENERATE"` is not the
same as having no detail — it is an instruction, and it **outranks the
registry**. Resolution runs:

1. `options.detail` — `"GENERATE"`, or an object with a `type`
2. a matching registry entry
3. a layout generated from the schema

### A detail is any layout, and need not be complete

**Schedule**'s detail is a `Categorization`, and renders as tabs. Anything that
dispatches works; a detail is not restricted to rows of controls.

A detail also need not name every property. One naming a single control renders
that control and nothing else — the rest are simply not shown, with no error
and no leftover.

### A detail object with no `type` is not a detail

**Notes** carries this, and it does nothing at all:

```json
{ "options": { "detail": { "elements": [ … ] } } }
```

`findUISchema` accepts a detail object only when its `type` is a string, so
this one is skipped in silence and the generated layout is used instead —
which is why **both** of Notes's properties appear, though the detail names
one.

Nothing warns you. The form renders, and it ignores what you wrote. If a detail
appears to have no effect, this is the first thing to check.

### The outermost Group supplies the object boundary

**Compliance** uses an outer `Group` labelled *"Object group"*, containing
another `Group` labelled *"Nested group"*. Both are preserved, including their
labels and layout behavior. The renderer does not add another object frame
around the outer Group.

Generated nested object details use a Group, while the root uses a
VerticalLayout. Additional Properties belongs inside the object boundary,
without another enclosing border. Dynamic-only objects omit the empty static
layout. Untitled nested objects keep their boundary; ordinary VerticalLayouts
that directly bind fields remain unframed.

### Errors that have a control to land on

**Legal name** and **City** are both marked and both explain themselves. City's
is two levels down, inside a registered layout, which changes nothing: the
error is mapped to `address.city` and that control displays it.

### Errors that belong to the object or dynamic-property section

| Error | Feedback location |
| --- | --- |
| `dependencies` on Billing | Cost centre, when validation maps the failure to that property. |
| `additionalProperties` on Routing | Error indicator beside Additional Properties, identifying `legacyZone`. |
| `minProperties` on Preferences | Object-level feedback: beside an object Group title, or above unframed fields. |

Object feedback does not summarize child-field errors. Existing invalid values
remain editable; no property is silently removed or synthesized to satisfy a
constraint. Correcting the relevant data clears the message after validation.

### Validity and localization

All five fixture errors contribute to form validity. Their visibility in the
host's data panel is not a substitute for feedback inside the form. English and
Bulgarian validation messages are provided in `translations.json`.

## Fallback behaviour

| Situation | Result |
| --- | --- |
| No `detail`, nothing registered | A layout generated from the schema, in property order. |
| `options.detail` is an object with a `type` | It wins; scopes are relative to the object. |
| `options.detail` is `"GENERATE"` | A generated layout, **outranking** a matching registry entry. |
| `options.detail` is an object with no `type` | Ignored in silence; resolution continues to the registry, then to generation. |
| `options.detail` names only some properties | Only those render. The rest are absent, not empty. |
| A registry entry matches | Used when the control has no usable `detail` of its own. |
| The detail's outermost element is a `Group` | Preserved; supplies the object boundary and contains Additional Properties. |
| A `Group` deeper inside the detail | Kept, with its label. |
| Object nested in object | Dispatched at its own data path, with no frame of its own. |
| An error core maps onto a property with a control | Displayed there. |
| A disallowed additional property | Identified by the Additional Properties error indicator. |
| An error at the object's own path | Shown beside the object Group title or above its unframed fields. |
| Any of the above | Counts towards validity, and the data is left exactly as it is. |

## Conformance scope

This walkthrough describes the portable contract. Renderer support must be checked
by a host adapter; the package validates the authored assets, not live UI behavior.

## Standalone host setup

- Register the trusted tester functions exported by uischemas.mjs.

Import `uischemas` from [uischemas.mjs](uischemas.mjs) and register its entries.


## Feature navigation

The example separates its demonstrations into five tabs instead of one long form:

- **Generated layout:** the default object layout.
- **Explicit detail:** horizontal layout and nested tabs.
- **Registry and fallback:** registered layouts, GENERATE, and incomplete detail.
- **Group layouts:** outer and nested groups.
- **Object validation:** property count, additional properties, and dependencies.

Tab labels and introductions are available in English and Bulgarian. All tabs
continue to edit the same form data, with their existing schemas and constraints.


## Object title and frame comparisons

The Static fields, Dynamic fields, and Static and dynamic fields tabs each compare
a titled object with an explicitly untitled (`label: false`) object. Titles appear
once; dynamic-only objects have no empty static-field frame. One object boundary
contains static fields and Additional Properties without a second section border.
