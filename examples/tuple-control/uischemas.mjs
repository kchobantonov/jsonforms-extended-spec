// Trusted host registration. No string compilation or UI-library dependency.
export const uischemas = [
    {
        tester: (schema) => (schema?.title === 'Both' ? 10 : -1),
        uischema: {
            type: 'Control',
            scope: '#',
            options: {
                summary: { type: 'Control', scope: '#/properties/name' },
                detail: {
                    type: 'VerticalLayout',
                    elements: [
                        { type: 'Control', scope: '#/properties/desk' },
                        { type: 'Control', scope: '#/properties/name' },
                    ],
                },
            },
        },
    },
    {
        tester: (schema) => (schema?.title === 'DetailOnly' ? 10 : -1),
        uischema: {
            type: 'Control',
            scope: '#',
            options: {
                detail: {
                    type: 'VerticalLayout',
                    elements: [{ type: 'Control', scope: '#/properties/desk' }],
                },
            },
        },
    },
    {
        tester: (schema) => (schema?.title === 'LayoutEntry' ? 10 : -1),
        uischema: {
            type: 'HorizontalLayout',
            elements: [
                { type: 'Control', scope: '#/properties/name' },
                { type: 'Control', scope: '#/properties/desk' },
            ],
        },
    },
    {
        tester: (schema) => (schema?.title === 'Address' ? 10 : -1),
        uischema: {
            type: 'Control',
            scope: '#',
            options: {
                summary: { type: 'Control', scope: '#/properties/street' },
                detail: {
                    type: 'VerticalLayout',
                    elements: [
                        { type: 'Control', scope: '#/properties/street' },
                        { type: 'Control', scope: '#/properties/city' },
                    ],
                },
            },
        },
    },
    {
        tester: (schema) => (schema?.title === 'Phone numbers' ? 10 : -1),
        uischema: {
            type: 'Control',
            scope: '#',
            options: {
                summary: { type: 'Control', scope: '#' },
                detail: { type: 'Control', scope: '#' },
            },
        },
    },
];
