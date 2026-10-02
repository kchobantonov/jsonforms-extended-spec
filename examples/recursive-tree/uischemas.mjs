// Trusted host registrations: branch layouts apply at every recursive depth.
export const uischemas = [
  {
    tester: (schema) => schema?.properties?.kind?.const === 'file' ? 10 : -1,
    uischema: {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/name' },
        { type: 'Control', scope: '#/properties/content' },
      ],
    },
  },
  {
    tester: (schema) => schema?.properties?.kind?.const === 'folder' ? 10 : -1,
    uischema: {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/name' },
        {
          type: 'Control',
          scope: '#/properties/children',
          options: {
            collapsible: true,
            detail: {
              type: 'Control',
              scope: '#',
              label: 'Kind',
              i18n: 'tree.kind',
            },
          },
        },
      ],
    },
  },
];
