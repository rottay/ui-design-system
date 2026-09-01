import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSegmented from '../engines/modern';

describe('Segmented modern engine re-selection', () => {
  it('does not fire onChange when the already-selected option is clicked', () => {
    const onChange = vi.fn();
    render(
      <ModernSegmented
        options={['List', 'Grid']}
        value="List"
        onChange={onChange}
        ariaLabel="View mode"
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: 'List' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not fire onChange when an uncontrolled default is re-clicked', () => {
    const onChange = vi.fn();
    render(
      <ModernSegmented
        options={['List', 'Grid']}
        defaultValue="Grid"
        onChange={onChange}
        ariaLabel="View mode"
      />
    );

    const grid = screen.getByRole('radio', { name: 'Grid' });
    fireEvent.click(grid);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('radio', { name: 'List' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('List');
  });

  it('still fires onChange for every genuine change', () => {
    const onChange = vi.fn();
    render(
      <ModernSegmented
        options={['A', 'B', 'C']}
        defaultValue="A"
        onChange={onChange}
        ariaLabel="Letters"
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    fireEvent.click(screen.getByRole('radio', { name: 'C' }));
    fireEvent.click(screen.getByRole('radio', { name: 'A' }));

    expect(onChange.mock.calls.map(([value]) => value)).toEqual(['B', 'C', 'A']);
  });

  it('keeps the first selection of an initially empty control', () => {
    const onChange = vi.fn();
    render(
      <ModernSegmented options={['A', 'B']} onChange={onChange} ariaLabel="Letters" />
    );

    fireEvent.click(screen.getByRole('radio', { name: 'A' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('A');
  });
});
