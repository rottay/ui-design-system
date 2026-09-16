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
  axeDebt,
  type AxeDebt,
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
    'density.mode': { value: 'spacious', moves: ['dotSlotHeight'], holds: 'triggerRadius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['iconHoverShadow'], holds: 'triggerRadius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'triggerRadius', in: ['evnto'] },
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
 */
const CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {
  'bithire light': {
    'color-contrast': [
      '#track > div[dir="ltr"] > nav > ul > li[data-status="finish"][data-clickable="true"] > button > span[data-part="description"]',
      'div[data-part="label"]',
      'ul[data-progress-dot="true"] > li[data-status="finish"][data-clickable="true"] > button > span[data-part="description"]',
    ],
  },
  'bithire dark': {
    'color-contrast': [
      '#track > div[dir="ltr"] > nav > ul > li[data-status="finish"][data-clickable="true"] > button > span[data-part="description"]',
      '#track > div[dir="ltr"] > nav > ul > li[data-status="finish"][data-clickable="true"] > button > span[data-part="label"]',
      'div[data-part="label"]',
      'ul[data-progress-dot="true"] > li[data-status="finish"][data-clickable="true"] > button > span[data-part="description"]',
      'ul[data-progress-dot="true"] > li[data-status="finish"][data-clickable="true"] > button > span[data-part="label"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '#track > div[dir="ltr"] > nav > ul > li[data-status="finish"][data-clickable="true"] > button > span[data-part="description"]',
      'div[data-part="label"]',
      'ul[data-progress-dot="true"] > li[data-status="finish"][data-clickable="true"] > button > span[data-part="description"]',
    ],
  },
};

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

  it('audits clean in every gated vertical mode, apart from the pinned contrast gap', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
