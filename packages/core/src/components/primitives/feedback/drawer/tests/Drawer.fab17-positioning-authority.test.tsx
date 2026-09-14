/**
 * @fileoverview FAB-17 observable contract -- Drawer (modern engine).
 *
 * A drawer is fixed to a viewport edge on the overlay layer band, and `style`
 * is a public, unrestricted hatch. The engine therefore drops the caller's
 * `position`, `zIndex` and edge offsets before the hatch reaches the panel;
 * the skin owns the rect and the panel carries the band as `--ds-drawer-layer`.
 * Every other property the caller paints still wins.
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

function renderDrawer(placement: Placement): HTMLElement {
  render(
    <ModernDrawer open placement={placement} style={CALLER_HATCH}>
      body
    </ModernDrawer>,
  );
  const surface = document.querySelector(SURFACE) as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe('FAB-17 / Drawer modern: the caller never strands the panel', () => {
  it.each<Placement>(['left', 'right', 'top', 'bottom'])(
    '%s placement: position, edges and layer never reach the panel',
    (placement) => {
      const surface = renderDrawer(placement);

      expect(surface).toHaveAttribute('data-placement', placement);
      expect(surface.style.position).toBe('');
      expect(surface.style.zIndex).toBe('');
      expect(surface.style.top).toBe('');
      expect(surface.style.right).toBe('');
      expect(surface.style.bottom).toBe('');
      expect(surface.style.left).toBe('');
    },
  );

  it('carries the overlay layer band as the family channel', () => {
    const surface = renderDrawer('right');

    expect(surface.style.getPropertyValue('--ds-drawer-layer')).toBe('var(--ds-z-index-drawer)');
  });
});

describe('FAB-17 / Drawer modern: the guard does not over-reach', () => {
  it.each<Placement>(['left', 'right', 'top', 'bottom'])('%s placement: caller paint still wins', (placement) => {
    const surface = renderDrawer(placement);

    expect(surface.style.background).toBe('rgb(1, 2, 3)');
    expect(surface.style.padding).toBe('77px');
    expect(surface.style.visibility).toBe('visible');
  });
});
