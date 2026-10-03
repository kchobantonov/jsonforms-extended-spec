# Conditional fields and graphical form authoring

## Runtime contract

Conditional presentation is opt-in: options.conditionalFields on an object
Control overrides config.jsonformsExtended.conditionalFields, default false.
Use an object Control at scope # to opt a whole root object into discovery.
Existing UI rules and validator behavior are unchanged when omitted.

Evaluate if against the current object using the host validator and original
reference context. Apply then if it matches and else otherwise; do not derive
activity from validation error lists. Conditions still apply in NoValidation.
An absent discriminator may satisfy properties alone: include required in if
when presence is intended. Never mutate data during condition evaluation.

Schema-valued Draft-07 dependencies activate on property presence, including
false, null and empty strings. Array-valued dependencies contribute required
markers, not new fields. Active allOf branches contribute conjunctively.
Base fields remain visible; active branches may change their required markers.
Inactive branch-only fields disappear without data deletion or default insertion.
Retained inactive properties are reserved from the additional-property editor.

Only the presentation schema is projected. Original document validation remains
authoritative, including additionalProperties and branch constraints. Projection
must retain overlapping property constraints rather than replace earlier ones.
Do not flatten the original schema or save the projection as the authored schema.
Conditions which cannot compile must show a diagnostic rather than silently
activate else. Recursive schema traversal must terminate.

## Placement and reuse

Generated object details include active properties. Explicit detail layouts and
registered layouts keep their authored order and containers; ordinary Control
scopes bind against the active object schema. Inactive branch-only bindings are
omitted. Group fields wherever desired, including tabs and columns. No special
additional-properties collection is required. Empty authored containers are kept.
Standard detail GENERATE/REGISTERED/inline semantics remain in effect.

The implemented first slice discovers properties, required names, if/then/else,
allOf and Draft-07 dependencies at each rendered object boundary. It does not
infer fields from not, contains or alternatives inside anyOf/oneOf. Arbitrary
remote references, nested $id rebasing and contradictory editor constraints
are not certified. Branch ownership under reusable Template/Slot models is not
filtered by this first slice; author branch fields directly in the detail layout.

## Graphical editor contract

These requirements describe authoring behavior; no graphical editor is shipped
by this feature. Keep JSON Schema validation and UI-schema placement separate.

- Drag/reorder controls between groups, columns and tabs by changing layout
  elements only. Preserve scope, options, rules, name and unknown properties.
- Present a field palette with schema-pointer origins (base, then, else,
  dependency). A property may have several origins; do not duplicate its data.
- Allow selection of an inactive branch for layout editing. Branch preview is
  editor state, never a mutation of runtime data, config or validation results.
- Store explicit positions as ordinary detail layouts. Bind to the property
  scope, not a then/else schema pointer which would change the data path.
- Distinguish conditional requiredness from visibility; base fields need explicit
  UI rules if authors want them hidden. Do not copy a schema condition into a UI
  rule automatically and create two independently editable sources of truth.
- Preserve unknown JSON during round trips. Provide an advanced JSON panel for
  unsupported keywords rather than discarding them.
- Stable selection/undo identities belong to editor state until a portable
  identity contract is adopted. Do not repurpose name: Template/Slot use it for
  runtime lookup. Do not serialize editor-only identifiers into validation data.
- Expose container capabilities for drop validation: layouts accept elements,
  categories belong to categorizations, detail layouts use the edited value's
  scope, and a Slot fallback uses one layout to hold multiple controls.

## Follow-up priorities

1. More conditional compositions and named-template placement coverage.
2. contains matching-item feedback and property-dependency explanations.
3. not as forbidden-combination guidance and a condition-builder operator, never
   positive field discovery from a negated schema.
4. Explicit default/example actions and false-schema explanations.

See [conditional-fields](../examples/conditional-fields/README.md). Antd and
shadcn execute the shared resolver; other renderer families are not certified.
