/**
 * Mark semantics for the modern Slider.
 *
 * `step={null}` is the contract's mark-ladder mode -- only mark values are
 * legal -- and the engine coerced it away with `step || 1`, handing back a
 * free continuous slider in which the marks were pure decoration. The thumb
 * also announced the raw number while parked on a mark whose label was the
 * scale the user could read, and a non-numeric mark key reached the geometry
 * math and stamped a `NaN%` offset.
 *
 * @module Slider/tests
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSlider from '../engines/modern';

const MARKS = { 0: 'Low', 40: 'Mid', 100: 'High' };

describe('Slider modern mark ladder', () => {
  it('announces the mark label the user can read, not the bare number', () => {
    render(<ModernSlider min={0} max={100} defaultValue={40} marks={MARKS} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Mid');
  });

  it('leaves aria-valuetext off between marks', () => {
    render(<ModernSlider min={0} max={100} defaultValue={41} marks={MARKS} />);
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-valuetext');
  });

  it('lets an explicit tooltip formatter outrank the mark label', () => {
    render(
      <ModernSlider
        min={0}
        max={100}
        defaultValue={40}
        marks={MARKS}
        tooltip={{ formatter: (value) => `${value}%` }}
      />
    );
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '40%');
  });

  it('walks the ladder one mark per key under step={null}', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider min={0} max={100} step={null} defaultValue={0} marks={MARKS} onChange={onChange} />
    );

    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    // The native +1 step would have landed on 1 and snapped straight back to 0.
    expect(onChange).toHaveBeenLastCalledWith(40);

    fireEvent.keyDown(thumb, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('snaps a dragged value onto the ladder under step={null}', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider min={0} max={100} step={null} defaultValue={0} marks={MARKS} onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('slider'), { target: { value: '55' } });
    expect(onChange).toHaveBeenLastCalledWith(40);
  });

  it('keeps a numeric step continuous', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider min={0} max={100} step={1} defaultValue={0} marks={MARKS} onChange={onChange} />
    );

    fireEvent.change(screen.getByRole('slider'), { target: { value: '55' } });
    expect(onChange).toHaveBeenLastCalledWith(55);
  });

  it('walks the ladder per handle in range mode', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider
        range
        min={0}
        max={100}
        step={null}
        defaultValue={[0, 100]}
        marks={MARKS}
        onChange={onChange}
      />
    );

    fireEvent.keyDown(screen.getAllByRole('slider')[1]!, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith([0, 40]);
  });

  it('drops a mark key that names no point on the scale', () => {
    const { container } = render(
      <ModernSlider min={0} max={100} defaultValue={0} marks={{ 0: 'Low', auto: 'Broken' } as never} />
    );

    const labels = container.querySelectorAll('[data-part="mark-label"]');
    expect(labels).toHaveLength(1);
    expect(labels[0]).toHaveTextContent('Low');
    for (const label of labels) {
      expect((label as HTMLElement).getAttribute('style')).not.toContain('NaN');
    }
  });
});
