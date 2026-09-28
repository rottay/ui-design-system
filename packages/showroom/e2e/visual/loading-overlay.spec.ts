import { expect, test, type Locator, type Page } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

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
  await expectHydrated(page);
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
  test(`${item.fixture} / ${item.engine} / LoadingOverlay certified skin`, async ({ page }) => {
    const { stage, root } = await openCase(page, item.fixture, item.engine, item.ground);

    await expect(root.locator('[data-part="logo"]')).toHaveCount(1);
    await expect(root.locator('[data-part="message"]')).toHaveText('Syncing records');
    await expect(root.locator('[data-part="dot"]')).toHaveCount(3);
    await expect(root.locator('[data-testid="loading-overlay-logo-mark"]')).toHaveCount(1);

    await expect(stage.locator(':scope > style')).toHaveCount(0);
    // The veil (ground, blur, scrim) is the root's ::before, so the scrim does
    // not dim the message and dots (skin/loading-overlay header); the root
    // itself paints no ground.
    const paint = await root.evaluate((element) => {
      const rootStyle = getComputedStyle(element);
      const veil = getComputedStyle(element, '::before');
      const message = element.querySelector('[data-part="message"]');
      const dot = element.querySelector('[data-part="dot"]');
      const logo = element.querySelector('[data-part="logo"]');
      return {
        rootBackground: rootStyle.backgroundColor,
        veilContent: veil.content,
        background: veil.backgroundColor,
        backdropFilter: veil.backdropFilter,
        borderRadius: veil.borderRadius,
        messageColor: message ? getComputedStyle(message).color : '',
        dotColor: dot ? getComputedStyle(dot).color : '',
        logoAnimation: logo ? getComputedStyle(logo).animationName : '',
        dotAnimation: dot ? getComputedStyle(dot).animationName : '',
      };
    });
    expect(paint.rootBackground).toBe('rgba(0, 0, 0, 0)');
    expect(paint.veilContent).not.toBe('none');
    expect(paint.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(paint.backdropFilter).toBe('blur(2px)');
    expect(paint.borderRadius).not.toBe('0px');
    expect(paint.messageColor).not.toBe('');
    expect(paint.dotColor).toBe(paint.messageColor);
    // The harness runs under reduced motion, where the skin stops both loops;
    // the animation vocabulary is certified under no-preference, then the
    // reduced posture is restored for the screenshot.
    expect(paint.logoAnimation).toBe('none');
    expect(paint.dotAnimation).toBe('none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const animated = await root.evaluate((element) => {
      const logo = element.querySelector('[data-part="logo"]');
      const dot = element.querySelector('[data-part="dot"]');
      return {
        logo: logo ? getComputedStyle(logo).animationName : '',
        dot: dot ? getComputedStyle(dot).animationName : '',
      };
    });
    expect(animated.logo).toBe('ds-loading-overlay-pulse');
    expect(animated.dot).toBe('ds-loading-overlay-dots');
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await expect(stage).toHaveScreenshot(`loading-overlay-${item.fixture}-${item.engine}.png`);
  });
}
