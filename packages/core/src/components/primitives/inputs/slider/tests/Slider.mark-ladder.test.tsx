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

  it('takes End to the last in-scale stop of the sorted ladder', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider
        min={-100}
        max={100}
        step={null}
        defaultValue={-50}
        marks={{ 150: 'Over', 2.5: 'C', [-10]: 'B', [-50]: 'A' }}
        onChange={onChange}
      />
    );

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(2.5);
  });

  it('steps through the sorted ladder across uneven gaps', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider
        min={-100}
        max={100}
        step={null}
        value={-50}
        marks={{ 2.5: 'C', [-10]: 'B', [-50]: 'A' }}
        onChange={onChange}
      />
    );

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(-10);
  });

  it('moves one stop per page key', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider min={0} max={100} step={null} value={40} marks={MARKS} onChange={onChange} />
    );

    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'PageUp' });
    expect(onChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(thumb, { key: 'PageDown' });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('holds at the ladder ends and swallows the key', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ModernSlider min={0} max={100} step={null} value={100} marks={MARKS} onChange={onChange} />
    );

    expect(fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })).toBe(false);
    expect(fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })).toBe(false);

    rerender(
      <ModernSlider min={0} max={100} step={null} value={0} marks={MARKS} onChange={onChange} />
    );
    expect(fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })).toBe(false);
    expect(fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' })).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('steps from the nearest stop, preferring the lower one on a tie', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ModernSlider min={0} max={100} step={null} value={70} marks={MARKS} onChange={onChange} />
    );

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(0);

    rerender(
      <ModernSlider min={0} max={100} step={null} value={80} marks={MARKS} onChange={onChange} />
    );
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(40);
  });

  it('treats a single in-scale mark as both ends of the ladder', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider
        min={0}
        max={100}
        step={null}
        value={50}
        marks={{ 50: 'Only', 200: 'Over' }}
        onChange={onChange}
      />
    );

    const thumb = screen.getByRole('slider');
    for (const key of ['End', 'Home', 'ArrowRight', 'ArrowLeft']) {
      expect(fireEvent.keyDown(thumb, { key })).toBe(false);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it('leaves value keys to the native input when no mark is in scale', () => {
    render(
      <ModernSlider
        min={0}
        max={100}
        step={null}
        defaultValue={10}
        marks={{ 150: 'Over', [-5]: 'Under' }}
      />
    );

    const thumb = screen.getByRole('slider');
    expect(fireEvent.keyDown(thumb, { key: 'End' })).toBe(true);
    expect(fireEvent.keyDown(thumb, { key: 'ArrowRight' })).toBe(true);
  });

  it('clamps a ladder End on the start handle at the end handle', () => {
    const onChange = vi.fn();
    render(
      <ModernSlider
        range
        min={0}
        max={100}
        step={null}
        value={[0, 40]}
        marks={MARKS}
        onChange={onChange}
      />
    );

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Minimum value' }), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith([40, 40]);

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Maximum value' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith([0, 100]);
  });
});
