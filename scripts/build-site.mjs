import { mkdir, readdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
const root = fileURLToPath(new URL('../', import.meta.url));
const dest = join(root, 'site');
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
for (const asset of ['SPEC.md', 'TODO.md', 'AUDIT.md', 'schemas', 'examples', 'conformance', 'provenance.json', 'LICENSE']) await cp(join(root, asset), join(dest, asset), { recursive: true });
const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
const slug = text => text.toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, '').replaceAll(' ', '-');
md.core.ruler.push('heading-ids', state => {
  const seen = new Map();
  for (let i = 0; i < state.tokens.length; i++) if (state.tokens[i].type === 'heading_open') {
    const id = slug(state.tokens[i+1].content.replaceAll('`', ''));
    const n = seen.get(id) ?? 0; seen.set(id, n+1);
    state.tokens[i].attrSet('id', n ? `${id}-${n}` : id);
  }
});
const link = md.renderer.rules.link_open ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href');
  if (href && !/^[a-z]+:/i.test(href)) tokens[idx].attrSet('href', href.replace(/\.md(?=#|$)/, '.html').replace(/\/$/, '/README.html'));
  return link(tokens, idx, options, env, self);
};
const escape = s => md.utils.escapeHtml(s);
async function render(source, target) {
  const text = await readFile(join(root, source), 'utf8');
  const prefix = relative(dirname(join(dest, target)), dest).split(sep).join('/') || '.';
  const title = text.match(/^# (.+)$/m)?.[1] ?? 'JSON Forms Extended Spec';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>${escape(title)}</title><link rel="stylesheet" href="${prefix}/style.css"></head><body><a class="skip" href="#content">Skip to content</a><header><a class="brand" href="${prefix}/index.html">JSON Forms Extended</a><nav aria-label="Documentation"><a href="${prefix}/SPEC.html">Specification</a><a href="${prefix}/examples/README.html">Examples</a><a href="${prefix}/schemas/README.html">Schemas</a><a href="https://github.com/kchobantonov/jsonforms-extended-spec">Source</a></nav></header><main id="content">${md.render(text)}</main><footer>Specification draft · portable model, schema contracts and example fixtures</footer></body></html>`;
  await mkdir(dirname(join(dest, target)), {recursive:true});
  await writeFile(join(dest, target), html);
}
await render('README.md', 'index.html');
await render('SPEC.md', 'SPEC.html');
await render('TODO.md', 'TODO.html');
await render('AUDIT.md', 'AUDIT.html');
await render('schemas/README.md', 'schemas/README.html');
await render('examples/README.md', 'examples/README.html');
for (const name of await readdir(join(root, 'examples'))) {
  if (name.endsWith('.json') || name.endsWith('.md')) continue;
  await render(`examples/${name}/README.md`, `examples/${name}/README.html`);
}
await writeFile(join(dest, '.nojekyll'), '');
await writeFile(join(dest, 'style.css'), `:root{font-family:system-ui,sans-serif;color:#243247;background:#f5f7fa;line-height:1.65}*{box-sizing:border-box}body{margin:0}a{color:#195ac4;text-underline-offset:.18em}header{display:flex;align-items:center;justify-content:space-between;gap:2rem;padding:1.2rem max(1.5rem,calc((100vw - 1080px)/2));border-bottom:1px solid #d8dfe8;background:#fff}nav{display:flex;gap:1.4rem;flex-wrap:wrap}.brand{font-weight:750;font-size:1.1rem;text-decoration:none;white-space:nowrap}main{max-width:1080px;margin:2.5rem auto;padding:2.5rem;background:#fff;border:1px solid #d8dfe8;border-radius:12px}h1{font-size:2.4rem;line-height:1.2;letter-spacing:-.04em}h2{margin-top:2.8rem;padding-top:.7rem;border-top:1px solid #d8dfe8}h3{margin-top:2rem}h1,h2,h3,h4{color:#182c4e;scroll-margin-top:1rem}p,li{max-width:88ch}table{border-collapse:collapse;display:block;overflow:auto;font-size:.94rem}td,th{padding:.7rem 1rem;border:1px solid #d8dfe8;text-align:left;vertical-align:top}th{background:#eef3fa}pre{padding:1.1rem;overflow:auto;border-radius:7px;background:#eef3fa;line-height:1.5}code{font-family:ui-monospace,monospace;font-size:.9em}p code,li code,td code{background:#eef3fa;padding:.1em .25em;border-radius:3px}blockquote{margin-left:0;border-left:3px solid #4273b9;padding:.3rem 1.2rem;color:#4f6077}footer{text-align:center;padding:2rem;font-size:.85rem;color:#4f6077}.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:.2rem;background:white;padding:.5rem}@media(max-width:760px){header{align-items:flex-start;flex-direction:column;gap:.6rem;padding:1rem}nav{gap:1rem;font-size:.9rem}main{margin:0;padding:1.2rem;border:0;border-radius:0}h1{font-size:1.9rem}}@media(prefers-color-scheme:dark){:root{background:#101824;color:#dae3f0}header,main{background:#152131;border-color:#33465f}h1,h2,h3,h4{color:#edf4ff}a{color:#8fbdff}th,pre,p code,li code,td code{background:#203149}td,th,h2{border-color:#33465f}blockquote,footer{color:#b0bfd4}}`);
console.log(`Built site with ${ (await readdir(join(root, 'examples'))).filter(n=>!n.includes('.')).length } example pages.`);
