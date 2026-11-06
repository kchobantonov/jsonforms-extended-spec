import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const runtime = `const atPointer = (value, pointer) => {
  if (!pointer) return value;
  return pointer.split('/').slice(1).reduce((current, segment) =>
    current?.[segment.replaceAll('~1', '/').replaceAll('~0', '~')], value);
};
const testerForMatch = (match) => {
  if (!match) return () => -1;
  return (schema, schemaPath) => {
    if (match.schemaPath !== undefined && schemaPath !== match.schemaPath) return -1;
    if (match.notSchemaPath !== undefined && schemaPath === match.notSchemaPath) return -1;
    const value = atPointer(schema, match.schemaPointer);
    if (match.exists === true && value === undefined) return -1;
    if (Object.hasOwn(match, 'equals') && value !== match.equals) return -1;
    return match.rank;
  };
};`;

export async function exampleModule(root) {
  const catalog = JSON.parse(await readFile(join(root, 'examples/catalog.json'), 'utf8'));
  const entries = [];
  for (const entry of catalog) {
    const fixture = { id: entry.id, title: entry.title, hostRequirements: entry.hostRequirements ?? [] };
    for (const file of entry.files.filter((file) => file.endsWith('.json'))) {
      fixture[file.slice(0, -5)] = JSON.parse(await readFile(join(root, 'examples', entry.id, file), 'utf8'));
    }
    const encoded = JSON.stringify(JSON.stringify(fixture));
    if (fixture.uischemas) {
      entries.push(`(() => { const fixture = JSON.parse(${encoded}); return { ...fixture, uischemas: fixture.uischemas.map(entry => ({ ...entry, tester: testerForMatch(entry.match) })) }; })()`);
    } else {
      entries.push(`JSON.parse(${encoded})`);
    }
  }
  return `// Generated from examples/catalog.json and its JSON fixtures. Run pnpm generate:examples.\n${runtime}\nexport const examples = [\n${entries.join(',\n')}\n];\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  await writeFile(join(root, 'examples/index.js'), await exampleModule(root));
}
