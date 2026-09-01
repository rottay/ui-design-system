/**
 * @fileoverview FAB-17 observable contract -- Modal (modern engine).
 *
 * FAB-17 ruled that the engine's POSITIONING BLOCK merges AFTER caller `style`.
 * For Modal the block is exactly `position` plus the adaptive-fullscreen
 * `top`/`left` pin. The engine COMPUTES geometry against the position it sets:
 * the fullscreen posture pins top/left to 0, which is meaningless off a fixed
 * element, and `style` is a public unrestricted CSSProperties hatch.
 *
 * This suite has two halves and BOTH are load-bearing:
 *   1. the engine's positioning block wins over caller style;
 *   2. the guard did NOT over-reach -- caller-supplied non-positioning
 *      properties still win, and the block stays narrow (the engine does not
 *      claim `top`/`left` outside the fullscreen posture, and never claims the
 *      panel's `zIndex`, which it does not own).
 *
 * Half 2 is what distinguishes a correct narrow guard from an over-broad one
 * that swallowed the whole caller style object. A suite with only half 1 would
 * pass identically against both and would therefore not be evidence.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernModal from '../engines/modern';
import { buildRangeQuery } from '@/foundation/contracts/kernel/responsive/breakpoints';

const SURFACE = "[data-part='surface']";
const PHONE_QUERY = buildRangeQuery('xs', 'sm');

const ORIGINAL_MATCH_MEDIA = window.matchMedia;

/**
 * Drives `usePhoneBreakpoint()` true by matching the EXACT phone range query
 * the hook subscribes to, rather than any substring of a media string. A
 * loose matcher would also flip unrelated queries and would let this test
 * keep passing if the breakpoint contract moved underneath it.
 */
function forcePhoneBreakpoint(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: query === PHONE_QUERY,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    } as MediaQueryList),
  });
}

/**
 * The public hatch, carrying a positioning payload that would strand the
 * engine's computed geometry, alongside ordinary paint the caller is entitled
 * to keep.
 */
const CALLER_HATCH: React.CSSProperties = {
  position: 'static',
  top: '999px',
  left: '888px',
  zIndex: 4,
  background: 'rgb(1, 2, 3)',
  padding: '77px',
  borderRadius: '13px',
};

function renderModal(style: React.CSSProperties): HTMLElement {
  render(
    <ModernModal open title="Governed" style={style}>
      body
    </ModernModal>,
  );
  const surface = document.querySelector(SURFACE) as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: ORIGINAL_MATCH_MEDIA,
  });
});

describe('FAB-17 / Modal modern: engine positioning block wins over caller style', () => {
  it('desktop posture: caller `position: static` loses to the engine `relative`', () => {
    const surface = renderModal(CALLER_HATCH);

    expect(surface.style.position).toBe('relative');
    expect(surface.style.position).not.toBe('static');
  });

  it('adaptive-fullscreen posture: engine wins `position` AND the top/left pin', () => {
    forcePhoneBreakpoint();
    const surface = renderModal(CALLER_HATCH);

    // Guards the precondition: without it this test would silently assert the
    // desktop branch and prove nothing about the fullscreen pin.
    expect(surface.getAttribute('data-adaptive-fullscreen')).toBe('true');

    expect(surface.style.position).toBe('fixed');
    expect(surface.style.top).toBe('0px');
    expect(surface.style.left).toBe('0px');
    // The caller's competing offsets are gone, not merely reordered.
    expect(surface.style.top).not.toBe('999px');
    expect(surface.style.left).not.toBe('888px');
  });
});

describe('FAB-17 / Modal modern: the guard did NOT over-reach', () => {
  it('caller-supplied non-positioning paint still wins in the desktop posture', () => {
    const surface = renderModal(CALLER_HATCH);

    expect(surface.style.background).toBe('rgb(1, 2, 3)');
    expect(surface.style.padding).toBe('77px');
    expect(surface.style.borderRadius).toBe('13px');
  });

  it('caller-supplied non-positioning paint still wins in the fullscreen posture', () => {
    forcePhoneBreakpoint();
    const surface = renderModal(CALLER_HATCH);

    expect(surface.getAttribute('data-adaptive-fullscreen')).toBe('true');
    expect(surface.style.background).toBe('rgb(1, 2, 3)');
    expect(surface.style.padding).toBe('77px');
  });

  it('outside the fullscreen posture the engine does not claim top/left at all', () => {
    // FAB-17's block is conditional: `...(isAdaptiveFullscreen ? {top,left} : {})`.
    // An over-broad guard that pinned top/left unconditionally would break this,
    // and so would one that spread a fixed positioning object in every posture.
    const surface = renderModal(CALLER_HATCH);

    expect(surface.getAttribute('data-adaptive-fullscreen')).toBe('false');
    expect(surface.style.top).toBe('999px');
    expect(surface.style.left).toBe('888px');
  });

  it('the panel `zIndex` is NOT in the block -- the caller keeps it', () => {
    // FAB-17 names the owned z-index for Drawer and Dropdown only. The modal
    // panel does not own one (the dialog root carries the stack), so claiming
    // it here would be over-reach.
    const surface = renderModal(CALLER_HATCH);

    expect(surface.style.zIndex).toBe('4');
  });
});
