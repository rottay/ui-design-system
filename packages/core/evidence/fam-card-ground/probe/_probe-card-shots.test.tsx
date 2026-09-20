/** TEMPORARY writer probe — card ground captures. */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import ModernCard from '@/components/primitives/display/card/engines/modern';
import ModernBreadcrumb from '@/components/primitives/navigation/breadcrumb/engines/modern';
import ModernMenu from '@/components/primitives/navigation/menu/engines/modern';
import ModernPagination from '@/components/primitives/navigation/pagination/engines/modern';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const CORE_ROOT = resolve(__dirname, '../../..');
const OUT = resolve(CORE_ROOT, 'evidence/fam-card-ground/captures');
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
    <div style={{ display: 'grid', gap: '20px', inlineSize: '34rem' }}>
      <ModernCard title="Default card">Body copy sitting on the card ground.</ModernCard>
      <ModernCard variant="bordered" title="Bordered card">Body copy sitting on the card ground.</ModernCard>
      <ModernCard variant="elevated" title="Elevated card">Body copy sitting on the card ground.</ModernCard>
      <ModernBreadcrumb items={[{ title: 'Root', href: '#' }, { title: 'Team', href: '#' }, { title: 'Current page' }]} />
      <ModernMenu items={[{ key: 'profile', label: 'Profile' }, { key: 'billing', label: 'Billing' }]} mode="vertical" selectedKeys={['profile']} />
      <ModernPagination current={3} total={120} pageSize={10} showSizeChanger showQuickJumper />
    </div>
  </EngineProvider>,
);
const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 24px; display:inline-block;';
const SCOPES: ReadonlyArray<{ v: any; t: 'light' | 'dark' }> = [
  { v: 'rottay', t: 'dark' }, { v: 'evnto', t: 'dark' }, { v: 'bithire', t: 'light' },
  { v: 'bithire', t: 'dark' }, { v: 'rottay', t: 'light' }, { v: 'evnto', t: 'light' },
];

describe('tmp card shots', () => {
  it('captures before/after/control per scope', async () => {
    for (const d of ['before', 'after', 'control']) mkdirSync(resolve(OUT, d), { recursive: true });
    const browser = await chromium().launch();
    const base = resolvedBaseCss();
    if (!base.includes(AFTER)) throw new Error('capture: after-declaration not found');
    try {
      const ctx = await browser.newContext({ deviceScaleFactor: 2 } as any);
      for (const { v, t } of SCOPES) {
        const arm = await mountArm(v, {});
        for (const leg of ['before', 'after', 'control'] as const) {
          const page: any = await ctx.newPage();
          await page.setContent('<!doctype html><html lang="en"><head></head><body style="margin:0"></body></html>');
          await page.addStyleTag({ content: leg === 'before' ? base.replace(AFTER, BEFORE) : base });
          await page.addStyleTag({ content: arm.css });
          await page.evaluate(({ markup, rootAttributes, surface }: any) => {
            for (const [n, val] of Object.entries(rootAttributes)) document.documentElement.setAttribute(n, val as string);
            const main = document.createElement('main');
            main.setAttribute('style', surface); main.innerHTML = markup; document.body.append(main);
          }, { markup, rootAttributes: { ...arm.rootAttributes, 'data-theme': t }, surface: SURFACE });
          const el = await page.$('main');
          writeFileSync(resolve(OUT, `${leg}/${v}-${t}.png`), await el.screenshot());
          await page.close();
        }
      }
    } finally { await browser.close(); }
    console.log('SHOTS_DONE');
  }, 600_000);
});
