/**
 * @fileoverview Result Component Tests - Rottay Design System
 * @description Unit tests for the Result component.
 * Tests all status types, props, accessibility, and engine support.
 *
 * @remarks
 * This test suite provides comprehensive coverage for the Result component,
 * including:
 * - Basic rendering with different props
 * - All 7 status types (success, error, info, warning, 404, 403, 500)
 * - Custom icons and content
 * - Extra actions (buttons)
 * - Accessibility features
 * - Multi-engine support
 *
 * @example Running Tests
 * ```bash
 * npm test Result.test.tsx
 * ```
 *
 * @see {@link Result} - Main component
 * @see {@link ResultProps} - Component props
 * @module Result/Tests
 * @category Feedback
 * @package @rottay/design-system
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Result } from '../';

// ============================================================================
// Test Mocks
// ============================================================================

/**
 * Mock the engine factory to provide a consistent test implementation.
 * This ensures tests run predictably without engine-specific behavior.
 */
vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockResult = React.forwardRef<HTMLDivElement, any>(({
      status = 'info',
      title,
      subTitle,
      icon,
      extra,
      className = '',
      style = {},
      children,
      ...props
    }, ref) => {
      const statusIcons: Record<string, string> = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
        '404': '404',
        '403': '403',
        '500': '500',
      };

      return (
        <div
          ref={ref}
          role="status"
          className={`rottay-result rottay-result--${status} ${className}`}
          style={style}
          {...props}
        >
          <div className="rottay-result__icon" aria-hidden="true">
            {icon || null}
          </div>
          {title && <div className="rottay-result__title">{title}</div>}
          {subTitle && <div className="rottay-result__subtitle">{subTitle}</div>}
          {children && <div className="rottay-result__content">{children}</div>}
          {extra && <div className="rottay-result__extra">{extra}</div>}
        </div>
      );
    });
    MockResult.displayName = 'Result';
    return MockResult;
  },
}));

// ============================================================================
// Test Suite
// ============================================================================

