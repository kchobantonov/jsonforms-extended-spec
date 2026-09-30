# Recruitment: row detail presentations

One applicant collection with dialog, side panel, and bottom panel details, each shown with a normal table and AG Grid. Both use `options.rowDetail.detail`, an item-relative UI schema for the whole row.

The table shows Name, Email, Contact (an object), and Experience (an array of objects). Notes is available only in the row editor. Portable `columnDefs` selects and sizes these columns.

Every row editor has three tabs:
- **Applicant** edits name, email, and notes.
- **Contact** renders the contact object with a horizontal City/Phone layout.
- **Experience** uses `ListWithDetail`: select a company on the left and edit its company, role, and years on the right.

The Experience cell editor deliberately uses a plain `Control` at scope `#`, so it selects the default array renderer. It does not inherit the row editor's `ListWithDetail`. The Contact cell summarizes the city and uses its default object editor. This demonstrates that `cells[field].detail` and `rowDetail.detail` can present the same data differently.

Dialog edits are staged until Apply; panels edit immediately. Row detail selection is separate from deletion checkboxes and follows the original data row when the grid is sorted or filtered.

All presentations share pagination defaults. Explicit `agGridOptions.columnDefs` or native pagination settings override their portable equivalents. Name requests 170px and Email demonstrates minimum and maximum widths.

See docs/spec.md §18.21.1.

Cell dialogs request 720px width; row dialogs request 900px by 75vh. Both enable dragging and resizing, with maximize/restore available in the header.

## Label summaries and row context

All normal-table and AG Grid presentations include an Applicant summary column
bound to the whole row with `columnDefs[].scope: "#"`. Its `field` is a stable
column key, not a new schema property. Its Label summary interpolates
`{name} — {email}` through declared textParams and has no edit action because no detail is supplied.
The Contact column uses a Label summary with `{city} · {phone}` through declared textParams against
`item.contact.city` and `item.contact.phone`, and retains its explicit detail editor and validation marker.
Applicant parameters use `item.name` and `item.email`; `data` still denotes the whole form.
The dynamicValues gate must be enabled to access either namespace. Label summaries do not display object/array type icons.
These examples require the existing Label interpolation renderer capability.

## Checks to try

- In an AG Grid presentation, filter Contact with Contains `Boston`, then
  `555-0100`: both search the resolved summary text.
- Sort Applicant summary or Contact in either direction. Editing still opens
  the original row even after sorting, filtering or changing pages.
- Resize a long summary column smaller: its text should truncate without forcing
  unrelated columns wider. Scroll the table when its combined widths overflow.
- Change a row value and verify its Label updates. `item` always means the current
  source row; `data` continues to provide the whole form.
- Turn off dynamic values: row/root expressions must not expose their values
  through rendering, sorting or filtering.
