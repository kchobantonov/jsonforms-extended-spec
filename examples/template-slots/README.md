# Named templates and slots

Load `uischemas.json` into the host's `uischemas` registry. This file is trusted
host code; the UI models themselves contain no executable templates.

- `Template.name` matches **entry.uischema.name**, exactly and case-sensitively.
  The first matching entry wins. `tester` is ignored for this lookup. Returning
  -1 keeps these layouts out of ordinary ranked detail selection.
- The first card supplies named heading and body elements. The second uses
  each Slot's first child as fallback. The empty optional Slot renders nothing.
- The nested card inherits the email body and replaces only its heading locally.
- All cards share the caller's schema and data path. Editing Contact name also
  updates Default name; names identify UI models, not data properties or scopes.

Use unique template names and acyclic references. Hosts should diagnose missing
templates and duplicates and guard cyclic references.

This exercises TemplateRenderer and SlotRenderer, not TemplateLayoutRenderer:
TemplateLayout renders a source template, whereas these elements compose UI models.