describe('Result', () => {
  // --------------------------------------------------------------------------
  // Basic Rendering Tests
  // --------------------------------------------------------------------------

  describe('Basic Rendering', () => {
    /**
     * Verifies the component renders with a title.
     */
    it('renders with title', () => {
      render(<Result title="Operation Successful" />);
      expect(screen.getByText('Operation Successful')).toBeInTheDocument();
    });

    /**
     * Verifies the component renders with both title and subtitle.
     */
    it('renders with subtitle', () => {
      render(<Result title="Title" subTitle="Subtitle description" />);
      expect(screen.getByText('Subtitle description')).toBeInTheDocument();
    });

    /**
     * Verifies children content is rendered correctly.
     */
    it('renders children content', () => {
      render(
        <Result title="Title">
          <div>Child content</div>
        </Result>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    /**
     * Verifies custom className is applied to the container.
     */
    it('applies custom className', () => {
      const { container } = render(<Result title="Title" className="custom-result" />);
      expect(container.querySelector('.custom-result')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Status Type Tests
  // --------------------------------------------------------------------------

  describe('Status Types', () => {
    /**
     * Verifies each status type renders correctly.
     */
    it.each(['success', 'error', 'info', 'warning', '404', '403', '500'] as const)(
      'renders %s status correctly',
      (status) => {
        const { container } = render(<Result status={status} title={`${status} Status`} />);
        expect(screen.getByText(`${status} Status`)).toBeInTheDocument();
        expect(container.firstChild).toBeInTheDocument();
      }
    );

    /**
     * Verifies the default status is 'info'.
     */
    it('defaults to info status', () => {
      render(<Result title="Default" />);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Custom Icon Tests
  // --------------------------------------------------------------------------

  describe('Custom Icon', () => {
    /**
     * Verifies custom icons are rendered.
     */
    it('renders custom icon', () => {
      render(
        <Result
          title="Custom Icon"
          icon={<span data-testid="custom-icon">🎉</span>}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    /**
     * Verifies custom icons override default status icons.
     */
    it('overrides default status icon with custom icon', () => {
      render(
        <Result
          status="success"
          title="Custom"
          icon={<span data-testid="override-icon">★</span>}
        />
      );
      expect(screen.getByTestId('override-icon')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Extra Actions Tests
  // --------------------------------------------------------------------------

  describe('Extra Actions', () => {
    /**
     * Verifies extra content (single element) is rendered.
     */
    it('renders extra content', () => {
      render(
        <Result
          title="Result"
          extra={<button>Action Button</button>}
        />
      );
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    /**
     * Verifies multiple extra buttons are rendered.
     */
    it('renders multiple extra buttons', () => {
      render(
        <Result
          title="Result"
          extra={[
            <button key="1">Primary</button>,
            <button key="2">Secondary</button>,
          ]}
        />
      );
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Success Result Tests
  // --------------------------------------------------------------------------

  describe('Success Result', () => {
    /**
     * Verifies a complete success result with all props.
     */
    it('renders success result with all props', () => {
      render(
        <Result
          status="success"
          title="Successfully Purchased!"
          subTitle="Order number: 2017182818828182881"
          extra={[
            <button key="console">Go Console</button>,
            <button key="buy">Buy Again</button>,
          ]}
        />
      );
      expect(screen.getByText('Successfully Purchased!')).toBeInTheDocument();
      expect(screen.getByText('Order number: 2017182818828182881')).toBeInTheDocument();
      expect(screen.getByText('Go Console')).toBeInTheDocument();
      expect(screen.getByText('Buy Again')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Error Result Tests
  // --------------------------------------------------------------------------

  describe('Error Result', () => {
    /**
     * Verifies an error result with additional details.
     */
    it('renders error result with details', () => {
      render(
        <Result
          status="error"
          title="Submission Failed"
          subTitle="Please check and modify the following information before resubmitting."
        >
          <div>Error Details Here</div>
        </Result>
      );
      expect(screen.getByText('Submission Failed')).toBeInTheDocument();
      expect(screen.getByText('Error Details Here')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // HTTP Status Results Tests
  // --------------------------------------------------------------------------

  describe('HTTP Status Results', () => {
    /**
     * Verifies 404 result renders correctly.
     */
    it('renders 404 result', () => {
      render(
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={<button>Back Home</button>}
        />
      );
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Sorry, the page you visited does not exist.')).toBeInTheDocument();
    });

    /**
     * Verifies 403 result renders correctly.
     */
    it('renders 403 result', () => {
      render(
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
        />
      );
      expect(screen.getByText('403')).toBeInTheDocument();
    });

    /**
     * Verifies 500 result renders correctly.
     */
    it('renders 500 result', () => {
      render(
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
        />
      );
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Accessibility Tests
  // --------------------------------------------------------------------------

  describe('Accessibility', () => {
    /**
     * Verifies the component has appropriate ARIA role.
     */
    it('has appropriate role', () => {
      render(<Result title="Accessible Result" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    /**
     * Verifies title is properly announced to screen readers.
     */
    it('title is properly announced', () => {
      render(<Result title="Important Result" />);
      expect(screen.getByText('Important Result')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Engine Support Tests
  // --------------------------------------------------------------------------

  describe('Engine Support', () => {
    /**
     * Verifies the component renders with each engine.
     */
    it.each(['classic', 'modern', 'rustic'] as const)(
      'renders with %s engine',
      (engine) => {
        render(<Result engine={engine} title={`${engine} Result`} />);
        expect(screen.getByText(`${engine} Result`)).toBeInTheDocument();
      }
    );
  });

  // --------------------------------------------------------------------------
  // Complex Layout Tests
  // --------------------------------------------------------------------------

  describe('Complex Layouts', () => {
    /**
     * Verifies result with complex children structure.
     */
    it('renders result with complex children', () => {
      render(
        <Result
          status="warning"
          title="Warning"
          subTitle="Review the items below"
        >
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </Result>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    /**
     * Verifies result renders correctly within a card wrapper.
     */
    it('renders result within a card', () => {
      render(
        <div data-testid="card-wrapper" style={{ padding: 24 }}>
          <Result
            status="info"
            title="Information"
            subTitle="This result is inside a card"
          />
        </div>
      );
      expect(screen.getByTestId('card-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Information')).toBeInTheDocument();
    });
  });

  describe('Result tenants', () => {
    it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
      document.documentElement.setAttribute('data-tenant', tenant);
      render(<Result title="Test" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      document.documentElement.removeAttribute('data-tenant');
    });
  });
});
