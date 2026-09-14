/**
 * The tour family in a real browser: every decision its paint consumes moves
 * the step card with a negative control; the close control mirrors under RTL,
 * and language, loading and accessibility hold.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernTour from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const STEPS = [
  { title: 'Invite your team', description: 'Share the workspace with the people you work with.' },
  { title: 'Publish', description: 'Go live when you are ready.' },
];

/** The portaled tour chrome, on its second step, as the browser receives it. */
function tourMarkup(dir: 'ltr' | 'rtl' = 'ltr'): string {
  const view = render(
    <div data-ds-root="" dir={dir}>
      <ModernTour open current={1} steps={STEPS} />
    </div>,
  );
  const html = document.querySelector<HTMLElement>('.ds-tour')!.outerHTML;
  view.unmount();
  return html;
}

const markup = tourMarkup();

const SURFACE = "[data-part='surface']";
const CLOSE = "[data-part='close-button']";
const NEXT = "[data-action='next']";

describeCausality({
  family: 'tour',
  markup,
  targets: [
    { id: 'shadow', selector: SURFACE, property: 'box-shadow' },
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'padding', selector: SURFACE, property: 'padding-top' },
    { id: 'titleSize', selector: "[data-part='title']", property: 'font-size' },
    { id: 'nextBg', selector: NEXT, property: 'background-color' },
    { id: 'focusRing', selector: CLOSE, property: 'outline-color', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'duration', selector: CLOSE, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['nextBg', 'focusRing'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['padding'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('tour direction, language, loading and accessibility', () => {
  it('keeps the close control at the inline end of the card in both directions', async () => {
    const rtl = tourMarkup('rtl');
    expect(rtl).toContain('dir="rtl"');
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="ltr">${markup}</div><div id="rtl">${rtl}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrClose', selector: `#ltr ${CLOSE}`, property: '@rect.left' },
        { id: 'ltrSurface', selector: `#ltr ${SURFACE}`, property: '@rect.left' },
        { id: 'rtlClose', selector: `#rtl ${CLOSE}`, property: '@rect.left' },
        { id: 'rtlSurface', selector: `#rtl ${SURFACE}`, property: '@rect.left' },
      ],
    });
    const r = result.base!;
    const ltrOffset = Number(r.ltrClose) - Number(r.ltrSurface);
    const rtlOffset = Number(r.rtlClose) - Number(r.rtlSurface);
    expect(ltrOffset).toBeGreaterThan(rtlOffset);
  }, 60_000);

  it('names its dialog from the step and its controls from the active catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernTour open current={1} steps={[{ title: 'Invitar' }, { title: 'Publicar' }]} />
      </I18nProvider>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Publicar' });
    expect(dialog.getAttribute('aria-labelledby')).toMatch(/\S/);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
  });

  it('builds its loading state from its own anatomy', () => {
    render(<ModernTour open current={1} steps={STEPS} />);
    const bones = readAnatomyBones(document.querySelector<HTMLElement>("[data-part='surface']")!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['title:line', 'close-button:round', 'indicator:round', 'action:block']),
    );
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
