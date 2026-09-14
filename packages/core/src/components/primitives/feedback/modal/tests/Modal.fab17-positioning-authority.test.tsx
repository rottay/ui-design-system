/**
 * @fileoverview FAB-17 observable contract -- Modal (modern engine).
 *
 * The panel's position is anatomy the skin owns, and `style` is a public,
 * unrestricted hatch. The engine therefore drops the caller's `position`, and
 * in the fullscreen presentation the `top`/`left` pin as well, before the hatch
 * reaches the panel. Everything else the caller paints still wins, and outside
 * the fullscreen presentation the caller keeps `top`/`left` and `zIndex`.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernModal from '../engines/modern';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '@/infrastructure/runtime/responsive';

const SURFACE = "[data-part='surface']";

const PHONE: ResponsiveContextValue = {
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: false,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

const DESKTOP: ResponsiveContextValue = {
  ...PHONE,
  deviceClass: 'desktop',
  activeBreakpoint: 'xl',
  isPhone: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

const CALLER_HATCH: React.CSSProperties = {
  position: 'static',
  top: '999px',
  left: '888px',
  zIndex: 4,
  background: 'rgb(1, 2, 3)',
  padding: '77px',
  borderRadius: '13px',
};

function renderModal(context: ResponsiveContextValue): HTMLElement {
  render(
    <ResponsiveContext.Provider value={context}>
      <ModernModal open title="Governed" style={CALLER_HATCH}>
        body
      </ModernModal>
    </ResponsiveContext.Provider>,
  );
  const surface = document.querySelector(SURFACE) as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe('FAB-17 / Modal modern: the caller never strands the panel geometry', () => {
  it('floating presentation: the caller `position` never reaches the panel', () => {
    const surface = renderModal(DESKTOP);

    expect(surface.closest('dialog')).toHaveAttribute('data-presentation', 'floating');
    expect(surface.style.position).toBe('');
  });

  it('fullscreen presentation: neither `position` nor the top/left pin reaches the panel', () => {
    const surface = renderModal(PHONE);

    expect(surface.closest('dialog')).toHaveAttribute('data-presentation', 'fullscreen');
    expect(surface.style.position).toBe('');
    expect(surface.style.top).toBe('');
    expect(surface.style.left).toBe('');
  });
});

describe('FAB-17 / Modal modern: the guard does not over-reach', () => {
  it('caller paint still wins in the floating presentation', () => {
    const surface = renderModal(DESKTOP);

    expect(surface.style.background).toBe('rgb(1, 2, 3)');
    expect(surface.style.padding).toBe('77px');
    expect(surface.style.borderRadius).toBe('13px');
  });

  it('caller paint still wins in the fullscreen presentation', () => {
    const surface = renderModal(PHONE);

    expect(surface.style.background).toBe('rgb(1, 2, 3)');
    expect(surface.style.padding).toBe('77px');
  });

  it('outside the fullscreen presentation the caller keeps top/left', () => {
    const surface = renderModal(DESKTOP);

    expect(surface.style.top).toBe('999px');
    expect(surface.style.left).toBe('888px');
  });

  it('the panel `zIndex` stays the caller\'s', () => {
    const surface = renderModal(DESKTOP);

    expect(surface.style.zIndex).toBe('4');
  });
});
