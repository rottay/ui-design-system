import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

import type { ColumnDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import ModernDataTable from '../engines/modern';

/**
 * W7 remediation suite — DataTable modern engine:
 *  - D3: pinned columns always resolve concrete widths (no gap/overlap drift)
 *  - dead shared props now emit: onRowDoubleClick / onPinChange /
 *    onVisibleColumnsChange
 *  - resize/reorder keyboard parity, LTR + RTL (physical vs logical arrows)
 */

const here = dirname(fileURLToPath(import.meta.url));
const modernSkin = readFileSync(
  join(
    here,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/data-table.css'
  ),
  'utf8'
);

type Row = { id: string; name: string; venue: string; attendance: number };

const ROWS: Row[] = [
  { id: 'evt-1', name: 'Spring Summit', venue: 'Brooklyn Hall', attendance: 1240 },
  { id: 'evt-2', name: 'Night Market', venue: 'Pier 3', attendance: 860 },
];

const BASE_COLUMNS: ColumnDef<Row>[] = [
  { key: 'name', header: 'Event', accessorKey: 'name' },
  { key: 'venue', header: 'Venue', accessorKey: 'venue' },
  { key: 'attendance', header: 'Attendance', accessorKey: 'attendance' },
];

function headerCell(key: string): HTMLElement {
  const cell = document.querySelector(`th[data-col-key="${key}"]`);
  if (!cell) throw new Error(`missing header cell for column ${key}`);
  return cell as HTMLElement;
}

function bodyCell(rowText: string, colKey: string): HTMLElement {
  const row = screen.getByText(rowText).closest('tr');
  if (!row) throw new Error(`missing row for ${rowText}`);
  // data cells do not carry data-col-key; resolve by column position instead.
  const cells = row.querySelectorAll('td[data-part="data-cell"]');
  const index = BASE_COLUMNS.findIndex((c) => c.key === colKey);
  const target = cells[index];
  if (!target) throw new Error(`missing body cell ${colKey} in row ${rowText}`);
  return target as HTMLElement;
}

describe('W7/D3 — pinned columns resolve concrete widths (no gap/overlap)', () => {
  it('stamps the documented 150px default on width-less pinned columns and keeps offsets consistent', () => {
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        pinnedColumns={{ left: ['name', 'venue'], right: [] }}
      />
    );

    const table = document.querySelector('[data-part="table"]');
    expect(table?.getAttribute('data-has-pinned')).toBe('true');

    const first = headerCell('name');
    const second = headerCell('venue');
    expect(first.style.width).toBe('150px');
    expect(second.style.width).toBe('150px');
    // First pinned column sticks at 0; the second at exactly the first's
    // resolved width — the same 150px stamped on the cell, so no drift.
    expect(first.style.insetInlineStart).toBe('0');
    expect(second.style.insetInlineStart).toBe('calc(150px)');

    // Body cells carry the same concrete width as their header.
    const firstBody = bodyCell('Spring Summit', 'name');
    expect(firstBody.style.width).toBe('150px');
    expect(firstBody.style.insetInlineStart).toBe('0');
  });

  it('sums declared widths for later pinned columns', () => {
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={[
          { key: 'name', header: 'Event', accessorKey: 'name', width: 200 },
          { key: 'venue', header: 'Venue', accessorKey: 'venue', width: 120 },
          { key: 'attendance', header: 'Attendance', accessorKey: 'attendance' },
        ]}
        pinnedColumns={{ left: ['name', 'venue'], right: [] }}
      />
    );

    expect(headerCell('venue').style.insetInlineStart).toBe('calc(200px)');
  });

  it('measures right pins against the fixed-width actions column', () => {
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        pinnedColumns={{ left: [], right: ['attendance'] }}
        actions={() => <button type="button">open</button>}
      />
    );

    expect(headerCell('attendance').style.insetInlineEnd).toBe('calc(120px)');
    expect(headerCell('attendance').style.width).toBe('150px');
  });

  it('sticks a right-pinned column at 0 when there is no actions column', () => {
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        pinnedColumns={{ left: [], right: ['attendance'] }}
      />
    );

    expect(headerCell('attendance').style.insetInlineEnd).toBe('0');
  });

  it('leaves width-less non-pinned columns on content sizing and unpinned tables on auto layout', () => {
    render(
      <ModernDataTable<Row> data={ROWS} rowKey="id" columns={BASE_COLUMNS} />
    );

    const table = document.querySelector('[data-part="table"]');
    expect(table?.getAttribute('data-has-pinned')).toBe('false');
    expect(headerCell('name').style.width).toBe('');
  });

  it('backs the data-has-pinned hook with a fixed-layout skin rule', () => {
    expect(modernSkin).toContain('[data-part="table"][data-has-pinned="true"]');
    expect(modernSkin).toMatch(
      /\[data-part="table"\]\[data-has-pinned="true"\]\s*\{[^}]*table-layout:\s*fixed/
    );
  });
});

