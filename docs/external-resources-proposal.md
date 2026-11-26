# JSON Forms Extended — External Resources and Reactive Data Binding

**Status:** Proposed design for specification review  
**Scope:** Portable UI schema contract, host-provided resource resolution, runtime integration, security, and optional interaction capabilities  
**Target runtimes:** React, Vue, Svelte, Kotlin/Android, and other JSON Forms-compatible implementations

## 1. Executive decision

Introduce a **small, portable external-resource binding contract** rather than a REST-aware renderer or a full application orchestration framework.

1. A UI schema may **reference a virtual resource name**, optionally passing declarative parameters.
2. A **host-controlled resource resolver** implements retrieval, authentication, authorization, URL selection, request headers, CSRF protection, caching, and platform-specific networking.
3. The runtime publishes a **standard resource snapshot** (data, status, error) to the existing `$dynamic` evaluation context.
4. `$dynamic` maps resource values into **arbitrary existing UI schema paths** (for example `options.items`, `options.loading`, `options.error`). It does not prescribe an item shape or know the renderer.
5. Optional **portable semantic interactions** can change resource parameters or request more data. The basic design works without this extension; search and infinite scrolling require an event-capable renderer/adapter.
6. The **core spec does not define HTTP syntax, pagination algorithms, authentication headers, JS callbacks, or a general workflow engine**. These belong to host adapters or explicitly versioned optional profiles.

**Recommendation:** Standardize resource references, snapshots, context visibility, and binding semantics first. Build a generic HTTP adapter as a separate library, not as a mandatory part of the spec.

## 2. Problem and goals

### 2.1 Motivating example

A Camunda task form needs to select an assignee. The host may retrieve users from Camunda 7 REST, Camunda 8 identity-related services, a custom identity proxy, or an enterprise directory. Endpoints, credentials, response shapes, filtering and pagination vary. A custom dropdown might accept `options.items` where each item has `{ id, label, description }`; another renderer might expect `{ key, title, subtitle }`.

**None of these differences should cause creation of another renderer.** A renderer is justified for a new visual/interaction pattern, not for a different endpoint or response format.

### 2.2 Requirements

- Keep `$dynamic` the existing, pure mechanism for deriving UI schema properties.
- Do not mutate original JSON Schema or treat resource choices as JSON Schema `enum` automatically.
- Allow **arbitrary JSON** data, including arrays, objects, scalar values and `null`.
- Bind to **unknown third-party renderers** by documented UI schema paths, without hardcoding option names.
- Support initial loading and errors in a platform-neutral way; optional refresh, search, lazy loading, pagination and selected-value hydration.
- Make host security policy authoritative; no embedded credentials or arbitrary remote execution from untrusted UI schema.
- Define portable behavior for web and non-web runtimes without requiring JavaScript, React hooks, TanStack Query, `fetch`, DOM events or browser-only APIs.
- Preserve control identity and input focus when asynchronous values change.
- Avoid turning UI schema into a general-purpose application orchestration or state management language.

### 2.3 Explicit non-goals

- A standard renderer for every remote data type.
- A universal dropdown item schema.
- Arbitrary network access declared by the form author.
- Executing arbitrary JavaScript expressions or untrusted callbacks.
- Mandating one HTTP, caching, pagination, or identity implementation.
- Automatic writes to form data from resource responses.

## 3. Conceptual architecture

```text
Extended UI Schema
  ├── Control / Layout / custom renderer options
  ├── $resource references (virtual names + parameters)
  └── $dynamic bindings (arbitrary target paths)
                │
                ▼
Portable Resource Binding Runtime
  ├── resolve names within lexical UI scope
  ├── evaluate permitted declarative parameters
  ├── observe snapshots and notify $dynamic
  └── optional dispatch of semantic resource actions
                │
                ▼
Host Resource Resolver / Provider Registry
  ├── allowlist and resource authorization
  ├── transport and endpoint selection
  ├── JWT / session / CSRF handling
  ├── response parsing, normalization, search, paging
  ├── caching, retry, cancellation and isolation
  └── errors sanitized for UI consumption
                │
                ▼
Existing $dynamic resolver
                │
                ▼
Resolved ordinary UI Schema -> existing or third-party renderer
```

