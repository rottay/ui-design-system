/**
 * Alert responsive prop tests.
 * Tests that Alert engines correctly handle ResponsiveValue objects
 * for the `compact` prop (padding, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicAlert from './engines/classic';

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
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present
      expect(container.querySelector('[data-responsive-id]')).toBeNull();
    });

    it('renders plain scalar compact=true with inline compact styles', () => {
      const { container } = render(
        <ClassicAlert compact={true} message="Compact alert" />
      );
      // Still no responsive style tag -- compact is scalar
      expect(container.querySelector('style')).toBeNull();
      expect(container.querySelector('[data-responsive-id]')).toBeNull();
    });
  });

  describe('responsive compact', () => {
    it('generates CSS media queries for responsive compact', () => {
      const { container } = render(
        <ClassicAlert compact={{ xs: true, lg: false }} message="Responsive" />
      );
      const styleTag = container.querySelector('style');
      const alert = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(alert).toBeInTheDocument();
      // Should contain padding and font-size declarations
      expect(styleTag?.textContent).toContain('padding:');
      expect(styleTag?.textContent).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute on the element', () => {
      const { container } = render(
        <ClassicAlert compact={{ xs: true, md: false }} message="Test" />
      );
      const alert = container.querySelector('[data-responsive-id]');
      expect(alert).toBeInTheDocument();
      expect(alert?.getAttribute('data-responsive-id')).toBeTruthy();
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
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });
  });
});
