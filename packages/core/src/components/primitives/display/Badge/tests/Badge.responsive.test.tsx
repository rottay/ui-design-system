/**
 * Badge responsive prop tests.
 * Tests that Badge engines correctly handle ResponsiveValue objects
 * for the `size` prop (min-width, height, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicBadge from '../engines/classic';

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
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present
      expect(container.querySelector('[data-responsive-id]')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ClassicBadge size={{ xs: 'sm', lg: 'xl' }} count={5}>
          <span>Child</span>
        </ClassicBadge>
      );
      const styleTag = container.querySelector('style');
      const badge = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(badge).toBeInTheDocument();
      // Should contain min-width, height, and font-size declarations
      expect(styleTag?.textContent).toContain('min-width:');
      expect(styleTag?.textContent).toContain('height:');
      expect(styleTag?.textContent).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute on the element', () => {
      const { container } = render(
        <ClassicBadge size={{ xs: 'sm', md: 'lg' }} count={3}>
          <span>Child</span>
        </ClassicBadge>
      );
      const badge = container.querySelector('[data-responsive-id]');
      expect(badge).toBeInTheDocument();
      expect(badge?.getAttribute('data-responsive-id')).toBeTruthy();
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicBadge size={{ phone: 'xs', tablet: 'md', desktop: 'xl' }} count={7}>
          <span>Child</span>
        </ClassicBadge>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });
  });

  describe('standalone badge (no children)', () => {
    it('generates CSS media queries for responsive size in standalone mode', () => {
      const { container } = render(
        <ClassicBadge size={{ xs: 'sm', lg: 'xl' }} />
      );
      const styleTag = container.querySelector('style');
      const badge = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(badge).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });
  });
});