The **host** owns privileged operations. The **UI schema** is declarative and untrusted until authorized. The **renderer** sees resolved options, not the resource manager.

## 4. Minimal portable schema contract

### 4.1 Naming and placement

Use **`$resources`** on a UI element as a map of **local aliases** to resource references. Each alias exposes one snapshot to that element and its descendants. The host may also inject resource aliases at the form root without modifying the UI schema.

Proposed minimal shape:

```json
{
  "$resources": {
    "assignees": {
      "source": "identity.users",
      "params": {
        "groupId": { "bind": "data.groupId" }
      }
    }
  }
}
```

- `source`: required virtual identifier; **not** a URL. Exact resolution is host-defined and authorization-checked.
- `params`: optional named JSON values or descriptors evaluated with the existing safe `$dynamic` machinery. Values are *data*, not code or raw HTTP headers. Reuse `bind`, `expression`, `template`, and `literal`; use `literal` when a parameter value itself has a descriptor-shaped object.
- Other fields are optional future extensions and must be explicitly versioned.
- No `url`, `headers`, `token`, `credentials`, `script`, or arbitrary HTTP method in the portable core.
- A host may expose a named `http` resource provider, but its URL and authentication configuration live outside the UI schema by default.

**Why local aliases?** The same virtual source may be used with different parameters or in different UI subtrees. Aliases also make `$dynamic` expressions short and stable.

### 4.2 Scope and collision rules

- A `$resources` declaration is visible on its declaring element and descendants.
- Child aliases may shadow parent aliases only if the spec explicitly permits it. **Recommended v1:** reject alias collisions in nested scopes to reduce ambiguity; a future extension may introduce qualified names.
- Host-injected root aliases are visible throughout the form, unless explicitly restricted by host policy.
- Resource lifetime is scoped to the owning UI element; the host can retain cache entries independently.
- A resource alias is a logical binding, not an instruction to immediately fetch. The host may implement eager or lazy resolution.

### 4.3 Runtime snapshot contract

Each alias resolves to a snapshot with these stable fields:

```typescript
// Illustrative structural contract only; not normative TypeScript.
type ResourceSnapshot<T> = {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: { code?: string; message: string } | null;
  isFetching: boolean;
};
```

Normative semantics:

| Field | Meaning |
|---|---|
| `status` | `idle` not yet requested; `pending` initial load; `success` usable response; `error` most recent load failed without a usable current result |
| `data` | Host-published JSON result, **not** a prescribed dropdown shape. `null` may be valid success data; use `status` to distinguish from unavailable data. |
| `error` | Sanitized, user-safe error information only; never raw headers, tokens, internal URLs, stack traces or sensitive response bodies. |
| `isFetching` | A request is active, including background refresh when previous data is retained. |

**Recommended refinement:** expose `hasData` (boolean) so a valid `null` payload is unambiguous, and retain `status: 'success'` during background refresh even while `isFetching` is true. A refresh failure with retained data should preserve usable data and report a sanitized nonfatal refresh error via an optional field rather than discard the last success.

Snapshot publication must be **atomic**. An obsolete request must never overwrite a newer parameter set. A failed or cancelled request must not accidentally clear form values.

### 4.4 `$dynamic` integration

The existing `$dynamic` resolver receives a new read-only `resources` context namespace. It evaluates resource expressions with the same portable, sandboxed expression engine already selected for `$dynamic`.

```json
{
  "type": "Control",
  "scope": "#/properties/assignee",
  "options": {
    "renderer": "UserDropdown",
    "items": [],
    "loading": false,
    "error": null
  },
  "$resources": {
    "assignees": {
      "source": "identity.users"
    }
  },
  "$dynamic": {
    "options": {
      "items": {
        "expression": "resources.assignees.status == 'success' && resources.assignees.data != null ? resources.assignees.data : []"
      },
      "loading": {
        "bind": "resources.assignees.isFetching"
      },
      "error": {
        "expression": "resources.assignees.error != null ? resources.assignees.error.message : null"
      }
    }
  }
}
```

