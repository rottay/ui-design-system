/**
 * The alert-dialog family in a real browser: every decision its paint consumes
 * moves the chamber with a negative control; the copy mirrors under RTL, and
 * language, loading and accessibility hold.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernAlertDialog from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

/** The portaled dialog's markup as the browser receives it. */
function dialogMarkup(): string {
  const view = render(
    <div>
      <ModernAlertDialog open title="Revoke access?" description="All sessions end." action={<button type="button">Revoke</button>} />
    </div>,
  );
  const html = document.querySelector('dialog')!.outerHTML;
  view.unmount();
  return html;
}

const markup = dialogMarkup();

const SURFACE = "[data-part='surface']";

describeCausality({
  family: 'alert-dialog',
  markup,
  targets: [
    { id: 'iconInk', selector: "[data-part='icon']", property: 'color' },
    { id: 'shadow', selector: SURFACE, property: 'box-shadow' },
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'edge', selector: SURFACE, property: 'border-top-width' },
    { id: 'padding', selector: SURFACE, property: 'padding-top' },
    { id: 'titleSize', selector: "[data-part='title']", property: 'font-size' },
    { id: 'duration', selector: SURFACE, property: 'animation-duration' },
  ],
  decisions: {
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['iconInk'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: VERTICALS },
    // `spacious` is the one stop no first-party preset decides (rottay/evnto
    // normal, bithire compact), so the arm discriminates on all three.
    'density.mode': { value: 'spacious', moves: ['padding'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'flat', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('alert-dialog direction, language, loading and accessibility', () => {
  it('lays the icon well at the inline start in both directions', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'ltrIcon', selector: "[data-part='icon']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrCopy', selector: "[data-part='copy']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlIcon', selector: "[data-part='icon']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlCopy', selector: "[data-part='copy']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrIcon)).toBeLessThan(Number(r.ltrCopy));
    expect(Number(r.rtlIcon)).toBeGreaterThan(Number(r.rtlCopy));
  }, 60_000);

  it('names its alert dialog from the title and its cancel action from the active catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernAlertDialog open title="Revocar acceso" description="Se cierran las sesiones." />
      </I18nProvider>,
    );
    const dialog = screen.getByRole('alertdialog', { name: 'Revocar acceso' });
    expect(dialog).toHaveAccessibleDescription('Se cierran las sesiones.');
    expect(dialog.getAttribute('aria-labelledby')).toMatch(/-title$/);
    expect(document.querySelector("[data-action='cancel']")).toHaveTextContent('Cancelar');
  });

  it('builds its loading state from its own anatomy', () => {
    render(<ModernAlertDialog open title="Revoke access?" description="All sessions end." action={<button type="button">Revoke</button>} />);
    const bones = readAnatomyBones(document.querySelector<HTMLElement>('dialog')!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['surface:frame', 'title:line', 'description:line', 'icon:round']),
    );
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
