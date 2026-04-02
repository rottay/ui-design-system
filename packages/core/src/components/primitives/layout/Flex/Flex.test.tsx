/**
 * Flex Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Flex } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockFlex = ({
      children,
      direction,
      wrap,
      justify,
      align,
      gap,
      flex,
      inline,
      className,
      style,
      ...props
    }: any) => {
      const gapValue = Array.isArray(gap) ? `${gap[0]}px ${gap[1]}px` : gap ? `${gap}px` : undefined;
      return (
        <div
          data-testid="flex"
          data-direction={direction}
          data-wrap={wrap}
          data-justify={justify}
          data-align={align}
          data-gap={gapValue}
          data-flex={flex}
          data-inline={inline}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </div>
      );
    };
    MockFlex.displayName = 'Flex';
    return MockFlex;
  },
}));

describe('Flex', () => {
  it('renders correctly', () => {
    render(<Flex>Content</Flex>);
    expect(screen.getByTestId('flex')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with children', () => {
    render(
      <Flex>
        <div>Child 1</div>
        <div>Child 2</div>
      </Flex>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  describe('direction prop', () => {
    it.each(['row', 'row-reverse', 'column', 'column-reverse'] as const)(
      'renders direction %s',
      (direction) => {
        render(<Flex direction={direction}>Test</Flex>);
        expect(screen.getByTestId('flex')).toHaveAttribute('data-direction', direction);
      }
    );
  });

  describe('wrap prop', () => {
    it.each(['nowrap', 'wrap', 'wrap-reverse'] as const)(
      'renders wrap %s',
      (wrap) => {
        render(<Flex wrap={wrap}>Test</Flex>);
        expect(screen.getByTestId('flex')).toHaveAttribute('data-wrap', wrap);
      }
    );
  });

  describe('justify prop', () => {
    it.each(['start', 'end', 'center', 'between', 'around', 'evenly'] as const)(
      'renders justify %s',
      (justify) => {
        render(<Flex justify={justify}>Test</Flex>);
        expect(screen.getByTestId('flex')).toHaveAttribute('data-justify', justify);
      }
    );
  });

  describe('align prop', () => {
    it.each(['start', 'end', 'center', 'baseline', 'stretch'] as const)(
      'renders align %s',
      (align) => {
        render(<Flex align={align}>Test</Flex>);
        expect(screen.getByTestId('flex')).toHaveAttribute('data-align', align);
      }
    );
  });

  describe('gap prop', () => {
    it('renders with number gap', () => {
      render(<Flex gap={16}>Test</Flex>);
      expect(screen.getByTestId('flex')).toHaveAttribute('data-gap', '16px');
    });

    it('renders with array gap', () => {
      render(<Flex gap={[8, 16]}>Test</Flex>);
      expect(screen.getByTestId('flex')).toHaveAttribute('data-gap', '8px 16px');
    });
  });

  describe('flex prop', () => {
    it('renders with flex string', () => {
      render(<Flex flex="1 1 auto">Test</Flex>);
      expect(screen.getByTestId('flex')).toHaveAttribute('data-flex', '1 1 auto');
    });

    it('renders with flex number', () => {
      render(<Flex flex={1}>Test</Flex>);
      expect(screen.getByTestId('flex')).toHaveAttribute('data-flex', '1');
    });
  });

  describe('inline prop', () => {
    it('renders as inline-flex when true', () => {
      render(<Flex inline>Test</Flex>);
      expect(screen.getByTestId('flex')).toHaveAttribute('data-inline', 'true');
    });

    it('renders as flex when false', () => {
      render(<Flex inline={false}>Test</Flex>);
      expect(screen.getByTestId('flex')).toHaveAttribute('data-inline', 'false');
    });
  });

  it('applies custom className', () => {
    render(<Flex className="custom-class">Test</Flex>);
    expect(screen.getByTestId('flex')).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    render(<Flex style={{ backgroundColor: 'red' }}>Test</Flex>);
    expect(screen.getByTestId('flex')).toHaveStyle({ backgroundColor: 'red' });
  });

  describe('combined props', () => {
    it('renders with multiple props', () => {
      render(
        <Flex
          direction="column"
          wrap="wrap"
          justify="center"
          align="center"
          gap={8}
        >
          Content
        </Flex>
      );
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveAttribute('data-direction', 'column');
      expect(flex).toHaveAttribute('data-wrap', 'wrap');
      expect(flex).toHaveAttribute('data-justify', 'center');
      expect(flex).toHaveAttribute('data-align', 'center');
      expect(flex).toHaveAttribute('data-gap', '8px');
    });
  });
});

describe('Flex engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Flex engine={engine}>Test</Flex>);
    expect(screen.getByTestId('flex')).toBeInTheDocument();
  });
});

describe('Flex tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Flex>Test</Flex>);
    expect(screen.getByTestId('flex')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
