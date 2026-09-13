/**
 * The modern Button skin anchors its root on `data-variant`, never on
 * `data-part`: P-79 lets a composite rename the part. These cases prove the
 * anchor is unconditional in the DOM; `Button.causality.integration.test.tsx`
 * proves a renamed button paints like a standalone one in a real browser.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import ModernButton from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

const HOSTILE = {
  'data-part': 'toolbar-action',
  'data-variant': 'caller-variant',
  'data-size': 'caller-size',
  'data-shape': 'caller-shape',
  className: 'ds-consumer__action ds-button--fake',
} as const;

async function renderButton(props: Record<string, unknown>) {
  cleanup();
  const { container } = renderWithEngine(
    <ModernButton {...props}>Go</ModernButton>,
    'modern'
  );
  await waitFor(() => expect(container.querySelector('.ds-button--modern')).not.toBeNull());
  return container;
}

const VARIANTS = [
  'primary', 'secondary', 'default', 'outline', 'dashed', 'ghost', 'text',
  'link', 'danger', 'success', 'warning', 'info', 'ai', 'error', 'gradient',
] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

describe('modern Button root anchor', () => {
  it('stamps data-variant on every root a caller can produce, and the caller cannot remove it', async () => {
    const cells: Array<Record<string, unknown>> = [
      {}, { variant: undefined }, { danger: true }, { danger: true, variant: 'ghost' },
      { busy: true }, { disabled: true }, { loading: true }, { block: true },
      { shape: 'circle' }, { icon: <span>i</span> }, { href: '/x' },
      { href: '/x', ...HOSTILE }, { ...HOSTILE },
      ...VARIANTS.map((variant) => ({ variant })),
      ...SIZES.map((size) => ({ size })),
    ];

    for (const cell of cells) {
      const container = await renderButton(cell);
      const root = container.querySelector('.ds-button.ds-button--modern');
      const label = JSON.stringify(cell);
      expect(root, label).not.toBeNull();
      expect(root!.getAttribute('data-variant'), label).toBeTruthy();
      expect(root!.className, label).toContain('ds-button--modern');
    }
  });

  it('lets the caller keep its part while the engine keeps the anchor', async () => {
    const container = await renderButton({ ...HOSTILE });
    const root = container.querySelector('.ds-button.ds-button--modern')!;
    expect(root.getAttribute('data-part')).toBe('toolbar-action');
    expect(root.getAttribute('data-variant')).toBe('primary');
    expect(root.getAttribute('data-size')).toBe('md');
    expect(root.getAttribute('data-shape')).toBe('default');
    expect(root.className).toContain('ds-consumer__action');
  });

  it('names its own root `trigger` when no composite renamed it', async () => {
    const container = await renderButton({});
    expect(container.querySelector('.ds-button--modern')!.getAttribute('data-part')).toBe('trigger');
  });
});
