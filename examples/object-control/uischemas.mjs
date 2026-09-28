// Trusted host registration. No string compilation or UI-library dependency.
export const uischemas = [
    {
        tester: (schema) => (schema?.title === 'Address' ? 10 : -1),
        uischema: {
            type: 'VerticalLayout',
            elements: [
                {
                    type: 'HorizontalLayout',
                    elements: [
                        { type: 'Control', scope: '#/properties/line1' },
                        { type: 'Control', scope: '#/properties/postcode' },
                    ],
                },
                { type: 'Control', scope: '#/properties/city' },
                { type: 'Control', scope: '#/properties/geo' },
            ],
        },
    },
    {
        tester: (schema) => (schema?.title === 'Handover' ? 10 : -1),
        uischema: {
            type: 'VerticalLayout',
            elements: [
                { type: 'Control', scope: '#/properties/gateCode' },
                { type: 'Control', scope: '#/properties/window' },
                { type: 'Control', scope: '#/properties/contactName' },
            ],
        },
    },
];