**Compatibility note:** The nested overlay and descriptor syntax matches the existing experimental `$dynamic` profile. The proposed `resources` environment root is not yet part of that profile, so these are design examples, not executable fixtures. The final specification must reuse the existing overlay semantics and must not introduce a separate expression language for resources.

The resolver must handle unavailable data safely. Prefer existing static fallback values (`items: []`, `loading: false`, `error: null`) and defined null/error semantics. If a conditional `$dynamic` overlay is inapplicable, the original static property remains. A transient error should not leave a stale overlay from an earlier evaluation.

### 4.5 Arbitrary renderer-specific shape

A third-party renderer may expect:

```json
{
  "options": {
    "items": [
      { "id": "jsmith", "label": "John Smith", "description": "john@example.com" }
    ],
    "loading": false
  }
}
```

Another may expect `options.entries` with `{ key, title, subtitle }`. **The resource layer does not know either contract.** The host can return already-normalized data for the first renderer, or the `$dynamic` expression layer can project the result to the target shape using *portable, explicitly supported* collection operations.

**Recommended v1 default:** normalize at the **host resource boundary**, avoiding a new collection-mapping DSL in the UI spec. If existing `$dynamic` already supports safe collection projection, using it for renderer-specific mappings is valid. Do not assume JavaScript `.map()` works in CEL or other portable evaluators.

## 5. Host resource resolver contract

Define behavior, not implementation-language interfaces. A conforming runtime provides:

- **Resolve**: `source` + evaluated `params` + trusted host context -> a resource instance/snapshot stream.
- **Observe**: publish atomic snapshots when resource state changes.
- **Dispose**: release subscriptions and cancel work where appropriate.
- **Optional command**: accept semantic actions such as `refresh`, `setParams`, or `loadMore` when the provider declares support.

Illustrative adapter signatures (not normative):

```text
resolve(sourceId, params, trustedHostContext) -> ResourceHandle
ResourceHandle.snapshot() -> ResourceSnapshot
ResourceHandle.subscribe(listener) -> Unsubscribe
ResourceHandle.dispose()
ResourceHandle.command(name, payload) -> Result  [optional]
```

Host-provided context may include an authenticated HTTP client, service registry, session information, tenant identity, policy, locale and cancellation. **None of those privileged values are automatically available to `$dynamic` or to the renderer.** The UI schema receives only the sanitized snapshot.

### 5.1 Deployment mapping example

```yaml
# Trusted host configuration, NOT UI schema
resources:
  identity.users:
    implementation: camundaUserDirectory
    allowedParams: [query, groupId]
    capabilities: [refresh, search, loadMore]
    auth: hostSession
    resultProjection: userDropdownItems
```

The host can choose a different implementation in another deployment while keeping the UI schema unchanged. The same virtual name should have a documented semantic contract (for example, users searchable by query), not a fixed wire protocol.

### 5.2 Host-owned data mapping

A provider may return raw service JSON or a projected, domain-level response. Recommended policy:

- **Reusable domain resources** return stable domain records, independent of any particular renderer.
- **UI-specific adapters** may return a renderer-oriented structure where necessary; name and document that contract explicitly.
- `$dynamic` performs the final binding to arbitrary UI paths.
- Avoid making every renderer consume `{ value, label }`; no universal choice format is imposed.

## 6. Camunda assignee end-to-end example

### 6.1 Form data schema

```json
{
  "type": "object",
  "properties": {
    "assignee": { "type": "string", "title": "Assignee" }
  }
}
```

### 6.2 UI schema

