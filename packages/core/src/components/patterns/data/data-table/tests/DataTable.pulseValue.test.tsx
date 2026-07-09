/**
 * PulseValue x PatternDataTable wiring test (WO-CRA-07).
 *
 * `PulseValue` (patterns/foundation/hooks/usePulseOnChange.tsx) is the
 * data-table "live cells" integration point: it is not wired into the
 * engine internals (data-table's modern engine has five separate row-render
 * paths -- main, card, compact, virtualized, grouped -- and forcing a new
 * column flag through all five would be a much larger, riskier change than
 * this WO's outcome requires). Instead it consumes the EXISTING `col.render`
 * extensibility point (`foundation/types.ts` `Column.render`). This test
 * proves that integration point actually works end-to-end through a real
 * `PatternDataTable`, not just in isolation -- it fails if `col.render`
 * stops being invoked with the live cell value, or if a value change stops
 * producing a flash.
 */
import React, { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DesignSystemProvider } from '../../../../../runtime/bootstrap';
import type { TenantConfig } from '../../../../../contracts';
import { PatternDataTable } from '..';
import { PulseValue } from '../../../foundation/hooks/usePulseOnChange';

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'pulse-value-test',
  name: 'Pulse Value Test Tenant',
  engine: 'rustic',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Pulse Value Test Tenant',
    primaryColor: '#2563eb',
    darkPrimaryColor: '#60a5fa',
    secondaryColor: '#0f766e',
    darkSecondaryColor: '#5eead4',
    accentColor: '#7c3aed',
    darkAccentColor: '#c4b5fd',
  },
};

function renderTable(price: number) {
  const rows = [{ id: 'row-1', name: 'Widget', price }];

  return render(
    <DesignSystemProvider tenantConfig={TEST_TENANT_CONFIG} forceEngine="rustic" skipCssLoading>
      <Suspense fallback={<div>Loading...</div>}>
        <PatternDataTable
          engine="rustic"
          data={rows}
          rowKey="id"
          columns={[
            { key: 'name', header: 'Name', accessorKey: 'name' },
            {
              key: 'price',
              header: 'Price',
              accessorKey: 'price',
              render: (value) => <PulseValue value={value}>{`$${value}`}</PulseValue>,
            },
          ]}
        />
      </Suspense>
    </DesignSystemProvider>
  );
}

describe('PulseValue wired through PatternDataTable col.render', () => {
  it('renders the live value through the custom render function', async () => {
    renderTable(100);
    expect(await screen.findByText('$100', undefined, { timeout: 30000 })).toBeInTheDocument();
  }, 45000);

  it('does not flash on initial render', async () => {
    const { container } = renderTable(100);
    await screen.findByText('$100', undefined, { timeout: 30000 });
    expect(container.querySelector('.ds-pulse-changed')).toBeNull();
  }, 45000);

  it('flashes the cell once the underlying value changes', async () => {
    const rows100 = [{ id: 'row-1', name: 'Widget', price: 100 }];
    const columns = [
      { key: 'name', header: 'Name', accessorKey: 'name' as const },
      {
        key: 'price',
        header: 'Price',
        accessorKey: 'price' as const,
        render: (value: unknown) => <PulseValue value={value}>{`$${value}`}</PulseValue>,
      },
    ];

    const { rerender } = render(
      <DesignSystemProvider tenantConfig={TEST_TENANT_CONFIG} forceEngine="rustic" skipCssLoading>
        <Suspense fallback={<div>Loading...</div>}>
          <PatternDataTable engine="rustic" data={rows100} rowKey="id" columns={columns} />
        </Suspense>
      </DesignSystemProvider>
    );

    await screen.findByText('$100', undefined, { timeout: 30000 });

    rerender(
      <DesignSystemProvider tenantConfig={TEST_TENANT_CONFIG} forceEngine="rustic" skipCssLoading>
        <Suspense fallback={<div>Loading...</div>}>
          <PatternDataTable
            engine="rustic"
            data={[{ id: 'row-1', name: 'Widget', price: 150 }]}
            rowKey="id"
            columns={columns}
          />
        </Suspense>
      </DesignSystemProvider>
    );

    const flashed = await screen.findByText('$150', undefined, { timeout: 30000 });
    expect(flashed.className).toContain('ds-pulse-changed');
  }, 45000);
});