describe('W7 — dead shared props now emit from the modern engine', () => {
  it('emits onRowDoubleClick with the row and index', () => {
    const onRowDoubleClick = vi.fn();
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        onRowDoubleClick={onRowDoubleClick}
      />
    );

    fireEvent.doubleClick(screen.getByText('Night Market'));
    expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
    expect(onRowDoubleClick).toHaveBeenCalledWith(ROWS[1], 1);
  });

  it('does not emit onRowDoubleClick when a double-click enters cell edit mode', () => {
    const onRowDoubleClick = vi.fn();
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={[
          { key: 'name', header: 'Event', accessorKey: 'name', editable: true },
          { key: 'venue', header: 'Venue', accessorKey: 'venue' },
        ]}
        onRowDoubleClick={onRowDoubleClick}
        onCellEdit={vi.fn()}
      />
    );

    const editableCell = screen.getByText('Spring Summit').closest('td');
    expect(editableCell?.getAttribute('data-editable')).toBe('true');
    fireEvent.doubleClick(editableCell as HTMLElement);
    expect(onRowDoubleClick).not.toHaveBeenCalled();
    expect(editableCell?.getAttribute('data-editing')).toBe('true');
  });

  it('emits onPinChange cycling none → left → right → none from the header toggle', async () => {
    const onPinChange = vi.fn();
    const { rerender } = render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        pinnedColumns={{ left: [], right: [] }}
        onPinChange={onPinChange}
      />
    );

    // The pin toggle lives inside the lazily-dispatched Tooltip engine, so
    // it mounts asynchronously.
    const toggle = () =>
      within(headerCell('venue')).findByRole('button', {
        name: /pin column venue/i,
      });

    fireEvent.click(await toggle());
    expect(onPinChange).toHaveBeenLastCalledWith({
      left: ['venue'],
      right: [],
    });

    rerender(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        pinnedColumns={{ left: ['venue'], right: [] }}
        onPinChange={onPinChange}
      />
    );
    fireEvent.click(await toggle());
    expect(onPinChange).toHaveBeenLastCalledWith({
      left: [],
      right: ['venue'],
    });

    rerender(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        pinnedColumns={{ left: [], right: ['venue'] }}
        onPinChange={onPinChange}
      />
    );
    fireEvent.click(await toggle());
    expect(onPinChange).toHaveBeenLastCalledWith({ left: [], right: [] });
    expect(onPinChange).toHaveBeenCalledTimes(3);
  });

  it('derives the pin baseline from ColumnDef.pin when pinnedColumns is uncontrolled', async () => {
    const onPinChange = vi.fn();
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={[
          { key: 'name', header: 'Event', accessorKey: 'name', pin: 'left' },
          { key: 'venue', header: 'Venue', accessorKey: 'venue' },
          { key: 'attendance', header: 'Attendance', accessorKey: 'attendance' },
        ]}
        onPinChange={onPinChange}
      />
    );

    const toggle = await within(headerCell('name')).findByRole('button', {
      name: /pin column event/i,
    });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(toggle);
    expect(onPinChange).toHaveBeenCalledWith({
      left: [],
      right: ['name'],
    });
  });

  it('keeps the pin toggle from triggering header sort', async () => {
    const onSortChange = vi.fn();
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={[
          { key: 'name', header: 'Event', accessorKey: 'name', sortable: true },
          { key: 'venue', header: 'Venue', accessorKey: 'venue' },
        ]}
        sorting={null}
        onSortChange={onSortChange}
        onPinChange={vi.fn()}
      />
    );

    const toggle = await within(headerCell('name')).findByRole('button', {
      name: /pin column event/i,
    });
    fireEvent.click(toggle);
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('emits onVisibleColumnsChange from the hide affordance, except on locked columns', async () => {
    const onVisibleColumnsChange = vi.fn();
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        columnVisibility
        visibleColumns={['name', 'venue', 'attendance']}
        lockedColumns={['name']}
        onVisibleColumnsChange={onVisibleColumnsChange}
      />
    );

    const hideVenue = await within(headerCell('venue')).findByRole('button', {
      name: /hide column venue/i,
    });
    // Locked columns never render the affordance (the toggle is async, so
    // give the venue query time to resolve before asserting absence).
    expect(
      headerCell('name').querySelector('[data-part="hide-column-button"]')
    ).toBeNull();

    fireEvent.click(hideVenue);
    expect(onVisibleColumnsChange).toHaveBeenCalledWith(['name', 'attendance']);
  });

  it('uses every visible column as the hide baseline when visibleColumns is omitted', async () => {
    const onVisibleColumnsChange = vi.fn();
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        columnVisibility
        onVisibleColumnsChange={onVisibleColumnsChange}
      />
    );

    const hide = await within(headerCell('attendance')).findByRole('button', {
      name: /hide column attendance/i,
    });
    fireEvent.click(hide);
    expect(onVisibleColumnsChange).toHaveBeenCalledWith(['name', 'venue']);
  });
});

