import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import {
  Aurora,
  CountUp,
  FadeIn,
  GlassCard,
  GlowEffect,
  GradientBackground,
  GridPattern,
  Magnetic,
  Morph,
  NoiseTexture,
  Parallax,
  Particles,
  ScaleIn,
  ScrollReveal,
  ShimmerText,
  SlideIn,
  Spotlight,
  StaggerChildren,
  TextReveal,
} from '..';
import { renderSurface } from '../../components/surfaces/foundation/common/test-utils';

class IntersectionObserverMock {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe = vi.fn((element: Element) => {
    this.callback(
      [
        {
          isIntersecting: true,
          target: element,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('animation catalog integration', () => {
  it('renders the motion primitives through the DS provider stack', async () => {
    const { container } = renderSurface(
      <div>
        <FadeIn>Fade content</FadeIn>
        <SlideIn>Slide content</SlideIn>
        <ScaleIn>Scale content</ScaleIn>
        <ScrollReveal>Reveal content</ScrollReveal>
        <StaggerChildren>
          <div>Stagger one</div>
          <div>Stagger two</div>
        </StaggerChildren>
        <Parallax>Parallax content</Parallax>
        <Magnetic>
          <button type="button">Magnetic button</button>
        </Magnetic>
        <TextReveal text="Animated headline" />
        <CountUp from={10} to={42} prefix="$" suffix="k" />
        <Morph layoutId="hero-card">
          <div>Morph content</div>
        </Morph>
      </div>
    );

    expect(container.textContent).toContain('Fade content');
    expect(container.textContent).toContain('Slide content');
    expect(container.textContent).toContain('Scale content');
    expect(container.textContent).toContain('Reveal content');
    expect(container.textContent).toContain('Stagger one');
    expect(container.textContent).toContain('Parallax content');
    expect(screen.getByRole('button', { name: 'Magnetic button' })).toBeInTheDocument();
    expect((container.textContent ?? '').replace(/\u00a0/g, ' ')).toContain('Animated headline');
    expect(container.textContent).toContain('$10k');
    expect(container.textContent).toContain('Morph content');
  });

  it('renders the effect primitives and throttles spotlight mouse updates', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      return 1;
    });

    const { container } = renderSurface(
      <div>
        <Aurora>
          <div>Aurora content</div>
        </Aurora>
        <GlassCard>
          <div>Glass content</div>
        </GlassCard>
        <GlowEffect>
          <div>Glow content</div>
        </GlowEffect>
        <GradientBackground>
          <div>Gradient content</div>
        </GradientBackground>
        <GridPattern animate>
          <div>Grid content</div>
        </GridPattern>
        <NoiseTexture>
          <div>Noise content</div>
        </NoiseTexture>
        <Particles>
          <div>Particles content</div>
        </Particles>
        <ShimmerText text="Shimmer content" />
        <Spotlight>
          <div>Spotlight content</div>
        </Spotlight>
      </div>
    );

    expect(container.textContent).toContain('Aurora content');
    expect(container.textContent).toContain('Glass content');
    expect(container.textContent).toContain('Glow content');
    expect(container.textContent).toContain('Gradient content');
    expect(container.textContent).toContain('Grid content');
    expect(container.textContent).toContain('Noise content');
    expect(container.textContent).toContain('Particles content');
    expect(container.textContent).toContain('Shimmer content');
    expect(container.textContent).toContain('Spotlight content');

    const spotlightRoot = screen.getByText('Spotlight content').parentElement?.parentElement as HTMLElement;
    fireEvent.mouseMove(spotlightRoot, { clientX: 24, clientY: 32 });

    await waitFor(() => {
      expect(rafSpy).toHaveBeenCalled();
    });
  });
});
