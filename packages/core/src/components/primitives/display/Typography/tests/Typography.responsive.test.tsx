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
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present
      expect(heading?.hasAttribute('data-responsive-id')).toBe(false);
    });

    it('renders without size using level-based default', () => {
      const { container } = render(
        <ApolloHeading level="h1">Title</ApolloHeading>
      );
      const heading = container.querySelector('.rottay-heading');
      expect(heading).toBeInTheDocument();
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ApolloHeading level="h2" size={{ xs: 'md', lg: '3xl' }}>
          Responsive Heading
        </ApolloHeading>
      );
      const styleTag = container.querySelector('style');
      const heading = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(heading).toBeInTheDocument();
      // xs tier: font-size for 'md' heading
      expect(styleTag?.textContent).toContain('font-size:');
      // lg tier: media query for 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      // line-height should also be set
      expect(styleTag?.textContent).toContain('line-height:');
    });

    it('resolves semantic aliases (phone, tablet, desktop)', () => {
      const { container } = render(
        <ApolloHeading level="h3" size={{ phone: 'sm', desktop: '2xl' }}>
          Aliased Heading
        </ApolloHeading>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('does not set inline font-size when size is responsive', () => {
      const { container } = render(
        <ApolloHeading level="h1" size={{ xs: 'sm', xl: '3xl' }}>
          No Inline Size
        </ApolloHeading>
      );
      const heading = container.querySelector('.rottay-heading');
      // Inline style should NOT contain fontSize when responsive
      expect(heading?.getAttribute('style')).not.toContain('font-size');
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
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive text size', () => {
      const { container } = render(
        <ApolloText size={{ xs: 'sm', md: 'lg', xl: '2xl' }}>
          Responsive Text
        </ApolloText>
      );
      const styleTag = container.querySelector('style');
      const text = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(text).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('font-size:');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('@media (min-width: 1280px)');
      expect(styleTag?.textContent).toContain('line-height:');
    });

    it('does not set inline font-size when size is responsive', () => {
      const { container } = render(
        <ApolloText size={{ xs: 'xs', lg: 'xl' }}>No Inline Size</ApolloText>
      );
      const text = container.querySelector('.rottay-text');
      expect(text?.getAttribute('style')).not.toContain('font-size');
    });
  });
});

// ---------------------------------------------------------------------------
// Modern Engine
// ---------------------------------------------------------------------------

describe('ModernHeading responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size as Tailwind class', () => {
      const { container } = render(
        <ModernHeading level="h1" size="3xl">Title</ModernHeading>
      );
      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      expect(heading?.className).toContain('text-5xl');
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries and omits Tailwind size class', () => {
      const { container } = render(
        <ModernHeading level="h2" size={{ xs: 'md', lg: '3xl' }}>
          Responsive Heading
        </ModernHeading>
      );
      const styleTag = container.querySelector('style');
      const heading = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
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
    it('renders plain scalar size as Tailwind class', () => {
      const { container } = render(
        <ModernText size="lg">Content</ModernText>
      );
      const text = container.querySelector('span');
      expect(text).toBeInTheDocument();
      expect(text?.className).toContain('text-lg');
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries and omits Tailwind size class', () => {
      const { container } = render(
        <ModernText size={{ xs: 'sm', md: 'lg', xl: '2xl' }}>
          Responsive Text
        </ModernText>
      );
      const styleTag = container.querySelector('style');
      const text = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(text).toBeInTheDocument();
      // Should NOT contain Tailwind text size classes
      expect(text?.className).not.toContain('text-sm');
      expect(text?.className).not.toContain('text-lg');
      expect(text?.className).not.toContain('text-2xl');
    });
  });
});
