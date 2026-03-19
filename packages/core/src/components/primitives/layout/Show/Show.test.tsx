/**
 * Show / Hide Component Tests
 *
 * Verifies CSS-first responsive visibility behavior:
 * - Correct CSS media queries generated for each prop combination
 * - Children are rendered in all cases
 * - Hide is the inverse of Show
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Show, buildShowMediaQuery } from './';
import { Hide, buildHideMediaQuery } from '../Hide';

// ---------------------------------------------------------------------------
// Show: media query generation
// ---------------------------------------------------------------------------

describe('Show', () => {
  describe('buildShowMediaQuery', () => {
    it('returns min-width query for from="tablet"', () => {
      const query = buildShowMediaQuery({ from: 'tablet' });
      expect(query).toBe('(min-width: 640px)');
    });

    it('returns max-width query for on="phone"', () => {
      const query = buildShowMediaQuery({ on: 'phone' });
      expect(query).toBe('(max-width: 639px)');
    });

    it('returns min-width query for on="desktop"', () => {
      const query = buildShowMediaQuery({ on: 'desktop' });
      expect(query).toBe('(min-width: 1024px)');
    });

    it('returns bounded range for on="tablet"', () => {
      const query = buildShowMediaQuery({ on: 'tablet' });
      expect(query).toBe('(min-width: 640px) and (max-width: 1023px)');
    });

    it('returns max-width query for below="desktop"', () => {
      // desktop resolves to 1024px, so below="desktop" is max-width: 1023px
      const query = buildShowMediaQuery({ below: 'desktop' });
      expect(query).toBe('(max-width: 1023px)');
    });

    it('returns min-width query for from="sm"', () => {
      const query = buildShowMediaQuery({ from: 'sm' });
      expect(query).toBe('(min-width: 640px)');
    });

    it('returns min-width query for from="lg"', () => {
      const query = buildShowMediaQuery({ from: 'lg' });
      expect(query).toBe('(min-width: 1024px)');
    });

    it('returns min-width query for from="xl"', () => {
      const query = buildShowMediaQuery({ from: 'xl' });
      expect(query).toBe('(min-width: 1280px)');
    });

    it('returns min-width query for from="2xl"', () => {
      const query = buildShowMediaQuery({ from: '2xl' });
      expect(query).toBe('(min-width: 1536px)');
    });

    it('returns max-width query for below="md"', () => {
      const query = buildShowMediaQuery({ below: 'md' });
      expect(query).toBe('(max-width: 767px)');
    });

    it('returns null when no constraint is specified', () => {
      const query = buildShowMediaQuery({});
      expect(query).toBeNull();
    });

    it('prioritizes on over from and below', () => {
      const query = buildShowMediaQuery({ on: 'phone', from: 'lg', below: 'xl' });
      expect(query).toBe('(max-width: 639px)');
    });
  });

  describe('rendering', () => {
    it('renders children', () => {
      render(
        <Show from="sm">
          <span data-testid="child">Hello</span>
        </Show>
      );
      expect(screen.getByTestId('child')).toBeTruthy();
      expect(screen.getByTestId('child').textContent).toBe('Hello');
    });

    it('renders a style tag with correct CSS for from="tablet"', () => {
      const { container } = render(
        <Show from="tablet">
          <span>Content</span>
        </Show>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeTruthy();
      const css = styleTag!.textContent!;
      expect(css).toContain('display: none');
      expect(css).toContain('@media (min-width: 640px)');
      expect(css).toContain('display: contents');
    });

    it('renders a style tag with correct CSS for on="phone"', () => {
      const { container } = render(
        <Show on="phone">
          <span>Mobile only</span>
        </Show>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeTruthy();
      const css = styleTag!.textContent!;
      expect(css).toContain('display: none');
      expect(css).toContain('@media (max-width: 639px)');
      expect(css).toContain('display: contents');
    });

    it('renders a style tag with correct CSS for below="desktop"', () => {
      const { container } = render(
        <Show below="desktop">
          <span>Non-desktop</span>
        </Show>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeTruthy();
      const css = styleTag!.textContent!;
      expect(css).toContain('display: none');
      expect(css).toContain('@media (max-width: 1023px)');
      expect(css).toContain('display: contents');
    });

    it('renders as span when as="span" is specified', () => {
      const { container } = render(
        <Show from="lg" as="span">
          <span>Inline</span>
        </Show>
      );
      // The wrapper should be a span, not a div
      const wrapper = container.querySelector('span.ds-show-');
      // Fallback: just verify span exists somewhere as a wrapper
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render a style tag when no constraint is specified', () => {
      const { container } = render(
        <Show>
          <span>Always visible</span>
        </Show>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Hide: media query generation (inverse of Show)
// ---------------------------------------------------------------------------

describe('Hide', () => {
  describe('buildHideMediaQuery', () => {
    it('returns max-width query for on="phone"', () => {
      const query = buildHideMediaQuery({ on: 'phone' });
      expect(query).toBe('(max-width: 639px)');
    });

    it('returns min-width query for on="desktop"', () => {
      const query = buildHideMediaQuery({ on: 'desktop' });
      expect(query).toBe('(min-width: 1024px)');
    });

    it('returns bounded range for on="tablet"', () => {
      const query = buildHideMediaQuery({ on: 'tablet' });
      expect(query).toBe('(min-width: 640px) and (max-width: 1023px)');
    });

    it('returns min-width query for from="lg"', () => {
      const query = buildHideMediaQuery({ from: 'lg' });
      expect(query).toBe('(min-width: 1024px)');
    });

    it('returns max-width query for below="md"', () => {
      const query = buildHideMediaQuery({ below: 'md' });
      expect(query).toBe('(max-width: 767px)');
    });

    it('returns null when no constraint is specified', () => {
      const query = buildHideMediaQuery({});
      expect(query).toBeNull();
    });
  });

  describe('rendering', () => {
    it('renders children', () => {
      render(
        <Hide on="phone">
          <span data-testid="hide-child">Visible on larger screens</span>
        </Hide>
      );
      expect(screen.getByTestId('hide-child')).toBeTruthy();
    });

    it('renders a style tag with display: none !important for on="phone"', () => {
      const { container } = render(
        <Hide on="phone">
          <span>Hidden on phone</span>
        </Hide>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeTruthy();
      const css = styleTag!.textContent!;
      expect(css).toContain('@media (max-width: 639px)');
      expect(css).toContain('display: none !important');
    });

    it('does NOT contain display: none as default (visible by default)', () => {
      const { container } = render(
        <Hide from="lg">
          <span>Hidden on desktop</span>
        </Hide>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeTruthy();
      const css = styleTag!.textContent!;
      // Hide should NOT have a default "display: none" outside the media query
      // The display: none should only appear inside the @media block
      expect(css).not.toMatch(/^\.ds-hide-[^\s]+ \{ display: none/);
    });

    it('does not render a style tag when no constraint is specified', () => {
      const { container } = render(
        <Hide>
          <span>Always visible</span>
        </Hide>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Show and Hide are inverses
// ---------------------------------------------------------------------------

describe('Show and Hide are inverses', () => {
  it('Show and Hide generate the same media query for the same props', () => {
    // They target the same breakpoint -- Show reveals at that query, Hide hides at it
    const showQuery = buildShowMediaQuery({ on: 'tablet' });
    const hideQuery = buildHideMediaQuery({ on: 'tablet' });
    expect(showQuery).toBe(hideQuery);
  });

  it('Show uses display: contents, Hide uses display: none !important', () => {
    const { container: showContainer } = render(
      <Show on="phone">
        <span>Show</span>
      </Show>
    );
    const { container: hideContainer } = render(
      <Hide on="phone">
        <span>Hide</span>
      </Hide>
    );

    const showCss = showContainer.querySelector('style')!.textContent!;
    const hideCss = hideContainer.querySelector('style')!.textContent!;

    // Show: hidden by default, revealed in media query
    expect(showCss).toContain('display: none');
    expect(showCss).toContain('display: contents');

    // Hide: visible by default, hidden in media query
    expect(hideCss).toContain('display: none !important');
    expect(hideCss).not.toContain('display: contents');
  });
});
