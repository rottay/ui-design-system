/**
 * SCRATCH probe (the `#e5e5e5` ground-side exit, contrast lane).
 *
 * Through the productive door (`documentThemeIntent -> compileThemeIntent ->
 * emitThemeCss`) into real Chromium, six vertical x mode scopes:
 *
 *  1. CHAIN census - what every member of the tertiary-ground alias chain
 *     resolves to per scope, so "one producer" is measured rather than read.
 *  2. WELL table - each census well's ground (composited over its parents,
 *     worst-case stop for gradients) against the ink the source paints on it,
 *     WCAG 2.x ratio and APCA Lc.
 *  3. LADDER cross-product - every supporting rung on every chain ground.
 *  4. LIGHT-INK safety scan - every declared ink channel lighter than the
 *     ground. Lightening a ground can only REDUCE contrast for these; the
 *     claim "nothing drops below its floor" is exactly the claim that this
 *     set never lands on a chain ground.
 *  5. PINNED node - the real `span[data-part='draft-status-label']` from
 *     server markup: computed ink over its composited ancestor ground.
 *
 * Colours resolve through a probe node in the page's own cascade and are read
 * through a 1x1 canvas: `color-mix()` serializes as `color(srgb ...)`.
 */
import React from 'react';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { Writable } from 'node:stream';
import { writeFileSync, mkdirSync } from 'node:fs';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { GuidedDraftFormSurface } from '@/components/surfaces/presentation/pages/forms/guided-draft-form';
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

/** The tertiary-ground alias chain, head first. */
const CHAIN = [
  '--ds-color-neutral-200',
  '--ds-color-bg-tertiary',
  '--ds-surface-panel',
  '--ds-material-panel-background',
  '--ds-surface-panel-bg',
  '--ds-color-surface-subtle',
  '--ds-list-skeleton-bg',
  '--ds-live-feed-skeleton-bg',
  '--ds-stats-grid-skeleton-bg',
  '--ds-upload-card-bg',
  '--ds-input-filled-bg-hover',
  '--ds-color-border',
  '--ds-color-border-primary',
];

const RUNGS = [
  '--ds-color-text-primary',
  '--ds-color-text-secondary',
  '--ds-color-text-tertiary',
  '--ds-color-text-muted',
  '--ds-color-text-subtle',
  '--ds-color-text-disabled',
];

