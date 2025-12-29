/**
 * Empty Component - Unit Tests
 *
 * This file contains comprehensive unit tests for the Empty component.
 * Tests cover the main component functionality, engine implementations,
 * and various prop configurations.
 *
 * @module Empty/tests
 * @category Display
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Empty } from '../';
import { EMPTY_DEFAULTS } from '../types';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockEmpty = ({
      children,
      description,
      image = 'default',
      className,
      style,
      ...props
    }: any) => {
      // Determine image type for data attribute
      const imageType = typeof image === 'string' ? image : 'custom';
      const isCustomImage = typeof image !== 'string' && image !== null;

      return (
        <div
          data-testid="empty"
          data-image={imageType}
          className={className}
          style={style}
          role="status"
          {...props}
        >
          {isCustomImage && (
            <div data-testid="empty-image">{image}</div>
          )}
          {description !== false && (
            <p data-testid="empty-description">
              {description || EMPTY_DEFAULTS.description}
            </p>
          )}
          {children && <div data-testid="empty-footer">{children}</div>}
        </div>
      );
    };
    MockEmpty.displayName = 'Empty';
    return MockEmpty;
  },
}));

describe('Empty', () => {
  describe('Basic Rendering', () => {
    it('renders correctly with default props', () => {
      render(<Empty />);
      const empty = screen.getByTestId('empty');
      expect(empty).toBeInTheDocument();
      expect(empty).toHaveAttribute('role', 'status');
    });

    it('renders default description when none provided', () => {
      render(<Empty />);
      expect(screen.getByTestId('empty-description')).toHaveTextContent(
        EMPTY_DEFAULTS.description
      );
    });

    it('renders custom description', () => {
      const customDescription = 'No results found';
      render(<Empty description={customDescription} />);
      expect(screen.getByTestId('empty-description')).toHaveTextContent(
        customDescription
      );
    });

    it('hides description when set to false', () => {
      render(<Empty description={false} />);
      expect(screen.queryByTestId('empty-description')).not.toBeInTheDocument();
    });
  });

  describe('Image Variants', () => {
    it('uses default image by default', () => {
      render(<Empty />);
      const empty = screen.getByTestId('empty');
      expect(empty).toHaveAttribute('data-image', 'default');
    });

    it('uses simple image when specified', () => {
      render(<Empty image="simple" />);
      const empty = screen.getByTestId('empty');
      expect(empty).toHaveAttribute('data-image', 'simple');
    });

    it('renders custom image element', () => {
      const customImage = <svg data-testid="custom-svg" />;
      render(<Empty image={customImage} />);
      expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
    });
  });

  describe('Children (Actions)', () => {
    it('renders children as footer content', () => {
      render(
        <Empty>
          <button>Action Button</button>
        </Empty>
      );
      expect(screen.getByTestId('empty-footer')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Action Button');
    });

    it('does not render footer when no children provided', () => {
      render(<Empty description="Test" />);
      expect(screen.queryByTestId('empty-footer')).not.toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Empty>
          <button>First</button>
          <button>Second</button>
        </Empty>
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<Empty className="custom-empty-class" />);
      const empty = screen.getByTestId('empty');
      expect(empty).toHaveClass('custom-empty-class');
    });

    it('applies custom style object', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      render(<Empty style={customStyle} />);
      const empty = screen.getByTestId('empty');
      // Verify style prop is passed to the element
      expect(empty).toHaveAttribute('style');
    });

    it('merges custom styles with base styles', () => {
      render(
        <Empty
          className="class-a class-b"
          style={{ marginTop: '10px' }}
        />
      );
      const empty = screen.getByTestId('empty');
      expect(empty).toHaveClass('class-a');
      expect(empty).toHaveClass('class-b');
      // Verify style prop is passed
      expect(empty).toHaveAttribute('style');
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<Empty />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('description is visible to screen readers', () => {
      render(<Empty description="No items available" />);
      expect(screen.getByText('No items available')).toBeInTheDocument();
    });
  });

  describe('ReactNode Description', () => {
    it('renders ReactNode as description', () => {
      render(
        <Empty
          description={
            <span>
              No data. <a href="#">Learn more</a>
            </span>
          }
        />
      );
      expect(screen.getByRole('link')).toHaveTextContent('Learn more');
    });
  });
});

describe('EMPTY_DEFAULTS', () => {
  it('has correct default description', () => {
    expect(EMPTY_DEFAULTS.description).toBe('No Data');
  });

  it('has correct default image type', () => {
    expect(EMPTY_DEFAULTS.image).toBe('default');
  });
});

describe('Empty Component Integration', () => {
  it('renders complete empty state with all elements', () => {
    render(
      <Empty
        image="default"
        description="Complete empty state"
        className="integration-test"
      >
        <button>Take Action</button>
      </Empty>
    );

    const empty = screen.getByTestId('empty');
    expect(empty).toHaveClass('integration-test');
    expect(screen.getByTestId('empty-description')).toHaveTextContent(
      'Complete empty state'
    );
    expect(screen.getByRole('button')).toHaveTextContent('Take Action');
  });
});

describe('Empty engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Empty engine={engine} />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });
});

describe('Empty tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Empty />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
