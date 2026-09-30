# AG Grid: portable options and native overrides

Twelve applicants demonstrate the same portable collection options in normal tables and AG Grid.

| Tab | What to try |
| --- | --- |
| Normal table / AG Grid: portable | Compare identical columns, three rows per page from portable options, and the same custom row form. Only renderer selection differs. |
| Side panel | Select a row, edit immediately, resize the divider, and hide/reopen details. Deletion checkboxes are independent. |
| Bottom panel | Start collapsed and use Edit details to reveal the bottom pane. |
| Local pagination | Six rows per page override the config's three. |
| Native overrides win | Grouped columns reorder Email before Name; experience starts sorted descending. Two rows per page override portable six. |
| Native pagination off | Explicit native false displays all twelve rows. |

`options.columnDefs` controls portable column order and widths. Explicit `agGridOptions.columnDefs` replaces that list as a whole and supports native grouping, sorting and filtering settings. Native pagination properties override their corresponding portable settings individually.

`options.rowDetail.detail` specifies the whole applicant form, including Notes, which is omitted from the columns. Dialog edits use Apply/Cancel; panel edits update immediately. Sort or filter the grid and verify details still target the selected applicant.

`options.cells.contact.summary` displays the city; `options.cells.contact.detail` edits city and phone in a separate cell dialog. These remain independent of whole-row details.

The fixtures use JSON configuration only and require no host callbacks. See docs/spec.md §18.21.1.

## Portable settings versus native overrides

An AG Grid control accepts the portable settings directly:

```json
{
  "type": "Control",
  "scope": "#/properties/applicants",
  "options": {
    "variant": "ag-grid",
    "pagination": { "pageSize": 6, "pageSizeOptions": [6, 12] },
    "columnDefs": [
      { "field": "name", "width": 180 },
      { "field": "email", "width": 240 }
    ]
  }
}
```

This shows six applicants per page, with Name before Email. To override those
settings, keep them and add this object inside `options`:

```json
{
  "agGridOptions": {
    "paginationPageSize": 2,
    "paginationPageSizeSelector": [2, 4, 12],
    "columnDefs": [
      { "field": "email", "width": 260 },
      { "field": "name", "width": 190, "sort": "asc" }
    ]
  }
}
```

The result is **two applicants per page, Email before Name, and native widths**.
The native list replaces the entire portable column list. The runnable
**Native overrides win** tab also demonstrates native grouped headers.
`agGridOptions.pagination: false` overrides portable `pagination: true`, as shown
in **Native pagination off**. Unspecified native pagination settings retain their
portable values. Neither override changes `options.rowDetail` or per-cell details.
