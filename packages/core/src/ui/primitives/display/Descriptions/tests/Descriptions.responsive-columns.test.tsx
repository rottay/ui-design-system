import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { ModernDescriptions, ModernItem } from '../engines/modern';

// All six `ResponsiveColumn` tiers must reach the skin as channels; the engine writes
// no inline count, which would outrank the mobile-first queries that make them real.

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/descriptions.css'
  ),
  'utf8'
);

function renderColumns(column: React.ComponentProps<typeof ModernDescriptions>['column']) {
  const { container } = render(
    <ModernDescriptions column={column}>
      <ModernItem label="Name">Ada</ModernItem>
    </ModernDescriptions>
  );
  return container.querySelector('[data-part="root"]') as HTMLElement;
}

describe('Descriptions modern — responsive column tiers', () => {
  it('publishes every declared tier instead of resolving one of them', () => {
    const root = renderColumns({ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 });

    expect(root).toHaveAttribute('data-columns', 'responsive');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-xs')).toBe('1');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-sm')).toBe('2');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-md')).toBe('3');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-lg')).toBe('4');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-xl')).toBe('5');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-xxl')).toBe('6');
  });

  it('never exceeds the author’s widest declared count', () => {
    // The defect in one line: two declared tiers, neither of them 3, used to
    // produce a three-track grid.
    const root = renderColumns({ xs: 1, sm: 2 });

    expect(root).toHaveAttribute('data-column-count', '2');
    expect(root.style.getPropertyValue('--ds-descriptions-column-count')).toBe('');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-xs')).toBe('1');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-xxl')).toBe('2');
  });

  it('carries an undeclared tier forward from the nearest smaller one', () => {
    const root = renderColumns({ md: 4 });

    expect(root.style.getPropertyValue('--_ds-descriptions-columns-xs')).toBe('1');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-sm')).toBe('1');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-md')).toBe('4');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-lg')).toBe('4');
    expect(root.style.getPropertyValue('--_ds-descriptions-columns-xxl')).toBe('4');
  });

  it('writes no inline count in the responsive posture, so the queries can win', () => {
    // An inline `grid-template-columns` feeder outranks every media query;
    // that is exactly why the responsive posture must not write one.
    const root = renderColumns({ xs: 1, lg: 4 });
    expect(root.style.getPropertyValue('--ds-descriptions-column-count')).toBe('');
  });

  it('keeps the scalar and empty-object postures on the inline count', () => {
    const scalar = renderColumns(2);
    expect(scalar).toHaveAttribute('data-columns', 'fixed');
    expect(scalar.style.getPropertyValue('--ds-descriptions-column-count')).toBe('2');
    expect(scalar).toHaveAttribute('data-column-count', '2');

    const empty = renderColumns({});
    expect(empty).toHaveAttribute('data-columns', 'fixed');
    expect(empty.style.getPropertyValue('--ds-descriptions-column-count')).toBe('3');

    const nonsense = renderColumns({ md: 0, lg: Number.NaN });
    expect(nonsense).toHaveAttribute('data-columns', 'fixed');
    expect(nonsense.style.getPropertyValue('--ds-descriptions-column-count')).toBe('3');
  });

  it('clamps a row span to the widest declared count, not to a phantom third track', () => {
    const { container } = render(
      <ModernDescriptions column={{ xs: 1, sm: 2 }}>
        <ModernItem label="Bio" span={5}>
          Long
        </ModernItem>
      </ModernDescriptions>
    );
    expect(container.querySelector('[data-part="row"]')).toHaveAttribute('data-span', '2');
  });

  it('reads one tier channel per breakpoint in the skin', () => {
    for (const [query, tier] of [
      ['640px', 'sm'],
      ['768px', 'md'],
      ['1024px', 'lg'],
      ['1280px', 'xl'],
      ['1536px', 'xxl'],
    ] as const) {
      // The tiers are CONTAINER-keyed: the family reacts to the width it was
      // given, not to the window. A `@media` here would size a Descriptions in
      // a narrow rail from the viewport and hand it the wide tier.
      expect(SKIN).not.toContain(`@media (min-width: ${query})`);
      const block = SKIN.slice(SKIN.indexOf(`@container (min-width: ${query})`));
      expect(block).toMatch(
        new RegExp(
          `\\[data-columns='responsive'\\][^{]*\\{\\s*--ds-descriptions-column-count:\\s*var\\(--_ds-descriptions-columns-${tier}`
        )
      );
    }
    // The mobile-first floor is unconditional, not a query: it is authored
    // before the first tier block, so no container condition can withhold it.
    const floor = SKIN.search(
      /\[data-part='root'\]\[data-columns='responsive'\] > \[data-part='body'\] > \[data-part='rows'\]\s*\{\s*--ds-descriptions-column-count:\s*var\(--_ds-descriptions-columns-xs/
    );
    expect(floor).toBeGreaterThan(-1);
    expect(floor).toBeLessThan(SKIN.indexOf('@container (min-width: 640px)'));
    // The narrow-container collapse must still outrank the tiers: it sets the
    // track list outright and lives after them in the cascade.
    expect(SKIN.indexOf('@container (max-width: 860px)')).toBeGreaterThan(
      SKIN.indexOf('@container (min-width: 1536px)')
    );
  });
});
