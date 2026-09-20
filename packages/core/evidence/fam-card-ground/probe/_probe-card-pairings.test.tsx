/** TEMPORARY writer probe — every card-ground pairing, axe, before vs after. */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import ModernCard from '@/components/primitives/display/card/engines/modern';
import ModernBreadcrumb from '@/components/primitives/navigation/breadcrumb/engines/modern';
import ModernMenu from '@/components/primitives/navigation/menu/engines/modern';
import ModernPagination from '@/components/primitives/navigation/pagination/engines/modern';
import ModernSegmented from '@/components/primitives/navigation/segmented/engines/modern';
import ModernStepper from '@/components/primitives/navigation/stepper/engines/modern';
import ModernCollapse from '@/components/primitives/layout/collapse/engines/modern';
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
function beforeCss(css: string): string {
  if (!css.includes(AFTER)) throw new Error('probe: after-declaration not in resolved sheet');
  return css.replace(AFTER, BEFORE);
}

const gallery = renderToStaticMarkup(
  <EngineProvider defaultEngine="modern">
    <div>
      <ModernCard title="Default card">Body copy on the card ground.</ModernCard>
      <ModernCard variant="bordered" title="Bordered card">Body copy on the card ground.</ModernCard>
      <ModernCard variant="elevated" title="Elevated card">Body copy on the card ground.</ModernCard>
      <ModernCard variant="flat" title="Flat card">Body copy on the card ground.</ModernCard>
      <ModernBreadcrumb items={[{ title: 'Root', href: '#' }, { title: 'Team', href: '#' }, { title: 'Current page' }]} />
      <ModernMenu
        items={[
          { key: 'profile', label: 'Profile' },
          { key: 'billing', label: 'Billing' },
          { key: 'settings', label: 'Settings', children: [{ key: 'nested', label: 'Nested item' }] },
        ]}
        mode="vertical"
        selectedKeys={['profile']}
        openKeys={['settings']}
      />
      <ModernPagination current={3} total={120} pageSize={10} showTotal showSizeChanger showQuickJumper />
      <ModernSegmented ariaLabel="Period" options={[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }]} defaultValue="week" />
      <ModernStepper items={[{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]} current={1} />
      <ModernCollapse items={[{ key: 'a', label: 'Panel A', children: 'Panel body copy.' }]} defaultActiveKey={['a']} />
    </div>
  </EngineProvider>,
);

const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;';
const SCOPES: ReadonlyArray<{ v: any; t: 'light' | 'dark' }> = [
  { v: 'rottay', t: 'dark' }, { v: 'evnto', t: 'dark' }, { v: 'bithire', t: 'dark' },
  { v: 'rottay', t: 'light' }, { v: 'bithire', t: 'light' }, { v: 'evnto', t: 'light' },
];

describe('tmp card pairings', () => {
  it('axe over every card-reading family, both legs', async () => {
    const axeSource = readFileSync(createRequire(resolve(CORE_ROOT, 'package.json')).resolve('axe-core'), 'utf8');
    const browser = await chromium().launch();
    const out: Record<string, unknown> = {};
    const base = resolvedBaseCss();
    try {
      const ctx = await browser.newContext();
      for (const { v, t } of SCOPES) {
        const arm = await mountArm(v, {});
        for (const leg of ['before', 'after'] as const) {
          const page = await ctx.newPage();
          await page.setContent('<!doctype html><html lang="en"><head><title>p</title></head><body></body></html>');
          await page.addStyleTag({ content: leg === 'before' ? beforeCss(base) : base });
          await page.addStyleTag({ content: arm.css });
          await page.addScriptTag({ content: axeSource });
          out[`${v} ${t} ${leg}`] = await page.evaluate(
            async ({ markup, rootAttributes, surface }: any) => {
              for (const [n, val] of Object.entries(rootAttributes)) document.documentElement.setAttribute(n, val as string);
              const main = document.createElement('main');
              main.setAttribute('style', surface); main.innerHTML = markup; document.body.append(main);
              const runner = (window as any).axe;
              const res = await runner.run(main);
              return res.violations
                .filter((x: any) => x.impact === 'serious' || x.impact === 'critical')
                .map((x: any) => ({
                  id: x.id,
                  nodes: x.nodes.map((n: any) => {
                    const data = [...(n.any ?? []), ...(n.all ?? []), ...(n.none ?? [])].map((c: any) => c.data)
                      .find((d: any) => d?.fgColor !== undefined || d?.bgColor !== undefined);
                    return { t: (n.target ?? []).join(' '), fg: data?.fgColor, bg: data?.bgColor, r: data?.contrastRatio };
                  }),
                }));
            },
            { markup: gallery, rootAttributes: { ...arm.rootAttributes, 'data-theme': t }, surface: SURFACE },
          );
          await page.close();
        }
      }
    } finally { await browser.close(); }
    console.log('PAIR_START'); console.log(JSON.stringify(out)); console.log('PAIR_END');
  }, 600_000);
});
