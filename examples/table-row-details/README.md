# Recruitment: row detail presentations

One applicant collection with dialog, side panel, and bottom panel details, each shown with a normal table and AG Grid. Both use `options.rowDetail`; its `detail` property accepts an item-relative UI schema for the whole row.

Dialog uses an explicit form and Apply/Cancel. Panels exercise registry/generated details and immediate edits.

The summary shows Name and Email; Notes remains available in the full row editor. Both use portable `columnDefs` and the same pagination defaults; only the renderer selection changes. Explicit `agGridOptions.columnDefs` or native pagination settings override their portable equivalents. Name requests 170px and Email demonstrates minimum and maximum widths.

Row detail selection is separate from deletion checkboxes and follows the original data row when the grid is sorted or filtered. Per-cell `cells[field].summary` and `cells[field].detail` remain independent of the whole-row form.

See docs/spec.md §18.21.1.
