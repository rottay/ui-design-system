/**
 * The engine's file-local `chainHandler` mirrors the shared `composeHandlers`:
 * both handlers on one prop run, and `defaultPrevented` stops the chain. The
 * kernel is the FIRST of the pair here, so a caller press that prevents the
 * default -- which is what starts a column resize and a column reorder -- can
 * never drop the kernel's own state, and the part cannot paint a keyboard focus
 * ring on a mouse drag.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';
import { describe, expect, it, vi } from 'vitest';

import type { ColumnDef } from '@/foundation/contracts/runtime/components/patterns/core';
import ModernDataTable from '../engines/modern';

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'classic');

interface Row {
  id: number;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name', sortable: true },
];
const rows: Row[] = [{ id: 1, name: 'Ada' }];

describe('the composed handler bag keeps every kernel handler on a data-table part', () => {
  it('routes hover, press and focus on a body row', () => {
    const { container } = render(
      <ModernDataTable<Row> columns={columns} data={rows} rowKey="id" />,
    );
    const row = container.querySelector('[data-part="body-row"]') as HTMLElement;

    expect(row).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(row);
    expect(row).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(row);
    expect(row).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(row);
    expect(row).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerLeave(row);
    expect(row).not.toHaveAttribute('data-state');
    fireEvent.focus(row);
    expect(row).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(row);
    expect(row).not.toHaveAttribute('data-state');
  });

  it('keeps the caller handler the part carries on the same prop', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={rows}
        rowKey="id"
        onRowClick={onRowClick}
      />,
    );
    const row = container.querySelector('[data-part="body-row"]') as HTMLElement;

    // The row's own onFocus (it tracks the active row for roving focus) runs
    // alongside the kernel's, which is what decides `focus-visible`.
    fireEvent.focus(row);
    expect(row).toHaveAttribute('data-state', 'focused focus-visible');
    expect(row).toHaveAttribute('tabindex', '0');

    fireEvent.click(row);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('does not lose the press state to a caller that prevents the default', async () => {
    // The column drag grip's own pointerdown calls preventDefault(); with the
    // caller first the kernel would never see the press.
    render(
      <ModernDataTable<Row>
        columns={columns}
        data={rows}
        rowKey="id"
        reorderable
        onColumnReorder={() => {}}
      />,
    );
    const grip = await screen.findByRole('button', { name: /Drag to reorder column/ });
    expect(grip).toHaveAttribute('data-part', 'drag-grip');

    fireEvent.pointerDown(grip);
    expect(grip).toHaveAttribute('data-state', 'pressed');
    // A press decides input modality, so the focus that follows it is NOT a
    // keyboard focus and must not arm the focus-visible ring.
    fireEvent.focus(grip);
    expect(grip.getAttribute('data-state')).toBe('pressed focused');
  });
});
