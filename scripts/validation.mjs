import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Use Ajv's bundled standard meta-schema; do not publish a fork.
const dataAjv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
export function dataSchemaValidator(schema) {
  const valid = dataAjv.validateSchema(schema);
  dataSchemaValidator.errors = dataAjv.errors;
  return valid;
}

export const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
export async function validators(root) {
  const ajv = new Ajv({ allErrors: true, strict: false, $data: true, validateFormats: false });
  addFormats(ajv);
  const names = (await readdir(join(root, 'schemas'))).filter(n => n.endsWith('.json'));
  const documents = await Promise.all(names.map(n => readJson(join(root, 'schemas', n))));
  for (const schema of documents) {
    if (!ajv.validateSchema(schema)) throw new Error(`${schema.$id}: ${ajv.errorsText()}`);
    ajv.addSchema(schema);
  }
  const result = {};
  for (let i = 0; i < names.length; i++) result[names[i]] = ajv.getSchema(documents[i].$id);
  return result;
}
export function walk(value, visit, pointer = '') {
  if (value && typeof value === 'object') {
    visit(value, pointer);
    for (const [k, v] of Object.entries(value)) walk(v, visit, `${pointer}/${k.replaceAll('~', '~0').replaceAll('/', '~1')}`);
  }
}
export function atPointer(value, pointer) {
  return pointer.split('/').slice(1).reduce((v,k) => v[k.replaceAll('~1','/').replaceAll('~0','~')], value);
}
export function replacePointer(value, pointer, replacement) {
  const segments = pointer.split('/').slice(1).map(k => k.replaceAll('~1','/').replaceAll('~0','~'));
  const key = segments.pop();
  const parent = segments.reduce((v,k) => v[k], value);
  if (replacement === undefined) delete parent[key]; else parent[key] = replacement;
}
export async function validateProject(root) {
  const checks = await validators(root);
  const catalog = await readJson(join(root, 'examples/catalog.json'));
  const invalid = await readJson(join(root, 'conformance/expected-invalid.json'));
  const failures = [];
  let checked = 0;
  for (const entry of catalog) {
    if (checks['example.schema.json'] && !checks['example.schema.json'](entry)) failures.push(`${entry.id}: invalid catalog entry`);
    for (const file of entry.files) {
      const data = await readJson(join(root, 'examples', entry.id, file));
      let schemaName = { 'uischema.json': 'jsonforms-extended-uischema.schema.json', 'config.json':'jsonforms-extended-config.schema.json', 'schema.json':'http://json-schema.org/draft-07/schema#' }[file];
      if (schemaName) {
        const validate = file === 'schema.json' ? dataSchemaValidator : checks[schemaName];
        const exceptions = invalid.filter(x => x.example === entry.id && x.file === file);
        if (exceptions.length) {
          validate(data);
          const errors = structuredClone(validate.errors ?? []);
          for (const item of exceptions) {
            if (!errors.some(e => e.instancePath === item.pointer || e.instancePath.startsWith(item.pointer + '/'))) failures.push(`${entry.id}/${file}${item.pointer}: expected rejection absent`);
            replacePointer(data, item.pointer, item.replacement);
          }
        }
        if (!validate(data)) failures.push(`${entry.id}/${file}: ${JSON.stringify(validate.errors)}`);
        checked++;
      }
      if (file === 'uischemas.json') {
        for (const item of data) {
          if (!checks['jsonforms-extended-uischema.schema.json'](item.uischema)) failures.push(`${entry.id}/${file}: invalid registered UI schema`);
          checked++;
        }
      }
      if (file === 'translations.json') {
        if (!data.en || !data.bg || JSON.stringify(Object.keys(data.en).sort()) !== JSON.stringify(Object.keys(data.bg).sort())) failures.push(`${entry.id}: English/Bulgarian translation keys differ`);
        checked++;
      }
    }
    try { await readFile(join(root, 'examples', entry.id, 'README.md')); } catch { failures.push(`${entry.id}: missing walkthrough`); }
  }
  if (failures.length) throw new Error(failures.join('\n'));
  return { examples: catalog.length, documents: checked, schemas: Object.keys(checks).length };
}
