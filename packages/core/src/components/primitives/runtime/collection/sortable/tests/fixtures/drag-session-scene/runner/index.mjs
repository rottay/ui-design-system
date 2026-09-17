/**
 * @fileoverview Node runner for the drag-session Chromium fixture.
 *
 * Boots a Vite dev server rooted at this folder, opens the scene in Chromium
 * and drives it with `page.mouse` down/move/up, which produces TRUSTED input
 * and therefore a real HTML5 drag -- the one thing `fireEvent.drop()` cannot
 * simulate. Four claims, none of which a unit suite can make:
 *
 *   1. CANCELLATION. With the kernel's `dragover` cancellation present a `drop`
 *      event fires. With it suppressed -- the runner stops the event before
 *      React's delegated listener ever sees it -- NO drop event fires at all.
 *      That is the consequence, not the `defaultPrevented` proxy.
 *   2. NEGOTIATED OPERATION. For a `move`-capable source the operation is
 *      `move` with or without the kernel's write: inert, which is what makes a
 *      family's adoption a non-event. For a COPY-ONLY source the kernel's
 *      `dropEffect = 'move'` takes the operation to `none` and the drop is not
 *      dispatched -- the one observable consequence of the law, and the arm
 *      that flips when the write is suppressed.
 *   3. PROTECTED MODE. `getData()` is empty during `dragover` while `types`
 *      stays enumerable, and the payload is readable again at `drop`.
 *   4. EXACTLY ONCE. A drop on the inner target inside the outer one commits
 *      once under a real bubble.
 *
 * `--self-check` proves the runner's own predicates can fail: it re-runs the
 * cancellation and negotiation phases with the mechanism suppressed and
 * requires the opposite result. A fixture that cannot fail is not evidence.
 *
 * This is a page-level injection into a throwaway document. It mutates no
 * source file.
 *
 * Usage: node <this file> [--headed] [--self-check] [--json <path>]
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '../../../../../../../../../..');
const SRC_ROOT = resolve(CORE_ROOT, 'src');

const argv = process.argv.slice(2);
const HEADED = argv.includes('--headed');
const SELF_CHECK = argv.includes('--self-check');
const JSON_INDEX = argv.indexOf('--json');
const JSON_PATH = JSON_INDEX >= 0 ? argv[JSON_INDEX + 1] : null;

// Playwright is a devDependency of the showroom package, not of core.
const showroomRequire = createRequire(resolve(CORE_ROOT, '../showroom/package.json'));
const { chromium } = showroomRequire('@playwright/test');

const coreRequire = createRequire(resolve(CORE_ROOT, 'package.json'));
const { createServer } = coreRequire('vite');
const react = coreRequire('@vitejs/plugin-react');

const VIEWPORT = { width: 1000, height: 900 };
const results = [];

const assert = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${JSON.stringify(detail)}` : ''}`);
};

/** Suppresses the kernel's `dragover` handler before React's root listener. */
const SUPPRESS_CANCELLATION = `
  window.__suppressor = (event) => { event.stopImmediatePropagation(); };
  document.body.addEventListener('dragover', window.__suppressor, true);
`;

/** Cancels the dragover WITHOUT the kernel's dropEffect write. */
const SUPPRESS_DROPEFFECT = `
  window.__suppressor = (event) => { event.preventDefault(); event.stopImmediatePropagation(); };
  document.body.addEventListener('dragover', window.__suppressor, true);
`;

async function dragBetween(page, fromSelector, toSelector) {
  const from = await page.locator(fromSelector).boundingBox();
  const to = await page.locator(toSelector).boundingBox();
  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const end = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 6, start.y + 6, { steps: 3 });
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.move(end.x + 1, end.y + 1, { steps: 3 });
  await page.mouse.up();
  await page.waitForTimeout(250);
}

async function openScene(page, url, injection) {
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForSelector('[data-scene="drag-session"]', { timeout: 60_000 });
  if (injection) await page.evaluate(injection);
  return page.evaluate(() => Boolean(window.__dragScene));
}

const readScene = (page) => page.evaluate(() => ({
  commits: window.__dragScene.commits,
  announcements: window.__dragScene.announcements,
  events: window.__dragScene.events,
  transfer: window.__dragScene.transfer,
  pressCancels: window.__dragScene.pressCancels,
}));

