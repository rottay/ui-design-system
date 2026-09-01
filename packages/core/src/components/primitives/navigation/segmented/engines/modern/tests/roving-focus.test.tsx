import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSegmented from '../index';

const radio = (name: string) => screen.getByRole('radio', { name });

/**
 * SC-3 adoption contract. The pinned radiogroup behavior lives in
 * `Segmented.modern-engine.test.tsx`; this file covers the axes the kernel
 * newly answers for and that no test reached before.
 */
describe('Modern Segmented roving focus', () => {
  it('walks the vertical axis, which stays direction-neutral in RTL', () => {
    const onChange = vi.fn();
    render(
      <div dir="rtl">
        <ModernSegmented options={['A', 'B', 'C']} defaultValue="A" onChange={onChange} />
      </div>
    );

    // The horizontal pair mirrors under RTL; the vertical pair never does.
    fireEvent.keyDown(radio('A'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('B');
    expect(radio('B')).toHaveFocus();

    fireEvent.keyDown(radio('B'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith('A');
  });

  it('wraps the vertical axis in both directions', () => {
    const onChange = vi.fn();
    render(<ModernSegmented options={['A', 'B', 'C']} defaultValue="A" onChange={onChange} />);

    fireEvent.keyDown(radio('A'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith('C');

    fireEvent.keyDown(radio('C'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('A');
  });

  it('keeps Home and End direction-neutral under RTL', () => {
    const onChange = vi.fn();
    render(
      <div dir="rtl">
        <ModernSegmented options={['A', 'B', 'C']} defaultValue="B" onChange={onChange} />
      </div>
    );

    fireEvent.keyDown(radio('B'), { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('A');

    fireEvent.keyDown(radio('A'), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('C');
  });

  it('leaves keys it does not own to the host', () => {
    const onChange = vi.fn();
    render(<ModernSegmented options={['A', 'B']} defaultValue="A" onChange={onChange} />);

    expect(fireEvent.keyDown(radio('A'), { key: 'PageDown' })).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('holds the single tab stop when the selected value is not an option', () => {
    render(<ModernSegmented options={['A', 'B', 'C']} value="missing" />);

    const stops = screen.getAllByRole('radio').filter((el) => el.tabIndex === 0);
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(radio('A'));
  });
});


/**
 * LOCALE FLIP ON A LIVE TREE.
 *
 * Both halves of a direction change are covered here, because they are separate
 * mechanisms and each one was broken independently.
 *
 * The KEYBOARD half lived in the shared roving-focus kernel, which captured
 * reading direction into a ref on the first navigation and never recomputed it.
 * Navigate once in LTR, flip an ancestor to `dir="rtl"` on the SAME mounted
 * tree, and the horizontal arrows kept the stale mapping — nothing remounts, so
 * nothing re-captured. Its pure resolver was always correct; only the caching
 * was not. The law now resolves direction at the start of every interaction.
 *
 * The REVEAL half is asserted in `reveal.test.tsx`. Together they matter more
 * than separately: with only the reveal fixed, the option scrolled into view at
 * the correct mirrored position while the arrow that reached it still pointed
 * the wrong way.
 *
 * These assertions were briefly carried as an `.fails` test plus a pin on the
 * WRONG behaviour, as scaffolding while the shared fix was adjudicated. Both
 * were deleted in the same change that corrected the kernel: a certified round
 * may not ship either, and a pin on wrong behaviour that outlives its defect
 * becomes a test defending the bug.
 */
describe('Modern Segmented keyboard direction after a live locale flip', () => {
  const tree = (dir: 'ltr' | 'rtl', onChange: (value: string | number) => void) => (
    <div dir={dir}>
      <ModernSegmented
        ariaLabel="Stage"
        options={['A', 'B', 'C']}
        defaultValue="B"
        onChange={onChange}
      />
    </div>
  );

  it('mirrors the horizontal arrows after an ancestor flips to RTL', () => {
    const onChange = vi.fn();
    const { rerender } = render(tree('ltr', onChange));

    // This first navigation is what the old law CAPTURED direction on.
    fireEvent.keyDown(radio('B'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('C');

    rerender(tree('rtl', onChange));

    // Under RTL the horizontal pair mirrors, so ArrowRight is PREVIOUS. With a
    // cached LTR direction this advanced and wrapped to 'A' instead.
    fireEvent.keyDown(radio('C'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('B');
  });

  it('mirrors back when the ancestor returns to LTR', () => {
    // A one-way fix would pass the test above and still strand anyone switching
    // back, so the return trip is asserted rather than assumed symmetric.
    const onChange = vi.fn();
    const { rerender } = render(tree('rtl', onChange));

    fireEvent.keyDown(radio('B'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('A');

    rerender(tree('ltr', onChange));

    fireEvent.keyDown(radio('A'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('B');
  });

  it('resolves direction correctly when the tree mounts already RTL', () => {
    // The capture was only ever wrong when it was STALE. Mounting in RTL and
    // never flipping always resolved correctly, which is why every pre-existing
    // RTL test passed and none of them reached the defect.
    const onChange = vi.fn();
    render(tree('rtl', onChange));

    fireEvent.keyDown(radio('B'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('A');
  });
});
