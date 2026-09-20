/** TEMPORARY writer probe — the Card's own ink/ground pairing. */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import ModernCard from '@/components/primitives/display/card/engines/modern';
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
const AFTER = `  /* The card ground is the mode-aware elevated role, never a literal: a fixed
     white here would stand the dark mode's near-white ink on a white card. */
  --ds-card-bg: var(--ds-color-bg-elevated);`;
const BEFORE = `  --ds-card-bg: var(--ds-color-white);`;

const markup = renderToStaticMarkup(
  <EngineProvider defaultEngine="modern">
    <div>
      {(['default', 'bordered', 'elevated', 'flat'] as const).map((v) => (
        <ModernCard key={v} variant={v} title={`${v} title`} id={`card-${v}`}>
          Body copy sitting on the card ground.
        </ModernCard>
      ))}
    </div>
  </EngineProvider>,
);
const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;';
const SCOPES: ReadonlyArray<{ v: any; t: 'light' | 'dark' }> = [
  { v: 'rottay', t: 'dark' }, { v: 'evnto', t: 'dark' }, { v: 'bithire', t: 'dark' },
  { v: 'rottay', t: 'light' }, { v: 'bithire', t: 'light' }, { v: 'evnto', t: 'light' },
];

describe('tmp card ink', () => {
  it('measures the card body pairing in both legs', async () => {
    const browser = await chromium().launch();
    const out: Record<string, unknown> = {};
    const base = resolvedBaseCss();
    try {
      const ctx = await browser.newContext();
      for (const { v, t } of SCOPES) {
        const arm = await mountArm(v, {});
        for (const leg of ['before', 'after'] as const) {
          const page = await ctx.newPage();
          await page.setContent('<!doctype html><html lang="en"><head></head><body></body></html>');
          await page.addStyleTag({ content: leg === 'before' ? base.replace(AFTER, BEFORE) : base });
          await page.addStyleTag({ content: arm.css });
          out[`${v} ${t} ${leg}`] = await page.evaluate(({ markup, rootAttributes, surface }: any) => {
            for (const [n, val] of Object.entries(rootAttributes)) document.documentElement.setAttribute(n, val as string);
            const main = document.createElement('main'); main.setAttribute('style', surface);
            main.innerHTML = markup; document.body.append(main);
            const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d')!;
            const rgb = (c: string) => { cx.clearRect(0,0,1,1); cx.fillStyle='#000'; cx.fillStyle=c; cx.fillRect(0,0,1,1);
              const d = cx.getImageData(0,0,1,1).data; return [d[0]!, d[1]!, d[2]!, d[3]!/255]; };
            const lum = (p: number[]) => { const f=(x:number)=>{const s=x/255; return s<=0.03928?s/12.92:((s+0.055)/1.055)**2.4;};
              return 0.2126*f(p[0]!)+0.7152*f(p[1]!)+0.0722*f(p[2]!); };
            const ratio = (a: number[], b: number[]) => { const [l1,l2]=[lum(a),lum(b)].sort((x,y)=>y-x); return (l1!+0.05)/(l2!+0.05); };
            const hex = (p: number[]) => '#'+[0,1,2].map(i=>p[i]!.toString(16).padStart(2,'0')).join('');
            const r: Record<string, unknown> = {};
            for (const variant of ['default','bordered','elevated','flat']) {
              const card = main.querySelector(`#card-${variant}`);
              if (!card) { r[variant] = '<no match>'; continue; }
              let node: Element | null = card; let ground: number[] = [255,255,255];
              const chain: Element[] = []; while (node) { chain.push(node); node = node.parentElement; }
              for (let i = chain.length - 1; i >= 0; i -= 1) { const p = rgb(getComputedStyle(chain[i]!).backgroundColor); if (p[3]! === 1) ground = [p[0]!,p[1]!,p[2]!]; }
              // the deepest text node inside the card
              const text = card.querySelector('[data-part="body"], [data-part="content"]') ?? card;
              const ink = rgb(getComputedStyle(text).color);
              r[variant] = { cardBg: getComputedStyle(card).backgroundColor, ground: hex(ground), ink: hex(ink.slice(0,3) as number[]), ratio: Number(ratio(ink.slice(0,3) as number[], ground).toFixed(2)) };
            }
            return r;
          }, { markup, rootAttributes: { ...arm.rootAttributes, 'data-theme': t }, surface: SURFACE });
          await page.close();
        }
      }
    } finally { await browser.close(); }
    console.log('INK_START'); console.log(JSON.stringify(out)); console.log('INK_END');
  }, 600_000);
});
