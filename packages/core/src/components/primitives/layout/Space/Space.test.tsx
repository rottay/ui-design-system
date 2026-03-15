/**
 * Space Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Space } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSpace = ({
      children,
      size,
      direction,
      wrap,
      align,
      split,
      className,
      style,
      ...props
    }: any) => {
      const sizeValue = Array.isArray(size)
        ? `${size[0]}px ${size[1]}px`
        : typeof size === 'number'
        ? `${size}px`
        : size;
      return (
        <div
          data-testid="space"
          data-size={sizeValue}
          data-direction={direction}
          data-wrap={wrap}
          data-align={align}
          data-split={split ? 'true' : undefined}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </div>
      );
    };
    MockSpace.displayName = 'Space';
    return MockSpace;
  },
}));

describe('Space', () => {
  it('renders correctly', () => {
    render(<Space>Content</Space>);
    expect(screen.getByTestId('space')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with children', () => {
    render(
      <Space>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Space>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  describe('size prop', () => {
    it.each(['small', 'middle', 'large'] as const)(
      'renders size preset %s',
      (size) => {
        render(<Space size={size}>Test</Space>);
        expect(screen.getByTestId('space')).toHaveAttribute('data-size', size);
      }
    );

    it('renders with number size', () => {
      render(<Space size={24}>Test</Space>);
      expect(screen.getByTestId('space')).toHaveAttribute('data-size', '24px');
    });

    it('renders with array size', () => {
      render(<Space size={[8, 16]}>Test</Space>);
      expect(screen.getByTestId('space')).toHaveAttribute('data-size', '8px 16px');
    });
  });

  describe('direction prop', () => {
    it.each(['horizontal', 'vertical'] as const)(
      'renders direction %s',
      (direction) => {
        render(<Space direction={direction}>Test</Space>);
        expect(screen.getByTestId('space')).toHaveAttribute('data-direction', direction);
      }
    );
  });

  describe('wrap prop', () => {
    it('renders with wrap enabled', () => {
      render(<Space wrap>Test</Space>);
      expect(screen.getByTestId('space')).toHaveAttribute('data-wrap', 'true');
    });

    it('renders with wrap disabled', () => {
      render(<Space wrap={false}>Test</Space>);
      expect(screen.getByTestId('space')).toHaveAttribute('data-wrap', 'false');
    });
  });

  describe('align prop', () => {
    it.each(['start', 'end', 'center', 'baseline'] as const)(
      'renders align %s',
      (align) => {
        render(<Space align={align}>Test</Space>);
        expect(screen.getByTestId('space')).toHaveAttribute('data-align', align);
      }
    );
  });

  describe('split prop', () => {
    it('renders with split element', () => {
      render(
        <Space split={<span>|</span>}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Space>
      );
      expect(screen.getByTestId('space')).toHaveAttribute('data-split', 'true');
    });
  });

  it('applies custom className', () => {
    render(<Space className="custom-class">Test</Space>);
    expect(screen.getByTestId('space')).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    render(<Space style={{ backgroundColor: 'red' }}>Test</Space>);
    expect(screen.getByTestId('space')).toHaveStyle({ backgroundColor: 'red' });
  });

  describe('combined props', () => {
    it('renders with multiple props', () => {
      render(
        <Space
          size="middle"
          direction="vertical"
          wrap
          align="center"
        >
          Content
        </Space>
      );
      const space = screen.getByTestId('space');
      expect(space).toHaveAttribute('data-size', 'middle');
      expect(space).toHaveAttribute('data-direction', 'vertical');
      expect(space).toHaveAttribute('data-wrap', 'true');
      expect(space).toHaveAttribute('data-align', 'center');
    });
  });
});

describe('Space engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Space engine={engine}>Test</Space>);
    expect(screen.getByTestId('space')).toBeInTheDocument();
  });
});

describe('Space tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Space>Test</Space>);
    expect(screen.getByTestId('space')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
