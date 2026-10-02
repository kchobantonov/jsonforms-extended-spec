# JSON inference: paste data without a schema

No schema or initial data is supplied. Paste valid JSON into the Data editor, then click Apply data changes to generate a form from its inferred schema. Try an object, array, string, number, boolean, or null. The Schema tab stays blank: inference happens in JSON Forms.

## Try it

1. Open **Spec: JSON inference: paste data without a schema** (`#spec-json-inference`).
2. Paste this into the demo's Monaco **Data** editor and click **Apply data changes**:

```json
{"name":"Sample","active":true,"count":2,"tags":["one","two"],"address":{"city":"Portland"},"note":null}
```

3. Edit the resulting form and observe the Data editor.
4. Replace the entire Data document with `[1, "two", false, null]`, a scalar, or `null` and apply again.

This fixture deliberately omits both `schema.json` and `data.json`. The host must preserve their absence instead of substituting `{}` or `null`. JSON Forms generates a schema from the applied data, then dispatches the root control against that schema. The Schema editor remains blank; the inferred schema is not written back as an authored schema. Inference reflects the sample, not a complete business contract, and heterogeneous arrays depend on the core generator’s inference behavior.

## Compare the modes

An explicit `{}` schema permits arbitrary JSON and enables mixed type selection.
An omitted schema requests inference from data. To switch an existing demo to
inference, clear the Schema editor and apply that blank value. To return to the
generic editor, enter `{}` in Schema and apply. Clearing Data returns to an
absent value; entering `null` selects the JSON null value.

The host must register mixed-value and null controls; renderer coverage can differ. The Data editor requires Monaco and a host action to apply valid JSON;
malformed JSON must not replace the current form data.

### React demo adapter

The React demos use core's schema generator on a wrapped value and extract its property schema, because the generator assumes an object root. This supports every JSON root type. While data is absent, an unrestricted runtime schema keeps the form usable. These runtime schemas are never saved into the blank Schema editor.


### Temporary inference workaround — upstream #2478

Track [JSON Forms PR #2478](https://github.com/eclipsesource/jsonforms/pull/2478),
which includes non-object root inference and regeneration when data changes.
The React demo adapter (`demoSchema.ts`, called from `App.tsx`) is temporary for
the installed 3.9.0-alpha.1 dependency. Remove it after upgrading to a released
version containing the fix, not merely after the PR merges. First verify absent
data, explicit null, every scalar type, arrays, objects, and replacement of data
with a different root type. Then pass the omitted schema directly to JSON Forms
and retain the example regressions against that upstream path. The Monaco
stale-schema cleanup is separate and should remain.
