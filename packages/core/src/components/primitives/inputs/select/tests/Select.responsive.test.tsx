/**
 * Select responsive prop tests.
 * Tests that Select engines correctly handle ResponsiveValue objects
 * for the `size` prop (height, font-size).
 */

import React from 'react';
import { describe, expect, it } from 'vitest';

import ClassicSelect from '../engines/classic';
import { renderWithEngine } from '@tests/support/engine';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
] as const;

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe('ClassicSelect responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size without injecting a responsive style tag', () => {
      const { container } = renderWithEngine(
        <ClassicSelect size="lg" options={OPTIONS as any} />,
        'classic'
      );
      // No responsive style tag should be injected for scalar values
      expect(responsiveCss(container)).toBe('');
      // no responsive channel is armed at all
      expect(responsiveChannelElement(container)).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = renderWithEngine(
        <ClassicSelect size={{ xs: 'sm', lg: 'xl' }} options={OPTIONS as any} />,
        'classic'
      );
      const styleTag = responsiveCss(container);
      const select = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(select).toBeInTheDocument();
      // Should contain height and font-size declarations
      expect(styleTag).toContain('height:');
      expect(styleTag).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels on the element', () => {
      const { container } = renderWithEngine(
        <ClassicSelect size={{ xs: 'sm', md: 'lg' }} options={OPTIONS as any} />,
        'classic'
      );
      const select = responsiveChannelElement(container);
      expect(select).toBeInTheDocument();
      expect(responsiveTokens(container).length).toBeGreaterThan(0);
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = renderWithEngine(
        <ClassicSelect
          size={{ phone: 'xs', tablet: 'md', desktop: 'xl' }}
          options={OPTIONS as any}
        />,
        'classic'
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