describe('W7 — resize keyboard parity (LTR + RTL)', () => {
  async function renderResizable(direction?: 'rtl') {
    const onColumnResize = vi.fn();
    const table = (
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={[
          { key: 'name', header: 'Event', accessorKey: 'name', width: 200 },
          { key: 'venue', header: 'Venue', accessorKey: 'venue' },
        ]}
        resizable
        onColumnResize={onColumnResize}
      />
    );
    render(
      direction === 'rtl' ? <div dir="rtl">{table}</div> : table
    );
    // The resize handle lives inside the lazily-dispatched Tooltip engine.
    const handles = await screen.findAllByRole('separator');
    return { onColumnResize, handle: handles[0] };
  }

  it('grows/shrinks with physical arrows in LTR and reports aria-valuenow', async () => {
    const { onColumnResize, handle } = await renderResizable();
    expect(handle.getAttribute('aria-valuenow')).toBe('200');

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 210);
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 190);
  });

  it('mirrors the arrow mapping in RTL (physical vs logical)', async () => {
    const { onColumnResize, handle } = await renderResizable('rtl');

    // In RTL the handle sits on the physical left edge: ArrowLeft grows.
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 190);
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 210);
  });

  it('clamps keyboard resize at the column minWidth', async () => {
    const onColumnResize = vi.fn();
    render(
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={[
          {
            key: 'name',
            header: 'Event',
            accessorKey: 'name',
            width: 200,
            minWidth: 195,
          },
        ]}
        resizable
        onColumnResize={onColumnResize}
      />
    );

    const handle = await screen.findByRole('separator');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onColumnResize).toHaveBeenCalledWith('name', 195);
  });
});

describe('W7 — reorder keyboard parity (LTR + RTL)', () => {
  async function renderReorderable(direction?: 'rtl') {
    const onColumnReorder = vi.fn();
    const table = (
      <ModernDataTable<Row>
        data={ROWS}
        rowKey="id"
        columns={BASE_COLUMNS}
        reorderable
        onColumnReorder={onColumnReorder}
      />
    );
    render(direction === 'rtl' ? <div dir="rtl">{table}</div> : table);
    // The drag grip lives inside the lazily-dispatched Tooltip engine.
    const grips = await screen.findAllByRole('button', {
      name: /drag to reorder column/i,
    });
    return { onColumnReorder, grips };
  }

  it('moves columns with arrows and Home/End in LTR', async () => {
    const { onColumnReorder, grips } = await renderReorderable();

    fireEvent.keyDown(grips[0], { key: 'ArrowRight' });
    expect(onColumnReorder).toHaveBeenLastCalledWith([
      'venue',
      'name',
      'attendance',
    ]);

    fireEvent.keyDown(grips[0], { key: 'End' });
    expect(onColumnReorder).toHaveBeenLastCalledWith([
      'venue',
      'attendance',
      'name',
    ]);
  });

  it('mirrors the arrow mapping in RTL while Home/End stay logical', async () => {
    const { onColumnReorder, grips } = await renderReorderable('rtl');

    // ArrowLeft is logical-forward in RTL: same result as LTR ArrowRight.
    fireEvent.keyDown(grips[0], { key: 'ArrowLeft' });
    expect(onColumnReorder).toHaveBeenLastCalledWith([
      'venue',
      'name',
      'attendance',
    ]);

    // ArrowRight is logical-backward in RTL.
    fireEvent.keyDown(grips[1], { key: 'ArrowRight' });
    expect(onColumnReorder).toHaveBeenLastCalledWith([
      'venue',
      'name',
      'attendance',
    ]);

    // End still means the logical last position.
    fireEvent.keyDown(grips[0], { key: 'End' });
    expect(onColumnReorder).toHaveBeenLastCalledWith([
      'venue',
      'attendance',
      'name',
    ]);
  });
});
