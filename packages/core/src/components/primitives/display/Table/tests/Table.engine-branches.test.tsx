import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import ModernTable from '../engines/modern';
import RusticTable from '../engines/rustic';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

const ENGINE_TABLES = [
  ['modern', ModernTable],
  ['rustic', RusticTable],
] as const;

const NESTED_COLUMNS = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: ['meta', 'name'],
    sorter: (a: { meta: { name: string } }, b: { meta: { name: string } }) =>
      a.meta.name.localeCompare(b.meta.name),
    render: (value: string) => value.toUpperCase(),
    ellipsis: true,
    onCell: (record: { id: string }) => ({ 'data-cell-id': record.id }),
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    className: 'status-column',
    align: 'right' as const,
    style: { color: 'rgb(0, 0, 255)' },
  },
  {
    key: 'hidden',
    title: 'Hidden',
    dataIndex: 'hidden',
    hidden: true,
  },
] as const;

const TABLE_DATA = [
  { id: '2', meta: { name: 'Bea' }, status: 'Designer', hidden: 'x' },
  { id: '1', meta: { name: 'Alex' }, status: 'Engineer', hidden: 'y' },
  { id: '3', meta: { name: 'Cara' }, status: 'Operator', hidden: 'z' },
] as const;

describe('Table engine branch coverage', () => {
  it.each(ENGINE_TABLES)(
    'covers rowKey functions, radio selection, sort cycling, and custom cell branches in the %s engine',
    async (_engine, EngineTable) => {
      const handleSelectionChange = vi.fn();
      const handleRowClick = vi.fn();

      const { rerender } = renderWithEngine(
        <EngineTable
          columns={NESTED_COLUMNS as any}
          dataSource={TABLE_DATA as any}
          rowKey={(record: (typeof TABLE_DATA)[number]) => record.id}
          rowSelection={{
            type: 'radio',
            defaultSelectedRowKeys: ['1'],
            onChange: handleSelectionChange,
          }}
          pagination={false}
          rowClassName="static-row"
          onRow={(record: (typeof TABLE_DATA)[number]) => ({
            'data-row-id': record.id,
            onClick: () => handleRowClick(record.id),
          })}
        />,
        _engine
      );

      expect(await screen.findByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
      expect(screen.getByText('ALEX')).toBeInTheDocument();

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('name', 'table-row-selection');
      fireEvent.click(radios[0]);
      expect(handleSelectionChange).toHaveBeenCalled();

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      let rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('ALEX');

      fireEvent.click(nameHeader);
      rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('CARA');

      fireEvent.click(nameHeader);
      rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('BEA');

      const firstNameCell = screen.getByText('BEA').closest('td');
      expect(firstNameCell).toHaveAttribute('data-cell-id', '2');

      const row = screen.getByText('BEA').closest('tr');
      expect(row).toHaveAttribute('data-row-id', '2');
      fireEvent.click(screen.getByText('BEA'));
      expect(handleRowClick).toHaveBeenCalledWith('2');

      rerender(
        <EngineTable
          columns={NESTED_COLUMNS as any}
          dataSource={[]}
          loading
          showHeader={false}
          rowHoverable={false}
          pagination={{ pageSize: 1 }}
          locale={{ emptyText: 'Nothing to review' }}
        />
      );

      expect(await screen.findByText('Nothing to review')).toBeInTheDocument();
      expect(screen.queryByText('Name')).not.toBeInTheDocument();
      const previousPageButton =
        screen.queryByRole('button', { name: /previous page/i }) ??
        screen.getByRole('button', { name: /«/i });
      expect(previousPageButton).toBeDisabled();
    }
  );
});
