# Migration packet — `app-bithire`

Status: delegable brief, written by WO-CON-04 (2026-09-07) against design-system
working tree `dbe18dea`. Owner of execution: the `app-bithire` maintainers, in
the `app-bithire` repository, tracked as work orders in `app-bithire/roadmap/`.
Nothing in this packet is executed from the design-system repository.

Authority: [`../../index.md`](../../index.md) is the contract; this file is only the
ordered work it implies for one app. Where the two disagree, the contract wins
and this file is the defect.

Scope note (owner, 2026-09-05): app-bithire is the only APP track in flight.
`app-evnto` and `app-platform` are deferred — see
[`app-evnto`](../app-evnto/index.md) and [`app-platform`](../app-platform/index.md).

---

## 0. Where app-bithire stands today (measured, not assumed)

| Fact | Value | Source |
|---|---|---|
| Pinned design-system version | `2.19.37` | `app-bithire/package.json`, `pnpm-lock.yaml`, installed tarball |
| Design-system specifiers in the app | 2102 | contract §1.4 (2026-09-05) |
| …that land on the guaranteed surface | 2086 (**99.2 %**) | contract §1.4 |
| Rule findings when the rule reaches the app | **14** — 11 in `src/**`, 3 in `tests/**` | contract §1.4 |
| Findings by subpath | `./icons/presets/bithire` 11 · `./tenant-theme-canary-fixtures` 2 · `./hooks-manifest` 1 | contract §1.4 |
| Hand-written mount files | `src/core/lib/theme/runtime-tenant-theme/{ssr,contracts,artifact-resolution,visual-authority,presentation-profile,provider-guard}` | X-02 |

The pinned tarball does **not** contain `@rottay/no-unsanctioned-ds-subpath`
(its `dist/eslint.js` has zero matches) and still exports `./commercial`,
`./commercial.css` and `./styles/platform`. So today the app is not failing;
it will start reporting on the first published version built from a tree that
carries the rule, which `app-bithire/eslint.config.mjs` already inherits through
`designSystemConfigs.recommended`.

---

## 1. The risks this packet closes, restricted to app-bithire

`audit/70-plan/risks` §2 numbers six consumer changes. Three are app-bithire's;
three belong to the deferred apps and are listed only so nobody re-derives them.

| ID | Applies here | What app-bithire must change |
|---|---|---|
| **X-01** | yes | Its visual-authority declaration. The provider is handed four extra props (`tenantConfig`, `tenantOverrides`, `vertical`, `forceEngine`, `productProfile`) beside `visualAuthority`; the contract §2 leaves only the tenant identity and the typed `visualAuthority` declaration. Each surviving prop needs a written reason or it goes. |
| **X-02** | yes | Stop mounting `<style>` by hand. The trio (`ssr`, `contracts`, `artifact-resolution`) plus the layout's own `data-tenant`/`data-digest` pair is replaced by one `mountTenantTheme` call. The hand-typed attribute names are not the ones the mount proof reads, so the CSS can be correct in the document and still be refused. |
| **X-05** | yes (indirect) | `@rottay/tenancy@3.0.0` carries a COPY of the tenant-document contract (schema + validator + hydration), drifted by 4 retired tokens present and 10 design-system tokens absent. app-bithire depends on that package; the copy is deleted and the design-system contract consumed instead. Owner: `@rottay/tenancy`, but app-bithire is the consumer that has to move with it. |
| X-03 | no | `app-platform` only (own compiler, third validator, `vertical="platform"`). |
| X-04 | no | `app-evnto` only (own pre-paint script, missing `data-engine`). |
| X-06 | no | `app-platform` only (`[data-engine='classic']` patches in `globals.css`). |

Two unnumbered rows of the same table touch app-bithire and are **not** part of
this packet: the effects migration (`GridPattern` / `GradientBackground` /
`AuroraEffect` / `ambient-backdrop`) waits on D-19, and the legacy-icon
end-of-life (502 of 1112 files across the three apps) is its own programme.

---

## 2. The steps, in order

Each step leaves the app deployable. Do not batch them.

### Step 1 — Take a design-system version that carries the contract

```bash
# in app-bithire
pnpm add @rottay/design-system@<first published version built from a tree with WO-CON-01>
```

