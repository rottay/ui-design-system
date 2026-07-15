import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ENG-12 — responsive conformance probe (spec section 13).
//
// Two browser-measured properties, both on the chrome-free capture route so a
// showroom shell defect can never be mistaken for a component defect:
//
//   1. OVERFLOW. At a 360px viewport no capture cell may scroll the document,
//      leave content outside either viewport edge, or silently clip local
//      content. One violation per (set/slug/tenant) cell.
//   2. TOUCH TARGETS. Under coarse-pointer emulation every interactive part
//      reaches at least 44x44 CSS px. One violation per
//      (set/slug/tenant/selector/size).
//
// Both lists live in overflow-baseline.json and are DECREASE-ONLY: a run fails
// on any cell the baseline does not already list. `node
// packages/core/scripts/engine-token-audit.mjs --check` reads the length of
// `overflowing` as the `responsive.overflowCells` ratchet, so the number cannot
// grow unnoticed even if this spec is skipped.
//
// Regenerate with `RESPONSIVE_UPDATE_BASELINE=1`, which rewrites the file to the
// INTERSECTION of the old baseline and the current run — fixed cells drop out,
// new ones can never be added.
//
// Open overlays are exercised before measurement. Touch targets run under
// every certified tenant because DB-authored typography, density, and chrome
// can change geometry even when the component implementation is shared.
// ---------------------------------------------------------------------------

const FLAGSHIP_SLUGS = ['button', 'input', 'select', 'card', 'badge', 'table', 'tabs', 'modal'] as const;
const RESPONSIVE_SLUGS = ['checkbox', 'switch', 'dropdown', 'stats-grid', 'data-table', 'rail', 'form-builder'] as const;
const TENANTS = ['rottay', 'bithire'] as const;

const MOBILE_VIEWPORT = { width: 360, height: 900 };
const TOUCH_TARGET_MIN_PX = 44;

/** Every part a coarse pointer is expected to be able to hit. */
const INTERACTIVE_SELECTOR = [
  'button',
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="slider"]',
  'input:not([type=hidden])',
  'select',
  'textarea',
  'a[href]',
  '[tabindex]:not([tabindex="-1"]):not([data-part="surface"])',
].join(', ');

interface Baseline {
  countingMethod: string;
  overflowing: string[];
  touchTargets: string[];
}

const baselinePath = (): string => join(test.info().project.testDir, 'responsive', 'overflow-baseline.json');

function readBaseline(): Baseline {
  const path = baselinePath();
  if (!existsSync(path)) throw new Error(`responsive baseline missing at ${path}`);
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<Baseline>;
  return {
    countingMethod: parsed.countingMethod ?? '',
    overflowing: parsed.overflowing ?? [],
    touchTargets: parsed.touchTargets ?? [],
  };
}

function writeBaseline(next: Baseline): void {
  const body = JSON.stringify(
    { countingMethod: next.countingMethod, overflowing: [...next.overflowing].sort(), touchTargets: [...next.touchTargets].sort() },
    null,
    2,
  );
  writeFileSync(baselinePath(), `${body}\n`);
}

const updating = (): boolean => process.env.RESPONSIVE_UPDATE_BASELINE === '1';

/** Intersection only: a fixed entry drops out, a new one can never be added. */
function ratchet(previous: string[], observed: string[]): string[] {
  return previous.filter((entry) => observed.includes(entry));
}

/**
 * The DOM is ground truth. TenantProvider writes `data-tenant` in an effect
 * after hydration, so a page that has painted its heading can still be showing
 * the default palette — and a mis-themed paint has different box sizes.
 */
