/**
 * @fileoverview The frozen-engine bundle keeps the cascade the split inherited.
 *
 * The Classic/Rustic stylesheets ship as a separate bundle that loads after the
 * styles bundle, so every frozen rule now sorts after every base rule of its
 * layer. Two equal-specificity ties that the frozen rule used to LOSE are pinned
 * here in real Chromium, each with a control that shows the pin is not vacuous.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const CORE_ROOT = resolve(__dirname, '../../..');
const CSS_ROOT = resolve(CORE_ROOT, 'src/foundation/tokens/css');

function resolveImports(css: string, baseDir: string): string {
  return css.replace(
    /@import\s+['"](\.[^'"]+)['"]\s*(layer\([^)]+\))?\s*;/g,
    (match, importPath: string, layerDirective: string | undefined) => {
      const fullPath = resolve(baseDir, importPath);
      if (!existsSync(fullPath)) return `/* unresolved: ${match} */`;
      const content = resolveImports(readFileSync(fullPath, 'utf8'), dirname(fullPath));
      if (!layerDirective) return content;
      return `@layer ${layerDirective.slice('layer('.length, -1)} {\n${content}\n}`;
    },
  );
}

function resolved(rel: string): string {
  const path = resolve(CSS_ROOT, rel);
  return resolveImports(readFileSync(path, 'utf8'), dirname(path));
}

/** The two sheets a frozen-engine consumer loads, in load order, plus the tenant artifact. */
function sheets(): string[] {
  const base = resolved('facade/entrypoints/base/index.css');
  const layerStatement = base.replace(/\/\*[\s\S]*?\*\//g, '').match(/@layer\s+[^;{]+;/)?.[0] ?? '';
  const tenant = readFileSync(resolve(CSS_ROOT, 'facade/artifacts/rottay/index.css'), 'utf8');
  return [base, tenant, `${layerStatement}\n${resolved('runtime/engines/frozen/index.css')}`];
}

interface CdpSession {
  send(method: string, params?: Record<string, unknown>): Promise<any>;
}
interface Page {
  setContent(html: string): Promise<void>;
  addStyleTag(options: { content: string }): Promise<unknown>;
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
  waitForTimeout(ms: number): Promise<void>;
}
interface Browser {
  newContext(): Promise<{ newPage(): Promise<Page>; newCDPSession(page: Page): Promise<CdpSession>; close(): Promise<void> }>;
  close(): Promise<void>;
}

function resolveChromium(): { launch(): Promise<Browser> } {
  for (const root of ['package.json', '../../package.json', '../showroom/package.json'].map((p) => resolve(CORE_ROOT, p))) {
    for (const specifier of ['playwright', '@playwright/test']) {
      try {
        const module = createRequire(root)(specifier) as { chromium?: { launch(): Promise<Browser> } };
        if (module.chromium) return module.chromium;
      } catch {
        // next resolution root
      }
    }
  }
  throw new Error('frozen-engine-cascade: no Playwright chromium is resolvable from core, the workspace or showroom');
}

let browser: Browser;
let styleSheets: string[];

beforeAll(async () => {
  styleSheets = sheets();
  browser = await resolveChromium().launch();
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

/** Mount `body` under the engine, force pseudo-states per `#id`, read `property` of `#e`. */
async function read(engine: string, body: string, property: string, forced: Record<string, string[]> = {}) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.setContent(
      `<!doctype html><html data-tenant="rottay" data-vertical="rottay" data-engine="${engine}"><head></head><body>${body}<span id="probe"></span></body></html>`,
    );
    for (const content of styleSheets) await page.addStyleTag({ content });
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
    for (const [id, classes] of Object.entries(forced)) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `#${id}` });
      if (nodeId) await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: classes });
    }
    // The link rules carry a colour transition; read the settled value.
    await page.waitForTimeout(1_500);
    return await page.evaluate(
      ([prop]) => getComputedStyle(document.getElementById('e') as Element).getPropertyValue(prop),
      [property] as const,
    );
  } finally {
    await context.close();
  }
}

/** The value a custom property resolves to for `property`, read through a probe element. */
async function token(engine: string, name: string, property = 'color'): Promise<string> {
  return read(engine, `<span id="e" style="${property}: var(${name})"></span>`, property);
}

const board = (moving: boolean, extra: string, child: string) =>
  `<div class="ds-pattern-widget-board${extra}" data-part="root" data-moving="${moving}" data-loading="false"><div>${child}</div></div>`;

describe('frozen-engine bundle: equal-specificity ties keep their pre-split winner', () => {
  it('a Rustic control inside a moving board reads the board grab cursor', async () => {
    const button = '<button id="e" class="rottay-button rottay-button--rustic" data-part="trigger" data-disabled="true">B</button>';
    expect(await read('rustic', board(true, '', button), 'cursor')).toBe('grabbing');
    // Control: at rest the control's own rule applies, so the moving arm is what decides.
    expect(await read('rustic', board(false, '', button), 'cursor')).toBe('not-allowed');
  }, 60_000);

  it('a Modern control inside a moving Modern board keeps its own cursor', async () => {
    const card =
      '<div class="ds-pattern-stats-grid ds-engine-modern"><div id="e" class="ds-stats-grid__card" data-interactive="true">S</div></div>';
    expect(await read('modern', board(true, ' ds-engine-modern', card), 'cursor')).toBe('pointer');
  }, 60_000);

  it('a Classic breadcrumb and active-page link, pressed by keyboard, take the link active colour', async () => {
    const active = await token('classic', '--ds-link-color-active');
    const crumb = '<nav class="ant-breadcrumb"><ol><li><a id="e" href="#x">Crumb</a></li></ol></nav>';
    const page = '<ul class="ant-pagination"><li id="li" class="ant-pagination-item ant-pagination-item-active"><a id="e" href="#x">1</a></li></ul>';
    expect(await read('classic', crumb, 'color', { e: ['active'] })).toBe(active);
    expect(await read('classic', page, 'color', { e: ['active'], li: ['active'] })).toBe(active);
    // Control: at rest each link keeps its own antd colour, so :active is what decides.
    expect(await read('classic', crumb, 'color')).toBe(await token('classic', '--ds-breadcrumb-color'));
    expect(await read('classic', page, 'color')).toBe(await token('classic', '--ds-pagination-item-color-active'));
  }, 120_000);
});