```json
{
  "type": "Control",
  "scope": "#/properties/assignee",
  "options": {
    "renderer": "UserDropdown",
    "items": [],
    "loading": false,
    "error": null
  },
  "$resources": {
    "users": {
      "source": "workflow.assignees"
    }
  },
  "$dynamic": {
    "options": {
      "items": {
        "expression": "resources.users.status == 'success' && resources.users.data != null ? resources.users.data : []"
      },
      "loading": {
        "bind": "resources.users.isFetching"
      },
      "error": {
        "expression": "resources.users.error != null ? resources.users.error.message : null"
      }
    }
  }
}
```

The host's `workflow.assignees` provider can publish:

```json
{
  "status": "success",
  "data": [
    { "id": "jsmith", "label": "John Smith", "description": "john@example.com" },
    { "id": "mjohnson", "label": "Mary Johnson", "description": "mary@example.com" }
  ],
  "error": null,
  "isFetching": false
}
```

The existing renderer consumes the resolved `options.items`. Selecting John writes `{ "assignee": "jsmith" }` to **ordinary JSON Forms data**, not to the resource snapshot. Actual task assignment authorization is enforced again by the backend at submission time.

### 6.3 Camunda deployment differences

Do not hardcode assumptions that all Camunda installations share the same endpoint, identity model, authentication or CSRF mechanism. Camunda 7 embedded/Cockpit applications, Camunda 7 REST deployments, and Camunda 8 services may differ substantially. The host adapter must determine the actual API and security requirements for the deployment.

The resource reference `workflow.assignees` remains the same across deployments when the host promises the same semantic result contract.

## 7. Search, lazy loading and pagination: optional capabilities, not core complexity

### 7.1 Core rule

**The resource core exposes data and state.** It does not require `page`, `offset`, `cursor`, `hasMore`, `loadMore`, scrolling, or caching configuration. A host may implement these without exposing the mechanics to UI schema.

### 7.2 Portable interaction bridge (optional profile)

For controls that can emit portable semantic events, define an optional **interaction-to-resource-command binding**. Proposed event names are semantic, not DOM-specific: `open`, `searchChange`, `endReached`, `refreshRequested`.

Illustrative optional syntax:

```json
{
  "$resourceActions": {
    "searchChange": {
      "resource": "users",
      "command": "setParams",
      "args": { "query": { "bind": "event.query" } }
    },
    "endReached": {
      "resource": "users",
      "command": "loadMore"
    }
  }
}
```

This is **not mandatory for the initial core**. The `event` root exists only while evaluating an optional action's arguments; it is not added to ordinary `$dynamic` evaluation. The event bridge must only accept allowlisted command names, target resources visible in scope, and validated argument shapes. No arbitrary method invocation or user-defined scripts.

A third-party renderer can participate only if it emits the agreed semantic event through an adapter, or if its host application externally drives resource parameters. A renderer that merely accepts `options.items` can display fetched data, but cannot magically support server-side search or infinite scrolling without an interaction channel.

### 7.3 Search behavior

- A search-capable renderer emits a query change; host adapter debounces and issues the request.
- Parameter changes create a new logical query identity.
- Old requests are cancelled when possible and otherwise ignored when stale.
- Host decides whether to retain previous data while fetching.
- User-provided query text is data, not a URL template, executable expression, or unrestricted search filter.

### 7.4 Pagination behavior

The host provider implements offset, page number, cursor or continuation links as needed. It may expose **optional** `hasMore`, `isLoadingMore`, `total` fields and a `loadMore` command. A UI schema can bind these fields if the renderer supports them. Unsupported optional fields must have documented fallbacks.

For infinite scrolling, the host controls page accumulation, deduplication, stale-query isolation, and termination. A UI renderer only displays items and emits `endReached`. For numbered pagination, the host may publish the current page instead of accumulated results; the provider contract must document which.

### 7.5 Lazy loading

A host may defer fetching until a control becomes active, visible or opened. The optional `open` event is a portable trigger. Do not make browser `IntersectionObserver` or component `onMount` a normative requirement. On native Kotlin UI, the equivalent semantic event is emitted by its adapter.

