import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernRate from '../index';

const tabbableStar = () =>
  screen.getAllByRole('radio').find((node) => node.getAttribute('tabindex') === '0') as HTMLElement;

/**
 * SC-3 adoption contract. Rate navigates a VALUE, so the family keeps the step
 * and the kernel owns only the key-to-direction mapping. The RTL horizontal
 * pair had no test before the kernel took ownership of the mirror.
 */
describe('Modern Rate roving focus', () => {
  it('mirrors the horizontal pair under direction="rtl"', () => {
    const onChange = vi.fn();
    render(<ModernRate defaultValue={3} direction="rtl" onChange={onChange} />);

    // The fill leads from the right edge, so ArrowRight lowers the value.
    fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(2);

    fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('keeps the horizontal pair unmirrored in LTR', () => {
    const onChange = vi.fn();
    render(<ModernRate defaultValue={3} onChange={onChange} />);

    fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(4);

    fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('mirrors the direction, never the family-owned half step', () => {
    const onChange = vi.fn();
    render(<ModernRate allowHalf defaultValue={3} direction="rtl" onChange={onChange} />);

    fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(2.5);

    fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('clamps the mirrored pair at both ends', () => {
    const onChange = vi.fn();
    render(<ModernRate defaultValue={0} count={5} direction="rtl" onChange={onChange} />);

    fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(0);

    fireEvent.keyDown(tabbableStar(), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('leaves keys it does not own to the host', () => {
    const onChange = vi.fn();
    render(<ModernRate defaultValue={3} onChange={onChange} />);

    expect(fireEvent.keyDown(tabbableStar(), { key: 'PageUp' })).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
});
