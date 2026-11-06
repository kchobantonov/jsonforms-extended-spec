import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { validators, readJson, validateProject, dataSchemaValidator } from '../scripts/validation.mjs';
import { examples } from '../examples/index.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const checks = await validators(root);
for (const vector of await readJson(join(root,'conformance/authoring.json'))) {
  test(vector.id, () => {
    const before = structuredClone(vector.value);
    const check = checks[vector.schema];
    assert.equal(check(vector.value), vector.valid, JSON.stringify(check.errors));
    assert.deepEqual(vector.value, before, 'Authoring validation must not modify a document');
  });
}
test('all example documents and declared negative cases', async () => {
  assert.equal((await validateProject(root)).examples, (await readJson(join(root, 'examples/catalog.json'))).length);
});
test('catalog includes every example directory exactly once', async () => {
  const entries = await readdir(join(root,'examples'),{withFileTypes:true});
  const catalog = await readJson(join(root,'examples/catalog.json'));
  assert.deepEqual(catalog.map(x=>x.id).sort(),entries.filter(x=>x.isDirectory()).map(x=>x.name).sort());
  assert.equal(new Set(catalog.map(x=>x.id)).size,catalog.length);
});
test('portable JSON registries hydrate pure testers for JavaScript hosts', async () => {
  for (const example of examples.filter(entry => entry.uischemas)) {
    const portable = await readJson(join(root, 'examples', example.id, 'uischemas.json'));
    assert.deepEqual(example.uischemas.map(({ tester: _tester, ...entry }) => entry), portable);
    for (const entry of example.uischemas) {
      assert.equal(typeof entry.tester, 'function');
      assert.equal(entry.tester({ title: 'unrelated' }, '#', ''), -1);
      assert.ok(checks['jsonforms-extended-uischema.schema.json'](entry.uischema));
    }
  }
});
test('behavior vectors are identified separately from executed authoring tests', async () => {
  const vectors = await readJson(join(root,'conformance/behavior.json'));
  assert.equal(new Set(vectors.map(x=>x.id)).size,vectors.length);
  for (const v of vectors) { assert.ok(v.section); assert.ok(v.input); assert.ok(v.expected); }
});
test('spec and walkthroughs stay independent of component libraries', async () => {
  const catalog = await readJson(join(root,'examples/catalog.json'));
  for (const path of ['docs/spec.md',...catalog.map(x=>`examples/${x.id}/README.md`)]) {
    const text = await readFile(join(root,path),'utf8');
    assert.doesNotMatch(text,/\b(?:antd|primereact|shadcn|mui|vuetify|svelte|vue)\b/i,path);
  }
});

test('published schemas do not advertise unimplemented options', async () => {
  // The per-type detail overrides were promoted: the editor-details example
  // authors them and the renderers read them, so they belong in the published
  // schemas and no longer belong on this list.
  const absent = new Set(['$dynamic', 'showRemoveButton', 'removeLabel',
    'showClearButton', 'timezone', 'saveTimezone',
    'showTimezoneSelector', 'timezoneChangeMode', 'allowHtml', 'allowImages']);
  function inspect(node) {
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node.properties ?? {})) assert.ok(!absent.has(key), `Unsupported schema option: ${key}`);
    if (node.properties?.span && node.properties?.weight) {
      assert.ok(!('start' in node.properties));
      assert.ok(!('responsive' in node.properties));
    }
    for (const child of Object.values(node)) inspect(child);
  }
  for (const name of await readdir(join(root, 'schemas'))) if (name.endsWith('.json')) {
    const schema = await readJson(join(root, 'schemas', name)); inspect(schema);
    for (const name of ['dynamicLeaf','dynamicNode','dynamicOverlay']) assert.ok(!schema.$defs?.[name]);
  }
  assert.ok(checks['jsonforms-extended-config.schema.json']({jsonformsExtended:{dynamicValues:{enabled:true}}}));
  assert.equal(checks['jsonforms-extended-config.schema.json']({jsonformsExtended:{dynamicValues:{enabled:'yes'}}}),false);
});

test('example data schemas use the standard meta-schema, without redefining extension keywords', () => {
  assert.equal(dataSchemaValidator({type:'object', properties:{name:{type:'string', minLength:-1}}}), false);
  assert.equal(dataSchemaValidator({type:'string', transform:['hostDefinedTransform']}), true);
});

test('every declared config path has a consumption audit and removed paths stay undeclared', async () => {
  const documents = new Map();
  for (const name of await readdir(join(root, 'schemas'))) if (name.endsWith('.json')) {
    documents.set(name, await readJson(join(root, 'schemas', name)));
  }
  const declared = new Set();
  function inspect(node, file, path, seen = new Set()) {
    if (!node || typeof node !== 'object') return;
    if (node.$ref) {
      const [target, fragment = ''] = node.$ref.split('#');
      const targetFile = target || file;
      // Every schema referenced from a config property contributes its declared
      // members, including shared UI-schema definitions used by config bags.
      if (documents.has(targetFile)) {
        const id = `${targetFile}#${fragment}:${path}`;
        if (!seen.has(id)) {
          let value = documents.get(targetFile);
          for (const part of fragment.split('/').slice(1)) value = value[part.replaceAll('~1', '/').replaceAll('~0', '~')];
          inspect(value, targetFile, path, new Set([...seen, id]));
        }
      }
    }
    for (const [key, value] of Object.entries(node.properties ?? {})) {
      declared.add(`${path}.${key}`);
      inspect(value, file, `${path}.${key}`, seen);
    }
    for (const branch of node.allOf ?? []) inspect(branch, file, path, seen);
    if (typeof node.additionalProperties === 'object') inspect(node.additionalProperties, file, `${path}.*`, seen);
  }
  for (const name of ['jsonforms-config.schema.json', 'jsonforms-extended-config.schema.json']) {
    inspect(documents.get(name), name, 'config');
  }
  const audit = await readJson(join(root, 'conformance/config-consumption.json'));
  assert.equal(new Set(audit.properties.map(p => p.path)).size, audit.properties.length);
  assert.deepEqual([...declared].sort(), audit.properties.filter(p => p.declaredAfter).map(p => p.path).sort());
  for (const item of audit.properties) {
    assert.ok(item.evidence.length > 0, item.path);
    assert.ok(item.finding, item.path);
    if (item.declaredAfter) assert.ok(['consumed', 'core', 'core-default-only', 'container', 'pending-implementation'].includes(item.status), item.path);
    else assert.equal(declared.has(item.path), false, item.path);
  }
  const common = documents.get('jsonforms-config.schema.json');
  for (const key of ['elementLabelProp', 'detail', 'summary']) {
    assert.equal(Object.hasOwn(common.properties, key), false);
    assert.ok(Object.hasOwn(documents.get('jsonforms-uischema.schema.json').$defs.controlOptions.properties, key));
  }
});
