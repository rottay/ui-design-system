import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

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
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernSegmented options={['A', 'B', 'C']} defaultValue="A" onChange={onChange} />
      </I18nProvider>
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
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernSegmented options={['A', 'B', 'C']} defaultValue="B" onChange={onChange} />
      </I18nProvider>
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
 * Navigate once in LTR, flip the locale on the SAME mounted tree, and the
 * horizontal arrows kept the stale mapping — nothing remounts, so nothing
 * re-captured. The kernel now reads the i18n authority, so freshness is a
 * property of the source: the provider re-renders every consumer.
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
  const tree = (locale: 'en' | 'ar', onChange: (value: string | number) => void) => (
    <I18nProvider locale={locale} fallbackLocale="en">
      <ModernSegmented
        ariaLabel="Stage"
        options={['A', 'B', 'C']}
        defaultValue="B"
        onChange={onChange}
      />
    </I18nProvider>
  );

  it('mirrors the horizontal arrows after an ancestor flips to RTL', () => {
    const onChange = vi.fn();
    const { rerender } = render(tree('en', onChange));

    // This first navigation is what the old law CAPTURED direction on.
    fireEvent.keyDown(radio('B'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('C');

    rerender(tree('ar', onChange));

    // Under RTL the horizontal pair mirrors, so ArrowRight is PREVIOUS. With a
    // cached LTR direction this advanced and wrapped to 'A' instead.
    fireEvent.keyDown(radio('C'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('B');
  });

  it('mirrors back when the ancestor returns to LTR', () => {
    // A one-way fix would pass the test above and still strand anyone switching
    // back, so the return trip is asserted rather than assumed symmetric.
    const onChange = vi.fn();
    const { rerender } = render(tree('ar', onChange));

    fireEvent.keyDown(radio('B'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('A');

    rerender(tree('en', onChange));

    fireEvent.keyDown(radio('A'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('B');
  });

  it('resolves direction correctly when the tree mounts already RTL', () => {
    // The capture was only ever wrong when it was STALE. Mounting in RTL and
    // never flipping always resolved correctly, which is why every pre-existing
    // RTL test passed and none of them reached the defect.
    const onChange = vi.fn();
    render(tree('ar', onChange));

    fireEvent.keyDown(radio('B'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('A');
  });
});