Nothing else changes in this step. Verify the rule arrived:

```bash
node -e "console.log(Object.keys(require('@rottay/design-system/eslint').rules))"
# expect: [..., 'no-unsanctioned-ds-subpath', ...]
```

### Step 2 — Land the rule with a decrease-only baseline, so the build stays green

`app-bithire/eslint.config.mjs` already extends `designSystemConfigs.recommended`.
Add the transitional baseline in the same commit as the version bump:

```js
'@rottay/no-unsanctioned-ds-subpath': ['error', {
  allowSubpaths: [
    './icons/presets/bithire',
    './tenant-theme-canary-fixtures',
    './hooks-manifest',
  ],
}],
```

```bash
pnpm exec eslint src/ --max-warnings 0     # expect 0 with the baseline, 11 without it
pnpm exec eslint tests/ --max-warnings 0   # expect 0 with the baseline, 3 without it
```

The array is decrease-only: entries leave as step 3 migrates them, and none is
ever added. There is **no codemod** for this step — WO-CON-01 shipped a rule and
a table, not a rewriter, because two of the three subpaths need a decision the
app owns (which preset, which fixture) rather than a mechanical substitution.

> Do **not** run `pnpm --filter @rottay/design-system public-entrypoints:codemod`
> here. That codemod rewrites root-barrel imports INTO per-component subpaths,
> which is the direction the consumer contract retires (`./primitives/*`,
> `./patterns/*`, `./structures/*`, `./surfaces/*` are all `retire-by
> WO-RET-01`). It predates this contract and is not part of this migration.

### Step 3 — Empty the baseline

| Entry | What it is | Where it goes |
|---|---|---|
| `./icons/presets/bithire` (11) | product semantics inside the shared corpus (F-113) | the preset moves to the vertical; until WO-RET-01 lands the replacement, import the semantic names from `@rottay/design-system/icons` and keep the product mapping in `src/vertical/`. |
| `./tenant-theme-canary-fixtures` (2) | a published TEST fixture (F-42) | the canary owns its own fixture in `app-bithire/tests/`; the design system stops publishing it in WO-RET-01. |
| `./hooks-manifest` (1) | internal tooling manifest | delete the read; nothing in a product path needs it. |

Re-run the two `eslint` commands above after each removal and drop the entry
from `allowSubpaths` in the same commit.

### Step 4 — Replace the mount trio with one call (X-02)

The design system ships the codemod. It is run FROM the design-system
repository against a file path in the app, and it never writes without
`--write`:

```bash
# dry run first; it prints the operations it would perform and refuses anything
# whose shape it does not recognise
node packages/core/scripts/maintain/mount-tenant-theme/index.mjs \
  --file /absolute/path/to/app-bithire/src/app/layout.tsx \
  --vertical bithire \
  --artifact runtimeArtifact \
  --document runtimeDocument \
  --theme-mode configuredTheme \
  --locale lang

# then, once the diff is what you expect
node packages/core/scripts/maintain/mount-tenant-theme/index.mjs \
  --file /absolute/path/to/app-bithire/src/app/layout.tsx \
  --vertical bithire --artifact runtimeArtifact --document runtimeDocument \
  --theme-mode configuredTheme --locale lang --write
```

What it does, and what it refuses, is the codemod's own contract
(`packages/core/scripts/maintain/mount-tenant-theme/index.mjs`): it
replaces the `resolveDocumentRootAttributes(...)` call and the hand-written
tenant `<style>` element with `const { rootAttributes, styleElements } = await
mountTenantTheme(...)`, removes `resolveDocumentRootAttributes` from the server
import, and REPORTS — it does not delete — the trio symbols that are left
orphaned (`RUNTIME_TENANT_THEME_STYLE_ID` is the expected one). A layout that is
not `async`, that carries two hand-written tenant `<style>` elements, or that has
already been migrated is refused by name rather than half-rewritten.

After the transform, by hand:

1. delete the orphaned trio members the codemod reported;
2. keep in the trio only what the design system cannot own — the app's own
   database read;
3. `pnpm typecheck && pnpm build`.

