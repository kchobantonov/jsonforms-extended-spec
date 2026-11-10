import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';
import { validators } from '../scripts/validation.mjs';
import { createPreviewUiSchema } from '../examples/dynamic-playground/host.mjs';

const root = new URL('../', import.meta.url).pathname;
const fixture = new URL('../examples/dynamic-playground/', import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(name, fixture), 'utf8'));

test('playground ordinary forms and derived presentations satisfy published authoring contracts', async () => {
  const checks = await validators(root);
  const ajv = new Ajv({ strict: false });
  const configuration = await read('configuration.json');
  const preview = { schema: await read('schema.json'), data: await read('data.json'), uischema: await read('uischema.json') };
  for (const form of [preview, configuration]) {
    const schema = form.schema;
    assert.ok(ajv.validateSchema(schema));
    const validateData = ajv.compile(schema);
    assert.ok(validateData(form.data), JSON.stringify(validateData.errors));
    const validateUi = checks['jsonforms-extended-uischema.schema.json'];
    assert.ok(validateUi(form.uischema), JSON.stringify(validateUi.errors));
  }
  const derive = createPreviewUiSchema(await read('uischema.json'));
  const settings = (await read('configuration.json')).data;
  for (const presentation of ['automatic', 'radio']) {
    const validateUi = checks['jsonforms-extended-uischema.schema.json'];
    assert.ok(validateUi(derive({ ...settings, presentation })), JSON.stringify(validateUi.errors));
  }
  // Both the portable static version and the opt-in dynamic version are catalogued.
  const catalog = JSON.parse(await readFile(new URL('../examples/catalog.json', import.meta.url), 'utf8'));
  const entry = catalog.find(entry => entry.id === 'dynamic-playground');
  assert.ok(entry.hostRequirements.length);
  assert.ok(entry.files.includes('configuration.json'));
  assert.ok(entry.files.includes('dynamic-uischema.json'));
  const { examples } = await import('../examples/index.js');
  const exported = examples.find(entry => entry.id === 'dynamic-playground');
  assert.deepEqual(exported.configuration, configuration);
  assert.deepEqual(exported.uischema, preview.uischema);
  assert.deepEqual(exported['dynamic-uischema'], await read('dynamic-uischema.json'));
  assert.ok(exported['dynamic-uischema'].elements[1].$dynamic);
  const validateDynamic = checks['jsonforms-dynamic-uischema.schema.json'];
  assert.ok(validateDynamic(exported['dynamic-uischema']), JSON.stringify(validateDynamic.errors));
  const escaped = structuredClone(exported['dynamic-uischema']);
  escaped.elements[1].$dynamic = {
    options: {
      custom: { literal: { bind: 'ordinary data' } },
      metadata: { bind: 'ordinary data', other: true },
      customLiteralField: { literal: 'data', extra: 1 },
      literalOptions: { literal: 'data', theme: 'x' },
    },
  };
  assert.ok(validateDynamic(escaped), JSON.stringify(validateDynamic.errors));
  for (const invalid of [
    { overlay: { label: { bind: 4 } } },
    { when: 'yes', overlay: { label: 'Choice' } },
    { overlay: { $dynamic: { label: 'recursive' } } },
    { overlay: { elements: [{ type: 'Control', scope: '#', $dynamic: [{ when: 17, overlay: {} }] }] } },
    { overlay: { options: { detail: { type: 'Control', scope: '#', $dynamic: [{ when: 17, overlay: {} }] } } } },
  ]) {
    const candidate = structuredClone(exported['dynamic-uischema']);
    candidate.elements[1].$dynamic = [invalid];
    assert.equal(validateDynamic(candidate), false);
  }
});

test('host playground round trip retains unrelated UI identity and restores static fallback', async () => {
  const authored = await read('uischema.json');
  const original = structuredClone(authored);
  const derive = createPreviewUiSchema(authored);
  const settings = (await read('configuration.json')).data;
  const automatic = derive(settings);
  const radio = derive({ ...settings, presentation: 'radio' });
  assert.equal(radio.elements[1].options.format, 'radio');
  assert.equal(radio.elements[0], authored.elements[0]);
  assert.strictEqual(derive({ ...settings, presentation: 'radio' }), radio);
  const restored = derive(settings);
  assert.deepEqual(restored, automatic);
  assert.ok(!Object.hasOwn(restored.elements[1].options, 'format'));
  assert.equal(derive({ label: '', readonly: false }).elements[1].i18n, 'dynamicPlayground.plan');
  assert.deepEqual(derive({ label: null, readonly: null }), authored);
  assert.deepEqual(authored, original);
});

