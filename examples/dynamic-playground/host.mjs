// Ordinary UI-schema alternative for this fixture only; not a $dynamic resolver.
// Call once per mounted preview. Pass immutable authored UI and settings snapshots.
export function createPreviewUiSchema(authored) {
  let previous = authored;
  let previousLabel;
  let previousCustomLabel;
  let previousReadonly;
  let previousRadio;
  let previousCompact;
  let initialized = false;
  return (settings) => {
    const base = authored.elements[1];
    const customLabel = typeof settings?.label === 'string' && settings.label.length > 0;
    const label = customLabel ? settings.label : base.label;
    const readonly = typeof settings?.readonly === 'boolean' ? settings.readonly : undefined;
    const radio = settings?.presentation === 'radio';
    const compact = settings?.compact === true;
    if (initialized && customLabel === previousCustomLabel && label === previousLabel && readonly === previousReadonly && radio === previousRadio && compact === previousCompact) return previous;
    const options = { ...base.options };
    if (readonly !== undefined) options.readonly = readonly;
    if (radio) options.format = 'radio';
    const control = { ...base, label, i18n: customLabel ? 'dynamicPlayground.boundPlanText' : base.i18n };
    if (Object.keys(options).length) control.options = options;
    previous = {
      ...authored,
      options: { ...authored.options, gap: compact ? 8 : 24 },
      elements: authored.elements.map((element, index) => index === 1 ? control : element),
    };
    previousLabel = label;
    previousCustomLabel = customLabel;
    previousReadonly = readonly;
    previousRadio = radio;
    previousCompact = compact;
    initialized = true;
    return previous;
  };
}
