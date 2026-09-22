import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ADMISSIBLE_IMPACT,
  cellKey,
  GROUNDS,
  INADMISSIBLE_IMPACT,
  ledgerKey,
  publication,
  readLedger,
  SCENE_CASES,
  paintedFloor,
  scenePath,
  SCENES,
  type Finding,
} from './baseline';

// ---------------------------------------------------------------------------
// WO-INV-03 — the route-level axe batch, over the DS reference lab.
//
// RETARGETED from /probe/engine-modern, which cannot serve this matrix: its
// SurfaceTenant union is rottay | bithire | evnto, so there is no SECOND
// BitHire tenant and the WO's "Modern x bithire (two tenants)" line is
// unsatisfiable there. /probe/ds-reference has exactly two BitHire-vertical
// grounds — `bithire`, a static FlatTheme stamped as attributes, and
// `the-management`, a published DB document compiled and SSR-embedded as an
// artifact — over 25 identical scene routes that between them render all 24
// primitives/inputs families.
//
// SINGLE OWNER. Family-level axe is WO-EVI-02's harness (78 suites over
// tests/support/family-causality + AXE_DEBT); this adds no family pin. Route
// level — assembled page, real bundle, real SSR artifact, real tenant document
// — is this WO's, and nothing else measures it.
//
// NOT YET RUN. 50 page loads on one worker is a booked serial slot, and the
// batch is gated off until the DT takes it, so landing it cannot red the CI
// a11y job over findings nobody has looked at:
//   pnpm --filter @rottay/showroom run build
//   DS_AXE_ROUTE_BATCH=1 pnpm --filter @rottay/showroom exec playwright test \
//     a11y/axe.spec.ts --config playwright.visual.config.ts
// The structural half of this contract — the ledger's laws and the parsed-JSON
// assertion of Q10 — is in axe-baseline.spec.ts and runs on EVERY CI pass.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const ledgerPath = join(here, 'axe-baseline.json');
const repoRoot = resolve(here, '../../../..');
const reportPath = join(
  repoRoot,
  'packages/core/artifacts/quality/audits/accessibility/runs/axe/index.json',
);

/**
 * PRODUCTION SERVER, not `pnpm dev` — this spec runs on
 * playwright.visual.config.ts. `pnpm dev` compiles every route on demand, and
 * across 50 serial navigations of ~90-family scenes the process died mid-batch
 * (monochrome: ERR_CONNECTION_REFUSED after ~12 minutes). Production serves
 * prebuilt routes, so there is no per-route compile to absorb and the old
 * compile primer is gone with its premise.
 */
const NAVIGATE_BUDGET_MS = 30_000;
const LOAD_BUDGET_MS = 30_000;
const READY_BUDGET_MS = 30_000;
/**
 * The final paint settle. A fixed window, not a network condition: see
 * `settle()` for why `networkidle` was removed.
 */
const QUIET_MS = 400;
/**
 * EVERY wait below is individually bounded, so this is a backstop rather than
 * the mechanism. It is the pathological sum for two grounds — two navigations,
 * load, the ready predicate and the settle — and no single call can reach it
 * on its own.
 */
const SCENE_BUDGET_MS =
  (NAVIGATE_BUDGET_MS * 2 + LOAD_BUDGET_MS + READY_BUDGET_MS + QUIET_MS) * 2;

/** One bounded retry, and only for a timeout — every other failure is real. */
async function navigate(page: import('@playwright/test').Page, path: string) {
  try {
    return await page.goto(path, { waitUntil: 'domcontentloaded', timeout: NAVIGATE_BUDGET_MS });
  } catch (error) {
    if (!(error instanceof Error) || !/Timeout|timeout/.test(error.message)) throw error;
    // Against a prebuilt route a timeout is transient, so it is worth exactly
    // one retry; a genuinely broken route times out twice and still fails.
    return await page.goto(path, { waitUntil: 'domcontentloaded', timeout: NAVIGATE_BUDGET_MS });
  }
}

/**
 * A scene is ready when the route really served it, the tenant scope is
 * stamped, and the provider has actually painted. All three are load-bearing:
 * a 404 from a scene that fails closed on a missing `?only=` still carries the
 * stamp, and the DB ground defers its provider past hydration
 * (ground/client-only.tsx), so a run that waited only on `data-tenant` would
 * measure an empty body and report a clean page.
 *
 * WHY `networkidle` IS GONE. It waits for a 500ms window with no connections,
 * which is a property of the SERVER'S LOAD, not of the page being ready — and
 * it was called with no timeout, so `navigationTimeout` (0 by default) let one
 * call consume the entire scene budget. Measured in isolation,
 * `component-behaviors` reaches idle on both grounds with zero pending
 * requests; under a 50-route serial batch the same page did not, and the
 * unbounded wait burned the whole budget. A signal that can legitimately never
 * arrive must never be waited on without a bound.
 *
 * WHAT THE TRADE LOSES. `load` plus the painted floor plus a fixed quiet
 * window cannot see content that arrives from a LATE XHR — a component that
 * fetches on mount and renders results after the window closes, while already
 * having enough nodes to clear the painted floor, is audited in its pre-fetch
 * state. Today's lab is deterministic fixtures and short timers (the longest
 * async harness is 120ms), so nothing in it is affected; a future scene that
 * renders real fetched content would need its own explicit readiness marker
 * rather than a longer global wait.
 */
