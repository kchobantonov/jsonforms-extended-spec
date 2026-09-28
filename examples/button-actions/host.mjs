/** Trusted, UI-library-independent native function demonstrations.
 * Append this category to the fixture's Categorization in a JavaScript host.
 * JSON.stringify cannot preserve these functions; do not serialize this model.
 */
export function nativeButtonCategory(log) {
  return {
    type: 'Category', name: 'native', label: 'Native functions',
    elements: [
      { type: 'Button', label: 'Arrow function', params: { tier: 'express' }, script: event => log(event.params) },
      { type: 'Button', label: 'Classic function', params: { tier: 'standard' }, script: function () { log(this.params); } },
      { type: 'Button', label: 'Async function', script: async event => { await log(event.params); } }
    ]
  };
}
