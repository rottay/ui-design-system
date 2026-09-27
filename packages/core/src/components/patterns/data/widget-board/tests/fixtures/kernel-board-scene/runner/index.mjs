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
 *   7. Arm (c): an adaptive cell switches its view (number at compact, chart at expanded) as the
 *      CELL's width changes -- by a real kernel resize and by resizing the board's container --
 *      with the viewport fixed; the switched views are axe-clean.
 *   6. A reorder reflows the Modern cells through the motion kernel (a transform invert, fill
 *      'backwards', never the layout-x/y FLIP), and once it completes each cell's own CSS
 *      transform is live again with no inline transform left behind.
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
import { readFileSync, writeFileSync } from 'node:fs';

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

async function openScene(page, url, { catalog = false, adaptive = false, init } = {}) {
  if (init) await page.addInitScript(init);
  const query = catalog ? '?catalog=1' : adaptive ? '?adapt=1' : '';
  await page.goto(`${url}${query}`, { waitUntil: 'load', timeout: 120_000 });
  const ready = catalog
    ? '[data-part="catalog-grid"]'
    : adaptive
      ? `${MODERN} [aria-label="Move: Pipeline"]`
      : `${MODERN} [aria-label="Move: a"]`;
  await page.waitForSelector(ready, {
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

      // -- 6. the reflow on the motion kernel, with motion on ------------------------------
      const motion = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'no-preference' });
      const reflowPage = await motion.newPage();
      reflowPage.on('pageerror', (error) => pageErrors.push(String(error)));
      await reflowPage.addInitScript(() => {
        const calls = [];
        const longTasks = [];
        window.__animations = calls;
        window.__longTasks = longTasks;
        const original = Element.prototype.animate;
        Element.prototype.animate = function (keyframes, options) {
          const frames = Array.isArray(keyframes) ? keyframes : [];
          calls.push({
            id: this.getAttribute('data-widget-id'),
            modern: Boolean(this.closest('[data-scene="modern"]')),
            properties: [...new Set(frames.flatMap((frame) => Object.keys(frame).filter((key) => !['offset', 'easing', 'composite'].includes(key))))].sort(),
            fill: options && typeof options === 'object' ? options.fill ?? null : null,
            from: frames[0] && typeof frames[0].transform === 'string'
              ? frames[0].transform
              : frames[0] && frames[0]['--ds-widget-board-layout-x'] !== undefined
                ? `${frames[0]['--ds-widget-board-layout-x']} ${frames[0]['--ds-widget-board-layout-y']}`
                : null,
          });
          return original.call(this, keyframes, options);
        };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) longTasks.push(Math.round(entry.duration));
        }).observe({ type: 'longtask', buffered: true });
      });
      await openScene(reflowPage, url);
      await reflowPage.evaluate(() => {
        window.__animations.length = 0;
        window.__longTasks.length = 0;
      });
      await reflowPage.locator(`${MODERN} [aria-label="Move: b"]`).focus();
      await reflowPage.keyboard.press('ArrowRight');
      await reflowPage.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => null))));
      const reflow = await reflowPage.evaluate((selector) => {
        const cells = Array.from(document.querySelectorAll(`${selector} [data-part="card-shell"]`));
        return {
          calls: window.__animations.filter((call) => call.modern && call.id),
          longTasks: [...window.__longTasks],
          order: cells.map((cell) => cell.getAttribute('data-widget-id')),
          residue: cells.map((cell) => ({
            id: cell.getAttribute('data-widget-id'),
            attached: cell.getAnimations().length,
            inlineTransform: cell.style.transform,
          })),
        };
      }, MODERN);
      report.reflow = reflow;
      assert(
        'the reorder reflows exactly the two moved Modern cells through the kernel: a transform invert, fill backwards, no layout-x/y FLIP',
        JSON.stringify(reflow.order) === JSON.stringify(['a', 'c', 'b', 'd'])
          && JSON.stringify([...new Set(reflow.calls.map((call) => call.id))].sort()) === JSON.stringify(['b', 'c'])
          && reflow.calls.length > 0
          && reflow.calls.every((call) => JSON.stringify(call.properties) === '["transform"]' && call.fill === 'backwards'),
        reflow.calls,
      );
      assert(
        'a completed reflow leaves nothing: no animation attached, no inline transform on any cell',
        reflow.residue.every((cell) => cell.attached === 0 && cell.inlineTransform === ''),
        reflow.residue,
      );
      const chain = await reflowPage.evaluate((selector) => {
        const cell = document.querySelector(`${selector} [data-widget-id="b"]`);
        const rest = getComputedStyle(cell).transform;
        cell.style.setProperty('transition', 'none');
        cell.style.setProperty('--ds-widget-board-interaction-scale', '0.5');
        const pressed = getComputedStyle(cell).transform;
        cell.style.removeProperty('--ds-widget-board-interaction-scale');
        cell.style.removeProperty('transition');
        return { rest, pressed };
      }, MODERN);
      await reflowPage.getByRole('button', { name: 'Done' }).first().click();
      await reflowPage.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => null))));
      const hoverTarget = await centre(reflowPage, `${MODERN} [data-widget-id="c"] [data-part="card-content"]`);
      await reflowPage.mouse.move(hoverTarget.x, hoverTarget.y);
      await reflowPage.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => null))));
      const hovered = await reflowPage.evaluate((selector) => getComputedStyle(document.querySelector(`${selector} [data-widget-id="c"]`)).transform, MODERN);
      report.transformChain = { ...chain, hovered };
      assert(
        "after the reflow each moved cell's own CSS transform is live: the press scale and the hover lift both reach it",
        chain.rest === 'matrix(1, 0, 0, 1, 0, 0)' && chain.pressed.startsWith('matrix(0.5, 0, 0, 0.5')
          && hovered === 'matrix(1, 0, 0, 1, 0, -2)',
        report.transformChain,
      );
      console.log(`MEASURE reflow long tasks (dev server, unminified): ${JSON.stringify(reflow.longTasks)}`);
      const frozenPage = await motion.newPage();
      await frozenPage.addInitScript(() => {
        const calls = [];
        window.__animations = calls;
        const original = Element.prototype.animate;
        Element.prototype.animate = function (keyframes, options) {
          const frames = Array.isArray(keyframes) ? keyframes : [];
          if (this.closest('[data-scene="frozen"]') && this.getAttribute('data-widget-id')) {
            calls.push({
              id: this.getAttribute('data-widget-id'),
              from: frames[0] ? JSON.stringify(frames[0]) : null,
            });
          }
          return original.call(this, keyframes, options);
        };
      });
      await openScene(frozenPage, url);
      await frozenPage.evaluate(() => {
        window.__animations.length = 0;
      });
      await frozenPage.locator('[data-scene="frozen"] [aria-label="Move: b"]').focus();
      await frozenPage.keyboard.press('ArrowRight');
      await frozenPage.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => null))));
      report.legacyReflowControl = await frozenPage.evaluate(() => window.__animations);
      console.log(`MEASURE legacy FLIP on the same reorder (frozen board): ${JSON.stringify(report.legacyReflowControl)}`);
      await motion.close();

      // -- 7. arm (c): the cell's own width switches its view, the viewport never moves --------
      const axeSource = readFileSync(coreRequire.resolve('axe-core'), 'utf8');
      const adaptPage = await fresh();
      await openScene(adaptPage, url, { adaptive: true });
      await adaptPage.addScriptTag({ content: axeSource });
      const PIPE = `${MODERN} [data-widget-id="pipeline"]`;
      const readCell = () => adaptPage.evaluate((selector) => {
        const cell = document.querySelector(selector);
        const views = ['content', 'number', 'chart'].filter((name) => cell.querySelector(`[data-testid="view-${name}"]`));
        return {
          views,
          posture: cell.getAttribute('data-posture'),
          width: Math.round(cell.getBoundingClientRect().width),
          viewport: [window.innerWidth, window.innerHeight],
        };
      }, PIPE);
      const settle = () => adaptPage.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      const axeCell = () => adaptPage.evaluate(async (selector) => {
        const result = await window.axe.run(document.querySelector(selector), { resultTypes: ['violations'] });
        return result.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical').map((violation) => violation.id);
      }, PIPE);
      const steps = [];
      await settle();
      steps.push({ step: 'rest md', ...(await readCell()), axe: await axeCell() });
      const adaptColumn = await adaptPage.evaluate((selector) => {
        const grid = document.querySelector(`${selector} [data-part="grid"]`);
        const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        return (grid.getBoundingClientRect().width - gap * 11) / 12;
      }, MODERN);
      const widen = await centre(adaptPage, `${PIPE} [data-part="resize-handle"][data-edge="inline-end"]`);
      await adaptPage.mouse.move(widen.x, widen.y);
      await adaptPage.mouse.down();
      await adaptPage.mouse.move(widen.x + adaptColumn * 8, widen.y, { steps: 12 });
      await adaptPage.mouse.up();
      await adaptPage.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('data-size') === 'wide', PIPE);
      await settle();
      steps.push({ step: 'kernel resize md -> wide', ...(await readCell()), axe: await axeCell() });
      await adaptPage.evaluate(() => window.__setBoardWidth(700));
      await adaptPage.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('data-posture')?.endsWith('compact'), PIPE);
      await settle();
      steps.push({ step: 'container 1100 -> 700px', ...(await readCell()), axe: await axeCell() });
      await adaptPage.evaluate(() => window.__setBoardWidth(1100));
      await adaptPage.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('data-posture')?.endsWith('expanded'), PIPE);
      await settle();
      steps.push({ step: 'container 700 -> 1100px', ...(await readCell()), axe: await axeCell() });
      await adaptPage.locator(`${PIPE} [data-part="resize-handle"][data-edge="inline-end"]`).focus();
      await adaptPage.keyboard.press('ArrowLeft');
      await adaptPage.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('data-posture')?.endsWith('regular'), PIPE);
      await settle();
      steps.push({ step: 'separator wide -> lg', ...(await readCell()), axe: await axeCell() });
      report.armC = steps;
      console.log(`MEASURE arm c ${JSON.stringify(steps)}`);
      const viewportFixed = steps.every((row) => JSON.stringify(row.viewport) === JSON.stringify(steps[0].viewport));
      const expected = [
        ['number', 'compact'],
        ['chart', 'expanded'],
        ['number', 'compact'],
        ['chart', 'expanded'],
        ['content', 'regular'],
      ];
      assert(
        "arm (c): the adaptive cell's view follows the CELL's own posture -- number, chart, number, chart, content -- through a kernel resize, a container resize both ways and a keyboard resize, with the viewport fixed",
        viewportFixed && steps.every((row, index) =>
          JSON.stringify(row.views) === JSON.stringify([expected[index][0]]) && (row.posture ?? '').endsWith(expected[index][1])),
        steps.map(({ step, views, posture, width, viewport }) => ({ step, views, posture, width, viewport })),
      );
      assert(
        'the switched views are axe-clean (no serious or critical violation inside the cell)',
        steps.every((row) => row.axe.length === 0),
        steps.map(({ step, axe }) => ({ step, axe })),
      );
      await adaptPage.close();

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
