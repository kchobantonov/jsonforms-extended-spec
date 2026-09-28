import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { validators, readJson, walk, atPointer, dataSchemaValidator } from '../scripts/validation.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const md = new MarkdownIt();
const slug = text => text.toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, '').replaceAll(' ', '-');
const catalog = await readJson(join(root, 'examples/catalog.json'));
const docs = ['README.md', 'SPEC.md', 'TODO.md', 'AUDIT.md', 'schemas/README.md', 'examples/README.md', ...catalog.map(x => `examples/${x.id}/README.md`)];
const headings = new Map();
for (const path of docs) {
  const ids = new Set(); const counts = new Map();
  const tokens = md.parse(await readFile(join(root, path), 'utf8'), {});
  for (let i = 0; i < tokens.length; i++) if (tokens[i].type === 'heading_open') {
    const id = slug(tokens[i+1].content.replaceAll('`', ''));
    const n = counts.get(id) ?? 0; counts.set(id, n+1); ids.add(n ? `${id}-${n}` : id);
  }
  headings.set(resolve(root, path), ids);
}
test('all local documentation links and section anchors resolve', async () => {
  const errors = [];
  for (const path of docs) {
    const tokens = md.parse(await readFile(join(root, path), 'utf8'), {});
    for (const token of tokens.flatMap(t => t.children ?? [])) {
      const href = token.attrGet('href');
      if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) continue;
      const [file, anchor] = href.split('#');
      const target = file ? resolve(root, dirname(path), decodeURIComponent(file)) : resolve(root, path);
      try { await stat(target); } catch { errors.push(`${path}: missing ${href}`); continue; }
      if (anchor && headings.has(target) && !headings.get(target).has(decodeURIComponent(anchor))) errors.push(`${path}: missing anchor ${href}`);
    }
  }
  assert.deepEqual(errors, []);
});
test('every bundled schema reference resolves, including unused definitions', async () => {
  const schemas = new Map();
  for (const file of await readdir(join(root, 'schemas'))) if (file.endsWith('.json')) {
    const doc = await readJson(join(root, 'schemas', file)); schemas.set(doc.$id, doc);
  }
  for (const [id, doc] of schemas) walk(doc, node => {
    if (typeof node.$ref !== 'string') return;
    const url = new URL(node.$ref, id);
    const pointer = url.hash.slice(1); url.hash = '';
    if (/^https?:\/\/json-schema.org\/draft-07\/schema$/.test(url.href)) return;
    assert.ok(schemas.has(url.href), `${id}: ${node.$ref}`);
    if (pointer) assert.notEqual(atPointer(schemas.get(url.href), decodeURIComponent(pointer)), undefined, `${id}: ${node.$ref}`);
  });
});
test('JSON specification snippets parse and complete authoring documents validate', async () => {
  const checks = await validators(root);
  const spec = await readFile(join(root, 'SPEC.md'), 'utf8');
  for (const match of spec.matchAll(/^```\s*json\s*\n([\s\S]*?)^```/gm)) {
    const value = JSON.parse(match[1]);
    const candidates = [];
    for (const [key, schema] of Object.entries({uischema:'jsonforms-extended-uischema.schema.json', config:'jsonforms-extended-config.schema.json', schema:'http://json-schema.org/draft-07/schema#'})) if (value[key]) candidates.push([schema, value[key]]);
    if (typeof value.type === 'string' && /^[A-Z]/.test(value.type)) candidates.push(['jsonforms-extended-uischema.schema.json', value]);
    for (const [name, document] of candidates) {
      const validate = name === 'http://json-schema.org/draft-07/schema#' ? dataSchemaValidator : checks[name];
      assert.ok(validate(document), `Line ${spec.slice(0,match.index).split('\n').length}: ${JSON.stringify(validate.errors)}`);
    }
  }
});
