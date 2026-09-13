/**
 * The toggle family (and Switch, its deprecated name) in a real browser: every
 * decision it consumes moves its paint with a negative control, and its travel,
 * direction, floors and accessibility hold in each first-party vertical.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernToggle from '../engines/modern';
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
    <ModernToggle label="Alerts" description="Sent by email" defaultChecked />
    <ModernToggle label="Digest" />
    <ModernToggle label="Terms" error errorMessage="Accept to continue" />
  </div>,
);

const ON = "[data-checked='true'][data-error='false']";
const OFF = "[data-checked='false'][data-error='false']";
const ERROR = "[data-error='true']";

describeCausality({
  family: 'toggle',
  markup,
  targets: [
    { id: 'fill', selector: `${ON} [data-part='track']`, property: 'background-color' },
    { id: 'errorFill', selector: `${ERROR} [data-part='track']`, property: 'background-color' },
    { id: 'hoverFill', selector: `${ON} [data-part='track']`, property: 'background-color', attributes: { 'data-state': 'hovered' }, attributesOn: ON },
    { id: 'press', selector: `${OFF} [data-part='thumb']`, property: 'transform', attributes: { 'data-state': 'pressed' }, attributesOn: OFF },
    { id: 'ring', selector: `${OFF} [data-part='track']`, property: 'outline-width', attributes: { 'data-state': 'focus-visible' }, attributesOn: OFF },
    { id: 'width', selector: `${ON} [data-part='track']`, property: 'inline-size' },
    { id: 'height', selector: `${ON} [data-part='track']`, property: 'block-size' },
    { id: 'labelSize', selector: `${ON} [data-part='label']`, property: 'font-size' },
    { id: 'thumbDepth', selector: `${ON} [data-part='thumb']`, property: 'box-shadow' },
    { id: 'duration', selector: `${ON} [data-part='thumb']`, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['fill'], holds: 'width', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorFill'], holds: 'fill', in: VERTICALS },
    'states.emphasis': { value: 'strong', moves: ['hoverFill', 'press'], holds: 'fill', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['ring'], holds: 'fill', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['width'], holds: 'fill', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'fill', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'fill', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['thumbDepth'], holds: 'fill', in: ['bithire', 'evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'fill', in: VERTICALS },
  },
});

describe('toggle travel, direction, floors and accessibility in a real browser', () => {
  it('travels the thumb toward the inline end in both directions', async () => {
    const pair = renderToStaticMarkup(
      <div>
        <ModernToggle aria-label="Off" />
        <ModernToggle aria-label="On" defaultChecked />
      </div>,
    );
    const thumb = (checked: boolean) => `[data-checked='${checked}'] [data-part='thumb']`;
    const result = await measureArms({
      vertical: 'bithire',
      markup: pair,
      arms: { base: {} },
      targets: [
        { id: 'ltrOff', selector: thumb(false), property: '@rect.left', dir: 'ltr' },
        { id: 'ltrOn', selector: thumb(true), property: '@rect.left', dir: 'ltr' },
        { id: 'rtlOff', selector: thumb(false), property: '@rect.left', dir: 'rtl' },
        { id: 'rtlOn', selector: thumb(true), property: '@rect.left', dir: 'rtl' },
        { id: 'ltrOffTrack', selector: "[data-checked='false'] [data-part='track']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrOnTrack', selector: "[data-checked='true'] [data-part='track']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlOffTrack', selector: "[data-checked='false'] [data-part='track']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlOnTrack', selector: "[data-checked='true'] [data-part='track']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    const offset = (thumbKey: string, trackKey: string) => Number(r[thumbKey]) - Number(r[trackKey]);
    expect(offset('ltrOn', 'ltrOnTrack')).toBeGreaterThan(offset('ltrOff', 'ltrOffTrack'));
    expect(offset('rtlOn', 'rtlOnTrack')).toBeLessThan(offset('rtlOff', 'rtlOffTrack'));
  }, 60_000);

  it('holds the touch floor on both axes for a standalone switch and drops motion under reduced motion', async () => {
    const standalone = renderToStaticMarkup(<ModernToggle aria-label="Sync" size="xs" />);
    const touch = await measureArms({
      vertical: 'bithire', markup: standalone, arms: { base: {} }, environment: { touch: true },
      targets: [
        { id: 'height', selector: "[data-part='root']", property: '@rect.height' },
        { id: 'width', selector: "[data-part='root']", property: '@rect.width' },
      ],
    });
    expect(Number(touch.base!.height)).toBeGreaterThanOrEqual(44);
    expect(Number(touch.base!.width)).toBeGreaterThanOrEqual(44);
    const reduced = await measureArms({
      vertical: 'bithire', markup: standalone, arms: { base: {} }, environment: { reducedMotion: 'reduce' },
      targets: [{ id: 'duration', selector: "[data-part='thumb']", property: 'transition-duration' }],
    });
    expect(Math.max(...reduced.base!.duration!.split(',').map((part) => Number.parseFloat(part)))).toBeLessThanOrEqual(0.00001);
  }, 60_000);

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernToggle label="Alerts" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="track"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = markup + renderToStaticMarkup(
      <div>
        {(['primary', 'secondary', 'success', 'warning', 'error', 'default'] as const).map((color) => (
          <ModernToggle key={color} label={`Colour ${color}`} color={color} defaultChecked />
        ))}
        <ModernToggle label="Busy" loading />
        <ModernToggle label="Off" disabled />
        <ModernToggle aria-label="With state" checkedLabel="On" uncheckedLabel="Off" helperText="Change later" />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 120_000);
});
