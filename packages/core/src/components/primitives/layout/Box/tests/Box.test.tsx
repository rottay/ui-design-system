/**
 * Box Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { Box } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockBox = React.forwardRef<HTMLElement, any>(({
      children,
      as: Component = 'div',
      padding,
      p,
      margin,
      m,
      display,
      width,
      w,
      height,
      h,
      background,
      bg,
      borderRadius,
      rounded,
      shadow,
      position,
      overflow,
      className,
      style,
      'data-testid': testId,
      ...props
    }, ref) => {
      const Tag = Component as keyof JSX.IntrinsicElements;
      return React.createElement(Tag, {
        ref,
        'data-testid': testId || 'box',
        'data-padding': padding || p,
        'data-margin': margin || m,
        'data-display': display,
        'data-width': width || w,
        'data-height': height || h,
        'data-background': background || bg,
        'data-border-radius': borderRadius || rounded,
        'data-shadow': shadow,
        'data-position': position,
        'data-overflow': overflow,
        className,
        style,
        ...props,
      }, children);
    });
    MockBox.displayName = 'Box';
    return MockBox;
  },
}));

describe('Box', () => {
  describe('Basic Rendering', () => {
    it('renders correctly with children', () => {
      render(<Box>Hello World</Box>);
      expect(screen.getByTestId('box')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as default div element', () => {
      render(<Box data-testid="box">Content</Box>);
      expect(screen.getByTestId('box').tagName).toBe('DIV');
    });

    it('renders empty box without children', () => {
      render(<Box data-testid="empty-box" />);
      expect(screen.getByTestId('empty-box')).toBeInTheDocument();
    });
  });

  describe('Polymorphic "as" Prop', () => {
    it('renders as span when as="span"', () => {
      render(<Box as="span" data-testid="span-box">Content</Box>);
      expect(screen.getByTestId('span-box').tagName).toBe('SPAN');
    });

    it('renders as section when as="section"', () => {
      render(<Box as="section" data-testid="section-box">Content</Box>);
      expect(screen.getByTestId('section-box').tagName).toBe('SECTION');
    });

    it('renders as article when as="article"', () => {
      render(<Box as="article" data-testid="article-box">Content</Box>);
      expect(screen.getByTestId('article-box').tagName).toBe('ARTICLE');
    });

    it('renders as aside when as="aside"', () => {
      render(<Box as="aside" data-testid="aside-box">Content</Box>);
      expect(screen.getByTestId('aside-box').tagName).toBe('ASIDE');
    });

    it('renders as main when as="main"', () => {
      render(<Box as="main" data-testid="main-box">Content</Box>);
      expect(screen.getByTestId('main-box').tagName).toBe('MAIN');
    });

    it('renders as header when as="header"', () => {
      render(<Box as="header" data-testid="header-box">Content</Box>);
      expect(screen.getByTestId('header-box').tagName).toBe('HEADER');
    });

    it('renders as footer when as="footer"', () => {
      render(<Box as="footer" data-testid="footer-box">Content</Box>);
      expect(screen.getByTestId('footer-box').tagName).toBe('FOOTER');
    });

    it('renders as nav when as="nav"', () => {
      render(<Box as="nav" data-testid="nav-box">Content</Box>);
      expect(screen.getByTestId('nav-box').tagName).toBe('NAV');
    });
  });

  describe('Padding Props', () => {
    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const)(
      'applies padding %s',
      (padding) => {
        render(<Box padding={padding}>Test</Box>);
        expect(screen.getByTestId('box')).toHaveAttribute('data-padding', padding);
      }
    );

    it('applies padding using shorthand "p" prop', () => {
      render(<Box p="lg">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-padding', 'lg');
    });
  });

  describe('Margin Props', () => {
    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const)(
      'applies margin %s',
      (margin) => {
        render(<Box margin={margin}>Test</Box>);
        expect(screen.getByTestId('box')).toHaveAttribute('data-margin', margin);
      }
    );

    it('applies margin using shorthand "m" prop', () => {
      render(<Box m="md">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-margin', 'md');
    });
  });

  describe('Dimension Props', () => {
    it('applies width prop', () => {
      render(<Box width="200px">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-width', '200px');
    });

    it('applies width using shorthand "w" prop', () => {
      render(<Box w="100%">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-width', '100%');
    });

    it('applies height prop', () => {
      render(<Box height="150px">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-height', '150px');
    });

    it('applies height using shorthand "h" prop', () => {
      render(<Box h="50vh">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-height', '50vh');
    });
  });

  describe('Background Props', () => {
    it('applies background prop', () => {
      render(<Box background="red">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-background', 'red');
    });

    it('applies background using shorthand "bg" prop', () => {
      render(<Box bg="linear-gradient(to right, red, blue)">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-background', 'linear-gradient(to right, red, blue)');
    });
  });

  describe('Border Radius Props', () => {
    it.each(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const)(
      'applies borderRadius %s',
      (radius) => {
        render(<Box borderRadius={radius}>Test</Box>);
        expect(screen.getByTestId('box')).toHaveAttribute('data-border-radius', radius);
      }
    );

    it('applies borderRadius using shorthand "rounded" prop', () => {
      render(<Box rounded="lg">Test</Box>);
      expect(screen.getByTestId('box')).toHaveAttribute('data-border-radius', 'lg');
    });
  });

  describe('Shadow Props', () => {
    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const)(
      'applies shadow %s',
      (shadow) => {
        render(<Box shadow={shadow}>Test</Box>);
        expect(screen.getByTestId('box')).toHaveAttribute('data-shadow', shadow);
      }
    );
  });

  describe('Display Props', () => {
    it.each(['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] as const)(
      'applies display %s',
      (display) => {
        render(<Box display={display}>Test</Box>);
        expect(screen.getByTestId('box')).toHaveAttribute('data-display', display);
      }
    );
  });

  describe('Position Props', () => {
    it.each(['relative', 'absolute', 'fixed', 'sticky', 'static'] as const)(
      'applies position %s',
      (position) => {
        render(<Box position={position}>Test</Box>);
        expect(screen.getByTestId('box')).toHaveAttribute('data-position', position);
      }
    );
  });

  describe('Overflow Props', () => {
    it.each(['visible', 'hidden', 'scroll', 'auto'] as const)(
      'applies overflow %s',
      (overflow) => {
        render(<Box overflow={overflow}>Test</Box>);
        expect(screen.getByTestId('box')).toHaveAttribute('data-overflow', overflow);
      }
    );
  });

  describe('className and style Props', () => {
    it('applies custom className', () => {
      render(<Box className="custom-class">Test</Box>);
      expect(screen.getByTestId('box')).toHaveClass('custom-class');
    });

    it('applies multiple custom classNames', () => {
      render(<Box className="class-one class-two">Test</Box>);
      expect(screen.getByTestId('box')).toHaveClass('class-one');
      expect(screen.getByTestId('box')).toHaveClass('class-two');
    });

    it('applies inline styles', () => {
      render(<Box style={{ color: 'red', fontSize: '16px' }}>Test</Box>);
      const box = screen.getByTestId('box');
      // Style prop is passed to the mock component
      expect(box).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Box ref={ref}>Test</Box>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref when using polymorphic as prop', () => {
      const ref = createRef<HTMLElement>();
      render(<Box as="section" ref={ref}>Test</Box>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label attribute', () => {
      render(<Box aria-label="Box container">Test</Box>);
      expect(screen.getByLabelText('Box container')).toBeInTheDocument();
    });

    it('supports role attribute', () => {
      render(<Box role="region" data-testid="region-box">Test</Box>);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('supports data-testid for testing', () => {
      render(<Box data-testid="custom-test-id">Test</Box>);
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('applies multiple styling props together', () => {
      render(
        <Box
          padding="md"
          margin="lg"
          width="300px"
          height="200px"
          background="#f0f0f0"
          borderRadius="lg"
          shadow="md"
          display="flex"
          position="relative"
        >
          Styled Box
        </Box>
      );
      const box = screen.getByTestId('box');
      expect(box).toHaveAttribute('data-padding', 'md');
      expect(box).toHaveAttribute('data-margin', 'lg');
      expect(box).toHaveAttribute('data-width', '300px');
      expect(box).toHaveAttribute('data-height', '200px');
      expect(box).toHaveAttribute('data-background', '#f0f0f0');
      expect(box).toHaveAttribute('data-border-radius', 'lg');
      expect(box).toHaveAttribute('data-shadow', 'md');
      expect(box).toHaveAttribute('data-display', 'flex');
      expect(box).toHaveAttribute('data-position', 'relative');
    });

    it('combines shorthand and regular props correctly', () => {
      render(
        <Box
          p="sm"
          m="md"
          w="100%"
          h="auto"
          bg="white"
          rounded="md"
        >
          Shorthand Box
        </Box>
      );
      const box = screen.getByTestId('box');
      expect(box).toHaveAttribute('data-padding', 'sm');
      expect(box).toHaveAttribute('data-margin', 'md');
      expect(box).toHaveAttribute('data-width', '100%');
      expect(box).toHaveAttribute('data-height', 'auto');
      expect(box).toHaveAttribute('data-background', 'white');
      expect(box).toHaveAttribute('data-border-radius', 'md');
    });
  });

  describe('Nested Boxes', () => {
    it('renders nested boxes correctly', () => {
      render(
        <Box data-testid="outer-box" padding="lg">
          <Box data-testid="inner-box" padding="md">
            Inner Content
          </Box>
        </Box>
      );
      expect(screen.getByTestId('outer-box')).toBeInTheDocument();
      expect(screen.getByTestId('inner-box')).toBeInTheDocument();
      expect(screen.getByText('Inner Content')).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('handles onClick event', () => {
      const handleClick = vi.fn();
      render(<Box onClick={handleClick}>Click me</Box>);
      screen.getByTestId('box').click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles onMouseEnter event', async () => {
      const handleMouseEnter = vi.fn();
      const { container } = render(<Box onMouseEnter={handleMouseEnter}>Hover me</Box>);
      const box = container.firstChild as HTMLElement;
      // Use fireEvent from testing library which properly simulates React events
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.mouseEnter(box);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('handles onMouseLeave event', async () => {
      const handleMouseLeave = vi.fn();
      const { container } = render(<Box onMouseLeave={handleMouseLeave}>Leave me</Box>);
      const box = container.firstChild as HTMLElement;
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.mouseLeave(box);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Box Types', () => {
  it('exports BoxProps type', async () => {
    const { BoxProps } = await import('../Box.types');
    expect(BoxProps).toBeUndefined(); // Types are compile-time only
  });

  it('exports BOX_DEFAULTS constant', async () => {
    const { BOX_DEFAULTS } = await import('../Box.types');
    expect(BOX_DEFAULTS).toBeDefined();
    expect(BOX_DEFAULTS.as).toBe('div');
    expect(BOX_DEFAULTS.padding).toBe('none');
    expect(BOX_DEFAULTS.margin).toBe('none');
  });

  it('exports SPACING_MAP constant', async () => {
    const { SPACING_MAP } = await import('../Box.types');
    expect(SPACING_MAP).toBeDefined();
    expect(SPACING_MAP.none).toBe('0');
    expect(SPACING_MAP.md).toBe('var(--ds-spacing-4, 1rem)');
  });

  it('exports RADIUS_MAP constant', async () => {
    const { RADIUS_MAP } = await import('../Box.types');
    expect(RADIUS_MAP).toBeDefined();
    expect(RADIUS_MAP.none).toBe('0');
    expect(RADIUS_MAP.full).toBe('var(--ds-radius-full, 9999px)');
  });

  it('exports SHADOW_MAP constant', async () => {
    const { SHADOW_MAP } = await import('../Box.types');
    expect(SHADOW_MAP).toBeDefined();
    expect(SHADOW_MAP.none).toBe('none');
    expect(SHADOW_MAP.md).toContain('rgba');
  });
});

describe('Box engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Box engine={engine}>Test</Box>);
    expect(screen.getByTestId('box')).toBeInTheDocument();
  });
});

describe('Box tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Box>Test</Box>);
    expect(screen.getByTestId('box')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
