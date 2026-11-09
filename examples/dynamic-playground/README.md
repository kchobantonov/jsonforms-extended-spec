# Dynamic playground: preview and configuration forms

One opt-in `$dynamic` playground covers presentation, renderer selection, structure,
bindings and context. The preview and configuration forms have independent data.
The configuration form edits `external.settings`; the **External** editor exposes
the entire external object, including additional host namespaces. Valid JSON edits
update the preview; invalid drafts leave the last valid external state intact.
Switching examples resets external state. Neither editor writes business Data or Config.

| Try this | Visible result |
| --- | --- |
| Preview label / readonly / presentation | Changes the Plan label, editability and dropdown/radio renderer. |
| Compact preview spacing | Changes layout spacing. |
| Advanced: Amount label / invalid label binding | Shows ordered overlay fallback; the missing binding keeps the earlier valid label. |
| Use slider editor | Replaces the numeric editor, retaining committed data and discarding unfinished drafts. |
| Edit alternate name | Rebinds the editing session to the alternate property. |
| Show extra field / flat extra layout | Replaces child elements and layout type. The inserted label displays `data.name`. |
| Hide name setting, then Mode = hide | Applies a dynamic JSON Forms visibility rule. |
| Edit a Members row | Its detail label displays that occurrence's `item.name`. |
| Clear Name | Its label reflects the bound `value`; validation status changes using core `errors`. |
| Change locale | Catalog text translates and the locale value is displayed. |
| Edit Config.restrict | Changes the localized restrictions status. Renderer path is shown, with `/` for the root. |

[dynamic-uischema.json](dynamic-uischema.json) is the active UI schema when the
adapter enables `$dynamic`; [uischema.json](uischema.json) is the static fallback.
Visible prose uses English/Bulgarian catalogs. User-authored labels and technical
values are displayed verbatim. Unknown extension payloads and literal descriptor
edge cases belong in resolver tests, not invisible demonstration options.
Trusted functions are TypeScript-only; see the spec and authoring tests.