const CHAIN_GROUNDS = [
  { id: 'bg-tertiary', layers: ['var(--ds-color-bg-tertiary)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'surface-panel', layers: ['var(--ds-surface-panel)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'surface-panel-bg', layers: ['var(--ds-surface-panel-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'surface-subtle', layers: ['var(--ds-color-surface-subtle)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'panel-hover', layers: ['var(--ds-material-panel-background-hover)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'panel-selected', layers: ['var(--ds-material-panel-background-selected)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
  { id: 'panel-disabled', layers: ['var(--ds-material-panel-background-disabled)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'] },
];

/**
 * The census wells: every source site where the chain is painted as a GROUND
 * and an ink is declared on it, plus the mixed/gradient grounds that carry a
 * chain term. `bg` is the source declaration verbatim; gradients are reduced
 * to their darkest stop (worst case for a dark ink).
 */
const WELLS: Array<{ id: string; where: string; bg: string; ink: string; under?: string[] }> = [
  { id: 'guided-draft-form/draft-status', where: 'skin/guided-draft-form:104', bg: 'var(--ds-color-bg-tertiary)', ink: 'var(--ds-color-text-muted)' },
  { id: 'collection-header/meta-item', where: 'skin/collection-header:215', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'collection-header/meta-strip', where: 'skin/collection-header:575', bg: 'color-mix(in srgb, var(--ds-surface-panel) 68%, transparent)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'command-center/quick-action-icon', where: 'skin/command-center:57', bg: 'var(--ds-color-bg-tertiary, var(--ds-color-bg-secondary))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'gallery-view/image-placeholder', where: 'skin/gallery-view:84', bg: 'var(--ds-color-bg-tertiary)', ink: 'var(--ds-color-text-disabled)' },
  { id: 'record-workbench/tab-badge', where: 'skin/record-workbench:140', bg: 'var(--ds-color-bg-tertiary)', ink: 'var(--ds-color-text-muted)' },
  { id: 'search-command-bar/voice-badge', where: 'skin/search-command-bar:348', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'visual-excellence/kbd', where: 'skin/visual-excellence-preview:105', bg: 'var(--ds-surface-panel-bg, var(--ds-color-bg-secondary))', ink: 'var(--ds-color-text-muted)' },
  { id: 'widget-board/catalog-icon', where: 'skin/widget-board:231', bg: 'var(--ds-surface-panel-bg)', ink: 'var(--ds-color-primary)' },
  { id: 'widget-board/empty-state', where: 'skin/widget-board:1382', bg: 'var(--ds-surface-panel-bg)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'widget-board/error-state', where: 'skin/widget-board:1399', bg: 'color-mix(in srgb, var(--ds-color-error) 4%, var(--ds-surface-panel-bg))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'form/required-mark-optional', where: 'modern/skin/form:226', bg: 'var(--ds-surface-inset, var(--ds-surface-panel))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'form/tooltip-icon', where: 'modern/skin/form:249', bg: 'var(--ds-surface-inset, var(--ds-surface-panel))', ink: 'var(--ds-color-text-muted)' },
  { id: 'live-feed/badge', where: 'modern/skin/live-feed:133', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-primary)' },
  { id: 'operational-ledger/header-cell', where: 'modern/skin/operational-ledger:66', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-muted)' },
  { id: 'stats-grid/icon', where: 'modern/skin/stats-grid:220', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'stats-grid/trend-neutral', where: 'modern/skin/stats-grid:254', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'upload/file-icon', where: 'modern/skin/upload:430', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'user-profile-card/avatar-fallback', where: 'modern/skin/user-profile-card:136', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-primary)' },
  { id: 'user-profile-card/status-badge', where: 'modern/skin/user-profile-card:277', bg: 'var(--ds-surface-panel)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'data-table-mobile/pagination', where: 'skin/data-table-mobile:345', bg: 'var(--ds-surface-inset, var(--ds-surface-panel))', ink: 'var(--ds-color-text-primary)' },
  { id: 'auth-surface/panel', where: 'skin/auth-surface:107', bg: 'var(--ds-surface-panel, var(--ds-color-bg-secondary))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'chat-surface/panel', where: 'skin/chat-surface:88', bg: 'var(--ds-surface-panel, var(--ds-color-bg-secondary))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'activity-ticker/row', where: 'skin/activity-ticker:333', bg: 'var(--ds-color-bg-tertiary)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'patterns-paint/panel', where: 'patterns-paint:108', bg: 'var(--ds-surface-panel-bg)', ink: 'var(--ds-surface-panel-color)' },
  { id: 'patterns/panel-recessed', where: 'patterns-paint:312', bg: 'color-mix(in srgb, var(--ds-surface-panel-bg) 76%, var(--ds-surface-card-bg))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'patterns/rich-card-header', where: 'patterns:238', bg: 'color-mix(in srgb, var(--ds-surface-card-bg) 82%, var(--ds-surface-panel-bg))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'patterns/rich-card-section-alt', where: 'patterns:244', bg: 'color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-panel-bg))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'patterns/chart-plot', where: 'patterns:645', bg: 'color-mix(in srgb, var(--ds-surface-panel-bg) 78%, var(--ds-surface-card-bg))', ink: 'var(--ds-color-text-muted)' },
  { id: 'patterns/cell-meter-track', where: 'patterns:593', bg: 'color-mix(in srgb, var(--ds-surface-panel-bg) 78%, var(--ds-surface-card-bg))', ink: 'var(--ds-color-text-muted)' },
  { id: 'patterns/table-header-hover', where: 'patterns:393', bg: 'var(--ds-material-panel-background-hover)', ink: 'var(--ds-color-text-muted)' },
  { id: 'theme/menu-item-hover', where: 'themes/default:1807', bg: 'var(--ds-material-panel-background-hover)', ink: 'var(--ds-color-text-primary)' },
  { id: 'theme/menu-item-selected', where: 'themes/default:1820', bg: 'var(--ds-material-panel-background-selected)', ink: 'var(--ds-color-text-primary)' },
  { id: 'theme/list-item-hover', where: 'themes/default:1922', bg: 'var(--ds-material-panel-background-hover)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'theme/table-row-selected', where: 'themes/default:1646', bg: 'var(--ds-material-panel-background-selected)', ink: 'var(--ds-color-text-primary)' },
  { id: 'theme/collapse-header-hover', where: 'themes/default:1843', bg: 'var(--ds-material-panel-background-hover)', ink: 'var(--ds-color-text-primary)' },
  { id: 'theme/upload-card', where: 'themes/default:1569', bg: 'var(--ds-upload-card-bg)', ink: 'var(--ds-color-text-secondary)' },
  { id: 'theme/input-filled-hover', where: 'themes/default:1021', bg: 'var(--ds-input-filled-bg-hover)', ink: 'var(--ds-color-text-primary)' },
  { id: 'theme/input-filled-hover-placeholder', where: 'themes/default:1021', bg: 'var(--ds-input-filled-bg-hover)', ink: 'var(--ds-color-text-muted)' },
  { id: 'skeleton/base', where: 'modern/skin/skeleton:24', bg: 'var(--ds-surface-panel-bg, var(--ds-surface-panel, var(--ds-color-neutral-100)))', ink: 'var(--ds-color-text-muted)' },
  { id: 'card/flat', where: 'components/card:230', bg: 'var(--ds-surface-panel, var(--ds-card-bg))', ink: 'var(--ds-color-text-secondary)' },
  { id: 'decision-comparison/footer', where: 'skin/decision-comparison:111', bg: 'color-mix(in srgb, var(--ds-surface-panel-bg, var(--ds-color-bg-secondary)) 56%, var(--ds-surface-card-bg, var(--ds-color-bg-elevated)))', ink: 'var(--ds-color-text-secondary)' },
];

const TENANT: TenantConfig = {
  slug: 'ground-well-exit',
  name: 'Ground well exit',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Ground well exit' },
};

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <div id="page">
        <GuidedDraftFormSurface
          title="Create event"
          subtitle="Drafts save as you type"
          sections={[
            { key: 'info', title: 'Basic info', description: 'What is this event called', isComplete: true, render: () => <div>Info fields</div> },
            { key: 'schedule', title: 'Schedule', hasErrors: true, render: () => <div>Schedule fields</div> },
          ]}
          draftStatus="saved"
          lastSavedAt="12:30"
          validationIssues={[{ field: 'Name', message: 'Required', severity: 'error', sectionKey: 'schedule' }]}
          secondaryActions={[{ key: 'save-draft', label: 'Save draft', onClick: () => undefined }]}
          submitLabel="Create"
          onSubmit={() => undefined}
        />
      </div>
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude
      .pipe(new Writable({ write(chunk, _e, done) { html += chunk.toString(); done(); } }))
      .on('finish', () => res())
      .on('error', rej);
  });
  return html;
}

describe('tertiary-ground well probe', () => {
  it('reads every well, the ladder cross-product and the pinned node in six scopes', async () => {
    const markup = `<div id="host" style="inline-size:64rem">${await serverMarkup()}</div>`;
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
          ({ rootAttributes, theme, declared, chain, rungs, chainGrounds, wells, markup }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) {
              document.documentElement.setAttribute(n, v);
            }
            document.documentElement.setAttribute('data-theme', theme);
            if (theme === 'dark') document.documentElement.classList.add('dark');
            document.body.innerHTML = markup;

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
            const apca = (txt: any, bgc: any) => {
              const Y = (c: any) => 0.2126729 * (c[0] / 255) ** 2.4 + 0.7151522 * (c[1] / 255) ** 2.4 + 0.0721750 * (c[2] / 255) ** 2.4;
              const clamp = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
              const Ytxt = clamp(Y(txt)); const Ybg = clamp(Y(bgc));
              if (Math.abs(Ybg - Ytxt) < 0.0005) return 0;
              let o: number;
              if (Ybg > Ytxt) o = (Ybg ** 0.56 - Ytxt ** 0.57) * 1.14;
              else o = (Ybg ** 0.65 - Ytxt ** 0.62) * 1.14;
              if (Math.abs(o) < 0.1) o = 0; else if (o > 0) o -= 0.027; else o += 0.027;
              return Math.round(o * 100 * 10) / 10;
            };
            const hex = (c: any) => c ? `#${[c[0], c[1], c[2]].map((x: number) => Math.round(x).toString(16).padStart(2, '0')).join('')}${c[3] < 0.999 ? `@${c[3].toFixed(2)}` : ''}` : 'null';

            /** A background value -> the worst-case (darkest) opaque ground it paints. */
            const groundOf = (expr: string, parents: string[]): any => {
              let candidates: string[];
              if (/gradient\(/.test(expr)) {
                const inner = expr.slice(expr.indexOf('(') + 1, expr.lastIndexOf(')'));
                candidates = inner.split(/,(?![^(]*\))/).map((s) => s.trim())
                  .filter((s) => /var\(|color-mix\(|#|rgb|hsl/.test(s))
                  .map((s) => s.replace(/\s+[\d.]+%?\s*$/, '').replace(/\s+0\s+1px$/, ''));
              } else {
                candidates = [expr];
              }
              let worst: any = null;
              for (const cand of candidates) {
                const c = resolveColor(cand);
                if (!c) continue;
                let acc = c;
                for (const p of parents) {
                  if (acc[3] >= 0.999) break;
                  const pc = resolveColor(p);
                  if (pc) acc = over(acc, pc);
                }
                if (acc[3] < 0.999) acc = over(acc, [255, 255, 255, 1]);
                if (!worst || lum(acc) < lum(worst)) worst = acc;
              }
              return worst;
            };

            const chainHex: Record<string, string> = {};
            for (const c of chain as string[]) chainHex[c] = hex(resolveColor(`var(${c})`));

            const rungHex: Record<string, string> = {};
            const rungColor: Record<string, any> = {};
            for (const r of rungs as string[]) { const c = resolveColor(`var(${r})`); rungColor[r] = c; rungHex[r] = hex(c); }

            const groundColor: Record<string, any> = {};
            const groundHex: Record<string, string> = {};
            for (const g of chainGrounds as any[]) {
              let acc: any = [0, 0, 0, 0];
              for (const layer of g.layers) { const c = resolveColor(layer); if (!c) continue; acc = over(acc, c); if (acc[3] >= 0.999) break; }
              if (acc[3] < 0.999) acc = over(acc, [255, 255, 255, 1]);
              groundColor[g.id] = acc; groundHex[g.id] = hex(acc);
            }
            const cross: Record<string, any> = {};
            for (const r of rungs as string[]) for (const g of chainGrounds as any[]) {
              const ink = rungColor[r], bg = groundColor[g.id];
              if (!ink || !bg) continue;
              cross[`${r.replace('--ds-color-', '')}@${g.id}`] = { ink: rungHex[r], ground: groundHex[g.id], ratio: ratio(ink, bg), lc: apca(ink, bg), pass: ratio(ink, bg) >= 4.5 };
            }

            const PARENTS = ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'];
            const wellRows: Record<string, any> = {};
            for (const w of wells as any[]) {
              const bg = groundOf(w.bg, w.under ?? PARENTS);
              const ink = resolveColor(w.ink);
              if (!bg || !ink) { wellRows[w.id] = { where: w.where, unresolved: true }; continue; }
              const inkOver = ink[3] < 0.999 ? over(ink, bg) : ink;
              wellRows[w.id] = { where: w.where, ground: hex(bg), ink: hex(inkOver), ratio: ratio(inkOver, bg), lc: apca(inkOver, bg), pass: ratio(inkOver, bg) >= 4.5 };
            }

            // Every declared ink channel LIGHTER than the tertiary ground: the
            // only set a lighter ground could hurt.
            const groundLum = lum(groundColor['bg-tertiary']);
            const lighterInks: Record<string, string> = {};
            for (const name of declared as string[]) {
              if (!/(^|-)(color|foreground|ink|fill|text)(-|$)/.test(name)) continue;
              if (/-(bg|background|border|shadow|ring|track|rail|gradient|scrim|overlay)(-|$)/.test(name)) continue;
              const c = resolveColor(`var(${name})`);
              if (!c || c[3] < 0.999) continue;
              if (lum(c) > groundLum) lighterInks[name] = hex(c);
            }

            // The pinned node, by identity, from real server markup.
            const label = document.querySelector("#host span[data-part='draft-status-label']") as HTMLElement | null;
            let pinned: any = { found: false };
            if (label) {
              const inkC = parse(getComputedStyle(label).color);
              let acc: any = [0, 0, 0, 0];
              let node: HTMLElement | null = label;
              const stack: string[] = [];
              while (node && acc[3] < 0.999) {
                const bgc = parse(getComputedStyle(node).backgroundColor);
                if (bgc && bgc[3] > 0) { acc = over(acc, bgc); stack.push(`${node.getAttribute('data-part') ?? node.tagName.toLowerCase()}=${hex(bgc)}`); }
                node = node.parentElement;
              }
              if (acc[3] < 0.999) acc = over(acc, [255, 255, 255, 1]);
              pinned = { found: true, ink: hex(inkC), ground: hex(acc), stack, ratio: ratio(inkC, acc), lc: apca(inkC, acc), pass: ratio(inkC, acc) >= 4.5 };
            }

            return { chain: chainHex, rungs: rungHex, grounds: groundHex, cross, wells: wellRows, lighterInks, pinned };
          },
          { rootAttributes: arm.rootAttributes, theme: scope.theme, declared, chain: CHAIN, rungs: RUNGS, chainGrounds: CHAIN_GROUNDS, wells: WELLS, markup },
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
    mkdirSync(resolve(OUT, '..'), { recursive: true });
    writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
    expect(Object.keys(out)).toHaveLength(6);
  }, 900_000);
});
