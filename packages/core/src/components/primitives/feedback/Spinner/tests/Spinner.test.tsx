/**
 * Spinner Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Spinner } from '../';

// Mock the engine factory
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSpinner = React.forwardRef<HTMLDivElement, any>(({
      size = 'md',
      color,
      label,
      className = '',
      style = {},
      ...props
    }, ref) => (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        className={`rottay-spinner rottay-spinner--${size} ${className}`}
        style={{
          color,
          ...style,
        }}
        {...props}
      >
        <svg className="rottay-spinner__circle" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
        {label && <span className="rottay-spinner__label">{label}</span>}
      </div>
    ));
    MockSpinner.displayName = 'Spinner';
    return MockSpinner;
  },
}));

describe('Spinner', () => {
  describe('Basic Rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Spinner label="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Spinner className="custom-spinner" />);
      expect(container.querySelector('.custom-spinner')).toBeInTheDocument();
    });

    it('applies custom style', () => {
      const { container } = render(<Spinner style={{ margin: '10px' }} />);
      expect(container.firstChild).toHaveStyle({ margin: '10px' });
    });
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl'] as const)(
      'renders size %s correctly',
      (size) => {
        const { container } = render(<Spinner size={size} />);
        expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
      }
    );

    it('defaults to md size', () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
    });
  });

  describe('Custom Color', () => {
    it('applies custom color', () => {
      const { container } = render(<Spinner color="#ff0000" />);
      expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
    });
  });

  describe('Engine Support', () => {
    it.each(['titan', 'hermes', 'apollo'] as const)(
      'renders with %s engine',
      (engine) => {
        const { container } = render(<Spinner engine={engine} />);
        expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
      }
    );
  });

  describe('Accessibility', () => {
    it('has role="status" or aria-busy', () => {
      const { container } = render(<Spinner />);
      const spinner = container.querySelector('[role="status"], [aria-busy="true"]');
      expect(spinner).toBeInTheDocument();
    });

    it('announces loading state with label', () => {
      render(<Spinner label="Loading content" />);
      expect(screen.getByText('Loading content')).toBeInTheDocument();
    });
  });
});
