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
      expect(container.querySelector('style[data-responsive-id]')).toBeNull();
    });
  });

  describe('responsive padding', () => {
    it('generates CSS media queries for responsive padding', () => {
      const { container } = render(
        <ClassicCard padding={{ xs: 'sm', lg: 'lg' }}>Content</ClassicCard>
      );
      const styleTag = container.querySelector('style');
      const card = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(card).toBeInTheDocument();
      // sm padding value
      expect(styleTag?.textContent).toContain('padding:');
      // lg breakpoint
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute on the element', () => {
      const { container } = render(
        <ClassicCard padding={{ xs: 'sm', md: 'lg' }}>Content</ClassicCard>
      );
      const card = container.querySelector('[data-responsive-id]');
      expect(card).toBeInTheDocument();
      expect(card?.getAttribute('data-responsive-id')).toBeTruthy();
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicCard padding={{ phone: 'sm', tablet: 'md', desktop: 'lg' }}>
          Content
        </ClassicCard>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
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
      expect(card?.hasAttribute('data-responsive-id')).toBe(false);
    });
  });

  describe('responsive padding', () => {
    it('generates CSS media queries for responsive padding', () => {
      const { container } = render(
        <RusticCard padding={{ xs: 'sm', lg: 'lg' }}>Content</RusticCard>
      );
      const styles = container.querySelectorAll('style');
      // Should have at least one style with responsive CSS
      const responsiveStyle = Array.from(styles).find(
        (s) => s.textContent?.includes('@media')
      );
      expect(responsiveStyle).not.toBeUndefined();
      expect(responsiveStyle?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute', () => {
      const { container } = render(
        <RusticCard padding={{ xs: 'sm', md: 'lg' }}>Content</RusticCard>
      );
      const card = container.querySelector('[data-responsive-id]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('alias resolution', () => {
    it('resolves phone, tablet, desktop aliases', () => {
      const { container } = render(
        <RusticCard padding={{ phone: 'sm', desktop: 'lg' }}>Content</RusticCard>
      );
      const styles = container.querySelectorAll('style');
      const responsiveStyle = Array.from(styles).find(
        (s) => s.textContent?.includes('@media')
      );
      expect(responsiveStyle).not.toBeUndefined();
      // desktop -> lg (1024px)
      expect(responsiveStyle?.textContent).toContain('@media (min-width: 1024px)');
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
      // No data-responsive-id when scalar
      expect(container.querySelector('[data-responsive-id]')).toBeNull();
    });
  });

  describe('responsive padding', () => {
    it('generates CSS media queries for responsive padding', () => {
      const { container } = render(
        <ModernCard padding={{ xs: 'sm', lg: 'lg' }}>Content</ModernCard>
      );
      const styleTag = container.querySelector('style');
      const card = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(card).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('padding:');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute', () => {
      const { container } = render(
        <ModernCard padding={{ xs: 'sm', xl: 'lg' }}>Content</ModernCard>
      );
      const card = container.querySelector('[data-responsive-id]');
      expect(card).toBeInTheDocument();
      expect(card?.getAttribute('data-responsive-id')).toBeTruthy();
    });
  });

  describe('alias resolution', () => {
    it('resolves phone, tablet, desktop aliases', () => {
      const { container } = render(
        <ModernCard padding={{ phone: 'sm', tablet: 'md', desktop: 'lg' }}>
          Content
        </ModernCard>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });
  });
});
