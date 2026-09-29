import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function exampleModule(root) {
  const catalog = JSON.parse(await readFile(join(root, 'examples/catalog.json'), 'utf8'));
  const imports = [];
  const entries = [];
  for (const [index, entry] of catalog.entries()) {
    const fixture = { id: entry.id, title: entry.title, hostRequirements: entry.hostRequirements ?? [] };
    for (const file of entry.files.filter(file => file.endsWith('.json'))) {
      fixture[file.slice(0, -5)] = JSON.parse(await readFile(join(root, 'examples', entry.id, file), 'utf8'));
    }
    let registry = '';
    try { await access(join(root, 'examples', entry.id, 'uischemas.mjs')); registry = `, uischemas: registry${index}`; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (registry) imports.push(`import { uischemas as registry${index} } from './${entry.id}/uischemas.mjs';`);
    entries.push(`{...JSON.parse(${JSON.stringify(JSON.stringify(fixture))}), ${registry ? registry.slice(2) : ''}}`);
  }
  return `// Generated from examples/catalog.json and its fixtures. Run pnpm generate:examples.\n${imports.join('\n')}\nexport const examples = [\n${entries.join(',\n')}\n];\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  await writeFile(join(root, 'examples/index.js'), await exampleModule(root));
}
