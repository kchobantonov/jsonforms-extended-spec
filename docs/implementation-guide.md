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
