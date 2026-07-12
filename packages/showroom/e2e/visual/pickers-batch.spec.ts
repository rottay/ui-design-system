import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint C -- the pickers-and-movers family (DatePicker,
// TimePicker, Upload, Transfer, ColorPicker) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus a handful of literal `data-*` state
// attributes -- data-today, data-selected, data-in-range, data-disabled,
// data-status, data-state) onto all five components without moving any
// paint -- every imperative handler (DatePicker's day-cell hover,
// TimePicker's time-item hover, Transfer rustic's search-focus/item-hover/
// move-button choreography) stays exactly where it was.
//
// An open panel is not capturable at rest (open state = interaction), so the
// 4 rest shots below only cover the closed-trigger grid (placeholders,
// values, disabled, range variants, upload file states, transfer
// selections). Panel content is captured separately by the open-panel
// shots, which click a trigger and wait for the panel before screenshotting
// it. Portal posture is per-component and NOT symmetric (the inventory's
// mirror-image trap): DatePicker portals in both engines; TimePicker portals
// only in modern (rustic has no panel at all -- native <input type="time">);
// Upload's PreviewModal portals in neither engine; ColorPicker portals only
// in rustic. Portaled panels are located page-wide (they render under
// document.body, not under the probe container); in-tree parts are located
// container-scoped.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-pickers"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * dropdowns-batch.spec.ts's helper of the same name (duplicated here rather
 * than shared -- e2e/visual has no cross-spec helpers module).
 */
async function waitForGroundPaint(page: Page, ground: 'dark' | 'light'): Promise<void> {
  await page.waitForFunction(
    (isDark) => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const channels = bg.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return false;
      const [r, g, b] = channels.map(Number);
      const luminance = (r + g + b) / 3;
      return isDark ? luminance < 40 : luminance > 200;
    },
    ground === 'dark',
    { timeout: 10_000 },
  );
}

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&pickers=1`,
    { waitUntil: 'domcontentloaded' },
  );

  const container = page.locator(CONTAINER_SELECTOR);
  await container.waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-engine') === expected,
    engine,
  );
  await page.evaluate(() => document.fonts.ready);

  const fixtureGround = FIXTURES.find((f) => f.id === fixture)?.ground ?? 'dark';
  await waitForGroundPaint(page, fixtureGround);

  // Settle any remaining transition tail beyond reducedMotion's
  // entrance-disable so the final rendered frame is what gets diffed.
  await page.waitForTimeout(300);

  return container;
}

// ---------------------------------------------------------------------------
// 4 rest shots -- closed-trigger grid only (both engines, both fixtures).
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / pickers / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-pickers-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Open-panel shots (rottay/w1280 only) -- DatePicker (both engines),
// TimePicker (modern only -- rustic delegates to the native UA time
// control and has no panel DOM), ColorPicker (rustic only -- modern's
// dropdown never portals per the inventory's documented cross-engine
// asymmetry, code is ground truth).
// ---------------------------------------------------------------------------

async function clickPart(container: Locator, testId: string, part: string, nth = 0): Promise<void> {
  const trigger = container.locator(`[data-testid="${testId}"] [data-part="${part}"]`).nth(nth);
  await trigger.click();
}

for (const engine of ENGINES) {
  test(`rottay (dark) / pickers / ${engine}: DatePicker panel open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    await clickPart(container, 'probe-pickers-datepicker', 'trigger-input', 0);

    // DatePicker portals to document.body in both engines; its date-mode
    // panel is the only one stamped data-mode="date" among the pickers.
    const panel = page.locator('[data-part="panel"][data-mode="date"]');
    await panel.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(panel).toHaveScreenshot(`rottay-pickers-datepicker-${engine}-open.png`);
  });
}

test('rottay (dark) / pickers / modern: TimePicker panel open', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  await clickPart(container, 'probe-pickers-timepicker', 'trigger-input', 0);

  // TimePicker's panel carries data-part="panel" with no data-mode
  // attribute. DatePicker's panel always carries data-mode and Transfer's
  // two list panels carry data-panel="source|target" -- both excluded so
  // this resolves to exactly the portaled time panel.
  const panel = page.locator('[data-part="panel"]:not([data-mode]):not([data-panel])');
  await panel.waitFor({ timeout: 10_000 });
  await page.waitForTimeout(300);

  await expect(panel).toHaveScreenshot('rottay-pickers-timepicker-modern-open.png');
});

test('rottay (dark) / pickers / rustic: ColorPicker popup open', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  // Rustic's fused trigger+swatch element is stamped data-part="root" (it has
  // no separate inner trigger div the way modern does).
  await clickPart(container, 'probe-pickers-colorpicker', 'root', 0);

  const popup = page.locator('.rottay-colorpicker__dropdown[data-part="dropdown"]');
  await popup.waitFor({ timeout: 10_000 });
  await page.waitForTimeout(300);

  await expect(popup).toHaveScreenshot('rottay-pickers-colorpicker-rustic-open.png');
});

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only) -- the inventory's flagged
// imperative-paint sites, 5 shots.
// ---------------------------------------------------------------------------

test('rottay (dark) / pickers / rustic: Transfer search-input focused (hardcoded ring)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  const searchInput = container.locator('[data-testid="probe-pickers-transfer"] [data-part="panel-search"]').first();
  await searchInput.focus();
  await page.waitForTimeout(300);

  await expect(searchInput).toHaveScreenshot('rottay-pickers-transfer-rustic-search-focused.png');
});

test('rottay (dark) / pickers / rustic: Transfer item-row hovered (imperative)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  const item = container.locator('[data-testid="probe-pickers-transfer"] [data-part="panel-item"]').first();
  await item.hover();
  await page.waitForTimeout(300);

  await expect(item).toHaveScreenshot('rottay-pickers-transfer-rustic-item-hovered.png');
});

test('rottay (dark) / pickers / rustic: Transfer move-button hovered (imperative)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  // The move button only runs its imperative hover choreography when enabled
  // (selection-gated), so check a source item first.
  const checkbox = container.locator('[data-testid="probe-pickers-transfer"] [data-part="panel-item-checkbox"]').first();
  await checkbox.check();

  const moveButton = container.locator('[data-testid="probe-pickers-transfer"] [data-part="move-button"][data-direction="right"]');
  await moveButton.hover();
  await page.waitForTimeout(300);

  await expect(moveButton).toHaveScreenshot('rottay-pickers-transfer-rustic-move-button-hovered.png');
});

for (const engine of ENGINES) {
  test(`rottay (dark) / pickers / ${engine}: Upload dragger dragging`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const dropzone = container.locator('[data-testid="probe-pickers-upload"] [data-part="dropzone"]').first();

    // The dragger only wires an onDragOver handler (not onDragEnter), so the
    // native 'dragover' event is what flips isDragOver -- dispatched with a
    // real DataTransfer so the synthetic event survives React's handler.
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await dropzone.dispatchEvent('dragover', { dataTransfer });
    await page.waitForTimeout(300);

    await expect(dropzone).toHaveAttribute('data-state', 'dragging');
    await expect(dropzone).toHaveScreenshot(`rottay-pickers-upload-dragger-${engine}-dragging.png`);
  });
}
