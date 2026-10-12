# Dispatch record — the DB-to-first-paint probe (WO-ARC-21, app side)

Cross-app record. **Status: frozen, not dispatched.** This file is the contract
the owner authorizes under D-31 before any application repository is touched for
WO-ARC-21. It commits no application work, and nothing in it has been executed
in an application. The design-system track edits no application repository
(contract §7); `roadmap/README.md` states the split: design-system preparation
proceeds, the application half needs an explicit authorized cross-repo packet.

Scope note for the authorizer: the registry entry lists all three applications
under `touchedRepos`, and its notes narrow the scope to `app-bithire` under
D-31. This record defines all three probes so that either reading can be
authorized without rewriting it; [`app-evnto`](../app-evnto/index.md) and
[`app-platform`](../app-platform/index.md) stay deferred packets until the owner
says otherwise.

## 1. What the design-system side already proves

The design system reads no database. Its boundary is the bytes an application's
own read returned, and three in-repo legs prove that boundary without an
application:

| Leg | Where | What it proves |
| --- | --- | --- |
| Row = document (law 4) and row -> hydrate -> compile -> mount = static (law 5) | `tests/integration/transport-parity/index.test.ts`, gate `theme-transport-parity` | A row serialized as `json` and as PostgreSQL's reordered `jsonb::text` compiles to the byte-identical artifact, mounted `<style>` and root projection as the in-memory config |
| Planted mutants 3-5 | `tests/integration/transport-parity/drill/index.test.ts`, gate `transport-parity-drill` | A changed document byte moves the digest; a changed `rowVersion` column is refused against the trusted identity; bytes that are not exactly one row are refused by name |
| First paint from row bytes | `packages/showroom/e2e/whitelabel/serialized-row-round-trip.spec.ts` on `/probe/whitelabel-divergence?row=json\|jsonb` | The served tenant `<style>` and root stamp are the static path's bytes; with hydration held the first frame is pixel-identical; after hydration the client admits the same digest |

The row shape those legs use is the one `hydrateTenantThemeConfig` already
takes: the JSONB `document` plus the four trusted columns of
`TenantThemeConfigIdentity` (`tenantId`, `slug`, `verticalKey`, `rowVersion`).
How an application spells its own columns is its mapping. Measured on
2026-10-12, all three applications read `whitelabel.config.tenantTheme` as the
document, the whitelabel row's `version` as `rowVersion`, its `verticalKey`, and
the tenant record's `slug`, and compile at request time; none stores a compiled
artifact.

What these legs do NOT prove, and the application probe exists for: that an
application's real read returns those bytes, that a WRITE is reflected at the
next first paint, and that the application's own layout emits what the mount
returned.

## 2. The probe, common to every application

One Playwright spec per application, in the application's own e2e tree, against
its production build. It imports nothing from this repository's `tests/`; the
expected values are recomputed in the spec from the row it wrote, through
`@rottay/design-system/server`.

**Precondition.** The application runs a design-system version that carries the
consumer contract and has adopted `mountTenantTheme` (its migration packet, risk
X-02). The assertions below read the mount's own proof attributes; an
application still stamping `id="ds-runtime-tenant-theme"` / `data-digest` by
hand has nothing for them to read and is not ready to be probed.

**Tenant fixture.** The two W4 certification documents,
`divergence-sober` and `divergence-editorial`
(`tests/fixtures/brand-themes/`, copied into the application as the showroom
copies them, with a deep-equality assertion against the source). They are probe
tenants: seeded by the spec through the application's own write path into a
test database, removed afterwards, and never registered as product tenants.

**The assertions, in order.**

1. *Write.* Seed the tenant and its theme row at `rowVersion` N with the sober
   document, through the owning module's exported use case.
2. *Served bytes, no browser.* `GET` the probe route for that tenant. The
   response carries exactly one `<style>` with
   `data-ds-tenant-theme-digest`, `data-ds-tenant-theme-slug` and
   `data-ds-tenant-theme-vertical`; its digest and its css equal
   `compileTenantThemeConfig(hydrateTenantThemeConfig(document, identity, { expectedIdentity }))`
   computed in the spec for the row just written.
3. *First paint.* With `/_next/static/chunks/**` held so React cannot hydrate,
   the root carries `data-ds-root`, `data-vertical` and `data-tenant` for that
   tenant, and the computed `--ds-type-scale` on the root is the document's
   (`0.96`). This is the frame a user sees before any script runs.
4. *The write is reflected.* Replace the row with the editorial document at
   `rowVersion` N+1. The next `GET` serves a different digest, equal to the
   recomputed one, and the held first paint reads `--ds-type-scale: 1.06`. An
   in-process artifact cache that kept serving version N fails here.
5. *Hydration admits it.* Release the chunks; hydration commits, the provider
   admits the compiled artifact, and the console carries no visual-authority
   refusal.
6. *Disabled arm.* With the application's switch off (§4), the same route
   serves zero tenant `<style>` elements and the vertical's own root
   projection, for the sober row and for the editorial row alike.

