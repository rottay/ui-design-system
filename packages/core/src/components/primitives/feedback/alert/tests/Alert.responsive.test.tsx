/**
 * Alert responsive prop tests.
 * Tests that Alert engines correctly handle ResponsiveValue objects
 * for the `compact` prop (padding, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicAlert from '../engines/classic';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe('ClassicAlert responsive compact', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar compact=false without injecting a responsive style tag', () => {
      const { container } = render(
        <ClassicAlert compact={false} message="Normal alert" />
      );
      // No responsive style tag should be injected for scalar values
      expect(responsiveCss(container)).toBe('');
      // no responsive channel is armed at all
      expect(responsiveChannelElement(container)).toBeNull();
    });

    it('renders plain scalar compact=true with inline compact styles', () => {
      const { container } = render(
        <ClassicAlert compact={true} message="Compact alert" />
      );
      // Still no responsive style tag -- compact is scalar
      expect(responsiveCss(container)).toBe('');
      expect(responsiveChannelElement(container)).toBeNull();
    });
  });

  describe('responsive compact', () => {
    it('generates CSS media queries for responsive compact', () => {
      const { container } = render(
        <ClassicAlert compact={{ xs: true, lg: false }} message="Responsive" />
      );
      const styleTag = responsiveCss(container);
      const alert = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(alert).toBeInTheDocument();
      // Should contain padding and font-size declarations
      expect(styleTag).toContain('padding:');
      expect(styleTag).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels on the element', () => {
      const { container } = render(
        <ClassicAlert compact={{ xs: true, md: false }} message="Test" />
      );
      const alert = responsiveChannelElement(container);
      expect(alert).toBeInTheDocument();
      expect(responsiveTokens(container).length).toBeGreaterThan(0);
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicAlert
          compact={{ phone: true, tablet: true, desktop: false }}
          message="Aliased"
        />
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
