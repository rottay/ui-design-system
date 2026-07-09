# Showroom Playwright harness

Four spec directories, two configs. Do not add a third config — every new
browser-driven gate lives under one of these two.

| | `e2e/a11y/` | `e2e/visual/` | `e2e/whitelabel/` | `e2e/responsive/` |
| --- | --- | --- | --- | --- |
| Config | `playwright.config.ts` | `playwright.visual.config.ts` | `playwright.visual.config.ts` | `playwright.visual.config.ts` |
| Target server | dev server (`pnpm dev`) | production build (`pnpm start`) | production build | production build |
| What it gates | axe + focus-visible sweep (WO-GAT-04) | pixel-diff screenshots (WO-GAT-01) | hostile-tenant computed-style probe (WO-GAT-03) | 360px overflow + coarse-pointer hit areas (WO-ENG-12) |
| Run | `... exec playwright test e2e/a11y` | `... run test:visual` | `... run test:whitelabel` | `... run test:responsive` |

`playwright.visual.config.ts` matches all three of its directories, so
`pnpm --filter @rottay/showroom run test:gates` runs the visual suite, the
whitelabel probe, and the responsive probe in one invocation over one
`next start` — that is what CI's `visual` job does. `playwright.config.ts`
ignores those three directories so a bare run on the a11y config never drives
them against the dev server.

## The responsive probe (`e2e/responsive/`)

Both of its properties are measured on the chrome-free capture route, never on a
docs page: the showroom shell clips content at 360px (elements reach past the
viewport while the document does not scroll), so a shell defect and a component
defect are indistinguishable there.

`overflow-baseline.json` carries two decrease-only lists — `overflowing` (one
entry per capture cell whose document scrolls horizontally at 360px) and
`touchTargets` (one per interactive part under 44x44 on a coarse pointer).
`node packages/core/scripts/engine-token-audit.mjs --check` reads the length of
`overflowing` as its `responsive.overflowCells` ratchet, so the count cannot
grow even if this spec is skipped. Regenerate with
`RESPONSIVE_UPDATE_BASELINE=1`, which rewrites the file to the intersection with
the current run. Fix the width or the hit area; never widen the baseline.

## Why visual regression needs the production build

