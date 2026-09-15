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
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['nextBg'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: VERTICALS },
    // `spacious` is the one stop no first-party preset decides (rottay/evnto
    // normal, bithire compact), so the arm discriminates on all three.
    'density.mode': { value: 'spacious', moves: ['padding'], holds: 'radius', in: VERTICALS },
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

/**
 * The focus ring follows `palette.seeds` only where the ring has a producer.
 *
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15). Measured on
 * this tree: rottay moves #a3a3a3 -> #306B9A, while bithire and evnto hold at
 * the foundation constant #ECECEC that `foundation/themes/default` declares --
 * the retired authored themes used to state the ring as their own primary. The
 * reach is pinned PER VERTICAL rather than dropped, so the lane that gives the
 * light-default verticals a producer reddens this row instead of passing.
 */
const FOCUS_RING_SEED_REACH: Readonly<Record<string, boolean>> = {
  rottay: true,
  bithire: false,
  evnto: false,
};

describe('focus ring seed reach', () => {
  it('follows palette.seeds only where the ring has a producer', async () => {
    for (const vertical of VERTICALS) {
      const reading = await measureArms({
        vertical,
        markup,
        arms: { base: {}, seeds: { 'palette.seeds': { primary: '#2F6B9A' } } },
        targets: [{ id: 'focusRing', selector: CLOSE, property: 'outline-color', attributes: { 'data-state': 'focused focus-visible' } }],
      });
      const base = reading.base!.focusRing;
      const seeded = reading.seeds!.focusRing;
      expect(base, `${vertical}: focusRing has a reading`).not.toMatch(/^<no match/);
      if (FOCUS_RING_SEED_REACH[vertical]) {
        expect(seeded, `${vertical}: the seed reaches the ring`).not.toBe(base);
      } else {
        expect(seeded, `${vertical}: the ring has no producer yet`).toBe(base);
      }
    }
  }, 240_000);
});
