/**
 * @fileoverview Density-mode tests for CollectionWorkspaceSurface.
 *
 * Proves the `density` prop resolves the two design-language §3 presets: the
 * surface emits `--ds-density-cell-padding` / `--ds-density-card-padding` on
 * its root so the inner table and embedded cards derive padding from the
 * token cascade (route comfortable vs embedded/beside-chat compact). Scale is
 * routed through the presentation-profile hook with the mode preset as its
 * non-breaking fallback.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { CollectionWorkspaceSurface } from '../index';
import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderSurface } from '../../../../../foundation/common/test-utils';

interface Row {
  id: string;
  name: string;
}

const DATA: Row[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

const COLUMNS: ColumnDef<Row>[] = [{ key: 'name', header: 'Name', accessorKey: 'name' }];

async function renderDensityRoot(density: 'comfortable' | 'compact'): Promise<HTMLElement> {
  const { container } = renderSurface(
    <CollectionWorkspaceSurface
      title="Test Collection"
      data={DATA}
      columns={COLUMNS}
      rowKey="id"
      density={density}
    />,
  );

  await screen.findByText('Test Collection');
  const root = container.querySelector('[style*="--ds-density-cell-padding"]') as HTMLElement | null;
  if (!root) throw new Error('density root not found');
  return root;
}

describe('CollectionWorkspaceSurface density', () => {
  it('emits the comfortable preset on the surface root', async () => {
    const root = await renderDensityRoot('comfortable');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toContain('0.875rem 1rem');
    expect(root.style.getPropertyValue('--ds-density-card-padding')).toContain('1rem');
    expect(root.style.getPropertyValue('--ds-density-scale')).toBe(
      'var(--ds-collection-workspace-density-scale, 0.98)',
    );
  });

  it('emits the compact preset on the surface root', async () => {
    const root = await renderDensityRoot('compact');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toContain('0.5rem 0.75rem');
    expect(root.style.getPropertyValue('--ds-density-card-padding')).toContain('0.75rem');
    expect(root.style.getPropertyValue('--ds-density-scale')).toBe(
      'var(--ds-collection-workspace-density-scale, 0.9)',
    );
  });

  it('lets a presentation profile govern scale without replacing the mode fallback', async () => {
    const { container } = renderSurface(
      <div
        data-ds-presentation-profile="ambient-command"
        style={{ '--ds-collection-workspace-density-scale': '0.84' } as React.CSSProperties}
      >
        <CollectionWorkspaceSurface
          title="Test Collection"
          data={DATA}
          columns={COLUMNS}
          rowKey="id"
          density="compact"
        />
      </div>,
    );

    await screen.findByText('Test Collection');
    const profile = container.querySelector('[data-ds-presentation-profile]') as HTMLElement;
    const root = container.querySelector('[style*="--ds-density-cell-padding"]') as HTMLElement;

    expect(profile.style.getPropertyValue('--ds-collection-workspace-density-scale')).toBe('0.84');
    expect(root.style.getPropertyValue('--ds-density-scale')).toBe(
      'var(--ds-collection-workspace-density-scale, 0.9)',
    );
    expect(root.style.getPropertyPriority('--ds-density-scale')).toBe('');
  });

  it('defaults to the comfortable preset when density is omitted', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface title="Test Collection" data={DATA} columns={COLUMNS} rowKey="id" />,
    );
    await screen.findByText('Test Collection');
    const root = container.querySelector('[style*="--ds-density-cell-padding"]') as HTMLElement;
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toContain('0.875rem 1rem');
  });
});
