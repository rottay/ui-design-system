/**
 * The form-field family in a real browser: every decision its paint consumes moves
 * the label and messages with a negative control, and direction and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernFormField from '../engines/modern';
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
    <div id="rest"><ModernFormField label="Email" name="email" required help="We never share it"><input aria-label="Email" /></ModernFormField></div>
    <div id="error"><ModernFormField label="Phone" name="phone" error="Enter a phone number"><input aria-label="Phone" /></ModernFormField></div>
  </div>,
);

describeCausality({
  family: 'form-field',
  markup,
  targets: [
    { id: 'labelSize', selector: "#rest [data-part='label']", property: 'font-size' },
    { id: 'labelInk', selector: "#rest [data-part='label']", property: 'color' },
    { id: 'requiredInk', selector: "#rest [data-part='required-mark']", property: 'color' },
    { id: 'errorInk', selector: "#error [data-part='error-message']", property: 'color' },
    { id: 'rhythm', selector: "#rest [data-part='layout']", property: 'row-gap' },
    { id: 'labelWeight', selector: "#rest [data-part='label']", property: 'font-weight' },
  ],
  decisions: {
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'labelWeight', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['requiredInk', 'errorInk'], holds: 'labelSize', in: ['evnto'] },
    'palette.neutral-temperature': { value: 'warm', moves: ['labelInk'], holds: 'labelSize', in: ['evnto'] },
    'spacing.rhythm': { value: 'airy', moves: ['rhythm'], holds: 'labelSize', in: VERTICALS },
  },
});

describe('form-field geometry, direction and accessibility in a real browser', () => {
  it('places a horizontal label at the inline start in both directions and stacks it when narrow', async () => {
    const wide = renderToStaticMarkup(
      <div style={{ inlineSize: '720px' }}>
        <ModernFormField label="Email" name="email" layout="horizontal"><input aria-label="Email" /></ModernFormField>
      </div>,
    );
    const narrow = renderToStaticMarkup(
      <div style={{ inlineSize: '320px' }}>
        <ModernFormField label="Email" name="email" layout="horizontal"><input aria-label="Email" /></ModernFormField>
      </div>,
    );
    const measure = (html: string) => measureArms({
      vertical: 'bithire',
      markup: html,
      arms: { base: {} },
      targets: [
        { id: 'ltrLabel', selector: "[data-part='label-wrap']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrBody', selector: "[data-part='body']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlLabel', selector: "[data-part='label-wrap']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlBody', selector: "[data-part='body']", property: '@rect.left', dir: 'rtl' },
        { id: 'labelTop', selector: "[data-part='label-wrap']", property: '@rect.top' },
        { id: 'bodyTop', selector: "[data-part='body']", property: '@rect.top' },
      ],
    });
    const w = (await measure(wide)).base!;
    expect(Number(w.ltrLabel)).toBeLessThan(Number(w.ltrBody));
    expect(Number(w.rtlLabel)).toBeGreaterThan(Number(w.rtlBody));
    const n = (await measure(narrow)).base!;
    expect(Number(n.bodyTop)).toBeGreaterThan(Number(n.labelTop));
  }, 90_000);

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernFormField label="Email" name="email" help="Help"><input aria-label="Email" /></ModernFormField>
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="label-wrap"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        <ModernFormField label="Email" name="a" required help="Help copy"><input aria-label="Email" /></ModernFormField>
        <ModernFormField label="Phone" name="b" error="Enter a phone number"><input aria-label="Phone" /></ModernFormField>
        <ModernFormField label="City" name="c" layout="horizontal" reserveMessageSpace={2}><input aria-label="City" /></ModernFormField>
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
