/**
 * Box responsive prop tests.
 * Tests that Box engines correctly handle ResponsiveValue objects
 * for padding, margin, display, width, minWidth, and maxWidth.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ClassicBox from '../engines/classic';

describe('ClassicBox responsive props', () => {
  describe('backward compatibility', () => {
    it('renders plain scalar padding as inline style', () => {
      const { container } = render(
        <ClassicBox p="md">Content</ClassicBox>
      );
      const box = container.querySelector('.rottay-box--classic');
      expect(box).toBeInTheDocument();
      expect(box).toHaveStyle({ padding: '1rem' });
      // No style tag should be injected
      expect(container.querySelector('style')).toBeNull();
    });

    it('renders plain scalar display as inline style', () => {
      const { container } = render(
        <ClassicBox display="flex">Content</ClassicBox>
      );
      const box = container.querySelector('.rottay-box--classic');
      expect(box).toHaveStyle({ display: 'flex' });
      expect(container.querySelector('style')).toBeNull();
    });

    it('renders plain scalar width as inline style', () => {
      const { container } = render(
        <ClassicBox width="200px">Content</ClassicBox>
      );
      const box = container.querySelector('.rottay-box--classic');
      expect(box).toHaveStyle({ width: '200px' });
      expect(container.querySelector('style')).toBeNull();
    });
  });

  describe('responsive padding', () => {
    it('generates CSS media queries for responsive padding', () => {
      const { container } = render(
        <ClassicBox p={{ xs: 'sm', lg: 'xl' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      const box = container.querySelector('[data-responsive-id]');

      expect(styleTag).not.toBeNull();
      expect(box).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('padding: 0.5rem;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain('padding: 2rem;');
    });

    it('generates CSS for responsive px (horizontal padding)', () => {
      const { container } = render(
        <ClassicBox px={{ base: 'xs', md: 'lg' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('padding-left: 0.25rem;');
      expect(styleTag?.textContent).toContain('padding-right: 0.25rem;');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('padding-left: 1.5rem;');
    });
  });

  describe('responsive margin', () => {
    it('generates CSS media queries for responsive margin', () => {
      const { container } = render(
        <ClassicBox m={{ xs: 'sm', xl: '2xl' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('margin: 0.5rem;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1280px)');
      expect(styleTag?.textContent).toContain('margin: 2.5rem;');
    });

    it('generates CSS for responsive mx (horizontal margin)', () => {
      const { container } = render(
        <ClassicBox mx={{ phone: 'xs', desktop: 'lg' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('margin-left: 0.25rem;');
      expect(styleTag?.textContent).toContain('margin-right: 0.25rem;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
    });
  });

  describe('responsive display', () => {
    it('generates CSS for responsive display', () => {
      const { container } = render(
        <ClassicBox display={{ xs: 'none', md: 'block', lg: 'flex' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('display: none;');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('display: block;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain('display: flex;');
    });
  });

  describe('responsive width', () => {
    it('generates CSS for responsive width', () => {
      const { container } = render(
        <ClassicBox width={{ xs: '100%', md: '50%', lg: '33%' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('width: 100%;');
      expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
      expect(styleTag?.textContent).toContain('width: 50%;');
      expect(styleTag?.textContent).toContain('width: 33%;');
    });
  });

  describe('responsive maxWidth', () => {
    it('generates CSS for responsive maxWidth', () => {
      const { container } = render(
        <ClassicBox maxWidth={{ xs: '100%', lg: '960px' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('max-width: 100%;');
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain('max-width: 960px;');
    });
  });

  describe('alias resolution', () => {
    it('resolves phone -> xs, tablet -> sm, desktop -> lg', () => {
      const { container } = render(
        <ClassicBox p={{ phone: 'xs', tablet: 'md', desktop: 'xl' }}>Content</ClassicBox>
      );
      const styleTag = container.querySelector('style');
      // phone -> xs (no media query)
      expect(styleTag?.textContent).toContain('padding: 0.25rem;');
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain('@media (min-width: 640px)');
      expect(styleTag?.textContent).toContain('padding: 1rem;');
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleTag?.textContent).toContain('padding: 2rem;');
    });
  });
});
