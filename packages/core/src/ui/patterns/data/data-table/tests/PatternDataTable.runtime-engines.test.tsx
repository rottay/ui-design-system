import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import type { DataTablePatternProps } from '../contracts';
import ClassicDataTable from '../engines/classic';
import ModernDataTable from '../engines/modern';
import RusticDataTable from '../engines/rustic';

type Row = {
  id: string;
  name: string;
  venue: string;
  attendance: number;
  hidden?: string;
};

const rows: Row[] = [
  { id: 'evt-1', name: 'Spring Summit', venue: 'Brooklyn Hall', attendance: 1240, hidden: 'ignore' },
  { id: 'evt-2', name: 'Night Market', venue: 'Pier 3', attendance: 860, hidden: 'ignore' },
];

const ENGINE_COMPONENTS = {
  classic: ClassicDataTable<Row>,
  modern: ModernDataTable<Row>,
  rustic: RusticDataTable<Row>,
} as const;

function renderTable(
  Component: React.ComponentType<DataTablePatternProps<Row>>,
  props: Partial<DataTablePatternProps<Row>> = {}
) {
  const onSelectionChange = vi.fn();
  const onSortChange = vi.fn();
  const onRowClick = vi.fn();
  const onBulkExecute = vi.fn();
  const onPageChange = vi.fn();

  render(
    <Component
      data={rows}
      rowKey="id"
      columns={[
        { key: 'name', header: 'Event', accessorKey: 'name', sortable: true },
        { key: 'venue', header: 'Venue', accessorKey: 'venue' },
        { key: 'attendance', header: 'Attendance', accessorKey: 'attendance', align: 'right' },
        { key: 'hidden', header: 'Hidden', accessorKey: 'hidden', visible: false },
      ]}
      header={<div>Header slot</div>}
      footer={<div>Footer slot</div>}
      toolbar={<div>Toolbar slot</div>}
      bulkActions={[
        {
          key: 'archive',
          label: 'Archive',
          variant: 'primary',
          onExecute: onBulkExecute,
        },
      ]}
      selectable
      expandedRow={(row) => <div>Expanded {row.name}</div>}
      actions={(row) => <button type="button">View {row.name}</button>}
      onSelectionChange={onSelectionChange}
      onSortChange={onSortChange}
      onRowClick={onRowClick}
      sorting={{ key: 'name', direction: 'asc' }}
      pagination={{ current: 1, pageSize: 1, total: 2, onChange: onPageChange }}
      bordered
      striped
      compact
      stickyHeader
      maxHeight={320}
      hoverable
      {...props}
    />
  );

  return { onSelectionChange, onSortChange, onRowClick, onBulkExecute, onPageChange };
}

describe('PatternDataTable runtime engines', () => {
  it('keeps modern body cells from collapsing visible data columns', () => {
    render(
      <ModernDataTable<Row>
        data={rows}
        rowKey="id"
        columns={[
          {
            key: 'name',
            header: 'Event',
            accessorKey: 'name',
            width: 220,
            minWidth: 180,
            maxWidth: 320,
          },
          {
            key: 'venue',
            header: 'Venue',
            accessorKey: 'venue',
            width: 160,
            minWidth: 140,
          },
        ]}
      />
    );

    const firstDataCell = screen.getByText('Spring Summit').closest('td');

    expect(firstDataCell).toHaveStyle({
      width: '220px',
      minWidth: '180px',
      maxWidth: '320px',
    });
    expect(firstDataCell?.style.maxWidth).not.toBe('0px');
  });

  it('uses minWidth as the modern fixed-table width when a resizable column has no explicit width', () => {
    render(
      <ModernDataTable<Row>
        data={rows}
        rowKey="id"
        columns={[
          {
            key: 'name',
            header: 'Event',
            accessorKey: 'name',
            minWidth: 260,
          },
          {
            key: 'venue',
            header: 'Venue',
            accessorKey: 'venue',
            width: 160,
          },
        ]}
        resizable
      />
    );

    const firstDataCell = screen.getByText('Spring Summit').closest('td');

    expect(firstDataCell).toHaveStyle({
      width: '260px',
      minWidth: '260px',
    });
  });

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'renders loading and empty states through the %s engine',
    async (engine, Component) => {
      const { rerender } = render(
        <Component
          data={rows}
          rowKey="id"
          columns={[{ key: 'name', header: 'Event', accessorKey: 'name' }]}
          loading
        />
      );

      if (engine === 'classic') {
        expect(document.querySelector('.ant-spin-spinning')).toBeTruthy();
      } else if (engine === 'modern') {
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
      } else {
        expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
      }

      rerender(
        <Component
          data={[]}
          rowKey="id"
          columns={[{ key: 'name', header: 'Event', accessorKey: 'name' }]}
          emptyState={<div>No events available</div>}
        />
      );

      expect(await screen.findByText('No events available')).toBeInTheDocument();
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'supports selection, bulk actions, expansion, sorting and pagination in the %s engine',
    async (engine, Component) => {
      const { onSelectionChange, onSortChange, onBulkExecute, onPageChange, onRowClick } =
        renderTable(Component);

      expect(screen.getByText('Header slot')).toBeInTheDocument();
      expect(screen.getByText('Toolbar slot')).toBeInTheDocument();
      expect(screen.getByText('Footer slot')).toBeInTheDocument();
      expect(screen.getByText('Spring Summit')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

      const sortTrigger =
        engine === 'classic'
          ? screen.getAllByRole('columnheader', { name: 'Event' })[0]
          : screen.getByText('Event');
      fireEvent.click(sortTrigger);
      await waitFor(() => {
        expect(onSortChange).toHaveBeenCalled();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      const archiveButton = await screen.findByRole('button', { name: /archive/i });
      fireEvent.click(archiveButton);
      expect(onBulkExecute).toHaveBeenCalled();

      const expandButton =
        engine === 'classic'
          ? screen.getAllByLabelText(/expand row/i)[0]
          : screen.getAllByRole('button').find((button) => button.textContent === '▶' || button.textContent === '▼');

      if (!expandButton) {
        throw new Error(`Missing expand trigger for ${engine}`);
      }

      fireEvent.click(expandButton);
      expect(await screen.findByText(/Expanded Spring Summit/i)).toBeInTheDocument();

      const rowAction = screen.getByRole('button', { name: /View Spring Summit/i });
      fireEvent.click(rowAction);

      const rowText = screen.getByText('Spring Summit');
      fireEvent.click(rowText);
      expect(onRowClick).toHaveBeenCalled();

      const nextButton =
        engine === 'classic'
          ? screen.getByTitle('Next Page')
          : screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(2, 1);
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'respects controlled selection in the %s engine',
    async (_engine, Component) => {
      const onSelectionChange = vi.fn();

      render(
        <Component
          data={rows}
          rowKey="id"
          columns={[{ key: 'name', header: 'Event', accessorKey: 'name' }]}
          selectable
          selectedKeys={['evt-1']}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);

      fireEvent.click(checkboxes[1]);
      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      const row = screen.getByText('Spring Summit').closest('tr');
      if (row) {
        expect(within(row).getByText('Spring Summit')).toBeInTheDocument();
      }
    }
  );
});