A probe that passes 2 and 3 on a document equal to the vertical baseline proves
nothing; assertion 4 is what makes the round-trip non-vacuous, and it may not be
dropped or replaced by a second static load.

## 3. Per application

Measured read-only on 2026-10-12. Each application is on
`@rottay/design-system` 2.19.37.

### app-bithire (`3d9691fbe7`) — active packet

| | |
| --- | --- |
| Route | `/login` (`src/app/(auth)/login/page.tsx`), resolved by host; the existing two-systems support already drives a tenant host through `x-forwarded-host` under `BITHIRE_TRUST_PROXY_HOST_HEADERS=true` |
| Row read | `getTenantBranding` (`src/core/lib/tenancy/get-tenant-branding/index.ts`), through `@rottay/tenancy` use cases; hydration and compile in `src/core/lib/theme/runtime-tenant-theme/artifact-resolution/index.ts` |
| Fixture | both W4 documents verbatim, `verticalKey: "bithire"` |
| Spec home | `tests/e2e/`, beside `two-systems/divergence.spec.ts`; no dedicated package script runs that directory today, so the packet adds one |
| Gap the packet closes first | the layout stamps `data-digest` by hand and the read path has no disable switch; the in-process cache is keyed `tenantId:rowVersion:compilerVersion`, which assertion 4 exercises |

### app-evnto (`517dcdd31`) — deferred packet

| | |
| --- | --- |
| Route | `/login` (`src/app/(auth)/login/page.tsx`); `src/proxy.ts` resolves the host and sets `x-tenant-slug` |
| Row read | `getTenantBranding` (`src/core/lib/tenancy/get-tenant-branding.ts`), which queries `tenants` and `whitelabelConfigs` directly |
| Fixture | both W4 documents with `verticalKey: "evnto"`; measured, both compile under the evnto envelope with zero contrast adjustments and keep their type scales |
| Spec home | `tests/e2e/` (`playwright.config.ts`); no e2e spec covers tenant theming today |
| Gap the packet closes first | X-01, X-02 and X-04 of its packet; a failed read currently falls back to the static baseline silently, which would let assertions 2-4 pass on the wrong bytes unless the spec asserts the digest |

The direct table read is recorded as found, not endorsed: whether it stands
against the no-cross-module-queries rule is the application owner's call and
outside this record.

### app-platform (`c1e12d451`) — deferred packet

| | |
| --- | --- |
| Route | `/login` (`src/app/(auth)/login/page.tsx`); `src/proxy.ts` resolves the host, the layout reads `x-tenant-slug` |
| Row read | `getTenantBranding` (`src/core/lib/tenancy/get-tenant-branding.ts`) on `access.tenancy_whitelabel_configs` |
| Fixture | both W4 documents with `verticalKey: "rottay"`; measured, both compile under the rottay envelope with zero adjustments. `platform` is not a first-party vertical and has no envelope, so a row naming it cannot be probed |
| Spec home | `tests/e2e/` (`playwright.config.ts`); no e2e spec covers tenant theming today |
| Gap the packet closes first | the root layout emits no tenant `<style>` and no `data-ds-root` / `data-vertical`, and `branding-bounds` keeps only `normalizedAppearance` from its compile, discarding the css and digest; X-02 and X-03 land before the probe can read anything |

app-platform is the sanctioned DB-driven-branding exception and the WRITER of
the tenant document. Its probe may write through its own publish path instead of
a seed, which is the stronger form of assertion 4.

## 4. Execution control

Verbatim from the work order, with the application-side meaning of each term.

- **Rollback.** Revert the application-side `TenantThemeConfig` plumb, per
  application. The design-system schema and compiler stay on the certified
  static path. The design-system side of this work order ships tests, a showroom
  probe and this record, and changes no published runtime, so no design-system
  release needs reverting.
- **Disable.** The round-trip is disabled per vertical application until the W4
  exit certification passes. No application has such a switch today (measured:
  only bundled slugs bypass the read), so each packet adds one. Its name is the
  application's; its behaviour is fixed here: off means
  `mountTenantTheme(staticThemeIntent(vertical))`, no tenant `<style>` and no
  theme-row read; assertion 6 checks the first two from outside. It ships off.
- **Telemetry.** Gate results for the acceptance — the probe's own output
  (served digest per `rowVersion`, first-paint readings), `theme-transport-parity`
  and its drill, and the W4 divergence certification — plus the
  `engine-token-audit` counter deltas before and after.
- **Stop.** Stop if any decrease-only counter regresses, or if the acceptance
  cannot pass without weakening a floor. A probe that can only pass by dropping
  assertion 4, by loosening a digest equality to a prefix or a presence check,
  or by reading the row from anything but the application's own database read
  is the second case.

## 5. What authorizing this record does and does not grant

It grants one bounded cross-repo packet per authorized application: the disable
switch, the probe spec and its script, and the fixture copy. It does not grant
the rest of that application's migration packet, a design-system release, a
change to any floor or baseline, or a database migration; an existing customer
database is never wiped or reseeded to run the probe.
