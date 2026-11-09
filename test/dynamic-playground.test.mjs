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
  assert.equal(derive({ label: '', readonly: false }).elements[1].label, '');
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
  const status = ui.elements.find(element => element.i18n === 'dynamicAdvanced.restrictions.enabled');
  assert.match(status.$dynamic.i18n.expression, /config\.restrict/);
  const path = ui.elements.find(element => element.text === '/');
  assert.equal(path.$dynamic.text.expression, "path == '' ? '/' : path");
  for (const locale of ['en', 'bg']) {
    for (const key of ['restrictions.enabled', 'restrictions.disabled', 'rendererPath']) {
      assert.ok(translations[locale][`dynamicAdvanced.${key}.text`]);
    }
  }
});
