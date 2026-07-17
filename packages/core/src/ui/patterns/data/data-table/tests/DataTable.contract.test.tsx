import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';

import { PatternDataTable } from '..';
import type { ColumnDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 6 (data-table) -- data-part contract.
//
// The pre-step stamps `data-part`/`data-selected`/`data-striped`/`data-pinned`/
// `data-drag-over`/`data-current`/`data-variant`/`data-collapsed`/`data-invalid`
// attributes and a handful of className hooks across all five data-table
// files. This suite proves the stamps reach the DOM with the right shape so the
// canonical engine and interaction skins can key CSS on them.
// ---------------------------------------------------------------------------

interface Row {
  id: string;
  name: string;
  amount: number;
  status: string;
}

const ROWS: Row[] = [
  { id: 'r1', name: 'Alpha', amount: 100, status: 'active' },
  { id: 'r2', name: 'Bravo', amount: 200, status: 'inactive' },
  { id: 'r3', name: 'Charlie', amount: 300, status: 'active' },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
    pin: 'left',
  },
  { key: 'amount', header: 'Amount', accessorKey: 'amount' },
  { key: 'status', header: 'Status', accessorKey: 'status' },
];

async function waitForRoot(container: HTMLElement): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector('[data-part="root"]')).not.toBeNull();
  });
  return container.querySelector('[data-part="root"]') as Element;
}

