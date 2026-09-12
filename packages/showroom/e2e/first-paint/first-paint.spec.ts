import { expect, test, type Route } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-EMI-02 / F-20 — real-browser first-paint evidence.
//
// WHAT ONLY A BROWSER CAN SAY. jsdom has no paint, no top layer, no real
// <dialog>, and no notion of "before hydration": every assertion it makes about
// a first frame is an assertion about a committed render tree. The three claims
// below are paint claims, so they are measured here and nowhere else.
//
// THE ROUTE. `/probe/first-paint` and `/probe/first-paint?modal=1`, and nothing
// else. This file certifies those two requests; it makes no claim about any
// other showroom route, and in particular none of them passes `ssrViewport`, so
// nothing here should be read as "the showroom is desktop-first".
//
// HOW "BEFORE HYDRATION" IS ESTABLISHED. Every `/_next/static/chunks/**`
// response is HELD until the measurement is done. React cannot hydrate without
// them, so the document under the tape is exactly the server's bytes plus the
// stylesheets and the blocking inline stamp — and the page's own hydration
// witness proves it, because it only flips after a commit. The chunks are then
// released and the same elements are measured again.
// ---------------------------------------------------------------------------

const PROBE = '/probe/first-paint';
const SENTINEL = '[data-testid="fp-sentinel"]';
const DEVICE = '[data-testid="fp-device-class"]';
const HYDRATED = '[data-testid="fp-hydrated"]';

/** Records every value a `data-adaptive-fullscreen` node has ever carried. */
const MODAL_POSTURE_RECORDER = `
  window.__fpModalPostures = [];
  const record = (node) => {
    if (!(node instanceof Element)) return;
    for (const el of [node, ...node.querySelectorAll('[data-adaptive-fullscreen]')]) {
      if (el.hasAttribute && el.hasAttribute('data-adaptive-fullscreen')) {
        window.__fpModalPostures.push(el.getAttribute('data-adaptive-fullscreen'));
      }
    }
  };
  new MutationObserver((records) => {
    for (const entry of records) {
      if (entry.type === 'attributes') {
        window.__fpModalPostures.push(entry.target.getAttribute('data-adaptive-fullscreen'));
      }
      entry.addedNodes.forEach(record);
    }
  }).observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-adaptive-fullscreen'],
  });
`;

/** Hold the framework's chunks; the returned callback lets them through. */
async function holdHydration(page: import('@playwright/test').Page): Promise<() => void> {
  let release = (): void => undefined;
  const gate = new Promise<void>((resolve) => {
    release = () => resolve();
  });
  await page.route('**/_next/static/chunks/**', async (route: Route) => {
    await gate;
    await route.continue();
  });
  return release;
}

test.describe.configure({ mode: 'serial' });

