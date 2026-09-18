import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CollectionHeader } from '..';
import { renderWithEngine } from '@tests/support/engine';

/**
 * Elevation contract for CollectionHeader (WO-FAM-10 sub-lot D2).
 *
 * These assertions guard the CHAIN, not the pixels. Every value this family
 * paints has to reach a tenant through `foundation token -> semantic channel ->
 * family channel (derivation/chrome/collection-header) -> stable DOM part`. An
 * inline style short-circuits that chain permanently: inline beats every
 * cascade layer, so a single re-added literal silently makes the tenant
 * channel behind it dead while the component still looks correct in the
 * default theme. That failure is invisible to a snapshot and to a DOM-contract
 * test, so it is asserted here on every part the family stamps.
 *
 * Updated by the cut: the family now carries NO inline paint at all (the 104
 * violations drained into the skin), so the assertions moved from "these four
 * parts" to "every stamped part", and the literal-colour sweep no longer
 * requires a styled node to exist — the honest post-drain expectation is that
 * the family's own subtree renders zero `[style]` attributes.
 */

// editorial-tech at desktop posture is the composition that renders every part
// this contract covers, including the two ornamental rules.
const FULL_PROPS = {
  eyebrow: 'Workspace',
  title: 'Candidates',
  subtitle: 'All active candidates',
  layoutVariant: 'editorial-tech' as const,
  compact: false,
  metaItems: [
    { key: 'a', label: '12 active', tone: 'primary' as const },
    { key: 'b', label: 'Neutral', tone: 'neutral' as const },
  ],
  shortcuts: [{ key: 's', label: 'Command K' }],
  quickActions: [
    { key: 'q1', label: 'Invite', onClick: vi.fn(), variant: 'primary' as const },
    { key: 'q2', label: 'Export', onClick: vi.fn(), variant: 'secondary' as const, icon: React.createElement('svg') },
  ],
};

async function renderFull() {
  const { container } = renderWithEngine(<CollectionHeader {...FULL_PROPS} />, 'modern');
  await waitFor(() => {
    expect(container.querySelector('.ds-collection-header[data-part="root"]')).not.toBeNull();
  });
  return container;
}

function partsOf(container: HTMLElement, part: string): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`));
}

describe('CollectionHeader elevation contract', () => {
  // Every part the family stamps on its own boxes — all Box renders, so no
  // later-layer typography skin competes for them and the skin is their
  // single owner. Composed primitives (Button, Dropdown, icons) run their own
  // kernels and are not this family's paint surface.
  it.each([
    'identity',
    'title',
    'eyebrow',
    'subtitle',
    'subtitle-row',
    'subtitle-divider',
    'editorial-tech-rule',
    'meta-item',
    'secondary-rail',
    'quick-actions',
    'quick-action-icon',
    'action-divider',
    'shortcuts-label',
    'shortcuts-label-icon',
    'shortcut-pill',
  ])('leaves %s entirely to the skin (no inline style)', async (part) => {
    const container = await renderFull();
    const nodes = partsOf(container, part);

    expect(nodes.length).toBeGreaterThan(0);
    for (const node of nodes) {
      expect(node.getAttribute('style')).toBeNull();
    }
  });

  it('leaves the family root entirely to the skin (no inline style)', async () => {
    const container = await renderFull();
    const root = container.querySelector('.ds-collection-header[data-part="root"]') as HTMLElement;

    expect(root.getAttribute('style')).toBeNull();
  });

  it('lets only --ds-* custom properties travel inline (the composed primitives\' own channels)', async () => {
    const container = await renderFull();
    const root = container.querySelector('.ds-collection-header[data-part="root"]') as HTMLElement;

    const styled = Array.from(root.querySelectorAll<HTMLElement>('[style]'));
    for (const node of styled) {
      const inline = node.getAttribute('style') ?? '';
      for (const declaration of inline.split(';')) {
        const property = declaration.split(':')[0]?.trim() ?? '';
        if (!property) continue;
        expect(
          property.startsWith('--ds-'),
          `inline property ${property} on <${node.tagName.toLowerCase()}>`,
        ).toBe(true);
      }
    }
  });

  it('keeps no type declaration inline on the title', async () => {
    const container = await renderFull();
    const title = partsOf(container, 'title')[0];
    const inline = title.getAttribute('style') ?? '';

    for (const property of [
      'font-family',
      'font-size',
      'font-weight',
      'letter-spacing',
      'line-height',
      'text-transform',
    ]) {
      expect(inline).not.toContain(property);
    }
  });

  it('stamps the posture attributes the identity measure and padding key on', async () => {
    const container = await renderFull();
    const identity = partsOf(container, 'identity')[0];
    const root = partsOf(container, 'root')[0];

    expect(identity).toBeDefined();
    expect(identity).toHaveAttribute('data-compact-layout');
    expect(identity).toHaveAttribute('data-editorial-tech');
    expect(root).toHaveAttribute('data-embedded');
    expect(root).toHaveAttribute('data-compact');
    expect(root).toHaveAttribute('data-minimal');
    expect(root).toHaveAttribute('data-editorial-tech');
  });

  // Binding law: never a literal colour. `color-mix(in srgb, ...)` is a chain,
  // not a literal -- its arguments are the channels being mixed.
  it('carries no literal colour anywhere in the rendered subtree', async () => {
    const container = await renderFull();
    const styled = Array.from(container.querySelectorAll<HTMLElement>('[style]'));

    for (const node of styled) {
      const inline = node.getAttribute('style') ?? '';
      expect(inline).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(inline).not.toMatch(/\b(?:rgba?|hsla?|oklch|oklab)\(/i);
    }
  });

  it('gives the loading skeleton an accessible name', async () => {
    const { container } = renderWithEngine(
      <CollectionHeader {...FULL_PROPS} loading />,
      'modern',
    );

    await waitFor(() => {
      expect(container.querySelector('[data-loading="true"]')).not.toBeNull();
    });

    const root = container.querySelector('[data-loading="true"]') as HTMLElement;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root.getAttribute('aria-label')).toBeTruthy();
  });
});