test('dynamic examples carry matching localized catalogs and select status keys', async () => {
  for (const name of ['dynamic-playground']) {
    const translations = JSON.parse(await readFile(new URL(`../examples/${name}/translations.json`, import.meta.url), 'utf8'));
    assert.ok(Object.keys(translations.en).length > 0);
    assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations.bg).sort());
    const firstKey = Object.keys(translations.en)[0];
    assert.notEqual(translations.bg[firstKey], translations.en[firstKey]);
  }
  const advanced = JSON.parse(await readFile(new URL('../examples/dynamic-playground/dynamic-uischema.json', import.meta.url), 'utf8'));
  const status = advanced.elements.find(element => element.i18n === 'dynamicAdvanced.status.noErrors');
  assert.match(status.$dynamic.i18n.expression, /dynamicAdvanced\.status\.hasErrors/);
});


test('advanced configuration bindings use visible Label properties and localized status messages', async () => {
  const ui = JSON.parse(await readFile(new URL('../examples/dynamic-playground/dynamic-uischema.json', import.meta.url), 'utf8'));
  const translations = JSON.parse(await readFile(new URL('../examples/dynamic-playground/translations.json', import.meta.url), 'utf8'));
  assert.equal(JSON.stringify(ui).includes('exampleStatus'), false);
  const status = ui.elements.find(element => element.i18n === 'dynamicAdvanced.restrictions.unspecified');
  assert.match(status.$dynamic[0].overlay.i18n.expression, /config\.restrict/);
  const members = ui.elements.find(element => element.scope === '#/properties/members');
  const path = members.$dynamic[1].overlay.options.detail.literal.elements.find(element => element.i18n === 'dynamicAdvanced.pathValue');
  assert.equal(path.$dynamic.text.bind, 'path');
  for (const locale of ['en', 'bg']) {
    for (const key of ['restrictions.enabled', 'restrictions.disabled', 'rendererPath']) {
      assert.ok(translations[locale][`dynamicAdvanced.${key}.text`]);
    }
  }
});

test('host preview text is the fallback under loaded catalogs', async () => {
  const ui = createPreviewUiSchema(await read('uischema.json'))({ label: 'My plan' });
  const catalog = (await read('translations.json')).en;
  const control = ui.elements[1];
  assert.equal(catalog[`${control.i18n}.label`] ?? control.label, 'My plan');
  assert.notEqual(control.i18n, '');
});

test('host-supplied dynamic text uses explicit untranslated prefixes', async () => {
  const catalogs = await read('translations.json');
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'Label' && value.$dynamic?.text?.bind || value.type === 'Label' && value.$dynamic?.text?.template) {
      assert.ok(value.i18n);
      for (const catalog of Object.values(catalogs)) assert.equal(catalog[`${value.i18n}.text`], undefined);
    }
    for (const child of Object.values(value)) visit(child);
  }
  visit(await read('dynamic-uischema.json'));
});

test('literal payloads validate nested UI metadata without treating ordinary payload data as descriptors', async () => {
  const validate = (await validators(root))['jsonforms-dynamic-uischema.schema.json'];
  const child = { type: 'Control', scope: '#', $dynamic: [{ when: 17 }] };
  for (const detail of [child, { literal: child }, { literal: { type: 'VerticalLayout', elements: [child] } }]) {
    const ui = { type: 'Control', scope: '#', $dynamic: { options: { detail } } };
    assert.equal(validate(ui), false);
  }
  const data = { bind: 17, $dynamic: [{ when: 17 }] };
  assert.equal(validate({ type: 'Control', scope: '#', $dynamic: { options: { custom: { literal: data } } } }), true);
});

test('default Plan uses catalogs while a supplied label overrides them and clearing restores localization', async () => {
  const derive = createPreviewUiSchema(await read('uischema.json'));
  const catalog = (await read('translations.json')).bg;
  for (const [label, expected] of [['', 'План'], ['Custom plan', 'Custom plan'], ['Plan', 'Plan'], ['', 'План']]) {
    const plan = derive({label}).elements[1];
    assert.equal(catalog[`${plan.i18n}.label`] ?? plan.label, expected);
  }
});

test('independent host text roles use independent prefixes', async () => {
  const found = new Map();
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'Label' && value.$dynamic?.text) {
      const source = value.$dynamic.text.bind ?? value.$dynamic.text.template;
      if (source) {
        if (found.has(source)) assert.equal(found.get(source), value.i18n);
        found.set(source, value.i18n);
      }
    }
    for (const child of Object.values(value)) visit(child);
  }
  visit(await read('dynamic-uischema.json'));
  assert.equal(new Set(found.values()).size, found.size);
  assert.ok(found.has('{item.name}'));
  assert.ok(found.has('{data.name}'));
  assert.ok(found.has('locale'));
});

test('dynamic activation is portable JSON while function trust is not', async () => {
  const checks = await validators(root);
  const validate = checks['jsonforms-extended-config.schema.json'];
  for (const enabled of [false, true]) {
    assert.ok(validate({jsonformsExtended: {dynamic: {enabled}}}));
  }
  for (const trusted of [true, false, null, 'TRUST_DYNAMIC_FUNCTIONS', {}, []]) {
    assert.equal(validate({jsonformsExtended: {dynamic: {enabled: true, trusted}}}), false);
  }
  assert.equal((await read('config.json')).jsonformsExtended.dynamic.enabled, true);
});
