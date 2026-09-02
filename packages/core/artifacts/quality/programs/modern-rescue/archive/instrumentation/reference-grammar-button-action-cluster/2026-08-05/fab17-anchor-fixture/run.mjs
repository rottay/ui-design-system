/**
 * FAB-17 anchoring fixture runner -- REAL Chromium, REAL layout.
 *
 * WHAT THIS ANSWERS THAT THE UNIT SUITES CANNOT. happy-dom has no layout
 * engine: getBoundingClientRect() is always zero and `position` has no
 * geometric effect. The unit suites therefore prove the MERGE CONTRACT (which
 * declaration wins) and nothing about ANCHORING. This runner loads the real
 * engines into Chromium, where `position: static` genuinely detaches an element
 * from its containing block, and measures the result.
 *
 * SELF-CONTAINED BY DESIGN. It bundles the scene with Vite and opens the build
 * over file://, so it needs no dev server and no scene route owned by another
 * lane. Playwright is resolved from the showroom package (the same helper path
 * capture-lab.mjs uses); the Chromium binary comes from the local Playwright
 * cache.
 *
 * --revert  Rebuilds against the PRE-FAB-17 engines taken from HEAD via
 *           read-only `git show`, writing them to scratch paths inside the
 *           tests/ tree at the SAME relative depth as engines/modern so every
 *           relative import resolves identically. No implementation file is
 *           ever edited. This is the mutation check: the SUBJECT assertions
 *           must go RED and the CONTROL assertions must stay GREEN. A fixture
 *           that cannot go red is not evidence, whatever it reports.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createReadStream, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * ES modules cannot load over file:// -- Chromium blocks them as cross-origin
 * (`origin 'null'`), so the bundle silently never executes. Serve the build
 * over loopback http instead. Node's own http module; no dependency, no
 * dev server owned by another lane.
 */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json' };

function serveDir(dir) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent((req.url || '/').split('?')[0]);
    const file = path.join(dir, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(dir)) {
      res.writeHead(403).end();
      return;
    }
    try {
      statSync(file);
    } catch {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '../../../../../..');
const REPO = path.resolve(CORE, '../..');
const SRC = path.join(CORE, 'src');
const BUILD = path.join(HERE, '.build');

const REVERT = process.argv.includes('--revert');

/** Engines FAB-17 changed. Popover is deliberately absent: it is the control. */
const ENGINES = [
  { family: 'feedback/Modal', label: 'Modal' },
  { family: 'feedback/Drawer', label: 'Drawer' },
  { family: 'overlay/Dropdown', label: 'Dropdown' },
];

const enginePath = (family) => path.join(SRC, 'ui/primitives', family, 'engines/modern/index.tsx');
// Same depth below the family root as engines/modern, so relative imports in
// the reverted copy resolve to exactly the same modules.
const revertPath = (family) => path.join(SRC, 'ui/primitives', family, 'tests/__fab17_revert__/index.tsx');

function writeRevertCopies() {
  const map = new Map();
  for (const { family } of ENGINES) {
    const rel = path.relative(REPO, enginePath(family));
    const head = execFileSync('git', ['show', `HEAD:${rel}`], { cwd: REPO, maxBuffer: 64 * 1024 * 1024 });
    if (head.includes('FAB-17')) {
      throw new Error(`revert copy for ${family} still contains the FAB-17 block -- HEAD is not pre-FAB-17`);
    }
    const dest = revertPath(family);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, head);
    map.set(path.normalize(enginePath(family)), dest);
  }
  return map;
}

function cleanRevertCopies() {
  for (const { family } of ENGINES) {
    rmSync(path.dirname(revertPath(family)), { recursive: true, force: true });
  }
}

