import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = async (name) =>
  JSON.parse(
    await readFile(new URL(`../examples/input-adornments/${name}.json`, import.meta.url), 'utf8'),
  );

test('input adornment example shows all supported entry types and placements together', async () => {
  const [schema, data, uischema] = await Promise.all([
    read('schema'),
    read('data'),
    read('uischema'),
  ]);
  assert.equal(uischema.type, 'VerticalLayout');
  assert.equal(uischema.elements.length, 13);
  for (const group of uischema.elements) {
    assert.equal(group.type, 'Group');
    const row = group.elements[0];
    assert.equal(row.type, 'HorizontalLayout');
    assert.equal(row.elements.length, 3);
    const [start, end, both] = row.elements;
    assert.ok(start.options.startAdornment);
    assert.equal(start.options.endAdornment, undefined);
    assert.equal(end.options.startAdornment, undefined);
    assert.ok(end.options.endAdornment);
    assert.ok(both.options.startAdornment);
    assert.ok(both.options.endAdornment);
    for (const control of row.elements) {
      const property = control.scope.split('/').at(-1);
      assert.ok(schema.properties[property], property);
      assert.ok(Object.hasOwn(data, property), property);
    }
  }
});
