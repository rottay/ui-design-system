/**
 * The pagination family in a real browser: every decision its paint consumes
 * moves a control's computed style with a negative control; the joined row
 * keeps its seam and outer corners under RTL; the kernel's state attributes
 * paint the same hover and focus the platform pseudo-classes do; and no gated
 * vertical mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernPagination from '../engines/modern';
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

function toolbar(dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '40rem' }}>
      <ModernPagination current={3} total={120} pageSize={10} showTotal showSizeChanger showQuickJumper />
    </div>,
  );
}

const markup = `<div id="bar">${toolbar()}</div>`;

/** rottay pins the pagination inks through its vertical chrome, so the seed and focus decisions legitimately cannot move them there. */
const SEED_VERTICALS = ['bithire', 'evnto'] as const;

const CURRENT = "#bar [data-part='pagination-page-button'][data-current='true']";
const PAGE = "#bar [data-part='pagination-page-button'][data-current='false']";
const PREVIOUS = "#bar [data-part='pagination-nav-button'][data-direction='prev']";

describeCausality({
  family: 'pagination',
  markup,
  targets: [
    { id: 'currentInk', selector: CURRENT, property: 'background-color' },
    { id: 'focusRing', selector: PAGE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'pageSize', selector: PAGE, property: 'font-size' },
    { id: 'edgeRadius', selector: PREVIOUS, property: 'border-top-left-radius' },
    { id: 'pageHeight', selector: PAGE, property: 'height' },
    { id: 'pageEdge', selector: PAGE, property: 'border-top-width' },
    { id: 'duration', selector: PAGE, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['currentInk'], holds: 'edgeRadius', in: SEED_VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'edgeRadius', in: SEED_VERTICALS },
    'typography.scale': { value: 1.08, moves: ['pageSize'], holds: 'edgeRadius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['edgeRadius'], holds: 'pageSize', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['pageHeight'], holds: 'edgeRadius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['pageEdge'], holds: 'edgeRadius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'edgeRadius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): the DER-06
 * compile corrected this family's chrome ink to the dark ramp, which exposed a
 * pre-existing mode-blind GROUND underneath it in
 * `presentation/components/card` (the card base stated `--ds-card-bg:
 * var(--ds-color-white)` in the `rottay-components` layer; repaired in
 * 51fd557fc). Measured against a
 * pristine HEAD archive, every scope below audited CLEAN there, so each entry
 * is lot-caused and none is a pre-existing finding. The gap is pinned by axe
 * rule id AND the identity of every failing node: another rule, one more node,
 * a repaired node or a same-count swap reddens the scope, and a scope absent
 * from this map must still audit clean (EVI-02, 2026-09-15).
 *
 * `bithire dark` had 1 row and it DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the page-item chrome is read against the ground it was designed for.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 *
 * `rottay dark` DRAINED, and its cause was the Card component base rather than
 * this family: `presentation/components/card/index.css` stated `--ds-card-bg:
 * var(--ds-color-white)` mode-lessly in the `rottay-components` layer, which
 * outranks the theme's own `--ds-card-bg: var(--ds-color-bg-elevated)` by layer
 * ORDER, so every ground derived from the card role resolved white under the
 * dark mode's near-white ink. That base now states the mode-aware role and the
 * ground resolves `#182235`. Dropped by identity, not waived: with no entry the
 * scope must measure clean, and a relapse reddens here.
 */
const CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {
  'bithire light': {
    'color-contrast': [
      'div[data-part="pagination-range"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'div[data-part="pagination-range"]',
    ],
  },
};

describe('pagination direction, state governance and accessibility', () => {
  it('keeps the previous control on the inline start and the seam between controls in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${toolbar()}</div><div id="rtl">${toolbar('rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrPrev', selector: "#ltr [data-part='pagination-nav-button'][data-direction='prev']", property: '@rect.left' },
        { id: 'ltrNext', selector: "#ltr [data-part='pagination-nav-button'][data-direction='next']", property: '@rect.left' },
        { id: 'ltrPrevRadius', selector: "#ltr [data-part='pagination-nav-button'][data-direction='prev']", property: 'border-top-left-radius' },
        { id: 'ltrPrevSeam', selector: "#ltr [data-part='pagination-nav-button'][data-direction='prev']", property: 'border-right-width' },
        { id: 'rtlPrev', selector: "#rtl [data-part='pagination-nav-button'][data-direction='prev']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlNext', selector: "#rtl [data-part='pagination-nav-button'][data-direction='next']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlPrevRadius', selector: "#rtl [data-part='pagination-nav-button'][data-direction='prev']", property: 'border-top-right-radius', dir: 'rtl' },
        { id: 'rtlPrevSeam', selector: "#rtl [data-part='pagination-nav-button'][data-direction='prev']", property: 'border-left-width', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrPrev)).toBeLessThan(Number(r.ltrNext));
    expect(Number(r.rtlPrev)).toBeGreaterThan(Number(r.rtlNext));
    expect(r.ltrPrevRadius).not.toBe('0px');
    expect(r.rtlPrevRadius).not.toBe('0px');
    expect(r.ltrPrevSeam).toBe('0px');
    expect(r.rtlPrevSeam).toBe('0px');
  }, 60_000);

  it('paints the kernel hover and focus states the same as the platform pseudo-classes would', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restBg', selector: PAGE, property: 'background-color' },
        { id: 'hoverBg', selector: PAGE, property: 'background-color', attributes: { 'data-state': 'hovered' } },
        { id: 'restRing', selector: PAGE, property: 'box-shadow' },
        { id: 'focusRing', selector: PAGE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'disabledCursor', selector: PAGE, property: 'cursor', attributes: { 'data-state': 'disabled' } },
        { id: 'selectFocus', selector: "#bar [data-part='pagination-size-select']", property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'selectRest', selector: "#bar [data-part='pagination-size-select']", property: 'box-shadow' },
      ],
    });
    const r = result.base!;
    expect(r.hoverBg).not.toBe(r.restBg);
    expect(r.focusRing).not.toBe(r.restRing);
    expect(r.disabledCursor).toBe('not-allowed');
    expect(r.selectFocus).not.toBe(r.selectRest);
  }, 60_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast gap', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
