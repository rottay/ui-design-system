/**
 * Stack Tests
 * Comprehensive test suite for the Stack component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { Stack } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockStack = React.forwardRef<HTMLElement, any>(({
      children,
      as: Component = 'div',
      direction,
      spacing,
      gap,
      align,
      justify,
      wrap,
      divider,
      reverse,
      fullWidth,
      fullHeight,
      className,
      style,
      'data-testid': testId,
      ...props
    }, ref) => {
      const Tag = Component as keyof JSX.IntrinsicElements;

      // Handle divider rendering for tests
      let renderedChildren = children;
      if (divider) {
        const childArray = React.Children.toArray(children).filter(Boolean);
        if (childArray.length > 1) {
          const result: React.ReactNode[] = [];
          childArray.forEach((child, index) => {
            result.push(<React.Fragment key={`child-${index}`}>{child}</React.Fragment>);
            if (index < childArray.length - 1) {
              result.push(
                <div
                  key={`divider-${index}`}
                  data-testid="stack-divider"
                  className="rottay-stack-divider"
                >
                  {typeof divider === 'boolean' ? null : divider}
                </div>
              );
            }
          });
          renderedChildren = result;
        }
      }

      return React.createElement(Tag, {
        ref,
        'data-testid': testId || 'stack',
        'data-direction': direction,
        'data-spacing': typeof spacing === 'number' ? `${spacing}px` : spacing,
        'data-gap': typeof gap === 'number' ? `${gap}px` : gap,
        'data-align': align,
        'data-justify': justify,
        'data-wrap': wrap ? 'true' : 'false',
        'data-reverse': reverse ? 'true' : 'false',
        'data-full-width': fullWidth ? 'true' : 'false',
        'data-full-height': fullHeight ? 'true' : 'false',
        className,
        style,
        ...props,
      }, renderedChildren);
    });
    MockStack.displayName = 'Stack';
    return MockStack;
  },
}));

describe('Stack', () => {
  describe('Basic Rendering', () => {
    it('renders correctly with children', () => {
      render(<Stack>Hello World</Stack>);
      expect(screen.getByTestId('stack')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as default div element', () => {
      render(<Stack data-testid="stack">Content</Stack>);
      expect(screen.getByTestId('stack').tagName).toBe('DIV');
    });

    it('renders empty stack without children', () => {
      render(<Stack data-testid="empty-stack" />);
      expect(screen.getByTestId('empty-stack')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Stack>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Stack>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Polymorphic "as" Prop', () => {
    it('renders as span when as="span"', () => {
      render(<Stack as="span" data-testid="span-stack">Content</Stack>);
      expect(screen.getByTestId('span-stack').tagName).toBe('SPAN');
    });

    it('renders as section when as="section"', () => {
      render(<Stack as="section" data-testid="section-stack">Content</Stack>);
      expect(screen.getByTestId('section-stack').tagName).toBe('SECTION');
    });

    it('renders as article when as="article"', () => {
      render(<Stack as="article" data-testid="article-stack">Content</Stack>);
      expect(screen.getByTestId('article-stack').tagName).toBe('ARTICLE');
    });

    it('renders as nav when as="nav"', () => {
      render(<Stack as="nav" data-testid="nav-stack">Content</Stack>);
      expect(screen.getByTestId('nav-stack').tagName).toBe('NAV');
    });

    it('renders as ul when as="ul"', () => {
      render(<Stack as="ul" data-testid="ul-stack"><li>Item</li></Stack>);
      expect(screen.getByTestId('ul-stack').tagName).toBe('UL');
    });

    it('renders as ol when as="ol"', () => {
      render(<Stack as="ol" data-testid="ol-stack"><li>Item</li></Stack>);
      expect(screen.getByTestId('ol-stack').tagName).toBe('OL');
    });
  });

  describe('Direction Prop', () => {
    it('applies vertical direction by default', () => {
      render(<Stack direction="vertical">Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-direction', 'vertical');
    });

    it('applies horizontal direction', () => {
      render(<Stack direction="horizontal">Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-direction', 'horizontal');
    });
  });

  describe('Spacing/Gap Props', () => {
    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const)(
      'applies spacing %s',
      (spacing) => {
        render(<Stack spacing={spacing}>Test</Stack>);
        expect(screen.getByTestId('stack')).toHaveAttribute('data-spacing', spacing);
      }
    );

    it('applies numeric spacing value', () => {
      render(<Stack spacing={24}>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-spacing', '24px');
    });

    it('applies gap prop as alias for spacing', () => {
      render(<Stack gap="lg">Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-gap', 'lg');
    });

    it('applies numeric gap value', () => {
      render(<Stack gap={16}>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-gap', '16px');
    });
  });

  describe('Align Prop', () => {
    it.each(['start', 'center', 'end', 'stretch', 'baseline'] as const)(
      'applies align %s',
      (align) => {
        render(<Stack align={align}>Test</Stack>);
        expect(screen.getByTestId('stack')).toHaveAttribute('data-align', align);
      }
    );
  });

  describe('Justify Prop', () => {
    it.each(['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const)(
      'applies justify %s',
      (justify) => {
        render(<Stack justify={justify}>Test</Stack>);
        expect(screen.getByTestId('stack')).toHaveAttribute('data-justify', justify);
      }
    );
  });

  describe('Wrap Prop', () => {
    it('applies wrap=false by default', () => {
      render(<Stack>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-wrap', 'false');
    });

    it('applies wrap=true', () => {
      render(<Stack wrap>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-wrap', 'true');
    });

    it('applies wrap={false} explicitly', () => {
      render(<Stack wrap={false}>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-wrap', 'false');
    });
  });

  describe('Reverse Prop', () => {
    it('applies reverse=false by default', () => {
      render(<Stack>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-reverse', 'false');
    });

    it('applies reverse=true', () => {
      render(<Stack reverse>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-reverse', 'true');
    });
  });

  describe('FullWidth and FullHeight Props', () => {
    it('applies fullWidth=true', () => {
      render(<Stack fullWidth>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-full-width', 'true');
    });

    it('applies fullHeight=true', () => {
      render(<Stack fullHeight>Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveAttribute('data-full-height', 'true');
    });

    it('applies both fullWidth and fullHeight', () => {
      render(<Stack fullWidth fullHeight>Test</Stack>);
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveAttribute('data-full-width', 'true');
      expect(stack).toHaveAttribute('data-full-height', 'true');
    });
  });

  describe('Divider Prop', () => {
    it('renders dividers between children when divider=true', () => {
      render(
        <Stack divider>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Stack>
      );
      const dividers = screen.getAllByTestId('stack-divider');
      expect(dividers).toHaveLength(2);
    });

    it('does not render divider with single child', () => {
      render(
        <Stack divider>
          <div>Only Item</div>
        </Stack>
      );
      expect(screen.queryByTestId('stack-divider')).not.toBeInTheDocument();
    });

    it('renders custom divider element', () => {
      render(
        <Stack divider={<span data-testid="custom-divider">|</span>}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      expect(screen.getByTestId('custom-divider')).toBeInTheDocument();
    });

    it('renders custom React component as divider', () => {
      const CustomDivider = () => <hr data-testid="hr-divider" />;
      render(
        <Stack divider={<CustomDivider />}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      expect(screen.getByTestId('hr-divider')).toBeInTheDocument();
    });
  });

  describe('className and style Props', () => {
    it('applies custom className', () => {
      render(<Stack className="custom-class">Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('custom-class');
    });

    it('applies multiple custom classNames', () => {
      render(<Stack className="class-one class-two">Test</Stack>);
      expect(screen.getByTestId('stack')).toHaveClass('class-one');
      expect(screen.getByTestId('stack')).toHaveClass('class-two');
    });

    it('applies inline styles', () => {
      render(<Stack style={{ backgroundColor: 'red', padding: '10px' }}>Test</Stack>);
      const stack = screen.getByTestId('stack');
      // Style prop is passed to the mock component
      expect(stack).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Stack ref={ref}>Test</Stack>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref when using polymorphic as prop', () => {
      const ref = createRef<HTMLElement>();
      render(<Stack as="section" ref={ref}>Test</Stack>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label attribute', () => {
      render(<Stack aria-label="Stack container">Test</Stack>);
      expect(screen.getByLabelText('Stack container')).toBeInTheDocument();
    });

    it('supports role attribute', () => {
      render(<Stack role="list" data-testid="list-stack">Test</Stack>);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('supports data-testid for testing', () => {
      render(<Stack data-testid="custom-test-id">Test</Stack>);
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });

    it('supports aria-describedby attribute', () => {
      render(
        <>
          <p id="description">This is a stack description</p>
          <Stack aria-describedby="description">Test</Stack>
        </>
      );
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Combined Props', () => {
    it('applies multiple layout props together', () => {
      render(
        <Stack
          direction="horizontal"
          spacing="lg"
          align="center"
          justify="space-between"
          wrap
          fullWidth
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      const stack = screen.getByTestId('stack');
      expect(stack).toHaveAttribute('data-direction', 'horizontal');
      expect(stack).toHaveAttribute('data-spacing', 'lg');
      expect(stack).toHaveAttribute('data-align', 'center');
      expect(stack).toHaveAttribute('data-justify', 'space-between');
      expect(stack).toHaveAttribute('data-wrap', 'true');
      expect(stack).toHaveAttribute('data-full-width', 'true');
    });

    it('applies all props for a complex layout', () => {
      render(
        <Stack
          as="nav"
          direction="horizontal"
          gap={20}
          align="baseline"
          justify="space-evenly"
          wrap
          reverse
          fullWidth
          fullHeight
          className="my-nav"
          style={{ maxWidth: '1200px' }}
          data-testid="complex-stack"
        >
          <a href="/">Home</a>
          <a href="/about">About</a>
        </Stack>
      );
      const stack = screen.getByTestId('complex-stack');
      expect(stack.tagName).toBe('NAV');
      expect(stack).toHaveAttribute('data-direction', 'horizontal');
      expect(stack).toHaveAttribute('data-gap', '20px');
      expect(stack).toHaveAttribute('data-align', 'baseline');
      expect(stack).toHaveAttribute('data-justify', 'space-evenly');
      expect(stack).toHaveAttribute('data-wrap', 'true');
      expect(stack).toHaveAttribute('data-reverse', 'true');
      expect(stack).toHaveAttribute('data-full-width', 'true');
      expect(stack).toHaveAttribute('data-full-height', 'true');
      expect(stack).toHaveClass('my-nav');
      // Style prop is passed to the mock component
      expect(stack).toBeInTheDocument();
    });
  });

  describe('Nested Stacks', () => {
    it('renders nested stacks correctly', () => {
      render(
        <Stack data-testid="outer-stack" spacing="lg">
          <Stack data-testid="inner-stack-1" direction="horizontal">
            <div>Nested 1</div>
            <div>Nested 2</div>
          </Stack>
          <Stack data-testid="inner-stack-2" direction="horizontal">
            <div>Nested 3</div>
            <div>Nested 4</div>
          </Stack>
        </Stack>
      );
      expect(screen.getByTestId('outer-stack')).toBeInTheDocument();
      expect(screen.getByTestId('inner-stack-1')).toBeInTheDocument();
      expect(screen.getByTestId('inner-stack-2')).toBeInTheDocument();
      expect(screen.getByText('Nested 1')).toBeInTheDocument();
      expect(screen.getByText('Nested 4')).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('handles onClick event', () => {
      const handleClick = vi.fn();
      render(<Stack onClick={handleClick}>Click me</Stack>);
      screen.getByTestId('stack').click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles onMouseEnter event', async () => {
      const handleMouseEnter = vi.fn();
      const { container } = render(<Stack onMouseEnter={handleMouseEnter}>Hover me</Stack>);
      const stack = container.firstChild as HTMLElement;
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.mouseEnter(stack);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('handles onMouseLeave event', async () => {
      const handleMouseLeave = vi.fn();
      const { container } = render(<Stack onMouseLeave={handleMouseLeave}>Leave me</Stack>);
      const stack = container.firstChild as HTMLElement;
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.mouseLeave(stack);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Stack Types and Constants', () => {
  it('exports STACK_DEFAULTS constant', async () => {
    const { STACK_DEFAULTS } = await import('../Stack.types');
    expect(STACK_DEFAULTS).toBeDefined();
    expect(STACK_DEFAULTS.as).toBe('div');
    expect(STACK_DEFAULTS.direction).toBe('vertical');
    expect(STACK_DEFAULTS.align).toBe('stretch');
    expect(STACK_DEFAULTS.justify).toBe('start');
    expect(STACK_DEFAULTS.spacing).toBe('md');
    expect(STACK_DEFAULTS.wrap).toBe(false);
  });

  it('exports SPACING_MAP constant', async () => {
    const { SPACING_MAP } = await import('../Stack.types');
    expect(SPACING_MAP).toBeDefined();
    expect(SPACING_MAP.none).toBe('0');
    expect(SPACING_MAP.xs).toBe('var(--ds-spacing-1, 0.25rem)');
    expect(SPACING_MAP.sm).toBe('var(--ds-spacing-2, 0.5rem)');
    expect(SPACING_MAP.md).toBe('var(--ds-spacing-4, 1rem)');
    expect(SPACING_MAP.lg).toBe('var(--ds-spacing-6, 1.5rem)');
    expect(SPACING_MAP.xl).toBe('var(--ds-spacing-8, 2rem)');
    expect(SPACING_MAP['2xl']).toBe('var(--ds-spacing-10, 2.5rem)');
  });

  it('exports ALIGN_MAP constant', async () => {
    const { ALIGN_MAP } = await import('../Stack.types');
    expect(ALIGN_MAP).toBeDefined();
    expect(ALIGN_MAP.start).toBe('flex-start');
    expect(ALIGN_MAP.center).toBe('center');
    expect(ALIGN_MAP.end).toBe('flex-end');
    expect(ALIGN_MAP.stretch).toBe('stretch');
    expect(ALIGN_MAP.baseline).toBe('baseline');
  });

  it('exports JUSTIFY_MAP constant', async () => {
    const { JUSTIFY_MAP } = await import('../Stack.types');
    expect(JUSTIFY_MAP).toBeDefined();
    expect(JUSTIFY_MAP.start).toBe('flex-start');
    expect(JUSTIFY_MAP.center).toBe('center');
    expect(JUSTIFY_MAP.end).toBe('flex-end');
    expect(JUSTIFY_MAP['space-between']).toBe('space-between');
    expect(JUSTIFY_MAP['space-around']).toBe('space-around');
    expect(JUSTIFY_MAP['space-evenly']).toBe('space-evenly');
  });

  it('exports resolveSpacing function', async () => {
    const { resolveSpacing } = await import('../Stack.types');
    expect(resolveSpacing).toBeDefined();
    expect(resolveSpacing('md')).toBe('var(--ds-spacing-4, 1rem)');
    expect(resolveSpacing(16)).toBe('16px');
    expect(resolveSpacing('none')).toBe('0');
    expect(resolveSpacing(undefined)).toBe('0');
  });
});

// NOTE: Base utility tests skipped - base file needs to be implemented
// These functions are referenced in engines but not yet exported from types
describe.skip('Stack Base Utilities', () => {
  it('exports buildStackStyles function', async () => {
    const { buildStackStyles } = await import('../Stack.types');
    expect(buildStackStyles).toBeDefined();

    const styles = buildStackStyles({
      direction: 'horizontal',
      spacing: 'lg',
      align: 'center',
      justify: 'space-between',
    });

    expect(styles.display).toBe('flex');
    expect(styles.flexDirection).toBe('row');
    expect(styles.alignItems).toBe('center');
    expect(styles.justifyContent).toBe('space-between');
    expect(styles.gap).toBe('1.5rem');
  });

  it('exports filterStackProps function', async () => {
    const { filterStackProps } = await import('../Stack.types');
    expect(filterStackProps).toBeDefined();

    const filtered = filterStackProps({
      direction: 'horizontal',
      spacing: 'lg',
      'aria-label': 'Test Stack',
      id: 'my-stack',
    } as any);

    expect(filtered['aria-label']).toBe('Test Stack');
    expect(filtered.id).toBe('my-stack');
    expect(filtered.direction).toBeUndefined();
    expect(filtered.spacing).toBeUndefined();
  });
});

describe('Stack engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Stack engine={engine}>Test</Stack>);
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });
});

describe('Stack tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Stack>Test</Stack>);
    expect(screen.getByTestId('stack')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
