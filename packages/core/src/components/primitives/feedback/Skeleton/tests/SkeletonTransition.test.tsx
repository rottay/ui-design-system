/**
 * Skeleton.Transition crossfade tests (WO-CRA-07).
 *
 * Before this WO, Skeleton had no crossfade recipe at all: a loading ->
 * loaded swap either unmounted the skeleton (a "pop") or required the
 * consumer to hand-roll their own opacity transition. These tests fail if
 * the crossfade behavior (both layers always mounted, opacity driven by
 * `loading`) or the reduced-motion guard is ever deleted.
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';

import { Skeleton } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Skeleton.Transition', () => {
  it('keeps both the skeleton and the content mounted regardless of loading state', () => {
    stubReducedMotion(false);
    renderSurface(
      <Skeleton.Transition loading skeleton={<div data-testid="skel">Loading placeholder</div>}>
        <div data-testid="content">Real content</div>
      </Skeleton.Transition>
    );

    // Both layers must exist in the DOM at once -- a crossfade cannot pop
    // content in only after the skeleton unmounts.
    expect(screen.getByTestId('skel')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('shows the skeleton and hides content while loading', () => {
    stubReducedMotion(false);
    renderSurface(
      <Skeleton.Transition loading skeleton={<div data-testid="skel">Loading</div>}>
        <div data-testid="content">Content</div>
      </Skeleton.Transition>
    );

    const skeletonLayer = screen.getByTestId('skel').parentElement as HTMLElement;
    const contentLayer = screen.getByTestId('content').parentElement as HTMLElement;

    expect(skeletonLayer.style.opacity).toBe('1');
    expect(contentLayer.style.opacity).toBe('0');
    expect(contentLayer.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows content and hides the skeleton once loading finishes', () => {
    stubReducedMotion(false);
    renderSurface(
      <Skeleton.Transition loading={false} skeleton={<div data-testid="skel">Loading</div>}>
        <div data-testid="content">Content</div>
      </Skeleton.Transition>
    );

    const skeletonLayer = screen.getByTestId('skel').parentElement as HTMLElement;
    const contentLayer = screen.getByTestId('content').parentElement as HTMLElement;

    expect(skeletonLayer.style.opacity).toBe('0');
    expect(skeletonLayer.getAttribute('aria-hidden')).toBe('true');
    expect(contentLayer.style.opacity).toBe('1');
  });

  it('animates the crossfade on --ds-motion-fast by default', () => {
    stubReducedMotion(false);
    renderSurface(
      <Skeleton.Transition loading skeleton={<div data-testid="skel">Loading</div>}>
        <div data-testid="content">Content</div>
      </Skeleton.Transition>
    );

    const contentLayer = screen.getByTestId('content').parentElement as HTMLElement;
    expect(contentLayer.style.transition).toContain('opacity');
    expect(contentLayer.style.transition).toContain('var(--ds-motion-fast)');
  });

  it('disables the crossfade transition under prefers-reduced-motion', () => {
    stubReducedMotion(true);
    renderSurface(
      <Skeleton.Transition loading skeleton={<div data-testid="skel">Loading</div>}>
        <div data-testid="content">Content</div>
      </Skeleton.Transition>
    );

    const skeletonLayer = screen.getByTestId('skel').parentElement as HTMLElement;
    const contentLayer = screen.getByTestId('content').parentElement as HTMLElement;
    expect(skeletonLayer.style.transition).toBe('none');
    expect(contentLayer.style.transition).toBe('none');
  });
});
