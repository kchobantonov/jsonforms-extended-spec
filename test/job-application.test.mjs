import test from 'node:test';
import assert from 'node:assert/strict';
import { examples } from '../examples/index.js';

test('job application includes every named template in its portable registry', () => {
  const job = examples.find((example) => example.id === 'job-application');
  assert.ok(job);
  const requested = [];
  const walk = (node) => {
    if (node?.type === 'Template') requested.push(node.name);
    for (const child of node?.elements ?? []) walk(child);
  };
  walk(job.uischema);
  const registered = job.uischemas.map((entry) => entry.uischema.name);
  assert.ok(job.uischemas.every((entry) => entry.tester() === -1));
  assert.deepEqual(registered.sort(), requested.sort());
  const applicant = job.uischemas.find((entry) => entry.uischema.name === 'applicant').uischema;
  assert.equal(applicant.options.wrap, true);
  assert.deepEqual(applicant.elements.map((element) => element.options.layout.weight), [1, 3]);
  assert.deepEqual(applicant.elements.map((element) => element.options.layout.minWidth), [220, 420]);
  assert.ok(
    job.uischemas.some((entry) =>
      entry.uischema.elements?.some((child) => child.type === 'VerticalLayout' &&
        child.elements?.some((image) => image.type === 'ImageView' &&
          image.scope === '#/properties/applicant/properties/profilePicture')),
    ),
  );
});

test('job application UI labels and visible fields have both translations', () => {
  const job = examples.find((example) => example.id === 'job-application');
  assert.ok(job);
  const keys = new Set();
  const walkUi = (node) => {
    if (!node || typeof node !== 'object') return;
    for (const [field, value] of Object.entries(node)) {
      if ((field === 'label' || field === 'i18n' || field === 'text') &&
          typeof value === 'string' && value.startsWith('static-text.')) {
        keys.add(field === 'i18n' ? `${value}.label` : value);
      }
      if (typeof value === 'object') {
        for (const item of Array.isArray(value) ? value : [value]) walkUi(item);
      }
    }
  };
  walkUi(job.uischema);
  keys.add('Job Application');
  for (const entry of job.uischemas) walkUi(entry.uischema);
  const walkFields = (schema, path = '') => {
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      const field = path ? `${path}.${name}` : name;
      if (field !== 'now') keys.add(`${field}.label`);
      walkFields(property, field);
    }
    if (schema.items && !Array.isArray(schema.items)) walkFields(schema.items, path);
  };
  walkFields(job.schema);
  const lookup = (catalog, key) => {
    if (Object.hasOwn(catalog, key)) return catalog[key];
    return key.split('.').reduce((value, part) => value?.[part], catalog);
  };
  for (const locale of ['en', 'bg']) {
    for (const key of keys) {
      assert.equal(typeof lookup(job.translations[locale], key), 'string', `${locale}: ${key}`);
    }
  }
});
