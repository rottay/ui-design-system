/**
 * Button responsive prop tests.
 * Tests that Button engines correctly handle ResponsiveValue objects
 * for the `size` prop (height, padding, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RusticButton from './engines/rustic';
import ModernButton from './engines/modern';
import ClassicButton from './engines/classic';

// ---------------------------------------------------------------------------
// Rustic Engine
// ---------------------------------------------------------------------------

describe('RusticButton responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size as inline style', () => {
      const { container } = render(
        <RusticButton size="lg">Click Me</RusticButton>
      );
      const button = container.querySelector('.rottay-button--rustic');
      expect(button).toBeInTheDocument();
      // No style tag should be injected
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present
      expect(button?.hasAttribute('data-responsive-id')).toBe(false);
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <RusticButton size={{ xs: 'sm', lg: 'xl' }}>Responsive</RusticButton>
      );
      const styleTag = container.querySelector('style');
      const button = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(button).toBeInTheDocument();
      // Should contain height, padding, and font-size declarations
      expect(styleTag?.textContent).toContain('height:');
      expect(styleTag?.textContent).toContain('padding:');
      expect(styleTag?.textContent).toContain('font-size:');
      // lg tier: media query for 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('resolves semantic aliases (phone, tablet, desktop)', () => {
      const { container } = render(
        <RusticButton size={{ phone: 'xs', tablet: 'md', desktop: 'lg' }}>
          Aliased
        </RusticButton>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('does not set inline height/padding/fontSize when size is responsive', () => {
      const { container } = render(
        <RusticButton size={{ xs: 'sm', xl: 'lg' }}>No Inline</RusticButton>
      );
      const button = container.querySelector('.rottay-button--rustic');
      const inlineStyle = button?.getAttribute('style') || '';
      // Inline style should NOT contain bare height/padding/font-size when
      // responsive (those are managed by the injected <style> tag).
      // CSS custom properties like --ds-button-height are allowed.
      expect(inlineStyle).not.toMatch(/(?<!-)height:/);
      expect(inlineStyle).not.toMatch(/(?<!-)padding:/);
      expect(inlineStyle).not.toMatch(/(?<!-)font-size:/);
    });
  });
});

// ---------------------------------------------------------------------------
// Modern Engine
// ---------------------------------------------------------------------------

describe('ModernButton responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size as DaisyUI class', () => {
      const { container } = render(
        <ModernButton size="sm">Small</ModernButton>
      );
      const button = container.querySelector('.rottay-button--modern');
      expect(button).toBeInTheDocument();
      expect(button?.className).toContain('btn-sm');
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries and omits DaisyUI size class', () => {
      const { container } = render(
        <ModernButton size={{ xs: 'sm', lg: 'lg' }}>Responsive</ModernButton>
      );
      const styleTag = container.querySelector('style');
      const button = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(button).toBeInTheDocument();
      // Should NOT contain DaisyUI size classes when responsive
      expect(button?.className).not.toContain('btn-sm');
      expect(button?.className).not.toContain('btn-lg');
      // Should still contain variant and base classes
      expect(button?.className).toContain('btn');
      expect(button?.className).toContain('rottay-button--modern');
    });

    it('contains height, padding, and font-size in generated CSS', () => {
      const { container } = render(
        <ModernButton size={{ xs: 'sm', md: 'md', xl: 'lg' }}>
          Multi-breakpoint
        </ModernButton>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      expect(styleTag?.textContent).toContain('height:');
      expect(styleTag?.textContent).toContain('padding:');
      expect(styleTag?.textContent).toContain('font-size:');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('@media (min-width: 1280px)');
    });
  });
});

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe('ClassicButton responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size without injecting a responsive style tag', () => {
      const { container } = render(
        <ClassicButton size="lg">Click Me</ClassicButton>
      );
      const button = container.querySelector('.rottay-button--classic');
      expect(button).toBeInTheDocument();
      // No style tag should be injected
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present
      expect(button?.hasAttribute('data-responsive-id')).toBe(false);
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ClassicButton size={{ xs: 'sm', lg: 'xl' }}>Responsive</ClassicButton>
      );
      const styleTag = container.querySelector('style');
      const button = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(button).toBeInTheDocument();
      // Should contain height, padding, and font-size declarations
      expect(styleTag?.textContent).toContain('height:');
      expect(styleTag?.textContent).toContain('padding:');
      expect(styleTag?.textContent).toContain('font-size:');
      // lg tier: media query for 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('resolves semantic aliases (phone, tablet, desktop)', () => {
      const { container } = render(
        <ClassicButton size={{ phone: 'xs', tablet: 'md', desktop: 'lg' }}>
          Aliased
        </ClassicButton>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('contains height, padding, and font-size in generated CSS', () => {
      const { container } = render(
        <ClassicButton size={{ xs: 'sm', md: 'md', xl: 'lg' }}>
          Multi-breakpoint
        </ClassicButton>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      expect(styleTag?.textContent).toContain('height:');
      expect(styleTag?.textContent).toContain('padding:');
      expect(styleTag?.textContent).toContain('font-size:');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('@media (min-width: 1280px)');
    });
  });
});
