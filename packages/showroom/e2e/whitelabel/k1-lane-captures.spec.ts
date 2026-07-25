import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K1 lane capture matrix — sighted evidence for the 21 primitive families.
//
// One identical lane tree per cell: source (BitHire static vs The Management
// DB) × locale (EN/ES/AR) × density (compact/comfortable/spacious), plus
// mobile/RTL and state cells. Captures are review artifacts for the
// SIGHTED-REVIEW, not pixel baselines; mechanical assertions are limited to
// render presence, direction and horizontal overflow.
// ---------------------------------------------------------------------------

type LaneId = 'a' | 'b' | 'c';
type Source = 'bithire-static' | 'themanagement-db';
type Locale = 'en' | 'es' | 'ar';
type Density = 'compact' | 'comfortable' | 'spacious';

interface LaneDef {
  readonly id: LaneId;
  readonly route: string;
  /** First testid that must exist per cell (render witness). */
  readonly witness: string;
  readonly states: readonly string[];
}

const LANES: readonly LaneDef[] = [
  {
    id: 'a',
    route: '/probe/k1-lane-a',
    witness: 'la-avatar',
    states: ['rest', 'disabled'],
  },
  {
    id: 'b',
    route: '/probe/k1-lane-b',
    witness: 'lb-input',
    states: ['rest', 'disabled', 'error'],
  },
  {
    id: 'c',
    route: '/probe/k1-lane-c',
    witness: 'lc-alert',
    states: ['rest', 'loading', 'empty'],
  },
];

const SOURCES: readonly Source[] = ['bithire-static', 'themanagement-db'];
const LOCALES: readonly Locale[] = ['en', 'es', 'ar'];
const DENSITIES: readonly Density[] = ['compact', 'comfortable', 'spacious'];

function repoRoot(): string {
  let dir = test.info().project.testDir;
  while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('pnpm-workspace.yaml not found above testDir');
    dir = parent;
  }
  return dir;
}

const artifactDir = (): string =>
  join(repoRoot(), 'test-artifacts', 'rottay-design-platform', 'K0-K1', 'captures');

function cellUrl(
  lane: LaneDef,
  source: Source,
  locale: Locale,
  density: Density,
  state: string,
): string {
  return `${lane.route}?source=${source}&locale=${locale}&density=${density}&state=${state}`;
}

async function gotoCell(page: Page, lane: LaneDef, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByTestId(lane.witness).waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    () =>
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--ds-color-primary')
        .trim().length > 0,
    undefined,
    { timeout: 20_000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

function captureName(parts: readonly (string | number)[]): string {
  return `${parts.join('-')}.png`;
}

for (const lane of LANES) {
  test.describe(`K1 lane-${lane.id} capture matrix`, () => {
    test(`lane-${lane.id}: full source × locale × density sweep`, async ({ page }) => {
      test.setTimeout(300_000);
      await page.setViewportSize({ width: 1280, height: 900 });
      mkdirSync(artifactDir(), { recursive: true });

      for (const source of SOURCES) {
        for (const locale of LOCALES) {
          for (const density of DENSITIES) {
            const url = cellUrl(lane, source, locale, density, 'rest');
            await gotoCell(page, lane, url);
            if (locale === 'ar') {
              const dir = await page.evaluate(() => document.dir);
              expect(dir).toBe('rtl');
            }
            await expectNoHorizontalOverflow(page);
            await page.screenshot({
              path: join(
                artifactDir(),
                captureName(['k1', `lane-${lane.id}`, source, locale, density, '1280']),
              ),
              fullPage: true,
            });
          }
        }
      }
    });

    test(`lane-${lane.id}: state cells per source`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width: 1280, height: 900 });
      mkdirSync(artifactDir(), { recursive: true });

      for (const source of SOURCES) {
        for (const state of lane.states) {
          if (state === 'rest') continue;
          const url = cellUrl(lane, source, 'en', 'comfortable', state);
          await gotoCell(page, lane, url);
          await expectNoHorizontalOverflow(page);
          await page.screenshot({
            path: join(
              artifactDir(),
              captureName(['k1', `lane-${lane.id}`, source, 'en', state, '1280']),
            ),
            fullPage: true,
          });
        }
      }
    });

    test(`lane-${lane.id}: mobile + RTL spot cells`, async ({ page }) => {
      test.setTimeout(120_000);
      mkdirSync(artifactDir(), { recursive: true });

      for (const source of SOURCES) {
        const url = cellUrl(lane, source, 'ar', 'compact', 'rest');
        await page.setViewportSize({ width: 390, height: 844 });
        await gotoCell(page, lane, url);
        const dir = await page.evaluate(() => document.dir);
        expect(dir).toBe('rtl');
        await expectNoHorizontalOverflow(page);
        await page.screenshot({
          path: join(
            artifactDir(),
            captureName(['k1', `lane-${lane.id}`, source, 'ar', 'compact', '390']),
          ),
          fullPage: true,
        });
      }
    });
  });
}
