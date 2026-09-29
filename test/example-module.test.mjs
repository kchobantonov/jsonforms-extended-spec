import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { examples } from '../examples/index.js';
import { exampleModule } from '../scripts/generate-examples.mjs';

test('the browser example module includes the catalog and canonical data', async () => {
  const catalog = JSON.parse(await readFile(new URL('../examples/catalog.json', import.meta.url)));
  assert.deepEqual(examples.map(e => e.id), catalog.map(e => e.id));
  for (const entry of catalog) {
    const actual = examples.find(e => e.id === entry.id);
    for (const file of entry.files.filter(file => file.endsWith('.json'))) {
      assert.deepEqual(actual[file.slice(0, -5)], JSON.parse(await readFile(new URL(`../examples/${entry.id}/${file}`, import.meta.url))));
    }
  }
  assert.equal(typeof examples.find(e => e.id === 'object-control').uischemas[0].tester, 'function');
});

test('a new catalog entry needs no consumer registration and preserves literal keys', async () => {
  const root = await mkdtemp(join(tmpdir(), 'spec-catalog-'));
  try {
    await mkdir(join(root, 'examples/new-feature'), { recursive: true });
    await writeFile(join(root, 'examples/catalog.json'), JSON.stringify([{ id: 'new-feature', title: 'New feature', files: ['data.json'] }]));
    await writeFile(join(root, 'examples/new-feature/data.json'), '{"__proto__":{"value":1},"text":"new"}');
    const module = await import('data:text/javascript;base64,' + Buffer.from(await exampleModule(root)).toString('base64'));
    assert.equal(module.examples[0].id, 'new-feature');
    assert.equal(module.examples[0].title, 'New feature');
    assert.equal(Object.hasOwn(module.examples[0].data, '__proto__'), true);
  } finally { await rm(root, { recursive: true, force: true }); }
});
