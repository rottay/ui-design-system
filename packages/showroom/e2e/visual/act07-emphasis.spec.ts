import { test, expect, type Page } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

async function openNavigation(page: Page, fixture: 'rottay' | 'bithire'): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}&engine=modern&w=1280&slug=button&nav=1`, {
    waitUntil: 'domcontentloaded',
  });
  await expectHydrated(page);
  await page.locator('[data-testid="probe-nav"]').waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-engine') === 'modern',
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function referenceColor(
  page: Page,
  declaration: string,
): Promise<string> {
  return page.evaluate((background) => {
    const element = document.createElement('div');
    element.style.backgroundColor = background;
    element.style.display = 'none';
    document.body.appendChild(element);
    const computed = getComputedStyle(element).backgroundColor;
    element.remove();
    return computed;
  }, declaration);
}

for (const fixture of ['rottay', 'bithire'] as const) {
  test(`ACT07 Tabs selected-shift computes the icon well on ${fixture}`, async ({ page }) => {
    await openNavigation(page, fixture);
    const tab = page.locator('[data-part="tab-button"][data-selected="true"]').first();
    await expect(tab).toBeVisible();
    await tab.evaluate((element) => {
      const icon = document.createElement('span');
      icon.dataset.part = 'icon';
      icon.setAttribute('aria-hidden', 'true');
      element.prepend(icon);
    });
    const icon = tab.locator('[data-part="icon"]').first();

    for (const [shift, expected] of [[5, 6], [9, 10], [17, 18]] as const) {
      await page.evaluate((value) => {
        document.documentElement.style.setProperty('--ds-state-selected-shift', `${value}%`);
      }, shift);
      await expect(icon).toHaveCSS(
        'background-color',
        await referenceColor(
          page,
          `color-mix(in srgb, ${await icon.evaluate((element) => getComputedStyle(element).getPropertyValue('--ds-color-primary'))} ${expected}%, transparent)`,
        ),
      );
    }
  });

  test(`ACT07 Tabs focus ring is visible on its pseudo element on ${fixture}`, async ({ page }) => {
    await openNavigation(page, fixture);
    const tab = page.locator('[data-part="tab-button"][data-selected="true"]').first();
    await tab.focus();
    const shadow = await tab.evaluate((element) => getComputedStyle(element, '::before').boxShadow);
    expect(shadow).not.toBe('none');
  });

  test(`ACT07 Link hover-share computes variant ink on ${fixture}`, async ({ page }) => {
    await openNavigation(page, fixture);
    for (const variant of ['default', 'primary'] as const) {
      const link = page.locator(`a.rottay-link-shell--modern[data-variant="${variant}"]`).first();
      await expect(link).toBeVisible();
      const tone = await link.evaluate((element) => getComputedStyle(element).getPropertyValue('--ds-link-tone'));
      const neutral = await link.evaluate((element) => getComputedStyle(element).getPropertyValue('--ds-color-neutral-900'));

      for (const [shift, share] of [[2, 28], [4, 30], [8, 34]] as const) {
        await page.evaluate((value) => {
          document.documentElement.style.setProperty('--ds-state-hover-shift', `${value}%`);
        }, shift);
        await link.hover();
        await expect(link).toHaveCSS(
          'color',
          await referenceColor(page, `color-mix(in srgb, ${tone} ${100 - share}%, ${neutral} ${share}%)`),
        );
      }
    }
  });
}
