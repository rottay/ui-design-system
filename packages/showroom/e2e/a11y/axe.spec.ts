import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ADMISSIBLE_IMPACT,
  GROUNDS,
  INADMISSIBLE_IMPACT,
  intersect,
  ledgerKey,
  readLedger,
  SCENE_CASES,
  scenePath,
  SCENES,
  type LedgerEntry,
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
//   DS_AXE_ROUTE_BATCH=1 pnpm --filter @rottay/showroom exec playwright test e2e/a11y/axe.spec.ts
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
 * A scene is ready when the route really served it, the tenant scope is
 * stamped, and the provider has actually painted. All three are load-bearing:
 * a 404 from a scene that fails closed on a missing `?only=` still carries the
 * stamp, and the DB ground defers its provider past hydration
 * (ground/client-only.tsx), so a run that waited only on `data-tenant` would
 * measure an empty body and report a clean page.
 */
const MIN_PAINTED_NODES = 5;

async function settle(
  page: import('@playwright/test').Page,
  response: import('@playwright/test').Response | null,
  scene: string,
) {
  // Exact, not heuristic: `notFound()` serves 404, so a scene that failed
  // closed can never be mistaken for one that rendered clean.
  expect(response?.status(), `${scene}: the route did not serve the scene`).toBe(200);
  await page.waitForFunction(
    ({ minimum, marker }) =>
      Boolean(document.documentElement.dataset.tenant) &&
      (marker === null || document.querySelector(marker) !== null) &&
      document.querySelectorAll('[data-part], [class*="rottay-"], [class*="ds-"]').length >= minimum,
    {
      minimum: MIN_PAINTED_NODES,
      // `lab-scene` is READINESS, not identity: SceneFrame stamps it on <main>
      // for most unparameterized scenes too. The 200 above is the discriminator.
      marker: SCENE_CASES[scene] ? '[data-testid="lab-scene"]' : null,
    },
    { timeout: 30_000 },
  );
  await page.waitForLoadState('networkidle');
}

function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

/** axe emits selectors carrying React useId() tokens, which change every render. */
function normalizeTarget(target: string): string {
  return target.replace(/_[Rr]_[a-z0-9]+_/g, '_id_');
}

type Measured = Record<string, Omit<LedgerEntry, 'disposition' | 'owner' | 'wo'>>;

test.skip(
  !process.env.DS_AXE_ROUTE_BATCH,
  'booked serial slot (50 loads): set DS_AXE_ROUTE_BATCH=1 to run the route batch',
);

test.describe.serial('route-level axe — DS reference lab, Modern, two BitHire tenants', () => {
  const measured: Measured = {};
  const blocking: string[] = [];

  for (const scene of SCENES) {
    test(`${scene} (both grounds)`, async ({ page }) => {
      test.setTimeout(120_000);
      for (const ground of GROUNDS) {
        await test.step(`${ground} / ${scene}`, async () => {
          const response = await page.goto(scenePath(ground, scene), { waitUntil: 'domcontentloaded' });
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
        });
      }
    });
  }

  test.afterAll(async () => {
    const noWrite = process.env.AXE_NO_WRITE === '1';
    const update = process.env.AXE_UPDATE_BASELINE === '1';
    // L5(iii): ONE flag suppresses BOTH write paths, so a reviewer can run this
    // spec without dirtying the tree whatever else is set.
    if (!noWrite) {
      writeJson(reportPath, {
        generatedAt: new Date().toISOString(),
        impacts: [ADMISSIBLE_IMPACT],
        matrix: { engine: 'modern', grounds: GROUNDS, scenes: SCENES },
        findingCount: Object.keys(measured).length,
        findings: measured,
      });
    }
    // L5(i): no self-generation. An absent ledger throws here.
    const ledger = readLedger(ledgerPath);
    expect(
      blocking,
      `Findings at the blocking impact the ledger may never record (L1). They fail the run; they are not baselined:\n${blocking.join('\n')}`,
    ).toEqual([]);

    if (update) {
      // L5(ii) + L3: the only write path, and it is the intersection — fixed
      // entries drop out, a novel finding can never be admitted by a flag.
      if (noWrite) return;
      const kept = intersect(ledger.entries, measured);
      writeJson(ledgerPath, {
        ...ledger,
        entries: Object.fromEntries(
          Object.entries(kept).map(([key, entry]) => [key, { ...entry, ...ledger.entries[key] }]),
        ),
      });
      return;
    }

    const novel = Object.keys(measured).filter((key) => !(key in ledger.entries));
    const detail = novel.map((key) => {
      const finding = measured[key]!;
      return `  ${finding.impact.toUpperCase()} ${finding.rule} @ ${finding.target}  [${finding.ground}/${finding.scene}]  (${finding.help})`;
    });
    expect(
      novel,
      `New blocking-impact axe violations not in axe-baseline.json.\nEach must be admitted BY HAND with a disposition, an owner and a WO (L2) — AXE_UPDATE_BASELINE=1 is intersection-only and cannot add them:\n${detail.join('\n')}`,
    ).toEqual([]);
  });
});
