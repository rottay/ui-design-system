import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

// WO-FAM-13 acceptance on the probe-ground dashboard (six widgets, the Modern board, mounted
// through the probe-ground kernel). Arm (a) is KEYBOARD ONLY: after navigation the page is driven
// by key presses alone -- Tab to reach a control, arrows to move or resize -- and never a click.

const ROUTE = '/probe-ground/dashboard';
const BOARD = '[data-testid="dashboard-board-container"]';

const cellOrder = (page: Page) =>
  page.locator(`${BOARD} [data-part="card-shell"]`).evaluateAll((cells) =>
    cells.map((cell) => cell.getAttribute('data-widget-id')),
  );

async function open(page: Page, width?: number) {
  await page.goto(width ? `${ROUTE}?width=${width}` : ROUTE, { waitUntil: 'load' });
  await expectHydrated(page);
  await expect(page.locator('[data-testid="dashboard-probe-stamp"]')).toHaveCount(1);
  await expect(page.locator(`${BOARD} [data-part="card-shell"]`)).toHaveCount(5);
}

/** Tab forward until the focused element matches, the way a keyboard user reaches a control. */
async function tabTo(page: Page, matches: (label: string) => boolean, limit = 80): Promise<string> {
  for (let press = 0; press < limit; press += 1) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return active?.getAttribute('aria-label') ?? active?.textContent?.trim() ?? '';
    });
    if (matches(label)) return label;
  }
  throw new Error('the control was not reachable by Tab');
}

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).include(BOARD).analyze();
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => `${violation.id} (${violation.nodes.length})`);
}

test.describe('probe-ground dashboard -- WO-FAM-13 acceptance', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('(a) keyboard only: enter edit mode, reorder and resize with key presses, axe clean', async ({ page }) => {
    await open(page, 1100);
    expect(await cellOrder(page)).toEqual(['pipeline', 'revenue', 'velocity', 'compliance', 'inbox']);

    await tabTo(page, (label) => label === 'Customize');
    await page.keyboard.press('Enter');
    await expect(page.locator(`${BOARD} section[data-part="root"]`)).toHaveAttribute('data-editing', 'true');
    // The locked widget offers no move control at all; the fixed-size one offers no resize edge.
    await expect(page.locator(`${BOARD} [aria-label="Move: Compliance"]`)).toHaveCount(0);
    await expect(page.locator(`${BOARD} [data-widget-id="inbox"] [data-part="resize-handle"]`)).toHaveCount(0);

    await tabTo(page, (label) => label === 'Move: Pipeline');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => cellOrder(page)).toEqual(['revenue', 'pipeline', 'velocity', 'compliance', 'inbox']);

    await tabTo(page, (label) => label === 'Resize width: Hiring velocity');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(`${BOARD} [data-widget-id="velocity"]`)).toHaveAttribute('data-size', 'lg');

    const state = page.locator('[data-testid="dashboard-layout-state"]');
    await expect(state).toHaveAttribute('data-commits', '2');
    expect(await seriousViolations(page)).toEqual([]);
  });

  test('(e) the layout lives in app state only: no storage write while the board commits', async ({ page }) => {
    await page.addInitScript(() => {
      const writes: string[] = [];
      (window as unknown as { __storageWrites: string[] }).__storageWrites = writes;
      for (const method of ['setItem', 'removeItem', 'clear'] as const) {
        const original = Storage.prototype[method] as (...args: unknown[]) => unknown;
        Storage.prototype[method] = function (this: Storage, ...args: unknown[]) {
          writes.push(`${this === window.sessionStorage ? 'session' : 'local'}:${method}:${String(args[0] ?? '')}`);
          return original.apply(this, args);
        } as never;
      }
    });
    await open(page, 1100);
    const before = await page.evaluate(() => (window as unknown as { __storageWrites: string[] }).__storageWrites.length);

    await tabTo(page, (label) => label === 'Customize');
    await page.keyboard.press('Enter');
    await tabTo(page, (label) => label === 'Move: Pipeline');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-testid="dashboard-layout-state"]')).toHaveAttribute('data-commits', '1');

    const writes = await page.evaluate(() => (window as unknown as { __storageWrites: string[] }).__storageWrites);
    expect(writes.slice(before), 'a layout commit wrote to web storage').toEqual([]);
    expect(writes.filter((entry) => /widget|layout|board/i.test(entry))).toEqual([]);
  });
});

test.describe('probe-ground dashboard -- the adaptive widget follows its own cell', () => {
  test.use({ viewport: { width: 1600, height: 1000 } });

  test('(c) the view switches with the board container at a fixed viewport: chart, number, chart', async ({ page }) => {
    await open(page, 1500);
    await page.evaluate(() => {
      (window as unknown as { __sameDocument: boolean }).__sameDocument = true;
    });
    const cell = page.locator(`${BOARD} [data-widget-id="pipeline"]`);
    const viewport = page.viewportSize();

    await expect(cell.locator('[data-testid="pipeline-view-chart"]')).toHaveCount(1);
    await expect(cell).toHaveAttribute('data-posture', /expanded$/);

    await page.getByRole('button', { name: '560px' }).click();
    await expect(cell.locator('[data-testid="pipeline-view-number"]')).toHaveCount(1);
    await expect(cell).toHaveAttribute('data-posture', /compact$/);

    await page.getByRole('button', { name: '1100px' }).click();
    await expect(cell.locator('[data-testid="pipeline-view-chart"]')).toHaveCount(1);
    await expect(cell).toHaveAttribute('data-posture', /expanded$/);

    expect(page.viewportSize()).toEqual(viewport);
    expect(await page.evaluate(() => (window as unknown as { __sameDocument?: boolean }).__sameDocument)).toBe(true);
    expect(await seriousViolations(page)).toEqual([]);
  });
});

test.describe('probe-ground dashboard -- phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('(d) at phone width the board grid stacks every widget in one column', async ({ page }) => {
    await open(page);
    const boxes = await page.locator(`${BOARD} [data-part="card-shell"]`).evaluateAll((cells) =>
      cells.map((cell) => {
        const rect = cell.getBoundingClientRect();
        return { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width) };
      }),
    );
    expect(boxes).toHaveLength(5);
    for (const box of boxes) {
      expect(Math.abs(box.left - boxes[0].left)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.width - boxes[0].width)).toBeLessThanOrEqual(1);
    }
    for (let index = 1; index < boxes.length; index += 1) {
      expect(boxes[index].top).toBeGreaterThan(boxes[index - 1].top);
    }
  });
});
