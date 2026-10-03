import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { findChromium } from '@checks/modern-rescue/cascade/probe/browser-analysis/index.mjs';
import { mountArm, resolvedBaseCss } from '../../support/family-causality';
import { mountTenantTheme, staticThemeIntent } from '@rottay/design-system/server';
import type { PostureBrowserConfig, PostureBrowserResult } from './app/posture-browser-scene';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../..');
const SCENE = join(HERE, 'app/posture-browser-scene/index.tsx');
const ESBUILD = join(PACKAGE_ROOT, 'node_modules/.bin/esbuild');
const CASES = [
  { id: 'phone', width: 390, viewport: 'phone', disabled: false },
  { id: 'phone-disabled', width: 390, viewport: 'phone', disabled: true },
  { id: 'tablet', width: 820, viewport: 'tablet', disabled: false },
  { id: 'desktop', width: 1440, viewport: 'desktop', disabled: false },
] as const;

function bundle(workspace: string): { client: string; server: string } {
  const client = join(workspace, 'scene.js');
  const server = join(workspace, 'server.cjs');
  const aliases = [
    `--alias:@=${join(PACKAGE_ROOT, 'src')}`,
    `--alias:@rottay/design-system=${join(PACKAGE_ROOT, 'src/index.ts')}`,
  ];
  const common = ['--bundle', '--jsx=automatic', '--loader:.css=empty', '--define:process.env.NODE_ENV="production"', ...aliases];
  execFileSync(ESBUILD, [SCENE, ...common, '--format=iife', `--outfile=${client}`], { stdio: 'pipe', cwd: PACKAGE_ROOT });
  const serverEntry = [
    "import React from 'react';",
    "import { renderToPipeableStream } from 'react-dom/server';",
    "import { PassThrough } from 'node:stream';",
    `import { PostureBrowserPage } from ${JSON.stringify(SCENE)};`,
    'const config = JSON.parse(process.argv[2]);',
    "const output = new PassThrough(); let html = ''; let stream; let settled = false; let piped = false;",
    'let timer;',
    'const fail = error => { if (settled) return; settled = true; clearTimeout(timer); stream?.abort(); output.destroy(); console.error(error); process.exitCode = 1; };',
    "output.on('data', chunk => { html += chunk.toString(); });",
    "output.on('end', () => { if (settled) return; settled = true; clearTimeout(timer); process.stdout.write('DS_POSTURE_SSR:' + JSON.stringify(html) + '\\n'); output.destroy(); });",
    "output.on('error', fail);",
    "timer = setTimeout(() => fail(new Error('ListSurface SSR did not settle within 10 seconds')), 10000);",
    'stream = renderToPipeableStream(React.createElement(PostureBrowserPage, config), {',
    'onAllReady() { queueMicrotask(() => { if (piped || settled || !stream) return; piped = true; stream.pipe(output); }); },',
    'onError: fail',
    '});',
  ].join('\n');
  execFileSync(ESBUILD, [...common, '--platform=node', '--format=cjs', '--resolve-extensions=.tsx,.ts,.js', `--outfile=${server}`], {
    input: serverEntry, stdio: ['pipe', 'pipe', 'pipe'], cwd: PACKAGE_ROOT,
  });
  return { client, server };
}

function serverMarkup(server: string, config: PostureBrowserConfig): string {
  const output = execFileSync(process.execPath, [server, JSON.stringify(config)], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 30000,
  });
  const match = /^DS_POSTURE_SSR:(.*)$/m.exec(output);
  if (!match) throw new Error('The real Node server renderer did not report ListSurface markup.');
  return JSON.parse(match[1]!) as string;
}

function measure(binary: string, page: string, width: number): PostureBrowserResult {
  const dom = execFileSync(binary, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--user-data-dir=${join(dirname(page), `${width}-profile`)}`,
    '--force-device-scale-factor=1', `--window-size=${width},900`,
    '--virtual-time-budget=10000', '--dump-dom', `file://${page}`,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
  const match = /data-probe-result="([^"]*)"/.exec(dom);
  if (!match) throw new Error(`The Chromium scene never reported geometry at ${width}px: ${dom.slice(-3000)}`);
  return JSON.parse(match[1]!.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')) as PostureBrowserResult;
}

