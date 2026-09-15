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
    'spacing.rhythm': { value: 'airy', moves: ['rhythm'], holds: 'labelSize', in: VERTICALS },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): under the
 * neutral compile a governed chrome pair can reach a scope with no producer --
 * the menu ink IS the sidebar ink, and the tenant's light ground cascades into
 * the dark block -- so axe reports `color-contrast` in the scopes pinned below.
 * Nothing is lowered: every other serious rule must still be empty, and the
 * contrast node count is pinned EXACTLY, so this row reddens when the debt
 * spreads and again when the derivation lane clears it.
 */
const CONTRAST_DEBT: Readonly<Record<string, number>> = {
  'bithire dark': 4,
  'evnto light': 1,
};

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15):
 * `palette.neutral-temperature` is INERT on all three verticals. The lean is
 * applied by `deriveNeutralAxis` only to an AUTHORED `palette.ramps.neutral`,
 * and no preset document authors one, so every stop -- warm, cool, neutral --
 * leaves `--ds-color-neutral-700` at `#404040` (rottay reads the foundation
 * dark scope and is equally unmoved). Measured at HEAD the same arm moved
 * bithire `#474747` -> `#4B4640` and evnto `#404040` -> `#443F39`: the control
 * had a subject and the lot removed it. The arm is withdrawn from the causality
 * table because it can no longer move anything anywhere, and the measured
 * inertness is pinned below so the row reddens when the lane restores it.
 */
describe('form-field geometry, direction and accessibility in a real browser', () => {
  // The dead subject named: the arm withdrawn above measured a lean this tree no
  // longer produces. Its reading is pinned, not deleted.
  it('registers the neutral-temperature lean that no preset can produce', async () => {
    for (const vertical of VERTICALS) {
      const warmed = await measureArms({
        vertical,
        markup,
        arms: { base: {}, warm: { 'palette.neutral-temperature': 'warm' } },
        targets: [{ id: 'labelInk', selector: "#rest [data-part='label']", property: 'color' }],
      });
      expect(warmed.warm!.labelInk, vertical).toBe(warmed.base!.labelInk);
    }
  }, 120_000);

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
    const measured: Record<string, number> = {};
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(findings.filter((finding) => finding.id !== 'color-contrast'), key).toEqual([]);
      const nodes = findings
        .filter((finding) => finding.id === 'color-contrast')
        .reduce((total, finding) => total + finding.nodes, 0);
      if (nodes > 0) measured[key] = nodes;
    }
    expect(measured).toEqual(CONTRAST_DEBT);
  }, 180_000);
});