test.describe('first paint of /probe/first-paint', () => {
  test('the served bytes already say desktop, and carry the artifact proof', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${PROBE}`);
    expect(response.status()).toBe(200);
    const html = await response.text();

    // No browser, no script, no hydration: this is the response body.
    expect(html).toContain('data-device-class="desktop"');
    // The tier is the REQUEST's hint, not a value matchMedia supplied.
    expect(html).toContain('data-resolved="false"');
    expect(html).toContain('data-hydrated="false"');
    expect(html).toContain('data-width-source="desktop"');

    // The mounted tenant CSS is the artifact's, and it names itself.
    expect(html).toMatch(/<style[^>]*data-ds-tenant-theme-digest="sha256-[0-9a-f]{64}"/);
    expect(html).toMatch(/data-ds-tenant-theme-slug="[a-z0-9-]+"/);
    expect(html).toMatch(/data-ds-tenant-theme-vertical="bithire"/);
  });

  test('paints desktop before hydration and does not move after it', async ({ page }) => {
    const release = await holdHydration(page);
    await page.goto(PROBE, { waitUntil: 'commit' });
    await page.locator(SENTINEL).waitFor({ state: 'attached' });

    // 1. Hydration provably has not run.
    await expect(page.locator(HYDRATED)).toHaveAttribute('data-hydrated', 'false');

    // 2. The tier the first frame was laid out for.
    await expect(page.locator(DEVICE)).toHaveAttribute('data-device-class', 'desktop');
    await expect(page.locator(SENTINEL)).toHaveAttribute('data-width-source', 'desktop');

    // 3. The blocking stamp put the artifact's scope on the root element, and
    //    the artifact's own bytes are in the document, so the mounted CSS is
    //    the thing painting.
    const scope = await page.evaluate(() => ({
      root: document.documentElement.hasAttribute('data-ds-root'),
      vertical: document.documentElement.getAttribute('data-vertical'),
      tenant: document.documentElement.getAttribute('data-tenant'),
      recipeProfile: document.documentElement.getAttribute('data-recipe-profile'),
      styles: document.querySelectorAll('style[data-ds-tenant-theme-digest]').length,
    }));
    expect(scope.root).toBe(true);
    expect(scope.vertical).toBe('bithire');
    expect(scope.tenant).toBeTruthy();
    expect(scope.styles).toBe(1);

    // 4. Those bytes are RESOLVING, not merely present: the channel the
    //    sentinel paints with has the value the artifact declares for it.
    const paint = await page.evaluate((selector) => {
      const element = document.querySelector('style[data-ds-tenant-theme-digest]');
      const declared = (element?.textContent ?? '').match(/--ds-color-primary:\s*([^;]+);/)?.[1]?.trim();
      const node = document.querySelector(selector) as HTMLElement | null;
      // The engine normalizes a registered <color> property, so `#1F3A5F` and
      // `rgb(31, 58, 95)` are the same value stated two ways. Both sides are
      // put through the engine's own parser rather than compared as text.
      const normalize = (value: string | undefined): string => {
        if (!value) return '';
        const probe = document.createElement('span');
        probe.style.color = value;
        document.documentElement.appendChild(probe);
        const computed = getComputedStyle(probe).color;
        probe.remove();
        return computed;
      };
      return {
        declared: normalize(declared),
        live: normalize(
          node ? getComputedStyle(node).getPropertyValue('--ds-color-primary').trim() : '',
        ),
        background: node ? getComputedStyle(node).backgroundColor : '',
      };
    }, SENTINEL);
    expect(paint.declared).toBeTruthy();
    expect(paint.live).toBe(paint.declared);
    expect(paint.background).toBe(paint.declared);

    const before = await page.locator(SENTINEL).boundingBox();
    expect(before).not.toBeNull();

    // Let the framework through and wait for a real commit.
    release();
    await expect(page.locator(HYDRATED)).toHaveAttribute('data-hydrated', 'true');
    await expect(page.locator(DEVICE)).toHaveAttribute('data-resolved', 'true');

    // 5. NO RELAYOUT. Same tier, same box, across the hydration boundary.
    await expect(page.locator(DEVICE)).toHaveAttribute('data-device-class', 'desktop');
    const after = await page.locator(SENTINEL).boundingBox();
    expect(after).toEqual(before);
  });

  /**
   * THE ANTI-CHEAT for the box above.
   *
   * A bounding box that never moves proves nothing if nothing could have moved
   * it. Here the request declares desktop while the device is a phone, so the
   * server snapshot is deliberately wrong: the first frame must still be the
   * DECLARED tier — which is what proves the hint, and not the browser, decides
   * the server render — and the box must then MOVE once the real snapshot
   * arrives. Same page, same sentinel, opposite verdict.
   */
  test('the sentinel does move when the declared tier and the device disagree', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 780 } });
    const page = await context.newPage();
    try {
      const release = await holdHydration(page);
      await page.goto(PROBE, { waitUntil: 'commit' });
      await page.locator(SENTINEL).waitFor({ state: 'attached' });

      await expect(page.locator(HYDRATED)).toHaveAttribute('data-hydrated', 'false');
      await expect(page.locator(DEVICE)).toHaveAttribute('data-device-class', 'desktop');
      const before = await page.locator(SENTINEL).boundingBox();

      release();
      await expect(page.locator(HYDRATED)).toHaveAttribute('data-hydrated', 'true');
      await expect(page.locator(DEVICE)).toHaveAttribute('data-device-class', 'phone');

      const after = await page.locator(SENTINEL).boundingBox();
      expect(after).not.toEqual(before);
    } finally {
      await context.close();
    }
  });

  /**
   * `Modal adaptiveFullscreen`, whose first frame is the one F-20 named.
   *
   * The dialog lives in a portal, so it does not exist in the served bytes at
   * all — its first PAINTED frame is the one the hydrating commit produces, and
   * the defect was that this frame was a phone sheet on a desktop viewport,
   * corrected a tick later. A single reading after the fact cannot see that. So
   * an observer installed before any application script records every value the
   * attribute ever holds, and the whole history must be the desktop posture.
   */
  test('the modal never paints a fullscreen frame on a desktop request', async ({ page }) => {
    await page.addInitScript(MODAL_POSTURE_RECORDER);
    await page.goto(`${PROBE}?modal=1`, { waitUntil: 'commit' });

    const dialog = page.locator('dialog[data-adaptive-fullscreen]').first();
    await dialog.waitFor({ state: 'attached' });
    await expect(page.locator(HYDRATED)).toHaveAttribute('data-hydrated', 'true');
    await expect(dialog).toHaveAttribute('data-adaptive-fullscreen', 'false');
    await expect(dialog).toHaveAttribute('data-fullscreen', 'false');

    const postures = await page.evaluate(
      () => (window as unknown as { __fpModalPostures: string[] }).__fpModalPostures,
    );
    expect(postures.length).toBeGreaterThan(0);
    expect([...new Set(postures)]).toEqual(['false']);
  });
});
