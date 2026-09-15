/**
 * The sidebar surface in a real browser: every decision its paint consumes
 * moves the surface's computed style with a negative control; the panel sits
 * on the reading side in both directions; the stacked posture is a column;
 * and no gated vertical mode carries a serious axe finding. The markup is
 * the anatomy the TSX stamps, which `SidebarSurface.anatomy.test.tsx` and
 * `SidebarSurface.adapt.test.tsx` prove against the real render.
 */
import { describe, expect, it } from 'vitest';

import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

function surface(posture: 'desktop' | 'phone' = 'desktop', options: { stacked?: boolean; collapsed?: boolean } = {}): string {
  const stacked = options.stacked ?? posture === 'phone';
  return `<div class="ds-structure ds-sidebar-surface" data-part="root" data-collapsed="${options.collapsed ? 'true' : 'false'}" data-stacked="${stacked ? 'true' : 'false'}" data-aside="false" data-bordered="true" data-posture="${posture}">
  <div class="ds-sidebar-surface-panel" data-part="root"><div data-part="panel-body"><nav data-part="navigation" aria-label="Sections"><a href="#overview">Overview</a></nav></div></div>
  <div data-part="main"><h2>Workspace</h2><p>Body</p></div>
</div>`;
}

const markup = `<div id="wide" style="inline-size: 60rem">${surface()}</div><div id="stack" style="inline-size: 20rem">${surface('phone')}</div>`;

const ROOT = "#wide [data-part='root'].ds-sidebar-surface";
const MAIN = "#wide [data-part='main']";

describeCausality({
  family: 'sidebar-surface',
  markup,
  targets: [
    { id: 'gap', selector: ROOT, property: 'column-gap' },
    { id: 'divider', selector: MAIN, property: 'border-left-width' },
    { id: 'duration', selector: ROOT, property: 'transition-duration' },
    { id: 'panelGap', selector: "#wide [data-part='panel-body']", property: 'row-gap' },
  ],
  decisions: {
    'density.mode': { value: 'compact', moves: ['gap'], holds: 'divider', in: VERTICALS },
    'spacing.rhythm': { value: 'airy', moves: ['gap'], holds: 'divider', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['divider'], holds: 'panelGap', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'divider', in: ['evnto'] },
  },
});

describe('sidebar surface direction, posture and accessibility', () => {
  it('seats the panel on the reading side and stacks the phone posture into a column', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr" style="inline-size: 60rem">${surface()}</div><div id="rtl" style="inline-size: 60rem">${surface()}</div><div id="stack" style="inline-size: 20rem">${surface('phone')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrPanel', selector: '#ltr .ds-sidebar-surface-panel', property: '@rect.left' },
        { id: 'ltrMain', selector: "#ltr [data-part='main']", property: '@rect.left' },
        { id: 'rtlPanel', selector: '#rtl .ds-sidebar-surface-panel', property: '@rect.right', dir: 'rtl' },
        { id: 'rtlMain', selector: "#rtl [data-part='main']", property: '@rect.right', dir: 'rtl' },
        { id: 'wideDisplay', selector: "#ltr [data-part='root'].ds-sidebar-surface", property: 'display' },
        { id: 'stackDisplay', selector: "#stack [data-part='root'].ds-sidebar-surface", property: 'flex-direction' },
        { id: 'stackDivider', selector: "#stack [data-part='main']", property: 'border-left-width' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrPanel)).toBeLessThan(Number(r.ltrMain));
    expect(Number(r.rtlPanel)).toBeGreaterThan(Number(r.rtlMain));
    expect(r.wideDisplay).toBe('grid');
    expect(r.stackDisplay).toBe('column');
    expect(r.stackDivider).toBe('0px');
  }, 60_000);

  it('narrows the track when collapsed', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="open" style="inline-size: 60rem">${surface()}</div><div id="closed" style="inline-size: 60rem">${surface('desktop', { collapsed: true })}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'open', selector: '#open .ds-sidebar-surface-panel', property: '@rect.right' },
        { id: 'closed', selector: '#closed .ds-sidebar-surface-panel', property: '@rect.right' },
      ],
    });
    const r = result.base!;
    expect(Number(r.closed)).toBeLessThan(Number(r.open));
  }, 60_000);

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
