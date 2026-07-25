/**
 * @fileoverview Carousel Real-Engine Tests (K4-C Pass 1)
 * @description Exercises the REAL modern engine (no factory mock): paint-ownership
 * contract (no DaisyUI literals, skin scope classes, data-part vocabulary),
 * RTL logical placement, and navigation behavior. Classic/Rustic parity is
 * covered by the mocked contract suite; this file pins the modern engine.
 * @module components/primitives/display/Carousel/tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ModernCarousel from '../engines/modern';
import type { CarouselRef } from '../contracts';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const THREE_SLIDES = [
  <div key="1">Slide 1</div>,
  <div key="2">Slide 2</div>,
  <div key="3">Slide 3</div>,
];

describe('Carousel modern real engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('paint ownership', () => {
    it('emits no DaisyUI class literals on any part', () => {
      const { container } = render(
        <ModernCarousel arrows dots vertical>
          {THREE_SLIDES}
        </ModernCarousel>,
      );

      const daisyClasses = ['carousel', 'carousel-vertical', 'carousel-inner', 'carousel-item'];
      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root).not.toBeNull();
      for (const cls of daisyClasses) {
        expect(root.classList.contains(cls)).toBe(false);
      }
      container
        .querySelectorAll('[data-part="track"], [data-part="slide"]')
        .forEach((el) => {
          for (const cls of daisyClasses) {
            expect(el.classList.contains(cls)).toBe(false);
          }
        });
    });

    it('stamps the skin scope classes and data-part vocabulary', () => {
      const { container } = render(
        <ModernCarousel arrows dots>{THREE_SLIDES}</ModernCarousel>,
      );

      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      expect(root.classList.contains('rottay-carousel')).toBe(true);
      expect(root.classList.contains('rottay-carousel--modern')).toBe(true);
      expect(container.querySelectorAll('[data-part="track"]').length).toBe(1);
      expect(container.querySelectorAll('[data-part="slide"]').length).toBe(3);
      expect(container.querySelectorAll('[data-part="arrow"]').length).toBe(2);
      expect(container.querySelectorAll('[data-part="dot"]').length).toBe(3);
      expect(container.querySelector('[data-part="dots"]')).not.toBeNull();
    });
  });

  describe('RTL logical placement', () => {
    it('positions arrows with logical inset-inline utilities, never physical left/right', () => {
      render(<ModernCarousel arrows>{THREE_SLIDES}</ModernCarousel>);

      const prev = screen.getByLabelText('Previous slide');
      const next = screen.getByLabelText('Next slide');
      expect(prev.className).toContain('start-2');
      expect(prev.className).not.toContain('left-2');
      expect(next.className).toContain('end-2');
      expect(next.className).not.toContain('right-2');
    });

    it('positions lateral dots with logical utilities; top/bottom keep direction-invariant centering', () => {
      const { container, rerender } = render(
        <ModernCarousel dots dotPosition="left">{THREE_SLIDES}</ModernCarousel>,
      );
      const dots = container.querySelector('[data-part="dots"]') as HTMLElement;
      expect(dots.className).toContain('start-2');

      rerender(<ModernCarousel dots dotPosition="right">{THREE_SLIDES}</ModernCarousel>);
      expect(dots.className).toContain('end-2');

      rerender(<ModernCarousel dots dotPosition="bottom">{THREE_SLIDES}</ModernCarousel>);
      // Direction-invariant horizontal centering stays physical on purpose.
      expect(dots.className).toContain('left-1/2');
    });

    it('rides the horizontal slide offset on --ds-carousel-rtl-factor', () => {
      const { container } = render(<ModernCarousel>{THREE_SLIDES}</ModernCarousel>);
      const slide = container.querySelector('[data-part="slide"]') as HTMLElement;
      expect(slide.style.getPropertyValue('--ds-carousel-slide-transform')).toContain(
        'var(--ds-carousel-rtl-factor, 1)',
      );
    });
  });

  describe('navigation behavior', () => {
    it('navigates via dots and arrows with data-selected moving', () => {
      const beforeChange = vi.fn();
      const afterChange = vi.fn();
      const { container } = render(
        <ModernCarousel arrows beforeChange={beforeChange} afterChange={afterChange}>
          {THREE_SLIDES}
        </ModernCarousel>,
      );

      const slides = container.querySelectorAll('[data-part="slide"]');
      expect(slides[0].getAttribute('data-selected')).toBe('true');

      fireEvent.click(screen.getByLabelText('Go to slide 3'));
      expect(beforeChange).toHaveBeenCalledWith(0, 2);
      expect(afterChange).toHaveBeenCalledWith(2);
      expect(slides[2].getAttribute('data-selected')).toBe('true');

      fireEvent.click(screen.getByLabelText('Next slide'));
      // infinite default: wraps to the first slide
      expect(slides[0].getAttribute('data-selected')).toBe('true');

      fireEvent.click(screen.getByLabelText('Previous slide'));
      expect(slides[2].getAttribute('data-selected')).toBe('true');
    });

    it('clamps at boundaries when infinite is false', () => {
      const { container } = render(
        <ModernCarousel arrows infinite={false}>{THREE_SLIDES}</ModernCarousel>,
      );
      const slides = container.querySelectorAll('[data-part="slide"]');

      fireEvent.click(screen.getByLabelText('Previous slide'));
      expect(slides[0].getAttribute('data-selected')).toBe('true');

      fireEvent.click(screen.getByLabelText('Go to slide 3'));
      fireEvent.click(screen.getByLabelText('Next slide'));
      expect(slides[2].getAttribute('data-selected')).toBe('true');
    });

    it('exposes imperative goTo/next/prev via ref', () => {
      const ref = React.createRef<CarouselRef>();
      const { container } = render(
        <ModernCarousel ref={ref}>{THREE_SLIDES}</ModernCarousel>,
      );
      const slides = container.querySelectorAll('[data-part="slide"]');

      act(() => ref.current?.goTo(1));
      expect(slides[1].getAttribute('data-selected')).toBe('true');
      act(() => ref.current?.next());
      expect(slides[2].getAttribute('data-selected')).toBe('true');
      act(() => ref.current?.prev());
      expect(slides[1].getAttribute('data-selected')).toBe('true');
    });

    it('autoplays on an interval and pauses on hover', () => {
      const { container } = render(
        <ModernCarousel autoplay autoplaySpeed={1000} pauseOnHover>
          {THREE_SLIDES}
        </ModernCarousel>,
      );
      const slides = container.querySelectorAll('[data-part="slide"]');
      const root = container.querySelector('[data-part="root"]') as HTMLElement;

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(slides[1].getAttribute('data-selected')).toBe('true');

      fireEvent.mouseEnter(root);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(slides[1].getAttribute('data-selected')).toBe('true');

      fireEvent.mouseLeave(root);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(slides[2].getAttribute('data-selected')).toBe('true');
    });
  });

  describe('i18n channel (K4-C)', () => {
    it('renders documented English fallbacks with a provider mounted and catalog keys absent', () => {
      // The other suites in this file already prove the no-provider path:
      // they render without an I18nProvider and query the English labels.
      // This test pins the same outcome through a provider WITH the catalog
      // keys still absent — the missing key echoes the raw key back and the
      // endsWith guard falls back to the documented English literal.
      const { container } = renderWithEngine(
        <ModernCarousel arrows dots>{THREE_SLIDES}</ModernCarousel>,
        'modern',
      );

      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Carousel navigation')).toBeInTheDocument();
      expect(container.querySelector('[data-part="slide"]')).toHaveAttribute(
        'aria-label',
        'Slide 1 of 3',
      );
    });
  });

  describe('skin rules (K4-C Pass 2)', () => {
    const skin = readFileSync(
      resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/carousel.css'),
      'utf8',
    );

    it('owns arrow size with a coarse-pointer 44px floor (touch law)', () => {
      expect(skin).toContain('inline-size: calc(var(--ds-carousel-arrow-size, 32px) * var(--ds-density-effective-scale, 1));');
      expect(skin).toContain('@media (pointer: coarse)');
      expect(skin).toContain('var(--ds-carousel-arrow-size-coarse, 44px);');
    });

    it('halos the dots so they read on any slide background', () => {
      // The selected primary dot was invisible on a primary slide (measured
      // teal-on-teal); both states now carry a ring.
      expect(skin).toContain("--ds-carousel-dot-halo, var(--ds-color-alpha-white-70)");
      expect(skin).toContain("--ds-carousel-dot-ring, var(--ds-color-alpha-black-20)");
    });

    it('keeps arrow geometry out of the engine inline style', () => {
      const { container } = render(<ModernCarousel arrows>{THREE_SLIDES}</ModernCarousel>);
      const prev = container.querySelector('[data-part="arrow"]') as HTMLElement;
      expect(prev.style.width).toBe('');
      expect(prev.style.height).toBe('');
      expect(prev.style.fontSize).toBe('');
    });
  });

  describe('modes', () => {
    it('fade mode toggles opacity and uses no translation', () => {
      const { container } = render(
        <ModernCarousel fade>{THREE_SLIDES}</ModernCarousel>,
      );
      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      const slides = container.querySelectorAll('[data-part="slide"]');

      expect(root.getAttribute('data-fade')).toBe('true');
      expect(slides[0].style.opacity).toBe('1');
      expect(slides[1].style.opacity).toBe('0');
      expect(slides[1].style.getPropertyValue('--ds-carousel-slide-transform')).toBe('none');

      fireEvent.click(screen.getByLabelText('Go to slide 2'));
      expect(slides[0].style.opacity).toBe('0');
      expect(slides[1].style.opacity).toBe('1');
    });

    it('vertical mode stamps data-vertical, translateY offsets, and vertical glyphs', () => {
      const { container } = render(
        <ModernCarousel vertical arrows>{THREE_SLIDES}</ModernCarousel>,
      );
      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      const slide = container.querySelector('[data-part="slide"]') as HTMLElement;

      expect(root.getAttribute('data-vertical')).toBe('true');
      expect(slide.style.getPropertyValue('--ds-carousel-slide-transform')).toContain('translateY');
      expect(screen.getByLabelText('Previous slide').textContent).toBe('↑');
      expect(screen.getByLabelText('Next slide').textContent).toBe('↓');
    });
  });
});
