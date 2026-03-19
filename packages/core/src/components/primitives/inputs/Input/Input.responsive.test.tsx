/**
 * Input responsive prop tests.
 * Tests that Input engines correctly handle ResponsiveValue objects
 * for the `size` prop (height, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicInput from './engines/classic';

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
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present on the input
      expect(container.querySelector('[data-responsive-id]')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ClassicInput size={{ xs: 'sm', lg: 'xl' }} placeholder="Responsive" />
      );
      const styleTag = container.querySelector('style');

      expect(styleTag).not.toBeNull();
      // Should contain height and font-size declarations
      expect(styleTag?.textContent).toContain('height:');
      expect(styleTag?.textContent).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute on the element', () => {
      const { container } = render(
        <ClassicInput size={{ xs: 'sm', md: 'lg' }} placeholder="Test" />
      );
      const input = container.querySelector('[data-responsive-id]');
      expect(input).toBeInTheDocument();
      expect(input?.getAttribute('data-responsive-id')).toBeTruthy();
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicInput size={{ phone: 'xs', tablet: 'md', desktop: 'xl' }} placeholder="Aliased" />
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
