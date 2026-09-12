/**
 * Tabs responsive prop tests.
 * Tests that Tabs engines correctly handle ResponsiveValue objects
 * for the `size` prop (padding, font-size).
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicTabs from '../engines/classic';
import ModernTabs from '../engines/modern';
import { responsiveChannelElement, responsiveCss, responsiveTokens } from '@tests/support/responsive';

const TAB_ITEMS = [
  { key: '1', label: 'Tab 1', children: <div>Content 1</div> },
  { key: '2', label: 'Tab 2', children: <div>Content 2</div> },
];

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe('ClassicTabs responsive size', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar size without injecting a responsive style tag', () => {
      const { container } = render(
        <ClassicTabs size="lg" items={TAB_ITEMS} />
      );
      // No responsive style tag should be injected for scalar values
      expect(responsiveCss(container)).toBe('');
      // no responsive channel is armed at all
      expect(responsiveChannelElement(container)).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ClassicTabs size={{ xs: 'sm', lg: 'lg' }} items={TAB_ITEMS} />
      );
      const styleTag = responsiveCss(container);
      const tabs = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(tabs).toBeInTheDocument();
      // Should contain padding and font-size declarations
      expect(styleTag).toContain('padding:');
      expect(styleTag).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag).toContain('@media (min-width: 1024px)');
    });

    it('arms the governed responsive channels on the element', () => {
      const { container } = render(
        <ClassicTabs size={{ xs: 'sm', md: 'lg' }} items={TAB_ITEMS} />
      );
      const tabs = responsiveChannelElement(container);
      expect(tabs).toBeInTheDocument();
      expect(responsiveTokens(container).length).toBeGreaterThan(0);
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicTabs
          size={{ phone: 'sm', tablet: 'md', desktop: 'lg' }}
          items={TAB_ITEMS}
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

describe('ModernTabs responsive size', () => {
  it('projects the full tab anatomy through responsive custom properties', () => {
    const { container } = render(
      <ModernTabs size={{ base: 'sm', lg: 'lg' }} items={TAB_ITEMS} />
    );
    const styleTag = responsiveCss(container);
    const root = container.querySelector('.rottay-tabs--modern');

    expect(root).toHaveAttribute('data-size', 'responsive');
    expect(responsiveTokens(container).length).toBeGreaterThan(0);
    // Responsive rules configure the public responsive inputs. The skin
    // resolves them into private `--_ds-tabs-current-*` intermediates so
    // callers cannot couple themselves to the internal cascade.
    expect(styleTag).toContain('--ds-tabs-responsive-height:');
    expect(styleTag).toContain('--ds-tabs-responsive-padding:');
    expect(styleTag).toContain('--ds-tabs-responsive-font-size:');
    expect(styleTag).toContain('--ds-tabs-responsive-icon-size:');
    expect(styleTag).toContain('@media (min-width: 1024px)');
  });
});
