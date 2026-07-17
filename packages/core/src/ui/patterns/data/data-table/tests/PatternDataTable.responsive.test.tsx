import React, { Suspense } from 'react';
import { describe, expect, it, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';
import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { ColumnDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import { PatternDataTable } from '..';

interface Row {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
}

const rows: Row[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com', role: 'Admin', salary: 90000 },
  { id: '2', name: 'Bob', email: 'bob@test.com', role: 'User', salary: 75000 },
];

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'responsive-test',
  name: 'Responsive Test',
  engine: 'classic',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Responsive Test',
    primaryColor: '#2563eb',
    darkPrimaryColor: '#60a5fa',
    secondaryColor: '#0f766e',
    darkSecondaryColor: '#5eead4',
    accentColor: '#7c3aed',
    darkAccentColor: '#c4b5fd',
  },
};

afterEach(() => {
  cleanup();
});

function renderTable(columns: ColumnDef<Row>[]) {
  return render(
    <DesignSystemProvider
      tenantConfig={TEST_TENANT_CONFIG}
      forceEngine="classic"
      skipCssLoading
    >
      <Suspense fallback={<div>Loading...</div>}>
        <PatternDataTable<Row>
          engine="classic"
          data={rows}
          rowKey="id"
          columns={columns}
        />
      </Suspense>
    </DesignSystemProvider>
  );
}

describe('PatternDataTable responsive columns', () => {
  describe('columns with responsive.phone: hidden', () => {
    it('hides the column on mobile viewport', async () => {
      mockMatchMedia(390); // phone

      const columns: ColumnDef<Row>[] = [
        { key: 'name', header: 'Name', accessorKey: 'name', responsive: { phone: 'primary' } },
        { key: 'email', header: 'Email', accessorKey: 'email', responsive: { phone: 'hidden' } },
        { key: 'role', header: 'Role', accessorKey: 'role', responsive: { phone: 'summary' } },
      ];

      renderTable(columns);

      // Name should be visible (primary = card title)
      expect(await screen.findByText('Alice', undefined, { timeout: 5000 })).toBeInTheDocument();

      // Role should appear (summary field)
      expect(screen.getByText('Admin')).toBeInTheDocument();

      // Email should NOT appear -- it is hidden on phone
      expect(screen.queryByText('alice@test.com')).not.toBeInTheDocument();
      expect(screen.queryByText('bob@test.com')).not.toBeInTheDocument();
    });
  });

  describe('primary columns become card title on mobile', () => {
    it('uses the primary column as the card title instead of the first column', async () => {
      mockMatchMedia(390); // phone

      const columns: ColumnDef<Row>[] = [
        { key: 'email', header: 'Email', accessorKey: 'email', responsive: { phone: 'summary' } },
        { key: 'name', header: 'Name', accessorKey: 'name', responsive: { phone: 'primary' } },
        { key: 'role', header: 'Role', accessorKey: 'role', responsive: { phone: 'hidden' } },
      ];

      renderTable(columns);

      // Name should appear as card title (primary) even though it is the second column
      expect(await screen.findByText('Alice', undefined, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();

      // Email should appear as a summary field
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();

      // Role should be hidden
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      expect(screen.queryByText('User')).not.toBeInTheDocument();
    });
  });

  describe('default behavior when no responsive prop is set', () => {
    it('shows all columns using legacy positional heuristic', async () => {
      mockMatchMedia(390); // phone

      const columns: ColumnDef<Row>[] = [
        { key: 'name', header: 'Name', accessorKey: 'name' },
        { key: 'email', header: 'Email', accessorKey: 'email' },
        { key: 'role', header: 'Role', accessorKey: 'role' },
      ];

      renderTable(columns);

      // Legacy behavior: first column is title, rest are summary
      expect(await screen.findByText('Alice', undefined, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('custom mobile card behavior context', () => {
    it('preserves selection, open, and row actions for app-authored cards', async () => {
      mockMatchMedia(390);

      const onSelectionChange = vi.fn();
      const onRowClick = vi.fn();

      const { container } = render(
        <DesignSystemProvider
          tenantConfig={TEST_TENANT_CONFIG}
          forceEngine="classic"
          skipCssLoading
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PatternDataTable<Row>
              engine="classic"
              data={rows}
              rowKey="id"
              columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]}
              selectable
              selectedKeys={['1']}
              density="compact"
              className="product-mobile-table"
              style={{ backgroundColor: 'rgb(1, 2, 3)' }}
              onSelectionChange={onSelectionChange}
              onRowClick={onRowClick}
              actions={(row) => <span>{`Actions for ${row.name}`}</span>}
              mobileCard={(row, _index, context) => (
                <div>
                  <span>{`${row.name}: ${context.selected ? 'selected' : 'not selected'}`}</span>
                  <button type="button" onClick={context.toggleSelection}>
                    {`Toggle ${row.name}`}
                  </button>
                  <button type="button" onClick={context.open}>
                    {`Open ${row.name}`}
                  </button>
                  {context.actions}
                </div>
              )}
            />
          </Suspense>
        </DesignSystemProvider>,
      );

      expect(await screen.findByText('Alice: selected')).toBeInTheDocument();
      expect(screen.getByText('Bob: not selected')).toBeInTheDocument();
      expect(screen.getByText('Actions for Alice')).toBeInTheDocument();
      const mobileRoot = container.querySelector<HTMLElement>('[data-part="mobile-root"]');
      expect(mobileRoot).toHaveClass('product-mobile-table');
      expect(mobileRoot).toHaveAttribute('data-density', 'compact');
      expect(mobileRoot?.style.width).toBe('100%');
      expect(mobileRoot?.style.backgroundColor).toBe('rgb(1, 2, 3)');
      expect(mobileRoot?.style.getPropertyValue('--ds-density-scale')).not.toBe('');

      fireEvent.click(screen.getByRole('button', { name: 'Toggle Bob' }));
      expect(onSelectionChange).toHaveBeenCalledWith(['1', '2'], rows);

      fireEvent.click(screen.getByRole('button', { name: 'Open Bob' }));
      expect(onRowClick).toHaveBeenCalledWith(rows[1], 1);
    });
  });

  describe('tablet breakpoint filtering', () => {
    it('hides columns marked hidden for tablet', async () => {
      mockMatchMedia(800); // tablet (640-1023)

      const columns: ColumnDef<Row>[] = [
        { key: 'name', header: 'Name', accessorKey: 'name', responsive: { tablet: 'visible', phone: 'primary' } },
        { key: 'email', header: 'Email', accessorKey: 'email', responsive: { tablet: 'visible', phone: 'summary' } },
        { key: 'salary', header: 'Salary', accessorKey: 'salary', responsive: { tablet: 'hidden', phone: 'hidden' } },
      ];

      renderTable(columns);

      // Name and Email should be visible at tablet size
      expect(await screen.findByText('Alice', undefined, { timeout: 30000 })).toBeInTheDocument();
      expect(await screen.findByText('alice@test.com', undefined, { timeout: 30000 })).toBeInTheDocument();

      // Salary should be hidden at tablet
      expect(screen.queryByText('90000')).not.toBeInTheDocument();
    }, 45000);
  });
});
