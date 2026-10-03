export const uischemas = [{
  tester: schema => schema?.properties?.name ? 10 : -1,
  uischema: {type: 'Control', scope: '#/properties/name', label: 'Registered name'}
}];
