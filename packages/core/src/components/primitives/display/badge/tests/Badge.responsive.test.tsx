/**
 * Badge responsive prop tests.
 * Tests that Badge engines correctly handle ResponsiveValue objects
 * for the `size` prop (min-width, height, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicBadge from '../engines/classic';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe('ClassicBadge responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size without injecting a responsive style tag', () => {
      const { container } = render(
        <ClassicBadge size="lg" count={5}>
          <span>Child</span>
        </ClassicBadge>
      );
      // No responsive style tag should be injected for scalar values
      expect(responsiveCss(container)).toBe('');
      // no responsive channel is armed at all
      expect(responsiveChannelElement(container)).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ClassicBadge size={{ xs: 'sm', lg: 'xl' }} count={5}>
          <span>Child</span>
        </ClassicBadge>
      );
      const styleTag = responsiveCss(container);
      const badge = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(badge).toBeInTheDocument();
      // Should contain min-width, height, and font-size declarations
      expect(styleTag).toContain('min-width:');
      expect(styleTag).toContain('height:');
      expect(styleTag).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels on the element', () => {
      const { container } = render(
        <ClassicBadge size={{ xs: 'sm', md: 'lg' }} count={3}>
          <span>Child</span>
        </ClassicBadge>
      );
      const badge = responsiveChannelElement(container);
      expect(badge).toBeInTheDocument();
      expect(responsiveTokens(container).length).toBeGreaterThan(0);
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicBadge size={{ phone: 'xs', tablet: 'md', desktop: 'xl' }} count={7}>
          <span>Child</span>
        </ClassicBadge>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).not.toBe('');
      // tablet -> sm (640px)
      expect(styleTag).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });
  });

  describe('standalone badge (no children)', () => {
    it('generates CSS media queries for responsive size in standalone mode', () => {
      const { container } = render(
        <ClassicBadge size={{ xs: 'sm', lg: 'xl' }} />
      );
      const styleTag = responsiveCss(container);
      const badge = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(badge).toBeInTheDocument();
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });
  });
});
