import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { examples } from '../examples/index.js';

const registry = (id) => examples.find((example) => example.id === id)?.uischemas;

test('portable match descriptors preserve ranked detail selection', () => {
  const cases = [
    ['array-detail-modes', 0, { properties: { name: {} } }, '#', 10],
    ['array-detail-modes', 0, { properties: { name: {} } }, '#/properties/fallback', -1],
    ['choice-controls', 0, { properties: { address: { format: 'email' } } }, '#/properties/cardContact', 10],
    ['choice-controls', 0, { properties: { address: { format: 'email' } } }, '#/properties/other', -1],
    ['editor-details', 0, { properties: { name: {} } }, '#', 10],
    ['object-control', 0, { title: 'Address' }, '#', 10],
    ['object-control', 1, { title: 'Handover' }, '#', 10],
    ['recursive-tree', 0, { properties: { kind: { const: 'file' } } }, '#', 10],
    ['recursive-tree', 1, { properties: { kind: { const: 'folder' } } }, '#', 10],
    ['tree-max-depth', 0, { properties: { kind: { const: 'file' } } }, '#', 10],
    ['tree-max-depth', 1, { properties: { kind: { const: 'folder' } } }, '#', 10],
    ['tuple-control', 0, { title: 'Both' }, '#', 10],
    ['tuple-control', 4, { title: 'Phone numbers' }, '#', 10],
  ];
  for (const [id, index, schema, schemaPath, expected] of cases) {
    assert.equal(registry(id)?.[index].tester(schema, schemaPath), expected, `${id}/${index}`);
  }
  for (const id of ['job-application', 'template-slots']) {
    assert.ok(registry(id)?.every((entry) => entry.tester({ title: 'Any' }, '#') === -1));
  }
});

test('every source UI-schema registry is JSON', async () => {
  const root = new URL('../examples/', import.meta.url);
  const catalog = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'));
  for (const example of catalog) {
    const files = await readdir(new URL(`${example.id}/`, root));
    assert.ok(
      files.every((file) => !/^uischemas\.(?:mjs|js|ts|tsx)$/.test(file)),
      `${example.id}: UI-schema registry must be portable JSON`,
    );
    assert.equal(
      example.files.includes('uischemas.json'),
      files.includes('uischemas.json'),
      `${example.id}: catalog must list the JSON registry`,
    );
  }
});
