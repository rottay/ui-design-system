/**
 * The checkbox family in a real browser: every decision it consumes moves its
 * paint with a negative control, and its geometry, direction and accessibility
 * hold in each first-party vertical.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernCheckbox from '../engines/modern';
import { CheckboxGroup } from '../compound/group';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const markup = renderToStaticMarkup(
  <div>
    <ModernCheckbox label="Accept terms" description="Required to continue" defaultChecked />
    <ModernCheckbox label="Subscribe" />
    <ModernCheckbox label="Consent" error />
  </div>,
);

const CHECKED = "[data-checked='true']";
const PLAIN = "[data-checked='false'][data-error='false']";
const ERROR = "[data-error='true']";

describeCausality({
  family: 'checkbox',
  markup,
  targets: [
    { id: 'fill', selector: `${CHECKED} [data-part='box']`, property: 'background-color' },
    { id: 'errorFrame', selector: `${ERROR} [data-part='box']`, property: 'border-top-color' },
    { id: 'radius', selector: `${CHECKED} [data-part='box']`, property: 'border-top-left-radius' },
    { id: 'edge', selector: `${PLAIN} [data-part='box']`, property: 'border-top-width' },
    { id: 'size', selector: `${CHECKED} [data-part='box']`, property: 'inline-size' },
    { id: 'labelSize', selector: `${CHECKED} [data-part='label']`, property: 'font-size' },
    { id: 'press', selector: `${PLAIN} [data-part='box']`, property: 'transform', attributes: { 'data-state': 'pressed' }, attributesOn: PLAIN },
    { id: 'ring', selector: `${PLAIN} [data-part='box']`, property: 'outline-width', attributes: { 'data-state': 'focus-visible' }, attributesOn: PLAIN },
    { id: 'duration', selector: `${CHECKED} [data-part='box']`, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['fill'], holds: 'size', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorFrame'], holds: 'fill', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fill', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'fill', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['size'], holds: 'fill', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'fill', in: VERTICALS },
    'states.emphasis': { value: 'strong', moves: ['press'], holds: 'fill', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['ring'], holds: 'fill', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'fill', in: VERTICALS },
  },
});

describe('checkbox geometry, direction and accessibility in a real browser', () => {
  it('holds the 44px touch floor under a coarse pointer, standalone included', async () => {
    const touch = renderToStaticMarkup(
      <div>
        <ModernCheckbox label="Labelled" />
        <ModernCheckbox aria-label="Standalone" />
      </div>,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: touch,
      arms: { base: {} },
      environment: { touch: true },
      targets: [
        { id: 'labelled', selector: "[data-standalone='false']", property: '@rect.height' },
        { id: 'standaloneHeight', selector: "[data-standalone='true']", property: '@rect.height' },
        { id: 'standaloneWidth', selector: "[data-standalone='true']", property: '@rect.width' },
      ],
    });
    for (const value of Object.values(result.base!)) expect(Number(value)).toBeGreaterThanOrEqual(44);
  }, 60_000);

  it('never wraps a label per character in a narrow flex row, and mirrors in RTL', async () => {
    const narrow = renderToStaticMarkup(
      <div style={{ display: 'flex', inlineSize: '120px' }}>
        <ModernCheckbox label="Notifications everywhere" />
      </div>,
    );
    const result = await measureArms({
      vertical: 'bithire',
      markup: narrow,
      arms: { base: {} },
      targets: [
        { id: 'labelWidth', selector: "[data-part='label']", property: '@rect.width' },
        { id: 'ltrBox', selector: "[data-part='box']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlBox', selector: "[data-part='box']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlLabel', selector: "[data-part='label']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.labelWidth)).toBeGreaterThan(40);
    expect(Number(r.ltrBox)).toBeLessThan(Number(r.ltrLabel));
    expect(Number(r.rtlBox)).toBeGreaterThan(Number(r.rtlLabel));
  }, 60_000);

  it('builds its loading state from its own anatomy', async () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernCheckbox label="Accept terms" description="Required to continue" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="box"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <CheckboxGroup engine="modern" options={[{ label: 'One', value: 1 }, { label: 'Two', value: 2, disabled: true }]} defaultValue={[1]} />,
    ) + markup;
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 120_000);
});