describe('DataTable data-part contract (desktop)', () => {
  afterEach(() => {
    cleanup();
  });

  it.each(['modern', 'rustic'] as const)(
    'stamps the root pair, header cells, body-row, and pagination under the %s engine',
    async (engine) => {
      const onExecute = vi.fn();
      const { container } = renderWithEngine(
        <PatternDataTable<Row>
          engine={engine}
          data={ROWS}
          rowKey="id"
          columns={COLUMNS}
          striped
          selectedKeys={['r1']}
          bulkActions={[
            { key: 'del', label: 'Delete', variant: 'danger', onExecute },
            { key: 'export', label: 'Export', variant: 'primary', onExecute },
            { key: 'flag', label: 'Flag', onExecute },
          ]}
          pagination={{ current: 2, pageSize: 1, total: 3, onChange: vi.fn() }}
        />,
        engine
      );

      const root = await waitForRoot(container);
      expect(root.className).toContain('ds-pattern-data-table');
      expect(root.className).toContain(`ds-engine-${engine}`);
      // ARC-08 density asymmetry: modern carries a third root class segment,
      // rustic reads density from its own DENSITY_STYLES lookup and never
      // stamps a density class -- this must not be "fixed" by the pre-step.
      if (engine === 'modern') {
        expect(root.className).toContain('ds-table-density-comfortable');
      } else {
        expect(root.className).not.toContain('ds-table-density-');
      }

      // 3 header cells, one per column (no selection/expand/actions column here).
      const headerCells = container.querySelectorAll('[data-part="header-cell"]');
      expect(headerCells).toHaveLength(3);

      // The 'name' column is pinned left; the other two are not.
      const pinnedFlags = Array.from(headerCells).map((el) => el.getAttribute('data-pinned'));
      expect(pinnedFlags).toEqual(['true', 'false', 'false']);

      // 3 body rows: r1 selected, r2 struck by striping (odd index), r3 neither.
      const bodyRows = container.querySelectorAll('[data-part="body-row"]');
      expect(bodyRows).toHaveLength(3);
      if (engine === 'modern') {
        expect(Array.from(bodyRows).map((el) => el.getAttribute('data-selected'))).toEqual(['true', 'false', 'false']);
        expect(Array.from(bodyRows).map((el) => el.getAttribute('data-striped'))).toEqual(['false', 'true', 'false']);
      } else {
        // Rustic consolidates the same 3-way into one data-state enum per
        // Fable decision 3 (row data-state + td data-pinned, ONE rule instead
        // of the 3x-duplicated pinned-td ternary).
        expect(Array.from(bodyRows).map((el) => el.getAttribute('data-state'))).toEqual([
          'selected',
          'striped',
          'default',
        ]);
      }

      // 9 data cells (3 rows x 3 columns); the 'name' column's cells are pinned.
      const dataCells = container.querySelectorAll('[data-part="data-cell"]');
      expect(dataCells).toHaveLength(9);
      const pinnedDataCells = Array.from(dataCells).filter((el) => el.getAttribute('data-pinned') === 'true');
      expect(pinnedDataCells).toHaveLength(3);

      // Pagination: ceil(3/1) = 3 page buttons, current=2 is the middle one.
      const pageButtons = container.querySelectorAll(
        '[data-part="pagination-page-button"], [data-part="pagination-button"]'
      );
      if (engine === 'modern') {
        expect(container.querySelectorAll('[data-part="pagination-page-button"]')).toHaveLength(3);
        expect(
          Array.from(container.querySelectorAll('[data-part="pagination-page-button"]')).map((el) =>
            el.getAttribute('data-current')
          )
        ).toEqual(['false', 'true', 'false']);
      } else {
        // Rustic only ever renders Previous/Next -- no per-page-number buttons,
        // so no data-current analog exists.
        expect(pageButtons).toHaveLength(2);
      }

      // Bulk bar: variant follows the bulkActions array order verbatim.
      const bulkButtons = container.querySelectorAll('[data-part="bulk-bar-action"]');
      expect(bulkButtons).toHaveLength(3);
      expect(Array.from(bulkButtons).map((el) => el.getAttribute('data-variant'))).toEqual([
        'danger',
        'primary',
        'default',
      ]);
    }
  );

  it('stamps group-header-row/-chevron/-count-pill and toggles data-collapsed on click (modern only -- rustic has no groupBy support)', async () => {
    const { container } = renderWithEngine(
      <PatternDataTable<Row> engine="modern" data={ROWS} rowKey="id" columns={COLUMNS} groupBy="status" />,
      'modern'
    );

    await waitForRoot(container);

    const groupRows = container.querySelectorAll('[data-part="group-header-row"]');
    expect(groupRows).toHaveLength(2); // active, inactive

    const chevronsBefore = container.querySelectorAll('[data-part="group-header-chevron"]');
    expect(Array.from(chevronsBefore).map((el) => el.getAttribute('data-collapsed'))).toEqual(['false', 'false']);

    const countPills = container.querySelectorAll('[data-part="group-header-count-pill"]');
    expect(Array.from(countPills).map((el) => el.textContent)).toEqual(['2', '1']); // active: r1,r3; inactive: r2

    fireEvent.click(groupRows[0]);

    await waitFor(() => {
      const chevronsAfter = container.querySelectorAll('[data-part="group-header-chevron"]');
      expect(chevronsAfter[0].getAttribute('data-collapsed')).toBe('true');
    });
    const chevronsAfter = container.querySelectorAll('[data-part="group-header-chevron"]');
    expect(chevronsAfter[1].getAttribute('data-collapsed')).toBe('false');
  });

  it("stamps the inline cell editor's data-invalid from its local validation error (modern only -- rustic has no inline-edit parity)", async () => {
    const editableColumns: ColumnDef<Row>[] = [
      {
        key: 'name',
        header: 'Name',
        accessorKey: 'name',
        editable: {
          type: 'text',
          validate: (value) => (typeof value === 'string' && value.trim() === '' ? 'Required' : null),
        },
      },
      ...COLUMNS.slice(1),
    ];

    const { container } = renderWithEngine(
      <PatternDataTable<Row> engine="modern" data={ROWS} rowKey="id" columns={editableColumns} />,
      'modern'
    );

    await waitForRoot(container);

    const editableCell = container.querySelector('td[data-editable="true"]') as HTMLElement;
    expect(editableCell).not.toBeNull();
    fireEvent.doubleClick(editableCell);

    const input = await waitFor(() => {
      const el = container.querySelector('[data-part="editor-input"]');
      expect(el).not.toBeNull();
      return el as HTMLInputElement;
    });
    expect(input.getAttribute('data-invalid')).toBe('false');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input.getAttribute('data-invalid')).toBe('true');
    });
    const errorSpan = container.querySelector('[data-part="editor-error"]');
    expect(errorSpan?.textContent).toBe('Required');
  });
});

