// mouseenter/mouseleave do not bubble, so sliding from a star's half zone onto its full
// zone fires nothing unless the child hands the hover back.

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import ModernRate from '../engines/modern';

const stars = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-part="star"]')) as HTMLElement[];

describe('Rate modern half-zone hover handoff', () => {
  it('restores the full-star preview when the pointer leaves the half zone into the same star', () => {
    const onHoverChange = vi.fn();
    const { container } = render(<ModernRate allowHalf count={5} onHoverChange={onHoverChange} />);

    const third = stars(container)[2];
    const halfHit = third.querySelector('[data-part="star-half-hit"]') as HTMLElement;

    fireEvent.mouseEnter(third);
    fireEvent.mouseEnter(halfHit);
    expect(onHoverChange).toHaveBeenLastCalledWith(2.5);

    // The pointer slides right, out of the half zone but still on the star.
    fireEvent.mouseLeave(halfHit);
    expect(onHoverChange).toHaveBeenLastCalledWith(3);
    expect(third.getAttribute('data-state')).toBe('full');
  });

  it('still clears the preview when the pointer leaves the star entirely', () => {
    const onHoverChange = vi.fn();
    const { container } = render(<ModernRate allowHalf count={5} onHoverChange={onHoverChange} />);

    const third = stars(container)[2];
    const halfHit = third.querySelector('[data-part="star-half-hit"]') as HTMLElement;

    fireEvent.mouseEnter(third);
    fireEvent.mouseEnter(halfHit);
    // Leaving outward fires the child's mouseleave first, then the star's.
    fireEvent.mouseLeave(halfHit);
    fireEvent.mouseLeave(third);

    expect(onHoverChange).toHaveBeenLastCalledWith(0);
    expect(container.querySelector('[data-part="root"]')?.getAttribute('data-previewing')).toBeNull();
  });

  it('does not preview at all on a readOnly widget', () => {
    const onHoverChange = vi.fn();
    const { container } = render(<ModernRate allowHalf readOnly count={5} onHoverChange={onHoverChange} />);

    const third = stars(container)[2];
    const halfHit = third.querySelector('[data-part="star-half-hit"]') as HTMLElement;
    fireEvent.mouseEnter(halfHit);
    fireEvent.mouseLeave(halfHit);

    expect(onHoverChange).not.toHaveBeenCalled();
  });
});
