# $dynamic playground preview

The maintained [two-form playground](../../../examples/dynamic-playground/README.md)
lives under `examples/`. Its catalog entry exports both the ordinary
`uischema.json` for hosts using `host.mjs` and
[`dynamic-uischema.json`](../../../examples/dynamic-playground/dynamic-uischema.json)
for hosts supporting `$dynamic`. This proposal copy of the descriptor predates
the combined catalog asset and records only the original basic rules.

Use the example's preview schema/data and configuration bundle; expose settings
as `external.settings` when using the dynamic UI schema. Do not also apply the
host mapper. The Svelte and React demo adapters mount both forms and implement this
experimental path. The experimental descriptor schema and TypeScript helpers
are available. Cross-adapter conformance and lifecycle coverage
are tracked in [spec §11](../../spec.md#11-dynamic-values-and-path-grammar).