### 7.6 Selected-value hydration

A paginated user list may not include the currently selected assignee. The host should support a separate virtual lookup such as `workflow.userById` with `params.userId` derived from `data.assignee`, or provide an equivalent selected-item resolution facility. The renderer's own contract determines how the resolved selected record is supplied. Avoid automatically clearing an existing value because it is absent from the first page.

## 8. Security and trust model

### 8.1 Trust boundaries

Treat UI schemas and form data as **untrusted inputs** unless explicitly trusted by the host. Even a signed or centrally stored UI schema should not automatically gain unrestricted network permissions.

| Boundary | Trust rule |
|---|---|
| UI schema -> resource registry | Only host-allowlisted virtual names and validated parameters are accepted. |
| Resource provider -> network | Host chooses destination, method, headers, authentication and redirects. |
| Network response -> resource snapshot | Validate size, type and shape; sanitize errors; prevent executable content. |
| Snapshot -> `$dynamic` | Read-only, sandboxed expression evaluation. |
| `$dynamic` -> renderer | Only supported target paths and types; enforce existing reserved/denylisted-property protections. |
| Form submission -> backend | Server independently authorizes selected user and requested assignment. |

### 8.2 URLs: virtual names by default

**Default policy:** No raw URLs in portable UI schema. Use virtual names (`workflow.assignees`, `identity.users`). The host maps them to trusted services.

An **optional trusted-inline-HTTP profile** may allow URLs only when the host explicitly enables it for trusted forms and enforces scheme, hostname, path, port, redirect, and request-method allowlists. Do not allow a UI schema to bypass policy using a computed URL, DNS rebinding, redirects to private IP ranges, or arbitrary proxies. Server-side resolvers must defend against SSRF; browser-side clients must honor origin/CORS restrictions.

### 8.3 JWT and session credentials

- JWTs, refresh tokens, cookies, API keys and authorization headers are **host secrets**, never literal values in the UI schema, `$dynamic` context, resource snapshots, errors, logs, or persisted form data.
- The host injects `Authorization: Bearer ...` or uses a session-aware client **only** for approved resource destinations.
- Do not forward authorization headers to arbitrary origins or across unapproved redirects.
- Refresh tokens and credential renewal remain host responsibilities.
- Cache entries containing sensitive data are partitioned by user, tenant, authorization context and other relevant security scope; invalidate them on logout or identity changes.
- Prefer a same-origin backend-for-frontend/proxy for browser-based deployments when direct service access would expose credentials or complicate CORS and authorization.

### 8.4 CSRF / Camunda Cockpit

Camunda Cockpit and related deployments may require anti-CSRF tokens or other session-specific headers for certain requests. **The UI schema must not specify the CSRF token or its header value.** The host's authenticated request client obtains and attaches the appropriate token/header/cookie combination according to the actual deployment.

Important distinctions:

- CSRF tokens and JWTs solve different problems; one does not automatically replace the other.
- Exact CSRF header names, token sources and cookie behavior are **deployment- and version-specific**; do not hardcode a purported universal Camunda header in the portable spec.
- Browser cookies may require correct same-site and credential settings; CORS is not an authorization mechanism.
- If a resource command performs a mutation, require an explicit host capability and backend authorization. A read-only user lookup should not silently become a write operation.

### 8.5 Parameter and expression safety

- Validate parameter names, types, size and permitted ranges against the host resource contract.
- Limit query length, page size, response size, concurrency, retries and request rate.
- Never interpolate user input into SQL, path templates, command strings or unrestricted remote filter expressions without provider-specific safe encoding/validation.
- Evaluate `$dynamic` and resource parameter expressions in a deterministic sandbox with no network, filesystem, reflection, dynamic code evaluation or privileged host object access.
- Prevent cycles: a resource parameter may depend on form data or approved context, but not create uncontrolled feedback loops between resources and UI updates.

### 8.6 Privacy and observability

