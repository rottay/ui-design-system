# Testing and quality gates

What is verified, what you can run yourself, and what only runs inside the
Rottay organization. All CI jobs run on self-hosted runners; a fork PR is
validated by a maintainer, not by CI on the fork.

## 1. Test layers

Run from the repository root unless noted. `@rottay/design-system` is the
`packages/core` package; `@rottay/showroom` is `packages/showroom`.

| Layer | Tool | Scope | Command |
|---|---|---|---|
| Unit tests | Vitest | `packages/core/src/**` | `pnpm --filter @rottay/design-system run test:unit` |
| Script tests | Node test runner + Vitest | `packages/core/scripts/**/*.test.mjs` | `pnpm --filter @rottay/design-system run test:scripts` |
| Type check | `tsc --noEmit` | whole package | `pnpm --filter @rottay/design-system run typecheck` |
| Structure + ownership | custom Node scripts | source-tree conventions | `pnpm --filter @rottay/design-system run structure:check` |
| Quality gate manifest | mixed (101 blocking, 1 excluded) | whole package | `pnpm --filter @rottay/design-system run gates:ci` |
| Build | `tsc` + Vite | package output | `pnpm --filter @rottay/design-system run build` |
| Accessibility | Playwright + axe | Showroom galleries | `pnpm --filter @rottay/showroom exec playwright test e2e/a11y` |
| Visual regression / whitelabel / responsive | Playwright | Showroom production build | `pnpm --filter @rottay/showroom run test:gates` |

## 2. What runs on your machine

No organization secrets or private repositories required:

```bash
pnpm install
pnpm --filter @rottay/design-system run typecheck
pnpm --filter @rottay/design-system run test:unit
pnpm --filter @rottay/design-system run test:scripts
pnpm --filter @rottay/design-system run structure:check
pnpm --filter @rottay/design-system run build
```

`pnpm --filter @rottay/design-system run gates:ci` (`gates:ci:list` to see
every gate id) runs the full 101-gate blocking manifest, but not every gate in
it is runnable outside the organization — see §3.

## 3. What runs only in the org

A subset of blocking gates reads a private sibling repository through an
environment variable, or is only exercised by self-hosted CI:

| Gate | Reads | Reason |
|---|---|---|
| `app-ds-boundary`, `app-ds-boundary-drill` | `APP_BITHIRE_ROOT` | Checks the design-system/app boundary against the private `rottay/app-bithire` source, checked out at a pinned SHA in CI |
| `customization-worklist`, `customization-worklist-drill` | `APP_BITHIRE_ROOT` | Same boundary corpus, for the customization worklist census |
| `claim-exactness` | `DOCS_ENGINEERING_ROOT` | Verifies documentation claims against the private `rottay/docs-engineering` repository |
| Accessibility (`e2e/a11y`) | self-hosted CI only | Playwright + axe against a built Showroom; no npm script runs this locally without first building Showroom and installing browsers |
| Visual regression / whitelabel / responsive (`test:gates`) | self-hosted CI only | Pixel-diff baselines are approved in CI; running locally without the reference baselines does not prove anything |
| Pack / publish gates (`prepack` chain) | GitHub Packages credentials | Exercised at release time, not on every PR |

Without `APP_BITHIRE_ROOT` or `DOCS_ENGINEERING_ROOT` set, the gates that read
them fail closed rather than silently passing — that is the intended,
documented behavior, not a bug to work around locally.

## 4. Quality gates

`packages/core/scripts/check/automation/gates/manifest/index.mjs` is the
single inventory of gates CI runs — not the `pretest` npm hook (which never
fires under `pnpm test:ci`) and not a second list in YAML. Each entry is
`{ id, run, blocking }`; a `blocking: false` entry **requires** a matching
`excluded: { reason, owner }` — there is no third state. A gate declared
blocking that could never actually block (for example, a check piped through
`|| echo "::warning"`) is exactly the failure mode this manifest exists to
make impossible.

List every gate and its state:

```bash
pnpm --filter @rottay/design-system run gates:ci:list
```

## 5. Visual regression

Playwright drives `e2e/visual/` in `packages/showroom` against a production
build (`next build && next start`), diffing screenshots per component per
engine per tenant. A baseline changes only via an explicit re-approval:

```bash
pnpm visual:test      # run, compare against committed baselines
pnpm visual:approve   # re-run with --update-snapshots
```

## 6. Accessibility

`e2e/a11y` in `packages/showroom` runs `axe.spec.ts` and `focus.spec.ts`
against the flagship component galleries under both tenant palettes — an axe
scan plus a keyboard focus-order sweep. It requires a built Showroom and a
Playwright Chromium install, and is exercised on self-hosted CI (see §3).

## 7. Performance budget

`pnpm --filter @rottay/design-system run analyze` enforces size ceilings for
every published bundle (main entry, icons, marks, charts, motion, per-engine
CSS) — full ceilings and current measurements live in
[`packages/core/docs/quality/performance-budget/index.md`](../packages/core/docs/quality/performance-budget/index.md).
As of that document's last measurement (2026-08-31), several lanes exceed
their ceiling — the flagship component fixtures, the aggregate JS footprint,
and the generic/Rottay/BitHire CSS bundles — and are reported failing rather
than silently rebaselined.

## 8. Adding a gate

A production script under `scripts/` must be named by at least one of three
legitimate wiring channels, or the `wiring-coverage` gate reports it as an
orphan:

1. `scripts/check/automation/gates/manifest/index.mjs` — the CI gate
   inventory (§4).
2. An npm lifecycle hook in `packages/core/package.json` — `prebuild`,
   `postbuild`, `prepack`, `pretest`, or a script one of those chains to.
3. `.github/workflows/ci.yml` — a step that invokes the script directly.

Both directions are checked: a script with no channel is an orphan; a channel
that names a script which does not exist fails `workflow-script-wiring` or the
manifest's own load-time validation. Register a new gate in the manifest with
an explicit `id` and `run` argv, run `pnpm --filter @rottay/design-system run
gates:ci:list` to confirm it is listed, and if it cannot run outside the
organization, add it to §3 of this document with the environment variable or
CI-only reason it needs.
