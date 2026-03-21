/**
 * Select responsive prop tests.
 * Tests that Select engines correctly handle ResponsiveValue objects
 * for the `size` prop (height, font-size).
 */

import React from 'react';
import { describe, expect, it } from 'vitest';

import ClassicSelect from './engines/classic';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

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
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present
      expect(container.querySelector('[data-responsive-id]')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = renderWithEngine(
        <ClassicSelect size={{ xs: 'sm', lg: 'xl' }} options={OPTIONS as any} />,
        'classic'
      );
      const styleTag = container.querySelector('style');
      const select = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(select).toBeInTheDocument();
      // Should contain height and font-size declarations
      expect(styleTag?.textContent).toContain('height:');
      expect(styleTag?.textContent).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute on the element', () => {
      const { container } = renderWithEngine(
        <ClassicSelect size={{ xs: 'sm', md: 'lg' }} options={OPTIONS as any} />,
        'classic'
      );
      const select = container.querySelector('[data-responsive-id]');
      expect(select).toBeInTheDocument();
      expect(select?.getAttribute('data-responsive-id')).toBeTruthy();
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
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });
  });
});