The app keeps passing `artifact:` to the call. That input is RETAINED, not
dated: WO-EMI-02 keeps accepting it and verifies the supplied artifact against
its own compile. It can be retired only by a 3.0 changeset with its own codemod
(contract §5, WO-CON-05).

### Step 5 — Reduce the provider to the contract (X-01)

`src/core/providers/index.tsx` passes `tenantSlug`, `tenantConfig`,
`visualAuthority`, `tenantOverrides`, `vertical`, `forceEngine`,
`productProfile` and `locale`. The contract's client half is the tenant identity
plus the TYPED visual-authority declaration:

```tsx
<DesignSystemProvider
  tenantSlug={cssTenantSlug}
  visualAuthority={{ authority: 'compiled-artifact', artifact }}
>
```

`visualAuthority="compiled-artifact"` as a bare STRING is refused: it resolves
as `invalid-declaration` and the provider blocks, because a string carries
neither the coverage to suppress nor the bytes to verify. Omitting the prop
entirely is the honest default for a bundled tenant with no visual payload.
Every other prop that survives this step needs a written reason in the PR;
`vertical` and `forceEngine` in particular restate what the vertical roster
already answers.

### Step 6 — Tenant documents (X-05, contract §3)

app-bithire READS a tenant's compiled artifact; `app-platform` WRITES the
document, and that half is deferred. What app-bithire owns here is the drifted
copy in `@rottay/tenancy@3.0.0`: delete the schema/validator/hydration copy and
consume `validateTenantThemeDocument` / `parseTenantThemeDocument` /
`hydrateTenantThemeConfig` from `@rottay/design-system/server`.

WO-CON-03 shipped no CLI for this. The migration is the published, total,
fail-closed function `migrateDocumentV1ToV2(document)`, which either returns a
v2 document or refuses BY THE NAME of the field it could not carry
(`ThemePatchMigrationError`).

That seam is now closed (WO-CON-06). A tenant row that has moved to v2 compiles
its artifact through `compileTenantThemeDocumentV2({ document, tenantId, slug,
verticalKey, rowVersion })`, which returns the artifact `mountTenantTheme`
requires for a `tenant-document` origin, the door's admission report, and the
decision-provenance ledger the artifact was compiled under. It does NOT flatten
the document to v1 first: flattening drops the `plan`, and a publish that cannot
state its plan cannot be judged by the tier station that judged the preview of
the same document.