async function buildScene(revertMap) {
  rmSync(BUILD, { recursive: true, force: true });
  mkdirSync(BUILD, { recursive: true });

  const scene = path.join(SRC, 'ui/primitives/overlay/Dropdown/tests/fixtures/fab17-static-hatch-scene/index.tsx');
  writeFileSync(
    path.join(BUILD, 'entry.tsx'),
    [
      `import '${path.join(SRC, 'foundation/tokens/css/facade/entrypoints/styles.css').replace(/\\/g, '/')}';`,
      `import React from 'react';`,
      `import { createRoot } from 'react-dom/client';`,
      `import Scene, { runFab17Primary, runFab17SubmenuControl } from '${scene.replace(/\\/g, '/')}';`,
      ``,
      `const host = document.getElementById('root');`,
      `createRoot(host).render(React.createElement(Scene));`,
      `window.__FAB17_PRIMARY__ = runFab17Primary;`,
      `window.__FAB17_SUBMENU__ = runFab17SubmenuControl;`,
      `window.__FAB17_READY__ = true;`,
      ``,
    ].join('\n'),
  );
  writeFileSync(
    path.join(BUILD, 'index.html'),
    `<!doctype html><html><head><meta charset="utf-8"><title>FAB-17</title></head>` +
      `<body data-engine="modern"><div id="root"></div>` +
      `<script type="module" src="./entry.tsx"></script></body></html>`,
  );

  // Resolved through Node's own resolution from this package, never a
  // hardcoded dist filename: pnpm stores these under a versioned .pnpm path
  // and the entry is .cjs for plugin-react 4.x.
  const coreRequire = createRequire(path.join(CORE, 'package.json'));
  // `require.resolve('vite')` follows the CJS condition, whose Node API is
  // deprecated and does not export `build`. Derive the package root from it and
  // load the real ESM node entry instead.
  const viteRoot = path.dirname(coreRequire.resolve('vite'));
  const { build } = await import(pathToFileURL(path.join(viteRoot, 'dist/node/index.js')).href);
  const reactMod = await import(pathToFileURL(coreRequire.resolve('@vitejs/plugin-react')).href);
  const reactPlugin = reactMod.default?.default ?? reactMod.default ?? reactMod;

  await build({
    root: BUILD,
    base: './',
    logLevel: 'error',
    plugins: [
      reactPlugin(),
      {
        // Redirects the RESOLVED module id, not the import specifier, so it is
        // insensitive to how each importer spells the relative path.
        name: 'fab17-revert',
        enforce: 'pre',
        async resolveId(source, importer, options) {
          if (!revertMap || revertMap.size === 0) return null;
          const r = await this.resolve(source, importer, { ...options, skipSelf: true });
          if (!r) return null;
          return revertMap.get(path.normalize(r.id.split('?')[0])) ?? null;
        },
      },
    ],
    resolve: { alias: { '@': SRC, '@ui': path.join(SRC, 'ui') } },
    build: { outDir: path.join(BUILD, 'dist'), emptyOutDir: true, target: 'chrome120' },
  });

  return path.join(BUILD, 'dist/index.html');
}

