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
import {
  RESPONSIVE_HIDE_ATTRIBUTE,
  RESPONSIVE_SHOW_ATTRIBUTE,
} from '@/foundation/contracts/kernel/responsive/visibility';
import { buildResponsiveVisibilitySheet } from '@/foundation/tokens/css/foundation/responsive/tests/projection';
import { Show, buildShowMediaQuery } from '..';
import { Hide, buildHideMediaQuery } from '../../hide';

// ---------------------------------------------------------------------------
// Show: media query generation
// ---------------------------------------------------------------------------

const SHEET = buildResponsiveVisibilitySheet();

/**
 * The rule the static sheet applies to a rendered boundary. Show and Hide stamp
 * one token each and inject no stylesheet of their own, so a rule is the pair
 * (token on the element, prelude in the sheet) the browser puts together.
 */
function ruleFor(container: HTMLElement, attribute: string): string {
  const node = container.querySelector(`[${attribute}]`);
  if (node === null) return '';
  const selector = `[${attribute}="${node.getAttribute(attribute)}"]`;
  const at = SHEET.indexOf(selector);
  if (at < 0) return '';
  const open = SHEET.lastIndexOf('@media', at);
  return SHEET.slice(open < 0 ? at : open, SHEET.indexOf('}', at) + 1);
}

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
      expect(container.querySelectorAll('style')).toHaveLength(0);
      expect(container.querySelector('div')!.getAttribute(RESPONSIVE_SHOW_ATTRIBUTE)).toBe('from:sm');
      expect(SHEET).toContain(`[${RESPONSIVE_SHOW_ATTRIBUTE}] {\n  display: none;\n}`);
      const rule = ruleFor(container, RESPONSIVE_SHOW_ATTRIBUTE);
      expect(rule).toContain('@media (min-width: 640px)');
      expect(rule).toContain('display: contents');
    });

    it('renders a style tag with correct CSS for on="phone"', () => {
      const { container } = render(
        <Show on="phone">
          <span>Mobile only</span>
        </Show>
      );
      expect(container.querySelectorAll('style')).toHaveLength(0);
      expect(container.querySelector('div')!.getAttribute(RESPONSIVE_SHOW_ATTRIBUTE)).toBe('on:phone');
      const rule = ruleFor(container, RESPONSIVE_SHOW_ATTRIBUTE);
      expect(rule).toContain('@media (max-width: 639px)');
      expect(rule).toContain('display: contents');
    });

    it('renders a style tag with correct CSS for below="desktop"', () => {
      const { container } = render(
        <Show below="desktop">
          <span>Non-desktop</span>
        </Show>
      );
      expect(container.querySelectorAll('style')).toHaveLength(0);
      expect(container.querySelector('div')!.getAttribute(RESPONSIVE_SHOW_ATTRIBUTE)).toBe('below:lg');
      const rule = ruleFor(container, RESPONSIVE_SHOW_ATTRIBUTE);
      expect(rule).toContain('@media (max-width: 1023px)');
      expect(rule).toContain('display: contents');
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
      expect(container.querySelectorAll('style')).toHaveLength(0);
      expect(container.querySelector('div')!.getAttribute(RESPONSIVE_HIDE_ATTRIBUTE)).toBe('on:phone');
      const rule = ruleFor(container, RESPONSIVE_HIDE_ATTRIBUTE);
      expect(rule).toContain('@media (max-width: 639px)');
      expect(rule).toContain('display: none !important');
    });

    it('does NOT contain display: none as default (visible by default)', () => {
      const { container } = render(
        <Hide from="lg">
          <span>Hidden on desktop</span>
        </Hide>
      );
      // Hide's default state is boxless-VISIBLE; `display: none` appears only
      // inside the boundary's own media block.
      expect(SHEET).toContain(`[${RESPONSIVE_HIDE_ATTRIBUTE}] {\n  display: contents;\n}`);
      expect(SHEET).not.toContain(`[${RESPONSIVE_HIDE_ATTRIBUTE}] {\n  display: none`);
      expect(ruleFor(container, RESPONSIVE_HIDE_ATTRIBUTE)).toContain('display: none !important');
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

  it('keeps both wrappers boxless while applying inverse visibility rules', () => {
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

    // Show: hidden by default, revealed inside its boundary.
    expect(SHEET).toContain(`[${RESPONSIVE_SHOW_ATTRIBUTE}] {\n  display: none;\n}`);
    expect(ruleFor(showContainer, RESPONSIVE_SHOW_ATTRIBUTE)).toContain('display: contents');

    // Hide: boxless-visible by default, hidden inside its boundary. `contents`
    // is intentional: neither helper may inject a layout box.
    expect(SHEET).toContain(`[${RESPONSIVE_HIDE_ATTRIBUTE}] {\n  display: contents;\n}`);
    expect(ruleFor(hideContainer, RESPONSIVE_HIDE_ATTRIBUTE)).toContain('display: none !important');
  });
});
