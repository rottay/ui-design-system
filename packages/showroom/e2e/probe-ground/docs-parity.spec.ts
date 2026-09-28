import { expect, test, type Page } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

// WO-RET-05 P4c acceptance: the (docs) runtime serves the tenant the client hydrates. "Served" is
// what the document carries once the docs ground's stamp has run -- the first element of the body,
// before any content -- and "hydrated" is the root after React has committed.

const HYDRATION_ERROR =
  /hydrat|did not match|server rendered HTML|Minified React error #(418|419|422|423|425)/i;

interface TenantTrace {
  readonly values: { tenant: string | null; at: number }[];
  readonly paints: Record<string, number>;
}

async function traceRoot(page: Page) {
  // Init scripts run before <html> exists: the parsed value is read when <html> appears, and every
  // later write is timed synchronously at the setAttribute call, never at an observer callback.
  await page.addInitScript(() => {
    const trace: TenantTrace = { values: [], paints: {} };
    (window as unknown as { __docsTenantTrace: TenantTrace }).__docsTenantTrace = trace;
    const seen = new MutationObserver(() => {
      if (!document.documentElement) return;
      seen.disconnect();
      trace.values.push({ tenant: document.documentElement.getAttribute('data-tenant'), at: performance.now() });
    });
    seen.observe(document, { childList: true });
    const setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name: string, value: string) {
      setAttribute.call(this, name, value);
      if (name === 'data-tenant' && this === document.documentElement) {
        const last = trace.values[trace.values.length - 1];
        if (!last || last.tenant !== value) trace.values.push({ tenant: value, at: performance.now() });
      }
    };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) trace.paints[entry.name] ??= entry.startTime;
    }).observe({ type: 'paint', buffered: true });
  });
}

function tenantAt(trace: TenantTrace, time: number | undefined) {
  if (time === undefined) return null;
  return [...trace.values].reverse().find((value) => value.at <= time)?.tenant ?? null;
}

async function openDocs(page: Page, url: string) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      if (HYDRATION_ERROR.test(message.text())) errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    if (HYDRATION_ERROR.test(error.message)) errors.push(error.message);
  });
  await traceRoot(page);
  const response = await page.goto(url, { waitUntil: 'load' });
  await expectHydrated(page);
  const servedHtml = (await response?.text()) ?? '';
  await expect(page.locator('html')).toHaveAttribute('data-showroom-tenant', /.+/);
  await page.waitForTimeout(500);
  const trace = await page.evaluate(
    () => (window as unknown as { __docsTenantTrace: TenantTrace }).__docsTenantTrace,
  );
  const hydrated = await page.locator('html').getAttribute('data-tenant');
  const stampTenant = await page.evaluate(
    () => document.querySelector('[data-testid="docs-ground-stamp"]')?.getAttribute('data-docs-tenant') ?? null,
  );
  return {
    servedHtml,
    trace,
    hydrated,
    stampTenant,
    atFirstPaint: tenantAt(trace, trace.paints['first-paint']),
    atFirstContentfulPaint: tenantAt(trace, trace.paints['first-contentful-paint']),
    errors,
  };
}

const CASES = [
  { name: '?tenant=bithire', url: '/primitives?tenant=bithire', cookie: null, expected: 'bithire' },
  { name: 'the default route', url: '/primitives', cookie: null, expected: 'rottay' },
  { name: 'a remembered bithire choice', url: '/primitives', cookie: 'bithire', expected: 'bithire' },
] as const;

for (const { name, url, cookie, expected } of CASES) {
  test(`${name}: the served tenant is the hydrated tenant, with no hydration warning`, async ({
    page,
    context,
    baseURL,
  }) => {
    if (cookie) {
      await context.addCookies([{ name: 'rottay-showroom-tenant', value: cookie, url: baseURL! }]);
    }
    const result = await openDocs(page, url);

    expect(result.servedHtml).toContain(`data-docs-tenant="${expected}"`);
    expect(result.stampTenant).toBe(expected);
    expect(result.atFirstPaint, 'the tenant on screen at first paint').toBe(expected);
    expect(result.atFirstContentfulPaint, 'the tenant on screen at first contentful paint').toBe(expected);
    expect(result.hydrated).toBe(expected);
    const firstExpected = result.trace.values.findIndex((value) => value.tenant === expected);
    expect(result.trace.values.slice(firstExpected).map((value) => value.tenant)).toEqual(
      result.trace.values.slice(firstExpected).map(() => expected),
    );
    expect(result.errors).toEqual([]);
  });
}
