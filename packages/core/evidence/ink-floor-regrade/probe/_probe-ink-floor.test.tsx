/**
 * SCRATCH probe (supporting-ink floor, contrast lane).
 *
 * Through the productive door (`documentThemeIntent -> compileThemeIntent ->
 * emitThemeCss`) into real Chromium, six vertical x mode scopes:
 *
 *  1. RUNG + GROUND census - what the four supporting rungs and every ground
 *     channel actually resolve to per scope.
 *  2. CROSS-PRODUCT table - every rung on every ground, WCAG 2.x ratio and
 *     APCA Lc, so the blast radius is the full product rather than a sample.
 *  3. DERIVED-CHANNEL census - every `--ds-*` channel whose resolved colour
 *     equals a rung, i.e. the consumers that move with the re-grade.
 *
 * Colours resolve through a probe node in the page's own cascade and are read
 * through a 1x1 canvas: `color-mix()` serializes as `color(srgb ...)`.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const OUT = process.env.PROBE_OUT ?? resolve(__dirname, 'out.json');

function chromium() {
  const req = createRequire(resolve(__dirname, '../../../../showroom/package.json'));
  return (req('@playwright/test') as { chromium: any }).chromium;
}

const SCOPES: Array<{ vertical: 'rottay' | 'bithire' | 'evnto'; theme: 'light' | 'dark' }> = [
  { vertical: 'rottay', theme: 'light' },
  { vertical: 'rottay', theme: 'dark' },
  { vertical: 'bithire', theme: 'light' },
  { vertical: 'bithire', theme: 'dark' },
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'evnto', theme: 'dark' },
];

const RUNGS = [
  '--ds-color-text-primary',
  '--ds-color-text-secondary',
  '--ds-color-text-tertiary',
  '--ds-color-text-muted',
  '--ds-color-text-subtle',
  '--ds-color-text-disabled',
];

/** Grounds a supporting ink is actually painted on, page-canvas-composited. */
const GROUNDS: Array<{ id: string; layers: string[] }> = [
  { id: 'canvas', layers: ['var(--ds-color-bg-primary)'] },
  { id: 'card', layers: ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'elevated', layers: ['var(--ds-color-bg-elevated)', 'var(--ds-color-bg-primary)'] },
  { id: 'panel', layers: ['var(--ds-surface-panel-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'bg-secondary', layers: ['var(--ds-color-bg-secondary)', 'var(--ds-color-bg-primary)'] },
  { id: 'bg-tertiary', layers: ['var(--ds-color-bg-tertiary)', 'var(--ds-color-bg-primary)'] },
  { id: 'bg-subtle', layers: ['var(--ds-color-bg-subtle)', 'var(--ds-color-bg-primary)'] },
  { id: 'bg-hover', layers: ['var(--ds-color-bg-hover)', 'var(--ds-color-bg-primary)'] },
  { id: 'input', layers: ['var(--ds-color-bg-input)', 'var(--ds-color-bg-primary)'] },
  { id: 'surface', layers: ['var(--ds-color-surface)', 'var(--ds-color-bg-primary)'] },
  { id: 'sidebar', layers: ['var(--ds-sidebar-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'menu', layers: ['var(--ds-menu-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'popover', layers: ['var(--ds-popover-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'drawer', layers: ['var(--ds-drawer-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'table-header', layers: ['var(--ds-table-header-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
];

describe('supporting-ink floor probe', () => {
  it('reads every rung on every ground in six scopes', async () => {
    const browser = await chromium().launch();
    const out: Record<string, unknown> = {};
    try {
      const ctx = await browser.newContext();
      const base = resolvedBaseCss();
      const declared = [...new Set((base.match(/--ds-[a-z0-9-]+(?=\s*:)/g) ?? []))].sort();
      for (const scope of SCOPES) {
        const page = await ctx.newPage();
        const arm = await mountArm(scope.vertical, {});
        await page.setContent('<!doctype html><html lang="en"><head><title>p</title></head><body></body></html>');
        await page.addStyleTag({ content: base });
        await page.addStyleTag({ content: arm.css });
        out[`${scope.vertical} ${scope.theme}`] = await page.evaluate(
          ({ rootAttributes, theme, declared, rungs, grounds }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) {
              document.documentElement.setAttribute(n, v);
            }
            document.documentElement.setAttribute('data-theme', theme);
            if (theme === 'dark') document.documentElement.classList.add('dark');
            const probe = document.createElement('div');
            probe.style.background = 'var(--ds-color-bg-primary)';
            document.body.append(probe);

            const canvas = document.createElement('canvas');
            canvas.width = 1; canvas.height = 1;
            const c2 = canvas.getContext('2d', { willReadFrequently: true })!;
            const parse = (value: string): [number, number, number, number] | null => {
              const v = (value || '').trim();
              if (!v || v === 'transparent' || v === 'none') return [0, 0, 0, 0];
              c2.clearRect(0, 0, 1, 1);
              c2.fillStyle = '#000000';
              try { c2.fillStyle = v; } catch { return null; }
              c2.clearRect(0, 0, 1, 1);
              c2.globalAlpha = 1;
              c2.fillRect(0, 0, 1, 1);
              const d = c2.getImageData(0, 0, 1, 1).data;
              return [d[0], d[1], d[2], d[3] / 255];
            };
            const resolveColor = (value: string): [number, number, number, number] | null => {
              probe.style.setProperty('color', '');
              probe.style.setProperty('color', value);
              const computed = getComputedStyle(probe).color;
              if (!computed) return null;
              return parse(computed);
            };
            const over = (fg: any, bg: any): [number, number, number, number] => {
              const a = fg[3] + bg[3] * (1 - fg[3]);
              if (a === 0) return [0, 0, 0, 0];
              return [
                (fg[0] * fg[3] + bg[0] * bg[3] * (1 - fg[3])) / a,
                (fg[1] * fg[3] + bg[1] * bg[3] * (1 - fg[3])) / a,
                (fg[2] * fg[3] + bg[2] * bg[3] * (1 - fg[3])) / a,
                a,
              ];
            };
            const lum = (c: any) => {
              const f = (x: number) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
              return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
            };
            const ratio = (a: any, b: any) => {
              const l1 = lum(a), l2 = lum(b);
              return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
            };
            // APCA 0.98G-4g, the SAPC-W3 reference form.
            const apca = (txt: any, bgc: any) => {
              const Y = (c: any) => 0.2126729 * (c[0] / 255) ** 2.4 + 0.7151522 * (c[1] / 255) ** 2.4 + 0.0721750 * (c[2] / 255) ** 2.4;
              const clamp = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
              let Ytxt = clamp(Y(txt)); let Ybg = clamp(Y(bgc));
              if (Math.abs(Ybg - Ytxt) < 0.0005) return 0;
              let out: number;
              if (Ybg > Ytxt) out = (Ybg ** 0.56 - Ytxt ** 0.57) * 1.14;
              else out = (Ybg ** 0.65 - Ytxt ** 0.62) * 1.14;
              if (Math.abs(out) < 0.1) out = 0;
              else if (out > 0) out -= 0.027;
              else out += 0.027;
              return Math.round(out * 100 * 10) / 10;
            };
            const hex = (c: any) => c ? `#${[c[0], c[1], c[2]].map((x: number) => Math.round(x).toString(16).padStart(2, '0')).join('')}${c[3] < 0.999 ? `@${c[3].toFixed(2)}` : ''}` : 'null';

            const rootCs = getComputedStyle(document.documentElement);
            const channels: Record<string, string> = {};
            for (const name of declared as string[]) {
              const raw = rootCs.getPropertyValue(name).trim();
              if (raw) channels[name] = raw;
            }

            // Resolved rung colours.
            const rungColors: Record<string, any> = {};
            const rungHex: Record<string, string> = {};
            for (const r of rungs as string[]) {
              const c = resolveColor(`var(${r})`);
              rungColors[r] = c; rungHex[r] = hex(c);
            }
            // Resolved, composited grounds.
            const groundColors: Record<string, any> = {};
            const groundHex: Record<string, string> = {};
            for (const g of grounds as any[]) {
              let acc: [number, number, number, number] = [0, 0, 0, 0];
              for (const layer of g.layers) {
                const c = resolveColor(layer);
                if (!c) continue;
                acc = over(acc, c);
                if (acc[3] >= 0.999) break;
              }
              if (acc[3] < 0.999) acc = over(acc, [255, 255, 255, 1]);
              groundColors[g.id] = acc; groundHex[g.id] = hex(acc);
            }
            const table: Record<string, any> = {};
            for (const r of rungs as string[]) {
              for (const g of grounds as any[]) {
                const ink = rungColors[r]; const bg = groundColors[g.id];
                if (!ink || !bg) continue;
                table[`${r.replace('--ds-color-', '')}@${g.id}`] = {
                  ink: rungHex[r], ground: groundHex[g.id],
                  ratio: ratio(ink, bg), lc: apca(ink, bg), pass: ratio(ink, bg) >= 4.5,
                };
              }
            }
            // Every declared channel whose resolved colour equals a rung.
            const derived: Record<string, string[]> = {};
            for (const name of declared as string[]) {
              if (!/color|foreground|ink|fill/.test(name)) continue;
              const c = resolveColor(`var(${name})`);
              if (!c || c[3] < 0.999) continue;
              const h = hex(c);
              for (const r of rungs as string[]) {
                if (rungHex[r] === h && r !== '--ds-color-text-primary') {
                  (derived[r] ??= []).push(name);
                }
              }
            }
            return { rungs: rungHex, grounds: groundHex, table, derived, channels };
          },
          { rootAttributes: arm.rootAttributes, theme: scope.theme, declared, rungs: RUNGS, grounds: GROUNDS },
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
    mkdirSync(resolve(OUT, '..'), { recursive: true });
    writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
    expect(Object.keys(out)).toHaveLength(6);
  }, 600_000);
});
