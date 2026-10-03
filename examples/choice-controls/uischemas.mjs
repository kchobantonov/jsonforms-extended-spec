// Trusted host code. Scope the layout to this example's contact branch.
// Postal mail deliberately has no match, so REGISTERED falls back to generation.
export const uischemas = [{
  tester: (schema, schemaPath) =>
    schemaPath === '#/properties/cardContact' && schema?.properties?.address?.format === 'email' ? 10 : -1,
  uischema: {
    type: 'Control',
    scope: '#/properties/address',
    label: 'Registered email address',
    i18n: 'cards.registeredAddress'
  }
}];
