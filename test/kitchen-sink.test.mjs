import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const read = async name => JSON.parse(await readFile(new URL(`../examples/kitchen-sink/${name}.json`, import.meta.url), 'utf8'));
test('kitchen sink starts valid and exercises declared invalid paths', async () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  // Presentation-only custom formats; do not pretend these validate content.
  for (const name of ['password', 'color', 'cron']) ajv.addFormat(name, true);
  const validate = ajv.compile(await read('schema'));
  assert.equal(validate(await read('data')), true, JSON.stringify(validate.errors));
  assert.equal(validate(await read('invalid-data')), false);
  assert.deepEqual(new Set(validate.errors.map(error => error.instancePath)), new Set([
    '/email', '/phone', '/otp', '/age', '/budget', '/startDate', '/address/city',
    '/team/4/email', '/gridTeam/4/phone', '/experience/0/company'
  ]));
});
test('kitchen sink catalogs cover authored labels in both languages', async () => {
  const catalogs = await read('translations');
  assert.deepEqual(Object.keys(catalogs.en).sort(), Object.keys(catalogs.bg).sort());
  const visit = element => {
    if (element?.i18n) {
      const key = `${element.i18n}.${element.type === 'Label' ? 'text' : 'label'}`;
      assert.ok(catalogs.en[key], key); assert.ok(catalogs.bg[key], key);
    }
    for (const child of element?.elements ?? []) visit(child);
    if (element?.options?.rowDetail?.detail) visit(element.options.rowDetail.detail);
  };
  visit(await read('uischema'));
});

test('identity fields are strings and contact branches describe their own editors', async () => {
  const { properties } = await read('schema');
  for (const key of ['firstName', 'lastName', 'email', 'phone', 'password', 'otp'])
    assert.equal(properties[key].type, 'string');
  for (const [key, keyword] of [['preferredContact', 'oneOf'], ['availableContacts', 'anyOf'], ['billing', 'allOf']])
    for (const branch of properties[key][keyword]) {
      assert.equal(branch.type, 'object');
      assert.ok(Object.keys(branch.properties).length > 0);
    }
});