describe('consumer surface postures — real Chromium SSR prehydration anatomy and hydrated geometry', () => {
  let workspace: string | undefined;
  const readings = new Map<string, PostureBrowserResult>();

  beforeAll(async () => {
    const binary = findChromium();
    if (!binary) throw new Error('No Chromium binary found. Install Chromium or set CASCADE_PROBE_CHROMIUM; a DOM runner cannot satisfy this suite.');
    if (!existsSync(ESBUILD)) throw new Error(`The esbuild binary is missing: ${ESBUILD}`);
    workspace = mkdtempSync(join(tmpdir(), 'ds-consumer-posture-'));
    const { server } = bundle(workspace);
    const arm = await mountArm('rottay', {});
    for (const scenario of CASES) {
      const mounted = await mountTenantTheme(staticThemeIntent('rottay'), { viewport: scenario.viewport });
      const theme = mounted.rootAttributes['data-theme'];
      if (!theme) throw new Error('The canonical Rottay mount did not declare a theme mode.');
      const attrs = Object.entries(mounted.rootAttributes).map(([name, value]) => `${name}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`).join(' ');
      const config: PostureBrowserConfig = { viewport: scenario.viewport, disabled: scenario.disabled, theme };
      const markup = serverMarkup(server, config);
      const page = join(workspace, `${scenario.id}.html`);
      writeFileSync(page, [
        `<!doctype html><html ${attrs}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`,
        `<style>${resolvedBaseCss()}</style><style>${arm.css}</style></head>`,
        `<body><div id="root">${markup}</div>`,
        `<script id="probe-config" type="application/json">${JSON.stringify(config)}</script>`,
        '<script src="./scene.js"></script></body></html>',
      ].join('\n'), 'utf8');
      const reading = measure(binary, page, scenario.width);
      readings.set(scenario.id, reading);
      console.info(`Button hit diagnostics: ${scenario.id}`, JSON.stringify({
        rect: reading.action.rect,
        scroll: reading.action.scroll,
        radii: reading.action.borderRadii,
        boundingCorners: reading.action.boundingCornerSamples,
        interior: reading.action.hitSamples.map(({ name, x, y, matchesAction, target }) => ({
          name, x, y, matchesAction, target,
        })),
      }));
      console.info(`Button density diagnostics: ${scenario.id}`, JSON.stringify(reading.density));
    }
  }, 240000);

  afterAll(() => {
    if (workspace) rmSync(workspace, { recursive: true, force: true });
  });

  it('keeps phone chrome absent in server HTML, prehydration anatomy and observed hydration', () => {
    for (const id of ['phone', 'phone-disabled']) {
      const result = readings.get(id)!;
      expect(result.viewport.width).toBe(390);
      expect(result.prepaint).toEqual(result.hydrated);
      expect(result.prepaint).toMatchObject({ columnMenu: 0, previewRail: 0, columnMenuText: false, previewRailText: false, bottomBar: 1, floating: 0, sidebar: 0, bottomNavigation: 1, primaryActions: 1, posture: 'phone' });
      expect(result.chrome).toEqual({ columnMenu: null, previewRail: null });
      expect(result.hiddenChromeInsertions).toBe(0);
      expect(result.hydrationErrors).toEqual([]);
    }
  });

  it.each([
    { id: 'phone', mode: 'sticky', position: 'sticky' },
    { id: 'tablet', mode: 'fixed', position: 'fixed' },
  ])('paints the actual $id action dock with canonical $position geometry', ({ id, mode, position }) => {
    const result = readings.get(id)!;
    expect(result.dock).not.toBeNull();
    expect(result.dock!.mode).toBe(mode);
    expect(result.dock!.position).toBe(position);
    expect(result.dock!.rect.width).toBeGreaterThan(100);
    const button = result.action.rect;
    expect(button.width).toBeGreaterThan(44);
    expect(button.height).toBeGreaterThan(20);
    expect(button.left).toBeGreaterThanOrEqual(0);
    expect(button.top).toBeGreaterThanOrEqual(0);
    expect(button.right).toBeLessThanOrEqual(result.viewport.width);
    expect(button.bottom).toBeLessThanOrEqual(result.viewport.height);
    expect(result.action.hitSamples).toHaveLength(9);
    expect(result.action.boundingCornerSamples).toHaveLength(4);
    expect(result.action.fullyHitTestable, JSON.stringify(result.action)).toBe(true);
    expect(result.action.disabled).toBe(false);
    expect(result.action.callbackCount).toBe(1);
  });

  it('preserves disabled semantics without invoking the real callback', () => {
    const result = readings.get('phone-disabled')!;
    expect(result.action.disabled).toBe(true);
    expect(result.action.callbackCount).toBe(0);
    expect(result.hydrated.primaryActions).toBe(1);
    expect(result.dock?.position).toBe('sticky');
  });

  it('keeps full desktop chrome and exactly one app-bar action without a dock', () => {
    const result = readings.get('desktop')!;
    expect(result.viewport.width).toBe(1440);
    expect(result.prepaint).toEqual(result.hydrated);
    expect(result.hydrated).toMatchObject({ columnMenu: 1, previewRail: 1, columnMenuText: true, previewRailText: true, bottomBar: 0, floating: 0, sidebar: 1, bottomNavigation: 0, primaryActions: 1, posture: 'desktop' });
    for (const region of Object.values(result.chrome)) {
      expect(region).not.toBeNull();
      expect(region!.display).not.toBe('none');
      expect(region!.visibility).toBe('visible');
      expect(region!.rect.width).toBeGreaterThan(0);
      expect(region!.rect.height).toBeGreaterThan(0);
    }
    expect(result.dock).toBeNull();
    expect(result.hydrationErrors).toEqual([]);
    expect(result.action.callbackCount).toBe(1);
    expect(result.action.hitSamples).toHaveLength(9);
    expect(result.action.boundingCornerSamples).toHaveLength(4);
    expect(result.action.fullyHitTestable, JSON.stringify(result.action)).toBe(true);
  });

  it('hydrates the explicit tablet SSR hint into the same floating declaration', () => {
    const result = readings.get('tablet')!;
    expect(result.viewport.width).toBe(820);
    expect(result.prepaint).toEqual(result.hydrated);
    expect(result.prepaint).toMatchObject({ columnMenu: 1, previewRail: 1, columnMenuText: true, previewRailText: false, bottomBar: 0, floating: 1, posture: 'tablet' });
    expect(result.hydrationErrors).toEqual([]);
  });

  it('paints phone bottom navigation and desktop sidebar at their declared viewport edges', () => {
    const phone = readings.get('phone')!;
    const bottom = phone.navigation.bottomBar;
    expect(bottom).not.toBeNull();
    expect(bottom).toMatchObject({ position: 'fixed', display: 'flex', visibility: 'visible' });
    expect(bottom!.rect.left).toBeCloseTo(0, 0);
    expect(bottom!.rect.right).toBeCloseTo(phone.viewport.width, 0);
    expect(bottom!.rect.bottom).toBeCloseTo(phone.viewport.height, 0);
    expect(bottom!.rect.height).toBeGreaterThanOrEqual(64);
    expect(phone.navigation.sidebar).toBeNull();
    expect(phone.navigation.drawerTrigger).toBeNull();

    const desktop = readings.get('desktop')!;
    const sidebar = desktop.navigation.sidebar;
    expect(sidebar).not.toBeNull();
    expect(sidebar).toMatchObject({ position: 'fixed', display: 'flex', visibility: 'visible' });
    expect(sidebar!.rect.left).toBeCloseTo(0, 0);
    expect(sidebar!.rect.top).toBeCloseTo(0, 0);
    expect(sidebar!.rect.bottom).toBeCloseTo(desktop.viewport.height, 0);
    expect(sidebar!.rect.width).toBeGreaterThan(44);
    expect(sidebar!.rect.width).toBeLessThan(desktop.viewport.width / 2);
    expect(desktop.navigation.bottomBar).toBeNull();
    expect(desktop.navigation.drawerTrigger).toBeNull();

    const tablet = readings.get('tablet')!;
    expect(tablet.navigation.bottomBar).toBeNull();
    expect(tablet.navigation.sidebar).toBeNull();
    expect(tablet.navigation.drawerTrigger).not.toBeNull();
    expect(tablet.navigation.drawerTrigger!.display).not.toBe('none');
    expect(tablet.navigation.drawerTrigger!.visibility).toBe('visible');
    expect(tablet.navigation.drawerTrigger!.rect.width).toBeGreaterThan(0);
    expect(tablet.navigation.drawerTrigger!.rect.height).toBeGreaterThan(0);
  });

  it('applies spacious, comfortable and compact density to the same real Button consumer', () => {
    const phone = readings.get('phone')!.density;
    const tablet = readings.get('tablet')!.density;
    const desktop = readings.get('desktop')!.density;
    expect(phone.posture).toBe('spacious');
    expect(tablet.posture).toBe('comfortable');
    expect(desktop.posture).toBe('compact');
    for (const density of [phone, tablet, desktop]) {
      expect(Number.isFinite(density.paddingInlineStart)).toBe(true);
      expect(Number.isFinite(density.minBlockSize)).toBe(true);
      expect(Number.isFinite(density.fontSize)).toBe(true);
      expect(density.paddingInlineStart).toBeGreaterThan(0);
      expect(density.paddingInlineStart).toBeCloseTo(density.paddingInlineEnd, 2);
      expect(density.consumerRect.height).toBeGreaterThanOrEqual(density.minBlockSize - 1);
    }
    expect(phone.paddingInlineStart).toBeGreaterThan(tablet.paddingInlineStart);
    expect(tablet.paddingInlineStart).toBeGreaterThan(desktop.paddingInlineStart);
    expect(phone.minBlockSize).toBeGreaterThan(tablet.minBlockSize);
    expect(tablet.minBlockSize).toBeGreaterThan(desktop.minBlockSize);
    expect(phone.consumerRect.height).toBeGreaterThan(tablet.consumerRect.height);
    expect(tablet.consumerRect.height).toBeGreaterThan(desktop.consumerRect.height);
    expect(phone.fontSize).toBe(tablet.fontSize);
    expect(tablet.fontSize).toBe(desktop.fontSize);
  });
});
