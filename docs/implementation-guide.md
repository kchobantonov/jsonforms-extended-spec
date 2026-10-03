# Renderer implementation guide

This guide is for new renderer implementations, including ports to other languages and UI libraries. The goal is comparable supported functionality, interactions and information placement. Internal architecture and exact pixels need not match.

## Read before implementing

1. [Specification](spec.md): portable data, UI schema and option semantics.
2. [Renderer and demo acceptance guide](renderer-and-demo.md): native component usage, presentation and demo requirements.
3. [Renderer selection](renderer-selection.md): selection and precedence.
4. [Implementation pitfalls](implementation-pitfalls.md): easily overlooked behavioral distinctions and acceptance cases.
5. [Web and TypeScript notes](implementation-web-typescript.md), where applicable.
6. [Behavior vectors](../conformance/behavior.json) and [examples](../examples/README.md).

The specification and renderer acceptance guide govern requirements. This guide explains how to preserve them; it does not turn gaps in an existing implementation into the contract. The [Draft-07 audit](draft-07-visual-support.md) records known limits, not a universal certification. If these documents conflict, identify and reconcile the conflict instead of silently copying a reference implementation.

## What a comparable implementation preserves

- Typed JSON values, literal keys, schema constraints and data paths.
- Renderer selection, option precedence and supported authoring capabilities.
- Field labels, descriptions, local errors, container errors and action placement.
- Confirmation, selection, editing, focus and keyboard behavior.
- Translated built-in and authored text, including error overrides.
- Search and sorting based on displayed summaries where specified.
- Responsive containment, collection boundaries and pagination placement.

Use native components and theme tokens. A native error icon may differ in shape; the error must still identify the same field and be discoverable at the same logical location. Framework-specific implementation details are not required APIs.

## Presentation acceptance checklist

| Element | Expected relationship |
| --- | --- |
| Ordinary control | One field label associated with the editor; description/help follows the control's documented visibility policy. Errors take precedence over ordinary help. |
| Invalid ordinary control | Native invalid styling, accessible state and the applicable error indicator; readable error text below the control. Tooltip-only feedback is insufficient. |
| Table cell | Column header supplies the label. Compact local feedback belongs beside/in the cell; error text is available through the accessible indicator/tooltip instead of expanding every row. |
| Container | Direct errors stay at the container boundary; descendant errors use a localized summary and do not replace field-level feedback. |
| Dynamic property | One property-name label. Name error indicator stays beside it, with edit/delete actions aligned separately. |
| Object | The resolved Group identifies the object boundary. Do not replace it with a VerticalLayout merely because the title is absent. Omit empty static sections and redundant internal frames. |
| Collection | Pagination remains inside the collection boundary, below its content. |
| Composition | A sole applicable branch needs no branch navigation; several alternatives retain the relevant selector. |

These are semantic locations, not fixed coordinates. Follow the detailed feature rules for exceptions, such as boolean labels or explicitly hidden labels.

## Acceptance process for a new port

Maintain a capability table with **supported**, **partial**, **unsupported**, and **not verified** states. For each departure, state the platform reason, affected scenarios and accessible alternative. Do not silently substitute a text box for a structured editor and call the feature supported.

For each feature test: initial mount, editing, external data replacement, missing/invalid data, disabled/read-only behavior, translation, keyboard operation and narrow layouts. Test through the real renderer registry as well as unit helpers. Use the examples' invalid data deliberately; rendering without exceptions does not prove that all valid values are reachable.

Behavior vectors are adapter inputs, not proof that a renderer passed. Each port should record its executed cases and results. Supplement them with interaction tests and browser/native UI checks. For schema transformations compare validation before and after transformation, then separately check that the UI exposes the intended editors.

Measure expensive paths: compilation reuse, active versus inactive branch work, large collections, nested compositions and typing responsiveness. Bound schema traversal and distinguish reference cycles from legitimate recursive child editing. Do not claim arbitrary recursive-schema support from a mount-only test.

## Recording future lessons

When work reveals an ambiguity or a commonly overlooked behavior:

1. Decide whether it changes the portable contract. If so, clarify the relevant specification section.
2. Add or update a pitfalls entry: expected behavior, tempting mistake, consequence and acceptance case.
3. Add a framework-neutral behavior vector or worked example when practical, then an implementation-specific regression test.
4. Record platform limits explicitly. Keep normative requirements separate from optimization advice and implementation certification.
5. Link the new material from the relevant example or guide.

Do not catalogue every typo, missing import or accidental regression. Record lessons another competent implementer could reasonably miss when reading the schema/specification. Describe the final behavior rather than a chronological bug history. The entries below were seeded from renderer fixes and existing spec material; they are not an exhaustive audit of all historical changes.

