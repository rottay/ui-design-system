/**
 * Image Tests
 * Colocated with component following approved architecture.
 *
 * Tests Image component functionality across all engines.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Image } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockImage = ({
      src,
      alt,
      width,
      height,
      radius,
      bordered,
      shadow,
      zoomable,
      onClick,
      className,
      ...props
    }: any) => (
      <div
        data-testid="image-container"
        data-radius={radius}
        data-bordered={bordered}
        data-shadow={shadow}
        data-zoomable={zoomable}
        className={className}
        onClick={onClick}
        {...props}
      >
        <img
          data-testid="image"
          src={src}
          alt={alt}
          width={width}
          height={height}
        />
      </div>
    );
    MockImage.displayName = 'Image';
    return MockImage;
  },
}));

describe('Image', () => {
  /**
   * Basic rendering tests
   */
  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      render(<Image src="https://example.com/image.jpg" alt="Test image" />);
      const img = screen.getByTestId('image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('renders with width and height', () => {
      render(
        <Image
          src="https://example.com/image.jpg"
          alt="Test image"
          width={400}
          height={300}
        />
      );
      const img = screen.getByTestId('image');
      expect(img).toHaveAttribute('width', '400');
      expect(img).toHaveAttribute('height', '300');
    });

    it('applies custom className', () => {
      render(
        <Image
          src="https://example.com/image.jpg"
          alt="Test image"
          className="custom-class"
        />
      );
      expect(screen.getByTestId('image-container')).toHaveClass('custom-class');
    });
  });

  /**
   * Radius variants tests
   */
  describe('Radius variants', () => {
    it.each(['none', 'sm', 'md', 'lg', 'full'] as const)(
      'renders with radius %s',
      (radius) => {
        render(
          <Image
            src="https://example.com/image.jpg"
            alt="Test image"
            radius={radius}
          />
        );
        expect(screen.getByTestId('image-container')).toHaveAttribute(
          'data-radius',
          radius
        );
      }
    );
  });

  /**
   * Style options tests
   */
  describe('Style options', () => {
    it('renders with bordered prop', () => {
      render(
        <Image
          src="https://example.com/image.jpg"
          alt="Test image"
          bordered
        />
      );
      expect(screen.getByTestId('image-container')).toHaveAttribute(
        'data-bordered',
        'true'
      );
    });

    it('renders with shadow prop', () => {
      render(
        <Image
          src="https://example.com/image.jpg"
          alt="Test image"
          shadow
        />
      );
      expect(screen.getByTestId('image-container')).toHaveAttribute(
        'data-shadow',
        'true'
      );
    });

    it('renders with zoomable prop', () => {
      render(
        <Image
          src="https://example.com/image.jpg"
          alt="Test image"
          zoomable
        />
      );
      expect(screen.getByTestId('image-container')).toHaveAttribute(
        'data-zoomable',
        'true'
      );
    });
  });

  /**
   * Click handler tests
   */
  describe('Click handling', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(
        <Image
          src="https://example.com/image.jpg"
          alt="Test image"
          onClick={handleClick}
        />
      );
      fireEvent.click(screen.getByTestId('image-container'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * Image.Skeleton compound component tests
 */
describe('Image.Skeleton', () => {
  it('renders skeleton with correct dimensions', () => {
    render(<Image.Skeleton width={200} height={150} />);
    const skeleton = document.querySelector('.rottay-image-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders skeleton with radius', () => {
    const { container } = render(<Image.Skeleton width={200} height={150} radius="lg" />);
    const skeleton = container.querySelector('.rottay-image-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('is hidden from screen readers', () => {
    const { container } = render(<Image.Skeleton width={200} height={150} />);
    const skeleton = container.querySelector('.rottay-image-skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });
});

/**
 * Image.Fallback compound component tests
 */
describe('Image.Fallback', () => {
  it('renders fallback with default icon', () => {
    const { container } = render(<Image.Fallback width={200} height={150} />);
    const fallback = container.querySelector('.rottay-image-fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders fallback with custom content', () => {
    render(
      <Image.Fallback width={200} height={150}>
        <span data-testid="custom-content">Custom fallback</span>
      </Image.Fallback>
    );
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('has appropriate accessibility attributes', () => {
    const { container } = render(<Image.Fallback width={200} height={150} />);
    const fallback = container.querySelector('.rottay-image-fallback');
    expect(fallback).toHaveAttribute('role', 'img');
    expect(fallback).toHaveAttribute('aria-label', 'Image failed to load');
  });
});

/**
 * Accessibility tests
 */
describe('Accessibility', () => {
  it('has alt text for accessibility', () => {
    render(<Image src="https://example.com/image.jpg" alt="Descriptive alt text" />);
    expect(screen.getByAltText('Descriptive alt text')).toBeInTheDocument();
  });
});

describe('Image engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Image engine={engine} src="https://example.com/image.jpg" alt="Test" />);
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
  });
});

describe('Image tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Image src="https://example.com/image.jpg" alt="Test" />);
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
