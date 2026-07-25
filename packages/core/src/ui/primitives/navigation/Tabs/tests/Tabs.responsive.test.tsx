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
      expect(container.querySelector('style')).toBeNull();
      // data-responsive-id should NOT be present
      expect(container.querySelector('[data-responsive-id]')).toBeNull();
    });
  });

  describe('responsive size', () => {
    it('generates CSS media queries for responsive size', () => {
      const { container } = render(
        <ClassicTabs size={{ xs: 'sm', lg: 'lg' }} items={TAB_ITEMS} />
      );
      const styleTag = container.querySelector('style');
      const tabs = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(tabs).toBeInTheDocument();
      // Should contain padding and font-size declarations
      expect(styleTag?.textContent).toContain('padding:');
      expect(styleTag?.textContent).toContain('font-size:');
      // lg breakpoint: 1024px
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });

    it('sets data-responsive-id attribute on the element', () => {
      const { container } = render(
        <ClassicTabs size={{ xs: 'sm', md: 'lg' }} items={TAB_ITEMS} />
      );
      const tabs = container.querySelector('[data-responsive-id]');
      expect(tabs).toBeInTheDocument();
      expect(tabs?.getAttribute('data-responsive-id')).toBeTruthy();
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
      const styleTag = container.querySelector('style');
      expect(styleTag).not.toBeNull();
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });
  });
});

describe('ModernTabs responsive size', () => {
  it('projects the full tab anatomy through responsive custom properties', () => {
    const { container } = render(
      <ModernTabs size={{ base: 'sm', lg: 'lg' }} items={TAB_ITEMS} />
    );
    const styleTag = container.querySelector('style');
    const root = container.querySelector('.rottay-tabs--modern');

    expect(root).toHaveAttribute('data-size', 'responsive');
    expect(root).toHaveAttribute('data-responsive-id');
    expect(styleTag?.textContent).toContain('--ds-tabs-current-height:');
    expect(styleTag?.textContent).toContain('--ds-tabs-current-padding:');
    expect(styleTag?.textContent).toContain('--ds-tabs-current-font-size:');
    expect(styleTag?.textContent).toContain('--ds-tabs-current-icon-size:');
    expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
  });
});
