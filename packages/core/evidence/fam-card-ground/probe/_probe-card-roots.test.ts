/** TEMPORARY writer probe — card ground. Deleted before handoff. */
import { describe, it } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const CORE_ROOT = resolve(__dirname, '../../..');
function chromium(): any {
  for (const root of [resolve(CORE_ROOT, 'package.json'), resolve(CORE_ROOT, '../../package.json')]) {
    for (const s of ['playwright', '@playwright/test']) {
      try { const m = createRequire(root)(s) as any; if (m.chromium) return m.chromium; } catch { /* next */ }
    }
  }
  throw new Error('no chromium');
}
const SCOPES: ReadonlyArray<{ v: any; t: 'light' | 'dark' }> = [
  { v: 'rottay', t: 'dark' }, { v: 'evnto', t: 'dark' }, { v: 'bithire', t: 'dark' },
  { v: 'rottay', t: 'light' }, { v: 'bithire', t: 'light' }, { v: 'evnto', t: 'light' },
];
const CHANNELS = [
  '--ds-card-bg', '--ds-card-bg-hover', '--ds-card-bg-active', '--ds-card-bg-selected', '--ds-card-bg-disabled',
  '--ds-card-default-bg', '--ds-card-bordered-bg', '--ds-card-elevated-bg', '--ds-card-flat-bg', '--ds-card-ghost-bg',
  '--ds-card-color', '--ds-card-color-muted', '--ds-card-border-color', '--ds-card-cover-content-color',
  '--ds-surface-card', '--ds-color-bg-elevated', '--ds-color-white', '--ds-surface-panel', '--ds-material-card-background',
  '--ds-breadcrumb-current-bg', '--ds-breadcrumb-bg', '--ds-menu-bg', '--ds-menu-panel-bg',
  '--ds-stepper-item-bg', '--ds-segmented-item-bg-selected', '--ds-pagination-item-bg-hover',
  '--ds-color-text-primary', '--ds-color-bg-primary',
];

describe('tmp card roots', () => {
  it('reads card channels in every scope', async () => {
    const browser = await chromium().launch();
    const out: Record<string, Record<string, string>> = {};
    try {
      const ctx = await browser.newContext();
      for (const { v, t } of SCOPES) {
        const page = await ctx.newPage();
        await page.setContent('<!doctype html><html><head></head><body></body></html>');
        const arm = await mountArm(v, {});
        await page.addStyleTag({ content: resolvedBaseCss() });
        await page.addStyleTag({ content: arm.css });
        out[`${v} ${t}`] = await page.evaluate(
          ({ rootAttributes, channels }: any) => {
            for (const [n, val] of Object.entries(rootAttributes)) document.documentElement.setAttribute(n, val as string);
            const cv = document.createElement('canvas'); cv.width = cv.height = 1;
            const cx = cv.getContext('2d')!;
            const solid = (c: string) => {
              if (!c || c.includes('gradient') || c === 'transparent') return c;
              cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
              const d = cx.getImageData(0, 0, 1, 1).data;
              return d[3] === 255 ? `#${[d[0], d[1], d[2]].map((n) => (n as number).toString(16).padStart(2, '0')).join('')}` : c;
            };
            const cs = getComputedStyle(document.documentElement);
            const r: Record<string, string> = {};
            for (const c of channels) { const raw = cs.getPropertyValue(c).trim(); r[c] = solid(raw) || '(unset)'; }
            return r;
          },
          { rootAttributes: { ...arm.rootAttributes, 'data-theme': t }, channels: CHANNELS },
        );
        await page.close();
      }
    } finally { await browser.close(); }
    console.log('ROOTS_START'); console.log(JSON.stringify(out)); console.log('ROOTS_END');
  }, 300_000);
});
