import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernTable from '../engines/modern';
import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { ColumnType } from '../contracts';

// ---------------------------------------------------------------------------
// K3-A Pass 1 — modern Table paint-ownership ratchet.
//
// The engine's static geometry (cell padding per size, alignment, sticky/fixed
// positioning, sort/resize affordances, loading overlay, pagination chrome)
// moved out of inline styles into `modern/skin/table.css`, keyed on data-part /
// data-size / data-align hooks. Inline is reserved for dynamic values (measured
// widths, computed sticky offsets, virtual spacers, scroll bounds) and the
// public style-override channels. These tests pin both halves of that contract:
// the DOM carries the hooks (and no static geometry inline), and the skin
// carries the rules. They also pin the keyboard-sort contract: a sortable
// header takes a tab stop and activates on Enter/Space.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/table.css'
  ),
  'utf8'
);

interface Row {
  key: string;
  name: string;
  age: number;
}

const COLUMNS: ColumnType<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { key: 'age', title: 'Age', dataIndex: 'age', align: 'right' },
];

const DATA: Row[] = [
  { key: '1', name: 'Bea', age: 34 },
  { key: '2', name: 'Ada', age: 41 },
];

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'test-tenant',
  name: 'Test Tenant',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Test Tenant',
    primaryColor: '#2563eb',
    secondaryColor: '#0f766e',
    accentColor: '#7c3aed',
    darkPrimaryColor: '#93c5fd',
    darkSecondaryColor: '#5eead4',
    darkAccentColor: '#c4b5fd',
  },
};

function renderModern(ui: React.ReactElement) {
  return render(
    <DesignSystemProvider tenantConfig={TEST_TENANT_CONFIG} forceEngine="modern" skipCssLoading>
      {ui}
    </DesignSystemProvider>
  );
}

describe('Table modern — geometry lives in the skin, hooks in the DOM', () => {
  it('stamps the data-size / data-align / data-part hooks the skin keys on', () => {
    const { container } = renderModern(
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} size="small" />
    );

    const table = container.querySelector('[data-part="table"]');
    expect(table).toHaveAttribute('data-size', 'sm');
    expect(container.querySelector('[data-part="header-content"]')).not.toBeNull();
    expect(container.querySelector('[data-part="header-title"]')).toHaveTextContent('Name');
    expect(container.querySelector('td[data-align="right"]')).not.toBeNull();
    expect(container.querySelector('[data-part="scroll-container"]')).not.toBeNull();
  });

  it('paints no static geometry inline on table, header cells, or body cells', () => {
    const { container } = renderModern(
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} />
    );

    const table = container.querySelector('[data-part="table"]') as HTMLTableElement;
    // font-size and border-collapse moved to the skin; the table keeps only
    // its width projection (and tableLayout when the prop asks for it).
    expect(table.style.fontSize).toBe('');
    expect(table.style.borderCollapse).toBe('');

    const headerCell = container.querySelector('[data-part="header-cell"]') as HTMLElement;
    expect(headerCell.style.padding).toBe('');
    expect(headerCell.style.textAlign).toBe('');
    expect(headerCell.style.cursor).toBe('');

    const cell = screen.getByText('Bea').closest('td') as HTMLElement;
    expect(cell.style.padding).toBe('');
    expect(cell.style.textAlign).toBe('');
  });

  it('keyboard-activates sorting from the header cell (Enter and Space)', () => {
    renderModern(<ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} />);

    const nameHeader = screen.getByText('Name').closest('th') as HTMLElement;
    expect(nameHeader).toHaveAttribute('data-sortable', 'true');
    expect(nameHeader).toHaveAttribute('tabindex', '0');
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.keyDown(nameHeader, { key: ' ' });
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('pins the skin rules that replaced the retired inline geometry', () => {
    // size-keyed padding and font-size
    expect(SKIN).toMatch(/\[data-part='table'\]\[data-size='sm'\][^{]*\{[^}]*padding:\s*4px 8px/);
    expect(SKIN).toMatch(
      /\[data-part='table'\]\[data-size='lg'\]\s*\{[^}]*font-size:\s*var\(--ds-font-size-base,\s*16px\)/,
    );
    // alignment hook
    expect(SKIN).toMatch(/\[data-align='right'\]\s*\{[^}]*text-align:\s*right/);
    // sticky header + fixed columns positioned by the skin
    expect(SKIN).toMatch(/\[data-part='header-cell'\]\[data-sticky='true'\][^{]*\{[^}]*position:\s*sticky/);
    expect(SKIN).toMatch(/\[data-part='cell'\]\[data-fixed\][^{]*\{[^}]*position:\s*sticky/);
    // sort affordance + keyboard ring
    expect(SKIN).toMatch(/\[data-sortable='true'\][^{]*:focus-visible[^}]*\{[^}]*outline/);
    // scroll container + loading posture
    expect(SKIN).toMatch(/\[data-part='scroll-container'\]\[data-loading='true'\][^{]*\{[^}]*opacity/);
    // pagination chrome geometry
    expect(SKIN).toMatch(/\[data-part='pagination-button'\][^{]*\{[^}]*height:\s*32px/);
  });

  it('stamps expand/selection cell parts for the skin', () => {
    const { container } = renderModern(
      <ModernTable
        columns={COLUMNS}
        dataSource={DATA}
        pagination={false}
        rowSelection={{ type: 'checkbox' }}
        expandable={{ expandedRowRender: (record) => <span>{record.name} detail</span> }}
      />
    );

    expect(container.querySelectorAll('[data-part="selection-cell"]').length).toBe(DATA.length);
    expect(container.querySelectorAll('[data-part="expand-cell"]').length).toBe(DATA.length);
    expect(
      container.querySelector('[data-part="header-cell"][data-cell-kind="selection"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-part="header-cell"][data-cell-kind="expand"]')
    ).not.toBeNull();
  });
});
