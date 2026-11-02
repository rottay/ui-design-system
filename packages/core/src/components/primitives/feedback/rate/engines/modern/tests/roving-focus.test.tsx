import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('Modern Rate star focus storage', () => {
  it('focuses the star a half-hit click falls on', () => {
    const onChange = vi.fn();
    render(<ModernRate allowHalf defaultValue={0} onChange={onChange} />);

    const third = screen.getByRole('radio', { name: '3 stars' });
    const halfHit = third.querySelector('[data-part="star-half-hit"]');
    if (!halfHit) throw new Error('the third star has no half-hit zone');
    fireEvent.click(halfHit);

    expect(onChange).toHaveBeenLastCalledWith(2.5);
    expect(document.activeElement).toBe(third);
  });

  it('moves no focus on autoFocus when a fractional count has no star for the value', () => {
    render(<ModernRate count={2.5} defaultValue={3} autoFocus />);

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps focus on the first star when End reaches a fractional count', () => {
    const onChange = vi.fn();
    render(<ModernRate count={2.5} defaultValue={1} onChange={onChange} />);

    const first = screen.getByRole('radio', { name: '1 star' });
    const second = screen.getByRole('radio', { name: '2 stars' });
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'End' });

    expect(onChange).toHaveBeenLastCalledWith(2.5);
    expect(document.activeElement).toBe(first);
    expect(document.activeElement).not.toBe(second);
  });

  it('renders no star and moves no focus for an empty count', () => {
    for (const count of [0, -1, NaN]) {
      const { unmount } = render(<ModernRate count={count} defaultValue={1} autoFocus />);

      expect(screen.queryAllByRole('radio')).toHaveLength(0);
      expect(document.activeElement).toBe(document.body);
      unmount();
    }
  });

  it('focuses the remounted last star after the count shrinks and grows back', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ModernRate count={5} defaultValue={1} onChange={onChange} />);
    const originalFifth = screen.getByRole('radio', { name: '5 stars' });
    rerender(<ModernRate count={3} defaultValue={1} onChange={onChange} />);
    rerender(<ModernRate count={5} defaultValue={1} onChange={onChange} />);

    const first = screen.getByRole('radio', { name: '1 star' });
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'End' });

    const fifth = screen.getByRole('radio', { name: '5 stars' });
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(fifth).not.toBe(originalFifth);
    expect(document.activeElement).toBe(fifth);
  });

  it('keeps keyboard focus on live integer stars after the count shrinks', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ModernRate count={5} defaultValue={5} onChange={onChange} />);
    rerender(<ModernRate count={3} defaultValue={5} onChange={onChange} />);

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    const third = tabbableStar();
    expect(third).toBe(screen.getByRole('radio', { name: '3 stars' }));
    act(() => {
      third.focus();
    });

    fireEvent.keyDown(third, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(document.activeElement).toBe(third);

    fireEvent.keyDown(third, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '2 stars' }));
  });
});