Expose only fields the form needs. User directories can contain personal information; avoid unnecessary fields, long-lived persistent caches, and verbose telemetry. Log resource IDs, safe correlation IDs, timings and sanitized error codes—not tokens, raw request bodies, sensitive query strings, or full user records. Apply appropriate retention and access controls.

## 9. Cross-language conformance

The normative contract must be specified as **JSON structures, state semantics and observable behavior**, not TypeScript interfaces or React APIs.

| Concern | Web implementation | Kotlin/native implementation | Portable requirement |
|---|---|---|---|
| Resolve virtual source | JS provider registry | Kotlin service registry | Same name/parameter semantics |
| Network | fetch/HTTP client | OkHttp/Ktor/other | Host-owned transport |
| Observe changes | reactive store/hooks | Flow/StateFlow/observable | Snapshot updates |
| Evaluate expressions | approved CEL-compatible evaluator | compatible CEL evaluator | Same supported expression subset and null semantics |
| Render | React/Vue/Svelte renderer | native renderer | Consumes resolved UI schema properties |
| Search event | component adapter | native widget adapter | Same semantic payload |
| Cancellation | AbortController | coroutine/job cancellation | Stale results cannot overwrite newer ones |

**Expression portability:** Select and document a strict common subset of the expression language (for example CEL), including collection projection only if available in all supported runtimes. Avoid arbitrary JS functions, JS-specific optional chaining unless explicitly supported, and platform-specific date/object behavior. Provide conformance fixtures for identical inputs/outputs.

**Renderer portability:** A renderer is not required to implement resource APIs. It receives the same resolved UI schema it already expects. A renderer's documented option/event contract determines which capabilities can be bound. Unsupported fields are not magically implemented.

## 10. Relationship to existing `$dynamic`

The resource feature should **extend the evaluation context**, not replace or reimplement `$dynamic`.

- `$dynamic` stays at the UI element root, consistent with the existing extended spec.
- Resource aliases become a read-only `resources` namespace in the evaluation context.
- `$dynamic` continues to apply overlays before renderer selection/testing if that is the established runtime design, but resource snapshot changes must not unnecessarily remount controls.
- Respect existing `$dynamic` enabled/disabled policy, reserved keys, denylist and diagnostic behavior.
- If resource access is disabled, the static UI schema remains valid and the resource is not fetched.
- Resource resolution failures are visible as sanitized snapshot errors; they must not crash the entire form.
- Resources must not implicitly modify JSON Schema, AJV validation rules, or JSON Forms form data.

## 11. Versioning and capability negotiation

Keep the core small and add explicit optional profiles:

| Profile | Scope | Priority |
|---|---|---|
| **Core resource binding** | Virtual source, params, snapshot, `$dynamic` visibility | V1 mandatory |
| **Resource interactions** | Semantic event -> allowlisted command | V1 optional or V2 |
| **Pagination metadata** | `hasMore`, `isLoadingMore`, `total`, `loadMore` | Optional |
| **Inline HTTP** | Trusted host-allowlisted URL declarations | Optional, disabled by default |
| **Advanced caching** | Staleness, prefetch, persistence | Host concern, not core |
| **Mutation actions** | Explicit writes/workflows | Separate future design |

A host should expose which resource sources and commands are supported, and a renderer capability catalog may describe supported UI options and semantic events. Capability metadata assists authoring and validation, but is not required for simple data binding. Missing required capabilities should produce diagnostics rather than silent, misleading behavior.

## 12. Implementation plan

### Phase 1 — Minimal proof of concept

1. Add `$resources` local aliases and `source`/`params` schema validation.
2. Add a host resource resolver interface and subscription lifecycle.
3. Enforce source authorization, parameter bounds, cache isolation, and sanitized snapshots before exposing any resource data.
4. Inject `resources` snapshots into the existing `$dynamic` context.
5. Bind a Camunda user-directory resource to an **existing** custom dropdown's `options.items`, `options.loading`, and `options.error`.
6. Verify no new renderer is needed and no credentials or endpoint URLs appear in the UI schema.

