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
