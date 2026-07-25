/**
 * @fileoverview Density-mode tests for PatternDataTable.
 *
 * Proves the `density` prop resolves the two design-language §3 presets as
 * neutral anatomy. Stable padding remains in the Modern skin so a tenant can
 * replace it through tokens instead of receiving a frozen inline value.
 */

import React, { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import { PatternDataTable } from '..';

const TENANT: TenantConfig = {
  slug: 'density-test',
  name: 'Density Test Tenant',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Density Test Tenant',
    primaryColor: '#2563eb',
    darkPrimaryColor: '#60a5fa',
    secondaryColor: '#0f766e',
    darkSecondaryColor: '#5eead4',
    accentColor: '#7c3aed',
    darkAccentColor: '#c4b5fd',
  },
};

const rows = [
  { id: 'r-1', name: 'Alice' },
  { id: 'r-2', name: 'Bob' },
];

async function renderTableRoot(density: 'comfortable' | 'compact'): Promise<HTMLElement> {
  const { container } = render(
    <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" skipCssLoading>
      <Suspense fallback={<div>loading</div>}>
        <PatternDataTable
          engine="modern"
          data={rows}
          rowKey="id"
          columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]}
          density={density}
        />
      </Suspense>
    </DesignSystemProvider>,
  );

  await screen.findByText('Name', undefined, { timeout: 15000 });
  const root = container.querySelector('.ds-pattern-data-table') as HTMLElement | null;
  if (!root) throw new Error('data table root not found');
  return root;
}

describe('PatternDataTable density', () => {
  it('emits the comfortable cell-padding preset', async () => {
    const root = await renderTableRoot('comfortable');
    expect(root).toHaveAttribute('data-density', 'comfortable');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toBe('');
    expect(root.className).toContain('ds-table-density-comfortable');
  }, 20000);

  it('emits the compact cell-padding preset', async () => {
    const root = await renderTableRoot('compact');
    expect(root).toHaveAttribute('data-density', 'compact');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toBe('');
    expect(root.className).toContain('ds-table-density-compact');
  }, 20000);

  it('defaults to the comfortable preset when density is omitted', async () => {
    const { container } = render(
      <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" skipCssLoading>
        <Suspense fallback={<div>loading</div>}>
          <PatternDataTable
            engine="modern"
            data={rows}
            rowKey="id"
            columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]}
          />
        </Suspense>
      </DesignSystemProvider>,
    );
    await screen.findByText('Name', undefined, { timeout: 15000 });
    const root = container.querySelector('.ds-pattern-data-table') as HTMLElement;
    expect(root).toHaveAttribute('data-density', 'comfortable');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toBe('');
  }, 20000);
});
