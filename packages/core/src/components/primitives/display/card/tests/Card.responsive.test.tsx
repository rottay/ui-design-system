/**
 * Card responsive prop tests.
 * Tests that Card engines correctly handle ResponsiveValue objects
 * for padding (the primary responsive-aware prop on Card).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicCard from '../engines/classic';
import RusticCard from '../engines/rustic';
import ModernCard from '../engines/modern';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe('ClassicCard responsive padding', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar padding without injecting a style tag', () => {
      const { container } = render(
        <ClassicCard padding="lg">Content</ClassicCard>
      );
      const card = container.querySelector('.rottay-card--classic');
      expect(card).toBeInTheDocument();
      // No responsive style tag should be injected for scalar values
      expect(responsiveCss(container)).toBe('');
    });
  });

  describe('responsive padding', () => {
    it('generates CSS media queries for responsive padding', () => {
      const { container } = render(
        <ClassicCard padding={{ xs: 'sm', lg: 'lg' }}>Content</ClassicCard>
      );
      const styleTag = responsiveCss(container);
      const card = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(card).toBeInTheDocument();
      // sm padding value
      expect(styleTag).toContain('padding:');
      // lg breakpoint
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels on the element', () => {
      const { container } = render(
        <ClassicCard padding={{ xs: 'sm', md: 'lg' }}>Content</ClassicCard>
      );
      const card = responsiveChannelElement(container);
      expect(card).toBeInTheDocument();
      expect(responsiveTokens(container).length).toBeGreaterThan(0);
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicCard padding={{ phone: 'sm', tablet: 'md', desktop: 'lg' }}>
          Content
        </ClassicCard>
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

// ---------------------------------------------------------------------------
// Rustic Engine
// ---------------------------------------------------------------------------

describe('RusticCard responsive padding', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar padding without injecting a responsive style tag', () => {
      const { container } = render(
        <RusticCard padding="lg">Content</RusticCard>
      );
      const card = container.querySelector('.rottay-card--rustic');
      expect(card).toBeInTheDocument();
      // The rustic card has its own keyframes style tag, but should NOT
      // have a responsive style tag when padding is scalar
      expect(responsiveTokens(container)).toHaveLength(0);
    });
  });

  describe('responsive padding', () => {
    it('generates CSS media queries for responsive padding', () => {
      const { container } = render(
        <RusticCard padding={{ xs: 'sm', lg: 'lg' }}>Content</RusticCard>
      );
      const responsiveStyle = responsiveCss(container);
      expect(responsiveStyle).toContain('@media');
      expect(responsiveStyle).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels', () => {
      const { container } = render(
        <RusticCard padding={{ xs: 'sm', md: 'lg' }}>Content</RusticCard>
      );
      const card = responsiveChannelElement(container);
      expect(card).toBeInTheDocument();
    });
  });

  describe('alias resolution', () => {
    it('resolves phone, tablet, desktop aliases', () => {
      const { container } = render(
        <RusticCard padding={{ phone: 'sm', desktop: 'lg' }}>Content</RusticCard>
      );
      const responsiveStyle = responsiveCss(container);
      expect(responsiveStyle).toContain('@media');
      // desktop -> lg (1024px)
      expect(responsiveStyle).toContain('@media (min-width: 1024px)');
    });
  });
});

// ---------------------------------------------------------------------------
// Modern Engine
// ---------------------------------------------------------------------------

describe('ModernCard responsive padding', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar padding without injecting a responsive style tag', () => {
      const { container } = render(
        <ModernCard padding="lg">Content</ModernCard>
      );
      // no responsive channel is armed for a scalar
      expect(responsiveChannelElement(container)).toBeNull();
    });
  });

  describe('responsive padding', () => {
    it('generates CSS media queries for responsive padding', () => {
      const { container } = render(
        <ModernCard padding={{ xs: 'sm', lg: 'lg' }}>Content</ModernCard>
      );
      const styleTag = responsiveCss(container);
      const card = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(card).toBeInTheDocument();
      expect(styleTag).toContain('padding:');
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels', () => {
      const { container } = render(
        <ModernCard padding={{ xs: 'sm', xl: 'lg' }}>Content</ModernCard>
      );
      const card = responsiveChannelElement(container);
      expect(card).toBeInTheDocument();
      expect(responsiveTokens(container).length).toBeGreaterThan(0);
    });
  });

  describe('alias resolution', () => {
    it('resolves phone, tablet, desktop aliases', () => {
      const { container } = render(
        <ModernCard padding={{ phone: 'sm', tablet: 'md', desktop: 'lg' }}>
          Content
        </ModernCard>
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
