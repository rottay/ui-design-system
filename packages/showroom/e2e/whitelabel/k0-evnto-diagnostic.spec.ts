import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// K0.6 diagnostic — why does the evnto probe cell wash out?
//
// Compares the evnto render through the compiled-artifact path (the showroom's
// own /verticals/evnto page, slug "evnto") against the K0 probe's runtime
// compile path (slug "k0-evnto"), dumping the computed token values that
// decide foreground/background ownership. Review artifact; no baselines.
// ---------------------------------------------------------------------------

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

const TOKENS = [
  '--ds-color-background',
  '--ds-color-text-primary',
  '--ds-color-text-secondary',
  '--ds-tabs-list-bg',
  '--ds-tab-color',
  '--ds-card-bg',
  '--ds-card-title-color',
] as const;

async function dumpTokens(page: Page, label: string): Promise<void> {
  const values = await page.evaluate((names) => {
    const style = getComputedStyle(document.documentElement);
    const out: Record<string, string> = {};
    for (const name of names) out[name] = style.getPropertyValue(name).trim();
    const heading = document.querySelector('h1, h2');
    out['<heading computed color>'] = heading
      ? getComputedStyle(heading).color
      : 'n/a';
    out['<body computed color>'] = getComputedStyle(document.body).color;
    out['<body computed background>'] = getComputedStyle(document.body).backgroundColor;
    return out;
  }, [...TOKENS]);
  console.log(`\n=== TOKEN DUMP ${label} ===`);
  for (const [key, value] of Object.entries(values)) {
    console.log(`${key} = ${value || '(empty)'}`);
  }
}

test.describe('K0.6 evnto render diagnostic', () => {
  test('artifact path vs runtime-compile path', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 900 });

    // 1. Artifact path: the showroom's own evnto page (bundled slug).
    await page.goto('/verticals/evnto', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_500);
    await dumpTokens(page, 'artifact-path /verticals/evnto');
    mkdirSync(artifactDir(), { recursive: true });
    await page.screenshot({
      path: join(artifactDir(), 'evnto-reference-artifact-path.png'),
      fullPage: false,
    });

    // 2. Probe runtime-compile path: evnto.
    await page.goto('/probe/k0-profiles?theme=evnto&profile=none&locale=en', {
      waitUntil: 'networkidle',
    });
    await page.getByTestId('pe-title').waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await dumpTokens(page, 'probe runtime-compile evnto');

    // 3. Probe runtime-compile path: bithire (known good).
    await page.goto('/probe/k0-profiles?theme=bithire&profile=none&locale=en', {
      waitUntil: 'networkidle',
    });
    await page.getByTestId('pe-title').waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await dumpTokens(page, 'probe runtime-compile bithire');
  });
});
