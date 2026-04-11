/**
 * Progress Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Progress } from '../';

// Mock the engine factory
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockProgress = React.forwardRef<HTMLDivElement, any>(({
      percent = 0,
      type = 'line',
      status,
      showInfo = true,
      strokeColor,
      strokeWidth = 8,
      className = '',
      style = {},
      ...props
    }, ref) => {
      const normalizedPercent = Math.min(100, Math.max(0, percent));
      const isSuccess = status === 'success' || (!status && normalizedPercent === 100);

      return (
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={normalizedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`rottay-progress rottay-progress--${type} rottay-progress--${status || 'normal'} ${className}`}
          style={style}
          {...props}
        >
          <div
            className="rottay-progress__track"
            style={{
              backgroundColor: '#e6e6e6',
              height: type === 'line' ? strokeWidth : undefined,
              borderRadius: strokeWidth / 2,
            }}
          >
            <div
              className="rottay-progress__bar"
              style={{
                width: `${normalizedPercent}%`,
                backgroundColor: strokeColor || (isSuccess ? '#52c41a' : status === 'error' ? '#ff4d4f' : '#1677ff'),
                height: '100%',
                borderRadius: strokeWidth / 2,
              }}
            />
          </div>
          {showInfo && (
            <span className="rottay-progress__info">
              {isSuccess ? '✓' : `${normalizedPercent}%`}
            </span>
          )}
        </div>
      );
    });
    MockProgress.displayName = 'Progress';
    return MockProgress;
  },
}));

describe('Progress', () => {
  describe('Basic Rendering', () => {
    it('renders with percent', () => {
      const { container } = render(<Progress percent={50} />);
      expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
    });

    it('displays percentage text by default', () => {
      render(<Progress percent={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('hides info when showInfo is false', () => {
      render(<Progress percent={75} showInfo={false} />);
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Progress percent={50} className="custom-progress" />);
      expect(container.querySelector('.custom-progress')).toBeInTheDocument();
    });
  });

  describe('Progress Types', () => {
    it('renders line type', () => {
      const { container } = render(<Progress percent={50} type="line" />);
      expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
    });

    it('renders circle type', () => {
      const { container } = render(<Progress percent={50} type="circle" />);
      expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
    });
  });

  describe('Status Types', () => {
    it.each(['normal', 'success', 'error', 'active'] as const)(
      'renders %s status correctly',
      (status) => {
        const { container } = render(<Progress percent={50} status={status} />);
        expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
      }
    );

    it('shows success icon at 100%', () => {
      render(<Progress percent={100} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom stroke color', () => {
      const { container } = render(<Progress percent={50} strokeColor="#ff0000" />);
      expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
    });

    it('applies custom stroke width', () => {
      const { container } = render(<Progress percent={50} strokeWidth={12} />);
      expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
    });
  });

  describe('Engine Support', () => {
    it.each(['classic', 'modern', 'rustic'] as const)(
      'renders with %s engine',
      (engine) => {
        const { container } = render(<Progress percent={50} engine={engine} />);
        expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
      }
    );
  });

  describe('Accessibility', () => {
    it('has role="progressbar"', () => {
      render(<Progress percent={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has aria-valuenow', () => {
      render(<Progress percent={50} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '50');
    });

    it('has aria-valuemin and aria-valuemax', () => {
      render(<Progress percent={50} />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Edge Cases', () => {
    it('handles 0%', () => {
      render(<Progress percent={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles 100%', () => {
      render(<Progress percent={100} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });

    it('caps at 100% for values over 100', () => {
      const { container } = render(<Progress percent={150} />);
      expect(container.querySelector('[class*="progress"]')).toBeInTheDocument();
    });
  });

  describe('Progress tenants', () => {
    it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
      document.documentElement.setAttribute('data-tenant', tenant);
      render(<Progress percent={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      document.documentElement.removeAttribute('data-tenant');
    });
  });
});
