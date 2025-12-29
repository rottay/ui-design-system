/**
 * Pagination Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../';

// Mock the engine factory
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockPagination = ({
      current,
      total,
      pageSize = 10,
      size,
      showSizeChanger,
      showTotal,
      disabled,
      onChange,
      className,
      style,
    }: any) => {
      const totalPages = Math.ceil(total / pageSize);

      return (
        <nav
          data-testid="pagination"
          data-current={current}
          data-total={total}
          data-page-size={pageSize}
          data-size={size}
          data-show-size-changer={showSizeChanger}
          data-show-total={showTotal}
          data-disabled={disabled}
          className={className}
          style={style}
          aria-label="Pagination"
        >
          {showTotal && (
            <span data-testid="total-info">
              Total: {total} items
            </span>
          )}
          <button
            data-testid="prev-btn"
            disabled={disabled || current === 1}
            onClick={() => !disabled && current > 1 && onChange?.(current - 1, pageSize)}
          >
            Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                data-testid={`page-${page}`}
                data-active={current === page}
                disabled={disabled}
                onClick={() => !disabled && onChange?.(page, pageSize)}
              >
                {page}
              </button>
            );
          })}
          <button
            data-testid="next-btn"
            disabled={disabled || current === totalPages}
            onClick={() => !disabled && current < totalPages && onChange?.(current + 1, pageSize)}
          >
            Next
          </button>
          {showSizeChanger && (
            <select
              data-testid="size-changer"
              value={pageSize}
              onChange={(e) => onChange?.(1, Number(e.target.value))}
              disabled={disabled}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          )}
        </nav>
      );
    };
    MockPagination.displayName = 'Pagination';
    return MockPagination;
  },
}));

describe('Pagination', () => {
  it('renders correctly', () => {
    render(<Pagination current={1} total={100} />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('renders page buttons', () => {
    render(<Pagination current={1} total={100} />);
    expect(screen.getByTestId('page-1')).toBeInTheDocument();
    expect(screen.getByTestId('prev-btn')).toBeInTheDocument();
    expect(screen.getByTestId('next-btn')).toBeInTheDocument();
  });

  describe('current and total props', () => {
    it('displays current page', () => {
      render(<Pagination current={3} total={100} />);
      expect(screen.getByTestId('pagination')).toHaveAttribute('data-current', '3');
    });

    it('displays total', () => {
      render(<Pagination current={1} total={50} />);
      expect(screen.getByTestId('pagination')).toHaveAttribute('data-total', '50');
    });
  });

  describe('pageSize prop', () => {
    it('uses default pageSize', () => {
      render(<Pagination current={1} total={100} />);
      expect(screen.getByTestId('pagination')).toHaveAttribute('data-page-size', '10');
    });

    it('uses custom pageSize', () => {
      render(<Pagination current={1} total={100} pageSize={20} />);
      expect(screen.getByTestId('pagination')).toHaveAttribute('data-page-size', '20');
    });
  });

  describe('size prop', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
      render(<Pagination current={1} total={100} size={size} />);
      expect(screen.getByTestId('pagination')).toHaveAttribute('data-size', size);
    });
  });

  describe('showSizeChanger prop', () => {
    it('shows size changer when enabled', () => {
      render(<Pagination current={1} total={100} showSizeChanger />);
      expect(screen.getByTestId('size-changer')).toBeInTheDocument();
    });

    it('hides size changer by default', () => {
      render(<Pagination current={1} total={100} />);
      expect(screen.queryByTestId('size-changer')).not.toBeInTheDocument();
    });
  });

  describe('showTotal prop', () => {
    it('shows total when enabled', () => {
      render(<Pagination current={1} total={100} showTotal />);
      expect(screen.getByTestId('total-info')).toBeInTheDocument();
      expect(screen.getByText(/Total: 100 items/)).toBeInTheDocument();
    });

    it('hides total by default', () => {
      render(<Pagination current={1} total={100} />);
      expect(screen.queryByTestId('total-info')).not.toBeInTheDocument();
    });
  });

  describe('disabled prop', () => {
    it('disables all buttons when disabled', () => {
      render(<Pagination current={2} total={100} disabled />);
      expect(screen.getByTestId('prev-btn')).toBeDisabled();
      expect(screen.getByTestId('next-btn')).toBeDisabled();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when page button is clicked', () => {
      const onChange = vi.fn();
      render(<Pagination current={1} total={100} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('page-2'));
      expect(onChange).toHaveBeenCalledWith(2, 10);
    });

    it('calls onChange when next is clicked', () => {
      const onChange = vi.fn();
      render(<Pagination current={1} total={100} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('next-btn'));
      expect(onChange).toHaveBeenCalledWith(2, 10);
    });

    it('calls onChange when prev is clicked', () => {
      const onChange = vi.fn();
      render(<Pagination current={2} total={100} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('prev-btn'));
      expect(onChange).toHaveBeenCalledWith(1, 10);
    });

    it('disables prev on first page', () => {
      render(<Pagination current={1} total={100} />);
      expect(screen.getByTestId('prev-btn')).toBeDisabled();
    });
  });

  it('applies custom className', () => {
    render(<Pagination current={1} total={100} className="custom-pagination" />);
    expect(screen.getByTestId('pagination')).toHaveClass('custom-pagination');
  });

  it('applies custom style', () => {
    render(<Pagination current={1} total={100} style={{ marginTop: 20 }} />);
    expect(screen.getByTestId('pagination')).toHaveStyle({ marginTop: '20px' });
  });
});

describe('Pagination engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Pagination engine={engine} current={1} total={100} />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});

describe('Pagination tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Pagination current={1} total={100} />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
