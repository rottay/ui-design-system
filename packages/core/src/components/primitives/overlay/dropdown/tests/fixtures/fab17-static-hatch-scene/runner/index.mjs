/**
 * @fileoverview Node runner for the FAB-17 Chromium fixture.
 *
 * Boots a Vite dev server rooted at this folder, opens the scene in Chromium
 * with reduced motion and animations forced off, drives the two phases, and
 * evaluates the fixture's assertion set INSIDE the page -- the only place a
 * layout engine exists. Exits non-zero if any assertion fails, so the fixture
 * can redden a pipeline rather than merely print.
 *
 * READINESS IS ASSERTED, NOT ASSUMED. Three gates run before any subject is
 * believed, each capable of failing:
 *   - the modern SKIN is loaded (the submenu control is positioned entirely by
 *     it, so a skinless run would fail that control for the wrong reason). The
 *     probe reads `container-name: rottay-dropdown`, which only the skin sets.
 *   - the portalled Dropdown has finished measuring (the engine holds it
 *     `visibility: hidden` until then; a hidden surface must not be read as
 *     anchored).
 *   - the payload is POTENT (the fixture's positive control).
 *
 * FALSIFIABILITY IS PROVED, NOT CLAIMED (`--self-check`). A fixture that cannot
 * fail is not evidence, so the runner can demonstrate its own negative
 * capability: it injects `position: static !important` onto the three SUBJECT
 * markers and re-runs phase 1. Every subject must go RED and the Popover
 * negative control must stay GREEN. Both halves matter -- subjects reddening
 * shows the predicates bite; the control surviving shows the harness is not
 * simply knocking the whole scene over.
 *
 * This is a stylesheet injection into a throwaway page. It mutates NO source
 * file, and it is NOT the engine mutation proof (deleting the engine's measured
 * coordinates to confirm the suite reddens). That remains a separate, owner-
 * gated item and this does not substitute for it.
 *
 * Usage: node <this file> [--headed] [--self-check] [--json <path>]
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '../../../../../../../../..');
const SRC_ROOT = resolve(CORE_ROOT, 'src');

const VIEWPORT = { width: 1280, height: 1200 };

const argv = process.argv.slice(2);
const HEADED = argv.includes('--headed');
const SELF_CHECK = argv.includes('--self-check');
const JSON_INDEX = argv.indexOf('--json');
const JSON_PATH = JSON_INDEX >= 0 ? argv[JSON_INDEX + 1] : null;

// Playwright is a devDependency of the showroom package, not of core. Resolve
// it from there rather than adding a dependency for a fixture runner.
const showroomRequire = createRequire(
  resolve(CORE_ROOT, '../showroom/package.json'),
);
const { chromium } = showroomRequire('@playwright/test');

const coreRequire = createRequire(resolve(CORE_ROOT, 'package.json'));
const { createServer } = coreRequire('vite');
const react = coreRequire('@vitejs/plugin-react');

const fail = (message) => {
  console.error(`\nFAB-17 RUNNER ABORTED: ${message}\n`);
  process.exitCode = 1;
};

async function main() {
  const server = await createServer({
    configFile: false,
    root: HERE,
    logLevel: 'warn',
    plugins: [(react.default ?? react)()],
    resolve: { alias: { '@': SRC_ROOT, '@ui': resolve(SRC_ROOT, 'ui') } },
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
  });
  await server.listen();
  const address = server.httpServer.address();
  const url = `http://127.0.0.1:${address.port}/index.html`;

  const browser = await chromium.launch({ headless: !HEADED });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') pageErrors.push(`console.error: ${message.text()}`);
  });

  const report = {
    viewport: VIEWPORT,
    reducedMotion: 'reduce',
    animationsForcedOff: true,
    gates: [],
    assertions: [],
    pageErrors,
  };

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForSelector('[data-fab17-scene="static-hatch"]', { timeout: 60_000 });

    // Belt-and-braces on top of `reducedMotion: reduce`: an in-flight enter
    // animation can translate a correctly anchored surface and read as a false
    // failure. This kills declarative motion outright.
    await page.addStyleTag({
      content: `*, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }`,
    });

    // -- GATE 1: the modern skin is loaded. -------------------------------
    const skinProbe = await page.evaluate(() => {
      const el = document.querySelector('.fab17-mark-dropdown');
      if (!el) return { found: false, containerName: null, sheets: document.styleSheets.length };
      return {
        found: true,
        containerName: getComputedStyle(el).containerName,
        sheets: document.styleSheets.length,
      };
    });
    const skinLoaded = skinProbe.containerName === 'rottay-dropdown';
    report.gates.push({
      id: 'gate-modern-skin-is-loaded',
      pass: skinLoaded,
      detail: `containerName=${skinProbe.containerName} styleSheets=${skinProbe.sheets}`,
    });

    // -- GATE 2: the portalled Dropdown finished measuring. ---------------
    let measured = false;
    try {
      await page.waitForFunction(
        () => {
          const el = document.querySelector('.fab17-mark-dropdown');
          return !!el && getComputedStyle(el).visibility === 'visible';
        },
        undefined,
        { timeout: 10_000 },
      );
      measured = true;
    } catch {
      measured = false;
    }
    report.gates.push({
      id: 'gate-dropdown-surface-is-measured',
      pass: measured,
      detail: measured ? 'visibility=visible' : 'surface never became visible within 10s',
    });

    // -- GATE 3 + PHASE 1 --------------------------------------------------
    const potency = await page.evaluate(() => window.__FAB17__.runPayloadPotencyControl());
    report.assertions.push(...potency);

    const primary = await page.evaluate(() => window.__FAB17__.runPrimary());
    report.assertions.push(...primary);

    // -- FALSIFIABILITY SELF-CHECK ----------------------------------------
    // Only the three SUBJECT markers are forced static. The Popover control is
    // deliberately left alone, so its survival distinguishes "the predicates
    // bite" from "the harness moved everything at once".
    if (SELF_CHECK) {
      await page.addStyleTag({
        content: `.fab17-mark-modal, .fab17-mark-drawer, .fab17-mark-dropdown {
          position: static !important;
        }`,
      });
      const mutated = await page.evaluate(() => window.__FAB17__.runPrimary());
      const expectRed = new Set([
        'modal-panel-is-the-containing-block',
        'drawer-pins-to-viewport-right-edge',
        'dropdown-surface-tracks-its-trigger',
      ]);
      report.selfCheck = mutated.map((a) => {
        const shouldFail = expectRed.has(a.id);
        return {
          id: a.id,
          role: a.role,
          expectation: shouldFail ? 'must go RED' : 'must stay GREEN',
          observed: a.pass ? 'GREEN' : 'RED',
          pass: shouldFail ? !a.pass : a.pass,
          // Every broken predicate, not just the first: it matters whether the
          // GEOMETRIC predicates bite or only the computed-style enum does.
          brokenPredicates: (a.predicates ?? [])
            .filter((p) => !p.pass)
            .map((p) => `${p.measure} (actual=${p.actual})`),
        };
      });
    }

    // -- PHASE 2: submenu negative control --------------------------------
    await page.evaluate(() => window.__FAB17_SET_PHASE__(2));
    await page.waitForSelector('.fab17-mark-modal', { state: 'detached', timeout: 10_000 });
    await page.waitForSelector('.fab17-mark-drawer', { state: 'detached', timeout: 10_000 });

    const parentItem = ".fab17-mark-submenu-host [data-part='item'][aria-haspopup='menu']";
    await page.waitForSelector(parentItem, { timeout: 10_000 });

    const isOpen = () =>
      page.evaluate(
        (sel) => document.querySelector(sel)?.getAttribute('aria-expanded') === 'true',
        parentItem,
      );

    // Both drivers are MONOTONIC (each sets open, neither toggles), so running
    // them in sequence cannot close what the previous one opened. A click would
    // toggle -- and a real pointer click fires mouseenter first, opening it and
    // then immediately closing it again -- so click is deliberately not used.
    let openedBy = 'none';
    await page.hover(parentItem);
    if (await isOpen()) {
      openedBy = 'pointer-hover (mouseenter)';
    } else {
      await page.focus(parentItem);
      await page.keyboard.press('ArrowRight');
      if (await isOpen()) openedBy = 'keyboard ArrowRight';
    }

    const submenu = await page.evaluate(
      (by) => window.__FAB17__.runSubmenuControl(by),
      openedBy,
    );
    report.assertions.push(...submenu);
  } catch (error) {
    report.runnerError = error instanceof Error ? error.message : String(error);
  } finally {
    await context.close();
    await browser.close();
    await server.close();
  }

  emit(report);
}

function emit(report) {
  const line = '-'.repeat(78);
  console.log(`\n${line}\nFAB-17 static-hatch scene -- Chromium`);
  console.log(
    `viewport ${report.viewport.width}x${report.viewport.height}  ` +
      `reduced-motion=${report.reducedMotion}  animations=off`,
  );
  console.log(line);

  for (const gate of report.gates) {
    console.log(`${gate.pass ? 'PASS' : 'FAIL'}  [gate]  ${gate.id}\n        ${gate.detail}`);
  }

  for (const a of report.assertions) {
    console.log(`${a.pass ? 'PASS' : 'FAIL'}  [${a.role}]  ${a.id}`);
    if (a.error) console.log(`        ERROR: ${a.error}`);
    for (const p of a.predicates ?? []) {
      console.log(
        `        ${p.pass ? 'ok  ' : 'BAD '} ${p.measure} ${p.operator} ` +
          `[${p.bound.join(', ')}]  actual=${p.actual}`,
      );
    }
    const measurements = Object.entries(a.measurements ?? {});
    if (measurements.length) {
      console.log(`        measured: ${measurements.map(([k, v]) => `${k}=${v}`).join('  ')}`);
    }
  }

  if (report.selfCheck) {
    console.log(`${line}\nFALSIFIABILITY SELF-CHECK (subjects forced \`position: static !important\`)`);
    for (const s of report.selfCheck) {
      console.log(
        `${s.pass ? 'PASS' : 'FAIL'}  [${s.role}]  ${s.id}\n` +
          `        ${s.expectation} -> observed ${s.observed}`,
      );
      for (const broken of s.brokenPredicates ?? []) {
        console.log(`        broke: ${broken}`);
      }
    }
  }

  if (report.pageErrors.length) {
    console.log(`${line}\nPAGE ERRORS (${report.pageErrors.length}):`);
    for (const e of report.pageErrors.slice(0, 20)) console.log(`  ${e}`);
  }
  if (report.runnerError) console.log(`${line}\nRUNNER ERROR: ${report.runnerError}`);

  const gatesFailed = report.gates.filter((g) => !g.pass).length;
  const failed = report.assertions.filter((a) => !a.pass).length;
  const total = report.assertions.length;
  const selfCheckFailed = (report.selfCheck ?? []).filter((s) => !s.pass).length;
  console.log(line);
  console.log(
    `gates ${report.gates.length - gatesFailed}/${report.gates.length} passed  |  ` +
      `assertions ${total - failed}/${total} passed` +
      (report.selfCheck
        ? `  |  self-check ${report.selfCheck.length - selfCheckFailed}/${report.selfCheck.length} passed`
        : ''),
  );
  console.log(`${line}\n`);

  if (JSON_PATH) {
    writeFileSync(resolve(process.cwd(), JSON_PATH), JSON.stringify(report, null, 2));
    console.log(`json written -> ${JSON_PATH}\n`);
  }

  const clean =
    !report.runnerError &&
    gatesFailed === 0 &&
    failed === 0 &&
    total > 0 &&
    selfCheckFailed === 0 &&
    report.pageErrors.length === 0;
  process.exitCode = clean ? 0 : 1;
}

main().catch((error) => {
  fail(error instanceof Error ? (error.stack ?? error.message) : String(error));
});
