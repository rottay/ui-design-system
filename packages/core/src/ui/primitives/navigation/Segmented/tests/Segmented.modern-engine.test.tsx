import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSegmented from '../engines/modern';

/**
 * Real-engine contract for modern Segmented (K3-B Pass 1): zero inline
 * styles, radiogroup semantics, and the hand-rolled roving-tabindex keyboard
 * contract (arrows move AND select, RTL-mirrored, disabled skipped).
 */
describe('Modern Segmented public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(
      <ModernSegmented
        options={['Daily', 'Weekly', 'Monthly']}
        defaultValue="Weekly"
        size="large"
        ariaLabel="Report cadence"
      />
    );

    const root = container.querySelector('.rottay-segmented--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'large');
    expect(root.style.cssText).toBe('');

    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).style.cssText, `${el.getAttribute('data-part')} carries inline style`).toBe('');
    }
  });

  it('is a named radiogroup with radio options and aria-checked', () => {
    render(<ModernSegmented options={['List', 'Grid']} defaultValue="Grid" ariaLabel="View mode" />);

    expect(screen.getByRole('radiogroup', { name: 'View mode' })).toBeInTheDocument();

    const grid = screen.getByRole('radio', { name: 'Grid' });
    expect(grid).toHaveAttribute('aria-checked', 'true');
    expect(grid).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps a single roving tab stop on the selected option', () => {
    render(<ModernSegmented options={['A', 'B', 'C']} defaultValue="B" />);

    const radios = screen.getAllByRole('radio');
    expect(radios.map((el) => el.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('falls back to the first enabled option for the tab stop', () => {
    render(<ModernSegmented options={['A', { label: 'B', value: 'b', disabled: true }, 'C']} />);

    const radios = screen.getAllByRole('radio');
    expect(radios.map((el) => el.tabIndex)).toEqual([0, -1, -1]);
  });

  it('moves focus and selection with Arrow keys, skipping disabled options', () => {
    const onChange = vi.fn();
    render(
      <ModernSegmented
        options={['A', { label: 'B', value: 'b', disabled: true }, 'C', 'D']}
        defaultValue="A"
        onChange={onChange}
      />
    );

    const first = screen.getByRole('radio', { name: 'A' });
    first.focus();

    // ArrowRight skips the disabled B and lands on C, selecting it.
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('C');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'C' }));
    expect(screen.getByRole('radio', { name: 'C' })).toHaveAttribute('aria-checked', 'true');

    // ArrowRight wraps around to A.
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('A');

    // Home / End jump to the edges.
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('D');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('A');
  });

  it('mirrors ArrowLeft/ArrowRight in an RTL context', () => {
    const onChange = vi.fn();
    render(
      <div dir="rtl">
        <ModernSegmented options={['A', 'B', 'C']} defaultValue="A" onChange={onChange} />
      </div>
    );

    const first = screen.getByRole('radio', { name: 'A' });
    first.focus();

    // In RTL, ArrowRight walks backwards in DOM order and wraps to the end.
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('C');

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('A');
  });

  it('keeps click selection and per-option disabled guards intact', () => {
    const onChange = vi.fn();
    render(
      <ModernSegmented
        options={['A', { label: 'B', value: 'b', disabled: true }]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('radio', { name: 'A' }));
    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('selects nothing on arrows when the whole group is disabled', () => {
    const onChange = vi.fn();
    render(<ModernSegmented options={['A', 'B']} disabled onChange={onChange} />);

    const radios = screen.getAllByRole('radio');
    expect(radios.every((el) => el.tabIndex === -1)).toBe(true);

    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
