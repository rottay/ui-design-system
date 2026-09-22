/**
 * @fileoverview Chromium runner for the layout kernel's emitted-timing scene.
 *
 * The kernel suites run under happy-dom with literal durations set inline, so
 * they cannot see how a real browser serializes the channels the sheets
 * actually emit. This runner loads those sheets -- the base motion sheet from
 * source plus every vertical bundle present in `dist/` -- into real Chromium,
 * mounts the real `useFlipLayout`, reorders, and checks per sheet that:
 *
 *   timing     readTiming() resolves the rearrange/resize channels to the same
 *              milliseconds the browser gives `animation-duration: var(...)`,
 *              and that value is > 0;
 *   played     a reorder creates one Animation per moved node whose effect
 *              duration is that value;
 *   reduced    under `prefers-reduced-motion: reduce` the channels resolve to 0.
 *
 * Non-vacuity: at least one sheet must serialize a channel as something other
 * than a plain <time> (the `calc(var() * scale)` form), or the run fails.
 *
 * `--pin <git-rev>` compiles `kernel/measure` from that revision (everything
 * else from the working tree), so one runner produces the red-before and the
 * green-after receipts. Playwright resolves from the showroom package; esbuild
 * from the installed Vite. No dependency is installed and nothing is built.
 *
 * Usage: node <this file> [--pin <git-rev>] [--json <path>]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

function findCoreRoot(from) {
  let current = from;
  while (true) {
    const candidate = resolve(current, 'package.json');
    if (existsSync(candidate)) {
      const { name } = JSON.parse(readFileSync(candidate, 'utf8'));
      if (name === '@rottay/design-system') return current;
    }
    const parent = dirname(current);
    if (parent === current) throw new Error('core package root not found above the runner');
    current = parent;
  }
}

const CORE_ROOT = findCoreRoot(HERE);
const LAYOUT_ROOT = resolve(HERE, '../../../..');
const MEASURE = resolve(LAYOUT_ROOT, 'kernel/measure/index.ts');
const MEASURE_RELATIVE = relative(CORE_ROOT, MEASURE);
const REFLOW = resolve(LAYOUT_ROOT, 'runtime/reflow/index.ts');
const BASE_SHEET = resolve(CORE_ROOT, 'src/foundation/tokens/css/foundation/animations/transitions/index.css');
const VERTICALS = ['bithire', 'evnto', 'rottay'];

const argv = process.argv.slice(2);
const pinIndex = argv.indexOf('--pin');
const PIN = pinIndex >= 0 ? argv[pinIndex + 1] : null;
const jsonIndex = argv.indexOf('--json');
const JSON_PATH = jsonIndex >= 0 ? resolve(process.cwd(), argv[jsonIndex + 1]) : null;

const coreRequire = createRequire(resolve(CORE_ROOT, 'package.json'));
const { build } = createRequire(coreRequire.resolve('vite'))('esbuild');
const { chromium } = createRequire(resolve(CORE_ROOT, '../showroom/package.json'))('@playwright/test');

const git = (...args) => execFileSync('git', ['-C', CORE_ROOT, ...args], { encoding: 'utf8' }).trim();

const measureSource = PIN
  ? { kind: 'git', revision: git('rev-parse', PIN), contents: git('show', `${PIN}:./${MEASURE_RELATIVE}`) }
  : { kind: 'working-tree', revision: git('rev-parse', 'HEAD'), contents: readFileSync(MEASURE, 'utf8') };

const measurePlugin = {
  name: 'layout-measure-source',
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /kernel[\\/]measure[\\/]index\.ts$/u }, (args) => {
      if (resolve(args.path) !== MEASURE) return undefined;
      return { contents: measureSource.contents, loader: 'ts', resolveDir: dirname(MEASURE) };
    });
  },
};

const SCENE = `
  import React, { useState } from 'react';
  import { createRoot } from 'react-dom/client';
  import { useFlipLayout } from '${REFLOW}';
  import { readTiming } from '${MEASURE}';

  const ITEMS = ['a', 'b', 'c', 'd'];

  function Scene() {
    const [items, setItems] = useState(ITEMS);
    const { register, measure } = useFlipLayout({ reducedMotion: false });
    window.drive = {
      reverse() { measure(); setItems((current) => [...current].reverse()); },
      timing(channel) { return readTiming(document.getElementById('list'), channel, '--ds-motion-ease-move'); },
    };
    return (
      <ul id="list" style={{ margin: 0, padding: 0, listStyle: 'none', width: 200 }}>
        {items.map((id) => (
          <li key={id} id={'item-' + id} ref={register(id)} style={{ height: 40 }}>{id}</li>
        ))}
      </ul>
    );
  }

  createRoot(document.getElementById('app')).render(<Scene />);
`;

async function compileScene() {
  const result = await build({
    stdin: { contents: SCENE, resolveDir: HERE, loader: 'tsx', sourcefile: 'emitted-timing-scene.tsx' },
    bundle: true,
    platform: 'browser',
    format: 'iife',
    write: false,
    logLevel: 'silent',
    alias: { '@': resolve(CORE_ROOT, 'src') },
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [measurePlugin],
  });
  return result.outputFiles[0].text;
}

const sheets = [{ id: 'source:transitions', tenant: null, path: BASE_SHEET }];
for (const vertical of VERTICALS) {
  const path = resolve(CORE_ROOT, 'dist', `${vertical}.css`);
  if (existsSync(path)) sheets.push({ id: `dist:${vertical}`, tenant: vertical, path });
}

const ORACLE_RULE = `
  #oracle-rearrange { animation-duration: var(--ds-motion-rearrange); }
  #oracle-resize { animation-duration: var(--ds-motion-resize); }
`;

const rows = [];
const pageErrors = [];
const check = (sheet, name, pass, detail) => {
  rows.push({ sheet, name, pass, ...detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${sheet}] ${name}  ${JSON.stringify(detail)}`);
};

async function mount(context, sheet, bundle) {
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(`${sheet.id}: ${String(error)}`));
  const tenant = sheet.tenant ? ` data-tenant="${sheet.tenant}"` : '';
  await page.setContent(`<!doctype html><html${tenant}><head><meta charset="utf-8"></head><body><div id="app"></div></body></html>`);
  await page.addStyleTag({ content: readFileSync(sheet.path, 'utf8') });
  await page.addStyleTag({ content: ORACLE_RULE });
  await page.addScriptTag({ content: bundle });
  await page.waitForFunction(() => document.querySelectorAll('#list > li').length === 4 && window.drive);
  return page;
}

const readScene = (page) => page.evaluate(() => {
  const list = document.getElementById('list');
  const oracle = (id) => {
    const node = document.createElement('span');
    node.id = id;
    list.appendChild(node);
    const value = getComputedStyle(node).animationDuration;
    node.remove();
    const ms = Number.parseFloat(value);
    return value.endsWith('ms') ? ms : ms * 1000;
  };
  const computed = getComputedStyle(list);
  return {
    raw: {
      rearrange: computed.getPropertyValue('--ds-motion-rearrange').trim(),
      resize: computed.getPropertyValue('--ds-motion-resize').trim(),
    },
    oracle: { rearrange: oracle('oracle-rearrange'), resize: oracle('oracle-resize') },
    kernel: {
      rearrange: window.drive.timing('--ds-motion-rearrange').durationMs,
      resize: window.drive.timing('--ds-motion-resize').durationMs,
    },
  };
});

const PLAIN_TIME = /^-?(?:\d+\.?\d*|\.\d+)(?:ms|s)$/;
let nonPlainSeen = 0;

const bundle = await compileScene();
const browser = await chromium.launch();
try {
  for (const sheet of sheets) {
    const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
    const page = await mount(context, sheet, bundle);
    const scene = await readScene(page);
    for (const channel of ['rearrange', 'resize']) {
      if (!PLAIN_TIME.test(scene.raw[channel])) nonPlainSeen += 1;
      check(sheet.id, `timing ${channel}`, scene.oracle[channel] > 0 && scene.kernel[channel] === scene.oracle[channel], {
        raw: scene.raw[channel], oracleMs: scene.oracle[channel], kernelMs: scene.kernel[channel],
      });
    }

    await page.evaluate(() => window.drive.reverse());
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => done())));
    const played = await page.evaluate(() => [...document.querySelectorAll('#list > li')].map((node) => ({
      id: node.id,
      durations: node.getAnimations().map((animation) => animation.effect.getTiming().duration),
    })));
    const animated = played.filter((entry) => entry.durations.length > 0);
    check(sheet.id, 'played', animated.length === 4 && animated.every((entry) => entry.durations.every((ms) => ms === scene.oracle.rearrange)), {
      animatedNodes: animated.length, durations: played.flatMap((entry) => entry.durations),
    });
    await context.close();

    const reduced = await browser.newContext({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' });
    const reducedPage = await mount(reduced, sheet, bundle);
    const reducedScene = await readScene(reducedPage);
    check(sheet.id, 'reduced', reducedScene.kernel.rearrange === 0 && reducedScene.kernel.resize === 0, {
      raw: reducedScene.raw, kernelMs: reducedScene.kernel,
    });
    await reduced.close();
  }
} finally {
  await browser.close();
}

check('run', 'non-vacuity: a non-plain channel was exercised', nonPlainSeen > 0, { nonPlainSeen, sheets: sheets.length });
check('run', 'no page errors', pageErrors.length === 0, { pageErrors });

const failed = rows.filter((row) => !row.pass);
const receipt = { measure: measureSource.kind, revision: measureSource.revision, pin: PIN, sheets: sheets.map((s) => s.id), rows };
if (JSON_PATH) writeFileSync(JSON_PATH, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`\n${rows.length - failed.length}/${rows.length} passed (measure from ${measureSource.kind}${PIN ? ` @ ${PIN}` : ''})`);
process.exit(failed.length === 0 ? 0 : 1);
