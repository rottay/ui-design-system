/**
 * The otp-input family in a real browser: every decision its paint consumes moves
 * the slots with a negative control, and direction, language and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernOTPInput from '../engines/modern';
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
    <div id="rest"><ModernOTPInput length={4} /></div>
    <div id="error"><ModernOTPInput length={4} error /></div>
  </div>,
);

const SLOT = "#rest [data-part='slot']";

describeCausality({
  family: 'otp-input',
  markup,
  targets: [
    { id: 'errorBorder', selector: "#error [data-part='slot']", property: 'border-top-color' },
    { id: 'radius', selector: SLOT, property: 'border-top-left-radius' },
    { id: 'size', selector: SLOT, property: '@rect.height' },
    { id: 'fontSize', selector: SLOT, property: 'font-size' },
    { id: 'edge', selector: SLOT, property: 'border-top-width' },
    { id: 'duration', selector: SLOT, property: 'transition-duration' },
  ],
  decisions: {
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['size'], holds: 'radius', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['size'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('otp-input geometry, direction, language and accessibility in a real browser', () => {
  it('keeps the code in positional left-to-right order inside a right-to-left page', async () => {
    const code = renderToStaticMarkup(<ModernOTPInput length={3} />);
    const result = await measureArms({
      vertical: 'bithire',
      markup: code,
      arms: { base: {} },
      targets: [
        { id: 'first', selector: "[data-part='slot']:nth-child(1)", property: '@rect.left', dir: 'rtl' },
        { id: 'last', selector: "[data-part='slot']:nth-child(3)", property: '@rect.left', dir: 'rtl' },
      ],
    });
    expect(Number(result.base!.first)).toBeLessThan(Number(result.base!.last));
  }, 60_000);

  it('labels each slot from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernOTPInput length={2} />
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Dígito 1 de 2"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernOTPInput length={4} />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="slot"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <div>
        <ModernOTPInput length={4} value="12" onChange={() => {}} />
        <ModernOTPInput length={4} error errorMessage="Wrong code" />
        <ModernOTPInput length={4} disabled />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
