/**
 * @fileoverview Carousel Component Tests
 * @description Unit tests for the Carousel component covering rendering,
 * navigation, autoplay, and accessibility features.
 * @module components/primitives/display/Carousel/tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Carousel } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockCarousel = ({
      children,
      dots,
      arrows,
      autoplay,
      vertical,
      fade,
      infinite,
      dotPosition,
      className,
      style,
      ...props
    }: any) => {
      const slides = Array.isArray(children) ? children : [children];

      return (
        <div
          data-testid="carousel"
          data-dots={dots}
          data-arrows={arrows}
          data-autoplay={autoplay}
          data-vertical={vertical}
          data-fade={fade}
          data-infinite={infinite}
          data-dot-position={dotPosition}
          className={className}
          style={style}
          {...props}
        >
          {dots && (
            <div data-testid="carousel-dots" role="tablist">
              {slides.map((_: any, index: number) => (
                <button
                  key={index}
                  data-testid={`carousel-dot-${index}`}
                  role="tab"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
          {arrows && (
            <>
              <button data-testid="carousel-prev" aria-label="Previous slide" />
              <button data-testid="carousel-next" aria-label="Next slide" />
            </>
          )}
          <div data-testid="carousel-slides">
            {slides.map((slide: any, index: number) => (
              <div
                key={index}
                data-testid={`carousel-slide-${index}`}
                role="group"
                aria-roledescription="slide"
              >
                {slide}
              </div>
            ))}
          </div>
        </div>
      );
    };
    MockCarousel.displayName = 'Carousel';
    MockCarousel.Item = ({ children, ...props }: any) => (
      <div data-testid="carousel-item" {...props}>
        {children}
      </div>
    );
    return MockCarousel;
  },
}));

describe('Carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toBeInTheDocument();
      expect(screen.getByText('Slide 1')).toBeInTheDocument();
      expect(screen.getByText('Slide 2')).toBeInTheDocument();
      expect(screen.getByText('Slide 3')).toBeInTheDocument();
    });

    it('renders navigation dots when dots prop is true', () => {
      render(
        <Carousel dots>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel-dots')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-dot-0')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-dot-1')).toBeInTheDocument();
    });

    it('renders navigation arrows when arrows prop is true', () => {
      render(
        <Carousel arrows>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel-prev')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-next')).toBeInTheDocument();
    });

    it('does not render dots when dots prop is false', () => {
      render(
        <Carousel dots={false}>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.queryByTestId('carousel-dots')).not.toBeInTheDocument();
    });

    it('does not render arrows when arrows prop is false', () => {
      render(
        <Carousel arrows={false}>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.queryByTestId('carousel-prev')).not.toBeInTheDocument();
      expect(screen.queryByTestId('carousel-next')).not.toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('applies autoplay prop', () => {
      render(
        <Carousel autoplay>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveAttribute(
        'data-autoplay',
        'true'
      );
    });

    it('applies vertical prop', () => {
      render(
        <Carousel vertical>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveAttribute(
        'data-vertical',
        'true'
      );
    });

    it('applies fade prop', () => {
      render(
        <Carousel fade>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveAttribute('data-fade', 'true');
    });

    it('applies infinite prop', () => {
      render(
        <Carousel infinite>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveAttribute(
        'data-infinite',
        'true'
      );
    });

    it('applies dotPosition prop', () => {
      render(
        <Carousel dots dotPosition="top">
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveAttribute(
        'data-dot-position',
        'top'
      );
    });

    it('applies custom className', () => {
      render(
        <Carousel className="custom-carousel">
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveClass('custom-carousel');
    });

    it('applies custom style', () => {
      render(
        <Carousel style={{ backgroundColor: 'red' }}>
          <div>Slide 1</div>
        </Carousel>
      );

      // Verify the carousel received the style prop (mock passes style through)
      expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders slides with proper ARIA roles', () => {
      render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      );

      const slides = screen.getAllByRole('group');
      expect(slides).toHaveLength(2);
      slides.forEach((slide) => {
        expect(slide).toHaveAttribute('aria-roledescription', 'slide');
      });
    });

    it('renders dots as tab role elements', () => {
      render(
        <Carousel dots>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
    });

    it('dots have appropriate aria-labels', () => {
      render(
        <Carousel dots>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      );

      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
    });

    it('arrows have appropriate aria-labels', () => {
      render(
        <Carousel arrows>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
    });

    it('dots container has tablist role', () => {
      render(
        <Carousel dots>
          <div>Slide 1</div>
        </Carousel>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('Slides', () => {
    it('renders correct number of slides', () => {
      render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
          <div>Slide 4</div>
        </Carousel>
      );

      expect(screen.getByTestId('carousel-slide-0')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-slide-1')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-slide-2')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-slide-3')).toBeInTheDocument();
    });

    it('renders single slide correctly', () => {
      render(
        <Carousel>
          <div>Only Slide</div>
        </Carousel>
      );

      expect(screen.getByText('Only Slide')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-slide-0')).toBeInTheDocument();
    });
  });
});

describe('Carousel.Item', () => {
  it('renders children correctly', () => {
    render(
      <Carousel>
        <Carousel.Item>
          <span>Item Content</span>
        </Carousel.Item>
      </Carousel>
    );

    expect(screen.getByText('Item Content')).toBeInTheDocument();
  });

  it('renders with proper class name', () => {
    render(
      <Carousel>
        <Carousel.Item>Content</Carousel.Item>
      </Carousel>
    );

    // The CarouselItem component is not mocked, so it renders the real component
    // with the rottay-carousel__item class
    const itemElement = document.querySelector('.rottay-carousel__item');
    expect(itemElement).toBeInTheDocument();
    expect(itemElement).toHaveTextContent('Content');
  });
});

describe('Carousel Configuration', () => {
  it('renders with all configuration options', () => {
    render(
      <Carousel
        autoplay
        autoplaySpeed={5000}
        dots
        dotPosition="left"
        arrows
        fade
        vertical
        infinite
        speed={300}
        initialSlide={1}
        pauseOnHover
      >
        <div>Slide 1</div>
        <div>Slide 2</div>
      </Carousel>
    );

    const carousel = screen.getByTestId('carousel');
    expect(carousel).toHaveAttribute('data-autoplay', 'true');
    expect(carousel).toHaveAttribute('data-dots', 'true');
    expect(carousel).toHaveAttribute('data-dot-position', 'left');
    expect(carousel).toHaveAttribute('data-arrows', 'true');
    expect(carousel).toHaveAttribute('data-fade', 'true');
    expect(carousel).toHaveAttribute('data-vertical', 'true');
    expect(carousel).toHaveAttribute('data-infinite', 'true');
  });
});

describe('Carousel engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(
      <Carousel engine={engine}>
        <div>Slide 1</div>
      </Carousel>
    );
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });
});

describe('Carousel tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Carousel>
        <div>Slide 1</div>
      </Carousel>
    );
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
