/**
 * SCRATCH probe (WO contrast arm 3b, --ds-color-error mode regrade).
 *
 * Two readings, both through the productive door
 * (`documentThemeIntent -> compileThemeIntent -> emitThemeCss`) into real
 * Chromium, six vertical x mode scopes:
 *
 *  1. CHANNEL CENSUS - every `--ds-*` name declared anywhere in the resolved
 *     source sheet, computed at `:root`. The blast radius, exactly.
 *  2. PAIRING TABLE - ink/ground pairs named by channel, resolved and rated
 *     through a 1x1 canvas (color-mix serializes as `color(srgb ...)`, so a
 *     regex reports near-black for near-white).
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

/**
 * Ink/ground pairs, by consumer class. `ground` may be a list: the layers are
 * composited front-to-back, the last being the opaque page canvas.
 */
const PAIRS: Array<{
  id: string;
  cls: 'ink' | 'fill' | 'border';
  ink: string;
  ground: string[];
  floor: number;
  note: string;
}> = [
  // --- --ds-color-error used as INK -------------------------------------
  { id: 'error-ink/on-canvas', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['var(--ds-color-bg-primary)'], floor: 4.5, note: 'the 126 bare `color: var(--ds-color-error)` sites, on the page canvas' },
  { id: 'error-ink/on-card', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'same ink inside a card' },
  { id: 'error-ink/on-error-bg', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['var(--ds-color-error-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'error text on the error wash (alert bodies)' },
  { id: 'error-ink/on-alpha-10', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['var(--ds-color-alpha-error-10)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'error text on the 10% alpha wash' },
  { id: 'error-ink/on-own-7pct-wash', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['color-mix(in srgb, var(--ds-color-error) 7%, transparent)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: "file-manager's ghost rest wash, before the family half" },

  // --- --ds-color-error used as FILL ------------------------------------
  { id: 'error-fill/white-ink', cls: 'fill', ink: 'var(--ds-color-white)', ground: ['var(--ds-color-error)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'white label on an error fill (upload close, floatbutton badge)' },
  { id: 'error-fill/on-tone-ink', cls: 'fill', ink: 'var(--ds-color-on-error)', ground: ['var(--ds-color-error)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'the governed on-tone ink on an error fill' },
  { id: 'error-fill/vs-canvas', cls: 'border', ink: 'var(--ds-color-error)', ground: ['var(--ds-color-bg-primary)'], floor: 3, note: 'an error fill as a non-text object on the canvas (radio dot, badge)' },
  { id: 'radio-error-ring/vs-input-bg', cls: 'border', ink: 'var(--ds-radio-error-border, var(--ds-color-error))', ground: ['var(--ds-color-bg-input)', 'var(--ds-color-bg-primary)'], floor: 3, note: 'the radio error ring against the control ground' },
  { id: 'tooltip-error/ink-on-fill', cls: 'fill', ink: 'var(--ds-tooltip-error-color)', ground: ['var(--ds-tooltip-error-bg)'], floor: 4.5, note: 'tooltip error ink on its fill (both literals today)' },

  // --- the Button error channels ----------------------------------------
  { id: 'btn-solid/rest', cls: 'fill', ink: 'var(--ds-button-error-color)', ground: ['var(--ds-button-error-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'solid danger button label at rest' },
  { id: 'btn-solid/hover', cls: 'fill', ink: 'var(--ds-button-error-color-hover)', ground: ['var(--ds-button-error-bg-hover)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'solid danger button label on hover' },
  { id: 'btn-solid/active', cls: 'fill', ink: 'var(--ds-button-error-color-active)', ground: ['var(--ds-button-error-bg-active)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'solid danger button label pressed' },
  { id: 'btn-solid/border-vs-canvas', cls: 'border', ink: 'var(--ds-button-error-border)', ground: ['var(--ds-color-bg-primary)'], floor: 3, note: 'the solid danger rim against the canvas' },
  { id: 'btn-quiet/rest-on-card', cls: 'ink', ink: 'var(--ds-button-error-border)', ground: ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'quiet-danger ink at rest on a card (no wash)' },
  { id: 'btn-quiet/rest-on-fm-wash', cls: 'ink', ink: 'var(--ds-button-error-border)', ground: ['color-mix(in srgb, var(--ds-button-error-border) 7%, transparent)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: "file-manager's 7% ghost rest wash AFTER the family half - the arm-3a row" },
  { id: 'btn-quiet/hover', cls: 'ink', ink: 'var(--ds-button-error-border-hover)', ground: ['color-mix(in srgb, var(--ds-button-error-bg) 8%, transparent)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'quiet-danger ink on the 8% hover wash' },
  { id: 'btn-quiet/pressed', cls: 'ink', ink: 'var(--ds-button-error-border-active)', ground: ['color-mix(in srgb, var(--ds-button-error-bg) 14%, transparent)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'quiet-danger ink on the 14% pressed wash' },
  { id: 'btn-outline/border-vs-card', cls: 'border', ink: 'var(--ds-button-error-border)', ground: ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 3, note: 'the outline danger rim on a card' },

  // --- alert / notifier / alert-dialog ----------------------------------
  { id: 'statistic-negative/on-card', cls: 'ink', ink: 'var(--ds-statistic-negative-color, var(--ds-color-error))', ground: ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'a negative statistic on a card' },
  { id: 'menu-danger/on-menu-bg', cls: 'ink', ink: 'var(--ds-menu-item-danger-color)', ground: ['var(--ds-menu-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'a destructive menu item' },
  { id: 'form-error/on-input-bg', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['var(--ds-color-bg-primary)'], floor: 4.5, note: 'a form field error message under its control' },
// --- direct RAMP-STEP consumers, the class the dark inversion moves ----
  { id: 'activity-icon-box/ink-on-100', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['var(--ds-color-error-100)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'activity-{compact,timeline,ticker,cards} error icon box: role ink on the 100 step' },
  { id: 'avatar-error/700-on-100', cls: 'ink', ink: 'var(--ds-color-error-700)', ground: ['var(--ds-color-error-100)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'avatar error: the 700 ink on the 100 ground' },
  { id: 'badge-soft/700-on-100', cls: 'ink', ink: 'var(--ds-color-error-700)', ground: ['var(--ds-color-error-100)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'badge soft danger: the 700 ink on the 100 ground' },
  { id: 'tag-subtle/500-on-100', cls: 'ink', ink: 'var(--ds-color-error-500)', ground: ['var(--ds-color-error-100)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'tag subtle danger: the 500 ink on the 100 ground' },
  { id: 'cockpit-header/700-on-100', cls: 'ink', ink: 'var(--ds-color-error-700)', ground: ['var(--ds-color-error-100)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'cockpit/workbench header danger chip: 700 on 100, 200 rim' },
  { id: 'detail-panel/600-on-50', cls: 'ink', ink: 'var(--ds-color-error-600)', ground: ['var(--ds-color-error-50)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'detail-panel danger band: the 600 ink on the 50 ground' },
  { id: 'card-error/200-rim-on-50', cls: 'border', ink: 'var(--ds-color-error-200)', ground: ['var(--ds-color-error-50)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 3, note: 'the error card rim against its own wash' },
  { id: 'card-error/50-vs-card', cls: 'border', ink: 'var(--ds-color-error-50)', ground: ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 1, note: 'the error card wash against the card it sits on (reported, no floor)' },
  { id: 'modal-icon/role-on-100', cls: 'border', ink: 'var(--ds-color-error)', ground: ['var(--ds-modal-error-icon-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 3, note: "the modal's error glyph on its icon well" },
  { id: 'input-error/500-rim-vs-input', cls: 'border', ink: 'var(--ds-input-error-border-color)', ground: ['var(--ds-color-bg-input)', 'var(--ds-color-bg-primary)'], floor: 3, note: 'the invalid input rim at rest (the 500 pivot)' },
  { id: 'input-error/600-rim-focus', cls: 'border', ink: 'var(--ds-input-error-border-color-focus)', ground: ['var(--ds-color-bg-input)', 'var(--ds-color-bg-primary)'], floor: 3, note: 'the invalid input rim on focus (the 600 step)' },
  { id: 'toast-error/700-on-card', cls: 'ink', ink: 'var(--ds-toast-error-color, var(--ds-color-error-700))', ground: ['var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'the rustic/contract toast danger ink on a card' },
  { id: 'alert-danger/ink-on-well', cls: 'ink', ink: 'var(--ds-color-error-ink)', ground: ['color-mix(in srgb, var(--ds-color-error) 11%, var(--ds-color-bg-elevated))', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'the alert danger body on the alert error well (the skin formula)' },
  { id: 'error-state/role-on-6pct', cls: 'ink', ink: 'var(--ds-color-error)', ground: ['color-mix(in srgb, var(--ds-color-error) 6%, var(--ds-color-bg-elevated))', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'the otp/error-state 6% wash under the role ink' },
  { id: 'btn-default-danger/rest', cls: 'ink', ink: 'var(--ds-button-error-border)', ground: ['var(--ds-button-default-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: "quiet-danger ink on the default/outline variant's OWN ground" },
  { id: 'btn-default-danger/hover', cls: 'ink', ink: 'var(--ds-button-error-border-hover)', ground: ['color-mix(in srgb, var(--ds-button-error-bg) 8%, transparent)', 'var(--ds-button-default-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'the same on the 8% hover wash' },
  { id: 'btn-default/neutral-label', cls: 'ink', ink: 'var(--ds-button-default-color)', ground: ['var(--ds-button-default-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: "CONTROL: the default variant's own neutral label on the same ground" },
  { id: 'btn-ghost-danger/rest', cls: 'ink', ink: 'var(--ds-button-error-border)', ground: ['var(--ds-button-ghost-bg)', 'var(--ds-card-bg)', 'var(--ds-color-bg-primary)'], floor: 4.5, note: 'quiet-danger ink on the ghost variant (transparent, so the card)' },
];

describe('error regrade probe', () => {
  it('reads every channel and every pairing in six scopes', async () => {
    const browser = await chromium().launch();
    const out: Record<string, unknown> = {};
    try {
      const ctx = await browser.newContext();
      const base = resolvedBaseCss();
      // Every --ds-* name the source sheet declares, so the census is the
      // sheet's own vocabulary rather than a hand-kept list.
      const declared = [...new Set((base.match(/--ds-[a-z0-9-]+(?=\s*:)/g) ?? []))].sort();
      for (const scope of SCOPES) {
        const page = await ctx.newPage();
        const arm = await mountArm(scope.vertical, {});
        await page.setContent('<!doctype html><html lang="en"><head><title>p</title></head><body></body></html>');
        await page.addStyleTag({ content: base });
        await page.addStyleTag({ content: arm.css });
        out[`${scope.vertical} ${scope.theme}`] = await page.evaluate(
          ({ rootAttributes, theme, declared, pairs }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) {
              document.documentElement.setAttribute(n, v);
            }
            document.documentElement.setAttribute('data-theme', theme);
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
            // Resolve a CSS value IN THE PAGE's cascade: set it on a probe
            // node and read the computed colour back.
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
            const hex = (c: any) => c ? `#${[c[0], c[1], c[2]].map((x: number) => Math.round(x).toString(16).padStart(2, '0')).join('')}${c[3] < 0.999 ? `@${c[3].toFixed(2)}` : ''}` : 'null';

            const rootCs = getComputedStyle(document.documentElement);
            const channels: Record<string, string> = {};
            for (const name of declared as string[]) {
              const raw = rootCs.getPropertyValue(name).trim();
              if (raw) channels[name] = raw;
            }
            const pairings: Record<string, unknown> = {};
            for (const pair of pairs as any[]) {
              const ink = resolveColor(pair.ink);
              let ground: [number, number, number, number] = [0, 0, 0, 0];
              for (const layer of pair.ground) {
                const c = resolveColor(layer);
                if (!c) continue;
                ground = over(ground, c);
                if (ground[3] >= 0.999) break;
              }
              if (ground[3] < 0.999) ground = over(ground, [255, 255, 255, 1]);
              pairings[pair.id] = ink
                ? { cls: pair.cls, ink: hex(ink), ground: hex(ground), ratio: ratio(ink, ground), floor: pair.floor, pass: ratio(ink, ground) >= pair.floor, note: pair.note }
                : { cls: pair.cls, error: 'unresolvable ink', note: pair.note };
            }
            return { channels, pairings };
          },
          { rootAttributes: arm.rootAttributes, theme: scope.theme, declared, pairs: PAIRS },
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
    mkdirSync(resolve(OUT, '..'), { recursive: true });
    writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
    expect(Object.keys(out)).toHaveLength(6);
  }, 300_000);
});
