/**
 * The card family in a real browser: every decision its paint consumes moves
 * a destination's computed style with a negative control; a start cover sits
 * on the reading side under RTL; the kernel's state attributes paint hover,
 * press, focus and disabled; a toned card's title wears the palette's deep
 * step; and no gated vertical mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernCard from '../engines/modern';
import { CardFooter, CardHeader } from '../compound';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type CardProps = React.ComponentProps<typeof ModernCard>;

function card(props: Omit<CardProps, 'children'>, children: React.ReactNode = 'Body copy', dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '36rem' }}>
      <ModernCard {...props}>{children}</ModernCard>
    </div>,
  );
}

const compound = (
  <>
    <CardHeader eyebrow="Eyebrow" icon={<span>i</span>} title="Compound head" subtitle="Subtitle" extra={<span>x</span>} />
    <CardFooter actions={[<button key="b" type="button">Confirm</button>]} />
  </>
);

const markup = [
  `<div id="plain">${card({ title: 'Plain', description: 'Description', variant: 'elevated' })}</div>`,
  `<div id="tone">${card({ title: 'Toned', description: 'Description', colorVariant: 'primary', variant: 'elevated' })}</div>`,
  `<div id="error">${card({ title: 'Error', description: 'Description', colorVariant: 'error' })}</div>`,
  `<div id="success">${card({ title: 'Success', description: 'Description', colorVariant: 'success' })}</div>`,
  `<div id="action">${card({ title: 'Action', variant: 'outlined', onClick: () => undefined })}</div>`,
  `<div id="small">${card({ title: 'Small', size: 'sm' })}</div>`,
  `<div id="underline" data-anatomy-card="underline">${card({ title: 'Underline' })}</div>`,
  `<div id="compound">${card({ variant: 'outlined' }, compound)}</div>`,
  `<div id="disabled">${card({ title: 'Disabled', disabled: true, onClick: () => undefined })}</div>`,
].join('');

/** rottay authors its palette per mode, so the seed decision legitimately cannot move the tone frame there. */
const SEED_VERTICALS = ['bithire', 'evnto'] as const;
/** bithire pins the card radius through its vertical chrome, so the shape decision legitimately cannot move it there. */
const RADIUS_VERTICALS = ['rottay', 'evnto'] as const;

const PLAIN = "#plain [data-part='root']";
const ACTION = "#action [data-part='root']";

describeCausality({
  family: 'card',
  markup,
  targets: [
    { id: 'toneBorder', selector: "#tone [data-part='root']", property: 'border-top-color' },
    { id: 'focusRing', selector: ACTION, property: 'outline-offset', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'titleSize', selector: "#small [data-part='title']", property: 'font-size' },
    { id: 'radius', selector: PLAIN, property: 'border-top-left-radius' },
    { id: 'bodyPad', selector: "#plain [data-part='body']", property: 'padding-top' },
    { id: 'extraHeight', selector: "#compound .ds-card-header > [data-part='extra']", property: 'min-height' },
    { id: 'underlineEdge', selector: "#underline [data-part='root']", property: 'border-bottom-width' },
    { id: 'iconShadow', selector: "#compound [data-part='icon']", property: 'box-shadow' },
    { id: 'duration', selector: "#compound [data-part='icon']", property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['toneBorder'], holds: 'radius', in: SEED_VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: RADIUS_VERTICALS },
    'spacing.rhythm': { value: 'airy', moves: ['bodyPad'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['extraHeight'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['underlineEdge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['iconShadow'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: VERTICALS },
  },
});

function hexToRgb(value: string): string {
  const hex = value.trim().replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const n = Number.parseInt(full, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

describe('card direction, state governance, toned inks and accessibility', () => {
  it('lays a start cover on the reading side in both directions', async () => {
    const cover = (dir: 'ltr' | 'rtl') => card({ cover: '/cover.png', coverPosition: 'start', title: 'Cover' }, 'Body copy', dir);
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${cover('ltr')}</div><div id="rtl">${cover('rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrCover', selector: "#ltr [data-part='cover']", property: '@rect.left' },
        { id: 'ltrBody', selector: "#ltr [data-part='body']", property: '@rect.left' },
        { id: 'rtlCover', selector: "#rtl [data-part='cover']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlBody', selector: "#rtl [data-part='body']", property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrCover)).toBeLessThan(Number(r.ltrBody));
    expect(Number(r.rtlCover)).toBeGreaterThan(Number(r.rtlBody));
  }, 60_000);

  it('paints the kernel hover, press, focus and disabled states', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restEdge', selector: ACTION, property: 'border-top-color' },
        { id: 'hoverEdge', selector: ACTION, property: 'border-top-color', attributes: { 'data-state': 'hovered' } },
        { id: 'restRing', selector: ACTION, property: 'outline-style' },
        { id: 'focusRing', selector: ACTION, property: 'outline-style', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'pressedTransform', selector: ACTION, property: 'transform', attributes: { 'data-state': 'pressed' } },
        { id: 'disabledCursor', selector: "#disabled [data-part='root']", property: 'cursor' },
        { id: 'disabledEvents', selector: "#disabled [data-part='root']", property: 'pointer-events' },
      ],
    });
    const r = result.base!;
    expect(r.hoverEdge).not.toBe(r.restEdge);
    expect(r.restRing).toBe('none');
    expect(r.focusRing).not.toBe('none');
    expect(r.pressedTransform).not.toBe('none');
    expect(r.disabledCursor).toBe('not-allowed');
    expect(r.disabledEvents).toBe('none');
  }, 60_000);

  it('paints a toned title with the deep palette step of its tone', async () => {
    for (const vertical of VERTICALS) {
      const result = await measureArms({
        vertical,
        markup,
        arms: { base: {} },
        targets: [
          { id: 'plainTitle', selector: "#plain [data-part='title']", property: 'color' },
          { id: 'errorTitle', selector: "#error [data-part='title']", property: 'color' },
          { id: 'successTitle', selector: "#success [data-part='title']", property: 'color' },
          { id: 'error900', selector: "#error [data-part='root']", property: '--ds-color-error-900' },
          { id: 'success900', selector: "#success [data-part='root']", property: '--ds-color-success-900' },
        ],
      });
      const r = result.base!;
      expect(r.errorTitle, vertical).not.toBe(r.plainTitle);
      expect(r.successTitle, vertical).not.toBe(r.plainTitle);
      expect(r.errorTitle, vertical).toBe(hexToRgb(r.error900));
      expect(r.successTitle, vertical).toBe(hexToRgb(r.success900));
    }
  }, 120_000);

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
