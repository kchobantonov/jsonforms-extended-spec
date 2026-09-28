import { mkdtemp, readFile, readdir, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { validateProject } from './validation.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const temp = await mkdtemp(join(tmpdir(), 'jsonforms-spec-pack-'));
const testing = process.argv.includes('--test');
try {
  execFileSync('pnpm', ['pack', '--pack-destination', temp], {cwd:root, stdio:'pipe'});
  const archive = (await readdir(temp)).find(n=>n.endsWith('.tgz'));
  assert.ok(archive, 'pnpm pack must produce a tarball');
  if (!testing) { console.log(join(temp,archive)); }
  else {
    execFileSync('tar', ['-xzf',join(temp,archive),'-C',temp]);
    const packed = join(temp,'package');
    const report = await validateProject(packed);
    const manifest = JSON.parse(await readFile(join(packed,'package.json'),'utf8'));
    assert.equal(manifest.name, '@chobantonov/jsonforms-extended-spec');
    assert.equal(manifest.private, undefined);
    for (const group of ['dependencies','optionalDependencies','peerDependencies']) for (const version of Object.values(manifest[group] ?? {})) assert.ok(!/^(workspace:|link:|file:)/.test(version));
    for (const file of ['SPEC.md','TODO.md','AUDIT.md','README.md','LICENSE','provenance.json','conformance/authoring.json']) await readFile(join(packed,file));
    // Resolve public subpaths as an external consumer with no workspace imports.
    const consumer = join(temp,'consumer');
    await mkdir(join(consumer,'node_modules/@chobantonov'),{recursive:true});
    const { symlink } = await import('node:fs/promises');
    await symlink(packed,join(consumer,'node_modules/@chobantonov/jsonforms-extended-spec'));
    execFileSync(process.execPath,['--input-type=module','-e', `
      import { readFileSync } from 'node:fs';
      const resolve = name => import.meta.resolve('@chobantonov/jsonforms-extended-spec/' + name);
      const catalog = JSON.parse(readFileSync(new URL(resolve('examples/catalog.json'))));
      if (catalog.length !== ${report.examples}) throw new Error('Catalog missing');
      const schema = JSON.parse(readFileSync(new URL(resolve('schemas/jsonforms-extended-uischema.schema.json'))));
      if (!schema.$id) throw new Error('Schema missing');
      await import(resolve('examples/object-control/uischemas.mjs'));
    `],{cwd:consumer,stdio:'pipe'});
    console.log(`Packed consumer verified: ${report.examples} examples, ${report.schemas} offline schemas.`);
  }
} finally { if (testing) await rm(temp,{recursive:true,force:true}); }
