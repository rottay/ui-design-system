import { test, expect, type CDPSession, type Page, type Route } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

// Reads the accessible name Chromium itself computes (CDP Accessibility domain) for
// Input.Search and Modern BackTop. Not a screen-reader check: assistive-technology output is a separate gate.

const ROUTE = '/probe/interactions/accessible-names';
const SEARCH_BUTTON = 'button[data-part="search-button"]';
const BACKTOP_BUTTON = 'button.rottay-backtop--modern';

interface ChromiumName {
  readonly role: string;
  readonly name: string;
  readonly ignored: boolean;
}

/** The element must be the single match; Chromium's computed role and name for it. */
async function chromiumName(cdp: CDPSession, selector: string, exactText?: string): Promise<ChromiumName> {
  const expression = `(() => {
    const all = [...document.querySelectorAll(${JSON.stringify(selector)})]
      .filter((el) => ${exactText === undefined ? 'true' : `el.textContent.trim() === ${JSON.stringify(exactText)}`});
    if (all.length !== 1) throw new Error('expected one match for ' + ${JSON.stringify(selector)} + ', got ' + all.length);
    return all[0];
  })()`;
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', { expression });
  if (exceptionDetails || !result.objectId) {
    throw new Error(`chromiumName: ${exceptionDetails?.exception?.description ?? 'no element handle'}`);
  }
  try {
    const { node } = await cdp.send('DOM.describeNode', { objectId: result.objectId });
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', {
      objectId: result.objectId,
      fetchRelatives: false,
    });
    const own = nodes.find((candidate) => candidate.backendDOMNodeId === node.backendNodeId);
    if (!own) throw new Error(`chromiumName: no AX node for ${selector}`);
    return {
      role: String(own.role?.value ?? ''),
      name: String(own.name?.value ?? ''),
      ignored: own.ignored,
    };
  } finally {
    await cdp.send('Runtime.releaseObject', { objectId: result.objectId });
  }
}

async function openCdp(page: Page): Promise<CDPSession> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('Accessibility.enable');
  return cdp;
}

async function openFixture(page: Page, locale: 'en' | 'es'): Promise<void> {
  await page.goto(`${ROUTE}?locale=${locale}`, { waitUntil: 'domcontentloaded' });
  await expectHydrated(page);
  await expect(page.getByTestId('an-root')).toBeVisible();
}

// Static cases in both locales: Search server-rendered and hydrated, BackTop mounted after hydration.

const DEFAULT_NAMES = {
  en: { search: 'Search', backTop: 'Back to top' },
  es: { search: 'Buscar', backTop: 'Volver arriba' },
} as const;

interface StaticCase {
  readonly id: string;
  readonly button: string;
  readonly visibleText: string | null;
  readonly expected: (locale: 'en' | 'es') => string;
}

const STATIC_CASES: readonly StaticCase[] = [
  { id: 'an-search-text', button: SEARCH_BUTTON, visibleText: 'Find users', expected: () => 'Find users' },
  { id: 'an-search-default', button: SEARCH_BUTTON, visibleText: null, expected: (l) => DEFAULT_NAMES[l].search },
  { id: 'an-search-symbol', button: SEARCH_BUTTON, visibleText: null, expected: (l) => DEFAULT_NAMES[l].search },
  { id: 'an-backtop-text', button: BACKTOP_BUTTON, visibleText: 'Go up', expected: () => 'Go up' },
  { id: 'an-backtop-default', button: BACKTOP_BUTTON, visibleText: null, expected: (l) => DEFAULT_NAMES[l].backTop },
  { id: 'an-backtop-symbol', button: BACKTOP_BUTTON, visibleText: null, expected: (l) => DEFAULT_NAMES[l].backTop },
];

for (const locale of ['en', 'es'] as const) {
  test(`static cases name each button in Chromium (${locale})`, async ({ page }) => {
    await openFixture(page, locale);
    const cdp = await openCdp(page);

    for (const entry of STATIC_CASES) {
      const selector = `[data-testid="${entry.id}"] ${entry.button}`;
      const expected = entry.expected(locale);
      const button = page.locator(selector);
      await expect(button, entry.id).toHaveCount(1);
      await expect(button, entry.id).toBeVisible();

      const chromium = await chromiumName(cdp, selector);
      expect(chromium, entry.id).toEqual({ role: 'button', name: expected, ignored: false });
      await expect(button, entry.id).toHaveAccessibleName(expected);

      if (entry.visibleText === null) {
        await expect(button, entry.id).toHaveAttribute('aria-label', expected);
      } else {
        await expect(button, entry.id).not.toHaveAttribute('aria-label');
        await expect(button, entry.id).toHaveText(entry.visibleText);
      }
    }
  });
}

