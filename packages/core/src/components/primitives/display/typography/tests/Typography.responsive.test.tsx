/**
 * Typography responsive prop tests.
 * Tests that Text and Heading engines correctly handle ResponsiveValue objects
 * for font-size and line-height via the `size` prop.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ApolloHeading, ApolloText } from '../engines/rustic';
import { ModernHeading, ModernText } from '../engines/modern';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';

// ---------------------------------------------------------------------------
// Rustic (Apollo) Engine
// ---------------------------------------------------------------------------

describe('ApolloHeading responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size as inline style', () => {
      const { container } = render(
        <ApolloHeading level="h1" size="3xl">Title</ApolloHeading>
      );
      const heading = container.querySelector('.rottay-heading');
      expect(heading).toBeInTheDocument();
      // No style tag should be injected
      expect(responsiveCss(container)).toBe('');
      // no responsive channel is armed at all
      expect(responsiveTokens(container)).toHaveLength(0);
    });

    it('renders without size using level-based default', () => {
      const { container } = render(
        <ApolloHeading level="h1">Title</ApolloHeading>
      );
      const heading = container.querySelector('.rottay-heading');
      expect(heading).toBeInTheDocument();
      expect(responsiveCss(container)).toBe('');
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ApolloHeading level="h2" size={{ xs: 'md', lg: '3xl' }}>
          Responsive Heading
        </ApolloHeading>
      );
      const styleTag = responsiveCss(container);
      const heading = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(heading).toBeInTheDocument();
      // xs tier: font-size for 'md' heading
      expect(styleTag).toContain('font-size:');
      // lg tier: media query for 1024px
      expect(styleTag).toContain('@media (min-width: 1024px)');
      // line-height should also be set
      expect(styleTag).toContain('line-height:');
    });

    it('resolves semantic aliases (phone, tablet, desktop)', () => {
      const { container } = render(
        <ApolloHeading level="h3" size={{ phone: 'sm', desktop: '2xl' }}>
          Aliased Heading
        </ApolloHeading>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).not.toBe('');
      // desktop -> lg (1024px)
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('does not set inline font-size when size is responsive', () => {
      const { container } = render(
        <ApolloHeading level="h1" size={{ xs: 'sm', xl: '3xl' }}>
          No Inline Size
        </ApolloHeading>
      );
      const heading = container.querySelector('.rottay-heading');
      // Inline style should NOT contain fontSize when responsive
      // The channel custom properties carry `font-size` in their NAME; what
      // must be absent is the DECLARATION, which the static sheet now owns.
      expect(heading?.getAttribute('style')).not.toMatch(/(?:^|;)\s*font-size:/);
    });
  });
});

describe('ApolloText responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size as inline style', () => {
      const { container } = render(
        <ApolloText size="lg">Content</ApolloText>
      );
      const text = container.querySelector('.rottay-text');
      expect(text).toBeInTheDocument();
      expect(responsiveCss(container)).toBe('');
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive text size', () => {
      const { container } = render(
        <ApolloText size={{ xs: 'sm', md: 'lg', xl: '2xl' }}>
          Responsive Text
        </ApolloText>
      );
      const styleTag = responsiveCss(container);
      const text = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(text).toBeInTheDocument();
      expect(styleTag).toContain('font-size:');
      expect(styleTag).toContain('@media (min-width: 768px)');
      expect(styleTag).toContain('@media (min-width: 1280px)');
      expect(styleTag).toContain('line-height:');
    });

    it('does not set inline font-size when size is responsive', () => {
      const { container } = render(
        <ApolloText size={{ xs: 'xs', lg: 'xl' }}>No Inline Size</ApolloText>
      );
      const text = container.querySelector('.rottay-text');
      expect(text?.getAttribute('style')).not.toMatch(/(?:^|;)\s*font-size:/);
    });
  });
});

// ---------------------------------------------------------------------------
// Modern Engine
// ---------------------------------------------------------------------------

describe('ModernHeading responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size as tokenized inline style', () => {
      const { container } = render(
        <ModernHeading level="h1" size="3xl">Title</ModernHeading>
      );
      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      expect(heading?.className).not.toContain('text-5xl');
      expect(heading?.className).toContain('font-bold');
      expect(responsiveCss(container)).toBe('');
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries and omits Tailwind size class', () => {
      const { container } = render(
        <ModernHeading level="h2" size={{ xs: 'md', lg: '3xl' }}>
          Responsive Heading
        </ModernHeading>
      );
      const styleTag = responsiveCss(container);
      const heading = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(heading).toBeInTheDocument();
      // Should NOT contain any Tailwind text size class
      expect(heading?.className).not.toContain('text-xl');
      expect(heading?.className).not.toContain('text-5xl');
      // Should still contain weight/align/color classes
      expect(heading?.className).toContain('font-bold');
    });
  });
});

describe('ModernText responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size as tokenized inline style', () => {
      const { container } = render(
        <ModernText size="lg">Content</ModernText>
      );
      const text = container.querySelector('span');
      expect(text).toBeInTheDocument();
      expect(text?.className).not.toContain('text-lg');
      expect(text?.className).toContain('font-normal');
      expect(responsiveCss(container)).toBe('');
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries and omits Tailwind size class', () => {
      const { container } = render(
        <ModernText size={{ xs: 'sm', md: 'lg', xl: '2xl' }}>
          Responsive Text
        </ModernText>
      );
      const styleTag = responsiveCss(container);
      const text = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(text).toBeInTheDocument();
      // Should NOT contain Tailwind text size classes
      expect(text?.className).not.toContain('text-sm');
      expect(text?.className).not.toContain('text-lg');
      expect(text?.className).not.toContain('text-2xl');
    });
  });
});
