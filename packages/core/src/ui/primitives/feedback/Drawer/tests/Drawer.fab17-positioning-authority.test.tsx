/**
 * @fileoverview FAB-17 observable contract -- Drawer (modern engine).
 *
 * FAB-17 ruled that the engine's POSITIONING BLOCK merges AFTER caller `style`.
 * For Drawer the block is `position` plus the `zIndex` the overlay layer
 * manager owns. The per-placement switch then spreads `...base` and adds the
 * viewport-edge rect, so the placement COORDINATES already outranked caller
 * style; only `position` and the owned `zIndex` were exposed. The rect is
 * 100vh/100vw spans against viewport edges, which only pin on a fixed element.
 *
 * Both halves are load-bearing: the block must win, AND it must stay narrow --
 * caller paint survives, and the engine claims only the edges the chosen
 * placement actually owns.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernDrawer from '../engines/modern';

const SURFACE = "[data-part='surface']";

const CALLER_HATCH: React.CSSProperties = {
  position: 'static',
  top: '999px',
  left: '888px',
  right: '777px',
  bottom: '666px',
  zIndex: 4,
  visibility: 'visible',
  background: 'rgb(1, 2, 3)',
  padding: '77px',
};

type Placement = 'left' | 'right' | 'top' | 'bottom';

function renderDrawer(placement: Placement, style: React.CSSProperties): HTMLElement {
  render(
    <ModernDrawer open placement={placement} style={style}>
      body
    </ModernDrawer>,
  );
  const surface = document.querySelector(SURFACE) as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe('FAB-17 / Drawer modern: engine positioning block wins over caller style', () => {
  it.each<Placement>(['left', 'right', 'top', 'bottom'])(
    '%s placement: caller `position: static` loses to the engine `fixed`',
    (placement) => {
      const surface = renderDrawer(placement, CALLER_HATCH);

      expect(surface.style.position).toBe('fixed');
      expect(surface.style.position).not.toBe('static');
    },
  );

  it.each<Placement>(['left', 'right', 'top', 'bottom'])(
    '%s placement: the owned overlay-layer zIndex outranks the caller',
    (placement) => {
      const surface = renderDrawer(placement, CALLER_HATCH);

      // The layer manager supplies a tokenized band, never the caller's scalar.
      expect(surface.style.getPropertyValue('z-index')).toBe('var(--ds-z-index-drawer)');
      expect(surface.style.getPropertyValue('z-index')).not.toBe('4');
    },
  );

  it('left placement: the engine rect claims the edges it computes', () => {
    const surface = renderDrawer('left', CALLER_HATCH);

    expect(surface.style.top).toBe('0px');
    expect(surface.style.left).toBe('0px');
    expect(surface.style.height).toBe('100vh');
  });

  it('right placement: the engine rect claims the inline-end edge', () => {
    const surface = renderDrawer('right', CALLER_HATCH);

    expect(surface.style.top).toBe('0px');
    expect(surface.style.right).toBe('0px');
    expect(surface.style.right).not.toBe('777px');
  });

  it('bottom placement: the engine rect claims the block-end edge', () => {
    const surface = renderDrawer('bottom', CALLER_HATCH);

    expect(surface.style.bottom).toBe('0px');
    expect(surface.style.left).toBe('0px');
    expect(surface.style.bottom).not.toBe('666px');
  });
});

describe('FAB-17 / Drawer modern: the guard did NOT over-reach', () => {
  it.each<Placement>(['left', 'right', 'top', 'bottom'])(
    '%s placement: caller-supplied non-positioning paint still wins',
    (placement) => {
      const surface = renderDrawer(placement, CALLER_HATCH);

      expect(surface.style.background).toBe('rgb(1, 2, 3)');
      expect(surface.style.padding).toBe('77px');
      expect(surface.style.visibility).toBe('visible');
    },
  );

  it('right placement leaves the edges it does NOT compute to the caller', () => {
    // The `right` rect sets top/right/width/height only. An over-broad guard
    // that spread a full four-edge inset would clobber these and this test
    // would go red -- which is exactly its job.
    const surface = renderDrawer('right', CALLER_HATCH);

    expect(surface.style.left).toBe('888px');
    expect(surface.style.bottom).toBe('666px');
  });

  it('left placement leaves the edges it does NOT compute to the caller', () => {
    const surface = renderDrawer('left', CALLER_HATCH);

    expect(surface.style.right).toBe('777px');
    expect(surface.style.bottom).toBe('666px');
  });
});
