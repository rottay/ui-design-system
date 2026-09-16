/**
 * The container family in a real browser: the page inset moves with the two
 * decisions that govern room, the canvas finish moves with the layout chrome a
 * tenant authors, the measure rungs ARE the breakpoint ladder, and no gated
 * vertical mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernContainer from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type ContainerProps = React.ComponentProps<typeof ModernContainer>;

function container(props: Omit<ContainerProps, 'children'> = {}, dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '60rem' }}>
      <ModernContainer {...props}>
        <p>Framed content</p>
      </ModernContainer>
    </div>,
  );
}

const markup = [
  `<div id="default">${container()}</div>`,
  `<div id="sm">${container({ maxWidth: 'sm' })}</div>`,
  `<div id="md">${container({ maxWidth: 'md' })}</div>`,
  `<div id="xl">${container({ maxWidth: 'xl' })}</div>`,
  `<div id="xxl">${container({ maxWidth: '2xl' })}</div>`,
  `<div id="tight">${container({ padding: 'sm' })}</div>`,
  `<div id="fluid">${container({ fluid: true })}</div>`,
  `<div id="custom">${container({ maxWidth: 420, padding: 7 })}</div>`,
].join('');

const ROOT = "#default [data-part='root']";

/**
 * NOT this family's debt, pinned here because this is where it is measured: in
 * bithire's dark mode the harness ground `--ds-color-bg-primary` stays #FFFFFF
 * while `--ds-color-text-primary` follows the mode, so ANY text in that scope
 * fails the contrast floor -- a bare `<p>` with no container fails identically
 * (measured control, 2026-09-15). The container paints `transparent`, so it
 * contributes no ground of its own. Pinned by node identity, so a repair of the
 * mode ground and a swap both go red.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '.ds-container[data-max-width="lg"][data-padding="md"] > p',
      'div[data-max-width="2xl"] > p',
      'div[data-max-width="custom"] > p',
      'div[data-max-width="fluid"] > p',
      'div[data-max-width="md"] > p',
      'div[data-max-width="sm"] > p',
      'div[data-max-width="xl"] > p',
      'div[data-padding="sm"] > p',
    ],
  },
};

describeCausality({
  family: 'container',
  markup,
  targets: [
    { id: 'inset', selector: ROOT, property: 'padding-top' },
    { id: 'measure', selector: ROOT, property: 'max-inline-size' },
    { id: 'duration', selector: ROOT, property: 'transition-duration' },
  ],
  decisions: {
    'spacing.rhythm': { value: 'airy', moves: ['inset'], holds: 'measure', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['inset'], holds: 'measure', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'measure', in: VERTICALS },
  },
});

describe('container measure ladder, fluid cap and accessibility', () => {
  it('resolves every measure rung to the breakpoint step it frames', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'sm', selector: "#sm [data-part='root']", property: 'max-inline-size' },
        { id: 'smStep', selector: "#sm [data-part='root']", property: '--ds-breakpoint-sm' },
        { id: 'md', selector: "#md [data-part='root']", property: 'max-inline-size' },
        { id: 'mdStep', selector: "#md [data-part='root']", property: '--ds-breakpoint-md' },
        { id: 'lg', selector: ROOT, property: 'max-inline-size' },
        { id: 'lgStep', selector: ROOT, property: '--ds-breakpoint-lg' },
        { id: 'xl', selector: "#xl [data-part='root']", property: 'max-inline-size' },
        { id: 'xlStep', selector: "#xl [data-part='root']", property: '--ds-breakpoint-xl' },
        { id: 'xxl', selector: "#xxl [data-part='root']", property: 'max-inline-size' },
        { id: 'xxlStep', selector: "#xxl [data-part='root']", property: '--ds-breakpoint-2xl' },
      ],
    });
    const r = result.base!;
    for (const step of ['sm', 'md', 'lg', 'xl', 'xxl'] as const) {
      expect(r[step], step).toBe(r[`${step}Step`]!.trim());
    }
  }, 60_000);

  it('lifts the cap when fluid and honours an arbitrary measure and inset', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'fluid', selector: "#fluid [data-part='root']", property: 'max-inline-size' },
        { id: 'capped', selector: ROOT, property: 'max-inline-size' },
        { id: 'customMeasure', selector: "#custom [data-part='root']", property: 'max-inline-size' },
        { id: 'customInset', selector: "#custom [data-part='root']", property: 'padding-top' },
        { id: 'tightInset', selector: "#tight [data-part='root']", property: 'padding-top' },
        { id: 'defaultInset', selector: ROOT, property: 'padding-top' },
      ],
    });
    const r = result.base!;
    expect(r.fluid).toBe('none');
    expect(r.capped).not.toBe('none');
    expect(r.customMeasure).toBe('420px');
    expect(r.customInset).toBe('7px');
    expect(Number.parseFloat(r.tightInset!)).toBeLessThan(Number.parseFloat(r.defaultInset!));
  }, 60_000);

  it('centers on the reading side in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${container({ maxWidth: 'sm' })}</div><div id="rtl">${container({ maxWidth: 'sm' }, 'rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrStart', selector: "#ltr [data-part='root']", property: 'margin-left' },
        { id: 'ltrEnd', selector: "#ltr [data-part='root']", property: 'margin-right' },
        { id: 'rtlStart', selector: "#rtl [data-part='root']", property: 'margin-right', dir: 'rtl' },
        { id: 'rtlEnd', selector: "#rtl [data-part='root']", property: 'margin-left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(r.ltrStart).toBe(r.ltrEnd);
    expect(r.rtlStart).toBe(r.rtlEnd);
  }, 60_000);

  it('carries no serious axe finding beyond the pinned ground debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
