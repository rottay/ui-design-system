/**
 * The modal family in a real browser: every decision its paint consumes moves
 * the dialog with a negative control; the surface composes the elevation-surface
 * wash over its own fill, the fullscreen presentation takes the dynamic
 * viewport, the header mirrors under RTL, and language, loading and
 * accessibility hold.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { ResponsiveContext, type ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import ModernModal from '../engines/modern';
import type { ModalProps } from '../contracts';
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

/** The portaled dialog's markup, open, as the browser receives it. */
function dialogMarkup(props: ModalProps, context: ResponsiveContextValue = DESKTOP, dir: 'ltr' | 'rtl' = 'ltr'): string {
  const view = render(
    <ResponsiveContext.Provider value={context}>
      <div dir={dir}>
        <ModernModal open title="Review scope" description="Two changes" onOk={() => {}} onCancel={() => {}} {...props} />
      </div>
    </ResponsiveContext.Provider>,
  );
  const dialog = document.querySelector('dialog')!;
  dialog.setAttribute('open', '');
  const html = dialog.outerHTML;
  view.unmount();
  return html;
}

const markup = dialogMarkup({ divider: true, children: 'Body copy' });

const SURFACE = "[data-part='surface']";
const CLOSE = "[data-part='close-button']";
const OK = "[data-action='ok']";

describeCausality({
  family: 'modal',
  markup,
  targets: [
    { id: 'shadow', selector: SURFACE, property: 'box-shadow' },
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'edge', selector: SURFACE, property: 'border-top-width' },
    { id: 'titleSize', selector: "[data-part='title']", property: 'font-size' },
    { id: 'padding', selector: "[data-part='header']", property: 'padding-top' },
    { id: 'okBg', selector: OK, property: 'background-color' },
    { id: 'focusRing', selector: CLOSE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'disabledOpacity', selector: OK, property: 'opacity', attributes: { 'data-state': 'disabled' } },
    { id: 'duration', selector: CLOSE, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['okBg', 'focusRing'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'states.emphasis': { value: 'strong', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['padding'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'flat', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('modal posture, direction, language, loading and accessibility', () => {
  // The wash is a separate background layer from the fill, so a skin that drops
  // it still paints a plausible surface; the reference node declares only the wash.
  it('composes the elevation-surface wash above its own fill', async () => {
    const reference =
      '<div id="wash" style="background-image: linear-gradient(var(--ds-elevation-surface-4), var(--ds-elevation-surface-4));"></div>';
    const result = await measureArms({
      vertical: 'rottay',
      markup: `${reference}<div id="dialog">${markup}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'wash', selector: '#wash', property: 'background-image' },
        { id: 'lift', selector: `#dialog ${SURFACE}`, property: '--ds-elevation-surface-4' },
        { id: 'surfaceImage', selector: `#dialog ${SURFACE}`, property: 'background-image' },
        { id: 'surfaceFill', selector: `#dialog ${SURFACE}`, property: 'background-color' },
      ],
    });
    const r = result.base!;
    expect(r.lift.trim()).not.toBe('');
    expect(r.wash).toMatch(/^linear-gradient\(/);
    expect(r.surfaceImage.slice(0, r.wash.length)).toBe(r.wash);
    expect(r.surfaceImage.length).toBeGreaterThan(r.wash.length);
    expect(r.surfaceFill).not.toBe('rgba(0, 0, 0, 0)');
  }, 60_000);

  it('takes the whole dynamic viewport in the fullscreen presentation and floats otherwise', async () => {
    const floating = dialogMarkup({ children: 'Body copy' });
    const fullscreen = dialogMarkup({ children: 'Body copy' }, PHONE);
    expect(fullscreen).toContain('data-presentation="fullscreen"');
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="floating">${floating}</div><div id="fullscreen">${fullscreen}</div>`,
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

  it('keeps the close control at the inline end of the header in both directions', async () => {
    const rtl = dialogMarkup({ children: 'Body copy' }, DESKTOP, 'rtl');
    expect(rtl).toContain('dir="rtl"');
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="ltr">${markup}</div><div id="rtl">${rtl}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrClose', selector: `#ltr ${CLOSE}`, property: '@rect.left' },
        { id: 'ltrTitle', selector: "#ltr [data-part='title']", property: '@rect.left' },
        { id: 'rtlClose', selector: `#rtl ${CLOSE}`, property: '@rect.left' },
        { id: 'rtlTitle', selector: "#rtl [data-part='title']", property: '@rect.left' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrClose)).toBeGreaterThan(Number(r.ltrTitle));
    expect(Number(r.rtlClose)).toBeLessThan(Number(r.rtlTitle));
  }, 60_000);

  it('names its dialog from the title and its controls from the active catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernModal open title="Revisar" onOk={() => {}} onCancel={() => {}}>
          Cuerpo
        </ModernModal>
      </I18nProvider>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Revisar' });
    expect(dialog.getAttribute('aria-labelledby')).not.toMatch(/^modal/);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('builds its loading state from its own anatomy', () => {
    render(
      <ModernModal open title="Review scope" onOk={() => {}}>
        Body copy
      </ModernModal>,
    );
    const bones = readAnatomyBones(document.querySelector<HTMLElement>('dialog')!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['surface:frame', 'title:line', 'close-button:round', 'action:block']),
    );
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = [
      dialogMarkup({ children: 'Body copy', divider: true }),
      dialogMarkup({ children: 'Pending', confirmLoading: true, blurBackdrop: true, size: 'sm' }),
    ].join('');
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
