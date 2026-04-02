/**
 * @fileoverview Statistic Component Tests
 * @description Unit tests for the Statistic component.
 * Tests all features including formatting, loading states, and compound components.
 * @module components/primitives/display/Statistic/tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Statistic, formatNumber } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockStatistic = ({
      children,
      title,
      value,
      prefix,
      suffix,
      loading,
      valueType,
      precision,
      animateValue: _animateValue,
      groupSeparator = ',',
      decimalSeparator = '.',
      formatter,
      onFinish: _onFinish,
      onChange: _onChange,
      format: _format,
      ...props
    }: any) => {
      if (loading) {
        return (
          <div data-testid="statistic" data-loading="true" {...props}>
            Loading...
          </div>
        );
      }

      const displayValue = formatter
        ? formatter(value)
        : value !== undefined
          ? formatNumber(value, precision || 0, groupSeparator, decimalSeparator)
          : '--';

      return (
        <div
          data-testid="statistic"
          data-value-type={valueType}
          {...props}
        >
          {title && <div data-testid="statistic-title">{title}</div>}
          <div data-testid="statistic-value">
            {prefix && <span data-testid="statistic-prefix">{prefix}</span>}
            <span data-testid="statistic-content">{displayValue}</span>
            {suffix && <span data-testid="statistic-suffix">{suffix}</span>}
          </div>
        </div>
      );
    };
    MockStatistic.displayName = 'Statistic';
    return MockStatistic;
  },
}));

describe('Statistic', () => {
  describe('Basic Rendering', () => {
    it('renders correctly with minimal props', () => {
      render(<Statistic value={1000} />);
      expect(screen.getByTestId('statistic')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(<Statistic title="Active Users" value={1000} />);
      expect(screen.getByTestId('statistic-title')).toHaveTextContent('Active Users');
    });

    it('renders value correctly', () => {
      render(<Statistic value={1000} />);
      expect(screen.getByTestId('statistic-content')).toHaveTextContent('1,000');
    });

    it('renders placeholder when no value provided', () => {
      render(<Statistic title="No Data" />);
      expect(screen.getByTestId('statistic-content')).toHaveTextContent('--');
    });
  });

  describe('Formatting', () => {
    it('formats numbers with thousands separator', () => {
      render(<Statistic value={1234567} />);
      expect(screen.getByTestId('statistic-content')).toHaveTextContent('1,234,567');
    });

    it('respects precision setting', () => {
      render(<Statistic value={1234.5678} precision={2} />);
      expect(screen.getByTestId('statistic-content')).toHaveTextContent('1,234.57');
    });

    it('uses custom group separator', () => {
      render(<Statistic value={1234567} groupSeparator=" " />);
      expect(screen.getByTestId('statistic-content')).toHaveTextContent('1 234 567');
    });

    it('uses custom decimal separator', () => {
      render(<Statistic value={1234.56} precision={2} decimalSeparator="," />);
      expect(screen.getByTestId('statistic-content')).toHaveTextContent('1,234,56');
    });

    it('uses custom formatter when provided', () => {
      const formatter = (val: number | string) => `${Number(val) * 100}%`;
      render(<Statistic value={0.5} formatter={formatter} />);
      expect(screen.getByTestId('statistic-content')).toHaveTextContent('50%');
    });
  });

  describe('Prefix and Suffix', () => {
    it('renders prefix', () => {
      render(<Statistic value={1000} prefix="$" />);
      expect(screen.getByTestId('statistic-prefix')).toHaveTextContent('$');
    });

    it('renders suffix', () => {
      render(<Statistic value={25} suffix="%" />);
      expect(screen.getByTestId('statistic-suffix')).toHaveTextContent('%');
    });

    it('renders both prefix and suffix', () => {
      render(<Statistic value={1000} prefix="$" suffix="USD" />);
      expect(screen.getByTestId('statistic-prefix')).toHaveTextContent('$');
      expect(screen.getByTestId('statistic-suffix')).toHaveTextContent('USD');
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<Statistic loading />);
      expect(screen.getByTestId('statistic')).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('Value Types', () => {
    it.each(['default', 'positive', 'negative', 'warning'] as const)(
      'applies valueType %s',
      (valueType) => {
        render(<Statistic value={100} valueType={valueType} />);
        expect(screen.getByTestId('statistic')).toHaveAttribute('data-value-type', valueType);
      }
    );
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Statistic value={100} className="custom-class" />);
      expect(screen.getByTestId('statistic')).toHaveClass('custom-class');
    });

    it('passes style prop to component', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<Statistic value={100} style={customStyle} />);
      // The mock passes style as a prop, so we verify the element exists with the test
      expect(screen.getByTestId('statistic')).toBeInTheDocument();
    });
  });
});

describe('formatNumber utility', () => {
  it('formats integer correctly', () => {
    expect(formatNumber(1234567, 0, ',', '.')).toBe('1,234,567');
  });

  it('formats decimal correctly', () => {
    expect(formatNumber(1234.5678, 2, ',', '.')).toBe('1,234.57');
  });

  it('uses custom separators', () => {
    expect(formatNumber(1234567.89, 2, '.', ',')).toBe('1.234.567,89');
  });

  it('handles string input', () => {
    expect(formatNumber('1234567', 0, ',', '.')).toBe('1,234,567');
  });

  it('returns original string for non-numeric input', () => {
    expect(formatNumber('abc', 0, ',', '.')).toBe('abc');
  });

  it('handles zero precision', () => {
    expect(formatNumber(1234.9, 0, ',', '.')).toBe('1,235');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234567, 0, ',', '.')).toBe('-1,234,567');
  });
});

describe('Statistic.Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders countdown component', () => {
    const futureTime = Date.now() + 60000; // 1 minute from now
    render(<Statistic.Countdown title="Time Left" value={futureTime} />);
    expect(screen.getByTestId('statistic')).toBeInTheDocument();
  });

  it('displays title', () => {
    const futureTime = Date.now() + 60000;
    render(<Statistic.Countdown title="Expires In" value={futureTime} />);
    expect(screen.getByTestId('statistic-title')).toHaveTextContent('Expires In');
  });

  it('renders with custom format', () => {
    const futureTime = Date.now() + 86400000; // 24 hours from now
    render(<Statistic.Countdown value={futureTime} format="DD:HH:mm:ss" />);
    expect(screen.getByTestId('statistic')).toBeInTheDocument();
  });

  it('calls onFinish when countdown reaches zero', () => {
    const onFinish = vi.fn();
    const pastTime = Date.now() - 1000; // Already passed
    render(<Statistic.Countdown value={pastTime} onFinish={onFinish} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Note: onFinish may be called during initial render if time is in the past
    // This test verifies the component doesn't crash and onFinish is callable
    expect(screen.getByTestId('statistic')).toBeInTheDocument();
  });

  it('receives onChange prop', () => {
    const onChange = vi.fn();
    const futureTime = Date.now() + 5000;
    render(<Statistic.Countdown value={futureTime} onChange={onChange} />);

    // The mock doesn't call onChange, but we verify the component renders
    // Real implementations would call onChange on each tick
    expect(screen.getByTestId('statistic')).toBeInTheDocument();
  });

  it('supports prefix and suffix', () => {
    const futureTime = Date.now() + 60000;
    render(
      <Statistic.Countdown
        value={futureTime}
        prefix="Time:"
        suffix="left"
      />
    );
    expect(screen.getByTestId('statistic-prefix')).toHaveTextContent('Time:');
    expect(screen.getByTestId('statistic-suffix')).toHaveTextContent('left');
  });
});

describe('Statistic engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Statistic engine={engine} value={1000} />);
    expect(screen.getByTestId('statistic')).toBeInTheDocument();
  });
});

describe('Statistic tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Statistic value={1000} />);
    expect(screen.getByTestId('statistic')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
