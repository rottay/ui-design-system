/**
 * @fileoverview Node runner for the widget-board kernel scene.
 *
 * Boots a Vite dev server rooted at this folder, opens the scene in Chromium and drives it with
 * TRUSTED `page.mouse` / `page.keyboard` input. The claims:
 *
 *   1. A real pointer drag on the Modern board reorders at release, and while the session is
 *      live the ghost the kernel's preview positions is painted under the pointer.
 *   2. A release far outside the grid reverts the live preview with no emission.
 *   3. A real keyboard arrow on the move control reorders through the kernel's delegated mode.
 *   4. A real pointer resize on the inline-end edge previews whole columns and commits once at
 *      release; the separator's own keyboard arm still resizes.
 *   5. At rest nothing the kernel adds exists: no ghost, and the frozen path never has one.
 *
 * It also writes the REST computed-style snapshot of both boards (`--json`), which is what the
 * before/after paint comparison diffs, plus the resize-host and catalog-width measurements.
 * `--self-check` swallows `pointermove` before the kernel sees it: the drag must then never
 * activate, so the drag predicates are shown to be able to fail.
 *
 * Usage: node <this file> [--headed] [--self-check] [--rest-only] [--json <path>]
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '../../../../../../../../..');
const SRC_ROOT = resolve(CORE_ROOT, 'src');

const argv = process.argv.slice(2);
const HEADED = argv.includes('--headed');
const SELF_CHECK = argv.includes('--self-check');
const REST_ONLY = argv.includes('--rest-only');
const JSON_INDEX = argv.indexOf('--json');
const JSON_PATH = JSON_INDEX >= 0 ? argv[JSON_INDEX + 1] : null;

const showroomRequire = createRequire(resolve(CORE_ROOT, '../showroom/package.json'));
const { chromium } = showroomRequire('@playwright/test');
const coreRequire = createRequire(resolve(CORE_ROOT, 'package.json'));
const { createServer } = coreRequire('vite');
const react = coreRequire('@vitejs/plugin-react');

const VIEWPORT = { width: 1280, height: 1000 };
const results = [];
const assert = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${JSON.stringify(detail)}` : ''}`);
};

const MODERN = '[data-scene="modern"]';
const REST_PROPS = [
  'display', 'position', 'transform', 'translate', 'scale', 'opacity', 'z-index', 'background-color',
  'border-top-color', 'border-top-width', 'border-top-style', 'box-shadow', 'outline-style', 'cursor',
  'width', 'height',
];

async function openScene(page, url, { catalog = false, init } = {}) {
  if (init) await page.addInitScript(init);
  await page.goto(`${url}${catalog ? '?catalog=1' : ''}`, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForSelector(catalog ? '[data-part="catalog-grid"]' : `${MODERN} [aria-label="Move: a"]`, {
    timeout: 120_000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

const readBoard = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__board)));
const domOrder = (page, scene) =>
  page.evaluate((selector) =>
    Array.from(document.querySelectorAll(`${selector} [data-part="card-shell"]`)).map((cell) => cell.getAttribute('data-widget-id')),
  scene);
const centre = async (page, selector) => {
  const box = await page.locator(selector).first().boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
};

/** A point on the widget's edit bar that hit-tests to the bar itself, not to a resize edge. */
async function grabPoint(page, id) {
  const point = await page.evaluate(({ selector, widget }) => {
    const bar = document.querySelector(`${selector} [data-widget-id="${widget}"] [data-part="cell-controls"]`);
    const box = bar.getBoundingClientRect();
    for (let y = box.top + 2; y < box.bottom; y += 2) {
      for (let x = box.left + 2; x < box.right; x += 2) {
        const hit = document.elementFromPoint(x, y);
        if (hit && hit.closest('[data-part]') === bar) return { x, y };
      }
    }
    return null;
  }, { selector: MODERN, widget: id });
  if (!point) throw new Error(`no grabbable point on the edit bar of ${id}`);
  return point;
}

