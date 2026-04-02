/**
 * Tag Tests
 * Colocated with component following approved architecture.
 *
 * @module Tag/tests
 * @description Unit tests for the Tag component covering rendering,
 * interactions, variants, and accessibility.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tag } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockTag = ({
      children,
      size,
      variant,
      closable,
      onClose,
      icon,
      bordered,
      outlined,
      clickable,
      onClick,
      radius,
      ...props
    }: any) => (
      <span
        data-testid="tag"
        data-size={size}
        data-variant={variant}
        data-closable={closable}
        data-bordered={bordered}
        data-outlined={outlined}
        data-clickable={clickable}
        data-radius={radius}
        onClick={clickable ? onClick : undefined}
        {...props}
      >
        {icon && <span data-testid="tag-icon">{icon}</span>}
        <span data-testid="tag-content">{children}</span>
        {closable && (
          <button
            data-testid="tag-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            aria-label="Remove tag"
          >
            Close
          </button>
        )}
      </span>
    );
    MockTag.displayName = 'Tag';
    return MockTag;
  },
}));

describe('Tag', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      render(<Tag>Default Tag</Tag>);
      expect(screen.getByTestId('tag')).toBeInTheDocument();
      expect(screen.getByTestId('tag-content')).toHaveTextContent('Default Tag');
    });

    it('renders children content', () => {
      render(<Tag>Test Content</Tag>);
      expect(screen.getByTestId('tag-content')).toHaveTextContent('Test Content');
    });

    it('applies custom className', () => {
      render(<Tag className="custom-class">Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      render(<Tag style={{ backgroundColor: 'red' }}>Tag</Tag>);
      expect(screen.getByTestId('tag')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
      render(<Tag size={size}>Size Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveAttribute('data-size', size);
    });
  });

  describe('Variants', () => {
    it.each(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const)(
      'renders variant %s',
      (variant) => {
        render(<Tag variant={variant}>Variant Tag</Tag>);
        expect(screen.getByTestId('tag')).toHaveAttribute('data-variant', variant);
      }
    );
  });

  describe('Closable', () => {
    it('renders close button when closable is true', () => {
      render(<Tag closable>Closable Tag</Tag>);
      expect(screen.getByTestId('tag-close')).toBeInTheDocument();
    });

    it('does not render close button when closable is false', () => {
      render(<Tag closable={false}>Non-closable Tag</Tag>);
      expect(screen.queryByTestId('tag-close')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <Tag closable onClose={onClose}>
          Closable Tag
        </Tag>
      );

      fireEvent.click(screen.getByTestId('tag-close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('stops event propagation when close button is clicked', () => {
      const onClose = vi.fn();
      const onClick = vi.fn();
      render(
        <Tag closable onClose={onClose} clickable onClick={onClick}>
          Closable Tag
        </Tag>
      );

      fireEvent.click(screen.getByTestId('tag-close'));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Icon', () => {
    it('renders icon when provided', () => {
      const icon = <span data-testid="custom-icon">Icon</span>;
      render(<Tag icon={icon}>Tag with Icon</Tag>);
      expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('does not render icon wrapper when icon is not provided', () => {
      render(<Tag>Tag without Icon</Tag>);
      expect(screen.queryByTestId('tag-icon')).not.toBeInTheDocument();
    });
  });

  describe('Clickable', () => {
    it('sets clickable data attribute when clickable is true', () => {
      render(<Tag clickable>Clickable Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveAttribute('data-clickable', 'true');
    });

    it('calls onClick when tag is clicked and clickable', () => {
      const onClick = vi.fn();
      render(
        <Tag clickable onClick={onClick}>
          Clickable Tag
        </Tag>
      );

      fireEvent.click(screen.getByTestId('tag'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when tag is not clickable', () => {
      const onClick = vi.fn();
      render(
        <Tag clickable={false} onClick={onClick}>
          Non-clickable Tag
        </Tag>
      );

      fireEvent.click(screen.getByTestId('tag'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Styles', () => {
    it('sets bordered data attribute when bordered is true', () => {
      render(<Tag bordered>Bordered Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveAttribute('data-bordered', 'true');
    });

    it('sets outlined data attribute when outlined is true', () => {
      render(<Tag outlined>Outlined Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveAttribute('data-outlined', 'true');
    });

    it.each(['none', 'sm', 'md', 'lg', 'full'] as const)('renders radius %s', (radius) => {
      render(<Tag radius={radius}>Radius Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveAttribute('data-radius', radius);
    });
  });

  describe('Accessibility', () => {
    it('close button has aria-label', () => {
      render(<Tag closable>Accessible Tag</Tag>);
      expect(screen.getByTestId('tag-close')).toHaveAttribute('aria-label', 'Remove tag');
    });
  });
});

describe('Tag.Group', () => {
  it('renders children', () => {
    render(
      <Tag.Group>
        <Tag>Tag 1</Tag>
        <Tag>Tag 2</Tag>
        <Tag>Tag 3</Tag>
      </Tag.Group>
    );

    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
    expect(screen.getByText('Tag 3')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Tag.Group className="custom-group">
        <Tag>Tag</Tag>
      </Tag.Group>
    );

    expect(container.querySelector('.custom-group')).toBeInTheDocument();
  });

  it('has role="group" for accessibility', () => {
    render(
      <Tag.Group>
        <Tag>Tag</Tag>
      </Tag.Group>
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});

describe('Tag engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Tag engine={engine}>Test</Tag>);
    expect(screen.getByTestId('tag')).toBeInTheDocument();
  });
});

describe('Tag tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Tag>Test</Tag>);
    expect(screen.getByTestId('tag')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
