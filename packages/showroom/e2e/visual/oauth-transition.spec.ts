import { expect, test, type Locator, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// OAuth Transition inert pre-step visual evidence.
//
// The shared visual config serves a pre-built production showroom (`next
// start`) and forces reduced motion. Every case below asserts the real content,
// phase, palette variables, progress state, provider SVG and injected style
// block before Playwright is allowed to record/compare a screenshot.
// ---------------------------------------------------------------------------

type Tone = 'light' | 'dark';
type Phase = 'redirect' | 'return';

interface Scenario {
  tone: Tone;
  phase: Phase;
  compact: boolean;
  viewport: { width: number; height: number };
  expected: {
    title: string;
    provider: string;
    variant: 'quiet-beam-light' | 'watchtower-sweep-dark';
    family: 'quiet-beam' | 'watchtower-sweep';
    background: string;
    providerPathCount: number;
    sceneSelector: string;
  };
  screenshot: string;
}

const DESKTOP_VIEWPORT = { width: 1280, height: 900 };

const SCENARIOS: readonly Scenario[] = [
  {
    tone: 'light',
    phase: 'redirect',
    compact: false,
    viewport: DESKTOP_VIEWPORT,
    expected: {
      title: 'Redirecting to Google for Bithire.',
      provider: 'Google',
      variant: 'quiet-beam-light',
      family: 'quiet-beam',
      background: '#ece6dc',
      providerPathCount: 4,
      sceneSelector: '.rottay-transition-scene--quiet',
    },
    screenshot: 'oauth-transition-light-redirect-desktop.png',
  },
  {
    tone: 'light',
    phase: 'return',
    compact: false,
    viewport: DESKTOP_VIEWPORT,
    expected: {
      title: 'Returning you to Bithire.',
      provider: 'Google',
      variant: 'quiet-beam-light',
      family: 'quiet-beam',
      background: '#ece6dc',
      providerPathCount: 4,
      sceneSelector: '.rottay-transition-scene--quiet',
    },
    screenshot: 'oauth-transition-light-return-desktop.png',
  },
  {
    tone: 'dark',
    phase: 'redirect',
    compact: false,
    viewport: DESKTOP_VIEWPORT,
    expected: {
      title: 'Redirecting to GitHub for Rottay Platform.',
      provider: 'GitHub',
      variant: 'watchtower-sweep-dark',
      family: 'watchtower-sweep',
      background: '#040404',
      providerPathCount: 1,
      sceneSelector: '.rottay-transition-scene--watchtower',
    },
    screenshot: 'oauth-transition-dark-redirect-desktop.png',
  },
  {
    tone: 'dark',
    phase: 'return',
    compact: false,
    viewport: DESKTOP_VIEWPORT,
    expected: {
      title: 'Back to Rottay Platform.',
      provider: 'GitHub',
      variant: 'watchtower-sweep-dark',
      family: 'watchtower-sweep',
      background: '#040404',
      providerPathCount: 1,
      sceneSelector: '.rottay-transition-scene--watchtower',
    },
    screenshot: 'oauth-transition-dark-return-desktop.png',
  },
  {
    tone: 'dark',
    phase: 'return',
    compact: true,
    viewport: { width: 390, height: 844 },
    expected: {
      title: 'Back to Rottay Platform.',
      provider: 'GitHub',
      variant: 'watchtower-sweep-dark',
      family: 'watchtower-sweep',
      background: '#040404',
      providerPathCount: 1,
      sceneSelector: '.rottay-transition-scene--watchtower',
    },
    screenshot: 'oauth-transition-dark-return-compact-mobile.png',
  },
] as const;

async function openScenario(page: Page, scenario: Scenario): Promise<{ fixture: Locator; root: Locator }> {
  await page.setViewportSize(scenario.viewport);
  const params = new URLSearchParams({
    tone: scenario.tone,
    phase: scenario.phase,
    compact: scenario.compact ? '1' : '0',
  });
  await page.goto(`/probe/oauth-transition?${params}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);

  const fixture = page.getByTestId('probe-oauth-transition');
  const root = fixture.locator('.rottay-transition-root');
  await expect(fixture).toHaveCount(1);
  await expect(root).toBeVisible();
  return { fixture, root };
}

async function assertScenarioContent(fixture: Locator, root: Locator, scenario: Scenario): Promise<void> {
  await expect(fixture).toHaveAttribute('data-fixture-tone', scenario.tone);
  await expect(fixture).toHaveAttribute('data-fixture-phase', scenario.phase);
  await expect(fixture).toHaveAttribute('data-fixture-compact', String(scenario.compact));
  await expect(fixture).toHaveAttribute('data-fixture-provider', scenario.expected.provider.toLowerCase());

  await expect(root).toHaveAttribute('data-tone', scenario.tone);
  await expect(root).toHaveAttribute('data-phase', scenario.phase);
  await expect(root).toHaveAttribute('data-compact', String(scenario.compact));
  await expect(root).toHaveAttribute('data-transition', 'idle');
  await expect(root).toHaveAttribute('data-variant', scenario.expected.variant);
  await expect(root).toHaveAttribute('data-family', scenario.expected.family);
  await expect(root.locator('.rottay-transition-title')).toHaveText(scenario.expected.title);
  await expect(root.locator('.rottay-transition-provider-copy strong')).toHaveText(scenario.expected.provider);
  await expect(root.locator('.rottay-transition-flow-tag')).toHaveText(
    scenario.phase === 'return' ? 'Protected return' : 'Protected redirect',
  );
  await expect(root.locator(scenario.expected.sceneSelector)).toBeVisible();
  await expect(root.locator('.rottay-transition-status-copy')).toHaveText(
    scenario.phase === 'return'
      ? scenario.tone === 'light'
        ? 'Opening Bithire'
        : 'Opening Rottay Platform'
      : `Redirecting to ${scenario.expected.provider}`,
  );

  const styleBlock = root.locator(':scope > style');
  await expect(styleBlock).toHaveCount(1);
  // A <style> element exposes its stylesheet through textContent, while
  // HTMLElement.innerText is intentionally empty in Chromium. Playwright's
  // toContainText reads the latter, so inspect the DOM channel React writes.
  const injectedCss = await styleBlock.evaluate((element) => element.textContent ?? '');
  expect(injectedCss).toContain('@keyframes rottay-transition-travel');
  expect(injectedCss).toContain('@media (max-width: 720px)');
  expect(injectedCss).toContain('@media (prefers-reduced-motion: reduce)');
  expect(await root.evaluate((element) => (element as HTMLElement).style.getPropertyValue('--rh-bg'))).toBe(
    scenario.expected.background,
  );

  const providerSvg = root.locator('.rottay-transition-provider-icon svg');
  await expect(providerSvg).toHaveCount(1);
  await expect(providerSvg).toHaveAttribute('viewBox', '0 0 24 24');
  await expect(providerSvg.locator('path')).toHaveCount(scenario.expected.providerPathCount);

  const steps = root.locator('[data-step-state]');
  await expect(steps).toHaveCount(3);
  await expect(root.locator('[data-step-state="active"]')).toHaveCount(1);
  await expect(root.locator('[data-step-state="pending"]')).toHaveCount(scenario.phase === 'return' ? 0 : 1);
  await expect(root.locator('[data-step-state="complete"]')).toHaveCount(scenario.phase === 'return' ? 2 : 1);

  if (scenario.compact) {
    const box = await root.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(scenario.viewport.width);
    expect(await root.locator('.rottay-transition-top').evaluate((element) => getComputedStyle(element).flexDirection)).toBe(
      'column',
    );
    expect(
      await root.locator('.rottay-transition-stage-shell').evaluate((element) =>
        getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
      ),
    ).toBe(1);
  }
}

for (const scenario of SCENARIOS) {
  test(`${scenario.tone} ${scenario.phase}${scenario.compact ? ' compact mobile' : ' desktop'}`, async ({ page }) => {
    const { fixture, root } = await openScenario(page, scenario);
    await assertScenarioContent(fixture, root, scenario);
    await expect(root).toHaveScreenshot(scenario.screenshot);
  });
}
