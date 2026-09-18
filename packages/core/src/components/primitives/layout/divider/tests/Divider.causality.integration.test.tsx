/**
 * The divider family in a real browser: the inset rungs answer the tenant
 * rhythm and density, the overline label answers the typographic role scale and
 * weights, the hairline answers the palette through its authorable channel, the
 * transition answers the motion dial, the vertical rule mirrors under RTL, and
 * no gated vertical mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernDivider from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type DividerProps = React.ComponentProps<typeof ModernDivider>;

function divider(props: DividerProps = {}, dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '32rem' }}>
      <ModernDivider {...props} />
    </div>,
  );
}

const markup = [
  `<div id="plain">${divider()}</div>`,
  `<div id="label">${divider({ children: 'Section' })}</div>`,
  `<div id="plainLabel">${divider({ children: 'Quiet', plain: true })}</div>`,
  `<div id="start">${divider({ children: 'Start', textPosition: 'start' })}</div>`,
  `<div id="end">${divider({ children: 'End', textPosition: 'end' })}</div>`,
  `<div id="tight">${divider({ spacing: 'xs' })}</div>`,
  `<div id="loose">${divider({ spacing: 'xl' })}</div>`,
  `<div id="none">${divider({ spacing: 'none' })}</div>`,
  `<div id="vertical">${divider({ orientation: 'vertical' })}</div>`,
  `<div id="thick">${divider({ thickness: 'thick' })}</div>`,
].join('');

const PLAIN = "#plain [data-part='root']";
/** bithire already settles the label role at `strong`, so the arm moves nothing there. */
const WEIGHT_VERTICALS = ['rottay', 'evnto'] as const;
const LABEL = "#label [data-part='text']";

