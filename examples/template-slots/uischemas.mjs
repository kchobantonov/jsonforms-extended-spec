// Named lookup ignores testers. Keep these entries out of ranked detail selection.
const templates = [
  {
    "type": "Group",
    "name": "contact-card",
    "label": "Reusable contact",
    "elements": [
      {
        "type": "Slot",
        "name": "heading",
        "elements": [
          {
            "type": "Label",
            "text": "Default heading"
          }
        ]
      },
      {
        "type": "Slot",
        "name": "body",
        "elements": [
          {
            "type": "Control",
            "scope": "#/properties/name",
            "label": "Default name"
          }
        ]
      },
      {
        "type": "Slot",
        "name": "optional"
      }
    ]
  },
  {
    "type": "Group",
    "name": "nested-card",
    "label": "Nested composition",
    "elements": [
      {
        "type": "Template",
        "name": "contact-card",
        "elements": [
          {
            "type": "Label",
            "name": "heading",
            "text": "Local heading overrides inherited heading"
          }
        ]
      }
    ]
  }
];
export const uischemas = templates.map(uischema => ({ tester: () => -1, uischema }));
