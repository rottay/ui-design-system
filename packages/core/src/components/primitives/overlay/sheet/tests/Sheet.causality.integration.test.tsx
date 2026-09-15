/**
 * The sheet family in a real browser: every decision its paint consumes moves
 * the panel with a negative control; a side sheet takes the dynamic viewport on
 * a phone while a bottom sheet keeps its posture, the physical edge holds under
 * RTL while the header mirrors, and language, loading and accessibility hold.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { ResponsiveContext, type ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import ModernSheet from '../engines/modern';
import type { SheetProps } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const DESKTOP: ResponsiveContextValue = {
  deviceClass: 'desktop',
  activeBreakpoint: 'xl',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

const PHONE: ResponsiveContextValue = {
  ...DESKTOP,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

/** The portaled sheet's markup as the browser receives it. */
function sheetMarkup(props: Partial<SheetProps> = {}, context: ResponsiveContextValue = DESKTOP): string {
  const view = render(
    <ResponsiveContext.Provider value={context}>
      <ModernSheet open onOpenChange={() => {}} title="Filters" footer={<button type="button">Apply</button>} {...props}>
        Sheet body
      </ModernSheet>
    </ResponsiveContext.Provider>,
  );
  const html = document.querySelector('.ds-sheet')!.outerHTML;
  view.unmount();
  return html;
}

const markup = sheetMarkup();

const SURFACE = "[data-part='surface']";
const CLOSE = "[data-part='close-button']";

describeCausality({
  family: 'sheet',
  markup,
  targets: [
    { id: 'shadow', selector: SURFACE, property: 'box-shadow' },
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'edge', selector: SURFACE, property: 'border-top-width' },
    { id: 'titleSize', selector: "[data-part='title']", property: 'font-size' },
    { id: 'padding', selector: "[data-part='header']", property: 'padding-top' },
    { id: 'focusRing', selector: CLOSE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'duration', selector: CLOSE, property: 'transition-duration' },
  ],
  decisions: {
    // The seed's only subject here was the focus ring, which has no producer on
    // two of three verticals; the reach is asserted per vertical below instead.
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
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

describe('sheet posture, direction, language, loading and accessibility', () => {
  it('takes the whole dynamic viewport for a side sheet on a phone and keeps a bottom sheet', async () => {
    const sidePhone = sheetMarkup({ side: 'right' }, PHONE);
    const bottomPhone = sheetMarkup({}, PHONE);
    expect(sidePhone).toContain('data-presentation="fullscreen"');
    expect(bottomPhone).toContain('data-presentation="floating"');
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="side">${sidePhone}</div><div id="desk">${sheetMarkup({ side: 'right' })}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'sideWidth', selector: `#side ${SURFACE}`, property: '@rect.width' },
        { id: 'deskWidth', selector: `#desk ${SURFACE}`, property: '@rect.width' },
      ],
    });
    const r = result.base!;
    expect(Number(r.sideWidth)).toBeGreaterThan(Number(r.deskWidth));
  }, 60_000);

  it('keeps its physical edge under RTL while the header mirrors', async () => {
    const right = sheetMarkup({ side: 'right' });
    const result = await measureArms({
      vertical: 'rottay',
      markup: right,
      arms: { base: {} },
      targets: [
        { id: 'ltrEdge', selector: SURFACE, property: '@rect.right', dir: 'ltr' },
        { id: 'rtlEdge', selector: SURFACE, property: '@rect.right', dir: 'rtl' },
        { id: 'ltrClose', selector: CLOSE, property: '@rect.left', dir: 'ltr' },
        { id: 'ltrTitle', selector: "[data-part='title']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlClose', selector: CLOSE, property: '@rect.left', dir: 'rtl' },
        { id: 'rtlTitle', selector: "[data-part='title']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(r.rtlEdge).toBe(r.ltrEdge);
    expect(Number(r.ltrClose)).toBeGreaterThan(Number(r.ltrTitle));
    expect(Number(r.rtlClose)).toBeLessThan(Number(r.rtlTitle));
  }, 60_000);

  it('names its dialog from the title and its close control from the active catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernSheet open onOpenChange={() => {}} title="Filtros">
          Cuerpo
        </ModernSheet>
      </I18nProvider>,
    );
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('builds its loading state from its own anatomy', () => {
    render(
      <ModernSheet open onOpenChange={() => {}} title="Filters">
        Sheet body
      </ModernSheet>,
    );
    const bones = readAnatomyBones(document.querySelector<HTMLElement>('.ds-sheet')!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['surface:frame', 'title:line', 'close-button:round']),
    );
    expect(bones.some((bone) => bone.part === 'handle')).toBe(false);
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
        targets: [{ id: 'focusRing', selector: CLOSE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } }],
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