// Lazy engine child (R2-F2): the window before Tag's engine resolves is measured and reported,
// not pinned; the final name is asserted.

interface TraceEntry {
  readonly t: number;
  readonly name: string;
  readonly ariaLabel: string | null;
}

const LAZY_CASES = {
  backTop: { selector: `[data-testid="an-backtop-lazy"] ${BACKTOP_BUTTON}`, final: 'Top' },
  search: { selector: `[data-testid="an-search-lazy"] ${SEARCH_BUTTON}`, final: 'Find' },
} as const;

type LazyKey = keyof typeof LAZY_CASES;

/** Records every change of each lazy button's DOM name from the commit that inserts it. */
async function installTrace(page: Page): Promise<void> {
  await page.evaluate((cases) => {
    const domName = (el: Element): string => {
      const label = el.getAttribute('aria-label');
      if (label && label.trim()) return label.trim();
      const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
        if (!(node instanceof HTMLElement || node instanceof SVGElement)) return '';
        if (node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('hidden')) return '';
        return Array.from(node.childNodes, walk).join('');
      };
      return Array.from(el.childNodes, walk).join('').replace(/\s+/g, ' ').trim();
    };
    const trace: Record<string, { t: number; name: string; ariaLabel: string | null }[]> = {};
    const sample = () => {
      const t = performance.now();
      for (const [key, { selector }] of Object.entries(cases)) {
        const el = document.querySelector(selector);
        if (!el) continue;
        const entries = (trace[key] ??= []);
        const name = domName(el);
        const ariaLabel = el.getAttribute('aria-label');
        const last = entries[entries.length - 1];
        if (!last || last.name !== name || last.ariaLabel !== ariaLabel) entries.push({ t, name, ariaLabel });
      }
    };
    const host = document.querySelector('[data-testid="an-lazy-host"]');
    if (!host) throw new Error('installTrace: an-lazy-host is missing');
    new MutationObserver(sample).observe(host, { subtree: true, childList: true, characterData: true, attributes: true });
    (window as unknown as { __anTrace: typeof trace }).__anTrace = trace;
  }, LAZY_CASES);
}

async function readTrace(page: Page, key: LazyKey): Promise<TraceEntry[]> {
  return page.evaluate((k) => (window as unknown as { __anTrace: Record<string, TraceEntry[]> }).__anTrace[k] ?? [], key);
}

async function openLazyFixture(page: Page): Promise<CDPSession> {
  await openFixture(page, 'en');
  // The static cases prove BackTop and Input already resolved; only Tag is still unloaded.
  await expect(page.locator(`[data-testid="an-backtop-text"] ${BACKTOP_BUTTON}`)).toBeVisible();
  await expect(page.locator(`[data-testid="an-search-text"] ${SEARCH_BUTTON}`)).toBeVisible();
  await expect(page.locator('[data-testid="an-lazy-host"] button')).toHaveCount(0);
  const cdp = await openCdp(page);
  await installTrace(page);
  return cdp;
}

/** Reads Chromium's name once each lazy button is attached. The read counts as inside the window
 *  only if the DOM name is not yet final on both sides of it. */
async function readWindow(page: Page, cdp: CDPSession, heldCount: () => number): Promise<Record<string, unknown>> {
  await page.getByTestId('an-lazy-control').getByRole('button', { name: 'Mount lazy children' }).click();
  const reads: Record<string, unknown> = {};
  for (const [key, { selector, final }] of Object.entries(LAZY_CASES)) {
    const attached = await page
      .locator(selector)
      .waitFor({ state: 'attached', timeout: 15_000 })
      .then(() => true, () => false);
    if (!attached) {
      reads[key] = { heldRequests: heldCount(), attached: false };
      continue;
    }
    const before = (await readTrace(page, key as LazyKey)).at(-1)?.name;
    const chromium = await chromiumName(cdp, selector);
    const after = (await readTrace(page, key as LazyKey)).at(-1)?.name;
    const insideWindow = before !== undefined && before !== final && after !== final;
    reads[key] = { heldRequests: heldCount(), attached: true, insideWindow, domNameBefore: before, domNameAfter: after, chromium };
    if (insideWindow) {
      // Instrument check: inside the window the DOM-derived name and Chromium's name agree.
      expect(chromium.name, `${key} window`).toBe(before);
    }
  }
  return reads;
}

