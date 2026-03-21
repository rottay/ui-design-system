import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPagination from './engines/modern';
import RusticPagination from './engines/rustic';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

describe('Pagination engine advanced coverage', () => {
  it('renders ellipsis and respects navigation boundaries in the modern engine', () => {
    const onChange = vi.fn();

    renderWithEngine(
      <ModernPagination
        current={6}
        total={200}
        pageSize={10}
        showTotal
        size="lg"
        onChange={onChange}
      />,
      'modern'
    );

    expect(screen.getByText('Total 200 items')).toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: '«' }));
    fireEvent.click(screen.getByRole('button', { name: '7' }));
    fireEvent.click(screen.getByRole('button', { name: '»' }));

    expect(onChange).toHaveBeenNthCalledWith(1, 5, 10);
    expect(onChange).toHaveBeenNthCalledWith(2, 7, 10);
    expect(onChange).toHaveBeenNthCalledWith(3, 7, 10);
  });

  it('blocks navigation when disabled and exposes active state styling in the rustic engine', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithEngine(
      <RusticPagination
        current={1}
        total={100}
        pageSize={10}
        disabled
        onChange={onChange}
      />,
      'rustic'
    );

    fireEvent.click(screen.getByRole('button', { name: '»' }));
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <RusticPagination
        current={5}
        total={100}
        pageSize={10}
        showTotal
        size="sm"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Total 100 items')).toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);

    const activeButton = screen.getByRole('button', { name: '5' });
    expect(activeButton.getAttribute('style') ?? '').toContain('var(--ds-pagination-active-bg');

    fireEvent.click(screen.getByRole('button', { name: '«' }));
    fireEvent.click(screen.getByRole('button', { name: '10' }));

    expect(onChange).toHaveBeenNthCalledWith(1, 4, 10);
    expect(onChange).toHaveBeenNthCalledWith(2, 10, 10);
  });
});
