/**
 * @fileoverview Density-mode tests for CollectionWorkspaceSurface.
 *
 * Proves the `density` prop resolves the two design-language §3 presets: the
 * surface emits `--ds-density-cell-padding` / `--ds-density-card-padding` on
 * its root so the inner table and embedded cards derive padding from the
 * token cascade (route comfortable vs embedded/beside-chat compact). The
 * semantic factor composes beside the tenant's inherited structural scale.
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
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toContain('0.875rem');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toContain('calc(1rem');
    expect(root.style.getPropertyValue('--ds-density-card-padding')).toContain('1rem');
    expect(root.style.getPropertyValue('--ds-density-local-factor')).toBe(
      'var(--ds-collection-workspace-density-local-factor, 1)',
    );
    expect(root.style.getPropertyValue('--ds-density-mode-factor')).toBe('');
    expect(root.style.getPropertyValue('--ds-density-scale')).toBe('');
  });

  it('emits the compact preset on the surface root', async () => {
    const root = await renderDensityRoot('compact');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toContain('0.5rem');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toContain('0.75rem');
    expect(root.style.getPropertyValue('--ds-density-card-padding')).toContain('0.75rem');
    expect(root.style.getPropertyValue('--ds-density-local-factor')).toBe(
      'var(--ds-collection-workspace-density-local-factor, 0.85)',
    );
  });

  it('lets a presentation profile govern the mode factor without replacing its fallback', async () => {
    const { container } = renderSurface(
      <div
        data-tenant-theme-scope="test"
        style={{ '--ds-collection-workspace-density-local-factor': '0.84' } as React.CSSProperties}
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
    const themeScope = container.querySelector('[data-tenant-theme-scope]') as HTMLElement;
    const root = container.querySelector('[style*="--ds-density-cell-padding"]') as HTMLElement;

    expect(themeScope.style.getPropertyValue('--ds-collection-workspace-density-local-factor')).toBe('0.84');
    expect(root.style.getPropertyValue('--ds-density-local-factor')).toBe(
      'var(--ds-collection-workspace-density-local-factor, 0.85)',
    );
    expect(root.style.getPropertyPriority('--ds-density-local-factor')).toBe('');
  });

  it('defaults to the comfortable preset when density is omitted', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface title="Test Collection" data={DATA} columns={COLUMNS} rowKey="id" />,
    );
    await screen.findByText('Test Collection');
    const root = container.querySelector('[style*="--ds-density-cell-padding"]') as HTMLElement;
    const cellPadding = root.style.getPropertyValue('--ds-density-cell-padding');
    expect(cellPadding).toContain('0.875rem');
    expect(cellPadding).toContain('calc(1rem');
    expect(cellPadding).toContain('--ds-density-global-effective-scale');
  });
});
