import { expect, test, type Locator, type Page } from '@playwright/test';

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const CASES: ReadonlyArray<{ fixture: Fixture; engine: Engine; ground: 'dark' | 'light' }> = [
  { fixture: 'rottay', engine: 'modern', ground: 'dark' },
  { fixture: 'rottay', engine: 'rustic', ground: 'dark' },
  { fixture: 'bithire', engine: 'modern', ground: 'light' },
  { fixture: 'bithire', engine: 'rustic', ground: 'light' },
];

async function waitForGroundPaint(page: Page, ground: 'dark' | 'light'): Promise<void> {
  await page.waitForFunction(
    (isDark) => {
      const channels = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return false;
      const luminance = channels.slice(0, 3).map(Number).reduce((sum, channel) => sum + channel, 0) / 3;
      return isDark ? luminance < 40 : luminance > 200;
    },
    ground === 'dark',
    { timeout: 10_000 },
  );
}

async function openCase(
  page: Page,
  fixture: Fixture,
  engine: Engine,
  ground: 'dark' | 'light',
): Promise<{ probe: Locator; stage: Locator; root: Locator }> {
  await page.setViewportSize({ width: 960, height: 640 });
  await page.goto(`/probe/loading-overlay?fixture=${fixture}&engine=${engine}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-engine') === expected,
    engine,
  );
  await waitForGroundPaint(page, ground);

  const probe = page.getByTestId('probe-loading-overlay');
  const stage = page.getByTestId('loading-overlay-stage');
  const root = stage.locator('.ds-loading-overlay[data-part="root"]');
  await expect(probe).toHaveAttribute('data-fixture', fixture);
  await expect(probe).toHaveAttribute('data-engine', engine);
  await expect(root).toBeVisible();
  return { probe, stage, root };
}

for (const item of CASES) {
  test(`${item.fixture} / ${item.engine} / LoadingOverlay inert pre-step`, async ({ page }) => {
    const { stage, root } = await openCase(page, item.fixture, item.engine, item.ground);

    await expect(root.locator('[data-part="logo"]')).toHaveCount(1);
    await expect(root.locator('[data-part="message"]')).toHaveText('Syncing records');
    await expect(root.locator('[data-part="dot"]')).toHaveCount(3);
    await expect(root.locator('[data-testid="loading-overlay-logo-mark"]')).toHaveCount(1);

    const styleBlock = stage.locator(':scope > style');
    await expect(styleBlock).toHaveCount(1);
    const embeddedCss = await styleBlock.evaluate((element) => element.textContent ?? '');
    expect(embeddedCss).toContain('@keyframes lo-pulse');
    expect(embeddedCss).toContain('transform: scale(1.08)');
    expect(embeddedCss).toContain('@keyframes lo-dots');

    await expect(stage).toHaveScreenshot(`loading-overlay-${item.fixture}-${item.engine}.png`);
  });
}
