/**
 * @fileoverview Node runner for the pointer-session Chromium fixture.
 *
 * Boots a Vite dev server rooted at this folder, opens the scene in Chromium
 * and drives it with `page.mouse` and `page.keyboard`, which produce TRUSTED
 * pointer and key events -- the input a jsdom `fireEvent` only imitates. The
 * claims:
 *
 *   1. A real pointer drag past the activation distance commits once, to the
 *      slot `resolveGridSlot` reads under the release point, and the preview a
 *      ghost is painted from is live during the drag and gone after it.
 *   2. A press released inside the activation distance is a click.
 *   3. A real `Escape` mid-drag cancels; a release far outside the grid is
 *      refused as blocked.
 *   4. A real pointer resize on a logical inline-end handle commits whole steps
 *      once, at release, and never also starts the move.
 *   5. A real keyboard grab (Space, ArrowRight, Space) commits the next slot and
 *      returns focus to the moved item.
 *
 * `--self-check` proves the predicates can fail: with the window-level
 * `pointermove` swallowed before the kernel sees it, the drag never activates
 * and nothing commits.
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

const showroomRequire = createRequire(resolve(CORE_ROOT, '../showroom/package.json'));
const { chromium } = showroomRequire('@playwright/test');

const coreRequire = createRequire(resolve(CORE_ROOT, 'package.json'));
const { createServer } = coreRequire('vite');
const react = coreRequire('@vitejs/plugin-react');

const VIEWPORT = { width: 1000, height: 700 };
const results = [];

const assert = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${JSON.stringify(detail)}` : ''}`);
};

const SWALLOW_POINTERMOVE = `
  window.addEventListener('pointermove', (event) => event.stopImmediatePropagation(), true);
`;

const centre = async (page, selector) => {
  const box = await page.locator(selector).boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

async function press(page, from, path) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (const point of path) await page.mouse.move(point.x, point.y, { steps: 8 });
}

async function openScene(page, url, injection) {
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForSelector('[data-scene="pointer-session"]', { timeout: 60_000 });
  if (injection) await page.evaluate(injection);
  return page.evaluate(() => Boolean(window.__pointerScene));
}

const readScene = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__pointerScene)));

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
    // -- 1. a real pointer drag ------------------------------------------------
    assert('the scene mounts and publishes its log', await openScene(page, url));
    const from = await centre(page, '[data-scene-part="move"][data-slot="0"]');
    const slot4 = await centre(page, '[data-scene-part="slot"][data-slot="4"]');
    await press(page, from, [{ x: from.x + 3, y: from.y + 3 }]);
    const beforeActivation = await readScene(page);
    await page.mouse.move(slot4.x, slot4.y, { steps: 12 });
    const midDrag = await readScene(page);
    await page.mouse.up();
    await page.waitForTimeout(100);
    const dragged = await readScene(page);
    assert(
      'no preview before the activation distance',
      beforeActivation.previews.length === 0,
      { previews: beforeActivation.previews.length },
    );
    const last = midDrag.previews.at(-1);
    assert(
      'the preview follows source, target slot and delta during the drag',
      midDrag.previews.length > 0 && last.key === 'item-0' && last.slot === 4
        && Math.round(last.dx) === Math.round(slot4.x - from.x) && Math.round(last.dy) === Math.round(slot4.y - from.y),
      { last, expected: { dx: slot4.x - from.x, dy: slot4.y - from.y } },
    );
    assert(
      'a real pointer drag commits once, to the slot under the release point',
      dragged.commits.length === 1 && dragged.commits[0].key === 'item-0' && dragged.commits[0].slot === 4,
      { commits: dragged.commits },
    );
    assert(
      'the pointer commit announces once, with the pointer origin',
      JSON.stringify(dragged.announcements) === JSON.stringify(['dropped:pointer']),
      { announcements: dragged.announcements },
    );

    // -- 2. a click is not a drag ---------------------------------------------
    await openScene(page, url);
    await press(page, from, [{ x: from.x + 4, y: from.y }]);
    await page.mouse.up();
    const click = await readScene(page);
    assert(
      'a press released inside the activation distance commits and announces nothing',
      click.commits.length === 0 && click.announcements.length === 0 && click.previews.length === 0,
      click,
    );

    // -- 3. Escape and the outside release ------------------------------------
    await openScene(page, url);
    await press(page, from, [slot4]);
    await page.keyboard.press('Escape');
    await page.mouse.up();
    const escaped = await readScene(page);
    assert(
      'a real Escape mid-drag cancels: nothing committed, one cancelled announcement',
      escaped.commits.length === 0
        && JSON.stringify(escaped.announcements) === JSON.stringify(['cancelled:pointer'])
        && JSON.stringify(escaped.cancels) === JSON.stringify(['item-0']),
      escaped,
    );

    await openScene(page, url);
    await press(page, from, [slot4, { x: slot4.x, y: VIEWPORT.height - 5 }]);
    await page.mouse.up();
    const outside = await readScene(page);
    assert(
      'a release far outside the grid is refused as blocked',
      outside.commits.length === 0
        && JSON.stringify(outside.announcements) === JSON.stringify(['blocked:pointer']),
      outside,
    );

    // -- 4. a real pointer resize ---------------------------------------------
    await openScene(page, url);
    const edge = await centre(page, '[data-scene-part="resize"][data-slot="1"]');
    await press(page, edge, [{ x: edge.x + 2 * 136 + 10, y: edge.y + 30 }]);
    await page.mouse.up();
    const resized = await readScene(page);
    assert(
      'a real pointer resize commits whole inline steps once, at release, and never starts the move',
      JSON.stringify(resized.resizes) === JSON.stringify([{ subject: 'item-1', inline: 2, block: 0 }])
        && resized.commits.length === 0 && resized.previews.length === 0,
      resized,
    );

    // -- 5. a real keyboard grab ----------------------------------------------
    await openScene(page, url);
    await page.locator('[data-scene-part="move"][data-slot="2"]').focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    const keyed = await readScene(page);
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-slot'));
    assert(
      'a real keyboard grab commits the next slot and announces grab, move, drop',
      JSON.stringify(keyed.commits) === JSON.stringify([{ key: 'item-2', slot: 3 }])
        && JSON.stringify(keyed.announcements) === JSON.stringify(['grabbed:keyboard', 'moved:keyboard', 'dropped:keyboard']),
      keyed,
    );
    assert('focus returns to the moved item after a keyboard commit', focused === '2', { focused });

    if (SELF_CHECK) {
      await openScene(page, url, SWALLOW_POINTERMOVE);
      await press(page, from, [slot4]);
      await page.mouse.up();
      const swallowed = await readScene(page);
      assert(
        'SELF-CHECK: with pointermove swallowed the drag never activates and nothing commits',
        swallowed.commits.length === 0 && swallowed.previews.length === 0 && swallowed.announcements.length === 0,
        swallowed,
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