### Phase 2 — Practical interaction profile

7. Define portable `open`, `searchChange`, `endReached` semantic events only for renderers that can emit them.
8. Add allowlisted `refresh`, `setParams`, `loadMore` resource commands.
9. Implement debouncing, pagination, cancellation, stale-query isolation and selected-value lookup in the **host provider**.
10. Add native Kotlin and web conformance tests using identical JSON fixtures.

### Phase 3 — Operational hardening

11. Add operational rate limiting, retry policy, observability and deployment-specific auth/CSRF adapters without weakening the Phase 1 trust boundary.
12. Add diagnostics for missing resource names, invalid params, unsupported events, malformed snapshots, and binding target mismatches.
13. Publish a capability catalog and examples for AntD, Shadcn, Vue/Svelte and a native renderer.

## 13. Conformance and acceptance tests

A portable implementation should pass at least these cases:

1. **Static fallback:** no resource support -> original UI options remain valid; diagnostics are clear.
2. **Initial load:** `idle -> pending -> success`, with atomic snapshot and `$dynamic` reevaluation.
3. **Failure:** sanitized `error`, no leaked credentials, renderer receives mapped error if supported.
4. **Arbitrary shape:** two different third-party renderers consume the same logical resource through different `$dynamic` mappings.
5. **Reactive dependency:** changing `data.groupId` changes params and prevents stale responses from overwriting new data.
6. **Pagination:** provider loads successive pages; no duplicates, cross-query mixing or unnecessary renderer remounts.
7. **Selected value:** a saved assignee ID resolves even if absent from the first result page.
8. **Security:** unknown source rejected; unauthorized params rejected; inline URL blocked by default; no JWT/CSRF values enter schema/context/logs.
9. **Isolation:** user A's cached directory data is not visible to user B or another tenant.
10. **Cross-runtime:** identical schema, resource snapshots and expressions yield equivalent resolved UI properties in TypeScript and Kotlin implementations.
11. **Form integrity:** resource updates do not change form data or JSON Schema; selection updates only the intended form path.
12. **Lifecycle:** dispose/unsubscribe prevents updates after the owning UI scope is gone.
13. **Null and refresh:** a successful `null` response remains distinguishable from unavailable data under the chosen `hasData` policy; background refresh retains usable data and a nonfatal refresh failure does not erase it.
14. **Disabled and collision:** disabled resource access issues no request and retains static UI fallback; duplicate nested aliases follow the chosen collision policy with a diagnostic.

## 14. Decisions to lock before coding

1. **Naming:** retain `$resources` for local aliases, or reuse an existing extension naming convention. Avoid introducing both `$resource` and `$resources` unless distinct semantics are justified.
2. **Expression syntax:** reuse the exact existing `$dynamic` expression and overlay syntax; standardize a portable subset.
3. **Snapshot null semantics:** define `hasData` and whether `data` may be `null` on success.
4. **Scope collision policy:** recommended reject duplicate aliases in nested scopes for V1.
5. **Transformation placement:** default to host normalization; optional `$dynamic` projection only where already portable.
6. **Capability metadata:** decide whether to publish semantic event and option schemas in the existing renderer capability catalog.
7. **Interaction profile:** define only when an actual searchable Camunda selector demonstrates the need.

## 15. Final recommendation

**Adopt a virtual-resource binding extension, not a remote-data renderer framework.**

The portable specification should require only:

```text
UI schema resource alias -> host-resolved virtual source
host publishes safe resource snapshot -> $dynamic context
$dynamic maps snapshot -> arbitrary existing renderer options
```

Everything else—HTTP transport, JWT, Camunda Cockpit CSRF headers, search algorithms, pagination cursors, cache policy, retries and API-specific transformation—belongs to the host resource adapter unless an optional portable capability demonstrably needs a declarative contract.

This gives Camunda forms the flexibility to consume remote identity services without proliferating renderers, keeps the extended spec coherent with `$dynamic`, and remains implementable in TypeScript, Kotlin, and other runtimes.
