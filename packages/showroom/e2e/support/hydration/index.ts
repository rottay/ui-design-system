import type { Page } from '@playwright/test';

// Server HTML plus CSS can satisfy "no canvas", a computed style or a screenshot with no client at
// all, so a navigation must positively prove React committed hydration: the document root reports
// `isDehydrated: false` and <body> carries a fiber. Neither exists in markup; an unknown shape is red.
const HYDRATION_BUDGET_MS = 20_000;

export async function expectHydrated(page: Page, timeout: number = HYDRATION_BUDGET_MS): Promise<void> {
  try {
    await page.waitForFunction(
      () => {
        const expando = (node: object, prefix: string): unknown => {
          const key = Object.keys(node).find((name) => name.startsWith(prefix));
          return key === undefined ? undefined : (node as Record<string, unknown>)[key];
        };
        const container = expando(document, '__reactContainer$') as
          | { stateNode?: { current?: { memoizedState?: { isDehydrated?: unknown } } } }
          | undefined;
        return (
          container?.stateNode?.current?.memoizedState?.isDehydrated === false &&
          document.body !== null &&
          expando(document.body, '__reactFiber$') !== undefined
        );
      },
      undefined,
      { timeout, polling: 50 },
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    throw new Error(
      `hydration never committed on ${page.url()} within ${timeout}ms: the page is server HTML with no ` +
        `live React root (missing or stale chunks?), so nothing asserted on it proves the client. (${reason})`,
    );
  }
}
