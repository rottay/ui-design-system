/**
 * `aria-rowcount` / `aria-colcount` declare a grid whose rendered rows are a
 * window on the data. These probes pin the coordinates that let a reader place
 * a row inside that declaration: the index is the row's position in the FULL
 * dataset, not in the rendered page, and the column index follows the rendered
 * column order (selection, expansion, data columns, actions).
 */
import React from 'react';
import { renderWithEngineContext } from '@tests/support/engine';
import { describe, expect, it } from 'vitest';

import type { ColumnDef } from '@/foundation/contracts/runtime/components/patterns/core';
import ModernDataTable from '../engines/modern';

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'classic');

interface Row {
  id: number;
  name: string;
  owner: string;
}

const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name' },
  { key: 'owner', header: 'Owner', accessorKey: 'owner' },
];

const rows: Row[] = [
  { id: 1, name: 'Ada', owner: 'Ada' },
  { id: 2, name: 'Bo', owner: 'Bo' },
  { id: 3, name: 'Cy', owner: 'Cy' },
];

function bodyRowIndices(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('[data-part="body-row"]')).map((row) =>
    row.getAttribute('aria-rowindex'),
  );
}

describe('PatternDataTable modern — ARIA grid coordinates', () => {
  it('numbers the header row 1 and the body rows from 2', () => {
    const { container } = render(
      <ModernDataTable<Row> columns={columns} data={rows} rowKey="id" />,
    );

    expect(container.querySelector('[data-part="header-row"]')).toHaveAttribute(
      'aria-rowindex',
      '1',
    );
    expect(bodyRowIndices(container)).toEqual(['2', '3', '4']);
    // Every index falls inside the count the wrapper declares.
    expect(container.querySelector('table[role="grid"]')).toHaveAttribute(
      'aria-rowcount',
      '4',
    );
  });

  it('places a paginated page inside the whole dataset, not inside the page', () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={rows}
        rowKey="id"
        // Page 5 of 10-row pages: the first rendered row is dataset row 41,
        // which is grid row 42 once the header row is counted.
        pagination={{ current: 5, pageSize: 10, total: 200, onChange: () => {} }}
      />,
    );

    expect(bodyRowIndices(container)).toEqual(['42', '43', '44']);
    expect(container.querySelector('table[role="grid"]')).toHaveAttribute(
      'aria-rowcount',
      '201',
    );
  });

  it('numbers the columns in rendered order, control columns included', () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={rows}
        rowKey="id"
        selectable
        selectedKeys={[]}
        onSelectionChange={() => {}}
        expandedRow={(row) => <span>{row.name}</span>}
        actions={(row) => <span>Open {row.name}</span>}
      />,
    );

    const table = container.querySelector('table[role="grid"]');
    // selection + expansion + 2 data columns + actions
    expect(table).toHaveAttribute('aria-colcount', '5');

    const headerIndices = Array.from(
      container.querySelectorAll('[data-part="header-cell"]'),
    ).map((cell) => cell.getAttribute('aria-colindex'));
    expect(headerIndices).toEqual(['1', '2', '3', '4', '5']);

    const firstRow = container.querySelector('[data-part="body-row"]') as HTMLElement;
    expect(firstRow.querySelector('[data-part="selection-cell"]')).toHaveAttribute(
      'aria-colindex',
      '1',
    );
    expect(firstRow.querySelector('[data-part="expand-cell"]')).toHaveAttribute(
      'aria-colindex',
      '2',
    );
    expect(
      Array.from(firstRow.querySelectorAll('[data-part="data-cell"]')).map((cell) =>
        cell.getAttribute('aria-colindex'),
      ),
    ).toEqual(['3', '4']);
    expect(firstRow.querySelector('[data-part="actions-cell"]')).toHaveAttribute(
      'aria-colindex',
      '5',
    );
  });

  it('numbers the data columns from 1 when the table carries no control column', () => {
    const { container } = render(
      <ModernDataTable<Row> columns={columns} data={rows} rowKey="id" />,
    );

    const firstRow = container.querySelector('[data-part="body-row"]') as HTMLElement;
    expect(
      Array.from(firstRow.querySelectorAll('[data-part="data-cell"]')).map((cell) =>
        cell.getAttribute('aria-colindex'),
      ),
    ).toEqual(['1', '2']);
  });
});
