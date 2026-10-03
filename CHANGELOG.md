# @chobantonov/jsonforms-extended-spec

## 0.2.0

### Minor Changes

- f897f1f: Document array panel collapsing and enable it in the array presentation example.
- f897f1f: Export catalog-driven examples and optional registries as one browser-compatible module. Maintain a framework-neutral renderer/demo acceptance guide and a documentation coverage map.
- f68e07e: Define collection pagination and whole-row dialog/panel details with focused recruitment and booking fixtures.
- c9caed4: Specify opt-in conditional object field discovery, authored placement and configuration. Add a runnable example, authoring option, and graphical editor contracts with explicit implementation limits.
- f897f1f: Move maintained guides to lowercase paths under docs, remove redundant historical specifications and the coverage map, and keep renderer-specific findings with their implementation project.
- 409f918: Define editor detail modes for composite cells, tuple fields, and recursive nodes; document and type mixed per-type overrides, and add an editor-details example with registered and generated layouts.
- f897f1f: Own the framework-independent TypeScript authoring helpers, guide, and tests. Export the helpers through the typescript subpath and retain historical specification documents for existing gap references.

### Patch Changes

- 93feecd: Specify pagination for tuple additional items, scoped boolean config overrides, and enabled defaults for additional items and properties. Add a shipping fixture, authoring types and conformance cases.
- 1d92546: Add a focused AG Grid example comparing portable columns, scoped and local pagination, native overrides, whole-row dialogs and panels, and composite cell details.
- 1d92546: Clarify portable AG Grid column and pagination defaults with explicit native overrides. Use portable columns in the shared table and grid row-detail example.
- 1d92546: Show AG Grid dialog, side panel, and bottom panel row details alongside normal tables in the row-details example.
- 409f918: Document upstream array detail modes, permit case-insensitive strings in authoring schemas, type array detail options, and add a runnable example of default, generated, registered, fallback, and inline layouts.
- f68e07e: Expose OTP and documented array variants in typed authoring, clarify open variant schema applicability, and record renderer parity gaps.
- 8b20a68: Extend table cell summaries with Label presentation and whole-row column binding. Document context and editing rules and demonstrate both in normal and AG Grid recruitment tables.

  Clarify the item/form-root namespaces, expression access gates, source-row identity,
  cross-package context continuity, long-summary resizing, and AG Grid sorting and
  filtering by resolved Label text. Add examples and verification steps.

- 9d8a691: Align choice-card branch detail modes across UI schemas and TypeScript authoring, and add a translated example demonstrating generated details, registry selection, and fallback. Share collection and dialog option validation across both UI schemas and add TypeScript declarations for example registries.

  Clarify null-control presentation and registration, document choice-card detail resolution and array summary validation pitfalls, and update authoring conformance cases and configuration-consumption evidence.

- 93feecd: Clarify confirmation ownership, policies and stale-target guards for additional properties and tuple additional items in both paginated and unpaginated collections.
- 59a1a5a: Require accessible resizable dividers for list-with-detail and table detail panels, using native renderer components where available. Specify divider direction and preservation of selection, edits and pane sizes.
- 32799af: Document optional collection UX improvements and verification cases for error navigation, selection stability, pending edits, Markdown summaries, keyboard access, filtered empty states, and narrow layouts.
- 8b20a68: Add oneOf, anyOf and allOf object columns with invalid and valid rows to the container-validation example and document composition-level cell indicators.
- 8b20a68: Make contact alternatives explicit object schemas with their own fields so anyOf cell dialogs demonstrate contact editing without falling through to an unconstrained mixed editor.
- f68e07e: Scope tuple orientation and array pagination defaults under jsonformsExtended component bags; remove generic flat defaults.
- f897f1f: Specify composite cell delete confirmation and demonstrate populated and empty object/array cells in the destructive-confirmation example.
- 8b20a68: Document nested validation feedback on object and array cell summaries and add invalid composite cells with a valid comparison row to the container-validation example.
- 8b20a68: Define distinct composite summary wording for missing values, empty objects and unavailable summary fields. Recommend secondary italic typography for generated descriptions and normal typography for data previews.
- 93feecd: Default every delete operation to complex confirmation, including array items, mixed tree entries, additional properties and tuple additional items. Scalar values and empty containers delete without prompting unless explicitly overridden.
- 13cc04a: Specify configurable cell and row detail dialog size, maximize/restore, dragging, and resizing, with recruitment examples.
- 13cc04a: Document recommended detail dialog positioning, viewport bounds, body scrolling, footer placement, movement, resizing, focus, maximize/restore, and shadow-root theme behavior. Place dialog geometry alongside collection row detail options.
- 66e398c: Add the official Draft-07 metaschema as a schema-authoring example and document visual editing coverage and known limitations.
- f897f1f: Recommend full-cell grid editors, a single focus indication, and empty-color swatches. Require stable control identity and preservation of focus, selection, and composition during routine data updates across renderer sets.
- f897f1f: Document non-normative collapsible-group presentation guidance: framework components, full-header disclosure, trailing status indicators, and localized data tooltips.
- 8b20a68: Recommend ellipsis for long list-with-detail labels while keeping actions visible. Reserve horizontal scrolling for constrained controls and describe optional full-label tooltips.
- f68e07e: Define component-scoped radio orientation defaults under jsonformsExtended.radio.vertical.
- 13cc04a: Expand the recruitment row detail demos with object and array columns and tabbed row editors. Show a default array cell editor alongside ListWithDetail in the row editor.
- f897f1f: Centralize framework-neutral renderer roles, default array presentations, priority relationships, and selection regression cases.
- 8b20a68: Record themed scroll-region decisions for shadcn and Ant Design, independent scrolling in bounded detail panes, and the distinction between implemented behavior and recommended scrollbar styling.
- 1f994fd: Specify the visible detail pane's current-row highlight, accessible indication, and independence from bulk deletion selection. Document row-click and explicit edit behavior for hidden panes.
- 409f918: Document Template and Slot name lookup, inherited slot contents and fallback semantics. Add a runnable named registry example and authoring guidance, and validate slot fallback children.
