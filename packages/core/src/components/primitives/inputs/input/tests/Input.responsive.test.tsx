/**
 * Input responsive prop tests.
 * Tests that Input engines correctly handle ResponsiveValue objects
 * for the `size` prop (height, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicInput from '../engines/classic';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe('ClassicInput responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size without injecting a responsive style tag', () => {
      const { container } = render(
        <ClassicInput size="lg" placeholder="Test" />
      );
      // No responsive style tag should be injected for scalar values
      expect(responsiveCss(container)).toBe('');
      // no responsive channel is armed at all on the input
      expect(responsiveChannelElement(container)).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ClassicInput size={{ xs: 'sm', lg: 'xl' }} placeholder="Responsive" />
      );
      const styleTag = responsiveCss(container);

      expect(styleTag).not.toBe('');
      // Should contain height and font-size declarations
      expect(styleTag).toContain('height:');
      expect(styleTag).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels on the element', () => {
      const { container } = render(
        <ClassicInput size={{ xs: 'sm', md: 'lg' }} placeholder="Test" />
      );
      const input = responsiveChannelElement(container);
      expect(input).toBeInTheDocument();
      expect(responsiveTokens(container).length).toBeGreaterThan(0);
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicInput size={{ phone: 'xs', tablet: 'md', desktop: 'xl' }} placeholder="Aliased" />
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).not.toBe('');
      // tablet -> sm (640px)
      expect(styleTag).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });
  });
});
