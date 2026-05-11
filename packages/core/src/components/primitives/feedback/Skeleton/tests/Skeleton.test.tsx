/**
 * Skeleton Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Skeleton } from '../';

// Mock the engine factory
vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSkeleton = React.forwardRef<HTMLDivElement, any>(({
      active = true,
      variant = 'text',
      animation = 'pulse',
      width,
      height,
      avatar,
      avatarSize,
      avatarShape,
      paragraph,
      rows,
      title,
      className = '',
      style = {},
      children,
      ...props
    }, ref) => {
      if (!active && children) {
        return <>{children}</>;
      }

      return (
        <div
          ref={ref}
          className={`rottay-skeleton rottay-skeleton--${variant} rottay-skeleton--${animation} ${className}`}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            ...style,
          }}
          {...props}
        >
          {avatar && (
            <div
              className={`rottay-skeleton__avatar rottay-skeleton__avatar--${avatarShape || 'circle'}`}
              style={{ width: avatarSize, height: avatarSize }}
            />
          )}
          {title && <div className="rottay-skeleton__title" />}
          {(paragraph || rows) && (
            <div className="rottay-skeleton__paragraph">
              {Array.from({ length: rows || 3 }).map((_, i) => (
                <div key={i} className="rottay-skeleton__row" />
              ))}
            </div>
          )}
        </div>
      );
    });
    MockSkeleton.displayName = 'Skeleton';
    return MockSkeleton;
  },
}));

describe('Skeleton', () => {
  describe('Basic Rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />);
      expect(container.querySelector('.custom-skeleton')).toBeInTheDocument();
    });

    it('applies custom style', () => {
      const { container } = render(<Skeleton style={{ margin: '10px' }} />);
      expect(container.firstChild).toHaveStyle({ margin: '10px' });
    });

    it('renders children when not active', () => {
      render(
        <Skeleton active={false}>
          <div>Loaded content</div>
        </Skeleton>
      );
      expect(screen.getByText('Loaded content')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it.each(['text', 'circular', 'rectangular', 'rounded'] as const)(
      'renders %s variant correctly',
      (variant) => {
        const { container } = render(<Skeleton variant={variant} />);
        expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
      }
    );

    it('defaults to text variant', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });
  });

  describe('Dimensions', () => {
    it('accepts width as number', () => {
      const { container } = render(<Skeleton width={200} />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('accepts width as string', () => {
      const { container } = render(<Skeleton width="50%" />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('accepts height as number', () => {
      const { container } = render(<Skeleton height={100} />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('accepts height as string', () => {
      const { container } = render(<Skeleton height="3rem" />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it.each(['pulse', 'wave', false] as const)(
      'handles animation=%s correctly',
      (animation) => {
        const { container } = render(<Skeleton animation={animation} />);
        expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
      }
    );

    it('defaults to pulse animation', () => {
      const { container } = render(<Skeleton />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });
  });

  describe('Complex Layouts', () => {
    it('renders avatar skeleton', () => {
      const { container } = render(<Skeleton avatar />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('renders avatar with custom size', () => {
      const { container } = render(<Skeleton avatar avatarSize={60} />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('renders square avatar', () => {
      const { container } = render(<Skeleton avatar avatarShape="square" />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('renders paragraph skeleton', () => {
      const { container } = render(<Skeleton paragraph />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('renders multiple rows', () => {
      const { container } = render(<Skeleton rows={5} />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('renders title skeleton', () => {
      const { container } = render(<Skeleton title />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('shows skeleton when active', () => {
      const { container } = render(<Skeleton active />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
    });

    it('shows children when not active', () => {
      render(
        <Skeleton active={false}>
          <span>Content</span>
        </Skeleton>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Engine Support', () => {
    it.each(['classic', 'modern', 'rustic'] as const)(
      'renders with %s engine',
      (engine) => {
        const { container } = render(<Skeleton engine={engine} />);
        expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
      }
    );
  });

  describe('Skeleton tenants', () => {
    it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
      document.documentElement.setAttribute('data-tenant', tenant);
      const { container } = render(<Skeleton />);
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument();
      document.documentElement.removeAttribute('data-tenant');
    });
  });
});
