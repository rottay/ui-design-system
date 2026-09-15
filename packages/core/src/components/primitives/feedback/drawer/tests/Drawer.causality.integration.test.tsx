/**
 * The drawer family in a real browser: every decision its paint consumes moves
 * the panel with a negative control; the fullscreen presentation takes the
 * dynamic viewport, the physical edge holds under RTL while the header mirrors,
 * and language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { ResponsiveContext, type ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import ModernDrawer from '../engines/modern';
import type { DrawerProps } from '../contracts';
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

function drawerMarkup(props: Partial<DrawerProps> = {}, context: ResponsiveContextValue = DESKTOP): string {
  return renderToStaticMarkup(
    <ResponsiveContext.Provider value={context}>
      <ModernDrawer open title="Filters" footer={<button type="button">Apply</button>} {...props}>
        Drawer body
      </ModernDrawer>
    </ResponsiveContext.Provider>,
  );
}

const markup = drawerMarkup();

const SURFACE = "[data-part='surface']";
const CLOSE = "[data-part='close-button']";

describeCausality({
  family: 'drawer',
  markup,
  targets: [
    { id: 'shadow', selector: SURFACE, property: 'box-shadow' },
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'edge', selector: SURFACE, property: 'border-top-width' },
    { id: 'titleSize', selector: "[data-part='title']", property: 'font-size' },
    { id: 'padding', selector: "[data-part='header']", property: 'padding-top' },
    { id: 'iconInk', selector: "[data-part='header-icon']", property: 'color' },
    { id: 'focusRing', selector: CLOSE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'duration', selector: CLOSE, property: 'transition-duration' },
  ],
  decisions: {
    // `focusRing` left this arm in D6-2c-ii-RED: `--ds-focus-ring-color` is the
    // foundation light fallback on a light-default vertical. Pinned two-sided in
    // Modal.causality ("focus ring reach under the neutral compile"); WO-DER-06.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['iconInk'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['padding'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'flat', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('drawer posture, direction, language, loading and accessibility', () => {
  it('takes the whole dynamic viewport in the fullscreen presentation and keeps its preset otherwise', async () => {
    const fullscreen = drawerMarkup({}, PHONE);
    expect(fullscreen).toContain('data-presentation="fullscreen"');
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="floating">${markup}</div><div id="fullscreen">${fullscreen}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'floatingWidth', selector: `#floating ${SURFACE}`, property: '@rect.width' },
        { id: 'fullscreenWidth', selector: `#fullscreen ${SURFACE}`, property: '@rect.width' },
        { id: 'fullscreenRadius', selector: `#fullscreen ${SURFACE}`, property: 'border-top-left-radius' },
      ],
    });
    const r = result.base!;
    expect(Number(r.fullscreenWidth)).toBeGreaterThan(Number(r.floatingWidth));
    expect(r.fullscreenRadius).toBe('0px');
  }, 60_000);

  it('keeps its physical edge under RTL while the header mirrors', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
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
        <ModernDrawer open title="Filtros">
          Cuerpo
        </ModernDrawer>
      </I18nProvider>,
    );
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('builds its loading state from its own anatomy', () => {
    const { container } = render(
      <ModernDrawer open title="Filters" footer={<button type="button">Apply</button>}>
        Drawer body
      </ModernDrawer>,
    );
    const bones = readAnatomyBones(container);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['surface:frame', 'title:line', 'header-icon:round', 'close-button:round']),
    );
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
