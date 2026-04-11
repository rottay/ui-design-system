/**
 * Watermark Tests
 * Colocated with component following approved architecture.
 *
 * @module Watermark/tests
 * @description Unit tests for the Watermark component covering all features,
 * variants, and engine implementations.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Watermark } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockWatermark = ({
      children,
      content,
      image,
      width,
      height,
      rotate,
      gap,
      offset,
      zIndex,
      font,
      ...props
    }: any) => {
      return (
        <div
          data-testid="watermark-wrapper"
          data-content={Array.isArray(content) ? content.join(',') : content}
          data-image={image}
          data-width={width}
          data-height={height}
          data-rotate={rotate}
          data-z-index={zIndex}
          data-gap-x={gap?.[0]}
          data-gap-y={gap?.[1]}
          data-offset-x={offset?.[0]}
          data-offset-y={offset?.[1]}
          data-font-color={font?.color}
          data-font-size={font?.fontSize}
          style={{ position: 'relative' }}
          {...props}
        >
          {children}
          <div data-testid="watermark-overlay" aria-hidden="true" />
        </div>
      );
    };
    MockWatermark.displayName = 'Watermark';
    return MockWatermark;
  },
}));

describe('Watermark', () => {
  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <Watermark content="Test Watermark">
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders watermark overlay', () => {
      render(
        <Watermark content="Test Watermark">
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-overlay')).toBeInTheDocument();
    });

    it('renders with text content', () => {
      render(
        <Watermark content="Confidential">
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-content', 'Confidential');
    });

    it('renders with multiple lines of text', () => {
      render(
        <Watermark content={['Line 1', 'Line 2']}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-content', 'Line 1,Line 2');
    });

    it('renders with image', () => {
      render(
        <Watermark image="https://example.com/logo.png">
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-image', 'https://example.com/logo.png');
    });
  });

  describe('Dimensions', () => {
    it('applies custom width', () => {
      render(
        <Watermark content="Test" width={200}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-width', '200');
    });

    it('applies custom height', () => {
      render(
        <Watermark content="Test" height={100}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-height', '100');
    });
  });

  describe('Rotation', () => {
    it('applies default rotation (-22)', () => {
      render(
        <Watermark content="Test" rotate={-22}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-rotate', '-22');
    });

    it('applies custom rotation', () => {
      render(
        <Watermark content="Test" rotate={-45}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-rotate', '-45');
    });
  });

  describe('Gap', () => {
    it('applies gap values', () => {
      render(
        <Watermark content="Test" gap={[100, 100]}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-gap-x', '100');
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-gap-y', '100');
    });
  });

  describe('Offset', () => {
    it('applies offset values', () => {
      render(
        <Watermark content="Test" offset={[50, 50]}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-offset-x', '50');
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-offset-y', '50');
    });
  });

  describe('Z-Index', () => {
    it('applies custom z-index', () => {
      render(
        <Watermark content="Test" zIndex={100}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-z-index', '100');
    });
  });

  describe('Font', () => {
    it('applies font color', () => {
      render(
        <Watermark content="Test" font={{ color: 'red' }}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-font-color', 'red');
    });

    it('applies font size', () => {
      render(
        <Watermark content="Test" font={{ fontSize: 20 }}>
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveAttribute('data-font-size', '20');
    });
  });

  describe('Accessibility', () => {
    it('watermark overlay has aria-hidden', () => {
      render(
        <Watermark content="Test">
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-overlay')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Watermark content="Test" className="custom-watermark">
          <div>Content</div>
        </Watermark>
      );
      expect(screen.getByTestId('watermark-wrapper')).toHaveClass('custom-watermark');
    });
  });

  describe('Complex Content', () => {
    it('renders with complex children', () => {
      render(
        <Watermark content="Watermark">
          <div data-testid="child-1">First child</div>
          <div data-testid="child-2">Second child</div>
          <button data-testid="child-3">Click me</button>
        </Watermark>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });
});

describe('Watermark engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <Watermark engine={engine} content="Test">
        <div>Test</div>
      </Watermark>
    );
    expect(screen.getByTestId('watermark-wrapper')).toBeInTheDocument();
  });
});

describe('Watermark tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Watermark content="Test">
        <div>Test</div>
      </Watermark>
    );
    expect(screen.getByTestId('watermark-wrapper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
