# JSON Forms Extended Specification

One portable specification, authoring schemas and 32 worked examples for JSON
Forms renderer implementations.

- [Read the specification](docs/spec.md)
- [Browse the examples](examples/README.md)
- [Use the JSON schemas](schemas/README.md)
- [Read the migration and schema audit](docs/audit.md)

The specification is a consolidated v1 draft. It separates accepted contracts
from future design work and documents optional capabilities explicitly.
The published schemas cover implemented features only; see [design backlog](docs/todo.md)
for design discussions and implementation work, including `$dynamic`.
No component library is required by this package.

## Contents

| Path | Purpose |
| --- | --- |
| `docs/spec.md` | The single specification, organized by topic |
| `schemas/` | Six JSON schemas with offline-resolvable references |
| `examples/` | Authored schemas, UI schemas, data, config, translations and walkthroughs |
| `conformance/authoring.json` | Executable positive and negative schema vectors |
| `conformance/behavior.json` | Behavioral scenarios for renderer adapter suites |
| `provenance.json` | Source document hashes and reconciliation decisions |

Behavioral vectors need a renderer-specific test adapter. This package tests
schema authoring and packaging; it does not certify renderer implementations.
Examples deliberately include invalid data and selected diagnostic cases.

## Use the package

```sh
pnpm add @chobantonov/jsonforms-extended-spec
```

Read an asset without depending on package installation paths:

```js
import { readFile } from 'node:fs/promises';

const url = import.meta.resolve(
  '@chobantonov/jsonforms-extended-spec/schemas/jsonforms-extended-uischema.schema.json'
);
const schema = JSON.parse(await readFile(new URL(url), 'utf8'));
```

Register all files in `schemas/` with the validator by `$id` before compiling a
profile. The relative `$ref` values then resolve locally. JSON Schema defaults
are annotations: do not mutate UI schemas or config while validating them.

`examples/catalog.json` lists the assets and host requirements for each example.
Read each JSON asset fresh for each form; mutable demo state must not overwrite
shared fixtures. JavaScript registry examples are trusted host code in
`uischemas.mjs`, with no framework imports. String scripts in JSON require the
host's explicit execution permission.

## Develop and verify

Requires Node 22 or newer and pnpm 10.28.2.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm run test:packed
pnpm run check
```

`build` validates the assets and creates a static site in `site/`. It does not
execute scripts or render forms from the example documents. `test:packed`
unpacks the real tarball, resolves public exports as an external consumer and
validates its schemas and examples without fetching schema references.

To keep a release tarball:

```sh
pnpm run release:pack
```

The command prints its temporary output path. Nothing is published by that
command. The package has no runtime dependencies.

## Release and deployment

The workflow follows the Changesets process used by the renderer projects:

1. Run `pnpm changeset` and describe the spec/schema/example changes.
2. Merge to `master`. The release workflow opens or updates a version PR.
3. Merge the version PR. Checks run before `changeset publish` publishes npm
   packages and creates the GitHub release/tags.

For the first unpublished version, the release workflow also has a manual
trigger. Configure the repository's `NPM_TOKEN` secret with publish access to
`@chobantonov/jsonforms-extended-spec`, and allow GitHub Actions to create pull
requests. These settings are external to the package.

CI builds and checks pull requests. On `master`, it deploys the static site to
GitHub Pages. Set **Settings → Pages → Source → GitHub Actions** in the repository.
The expected URL is
[the project documentation site](https://kchobantonov.github.io/jsonforms-extended-spec/).

`pnpm run check` is the local release gate. Publishing and Pages deployment
happen only through their configured workflows or an explicit maintainer command.

## TypeScript authoring

See [the TypeScript guide](typescript/README.md) for schema-aware authoring helpers. Sources and tests live under `typescript/`; other language bindings can use their own directories.

## Renderer and demo design

Use [the renderer/demo acceptance guide](docs/renderer-and-demo.md),
[renderer selection](docs/renderer-selection.md), and the
[migration audit](docs/audit.md). These maintained guides contain the portable
requirements. [History TODO](docs/history/TODO.md) tracks any unresolved migration
questions; renderer implementation gaps belong in their renderer repositories.

## Automatic example discovery

Import `examples` from `@chobantonov/jsonforms-extended-spec/examples`.
Each entry includes its ID, title, JSON fixtures and optional UI-schema registry.
Add an entry to `examples/catalog.json`, then run `pnpm build` (or
`pnpm generate:examples` during development). All consuming demos discover it
without maintaining their own registration list. Rebuild the linked package to
refresh a running demo. Host requirements remain explicit in each entry.