### Authoring mixed values as JSON code

Set `options.structuredLayout: "code"` on a mixed Control, or `jsonformsExtended.mixed.structuredLayout: "code"` in config. Tree remains the default. Code mode edits the entire value, including scalars and null, without a separate type selector. It requires the extended Monaco renderer registry and the additional-error provider (`ExtendedJsonForms`, or the additional-error store integration).

Monaco validates the bound section schema, with local references resolved against the document schema. Invalid JSON text stays in the editor and contributes an owner-scoped additional error; it must not overwrite the last parsed value. Parsed values update normally and AJV reports schema errors. Do not duplicate Monaco schema diagnostics into additional errors. Hosts must gate submission on additional errors as well as schema errors, because an invalid draft is newer than the stored value. Multiple editor models must retain independent schema registrations and clean them up on unmount.


## Recursive node tree presentation

A Control can opt into a tree with a selected-node detail pane using
`options.recursiveTree: { childrenProperty: "children", labelProperty: "name" }`.
Both properties name direct members of each node, not dotted paths. The tree
omits intermediate collection and scalar-property entries. Unnamed nodes use
an index label. The optional `detail` UI schema is relative to the selected node;
it must not enable recursiveTree again. Branch layouts from the UI schema
registry remain available. Without this option, recursive controls retain their
existing nested presentation. This differs from mixed `structuredLayout: "tree"`,
which navigates arbitrary JSON structure.

The selected node's child collection retains native add/delete behavior and
uses links to child editors rather than recursively expanding their fields.
Tree rows also expose rename and delete actions. Rename edits the configured
label property's value, not an object key, and validates the new value against
its schema. Delete removes the node from its parent's child array and respects
minItems, read-only ancestors, and deletion confirmation (the mixed catalog).
The displayed root cannot be deleted. Confirmation rechecks the current target
and permissions to avoid deleting a replacement node at a reused array index.
Editing a node preserves sibling data. Node error indicators include descendants
and follow the container-indicator and validation-visibility settings. After a
selected node is removed, select its closest remaining parent. Navigation remains
available in read-only forms; mutations remain disabled.

Implemented in React Antd and shadcn; other renderer sets do not yet implement
this option. The recursive-tree example includes a Tree editor tab for comparison.

## Array detail resolution

Array controls support these case-insensitive string modes:

| detail | Behavior |
| --- | --- |
| Omitted or DEFAULT | Keep normal array presentation. Schema nesting may still require a nested editor. |
| GENERATE | Use a nested editor and generate its detail UI schema without consulting the registry. |
| REGISTERED | Use a nested editor; consult the UI-schema registry, then generate if no entry matches. |
| Other strings, including GENERATED | Same registry-first behavior as REGISTERED, matching JSON Forms core. |
| Inline UI schema | Use that layout for the item, with scopes relative to the item schema. |

GENERATE is the canonical upstream implementation spelling. The upstream controls
webpage says GENERATED, but that spelling does not bypass the registry in core.
An explicit table option retains this project's table-selection precedence.
Registry lookup and detail rendering are separate from renderer selection:
DEFAULT does not force a table for structurally nested items.
Use the existing detail mechanism for custom layouts instead of inventing a
second generated/registered switch.

The array-detail-modes example demonstrates a matching registry entry, generation,
inline layout, DEFAULT, and registry fallback. Runtime coverage is provided for
React Antd and shadcn; this statement does not establish parity for other platforms.

## Editor detail modes and mixed type overrides

The detail resolver is also used for object and mixed editors. Explicit editor
details in composite cells, tuple-field editors, recursiveTree.detail, and row
editors accept the same string modes or inline layout. GENERATE bypasses registry
lookup and preserves that intent through a fallback Control. REGISTERED and other
strings use the registry before the context-specific fallback. DEFAULT preserves
normal presentation; it does not mean table outside array selection. An omitted
option retains the editor's existing default, which may already be a registered
layout. Scopes in inline layouts are relative to the edited value's schema.

Tuple container detail remains a position layout scoped to the whole tuple.
Do not apply an array-item editor layout to each tuple position.

Mixed controls accept object-detail, array-detail, string-detail, number-detail,
integer-detail, boolean-detail, and null-detail. For the current mixed value,
the selected type's option takes precedence over detail, including string modes.
This is a project extension, not a new upstream detail mode. It does not change
structuredLayout (tree/nested/code). Tree mode uses it for that mixed value's root
detail pane; it does not impose a root-specific layout on every descendant.
Code presentation edits the whole value and does not use these field layouts.
Null retains the existing no-value-control presentation.

Implemented and tested for React Antd and shadcn. Other renderer sets are not
claimed to support these extensions. See the editor-details example.

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
