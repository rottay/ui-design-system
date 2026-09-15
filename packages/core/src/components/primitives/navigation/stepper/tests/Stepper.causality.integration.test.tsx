/**
 * The stepper family in a real browser: every decision its paint consumes
 * moves a step's computed style with a negative control; the track reads
 * from the inline start in both directions; the kernel's state attributes
 * paint the same hover and focus the platform pseudo-classes do; and no
 * gated vertical mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernStepper from '../engines/modern';
import { StepperStep } from '../compound';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const ITEMS = [
  { title: 'Account', description: 'Create it' },
  { title: 'Profile', subTitle: 'Optional' },
  { title: 'Billing', status: 'error' as const },
  { title: 'Done', disabled: true },
];

function track(dir: 'ltr' | 'rtl' = 'ltr', extra: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '40rem' }}>
      <ModernStepper items={ITEMS} current={1} clickable onChange={() => undefined} {...extra} />
    </div>,
  );
}

function compound(): string {
  return renderToStaticMarkup(
    <div style={{ inlineSize: '20rem' }}>
      <StepperStep title="Standalone" stepNumber={1} onClick={() => undefined} />
    </div>,
  );
}

const markup = `<div id="track">${track()}</div><div id="dots">${track('ltr', { progressDot: (dot: React.ReactNode) => dot })}</div><div id="compound">${compound()}</div>`;

const CLICKABLE = "#track [data-part='item'][data-clickable='true']";
const TRIGGER = `${CLICKABLE} > [data-part='trigger']`;
const LABEL = `${CLICKABLE} [data-part='label']`;
const ERROR_LABEL = "#track [data-part='item'][data-status='error'] [data-part='label']";
const STEP = "#compound [data-part='item']";

describeCausality({
  family: 'stepper',
  markup,
  targets: [
    { id: 'hoverInk', selector: LABEL, property: 'color', attributes: { 'data-state': 'hovered' }, attributesOn: TRIGGER },
    { id: 'errorInk', selector: ERROR_LABEL, property: 'color' },
    { id: 'focusRing', selector: TRIGGER, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'labelSize', selector: LABEL, property: 'font-size' },
    { id: 'triggerRadius', selector: TRIGGER, property: 'border-top-left-radius' },
    { id: 'dotSlotHeight', selector: "#dots [data-part='dot-slot']", property: 'height' },
    { id: 'iconHoverShadow', selector: `${STEP} [data-part='icon']`, property: 'box-shadow', attributes: { 'data-state': 'hovered' }, attributesOn: STEP },
    { id: 'duration', selector: LABEL, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['hoverInk'], holds: 'triggerRadius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B23A48' }, moves: ['errorInk'], holds: 'triggerRadius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'triggerRadius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'triggerRadius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['triggerRadius'], holds: 'labelSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['dotSlotHeight'], holds: 'triggerRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['iconHoverShadow'], holds: 'triggerRadius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'triggerRadius', in: ['evnto'] },
  },
});

describe('stepper direction, state governance and accessibility', () => {
  it('starts the track on the reading side in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${track()}</div><div id="rtl">${track('rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrFirst', selector: "#ltr [data-part='item']", property: '@rect.left' },
        { id: 'ltrLast', selector: "#ltr [data-part='item']:last-child", property: '@rect.left' },
        { id: 'rtlFirst', selector: "#rtl [data-part='item']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlLast', selector: "#rtl [data-part='item']:last-child", property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrFirst)).toBeLessThan(Number(r.ltrLast));
    expect(Number(r.rtlFirst)).toBeGreaterThan(Number(r.rtlLast));
  }, 60_000);

  it('paints the kernel hover and focus states the same as the platform pseudo-classes would', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restInk', selector: LABEL, property: 'color' },
        { id: 'hoverInk', selector: LABEL, property: 'color', attributes: { 'data-state': 'hovered' }, attributesOn: TRIGGER },
        { id: 'restRing', selector: TRIGGER, property: 'box-shadow' },
        { id: 'focusRing', selector: TRIGGER, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'compoundRestShadow', selector: `${STEP} [data-part='icon']`, property: 'box-shadow' },
        { id: 'compoundHoverShadow', selector: `${STEP} [data-part='icon']`, property: 'box-shadow', attributes: { 'data-state': 'hovered' }, attributesOn: STEP },
        { id: 'disabledCursor', selector: "#track [data-part='item'][data-disabled='true'] [data-part='content']", property: 'cursor' },
      ],
    });
    const r = result.base!;
    expect(r.hoverInk).not.toBe(r.restInk);
    expect(r.focusRing).not.toBe(r.restRing);
    expect(r.compoundHoverShadow).not.toBe(r.compoundRestShadow);
    expect(r.disabledCursor).not.toBe('pointer');
  }, 60_000);

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