/**
 * MEASURED GAP, registered rather than forced.
 *
 * No `palette.*` decision reaches this family in any first-party vertical, and
 * the reason is NOT that the verticals author over it: measured on the compiled
 * arm, none of the three emits `--ds-divider-color` or `--ds-divider-text-color`
 * at all. Both literals are the DS SHEET's own mode-less `:root` defaults
 * (#e5e5e5 and #737373), so the reach is the foundation's to give, not a
 * vertical's to give back. `typography.role-weights` reaches the overline only
 * where the vertical has not already settled the label role at `strong` --
 * bithire has.
 *
 * CLEAN, and it must stay clean: five rows dropped by identity, each measured
 * absent, and a relapse reddens this pin.
 *  - `rottay dark` and `bithire dark`, the three overline rows each -- the ink
 *    was that mode-less `#737373`, which measured 3.95:1 on rottay's dark ground
 *    and 4.18:1 on bithire's while reading 4.74:1 on white: one declaration
 *    cannot answer for both canvases. `--ds-divider-label-ink` is now derived
 *    against the ground the block compiles for, and the sheet's dark scope
 *    answers for a theme that states no ground of its own.
 *  - `bithire dark`'s `Quiet` row -- a `plain` label inherits the ground ink,
 *    and the mode-canvas repair (4f7d46751) re-grounded that scope upstream.
 *    Measured absent at HEAD before this cut.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describeCausality({
  family: 'divider',
  markup,
  targets: [
    { id: 'inset', selector: PLAIN, property: 'margin-top' },
    { id: 'gap', selector: "#label [data-part='root']", property: 'column-gap' },
    { id: 'labelSize', selector: LABEL, property: 'font-size' },
    { id: 'labelWeight', selector: LABEL, property: 'font-weight' },
    { id: 'rule', selector: PLAIN, property: 'border-top-color' },
    { id: 'duration', selector: PLAIN, property: 'transition-duration' },
  ],
  decisions: {
    'spacing.rhythm': { value: 'airy', moves: ['inset', 'gap'], holds: 'labelSize', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['inset'], holds: 'labelSize', in: VERTICALS },
    // The inset is NOT a control for a typography arm: the spacing ramp is in
    // `rem` and the root rem already carries the type scale once.
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'rule', in: VERTICALS },
    'typography.role-weights': { value: 'strong', moves: ['labelWeight'], holds: 'rule', in: WEIGHT_VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'inset', in: VERTICALS },
  },
});

describe('divider geometry, label placement and accessibility', () => {
  it('orders the inset ladder and zeroes it at the `none` rung', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'none', selector: "#none [data-part='root']", property: 'margin-top' },
        { id: 'tight', selector: "#tight [data-part='root']", property: 'margin-top' },
        { id: 'default', selector: PLAIN, property: 'margin-top' },
        { id: 'loose', selector: "#loose [data-part='root']", property: 'margin-top' },
        { id: 'verticalBlock', selector: "#vertical [data-part='root']", property: 'margin-top' },
        { id: 'verticalInline', selector: "#vertical [data-part='root']", property: 'margin-left' },
      ],
    });
    const r = result.base!;
    expect(r.none).toBe('0px');
    expect(Number.parseFloat(r.tight!)).toBeLessThan(Number.parseFloat(r.default!));
    expect(Number.parseFloat(r.default!)).toBeLessThan(Number.parseFloat(r.loose!));
    // A vertical rule insets on the inline axis, never the block axis.
    expect(r.verticalBlock).toBe('0px');
    expect(Number.parseFloat(r.verticalInline!)).toBeGreaterThan(0);
  }, 60_000);

  it('gives the named side a short segment and the other side the rest', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'startBefore', selector: "#start [data-part='line-before']", property: '@rect.width' },
        { id: 'startAfter', selector: "#start [data-part='line-after']", property: '@rect.width' },
        { id: 'endBefore', selector: "#end [data-part='line-before']", property: '@rect.width' },
        { id: 'endAfter', selector: "#end [data-part='line-after']", property: '@rect.width' },
        { id: 'centerBefore', selector: "#label [data-part='line-before']", property: '@rect.width' },
        { id: 'centerAfter', selector: "#label [data-part='line-after']", property: '@rect.width' },
      ],
    });
    const r = result.base!;
    expect(Number(r.startBefore)).toBeLessThan(Number(r.startAfter));
    expect(Number(r.endAfter)).toBeLessThan(Number(r.endBefore));
    expect(Number(r.centerBefore)).toBe(Number(r.centerAfter));
  }, 60_000);

  it('mirrors the vertical rule and the named segment under RTL', async () => {
    const mirrored = `<div id="rtlVertical">${divider({ orientation: 'vertical' }, 'rtl')}</div>`
      + `<div id="rtlStart">${divider({ children: 'Start', textPosition: 'start' }, 'rtl')}</div>`;
    const result = await measureArms({
      vertical: 'bithire',
      markup: mirrored,
      arms: { base: {} },
      targets: [
        { id: 'leftWidth', selector: "#rtlVertical [data-part='root']", property: 'border-left-width', dir: 'rtl' },
        { id: 'rightWidth', selector: "#rtlVertical [data-part='root']", property: 'border-right-width', dir: 'rtl' },
        { id: 'before', selector: "#rtlStart [data-part='line-before']", property: '@rect.width', dir: 'rtl' },
        { id: 'after', selector: "#rtlStart [data-part='line-after']", property: '@rect.width', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    // `border-inline-start` lands on the RIGHT edge under RTL.
    expect(r.leftWidth).toBe('0px');
    expect(r.rightWidth).not.toBe('0px');
    expect(Number(r.before)).toBeLessThan(Number(r.after));
  }, 60_000);

  it('drops the overline treatment for a plain label', async () => {
    const result = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'overlineCase', selector: LABEL, property: 'text-transform' },
        { id: 'plainCase', selector: "#plainLabel [data-part='text']", property: 'text-transform' },
        { id: 'overlineTrack', selector: LABEL, property: 'letter-spacing' },
        { id: 'plainTrack', selector: "#plainLabel [data-part='text']", property: 'letter-spacing' },
        { id: 'thickRule', selector: "#thick [data-part='root']", property: 'border-top-width' },
        { id: 'thinRule', selector: PLAIN, property: 'border-top-width' },
      ],
    });
    const r = result.base!;
    expect(r.overlineCase).toBe('uppercase');
    expect(r.plainCase).toBe('none');
    expect(r.overlineTrack).not.toBe(r.plainTrack);
    expect(Number.parseFloat(r.thickRule!)).toBeGreaterThan(Number.parseFloat(r.thinRule!));
  }, 60_000);

  it('carries no serious axe finding beyond the pinned ink debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
