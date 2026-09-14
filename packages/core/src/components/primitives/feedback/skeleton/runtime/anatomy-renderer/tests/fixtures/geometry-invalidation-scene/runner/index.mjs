/**
 * @fileoverview Chromium runner for the skeleton geometry-invalidation scene.
 *
 * Compiles the anatomy renderer in memory (esbuild, resolved through the
 * already-installed Vite) and mounts it in a real Chromium page (Playwright,
 * resolved from the showroom package). No dependency is installed and no
 * package build is produced.
 *
 * Two scenes run in one serialized browser:
 *
 *   geometry   Every observed box stays constant (wrapper 1264x100, trigger
 *              40x40) while something ABOVE the source changes the trigger's
 *              radius or position: an inherited custom property authored on an
 *              ancestor's style attribute, a scoped ancestor `dir`, a provider
 *              class that gates a transform. Two positive controls mutate a
 *              harmless attribute INSIDE the source. One observation row
 *              records the declared bound: a stylesheet-only move that touches
 *              no attribute and no box has no DOM signal, so the bone is
 *              expected to catch up on the next supported ancestor signal, not
 *              on the stylesheet itself.
 *
 *   regression The historical family (fixed outer box): descendant resize,
 *              stylesheet-driven resize, late webfont, part removal and
 *              insertion, `dir` on the document element, shimmer and pulse
 *              shutdown, inert isolation on and off, reduced motion.
 *
 * `--pin <git-rev>` compiles the renderer from that revision instead of the
 * working tree (relative imports still resolve against the live folder), so
 * the same runner produces the red-before and the green-after receipts.
 *
 * Usage: node <this file> [--pin <git-rev>] [--json <path>] [--headed]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
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
const SRC_ROOT = resolve(CORE_ROOT, 'src');
const RENDERER_RELATIVE = 'src/components/primitives/feedback/skeleton/runtime/anatomy-renderer/index.tsx';
const RENDERER = resolve(CORE_ROOT, RENDERER_RELATIVE);
const SKIN = resolve(SRC_ROOT, 'foundation/tokens/css/presentation/components/skin/skeleton-anatomy/index.css');
const MOTION_TOKENS = resolve(SRC_ROOT, 'foundation/tokens/css/foundation/animations/transitions/index.css');
const KEYFRAMES = resolve(SRC_ROOT, 'foundation/tokens/css/foundation/animations/keyframes/index.css');

const argv = process.argv.slice(2);
const HEADED = argv.includes('--headed');
const pinIndex = argv.indexOf('--pin');
const PIN = pinIndex >= 0 ? argv[pinIndex + 1] : null;
const jsonIndex = argv.indexOf('--json');
const JSON_PATH = jsonIndex >= 0 ? resolve(process.cwd(), argv[jsonIndex + 1]) : null;

const coreRequire = createRequire(resolve(CORE_ROOT, 'package.json'));
const { build } = createRequire(coreRequire.resolve('vite'))('esbuild');
const { chromium } = createRequire(resolve(CORE_ROOT, '../showroom/package.json'))('@playwright/test');

const git = (...args) => execFileSync('git', ['-C', CORE_ROOT, ...args], { encoding: 'utf8' }).trim();

const rendererSource = PIN
  ? { kind: 'git', revision: git('rev-parse', PIN), contents: git('show', `${PIN}:./${RENDERER_RELATIVE}`) }
  : { kind: 'working-tree', revision: git('rev-parse', 'HEAD'), contents: readFileSync(RENDERER, 'utf8') };

const rendererPlugin = {
  name: 'skeleton-renderer-source',
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /anatomy-renderer[\\/]index\.tsx$/u }, (args) => {
      if (resolve(args.path) !== RENDERER) return undefined;
      return { contents: rendererSource.contents, loader: 'tsx', resolveDir: dirname(RENDERER) };
    });
  },
};

async function compileScene(contents, sourcefile) {
  const result = await build({
    stdin: { contents, resolveDir: HERE, loader: 'tsx', sourcefile },
    bundle: true,
    platform: 'browser',
    format: 'iife',
    write: false,
    logLevel: 'silent',
    alias: { '@': SRC_ROOT },
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [rendererPlugin],
  });
  return result.outputFiles[0].text;
}

const GEOMETRY_SCENE = `
  import React from 'react';
  import { createRoot } from 'react-dom/client';
  import { AnatomySkeleton } from '${RENDERER}';
  createRoot(document.getElementById('app')).render(
    <AnatomySkeleton animation={false}>
      <div data-part="root" style={{ width: 320, height: 100, display: 'flex', gap: 8 }}>
        <span id="test-control" data-part="trigger" style={{ width: 40, height: 40, flex: 'none', borderRadius: 'var(--test-radius, 4px)' }} />
        <span data-part="title" style={{ width: 100, height: 20, flex: 'none' }} />
      </div>
    </AnatomySkeleton>,
  );
`;

const REGRESSION_SCENE = `
  import React, { useState } from 'react';
  import { createRoot } from 'react-dom/client';
  import { AnatomySkeleton } from '${RENDERER}';

  function Family({ wide, extra }) {
    return (
      <div data-part="root" style={{ width: 320, height: 180, padding: 16, boxSizing: 'border-box', overflow: 'hidden' }}>
        <div data-part="header" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span data-part="icon" style={{ width: 24, height: 24, flex: '0 0 auto', display: 'inline-block' }} />
          <span data-part="title" style={{ width: wide ? 200 : 120, height: 24, flex: '0 0 auto', display: 'inline-block' }} />
        </div>
        <span data-part="text" style={{ display: 'inline-block', whiteSpace: 'nowrap', fontFamily: 'LateFace, monospace', fontSize: 16 }}>
          Quarterly report
        </span>
        {extra ? <span data-part="description" style={{ display: 'block', width: 200, height: 20 }} /> : null}
        <div data-part="actions" style={{ marginTop: 12 }}>
          <button type="button" data-part="trigger" id="save" style={{ height: 44 }}>Save changes</button>
        </div>
      </div>
    );
  }

  function Harness() {
    const [loading, setLoading] = useState(true);
    const [wide, setWide] = useState(false);
    const [extra, setExtra] = useState(true);
    const [animation, setAnimation] = useState('wave');
    window.drive = { setLoading, setWide, setExtra, setAnimation };
    return (
      <div id="host" style={{ width: 352, height: 212, boxSizing: 'border-box' }}>
        <AnatomySkeleton loading={loading} animation={animation}>
          <Family wide={wide} extra={extra} />
        </AnatomySkeleton>
      </div>
    );
  }

  createRoot(document.getElementById('app')).render(<Harness />);
  window.mounted = true;
`;

const GEOMETRY_PAGE = '<!doctype html><html><head><meta charset="utf-8"></head><body><section id="scope" dir="ltr"><div id="app"></div></section></body></html>';
const REGRESSION_PAGE = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div></body></html>';
const PROVIDER_SHIFT_RULE = '#scope.shifted #test-control { transform: translateX(17px); }';

const rows = [];
const observations = [];
const pageErrors = [];

const check = (scene, name, pass, detail) => {
  rows.push({ scene, name, pass, ...detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${scene}] ${name}`);
};

const observe = (scene, name, detail) => {
  observations.push({ scene, name, ...detail });
  console.log(`NOTE  [${scene}] ${name}: ${detail.summary}`);
};

const sameBox = (left, right) => JSON.stringify(left) === JSON.stringify(right);

async function runGeometryScene(browser, bundle) {
  const skin = readFileSync(SKIN, 'utf8');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(`geometry: ${String(error)}`));

  const reset = async () => {
    await page.setContent(GEOMETRY_PAGE);
    await page.addStyleTag({ content: skin });
    await page.addStyleTag({ content: PROVIDER_SHIFT_RULE });
    await page.addScriptTag({ content: bundle });
    await page.waitForFunction(() => document.querySelector('[data-source-part="trigger"]'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(100);
  };

  const snapshot = () => page.evaluate(() => {
    const source = document.querySelector('[data-part="source"]');
    const part = document.getElementById('test-control');
    const bone = document.querySelector('[data-source-part="trigger"]');
    const sourceRect = source.getBoundingClientRect();
    const partRect = part.getBoundingClientRect();
    return {
      wrapper: [sourceRect.width, sourceRect.height],
      partSize: [partRect.width, partRect.height],
      partX: partRect.left - sourceRect.left,
      boneX: parseFloat(bone.style.getPropertyValue('--ds-skeleton-bone-x')),
      partRadius: getComputedStyle(part).borderRadius,
      boneRadius: bone.style.getPropertyValue('--ds-skeleton-bone-radius'),
    };
  });

  const settled = async (action) => {
    await page.evaluate(action);
    await page.waitForTimeout(200);
    return snapshot();
  };

  const boxesHeld = (before, after) => sameBox(before.wrapper, after.wrapper) && sameBox(before.partSize, after.partSize);

  // G1: inherited custom property authored on an ancestor's style attribute.
  await reset();
  let before = await snapshot();
  let after = await settled(() => document.getElementById('scope').style.setProperty('--test-radius', '20px'));
  check('geometry', 'G1 ancestor style attribute changes the inherited radius, boxes held',
    boxesHeld(before, after) && after.partRadius === '20px' && after.boneRadius === after.partRadius,
    { before, after });
  after = await settled(() => document.getElementById('test-control').setAttribute('data-audit-refresh', 'true'));
  check('geometry', 'G1c positive control: a source mutation reads the current radius',
    after.boneRadius === after.partRadius && after.partRadius === '20px', { after });

  // G2: writing direction on a scoped ancestor, not on the document element.
  await reset();
  before = await snapshot();
  after = await settled(() => document.getElementById('scope').setAttribute('dir', 'rtl'));
  check('geometry', 'G2 scoped ancestor dir ltr->rtl moves the part, boxes held',
    boxesHeld(before, after) && after.partX > 0 && after.boneX === after.partX, { before, after });
  after = await settled(() => document.getElementById('test-control').setAttribute('data-audit-refresh', 'true'));
  check('geometry', 'G2c positive control: a source mutation reads the current position',
    after.boneX === after.partX && after.partX > 0, { after });

  // G3: a provider class above the source gates a transform authored in a stylesheet.
  await reset();
  before = await snapshot();
  after = await settled(() => document.getElementById('scope').classList.add('shifted'));
  check('geometry', 'G3 ancestor class gates a stylesheet transform, boxes held',
    boxesHeld(before, after) && after.partX === 17 && after.boneX === 17, { before, after });

  // G4: the declared bound, then recovery through the supported surface.
  await reset();
  before = await snapshot();
  await page.addStyleTag({ content: '#test-control { transform: translateX(17px); }' });
  await page.waitForTimeout(200);
  const stylesheetOnly = await snapshot();
  observe('geometry', 'G4 stylesheet-only move with no attribute and no box change (declared bound)', {
    before,
    after: stylesheetOnly,
    covered: stylesheetOnly.boneX === stylesheetOnly.partX,
    summary: `part x ${before.partX} -> ${stylesheetOnly.partX}, bone x ${stylesheetOnly.boneX}; covered=${stylesheetOnly.boneX === stylesheetOnly.partX}`,
  });
  after = await settled(() => document.getElementById('scope').setAttribute('data-theme', 'dark'));
  check('geometry', 'G4r next supported ancestor signal (data-theme) catches the bone up',
    boxesHeld(before, after) && after.partX === 17 && after.boneX === 17, { before: stylesheetOnly, after });

  await context.close();
}

async function runRegressionScene(browser, bundle) {
  const css = [readFileSync(MOTION_TOKENS, 'utf8'), readFileSync(KEYFRAMES, 'utf8'), readFileSync(SKIN, 'utf8')];

  const open = async (reducedMotion) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(`regression: ${String(error)}`));
    await page.emulateMedia({ reducedMotion });
    await page.setContent(REGRESSION_PAGE);
    for (const content of css) await page.addStyleTag({ content });
    await page.addScriptTag({ content: bundle });
    await page.waitForFunction(() => window.mounted === true);
    await page.waitForFunction(() => document.querySelectorAll("[data-part='bone']").length > 0);
    await page.waitForTimeout(100);
    return { context, page };
  };

  const snapshot = (page) => page.evaluate(() => {
    const root = document.querySelector('.ds-skeleton-anatomy');
    const source = root.querySelector("[data-part='source']");
    const bones = {};
    const channels = {};
    for (const bone of root.querySelectorAll("[data-part='bone']")) {
      const rect = bone.getBoundingClientRect();
      bones[bone.dataset.sourcePart] = [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)];
      channels[bone.dataset.sourcePart] = ['x', 'y', 'width', 'height']
        .map((key) => Math.round(parseFloat(bone.style.getPropertyValue(`--ds-skeleton-bone-${key}`)) || 0));
    }
    const wrapper = source.getBoundingClientRect();
    const animations = root.getAnimations({ subtree: true });
    return {
      bones,
      channels,
      wrapper: [Math.round(wrapper.left), Math.round(wrapper.top), Math.round(wrapper.width), Math.round(wrapper.height)],
      loading: root.getAttribute('data-loading'),
      animation: root.getAttribute('data-animation'),
      inert: source.hasAttribute('inert') ? source.getAttribute('inert') : null,
      running: animations.filter((animation) => animation.playState === 'running').map((animation) => animation.animationName || 'transition'),
      all: animations.map((animation) => `${animation.animationName || 'transition'}:${animation.playState}`),
    };
  });

  let { context, page } = await open('no-preference');
  const before = await snapshot(page);

  await page.evaluate(() => window.drive.setWide(true));
  await page.waitForTimeout(250);
  const afterWide = await snapshot(page);
  check('regression', 'A1 descendant resize with constant wrapper bounds',
    sameBox(before.wrapper, afterWide.wrapper) && before.bones.title[2] !== afterWide.bones.title[2] && afterWide.bones.title[2] === 200,
    { wrapper: [before.wrapper, afterWide.wrapper], title: [before.bones.title[2], afterWide.bones.title[2]] });

  await page.addStyleTag({ content: "[data-part='trigger'] { width: 260px !important; }" });
  await page.waitForTimeout(250);
  const afterCss = await snapshot(page);
  check('regression', 'A2 stylesheet-driven descendant resize, wrapper unchanged',
    Math.abs(afterCss.bones.trigger[2] - 260) <= 1 && sameBox(afterCss.wrapper, before.wrapper),
    { trigger: [afterWide.bones.trigger[2], afterCss.bones.trigger[2]], wrapper: afterCss.wrapper });

  const font = await page.evaluate(async () => {
    const face = new FontFace('LateFace', 'local("Impact")');
    document.fonts.add(face);
    await face.load();
    await document.fonts.ready;
    return { status: document.fonts.status, loaded: face.status };
  });
  await page.waitForTimeout(300);
  const afterFont = await snapshot(page);
  check('regression', 'A3 a delayed font settles and the text bone catches up, wrapper unchanged',
    afterFont.bones.text[2] !== afterCss.bones.text[2] && sameBox(afterFont.wrapper, before.wrapper),
    { font, text: [afterCss.bones.text[2], afterFont.bones.text[2]], wrapper: afterFont.wrapper });

  await page.evaluate(() => window.drive.setExtra(false));
  await page.waitForTimeout(200);
  const removed = await snapshot(page);
  await page.evaluate(() => window.drive.setExtra(true));
  await page.waitForTimeout(200);
  const reinserted = await snapshot(page);
  check('regression', 'A4 part removal and insertion',
    Boolean(before.bones.description) && !removed.bones.description && Boolean(reinserted.bones.description),
    { present: Boolean(before.bones.description), removed: !removed.bones.description, back: Boolean(reinserted.bones.description) });

  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await page.waitForTimeout(250);
  const rtl = await snapshot(page);
  check('regression', 'A5 direction change on the document element',
    rtl.channels.icon[0] !== reinserted.channels.icon[0] && rtl.channels.icon[0] > 200,
    { iconX: [reinserted.channels.icon[0], rtl.channels.icon[0]] });
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));
  await page.waitForTimeout(150);

  const loadingAnimation = await snapshot(page);
  check('regression', 'B1 shimmer loop runs while loading',
    loadingAnimation.running.includes('ds-foundation-shimmer'), { running: loadingAnimation.running });

  await page.evaluate(() => window.drive.setLoading(false));
  await page.waitForTimeout(1200);
  const done = await snapshot(page);
  check('regression', 'B2 no skeleton loop after loading ends and the handover completes',
    done.running.filter((name) => /ds-foundation-(?:shimmer|pulse)/u.test(name)).length === 0 && done.loading === 'false',
    { loading: done.loading, animations: done.all });

  await page.evaluate(() => window.drive.setLoading(true));
  await page.waitForTimeout(400);
  const again = await snapshot(page);
  check('regression', 'B3 a later loading cycle resumes the loop',
    again.running.includes('ds-foundation-shimmer'), { running: again.running });

  await page.evaluate(() => window.drive.setAnimation('pulse'));
  await page.waitForTimeout(300);
  const pulse = await snapshot(page);
  await page.evaluate(() => window.drive.setLoading(false));
  await page.waitForTimeout(1200);
  const pulseDone = await snapshot(page);
  check('regression', 'B4 the pulse loop stops the same way',
    pulse.running.includes('ds-foundation-pulse') && pulseDone.running.filter((name) => /ds-foundation-/u.test(name)).length === 0,
    { loadingRunning: pulse.running, doneRunning: pulseDone.running });

  await page.evaluate(() => { window.drive.setLoading(true); window.drive.setAnimation('wave'); });
  await page.waitForTimeout(300);
  const isolation = await page.evaluate(() => {
    const button = document.getElementById('save');
    button.focus();
    const rect = button.getBoundingClientRect();
    return {
      focused: document.activeElement === button,
      hit: document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === button,
      inertAncestor: Boolean(button.closest('[inert]')),
    };
  });
  check('regression', 'C1 while loading the control is neither focusable nor hit-testable',
    !isolation.focused && !isolation.hit && isolation.inertAncestor, isolation);

  await page.evaluate(() => window.drive.setLoading(false));
  await page.waitForTimeout(400);
  const restored = await page.evaluate(() => {
    const button = document.getElementById('save');
    button.focus();
    const rect = button.getBoundingClientRect();
    return {
      focused: document.activeElement === button,
      hit: document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === button,
      inertAncestor: Boolean(button.closest('[inert]')),
    };
  });
  check('regression', 'C2 normal behaviour returns once loading ends',
    restored.focused && restored.hit && !restored.inertAncestor, restored);
  await context.close();

  ({ context, page } = await open('reduce'));
  const reducedLoading = await snapshot(page);
  await page.evaluate(() => window.drive.setLoading(false));
  await page.waitForTimeout(800);
  const reducedDone = await snapshot(page);
  check('regression', 'D1 reduced motion is static throughout',
    reducedLoading.running.filter((name) => /ds-foundation-/u.test(name)).length === 0
      && reducedDone.running.filter((name) => /ds-foundation-/u.test(name)).length === 0,
    { loading: reducedLoading.all, done: reducedDone.all });
  await context.close();
}

async function main() {
  const [geometryBundle, regressionBundle] = await Promise.all([
    compileScene(GEOMETRY_SCENE, 'geometry-scene.tsx'),
    compileScene(REGRESSION_SCENE, 'regression-scene.tsx'),
  ]);
  const browser = await chromium.launch({ headless: !HEADED });
  try {
    await runGeometryScene(browser, geometryBundle);
    await runRegressionScene(browser, regressionBundle);
  } finally {
    await browser.close();
  }

  const failed = rows.filter((row) => !row.pass);
  const report = {
    runner: 'skeleton geometry-invalidation scene',
    ranAt: new Date().toISOString(),
    renderer: { source: rendererSource.kind, revision: rendererSource.revision, path: RENDERER_RELATIVE },
    chromium: browser.version(),
    pageErrors,
    summary: { passed: rows.length - failed.length, failed: failed.length, observations: observations.length },
    assertions: rows,
    observations,
  };
  if (JSON_PATH) {
    mkdirSync(dirname(JSON_PATH), { recursive: true });
    writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(`\nrenderer: ${rendererSource.kind} @ ${rendererSource.revision}`);
  console.log(`page errors: ${pageErrors.length}`);
  for (const error of pageErrors) console.log(`   ${error}`);
  console.log(`${report.summary.passed}/${rows.length} browser assertions passed, ${observations.length} observation(s)`);
  process.exitCode = failed.length === 0 && pageErrors.length === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
