import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPagination from '../engines/modern';

/**
 * New-contract coverage for `showQuickJumper`, `simple`, `pageSizeOptions`,
 * `onShowSizeChange`, `siblingCount` and `boundaryCount`. Non-regression for
 * the rest of the family lives in `Pagination.modern-engine.test.tsx` and
 * `Pagination.engine-advanced.test.tsx` (untouched).
 */
describe('Modern Pagination quick jumper (showQuickJumper)', () => {
  it('commits a clamped page on Enter and clears the buffer', () => {
    const onChange = vi.fn();
    render(
      <ModernPagination current={3} total={200} pageSize={10} showQuickJumper onChange={onChange} />
    );

    const jumper = screen.getByRole('textbox', { name: 'Go to page' }) as HTMLInputElement;
    fireEvent.change(jumper, { target: { value: '999' } });
    fireEvent.keyDown(jumper, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(20, 10); // clamped to totalPages
    expect(jumper.value).toBe('');
  });

  it('commits on blur too, clamping a sub-1 value up to 1', () => {
    const onChange = vi.fn();
    render(
      <ModernPagination current={3} total={200} pageSize={10} showQuickJumper onChange={onChange} />
    );

    const jumper = screen.getByRole('textbox', { name: 'Go to page' }) as HTMLInputElement;
    fireEvent.change(jumper, { target: { value: '-5' } });
    fireEvent.blur(jumper);

    expect(onChange).toHaveBeenCalledWith(1, 10);
  });

  it('ignores an empty or non-numeric value without calling onChange', () => {
    const onChange = vi.fn();
    render(
      <ModernPagination current={3} total={200} pageSize={10} showQuickJumper onChange={onChange} />
    );

    const jumper = screen.getByRole('textbox', { name: 'Go to page' }) as HTMLInputElement;

    fireEvent.blur(jumper); // empty
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(jumper, { target: { value: 'abc' } });
    fireEvent.blur(jumper);
    expect(onChange).not.toHaveBeenCalled();
    expect(jumper.value).toBe('');
  });

  it('is absent by default', () => {
    render(<ModernPagination current={1} total={200} pageSize={10} />);
    expect(screen.queryByRole('textbox', { name: 'Go to page' })).toBeNull();
  });
});

describe('Modern Pagination simple mode', () => {
  it('replaces the page-button cluster with a current/total readout, keeping prev/next real', () => {
    render(<ModernPagination current={3} total={200} pageSize={10} simple />);

    expect(screen.getByText('Page 3 of 20')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '3' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toHaveAttribute('data-simple', 'true');
  });

  it('stays orthogonal to showTotal and showSizeChanger', () => {
    render(<ModernPagination current={1} total={200} pageSize={10} simple showTotal showSizeChanger />);
    expect(screen.getByText('Total 200 items')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('is off by default', () => {
    render(<ModernPagination current={1} total={200} pageSize={10} />);
    expect(screen.getByRole('navigation')).not.toHaveAttribute('data-simple');
  });
});

describe('Modern Pagination pageSizeOptions', () => {
  it('replaces the default 10/20/50/100 set when supplied', () => {
    render(
      <ModernPagination current={1} total={500} pageSize={25} showSizeChanger pageSizeOptions={[25, 75, 150]} />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const values = Array.from(select.options).map((option) => Number(option.value));
    expect(values).toEqual([25, 75, 150]);
  });

  it('merges the active pageSize in when it is not in the list', () => {
    render(
      <ModernPagination current={1} total={500} pageSize={40} showSizeChanger pageSizeOptions={[25, 75, 150]} />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const values = Array.from(select.options).map((option) => Number(option.value));
    expect(values).toEqual([25, 40, 75, 150]);
  });

  it('falls back to the conventional 10/20/50/100 set when absent', () => {
    render(<ModernPagination current={1} total={500} pageSize={10} showSizeChanger />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const values = Array.from(select.options).map((option) => Number(option.value));
    expect(values).toEqual([10, 20, 50, 100]);
  });
});

describe('Modern Pagination onShowSizeChange', () => {
  it('fires alongside onChange with the RE-CLAMPED current, while onChange keeps resetting to page 1', () => {
    const onChange = vi.fn();
    const onShowSizeChange = vi.fn();
    // current=15 at pageSize=10 -> 50 pages; switching to pageSize=50 -> 10
    // pages, so the previous current (15) re-clamps to 10.
    render(
      <ModernPagination
        current={15}
        total={500}
        pageSize={10}
        showSizeChanger
        onChange={onChange}
        onShowSizeChange={onShowSizeChange}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });

    expect(onChange).toHaveBeenCalledWith(1, 50);
    expect(onShowSizeChange).toHaveBeenCalledWith(10, 50);
  });

  it('re-clamps to 1 when the new total collapses below the previous current', () => {
    const onShowSizeChange = vi.fn();
    render(
      <ModernPagination
        current={4}
        total={40}
        pageSize={10}
        showSizeChanger
        pageSizeOptions={[10, 100]}
        onShowSizeChange={onShowSizeChange}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '100' } });

    expect(onShowSizeChange).toHaveBeenCalledWith(1, 100);
  });

  it('does not fire when the size does not actually change', () => {
    const onShowSizeChange = vi.fn();
    render(
      <ModernPagination
        current={1}
        total={100}
        pageSize={10}
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });
    expect(onShowSizeChange).not.toHaveBeenCalled();
  });
});

describe('Modern Pagination siblingCount / boundaryCount', () => {
  it('defaults (1/1) reproduce the original fixed window exactly', () => {
    // Same fixture as the family's existing non-regression coverage: total=20
    // pages, current=6 -> [1, ..., 5, 6, 7, ..., 20], 2 ellipses.
    render(<ModernPagination current={6} total={200} pageSize={10} />);
    for (const label of ['1', '5', '6', '7', '20']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(screen.getAllByText('...')).toHaveLength(2);
  });

  it('a wider siblingCount widens the window kept around the current page', () => {
    render(<ModernPagination current={6} total={200} pageSize={10} siblingCount={3} />);
    // window becomes [1, ..., 3,4,5,6,7,8,9, ..., 20]
    for (const label of ['3', '4', '5', '6', '7', '8', '9']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('a wider boundaryCount widens the fixed anchor kept at each end', () => {
    render(<ModernPagination current={10} total={200} pageSize={10} boundaryCount={2} />);
    for (const label of ['1', '2', '19', '20']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('shows every page without an ellipsis once the full range fits the boundary+sibling window', () => {
    // fullRangeThreshold = boundaryCount*2 + siblingCount*2 + 1 = 2*2+2*2+1 = 9
    render(<ModernPagination current={4} total={90} pageSize={10} siblingCount={2} boundaryCount={2} />);
    expect(screen.queryByText('...')).toBeNull();
    for (let page = 1; page <= 9; page += 1) {
      expect(screen.getByRole('button', { name: String(page) })).toBeInTheDocument();
    }
  });
});