The dev server (Turbopack/HMR) does not paint deterministically frame to
frame — a rottay dark-ground pre-theme light-paint timing artifact was
directly observed against it. Accessibility checks (axe's DOM/CSSOM reads,
the focus sweep's computed-style reads) tolerate that because they run after
the settled DOM regardless of how many paints it took to get there. A
pixel-diff assertion cannot: it compares one exact frame against a committed
baseline, so `playwright.visual.config.ts` builds its `webServer` on top of
`pnpm --filter @rottay/showroom run start` (the `next build --webpack` output)
instead. **Build showroom before running `test:visual` locally** —
`pnpm --filter @rottay/design-system run build && pnpm --filter @rottay/showroom run build` —
the production server serves whatever is already in `.next/`, it does not
rebuild for you.

## What is covered

`e2e/visual/flagships.spec.ts` captures every WO-ENG-02 flagship gallery
(button, input, select, card, badge, table, tabs, modal) on the
`/probe/engine-modern` capture route, under both tenant palettes (rottay =
dark ground, bithire = light ground), at the 360/768/1280 viewport matrix — 8
x 2 x 3 = **48 screenshots**. Each capture waits for the heading, for
`document.fonts.ready`, and for the tenant ground to actually finish painting
(see the `waitForGroundPaint` helper in the spec) before the screenshot is
taken, and settles 300ms beyond that. Galleries are static states by WO-ENG-02
construction (no clocks, no random data) — if a cell proves non-deterministic
anyway, the fix is **in the gallery** (deterministic fixtures/settle), never a
masked region or a loosened threshold in the config.

## Approving a visual change

An **intended** visual change (you changed a token, a component, or a
gallery on purpose) is approved by regenerating the baselines and committing
the new PNGs in the same PR — the reviewer approves the pixels by reviewing
the PNG diff, same as approving any other code change:

```bash
pnpm --filter @rottay/design-system run build
pnpm --filter @rottay/showroom run build
pnpm visual:approve   # = pnpm --filter @rottay/showroom run test:visual:approve
git add packages/showroom/e2e/visual/__screenshots__
```

Run the approve command **on a machine matching the platform whose baseline
you are updating** (see below) — or, if you cannot reproduce the runner's
platform locally, download the `actual` PNGs from the failed CI run's
uploaded `visual-report` artifact and commit those directly under
`e2e/visual/__screenshots__/flagships.spec.ts/` in place of the stale
baseline with the matching name.

An **unintended** visual change (a regression) is a red `visual` job in CI:
the summary links the uploaded `visual-report` artifact, which contains the
Playwright HTML report plus every failing cell's `expected` / `actual` /
`diff` PNGs (`packages/showroom/test-results/`) — that is the evidence a
reviewer or the author uses to root-cause the regression. **Never loosen
`maxDiffPixelRatio` in `playwright.visual.config.ts`, and never mask/exclude a
region, to turn a red run green.** If a cell is genuinely flaky (not a real
regression), the gallery itself has a determinism bug — fix that.

## Platform-scoped baselines

`playwright.visual.config.ts`'s `snapshotPathTemplate` embeds `{platform}`
(`darwin` on macOS, `linux` on the self-hosted runner) in every baseline
filename, so a baseline generated on a contributor's Mac and a baseline
generated on the Linux runner coexist under different names in the same
directory — they never collide and never silently overwrite each other. The
runner generates and commits its own `-linux` baselines the first time
`test:visual:approve` runs there (typically via a maintainer running the
approve flow on/against the runner, or a PR that adds the first Linux
baseline set). A macOS contributor's local `pnpm visual:test` run compares
against the `-darwin` baselines and never touches the `-linux` ones, and vice
versa in CI.

## The whitelabel torture probe (`e2e/whitelabel/`)

Whitelabel used to be true by construction. This makes it true by proof.

`torture.spec.ts` drives `/probe/whitelabel-torture`, which renders the same
WO-ENG-02 flagship galleries under two hostile proof fixtures —
`tortureDarkBrandTheme` and `tortureLightBrandTheme` — plus a `rottay`
REFERENCE load. The fixtures are ordinary `BrandTheme` objects with garish,
clashing values in every bounded channel. They are never registered as product
tenants and never generate an artifact: because their slugs are absent from
`BUNDLED_TENANT_SLUGS`, `DesignSystemProvider` compiles them at render time
through `generateTenantCssFromResolvedVisualConfig`, which is the same path a
DB-driven customer tenant takes.

Each probed component part is read twice — once under a torture fixture, once
under `rottay` — and checked two ways:

1. **Derivation.** The part's computed value must equal the value the tenant
   declared for the token that drives it (read off `<html>`). A part painting
   its own literal cannot satisfy this.
2. **Differential.** The two loads must disagree. A part whose computed value
   is IDENTICAL under a magenta-on-black tenant and under rottay is not reading
   the tenant at all — that is a hardcode, and it is recorded as a violation.

The differential can only detect a hardcode where the two themes actually
differ on that channel, so the fixtures' hostility is itself gated: the unit
test `packages/core/src/compilers/brand-theme/tests/torture-fixtures.test.ts`
asserts every variable in `TORTURE_PROBE_VARS` compiles to a different value
under torture than under the matching first-party theme. Weakening a fixture
turns that test red rather than silently voiding a probe.

Violations are counted into `e2e/whitelabel/torture-baseline.json` and the
baseline is **decrease-only**: a run fails when a violation appears that the
baseline does not list. Fix the hardcode; never widen the baseline to absorb
one. Regenerate with `TORTURE_UPDATE_BASELINE=1 pnpm --filter @rottay/showroom
run test:whitelabel`, which rewrites the file to the INTERSECTION of the old
baseline and the current run (fixed entries drop out, new ones can never be
added).

Screenshots land in `test-artifacts/gates/gat-03/` on every run. They are
informational — a human looks at them to confirm the torture tenant is legibly
themed and the RTL column mirrors without clipping. They are deliberately NOT
pixel-diffed: a garish fixture is a probe target, not visual canon.

## Scripts

- `pnpm --filter @rottay/showroom run test:visual` — run the suite, compare
  against committed baselines.
- `pnpm --filter @rottay/showroom run test:visual:approve` — regenerate
  baselines for the current platform.
- `pnpm --filter @rottay/showroom run test:whitelabel` — run the torture probe.
- `pnpm --filter @rottay/showroom run test:gates` — both production-server
  suites in one invocation (what CI runs).
- Root conveniences: `pnpm visual:test`, `pnpm visual:approve`,
  `pnpm whitelabel:test` (same commands, delegated via `pnpm --filter`).