function restSnapshot(page) {
  return page.evaluate(({ props }) => {
    const out = {};
    for (const scene of ['modern', 'frozen']) {
      const root = document.querySelector(`[data-scene="${scene}"]`);
      if (!root) continue;
      Array.from(root.querySelectorAll('[data-part]')).forEach((node, index) => {
        const part = node.getAttribute('data-part');
        const owner = node.closest('[data-widget-id]')?.getAttribute('data-widget-id') ?? '-';
        const edge = node.getAttribute('data-edge') ?? '';
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        out[`${scene}|${index}|${part}|${owner}|${edge}`] = {
          ...Object.fromEntries(props.map((prop) => [prop, style.getPropertyValue(prop)])),
          rect: [rect.left, rect.top, rect.width, rect.height].map((value) => Math.round(value * 100) / 100),
        };
      });
    }
    return out;
  }, { props: REST_PROPS });
}

async function main() {
  const server = await createServer({
    configFile: false,
    root: HERE,
    logLevel: 'warn',
    plugins: [(react.default ?? react)()],
    resolve: { alias: { '@': SRC_ROOT } },
    css: { postcss: {} },
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
  });
  await server.listen();
  const url = `http://127.0.0.1:${server.httpServer.address().port}/index.html`;
  const browser = await chromium.launch({ headless: !HEADED });
  const context = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'reduce' });
  const pageErrors = [];
  const fresh = async () => {
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    return page;
  };
  const report = { selfCheck: SELF_CHECK, results, pageErrors };

  try {
    let page = await fresh();
    await openScene(page, url);
    report.rest = await restSnapshot(page);
    assert('at rest no ghost exists on either board', await page.locator('.ds-widget-board__drag-ghost').count() === 0);

    if (!REST_ONLY) {
      // -- B8: the resize host, measured ------------------------------------------------
      report.resizeHost = await page.evaluate((selector) =>
        Array.from(document.querySelectorAll(`${selector} [data-widget-id="a"] [data-part="resize-handle"]`)).map((handle) => {
          const rect = handle.getBoundingClientRect();
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          return {
            edge: handle.getAttribute('data-edge'),
            display: getComputedStyle(handle).display,
            parentDisplay: getComputedStyle(handle.parentElement).display,
            size: [Math.round(rect.width), Math.round(rect.height)],
            hitIsHandle: Boolean(hit && hit.closest('[data-part="resize-handle"]') === handle),
          };
        }), MODERN);
      assert(
        'every resize edge of a cell is a laid-out, hit-testable box (no display: contents host)',
        report.resizeHost.length === 8 && report.resizeHost.every((row) => row.display !== 'contents' && row.hitIsHandle),
        report.resizeHost,
      );

      report.editBarHits = await page.evaluate((selector) => {
        const bar = document.querySelector(`${selector} [data-widget-id="a"] [data-part="cell-controls"]`);
        const box = bar.getBoundingClientRect();
        const counts = {};
        for (let x = box.left + 2; x < box.right; x += 6) {
          for (let y = box.top + 2; y < box.bottom; y += 6) {
            const hit = document.elementFromPoint(x, y);
            const handle = hit?.closest('[data-part="resize-handle"]');
            const key = handle ? `resize:${handle.getAttribute('data-edge')}` : hit?.closest('[data-part]') === bar ? 'edit-bar' : 'other';
            counts[key] = (counts[key] ?? 0) + 1;
          }
        }
        return { bar: [box.width, box.height].map(Math.round), counts };
      }, MODERN);
      console.log(`MEASURE edit-bar hit map ${JSON.stringify(report.editBarHits)}`);

      // -- 1. real pointer drag, ghost under the pointer -----------------------------------
      const press = await grabPoint(page, 'a');
      const origin = (await centre(page, `${MODERN} [data-widget-id="a"]`)).box;
      const target = await centre(page, `${MODERN} [data-widget-id="c"]`);
      await page.mouse.move(press.x, press.y);
      await page.mouse.down();
      await page.mouse.move(press.x + 10, press.y + 4, { steps: 2 });
      await page.mouse.move(target.x, target.y, { steps: 12 });
      await page.waitForTimeout(150);
      const mid = await page.evaluate(() => {
        const ghost = document.querySelector('.ds-widget-board__drag-ghost');
        if (!ghost) return null;
        const style = getComputedStyle(ghost);
        const rect = ghost.getBoundingClientRect();
        return {
          position: style.position,
          pointerEvents: style.pointerEvents,
          borderTopColor: style.borderTopColor,
          borderTopWidth: style.borderTopWidth,
          backgroundColor: style.backgroundColor,
          translate: style.translate,
          rect: [rect.left, rect.top, rect.width, rect.height],
          moving: document.querySelector('[data-scene="modern"] [data-part="root"]').getAttribute('data-moving'),
        };
      });
      report.ghost = mid;
      const dx = target.x - press.x;
      const dy = target.y - press.y;
      assert(
        'mid-drag the ghost is painted, absolutely positioned and inert to the pointer',
        mid !== null && mid.position === 'absolute' && mid.pointerEvents === 'none' && mid.borderTopWidth === '2px'
          && mid.borderTopColor !== 'rgba(0, 0, 0, 0)' && mid.moving === 'true',
        mid,
      );
      assert(
        'the ghost sits where the kernel preview puts it: the origin cell moved by the pointer delta',
        mid !== null && Math.abs(mid.rect[0] - (origin.x + dx)) <= 1.5 && Math.abs(mid.rect[1] - (origin.y + dy)) <= 1.5
          && Math.abs(mid.rect[2] - origin.width) <= 1 && Math.abs(mid.rect[3] - origin.height) <= 1,
        { ghost: mid?.rect, expected: [origin.x + dx, origin.y + dy, origin.width, origin.height] },
      );
      await page.mouse.up();
      await page.waitForTimeout(300);
      const dragged = await readBoard(page);
      assert(
        'a real pointer drag commits once, in the new order, and the P1 layout callback fires with it',
        dragged.itemsChanges.length === 1 && JSON.stringify(dragged.itemsChanges[0]) === JSON.stringify(['b', 'c', 'a', 'd'])
          && dragged.layoutChanges === 1,
        dragged,
      );
      assert('the ghost leaves with the session', await page.locator('.ds-widget-board__drag-ghost').count() === 0);

      // -- 2. release far outside: revert ------------------------------------------------
      await page.close();
      page = await fresh();
      await openScene(page, url);
      const press2 = await grabPoint(page, 'a');
      const c2 = await centre(page, `${MODERN} [data-widget-id="c"]`);
      await page.mouse.move(press2.x, press2.y);
      await page.mouse.down();
      await page.mouse.move(c2.x, c2.y, { steps: 10 });
      await page.waitForTimeout(100);
      const previewed = await domOrder(page, MODERN);
      await page.mouse.move(c2.x, VIEWPORT.height - 5, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      const reverted = await readBoard(page);
      assert(
        'a release far outside the grid reverts the live preview and emits nothing',
        JSON.stringify(previewed) !== JSON.stringify(['a', 'b', 'c', 'd'])
          && JSON.stringify(await domOrder(page, MODERN)) === JSON.stringify(['a', 'b', 'c', 'd'])
          && reverted.itemsChanges.length === 0,
        { previewed, after: await domOrder(page, MODERN), emissions: reverted.itemsChanges.length },
      );

      // -- 3. real keyboard move ---------------------------------------------------------
      await page.close();
      page = await fresh();
      await openScene(page, url);
      await page.locator(`${MODERN} [aria-label="Move: b"]`).focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      const keyed = await readBoard(page);
      assert(
        'a real ArrowRight on the move control reorders through the kernel',
        JSON.stringify(keyed.itemsChanges) === JSON.stringify([['a', 'c', 'b', 'd']]),
        keyed,
      );

      // -- 4. real pointer resize + the separator's keyboard arm -------------------------
      await page.close();
      page = await fresh();
      await openScene(page, url);
      const column = await page.evaluate((selector) => {
        const grid = document.querySelector(`${selector} [data-part="grid"]`);
        const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        return (grid.getBoundingClientRect().width - gap * 11) / 12;
      }, MODERN);
      const handle = await centre(page, `${MODERN} [data-widget-id="d"] [data-part="resize-handle"][data-edge="inline-end"]`);
      await page.mouse.move(handle.x, handle.y);
      await page.mouse.down();
      await page.mouse.move(handle.x + column * 3, handle.y, { steps: 10 });
      await page.waitForTimeout(150);
      const midSize = await page.locator(`${MODERN} [data-widget-id="d"]`).getAttribute('data-size');
      const midEmissions = (await readBoard(page)).itemsChanges.length;
      await page.mouse.up();
      await page.waitForTimeout(300);
      const resized = await readBoard(page);
      assert(
        'a real pointer resize previews whole columns and commits once at release',
        midSize === 'lg' && midEmissions === 0 && resized.itemsChanges.length === 1 && resized.sizes[0].d === 'lg'
          && (await page.locator('.ds-widget-board__drag-ghost').count()) === 0,
        { column, midSize, midEmissions, sizes: resized.sizes },
      );
      await page.locator(`${MODERN} [data-widget-id="d"] [data-part="resize-handle"][data-edge="inline-end"]`).focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      const stepped = await readBoard(page);
      assert(
        'the separator keyboard arm still steps the size',
        stepped.itemsChanges.length === 2 && stepped.sizes[1].d === 'wide',
        { sizes: stepped.sizes },
      );

      // -- 5. the catalog width defect, measured again (not fixed here) -------------------
      await page.close();
      page = await fresh();
      await openScene(page, url, { catalog: true });
      report.catalog = await page.evaluate(() => {
        const grid = document.querySelector('[data-part="catalog-grid"]');
        const body = grid.closest('.ds-widget-board__catalog-body') ?? grid.parentElement;
        const catalog = grid.closest('[data-part="catalog"]');
        const rect = (node) => {
          const box = node.getBoundingClientRect();
          return [Math.round(box.left * 100) / 100, Math.round(box.width * 100) / 100];
        };
        return {
          grid: rect(grid),
          catalog: rect(catalog),
          body: rect(body),
          gridWidthDeclared: getComputedStyle(grid).width,
          gridPadding: [getComputedStyle(grid).paddingLeft, getComputedStyle(grid).paddingRight],
          bodyOverflowsX: body.scrollWidth > body.clientWidth,
          gridOverhang: Math.round((grid.getBoundingClientRect().right - catalog.getBoundingClientRect().right) * 100) / 100,
        };
      });
      console.log(`MEASURE catalog ${JSON.stringify(report.catalog)}`);

      if (SELF_CHECK) {
        await page.close();
        page = await fresh();
        await openScene(page, url, {
          init: "window.addEventListener('pointermove', (event) => event.stopImmediatePropagation(), true);",
        });
        const p = await grabPoint(page, 'a');
        const t = await centre(page, `${MODERN} [data-widget-id="c"]`);
        await page.mouse.move(p.x, p.y);
        await page.mouse.down();
        await page.mouse.move(t.x, t.y, { steps: 12 });
        const ghostWhileSwallowed = await page.locator('.ds-widget-board__drag-ghost').count();
        await page.mouse.up();
        await page.waitForTimeout(300);
        const swallowed = await readBoard(page);
        assert(
          'SELF-CHECK: with pointermove swallowed the kernel never activates -- no ghost, no emission',
          ghostWhileSwallowed === 0 && swallowed.itemsChanges.length === 0,
          { ghostWhileSwallowed, emissions: swallowed.itemsChanges.length },
        );
      }
    }
    await page.close();
  } finally {
    await browser.close();
    await server.close();
  }

  const failed = results.filter((entry) => !entry.pass);
  report.failed = failed.length;
  if (JSON_PATH) writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  if (pageErrors.length > 0) console.error(`page errors: ${JSON.stringify(pageErrors.slice(0, 5), null, 2)}`);
  console.log(`\n${results.length - failed.length}/${results.length} assertions passed`);
  if (failed.length > 0 || pageErrors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
