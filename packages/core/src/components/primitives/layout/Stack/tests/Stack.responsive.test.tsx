/**
 * Stack responsive prop tests.
 * Tests that Stack engines correctly handle ResponsiveValue objects
 * for direction, spacing/gap, align, justify, and wrap.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ApolloStack from '../engines/rustic';
import { SPACING_MAP } from '../Stack.types';

describe('RusticStack responsive props', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar direction as inline style', () => {
      const { container } = render(
        <ApolloStack direction="horizontal" spacing="md">Content</ApolloStack>
      );
      const stack = container.querySelector('.rottay-stack--rustic');
      expect(stack).toBeInTheDocument();
      expect(stack).toHaveStyle({ flexDirection: 'row' });
      expect(container.querySelector('style')).toBeNull();
    });

    it('renders plain scalar spacing as inline style', () => {
      const { container } = render(
        <ApolloStack spacing="lg">Content</ApolloStack>
      );
      const stack = container.querySelector('.rottay-stack--rustic');
      expect(stack?.getAttribute('style')).toContain(`gap: ${SPACING_MAP.lg}`);
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('responsive direction', () => {
    it('generates CSS media queries for responsive direction', () => {
      const { container } = render(
        <ApolloStack direction={{ xs: 'vertical', lg: 'horizontal' }}>Content</ApolloStack>
      );
      const styleTag = container.querySelector('style');
      const stack = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(stack).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('flex-direction: column;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain('flex-direction: row;');
    });
  });

  describe('responsive spacing', () => {
    it('generates CSS for responsive spacing presets', () => {
      const { container } = render(
        <ApolloStack spacing={{ xs: 'sm', md: 'lg', xl: '2xl' }}>Content</ApolloStack>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain(`gap: ${SPACING_MAP.sm};`);
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain(`gap: ${SPACING_MAP.lg};`);
      expect(styleTag?.textContent).toContain('@media (min-width: 1280px)');
      expect(styleTag?.textContent).toContain(`gap: ${SPACING_MAP['2xl']};`);
    });

    it('generates CSS for responsive gap with numbers', () => {
      const { container } = render(
        <ApolloStack gap={{ xs: 8, lg: 24 }}>Content</ApolloStack>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('gap: 8px;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain('gap: 24px;');
    });
  });

  describe('responsive align', () => {
    it('generates CSS for responsive align', () => {
      const { container } = render(
        <ApolloStack align={{ xs: 'stretch', md: 'center' }}>Content</ApolloStack>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('align-items: stretch;');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('align-items: center;');
    });
  });

  describe('responsive justify', () => {
    it('generates CSS for responsive justify', () => {
      const { container } = render(
        <ApolloStack justify={{ xs: 'start', lg: 'space-between' }}>Content</ApolloStack>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('justify-content: flex-start;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain('justify-content: space-between;');
    });
  });

  describe('responsive wrap', () => {
    it('generates CSS for responsive wrap', () => {
      const { container } = render(
        <ApolloStack wrap={{ xs: false, md: true }}>Content</ApolloStack>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('flex-wrap: nowrap;');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('flex-wrap: wrap;');
    });
  });

  describe('alias resolution', () => {
    it('resolves phone, tablet, desktop aliases', () => {
      const { container } = render(
        <ApolloStack
          direction={{ phone: 'vertical', tablet: 'horizontal' }}
          spacing={{ phone: 'sm', desktop: 'xl' }}
        >
          Content
        </ApolloStack>
      );
      const styleTag = container.querySelector('style');
      // phone -> xs (no media query)
      expect(styleTag?.textContent).toContain('flex-direction: column;');
      expect(styleTag?.textContent).toContain(`gap: ${SPACING_MAP.sm};`);
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      expect(styleTag?.textContent).toContain('flex-direction: row;');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain(`gap: ${SPACING_MAP.xl};`);
    });
  });
});
