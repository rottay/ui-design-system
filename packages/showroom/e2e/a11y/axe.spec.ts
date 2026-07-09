import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// WO-GAT-04 axis 1 — axe over the flagship galleries (proposal P-10).
//
// For each flagship (button, input, select, card, badge, table, tabs, modal)
// under each tenant palette (rottay = dark ground, bithire = light ground),
// load /probe/engine-modern?tenant=<t>&slug=<flagship> — which renders the
// per-state variants (default/filled/disabled/error/...) statically, so one
// page-level axe run covers per-state markup — and run AxeBuilder.analyze().
//
// Serious + critical violations are collected keyed by `rule|target-selector`.
// The spec FAILS on any serious/critical finding NOT in axe-baseline.json.
// The baseline is DECREASE-ONLY: it is generated on the first run (when
// absent), and thereafter never grown to make a new finding pass. As component
// WOs fix findings, shrink it with AXE_UPDATE_BASELINE=1 (which rewrites the
// baseline to the INTERSECTION of the old baseline and current findings —
// dropping fixed entries, never adding new ones).
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const baselinePath = join(here, 'axe-baseline.json');
const repoRoot = resolve(here, '../../../..');
const reportDir = join(repoRoot, 'test-artifacts', 'gates', 'gat-04');
const reportPath = join(reportDir, 'axe-report.json');

const FLAGSHIP_SLUGS = ['button', 'input', 'select', 'card', 'badge', 'table', 'tabs', 'modal'] as const;
const TENANTS = ['rottay', 'bithire'] as const;
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

/**
 * Normalize a target selector so the baseline key is STABLE across runs. axe
 * emits CSS selectors that embed React `useId()` tokens (e.g. `.ds-input-ph-_r_2h_`,
 * `#tabs-tab-_r_1d_-2`) which change every render; left raw, every run would look
 * "novel". We collapse those id tokens to `_id_` so the key identifies the
 * finding by rule + structural selector, not by a volatile per-render id.
 */
function normalizeTarget(target: string): string {
  return target.replace(/_[Rr]_[a-z0-9]+_/g, '_id_');
}

interface Finding {
  rule: string;
  impact: string;
  help: string;
  target: string;
  occurrences: { tenant: string; slug: string }[];
}

function loadBaseline(): Record<string, Finding> | null {
  if (!existsSync(baselinePath)) return null;
  return JSON.parse(readFileSync(baselinePath, 'utf8')) as Record<string, Finding>;
}

function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

test('no non-baselined serious/critical axe violations across flagship galleries (both tenant palettes)', async ({ page }) => {
  test.setTimeout(300_000);

  const current: Record<string, Finding> = {};

  for (const tenant of TENANTS) {
    for (const slug of FLAGSHIP_SLUGS) {
      await test.step(`${tenant} / ${slug}`, async () => {
        await page.goto(`/probe/engine-modern?tenant=${tenant}&slug=${slug}`, { waitUntil: 'networkidle' });
        await page.getByRole('heading', { name: /modern engine evidence/i }).waitFor({ timeout: 30_000 });

        // The modal flagship's real surface only exists once opened — open it so
        // axe covers the dialog markup, not just the trigger button.
        if (slug === 'modal') {
          await page.getByRole('button', { name: /open modal/i }).first().click();
          await page.getByRole('dialog').waitFor({ timeout: 10_000 }).catch(() => undefined);
        }

        // Settle any remaining transitions so axe's color-contrast reads the
        // final rendered colors (reducedMotion disables entrances; this covers
        // the last paint).
        await page.waitForTimeout(400);

        const results = await new AxeBuilder({ page }).analyze();
        for (const violation of results.violations) {
          if (!BLOCKING_IMPACTS.has(violation.impact ?? '')) continue;
          for (const node of violation.nodes) {
            const rawTarget = (Array.isArray(node.target) ? node.target.join(' ') : String(node.target)).trim();
            const target = normalizeTarget(rawTarget);
            const key = `${violation.id}|${target}`;
            if (!current[key]) {
              current[key] = {
                rule: violation.id,
                impact: violation.impact ?? 'unknown',
                help: violation.help,
                target,
                occurrences: [],
              };
            }
            current[key].occurrences.push({ tenant, slug });
          }
        }
      });
    }
  }

  // Always persist the full current finding set as the CI report artifact.
  writeJson(reportPath, {
    generatedAt: new Date().toISOString(),
    impacts: [...BLOCKING_IMPACTS],
    tenants: TENANTS,
    flagships: FLAGSHIP_SLUGS,
    findingCount: Object.keys(current).length,
    findings: current,
  });

  const baseline = loadBaseline();
  const forceUpdate = process.env.AXE_UPDATE_BASELINE === '1';

  if (baseline === null || forceUpdate) {
    // Generate on first run; on an explicit update, shrink to the intersection
    // (decrease-only — never add a novel finding to make it pass).
    const next =
      baseline && forceUpdate
        ? Object.fromEntries(Object.entries(current).filter(([key]) => key in baseline))
        : current;
    writeJson(baselinePath, next);
    console.log(
      `axe-baseline.json ${baseline === null ? 'generated' : 'updated (decrease-only)'} with ${Object.keys(next).length} serious/critical entries.`,
    );
    return; // pass — the baseline is now the recorded state
  }

  const novel = Object.keys(current).filter((key) => !(key in baseline));
  const detail = novel.map((key) => {
    const f = current[key];
    const where = f.occurrences.map((o) => `${o.tenant}/${o.slug}`).join(', ');
    return `  ${f.impact.toUpperCase()} ${f.rule} @ ${f.target}  [${where}]  (${f.help})`;
  });

  expect(novel, `New serious/critical axe violations not in axe-baseline.json:\n${detail.join('\n')}`).toEqual([]);
});
