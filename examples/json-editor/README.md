# JSON editor: any JSON type

Start with an empty value. Choose any JSON type, or paste JSON into the Data editor and click Apply data changes. The explicit empty schema allows every JSON value. Clear the Schema editor and apply it to try inference instead.

## Try it

1. Open **Spec: JSON editor: any JSON type** (`#spec-json-editor`).
2. Paste this into the demo's Monaco **Data** editor and click **Apply data changes**:

```json
{"name":"Sample","active":true,"count":2,"tags":["one","two"],"address":{"city":"Portland"},"note":null}
```

3. Edit the resulting form and observe the Data editor.
4. Replace the entire Data document with `[1, "two", false, null]`, a scalar, or `null` and apply again.

The fixture has an explicit `schema.json` containing `{}` and deliberately omits `data.json`. Absence is different from JSON null: the initial type selector is unselected. All types remain available regardless of the current data. Structured values use the mixed renderer’s default tree presentation.

## Compare the modes

An explicit `{}` schema permits arbitrary JSON and enables mixed type selection.
An omitted schema requests inference from data. To switch an existing demo to
inference, clear the Schema editor and apply that blank value. To return to the
generic editor, enter `{}` in Schema and apply. Clearing Data returns to an
absent value; entering `null` selects the JSON null value.

The host must register mixed-value and null controls; renderer coverage can differ. The Data editor requires Monaco and a host action to apply valid JSON;
malformed JSON must not replace the current form data.
