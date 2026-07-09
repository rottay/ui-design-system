# Showroom Playwright harness

Two spec directories, two configs. Do not add a third config — every new
browser-driven gate lives under one of these two.

| | `e2e/a11y/` | `e2e/visual/` |
| --- | --- | --- |
| Config | `playwright.config.ts` | `playwright.visual.config.ts` |
| Target server | dev server (`pnpm dev`, Turbopack) | production build (`pnpm start`, `next start`) |
| What it gates | axe + focus-visible sweep (WO-GAT-04) | pixel-diff screenshots (WO-GAT-01) |
| Run | `pnpm --filter @rottay/showroom exec playwright test e2e/a11y` | `pnpm --filter @rottay/showroom run test:visual` |

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

## Scripts

- `pnpm --filter @rottay/showroom run test:visual` — run the suite, compare
  against committed baselines.
- `pnpm --filter @rottay/showroom run test:visual:approve` — regenerate
  baselines for the current platform.
- Root conveniences: `pnpm visual:test`, `pnpm visual:approve` (same commands,
  delegated via `pnpm --filter @rottay/showroom`).