describe('DataTable data-part contract (mobile branch)', () => {
  afterEach(() => {
    cleanup();
  });

  it('stamps the mobile scope pair on the loading and empty state panels', async () => {
    mockMatchMedia(390); // forces isMobile via useMediaQuery, per PatternDataTable.responsive.test.tsx

    const { container, rerender } = renderWithEngine(
      <PatternDataTable<Row> engine="modern" data={[]} rowKey="id" columns={COLUMNS} loading />,
      'modern'
    );

    const loadingPanel = await waitFor(() => {
      const el = container.querySelector('[data-part="mobile-state-panel"]');
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    expect(loadingPanel.className).toContain('ds-pattern-data-table');
    expect(loadingPanel.className).toContain('ds-data-table--mobile');
    expect(loadingPanel.textContent).toContain('Loading');

    rerender(<PatternDataTable<Row> engine="modern" data={[]} rowKey="id" columns={COLUMNS} loading={false} />);

    await waitFor(() => {
      const el = container.querySelector('[data-part="mobile-state-panel"]');
      expect(el?.textContent).toContain('No data');
    });
    const emptyPanel = container.querySelector('[data-part="mobile-state-panel"]') as HTMLElement;
    expect(emptyPanel.className).toContain('ds-pattern-data-table');
    expect(emptyPanel.className).toContain('ds-data-table--mobile');
  });

  it('stamps the mobile card tree (Stack scope pair, Card className modifier, title/summary parts) and the bulk-actions scope pair', async () => {
    mockMatchMedia(390);

    const onExecute = vi.fn();
    const { container } = renderWithEngine(
      <PatternDataTable<Row>
        engine="modern"
        data={ROWS}
        rowKey="id"
        columns={COLUMNS}
        selectable
        selectedKeys={['r1']}
        bulkActions={[{ key: 'del', label: 'Delete', variant: 'danger', onExecute }]}
      />,
      'modern'
    );

    // At least two distinct elements carry the mobile scope pair: the
    // MobileCards Stack root and the MobileBulkActions Flex root.
    const scoped = await waitFor(() => {
      const els = container.querySelectorAll('.ds-pattern-data-table.ds-data-table--mobile');
      expect(els.length).toBeGreaterThanOrEqual(2);
      return els;
    });
    const bulkRoot = await waitFor(() => {
      const element = container.querySelector('[data-part="mobile-bulk-actions"]');
      expect(element).not.toBeNull();
      return element;
    });
    expect(bulkRoot?.className).toContain('ds-pattern-data-table');
    expect(bulkRoot?.className).toContain('ds-data-table--mobile');
    expect(Array.from(scoped)).toContain(bulkRoot);

    // Card is engine-lazy independently of Stack/Flex. Wait for that Suspense
    // boundary instead of treating the two already-resolved scope roots as a
    // proxy for card readiness.
    await waitFor(() => {
      // 3 cards, one per row; the selected row's card carries the modifier class.
      expect(container.querySelectorAll('.ds-data-table__mobile-card')).toHaveLength(3);
      expect(container.querySelectorAll('.ds-data-table__mobile-card--selected')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="mobile-card-title"]')).toHaveLength(3);
      // 2 summary columns per card (amount, status) x 3 cards.
      expect(container.querySelectorAll('[data-part="mobile-card-summary-label"]')).toHaveLength(6);
      expect(container.querySelectorAll('[data-part="mobile-card-summary-value"]')).toHaveLength(6);
    });
  });
});
