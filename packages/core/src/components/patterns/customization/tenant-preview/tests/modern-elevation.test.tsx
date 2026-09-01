/**
 * Modern TenantPreview elevation contracts (Lane E1).
 *
 * Each case fails against the pre-change engine: the palette wrapper shared
 * `data-part="palette"` with its group lists, the personality floor shipped a
 * raw `{preset}` placeholder without an I18nProvider, the Edge Accent tile was
 * hardcoded to the disabled copy, a dead logo left a broken image, and the
 * palette lists carried no accessible name.
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import type { TenantCreationConfig } from '../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import ModernTenantPreview from '../engines/modern';

const baseConfig: TenantCreationConfig = {
  slug: 'test-tenant',
  name: 'Test Tenant',
  primaryColor: '#3B82F6',
  personality: 'formal',
};

function renderPreview(config: Partial<TenantCreationConfig> = {}) {
  return render(
    <ModernTenantPreview config={{ ...baseConfig, ...config }} components={['button']} />
  );
}

describe('ModernTenantPreview elevation', () => {
  it('gives every data-part exactly one owner inside the root (no duplicate peers)', () => {
    const { container } = renderPreview();
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    // The wrapper is its own part; only the two group lists are `palette`.
    expect(root.querySelectorAll('[data-part="palette-section"]')).toHaveLength(1);
    const palettes = root.querySelectorAll('[data-part="palette"]');
    expect(palettes).toHaveLength(1); // primary only (no secondaryColor here)
    for (const node of Array.from(palettes)) {
      expect(node.getAttribute('data-palette')).toMatch(/^(primary|secondary)$/);
    }
    // The wrapper is never also a palette list.
    const wrapper = root.querySelector('[data-part="palette-section"]') as HTMLElement;
    expect(wrapper.getAttribute('role')).toBe('group');
    expect(wrapper.getAttribute('data-palette')).toBeNull();
  });

  it('adds a second palette list only for the secondary color, still one wrapper', () => {
    const { container } = renderPreview({ secondaryColor: '#10B981' });
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.querySelectorAll('[data-part="palette-section"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-part="palette"]')).toHaveLength(2);
  });

  it('names both palette lists and labels each section group', () => {
    const { container } = renderPreview({ secondaryColor: '#10B981' });
    const lists = Array.from(container.querySelectorAll('[data-part="palette"][role="list"]'));
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      expect(list.getAttribute('aria-label')).toBeTruthy();
    }

    const groups = Array.from(container.querySelectorAll('[role="group"]'));
    expect(groups.length).toBeGreaterThanOrEqual(3);
    for (const group of groups) {
      const labelledBy = group.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      const label = container.querySelector(`#${CSS.escape(labelledBy as string)}`);
      expect(label).not.toBeNull();
      expect((label as HTMLElement).textContent?.trim()).not.toBe('');
    }
  });

  it('interpolates the personality floor with no I18nProvider mounted', () => {
    const { container } = renderPreview({ personality: 'formal' });
    const text = container.textContent ?? '';
    expect(text).not.toContain('{preset}');
    expect(text).toContain('Personality: formal');
  });

  it('drives the Edge Accent tile from the resolved personality accent tokens', () => {
    const { container: playful } = renderPreview({ personality: 'playful' });
    const { container: formal } = renderPreview({ personality: 'formal' });

    const tileValue = (root: HTMLElement, label: string): string => {
      const tiles = Array.from(root.querySelectorAll('[data-part="personality-tile"]'));
      const tile = tiles.find(
        (node) => node.querySelector('[data-part="personality-tile-label"]')?.textContent === label
      );
      return tile?.querySelector('[data-part="personality-tile-value"]')?.textContent ?? '';
    };

    const playfulValue = tileValue(playful as unknown as HTMLElement, 'Edge Accent');
    const formalValue = tileValue(formal as unknown as HTMLElement, 'Edge Accent');

    expect(playfulValue).not.toBe('');
    expect(formalValue).not.toBe('');
    // The tile must vary with the preset instead of always reporting Disabled.
    expect(playfulValue).not.toBe(formalValue);
  });

  it('bidi-isolates tenant-supplied strings in the header', () => {
    const { container } = renderPreview({ name: 'Test Tenant', slug: 'test-tenant' });
    const name = container.querySelector('[data-part="tenant-name"] bdi');
    expect(name?.textContent).toBe('Test Tenant');

    const metaItems = Array.from(container.querySelectorAll('[data-part="tenant-slug"] bdi'));
    expect(metaItems.map((n) => n.textContent)).toEqual(['test-tenant', 'classic', 'formal']);
  });

  it('drops the logo slot when the tenant logo fails to load', () => {
    const { container } = renderPreview({ logo: 'https://example.invalid/logo.png' });
    const img = container.querySelector('[data-part="logo"] img') as HTMLImageElement;
    expect(img).not.toBeNull();

    fireEvent.error(img);

    expect(container.querySelector('[data-part="logo"]')).toBeNull();
    // The header keeps its remaining content; nothing else collapses.
    expect(screen.getByText('Test Tenant')).toBeTruthy();
  });
});
