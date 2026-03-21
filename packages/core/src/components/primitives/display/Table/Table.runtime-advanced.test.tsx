import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

const COLUMNS = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sorter: (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name),
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    hidden: false,
  },
  {
    key: 'hidden',
    title: 'Hidden',
    dataIndex: 'hidden',
    hidden: true,
  },
] as const;

const DATA = [
  { key: '1', name: 'Zoe', status: 'Draft', hidden: 'x' },
  { key: '2', name: 'Ada', status: 'Live', hidden: 'y' },
  { key: '3', name: 'Moe', status: 'Paused', hidden: 'z' },
] as const;

describe('Table advanced runtime coverage', () => {
  it.each(['modern', 'rustic'] as const)(
    'covers sorting, selection, pagination, row hooks, and empty branches in the %s engine',
    async (engine) => {
      const { Table } = await import('..');
      const handleSelectionChange = vi.fn();
      const handleRowClick = vi.fn();

      const { rerender } = renderWithEngine(
        <Table
          engine={engine}
          columns={COLUMNS as any}
          dataSource={DATA as any}
          rowSelection={{ onChange: handleSelectionChange }}
          pagination={{ pageSize: 2 }}
          rowClassName={(record: (typeof DATA)[number]) =>
            record.status === 'Live' ? 'row-live' : 'row-default'
          }
          onRow={(record: (typeof DATA)[number]) => ({
            onClick: () => handleRowClick(record.key),
          })}
        />,
        engine
      );

      expect(await screen.findByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();

      const selectAll =
        screen.queryByRole('checkbox', { name: /select all/i }) ??
        screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAll);

      await waitFor(() => {
        expect(handleSelectionChange).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('Name'));
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Ada');

      fireEvent.click(screen.getByText('Ada'));
      expect(handleRowClick).toHaveBeenCalledWith('2');

      const nextPageButton =
        screen.queryByRole('button', { name: /next page/i }) ??
        screen.getByRole('button', { name: /»/i });
      fireEvent.click(nextPageButton);
      expect(await screen.findByText('Zoe')).toBeInTheDocument();

      rerender(
        <Table
          engine={engine}
          columns={COLUMNS as any}
          dataSource={[]}
          pagination={{ pageSize: 2 }}
          locale={{ emptyText: 'Nothing here' }}
          loading
          showHeader={false}
        />
      );

      expect(await screen.findByText('Nothing here')).toBeInTheDocument();
    }
  );
});
