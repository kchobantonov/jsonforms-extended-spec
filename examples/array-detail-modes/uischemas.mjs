// Trusted host code. The fallback collection deliberately has no match.
export const uischemas = [{
  tester: (schema, schemaPath) =>
    schema?.properties?.name && schemaPath !== '#/properties/fallback' ? 10 : -1,
  uischema: { type: 'Control', scope: '#/properties/name', label: 'Registered name' }
}];