app-bithire therefore keeps ONE row. `hydrateTenantThemeConfig` still refuses a
v2 document by name -- that is the v1 door, and it stays the v1 door -- so a
call site that still hands it a v2 document is a call site that has not
migrated. Both facts are executable in
`packages/core/tests/integration/consumer/index.test.ts` ("publishes the v2
document through the real path, keeping one row" and "keeps the v1 door refusing
a v2 document by name").

That gap is closed too (WO-CON-06 step 2): `migrateDocumentV1ToV2` now carries
`general.states.emphasis` / `general.states.focusStyle` into the
`states.emphasis` / `states.focus-style` decisions, and refuses a value outside
either closed domain at its own v1 keypath rather than dropping it. Both rows
are Standard, so a row that authored only these still derives the `standard`
plan.

### Step 7 — `oauth-transition` leaves the design system

See §3. It is last because it is the only step that removes symbols from the
GUARANTEED root surface, and the app is protected from it only by its version
pin.

---

## 3. `oauth-transition`: what happened and what app-bithire does

### What changed in the design system

`@rottay/design-system/surfaces/oauth-transition` **no longer exists**. The
subpath is removed from `package.json` `exports`, from
`contracts/package/entrypoints/index.json`, from the consumer-contract
disposition table (121 → 120 published subpaths) and from the
`@rottay/no-unsanctioned-ds-subpath` mirror. The following are gone with it:

| Symbol | Kind |
|---|---|
| `OAuthTransitionScreen` | component |
| `getOAuthTransitionApp` | function |
| `getOAuthTransitionDefaultVariant` | function |
| `getOAuthTransitionPool` | function |
| `getOAuthTransitionProvider` | function |
| `getOAuthTransitionVariant` | function |
| `isOAuthProvider` | type guard |
| `isOAuthTransitionVariantId` | type guard |
| `pickOAuthTransitionVariant` | function |
| `OAuthProvider`, `OAuthTransition*` | types |

Also deleted: `foundation/tokens/css/presentation/components/skin/oauth-transition/index.css`
(2,277 lines) and its `@import` from the base entrypoint, so it no longer ships
in `styles.css` or in any vertical bundle.

**Where the app actually imports them.** The four production routes do **not**
import the retired subpath — they import the ROOT specifier, which is
`guaranteed`, and the symbols were removed from the root barrel too:

```ts
import {
  getOAuthTransitionDefaultVariant,
  getOAuthTransitionProvider,
  isOAuthProvider,
  OAuthTransitionScreen,
} from "@rottay/design-system";
```

That is why this step is a version event, not a lint event: nothing the app
imports is on the forbidden list, and no rule will warn. app-bithire keeps
building because it pins `2.19.37`, a published version whose root barrel still
carries the symbols. The routes break on the first upgrade past the removal, so
this step is a PREREQUISITE of step 1 for anyone upgrading past it.

### Why it left, not "why it moved"

It was a parallel design system living inside the design system:

- **0** `var(--ds-` reads on the screen; **13** in the whole 2,277-line skin; **491** bare `px`.
- a private token namespace, `--rh-*`, that no tenant control could reach (`grep -rc -- "--rh-" src` is now `0`).
- **6** hardcoded hex palettes (`quiet-beam-light`, `watchtower-sweep-dark`, `signal-line-{light,dark}`, `halo-orbit-{light,dark}`).
- product identity as source: `OAUTH_TRANSITION_APPS` named `bithire | evnto | rottay | auth`, with their display names, letter marks (`'B'`, `'E'`, `'R'`) and English copy ("Hiring vertical", "Events vertical").
- `pickOAuthTransitionVariant` chose the visible skin with a random number, so SSR and the client disagreed by construction.

A tenant could not restyle any of it, and nothing in it was domain-agnostic. Per
the design-system ownership contract it belongs to the consuming app.

### The four production routes and what each one does now

| # | Route | Current import | Migration |
|---|---|---|---|
| 1 | `app-bithire/src/app/oauth/redirect/page.tsx` | `getOAuthTransitionDefaultVariant("bithire")`, `getOAuthTransitionProvider`, `isOAuthProvider`, `OAuthTransitionScreen` from `@rottay/design-system` | copy the surface into the app |
| 2 | `app-bithire/src/app/(auth)/callback/page.tsx` | the same four plus `isOAuthTransitionVariantId`, from `@rottay/design-system` | copy the surface into the app |
| 3 | `app-evnto/src/app/oauth/redirect/page.tsx` | root specifier | deferred; see [`app-evnto`](../app-evnto/index.md) |
| 4 | `app-evnto/src/app/(auth)/callback/page.tsx` | root specifier | deferred; see [`app-evnto`](../app-evnto/index.md) |

**Step 1 — literal copy (unblocks the routes, changes no pixel).** In the app,
create `src/components/oauth-transition/` and copy, byte for byte, from design-system
commit `fc84175740f1736f667563d598e3da7dd7c34b7a`:

```
packages/core/src/components/surfaces/presentation/pages/experience/oauth-transition/
  foundation/contracts/index.ts
  runtime/config/index.ts
  presentation/screen/index.tsx
  presentation/screen/provider-icons/index.tsx
  index.ts
packages/core/src/foundation/tokens/css/presentation/components/skin/oauth-transition/index.css
```

Then change the import in the two app-bithire routes:

```diff
-import { OAuthTransitionScreen, getOAuthTransitionDefaultVariant } from '@rottay/design-system';
+import { OAuthTransitionScreen, getOAuthTransitionDefaultVariant } from '@/components/oauth-transition';
```

and import the skin once from the app's global stylesheet. Two adjustments the
copy needs:

1. **`pickOAuthTransitionVariant` must stop rolling a die.** The design-system copy used
   `source[Math.floor(Math.random() * source.length)]`, which renders one variant on the
   server and another on the client. Replace it with a deterministic pick — the app already
   knows its `appId`, so `getOAuthTransitionDefaultVariant(appId)` is the drop-in.
2. **Trim the app roster to the app's own identity.** `OAUTH_TRANSITION_APPS` carries all four
   products; each app keeps only its own row plus `auth`.

**Step 2 — re-express on design-system channels (do it in the app, not in the design
system).** The screen is a full-bleed page with a panel, a progress trace and a provider
mark. Rebuild it from `@rottay/design-system` primitives (`Box`, `Flex`, `Stack`, `Text`,
`Card`) reading `var(--ds-color-*)`, `var(--ds-radius-*)`, `var(--ds-space-*)` and
`var(--ds-motion-*)`, so the tenant's compiled artifact paints it. The six `--rh-*` palettes
become one theme-driven surface; the per-variant identity becomes a bounded app-side choice.

**What the design system still gives you:** `BrandMark` / `CloudServiceMark`
(`@rottay/design-system/marks`) for the provider glyphs, so the copied
`provider-icons` module can be retired in step 2 rather than carried forever. Do
NOT import Phosphor/Lucide directly to replace it.

### Visual reference: the five baselines, and where they live now

The Playwright visual baselines for this surface existed at design-system ref
**`dbe18dea`** under
`packages/showroom/e2e/visual/__screenshots__/oauth-transition.spec.ts/`:

```
oauth-transition-dark-redirect-desktop-chromium-darwin.png
oauth-transition-dark-return-compact-mobile-chromium-darwin.png
oauth-transition-dark-return-desktop-chromium-darwin.png
oauth-transition-light-redirect-desktop-chromium-darwin.png
oauth-transition-light-return-desktop-chromium-darwin.png
```

**They are DELETED as of WO-CON-04.** Their spec was removed with the surface, so
they can never be regenerated and nothing compares against them; keeping 4.8 MB
of images no runner reads would have made the tree look like it still owned the
surface. Git history is the reference: read them at that ref, and use them as
the visual comparison for step 1 (the literal copy must change no pixel) and as
the "before" for step 2.

```bash
# in the ui-design-system repository
git show dbe18dea:packages/showroom/e2e/visual/__screenshots__/oauth-transition.spec.ts/oauth-transition-light-redirect-desktop-chromium-darwin.png > /tmp/oauth-light-redirect.png
```

Re-baseline in the app after step 1, not before: the app owns the surface now,
so the app owns its baselines.

### Verification per app

```bash
grep -rn "surfaces/oauth-transition" src            # nothing
grep -rn "OAuthTransition" src | grep "@rottay"     # nothing
grep -rn "Math.random" src/components/oauth-transition  # nothing
```

and the two routes render.

---

## 4. Acceptance

The packet is done when all of the following hold in `app-bithire`:

1. `pnpm exec eslint src/ tests/ --max-warnings 0` passes with an **empty**
   `allowSubpaths` array.
2. `grep -rn "resolveDocumentRootAttributes\|data-digest=\|data-tenant=" src/app` returns
   nothing: the root scope and the tenant `<style>` come from `mountTenantTheme` only.
3. `src/core/lib/theme/runtime-tenant-theme/` contains only the app's own
   database read; the `ssr` / `contracts` / `artifact-resolution` trio is gone.
4. `DesignSystemProvider` receives the tenant identity and a TYPED
   `visualAuthority` declaration; every other prop is justified in the PR body.
5. No `@rottay/tenancy` copy of the tenant-document schema, validator or
   hydration survives.
6. The four `oauth-transition` symbols resolve from `@/components/oauth-transition`,
   and both routes render against the `dbe18dea` baselines.
7. `pnpm typecheck && pnpm build && pnpm test` pass, and the app runs on a
   design-system version published from a tree that carries WO-CON-01…04.

## 5. What the design system will NOT do for you

- It will not edit this repository. The design-system track is forbidden from touching app repos
  (contract §7).
- It will not keep a symbol alive because an app still imports it, except through
  the versioned path: a guaranteed signature is removed only in the 3.0
  changeset of WO-RET-01, with a codemod, announced through the STATUS contract
  diff (WO-CON-05).
- It will not accept an app-specific component back. If this migration finds a
  capability the design system genuinely lacks, file a work order through
  `ui-design-system/roadmap/` with the promote-to-design-system test — never a
  `_shared/` bridge and never an inline restyle.