async function gotoCell(page: Page, set: 'flagship' | 'responsive', slug: string, tenant: string): Promise<void> {
  const setParam = set === 'responsive' ? '&set=responsive' : '';
  await page.goto(`/probe/engine-modern?tenant=${tenant}&slug=${slug}&w=360${setParam}`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /modern engine evidence/i }).waitFor({ timeout: 30_000 });
  await page.waitForFunction((t) => document.documentElement.getAttribute('data-tenant') === t, tenant, {
    timeout: 20_000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

/** Measure the rendered state users actually touch, including open overlays. */
async function exerciseCell(page: Page, set: 'flagship' | 'responsive', slug: string): Promise<void> {
  if (set === 'flagship' && slug === 'modal') {
    await page.getByRole('button', { name: 'Open modal' }).click();
    await page.getByRole('dialog').waitFor();
  }

  if (set === 'responsive' && slug === 'dropdown') {
    await page.getByRole('button', { name: 'Actions', exact: true }).first().click();
    await page.locator('ul[data-part="surface"][data-open="true"]').waitFor();
  }
}

const CELLS = [
  ...FLAGSHIP_SLUGS.flatMap((slug) => TENANTS.map((tenant) => ({ set: 'flagship' as const, slug, tenant }))),
  ...RESPONSIVE_SLUGS.flatMap((slug) => TENANTS.map((tenant) => ({ set: 'responsive' as const, slug, tenant }))),
];

test.describe.configure({ mode: 'serial' });

test.describe('responsive conformance', () => {
  test('no capture cell spills or clips content at 360px', async ({ page }) => {
    test.setTimeout(300_000);

    await page.setViewportSize(MOBILE_VIEWPORT);
    const observed: string[] = [];
    const detail: Record<string, string[]> = {};

    for (const cell of CELLS) {
      await gotoCell(page, cell.set, cell.slug, cell.tenant);
      await exerciseCell(page, cell.set, cell.slug);

      const measurement = await page.evaluate(() => {
        const root = document.documentElement;
        const viewportWidth = root.clientWidth;
        const spilled = new Set<string>();
        const clipped = new Set<string>();
        document.querySelectorAll('*').forEach((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          if (
            rect.width <= 1 ||
            rect.height <= 1 ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            element.closest('[aria-hidden="true"]')
          ) {
            return;
          }

          const part = element.getAttribute('data-part');
          const cls = (element.getAttribute('class') ?? '').split(' ').filter(Boolean).slice(0, 2).join('.');
          const descriptor = `${element.tagName.toLowerCase()}${part ? `[data-part=${part}]` : cls ? `.${cls}` : ''}`;

          if (rect.left < -1 || rect.right > viewportWidth + 1) {
            spilled.add(descriptor);
          }

          const clipsX = style.overflowX === 'hidden' || style.overflowX === 'clip';
          const hasText = (element.textContent ?? '').trim().length > 0;
          const intentionallyEllipsized = style.textOverflow === 'ellipsis';
          if (
            clipsX &&
            hasText &&
            !intentionallyEllipsized &&
            element.clientWidth >= 8 &&
            element.scrollWidth > element.clientWidth + 1
          ) {
            clipped.add(descriptor);
          }
        });
        return {
          overflow: root.scrollWidth - root.clientWidth,
          spilled: [...spilled].slice(0, 4),
          clipped: [...clipped].slice(0, 4),
        };
      });

      if (measurement.overflow > 1 || measurement.spilled.length > 0 || measurement.clipped.length > 0) {
        const key = `${cell.set}/${cell.slug}/${cell.tenant}`;
        observed.push(key);
        detail[key] = [
          ...measurement.spilled.map((entry) => `viewport:${entry}`),
          ...measurement.clipped.map((entry) => `clipped:${entry}`),
        ];
      }
    }

    const baseline = readBaseline();

    if (updating()) {
      writeBaseline({ ...baseline, overflowing: ratchet(baseline.overflowing, observed) });
      return;
    }

    const novel = observed.filter((key) => !baseline.overflowing.includes(key));
    expect(
      novel.map((key) => `${key} (${detail[key]?.join(', ') ?? ''})`),
      'new horizontal spill or local clipping at 360px. Make the layout intrinsic; do not widen the baseline.',
    ).toEqual([]);
  });

  test('every interactive part is at least 44x44 on a coarse pointer', async ({ browser }) => {
    test.setTimeout(300_000);

    const context = await browser.newContext({ hasTouch: true, viewport: MOBILE_VIEWPORT });
    const page = await context.newPage();
    const observed: string[] = [];

    try {
      for (const set of ['flagship', 'responsive'] as const) {
        const slugs = set === 'flagship' ? FLAGSHIP_SLUGS : RESPONSIVE_SLUGS;
        for (const slug of slugs) {
          for (const tenant of TENANTS) {
            await gotoCell(page, set, slug, tenant);
            await exerciseCell(page, set, slug);

            const undersized = await page.evaluate(
              ({ selector, minimum }) => {
                const found = new Set<string>();
                document.querySelectorAll(selector).forEach((element) => {
                  const input = element instanceof HTMLInputElement ? element : null;
                  const hitTarget =
                    input && (input.type === 'checkbox' || input.type === 'radio')
                      ? input.closest('label') ?? input
                      : element;
                  const rect = hitTarget.getBoundingClientRect();
                  const style = getComputedStyle(hitTarget);
                  if (
                    (rect.width === 0 && rect.height === 0) ||
                    style.display === 'none' ||
                    style.visibility === 'hidden' ||
                    hitTarget.closest('[aria-hidden="true"]')
                  ) {
                    return;
                  }
                  if (rect.width < minimum || rect.height < minimum) {
                    const role = element.getAttribute('role');
                    const type = element.getAttribute('type');
                    const part = `${element.tagName.toLowerCase()}${role ? `[role=${role}]` : ''}${type ? `[type=${type}]` : ''}`;
                    found.add(`${part} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
                  }
                });
                return [...found];
              },
              { selector: INTERACTIVE_SELECTOR, minimum: TOUCH_TARGET_MIN_PX },
            );

            for (const entry of undersized) observed.push(`${set}/${slug}/${tenant}/${entry}`);
          }
        }
      }
    } finally {
      await context.close();
    }

    const baseline = readBaseline();

    if (updating()) {
      writeBaseline({ ...baseline, touchTargets: ratchet(baseline.touchTargets, observed) });
      return;
    }

    const novel = observed.filter((entry) => !baseline.touchTargets.includes(entry));
    expect(
      novel,
      `new interactive parts below ${TOUCH_TARGET_MIN_PX}x${TOUCH_TARGET_MIN_PX} on a coarse pointer. Grow the hit area with a pointer query; never the baseline.`,
    ).toEqual([]);
  });
});