async function settle(
  page: import('@playwright/test').Page,
  response: import('@playwright/test').Response | null,
  scene: string,
) {
  // Exact, not heuristic: `notFound()` serves 404, so a scene that failed
  // closed can never be mistaken for one that rendered clean.
  expect(response?.status(), `${scene}: the route did not serve the scene`).toBe(200);
  await page.waitForLoadState('load', { timeout: LOAD_BUDGET_MS });
  await page.waitForFunction(
    ({ minimum, marker }) =>
      Boolean(document.documentElement.dataset.tenant) &&
      (marker === null || document.querySelector(marker) !== null) &&
      document.querySelectorAll('[data-part], [class*="rottay-"], [class*="ds-"]').length >= minimum,
    {
      minimum: paintedFloor(scene),
      // `lab-scene` is READINESS, not identity: SceneFrame stamps it on <main>
      // for most unparameterized scenes too. The 200 above is the discriminator.
      marker: SCENE_CASES[scene] ? '[data-testid="lab-scene"]' : null,
    },
    { timeout: READY_BUDGET_MS },
  );
  await page.waitForTimeout(QUIET_MS);
}

function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

/** axe emits selectors carrying React useId() tokens, which change every render. */
function normalizeTarget(target: string): string {
  return target.replace(/_[Rr]_[a-z0-9]+_/g, '_id_');
}

test.skip(
  !process.env.DS_AXE_ROUTE_BATCH,
  'booked serial slot (50 loads): set DS_AXE_ROUTE_BATCH=1 to run the route batch',
);

/**
 * NOT `describe.serial`. Order and one-at-a-time are already guaranteed by the
 * config (`workers: 1`, `fullyParallel: false`); what `.serial` added was
 * SKIPPING every later test after a failure, and one flake cost 23 unmeasured
 * scenes out of a booked slot. An audit batch is worth more complete than
 * early. The fail-fast argument for `.serial` rested on an unbounded hang, and
 * every wait in `settle()` is now individually bounded; a genuinely dead server
 * answers with connection errors, not timeouts, so the remaining scenes still
 * fail fast.
 */
test.describe('route-level axe — DS reference lab, Modern, two BitHire tenants', () => {
  const measured: Record<string, Finding> = {};
  const blocking: string[] = [];
  const completed = new Set<string>();
  const failed: Record<string, string> = {};

  for (const scene of SCENES) {
    test(`${scene} (both grounds)`, async ({ page }) => {
      test.setTimeout(SCENE_BUDGET_MS);
      for (const ground of GROUNDS) {
        await test.step(`${ground} / ${scene}`, async () => {
          const path = scenePath(ground, scene);
          const response = await navigate(page, path);
          await settle(page, response, scene);

          const results = await new AxeBuilder({ page }).analyze();
          // Non-vacuity: axe over an unpainted document still "passes".
          expect(
            results.passes.length,
            `${ground}/${scene}: axe found nothing to check — the scene did not paint`,
          ).toBeGreaterThan(0);

          for (const violation of results.violations) {
            const impact = violation.impact ?? 'unknown';
            if (impact !== ADMISSIBLE_IMPACT && impact !== INADMISSIBLE_IMPACT) continue;
            for (const node of violation.nodes) {
              const target = normalizeTarget(
                (Array.isArray(node.target) ? node.target.join(' ') : String(node.target)).trim(),
              );
              const key = ledgerKey(violation.id, scene, ground, target);
              // L1: the higher blocking impact is structurally inadmissible. It
              // fails the run and is never a candidate for the ledger.
              if (impact === INADMISSIBLE_IMPACT) {
                blocking.push(`  ${violation.id} @ ${target}  [${ground}/${scene}]  (${violation.help})`);
                continue;
              }
              measured[key] ??= {
                rule: violation.id,
                impact,
                help: violation.help,
                scene,
                ground,
                target,
              };
            }
          }
          completed.add(cellKey(scene, ground));
        });
      }
    });
  }

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === testInfo.expectedStatus) return;
    // A timeout never reaches a catch inside the test, so the cell is recorded here.
    const scene = SCENES.find((name) => testInfo.title === `${name} (both grounds)`);
    if (!scene) return;
    for (const ground of GROUNDS) {
      const cell = cellKey(scene, ground);
      if (!completed.has(cell)) failed[cell] = testInfo.status ?? 'unknown';
    }
  });

  test.afterAll(async () => {
    const noWrite = process.env.AXE_NO_WRITE === '1';
    const update = process.env.AXE_UPDATE_BASELINE === '1';
    // L5(i): no self-generation. An absent ledger throws here.
    const ledger = readLedger(ledgerPath);
    const plan = publication({
      ledger,
      measured,
      blocking,
      coverage: { completed: [...completed], failed },
      update,
      generatedAt: new Date().toISOString(),
    });
    if (plan.diagnostic) console.log(plan.diagnostic);
    // Every check runs before any write: a failing run leaves no complete-labeled artifact.
    expect(plan.failures, plan.failures.join('\n\n')).toEqual([]);
    // L5(iv): ONE flag suppresses BOTH write paths, so a reviewer can run this
    // spec without dirtying the tree whatever else is set.
    if (noWrite) return;
    if (plan.report) writeJson(reportPath, plan.report);
    if (plan.ledger) writeJson(ledgerPath, plan.ledger);
  });
});