/** Waits for each final name, then asserts it in Chromium and summarizes the recorded window. */
async function settleAndMeasure(page: Page, cdp: CDPSession): Promise<Record<string, unknown>> {
  const measurements: Record<string, unknown> = {};
  for (const [key, { selector, final }] of Object.entries(LAZY_CASES)) {
    await page.waitForFunction(
      ({ k, name }) =>
        (window as unknown as { __anTrace: Record<string, { name: string }[]> }).__anTrace[k]?.at(-1)?.name === name,
      { k: key, name: final },
      { timeout: 30_000 },
    );
    const trace = await readTrace(page, key as LazyKey);
    expect(trace.length, `${key} trace`).toBeGreaterThan(0);
    const resolvedAt = trace.findIndex((entry) => entry.name === final);
    const preResolution = trace.slice(0, resolvedAt);
    measurements[key] = {
      windowMs: resolvedAt > 0 ? trace[resolvedAt].t - trace[0].t : 0,
      preResolutionNames: [...new Set(preResolution.map((entry) => entry.name))],
      preResolutionAriaLabels: [...new Set(preResolution.map((entry) => entry.ariaLabel))],
      trace,
    };

    const button = page.locator(selector);
    await expect(button).toBeVisible();
    expect(await chromiumName(cdp, selector), `${key} final`).toEqual({ role: 'button', name: final, ignored: false });
    await expect(button).toHaveAccessibleName(final);
    await expect(button).not.toHaveAttribute('aria-label');
    await expect(button).toHaveText(final);
  }
  return measurements;
}

async function report(name: string, evidence: Record<string, unknown>): Promise<void> {
  await test.info().attach(`${name}.json`, { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
  test.info().annotations.push({ type: name, description: JSON.stringify(evidence) });
}

test('lazy engine child: natural pre-resolution window and final name in Chromium', async ({ page }) => {
  const cdp = await openLazyFixture(page);
  const windowReads = await readWindow(page, cdp, () => 0);
  const measurements = await settleAndMeasure(page, cdp);
  await report('r2-f2-natural-window', { windowReads, measurements });
});

test('lazy engine child: Chromium name inside a held window, then final name', async ({ page }) => {
  const cdp = await openLazyFixture(page);

  // Chunk requests issued by the mount are held so the window stays open while Chromium is read.
  const held: Route[] = [];
  let released = false;
  const hold = async (route: Route) => {
    if (released) await route.continue();
    else held.push(route);
  };
  await page.route('**/_next/static/chunks/**', hold);
  let windowReads: Record<string, unknown>;
  let heldTotal = 0;
  try {
    windowReads = await readWindow(page, cdp, () => held.length);
  } finally {
    released = true;
    heldTotal = held.length;
    for (const route of held.splice(0)) await route.continue();
    await page.unroute('**/_next/static/chunks/**', hold);
  }

  const measurements = await settleAndMeasure(page, cdp);
  await report('r2-f2-held-window', { heldTotal, windowReads, measurements });
  test.skip(heldTotal === 0, 'the mount fetched no chunk, so no window could be held; see r2-f2-held-window');
  for (const key of Object.keys(LAZY_CASES)) {
    expect((windowReads[key] as { insideWindow?: boolean }).insideWindow, `${key} held read`).toBe(true);
  }
});

// Shipped consumer: the docs live preview's BackTop with visible DS Text.

test('docs live preview BackTop is named by its visible text in Chromium', async ({ page, context, baseURL }) => {
  test.setTimeout(240_000);
  await context.addCookies([{ name: 'rottay-showroom-engine', value: 'modern', url: baseURL ?? 'http://localhost:7001' }]);
  await page.goto('/primitives/navigation/back-top', { waitUntil: 'domcontentloaded' });
  await expectHydrated(page, 60_000);

  const button = page.locator(BACKTOP_BUTTON).filter({ hasText: /^Top$/ });
  await expect(button).toHaveCount(1);
  await expect(button).toBeVisible();

  const cdp = await openCdp(page);
  expect(await chromiumName(cdp, BACKTOP_BUTTON, 'Top')).toEqual({ role: 'button', name: 'Top', ignored: false });
  await expect(button).toHaveAccessibleName('Top');
  await expect(button).not.toHaveAttribute('aria-label');
});
