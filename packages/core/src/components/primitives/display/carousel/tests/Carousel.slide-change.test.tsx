import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CarouselModern from '../engines/modern';

const realMatchMedia = window.matchMedia;

afterEach(() => {
  vi.useRealTimers();
  window.matchMedia = realMatchMedia;
});

function stubReducedMotion(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: matches && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function arrow(direction: 'prev' | 'next'): HTMLButtonElement {
  const el = document.querySelector<HTMLButtonElement>(`[data-part='arrow'][data-direction='${direction}']`);
  if (!el) throw new Error(`Missing ${direction} arrow`);
  return el;
}

function track(): HTMLElement {
  const el = document.querySelector<HTMLElement>("[data-part='track']");
  if (!el) throw new Error('Missing track');
  return el;
}

const slides = [<div key="a">A</div>, <div key="b">B</div>, <div key="c">C</div>];

describe('Carousel modern slide-change behaviour', () => {
  it('hands focus to the opposite arrow when the pressed arrow reaches a dead boundary', () => {
    render(<CarouselModern infinite={false} arrows>{slides}</CarouselModern>);

    const next = arrow('next');
    act(() => next.focus());
    fireEvent.click(next);
    fireEvent.click(next);

    // Slide 3 of 3: `next` is now disabled. A disabled control cannot hold
    // focus, so leaving it there strands the keyboard user on the document.
    expect(next.disabled).toBe(true);
    const active = document.activeElement as HTMLButtonElement | null;
    expect(active).not.toBe(document.body);
    expect(active?.getAttribute('data-part')).toBe('arrow');
    expect(active?.disabled).toBe(false);
  });

  it('mirrors the same handoff at the first slide', () => {
    render(<CarouselModern infinite={false} arrows initialSlide={1}>{slides}</CarouselModern>);

    const prev = arrow('prev');
    act(() => prev.focus());
    fireEvent.click(prev);

    expect(prev.disabled).toBe(true);
    expect(document.activeElement).toBe(arrow('next'));
  });

  it('leaves focus alone when the pressed arrow stays live', () => {
    render(<CarouselModern infinite={false} arrows>{slides}</CarouselModern>);

    const next = arrow('next');
    act(() => next.focus());
    fireEvent.click(next);

    expect(next.disabled).toBe(false);
    expect(document.activeElement).toBe(next);
  });

  it('silences the slide live region while autoplay is rotating and opens it when paused', () => {
    vi.useFakeTimers();
    render(
      <CarouselModern autoplay autoplaySpeed={1000} pauseOnHover arrows>
        {slides}
      </CarouselModern>
    );

    // Auto-rotating: announcing every automatic advance would talk over the user.
    expect(track()).toHaveAttribute('aria-live', 'off');

    fireEvent.mouseEnter(screen.getByText('A').closest("[data-part='root']")!);
    expect(track()).toHaveAttribute('aria-live', 'polite');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Paused means paused: no advance happened while hovered.
    expect(document.querySelector("[data-part='slide'][data-selected='true']")).toHaveTextContent('A');
  });

  it('keeps the live region open for a manually driven carousel', () => {
    render(<CarouselModern arrows>{slides}</CarouselModern>);
    expect(track()).toHaveAttribute('aria-live', 'polite');
  });
});

describe('Carousel modern reduced motion', () => {
  it('stops autoplay outright rather than shortening it', () => {
    stubReducedMotion(true);
    vi.useFakeTimers();
    render(
      <CarouselModern autoplay autoplaySpeed={500} arrows>
        {slides}
      </CarouselModern>
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(document.querySelector("[data-part='slide'][data-selected='true']")).toHaveTextContent('A');
    // Nothing rotates, so the region stays announceable.
    expect(track()).toHaveAttribute('aria-live', 'polite');
  });

  it('removes the slide transition instead of speeding it up', () => {
    stubReducedMotion(true);
    render(<CarouselModern speed={400} arrows>{slides}</CarouselModern>);

    const slide = document.querySelector<HTMLElement>("[data-part='slide']");
    expect(slide?.style.transition).toBe('none');
  });

  it('keeps the timed transition when motion is not reduced', () => {
    stubReducedMotion(false);
    render(<CarouselModern speed={400} arrows>{slides}</CarouselModern>);

    const slide = document.querySelector<HTMLElement>("[data-part='slide']");
    expect(slide?.style.transition).toContain('400ms');
  });
});
