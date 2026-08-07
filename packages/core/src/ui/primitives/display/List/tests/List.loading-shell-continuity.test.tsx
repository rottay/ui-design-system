import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernList, { Item as ModernItem } from '../engines/modern';

// Loading is the SAME shell with skeleton content: frame, size, layout stamps, header
// and footer all survive, or the list jumps on every load.

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/list.css'
  ),
  'utf8'
);

function rootOf(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-part="root"]') as HTMLElement;
}

describe('List modern — loading shell continuity', () => {
  it('carries the same frame, size and layout stamps it will carry when loaded', () => {
    const shell = { bordered: true, size: 'large', itemLayout: 'vertical' } as const;

    const { container: busy } = render(<ModernList {...shell} loading />);
    const { container: ready } = render(
      <ModernList {...shell}>
        <ModernItem>one</ModernItem>
      </ModernList>
    );

    for (const attribute of ['data-bordered', 'data-size', 'data-item-layout']) {
      expect(rootOf(busy).getAttribute(attribute)).toBe(rootOf(ready).getAttribute(attribute));
    }
    expect(rootOf(busy)).toHaveAttribute('data-loading', 'true');
    expect(rootOf(busy)).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps the header and footer visible while the rows load', () => {
    const { container } = render(
      <ModernList loading header={<span>Recent activity</span>} footer={<span>4 of 40</span>} />
    );

    // The header is usually the list's name; losing it left AT with an
    // unnamed busy region and sighted users with an unlabelled block.
    expect(container.querySelector('[data-part="header"]')).toHaveTextContent('Recent activity');
    expect(container.querySelector('[data-part="footer"]')).toHaveTextContent('4 of 40');
    expect(container.querySelectorAll('[data-part="skeleton-row"]')).toHaveLength(3);
  });

  it('reserves the grid tracks a fixed-count grid list will resolve into', () => {
    const { container } = render(
      <ModernList loading grid={{ column: 4, gutter: 24 }} />
    );

    const skeleton = container.querySelector('[data-part="skeleton"]') as HTMLElement;
    expect(skeleton).toHaveAttribute('data-grid', 'fixed');
    expect(skeleton.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
    expect(skeleton.style.gap).toBe('24px');
  });

  it('hands the per-breakpoint tiers to the skin exactly as the loaded list does', () => {
    const { container } = render(
      <ModernList loading grid={{ xs: 1, md: 2, xl: 4, gutter: 16 }} />
    );

    const skeleton = container.querySelector('[data-part="skeleton"]') as HTMLElement;
    expect(skeleton).toHaveAttribute('data-grid', 'responsive');
    // An inline track list would outrank the queries, so the responsive
    // posture publishes counts only — the same law as the loaded `<ul>`.
    expect(skeleton.style.gridTemplateColumns).toBe('');
    expect(skeleton.style.getPropertyValue('--_ds-list-grid-columns-xs')).toBe('1');
    expect(skeleton.style.getPropertyValue('--_ds-list-grid-columns-md')).toBe('2');
    expect(skeleton.style.getPropertyValue('--_ds-list-grid-columns-xl')).toBe('4');
  });

  it('adds no grid posture to an ungridded loading list', () => {
    const { container } = render(<ModernList loading />);
    const skeleton = container.querySelector('[data-part="skeleton"]') as HTMLElement;
    expect(skeleton.hasAttribute('data-grid')).toBe(false);
    expect(skeleton.getAttribute('style')).toBeNull();
  });

  it('gives the skeleton container the grid display and the tier queries in the skin', () => {
    expect(SKIN).toMatch(
      /\[data-loading='true'\] > \[data-part='skeleton'\]\[data-grid\]\s*\{\s*display:\s*grid;/
    );
    for (const tier of ['sm', 'md', 'lg', 'xl', 'xxl'] as const) {
      expect(SKIN).toMatch(
        new RegExp(
          `\\[data-part='skeleton'\\]\\[data-grid='responsive'\\]\\s*\\{\\s*grid-template-columns:\\s*repeat\\(var\\(--_ds-list-grid-columns-${tier}`
        )
      );
    }
  });
});
