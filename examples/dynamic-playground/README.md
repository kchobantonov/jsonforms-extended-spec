# Dynamic playground: preview and configuration forms

One opt-in `$dynamic` playground covers presentation, renderer selection, structure,
bindings and context. The preview and configuration forms have independent data.
The configuration form edits `external.settings`; the **External** editor exposes
the entire external object, including additional host namespaces. Valid JSON edits
update the preview; invalid drafts leave the last valid external state intact.
Switching examples resets external state. Neither editor writes business Data or Config.

| Try this | Visible result |
| --- | --- |
| Preview label / readonly / presentation | Leave Preview label empty for the translated Plan label; enter custom text to override it. Also changes editability and dropdown/radio renderer. |
| Compact preview spacing | Changes layout spacing. |
| Advanced: Amount label / invalid label binding | Leave Amount label empty for the translated default; custom text overrides it. The invalid binding keeps the earlier valid label. |
| Use slider editor | Replaces the numeric editor, retaining committed data and discarding unfinished drafts. |
| Edit alternate name | Rebinds the editing session to the alternate property. |
| Show extra field / flat extra layout | Replaces child elements and layout type. The inserted label displays `data.name`. |
| Hide name setting, then Mode = hide | Applies a dynamic JSON Forms visibility rule. |
| Replace whole member detail | Off patches children and keeps the Group heading; on supplies a complete flat detail without that heading. |
| Edit a Members row | Its detail label displays that occurrence's `item.name`. |
| Clear Name | Its label reflects the bound `value`; validation status changes using core `errors`. |
| Change locale | Catalog text translates and the locale value is displayed. |
| Edit Config.restrict | Changes the localized restrictions status. Member details show their dispatcher path; its encoding is adapter-specific. |

[dynamic-uischema.json](dynamic-uischema.json) is the active UI schema when the
adapter enables `$dynamic`; [uischema.json](uischema.json) is the static fallback.
Visible prose uses English/Bulgarian catalogs. User-authored labels and technical
values use dedicated translation keys with the supplied text as fallback. These keys are intentionally absent from the bundled catalogs; a host may explicitly translate them. Resolved values are not themselves used as catalog keys. Unknown extension payloads and literal descriptor
edge cases belong in resolver tests, not invisible demonstration options.
Trusted functions are TypeScript-only; see the spec and authoring tests.

### Patch a few keys versus supply a whole object

In the configuration form, toggle **Replace whole member detail** and inspect a
Members row. Off: the authored `Group` and its **Member detail** heading remain;
the patch only updates its children. On: a complete `VerticalLayout` replaces
that Group, so its heading disappears. Turning it off restores the Group.
Both keep the member data and the surrounding array's `collapsed: false` option.

An authored nested object is a patch. This changes/adds only `elements` while
keeping the existing detail's `type`, `label`, `i18n`, and any other keys:

```json
{
  "$dynamic": {
    "options": {
      "detail": {
        "elements": [{ "type": "Control", "scope": "#/properties/name" }]
      }
    }
  }
}
```

A descriptor supplies a complete value at its target. This replaces **only
`options.detail`**; the old detail's keys do not survive, but other `options` do:

```json
{
  "$dynamic": {
    "options": {
      "detail": {
        "literal": {
          "type": "VerticalLayout",
          "elements": [{ "type": "Control", "scope": "#/properties/name" }]
        }
      }
    }
  }
}
```

`"detail": { "bind": "external.memberDetail" }` likewise uses the complete host
object. Object results from `expression` or trusted functions behave the same.
By contrast, `"options": { "bind": "external.options" }` replaces **all options**,
because the descriptor is at `options`, not `options.detail`.

`literal` does not evaluate embedded `{ "bind": ... }` objects: those are data.
Use descriptors on individual patch keys for computed values, or bind a complete
host object. Nested UI elements inside a literal retain their own `$dynamic`;
those programs run only when the children are dispatched, in their own context.

Host-text keys are independent: `dynamicAdvanced.memberNameValue` for member
names (shared by the two alternative layouts), `dynamicAdvanced.documentNameValue`
for the document name, and `dynamicAdvanced.localeValue` for the locale display.
A missing `config.restrict` displays **Restrictions not specified**; this status
is informational and does not infer permissions or change their enforcement.

## Activation and external input

The supplied config enables overlays with `jsonformsExtended.dynamic.enabled: true`.
Pass the host-owned object as the form's `external` prop (or web-component property).
Set the config switch to `false` to see the authored fallback without changing data.
`external` remains available as `context.external` in templates while disabled;
`settings` is only this example's namespace. JSON examples never grant function trust.
