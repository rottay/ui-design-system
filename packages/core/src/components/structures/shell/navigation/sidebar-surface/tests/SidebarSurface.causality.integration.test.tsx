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
  axeDebt,
  type AxeDebt,
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
    'density.mode': { value: 'spacious', moves: ['gap'], holds: 'divider', in: VERTICALS },
    'spacing.rhythm': { value: 'airy', moves: ['gap'], holds: 'divider', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['divider'], holds: 'panelGap', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'divider', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the chrome
 * pair this family paints on loses its authored half under neutral+preset, so
 * ink and ground come from opposite ends of the ramp. Measured against a
 * pristine HEAD archive, every scope below audited CLEAN there, so each entry
 * is lot-caused and none is a pre-existing finding. The gap is pinned by axe
 * rule id AND the identity of every failing node: another rule, one more node,
 * a repaired node or a same-count swap reddens the scope, and a scope absent
 * from this map must still audit clean (EVI-02, 2026-09-15).
 *
 * `bithire dark` had 6 rows and they DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the menu ink is read against the ground it was designed for.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {};

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

  it('audits clean in every gated vertical mode, apart from the pinned contrast gap', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
