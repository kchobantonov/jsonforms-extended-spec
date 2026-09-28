/** Supply a precompiled template from the host's native rendering system.
 * The portable package does not import a framework or create a native view.
 * The host owns URL-policy enforcement and guarded writes from its template.
 */
export function nativeTemplateCategory(template) {
  if (typeof template !== 'function') throw new TypeError('This JavaScript example expects a trusted template function.');
  return {
    type: 'Category', name: 'native', label: 'Native template',
    elements: [{ type: 'TemplateLayout', template,
      elements: [{ type: 'Control', scope: '#/properties/nativeNote', name: 'nativeNote' }]
    }]
  };
}