async function main() {
  const revertMap = REVERT ? writeRevertCopies() : new Map();
  let indexHtml;
  try {
    indexHtml = await buildScene(revertMap);
  } finally {
    if (REVERT) cleanRevertCopies();
  }

  const showroomRequire = createRequire(path.join(REPO, 'packages/showroom/package.json'));
  const pkgJson = showroomRequire.resolve('@playwright/test/package.json');
  const pkg = JSON.parse(readFileSync(pkgJson, 'utf8'));
  const entry = pkg.exports?.['.']?.import?.default ?? pkg.exports?.['.']?.import ?? pkg.main;
  const { chromium } = await import(pathToFileURL(path.join(path.dirname(pkgJson), entry)).href);

  const { server, port } = await serveDir(path.dirname(indexHtml));
  const browser = await chromium.launch();
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleLines = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('console', (m) => consoleLines.push(`[${m.type()}] ${m.text()}`));
  page.on('requestfailed', (r) => pageErrors.push(`requestfailed ${r.url()}: ${r.failure()?.errorText}`));

  let results;
  try {
    await page.goto(`http://127.0.0.1:${port}/index.html`);
    try {
      await page.waitForFunction('window.__FAB17_READY__ === true', null, { timeout: 20000 });
    } catch (e) {
      // A bare timeout here hides the real cause (module load failure, runtime
      // throw). Surface what the page actually reported before giving up.
      console.error('SCENE NEVER BECAME READY.');
      console.error('page errors:', JSON.stringify(pageErrors, null, 2));
      console.error('console:', JSON.stringify(consoleLines.slice(0, 40), null, 2));
      throw e;
    }
    await page.waitForSelector('.fab17-mark-dropdown', { timeout: 20000 });

    // Settle layout: reduced motion is emulated and animation:none is passed
    // through the hatch, but let the compositor land before measuring.
    await page.waitForTimeout(250);

    // PHASE 1 -- everything that is open declaratively, measured with the
    // modal still open.
    const primary = await page.evaluate('window.__FAB17_PRIMARY__()');

    // PHASE 2 -- the submenu control. It is the one piece that genuinely
    // requires interaction: `open` on the parent Dropdown does NOT open it.
    // The modal's <dialog> is in the browser's TOP LAYER and intercepts
    // pointer events viewport-wide, so a real hover cannot reach the item
    // until it is closed. Close it, then drive a REAL hover and wait for the
    // submenu to exist -- a control asserted against an element that never
    // rendered would be worse than omitting it.
    await page.evaluate(() => {
      // Close alone is not enough: a closed <dialog> from this engine still
      // covers the viewport, and the Drawer paints a full-viewport backdrop.
      // Phase 2 unmounts both (already measured) so a real hover can land.
      window.__FAB17_SET_PHASE__(2);
    });
    await page.waitForSelector('.fab17-mark-modal', { state: 'detached', timeout: 20000 });
    const parentItem = page.locator(".fab17-mark-submenu-host [data-part='item-shell']").first();
    await parentItem.waitFor({ timeout: 20000 });
    await parentItem.hover();
    await page.waitForSelector(".fab17-mark-submenu-host [data-part='submenu']", { timeout: 20000 });
    await page.waitForTimeout(150);
    const submenu = await page.evaluate('window.__FAB17_SUBMENU__()');

    results = [...primary, ...submenu];
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
    if (!process.env.FAB17_KEEP_BUILD) rmSync(BUILD, { recursive: true, force: true });
  }

  const mode = REVERT ? 'REVERTED (pre-FAB-17)' : 'CURRENT (FAB-17 applied)';
  console.log(`\nFAB-17 anchoring fixture -- ${mode}`);
  console.log('='.repeat(72));
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  [${r.role}]  ${r.id}`);
    console.log(`        expected: ${r.expected}`);
    console.log(`        actual:   ${r.actual}`);
  }
  const subjects = results.filter((r) => r.role === 'subject');
  const controls = results.filter((r) => r.role === 'control');
  console.log('-'.repeat(72));
  console.log(
    `subjects: ${subjects.filter((r) => r.pass).length}/${subjects.length} pass   ` +
      `controls: ${controls.filter((r) => r.pass).length}/${controls.length} pass`,
  );
  if (pageErrors.length) console.log(`page errors: ${JSON.stringify(pageErrors, null, 2)}`);

  // Under --revert the EXPECTED outcome is inverted: subjects must fail and
  // controls must hold. Exit code reflects that, so the mutation check is
  // mechanical rather than eyeballed.
  const ok = REVERT
    ? subjects.every((r) => !r.pass) && controls.every((r) => r.pass)
    : results.every((r) => r.pass);
  console.log(REVERT ? `mutation check (subjects RED + controls GREEN): ${ok ? 'OK' : 'NOT SATISFIED'}` : '');
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error('FIXTURE RUN FAILED:', e);
  process.exit(2);
});