async function main() {
  const server = await createServer({
    configFile: false,
    root: HERE,
    logLevel: 'warn',
    plugins: [(react.default ?? react)()],
    resolve: { alias: { '@': SRC_ROOT } },
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
  });
  await server.listen();
  const url = `http://127.0.0.1:${server.httpServer.address().port}/index.html`;

  const browser = await chromium.launch({ headless: !HEADED });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  try {
    // -- PHASE 1: the own drag, unsuppressed. ------------------------------
    assert('the scene mounts and publishes its log', await openScene(page, url));
    await dragBetween(page, '[data-scene-part="card"]', '[data-scene-part="card"]');
    const own = await readScene(page);

    assert(
      'a cancelled target receives the drop',
      own.events.includes('card-drop'),
      { events: own.events.filter((name) => name.endsWith('drop')) },
    );
    assert(
      'a drop through nested kernel targets commits exactly once',
      own.commits.length === 1
        && own.commits[0].key === 'card-1'
        && own.commits[0].position === 0,
      { commits: own.commits },
    );
    const hover = own.transfer.find((entry) => entry.phase === 'card-dragover');
    const drop = own.transfer.find((entry) => entry.phase === 'card-drop');
    assert(
      'the drag data store is protected during dragover and readable at drop',
      hover?.data === '' && hover?.types.includes('text/plain') && drop?.data === 'card-1',
      { hover, drop },
    );
    assert(
      'the negotiated operation for a move-capable source is move',
      hover?.dropEffect === 'move',
      { dropEffect: hover?.dropEffect },
    );
    assert(
      'a pointer commit announces once, with the pointer origin',
      own.announcements.length === 1 && own.announcements[0] === 'dropped:pointer',
      { announcements: own.announcements },
    );

    // -- PHASE 2: the copy-only source. ------------------------------------
    await openScene(page, url);
    await dragBetween(page, '[data-scene-part="copy-source"]', '[data-scene-part="card"]');
    const copy = await readScene(page);
    assert(
      'a copy-only source is refused: the operation is none and no drop is dispatched',
      copy.events.includes('copy-dragstart')
        && !copy.events.includes('card-drop')
        && copy.commits.length === 0,
      { events: copy.events, commits: copy.commits },
    );

    // -- PHASE 3: the press-cancel route on a real drag end. ---------------
    await openScene(page, url);
    await dragBetween(page, '[data-scene-part="press-source"]', '[data-scene-part="column-body"]');
    const press = await readScene(page);
    // Chromium fires `pointercancel` when a native drag takes over AND
    // `dragend` when it finishes, so BOTH declared routes run for one drag.
    // The count is reported rather than pinned: the claim is that the press
    // latch is released, not that a browser dispatches exactly one of them.
    assert(
      'a source with pressCancel is routed on a real drag end',
      press.pressCancels >= 1,
      { pressCancels: press.pressCancels, routes: 'pointercancel + dragend' },
    );

    if (SELF_CHECK) {
      // -- NEGATIVE 1: the cancellation suppressed. ------------------------
      await openScene(page, url, SUPPRESS_CANCELLATION);
      await dragBetween(page, '[data-scene-part="card"]', '[data-scene-part="card"]');
      const uncancelled = await readScene(page);
      assert(
        'SELF-CHECK: with the cancellation suppressed, no drop event fires at all',
        !uncancelled.events.includes('card-drop') && uncancelled.commits.length === 0,
        { events: uncancelled.events },
      );

      // -- NEGATIVE 2: the dropEffect write suppressed. --------------------
      await openScene(page, url, SUPPRESS_DROPEFFECT);
      await dragBetween(page, '[data-scene-part="copy-source"]', '[data-scene-part="card"]');
      const permitted = await readScene(page);
      assert(
        'SELF-CHECK: with the dropEffect write suppressed, the copy-only drag DOES drop',
        permitted.events.includes('card-drop'),
        { events: permitted.events },
      );
    }
  } finally {
    await browser.close();
    await server.close();
  }

  const failed = results.filter((entry) => !entry.pass);
  const report = { selfCheck: SELF_CHECK, results, pageErrors, failed: failed.length };
  if (JSON_PATH) writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  if (pageErrors.length > 0) console.error(`page errors: ${JSON.stringify(pageErrors, null, 2)}`);
  console.log(`\n${results.length - failed.length}/${results.length} assertions passed`);
  if (failed.length > 0 || pageErrors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
