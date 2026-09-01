/**
 * @fileoverview FAB-17 NEGATIVE CONTROL -- Popover (modern engine).
 *
 * Popover was ALREADY protected before FAB-17: its surface style is assembled
 * as `{ ...tokens, ...overlayStyle, ...positionStyle }`, so the measured
 * positioning already merged last. FAB-17 changed nothing here -- the ruling
 * describes this component as the precedent the outliers were aligned to.
 *
 * That is precisely what makes it evidence. This file must pass identically
 * with and without the FAB-17 change to Modal, Drawer and Dropdown. A fixture
 * carrying only the three changed components cannot show that the merge-last
 * MECHANISM is what made the difference, because every assertion in it moves
 * together. The control holds still.
 *
 * The narrowness half applies here too: Popover's `positionStyle` does not
 * carry a z-index (the stack travels as `--ds-popover-instance-z-index`), so
 * the caller keeps `zIndex` -- a property an over-broad guard would have taken.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernPopover from '../engines/modern';

const SURFACE = ".rottay-popover--modern [data-part='surface']";

const CALLER_HATCH: React.CSSProperties = {
  position: 'static',
  top: '999px',
  left: '888px',
  zIndex: 4,
  background: 'rgb(1, 2, 3)',
  padding: '77px',
};

function renderPopover(): HTMLElement {
  render(
    <ModernPopover open content="Popover content" title="Popover title" overlayStyle={CALLER_HATCH}>
      <button type="button">trigger</button>
    </ModernPopover>,
  );
  const surface = document.querySelector(SURFACE) as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe('FAB-17 / Popover modern: already-protected control', () => {
  it('the measured positionStyle already outranks caller overlayStyle', () => {
    const surface = renderPopover();

    expect(surface.style.position).toBe('fixed');
    expect(surface.style.position).not.toBe('static');
    expect(surface.style.top).not.toBe('999px');
    expect(surface.style.left).not.toBe('888px');
  });

  it('caller-supplied non-positioning paint still wins', () => {
    const surface = renderPopover();

    expect(surface.style.background).toBe('rgb(1, 2, 3)');
    expect(surface.style.padding).toBe('77px');
  });

  it('`zIndex` is not part of this surface positioning block -- the caller keeps it', () => {
    const surface = renderPopover();

    expect(surface.style.zIndex).toBe('4');
    // The overlay stack travels as a token instead, so the caller's scalar
    // never competes with the layer manager.
    expect(surface.style.getPropertyValue('--ds-popover-instance-z-index')).not.toBe('');
  });
});
