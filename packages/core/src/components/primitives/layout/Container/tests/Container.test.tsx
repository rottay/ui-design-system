/**
 * Container Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { Container } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockContainer = React.forwardRef<HTMLDivElement, any>(({
      children,
      maxWidth,
      center = true,
      padding,
      fluid,
      className,
      style,
      'data-testid': testId,
      ...props
    }, ref) => {
      return React.createElement('div', {
        ref,
        'data-testid': testId || 'container',
        'data-max-width': maxWidth,
        'data-center': String(center),
        'data-padding': padding,
        'data-fluid': fluid,
        className,
        style,
        ...props,
      }, children);
    });
    MockContainer.displayName = 'Container';
    return MockContainer;
  },
}));

describe('Container', () => {
  describe('Basic Rendering', () => {
    it('renders correctly with children', () => {
      render(<Container>Hello World</Container>);
      expect(screen.getByTestId('container')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      render(<Container data-testid="container">Content</Container>);
      expect(screen.getByTestId('container').tagName).toBe('DIV');
    });

    it('renders empty container without children', () => {
      render(<Container data-testid="empty-container" />);
      expect(screen.getByTestId('empty-container')).toBeInTheDocument();
    });
  });

  describe('Max Width Prop', () => {
    it.each(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const)(
      'applies maxWidth %s',
      (maxWidth) => {
        render(<Container maxWidth={maxWidth}>Test</Container>);
        expect(screen.getByTestId('container')).toHaveAttribute('data-max-width', maxWidth);
      }
    );

    it('applies custom numeric maxWidth', () => {
      render(<Container maxWidth={800}>Test</Container>);
      expect(screen.getByTestId('container')).toHaveAttribute('data-max-width', '800');
    });
  });

  describe('Padding Prop', () => {
    it.each(['none', 'sm', 'md', 'lg'] as const)(
      'applies padding %s',
      (padding) => {
        render(<Container padding={padding}>Test</Container>);
        expect(screen.getByTestId('container')).toHaveAttribute('data-padding', padding);
      }
    );

    it('applies custom numeric padding', () => {
      render(<Container padding={24}>Test</Container>);
      expect(screen.getByTestId('container')).toHaveAttribute('data-padding', '24');
    });
  });

  describe('Center Prop', () => {
    it('applies center by default', () => {
      render(<Container>Test</Container>);
      expect(screen.getByTestId('container')).toHaveAttribute('data-center', 'true');
    });

    it('can disable centering', () => {
      render(<Container center={false}>Test</Container>);
      expect(screen.getByTestId('container')).toHaveAttribute('data-center', 'false');
    });
  });

  describe('Fluid Prop', () => {
    it('is not fluid by default', () => {
      render(<Container>Test</Container>);
      expect(screen.getByTestId('container')).not.toHaveAttribute('data-fluid', 'true');
    });

    it('applies fluid when set to true', () => {
      render(<Container fluid>Test</Container>);
      expect(screen.getByTestId('container')).toHaveAttribute('data-fluid', 'true');
    });
  });

  describe('className and style Props', () => {
    it('applies custom className', () => {
      render(<Container className="custom-class">Test</Container>);
      expect(screen.getByTestId('container')).toHaveClass('custom-class');
    });

    it('applies multiple custom classNames', () => {
      render(<Container className="class-one class-two">Test</Container>);
      expect(screen.getByTestId('container')).toHaveClass('class-one');
      expect(screen.getByTestId('container')).toHaveClass('class-two');
    });

    it('applies inline styles', () => {
      render(<Container style={{ backgroundColor: 'red' }}>Test</Container>);
      const container = screen.getByTestId('container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Container ref={ref}>Test</Container>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Combined Props', () => {
    it('applies multiple props together', () => {
      render(
        <Container
          maxWidth="xl"
          padding="lg"
          center
          className="custom-container"
        >
          Styled Container
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveAttribute('data-max-width', 'xl');
      expect(container).toHaveAttribute('data-padding', 'lg');
      expect(container).toHaveAttribute('data-center', 'true');
      expect(container).toHaveClass('custom-container');
    });
  });

  describe('Nested Containers', () => {
    it('renders nested containers correctly', () => {
      render(
        <Container data-testid="outer-container" maxWidth="xl">
          <Container data-testid="inner-container" maxWidth="md">
            Inner Content
          </Container>
        </Container>
      );
      expect(screen.getByTestId('outer-container')).toBeInTheDocument();
      expect(screen.getByTestId('inner-container')).toBeInTheDocument();
      expect(screen.getByText('Inner Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label attribute', () => {
      render(<Container aria-label="Main container">Test</Container>);
      expect(screen.getByLabelText('Main container')).toBeInTheDocument();
    });

    it('supports role attribute', () => {
      render(<Container role="main" data-testid="main-container">Test</Container>);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('supports data-testid for testing', () => {
      render(<Container data-testid="custom-test-id">Test</Container>);
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });
  });
});

describe('Container Types', () => {
  it('exports ContainerProps type', async () => {
    const { ContainerProps } = await import('../Container.types');
    expect(ContainerProps).toBeUndefined(); // Types are compile-time only
  });

  it('exports CONTAINER_DEFAULTS constant', async () => {
    const { CONTAINER_DEFAULTS } = await import('../Container.types');
    expect(CONTAINER_DEFAULTS).toBeDefined();
    expect(CONTAINER_DEFAULTS.center).toBe(true);
    expect(CONTAINER_DEFAULTS.padding).toBe('md');
    expect(CONTAINER_DEFAULTS.fluid).toBe(false);
    expect(CONTAINER_DEFAULTS.maxWidth).toBe('lg');
  });

  it('exports CONTAINER_MAX_WIDTHS constant', async () => {
    const { CONTAINER_MAX_WIDTHS } = await import('../Container.types');
    expect(CONTAINER_MAX_WIDTHS).toBeDefined();
    expect(CONTAINER_MAX_WIDTHS.sm).toBe('var(--ds-container-sm, 640px)');
    expect(CONTAINER_MAX_WIDTHS.lg).toBe('var(--ds-container-lg, 1024px)');
    expect(CONTAINER_MAX_WIDTHS.full).toBe('100%');
  });

  it('exports CONTAINER_PADDINGS constant', async () => {
    const { CONTAINER_PADDINGS } = await import('../Container.types');
    expect(CONTAINER_PADDINGS).toBeDefined();
    expect(CONTAINER_PADDINGS.none).toBe('0');
    expect(CONTAINER_PADDINGS.md).toBe('var(--ds-spacing-4, 16px)');
  });
});

describe('Container engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Container engine={engine}>Test</Container>);
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });
});

describe('Container tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Container>Test</Container>);
    expect(screen.getByTestId('container')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
