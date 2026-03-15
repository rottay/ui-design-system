import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernTable from '../engines/modern';
import RusticTable from '../engines/rustic';
import { renderWithEngine } from '../../../../../testing/helpers/engine-test-utils';

const RENDER_COLUMNS = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: ['meta', 'name'],
    filterSearch: true,
    ellipsis: true,
    fixed: 'left' as const,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    filterSearch: true,
    width: 140,
  },
  {
    key: 'score',
    title: 'Score',
    dataIndex: 'score',
    align: 'right' as const,
    fixed: 'right' as const,
    width: 120,
  },
] as const;

const RENDER_DATA = [
  { id: '1', meta: { name: 'Ada Lovelace' }, status: 'Draft', score: 80 },
  { id: '2', meta: { name: 'Bea Stone' }, status: 'Live', score: 92 },
  { id: '3', meta: { name: 'Cara Pike' }, status: 'Paused', score: 75 },
  { id: '4', meta: { name: 'Dax Flint' }, status: 'Live', score: 88 },
  { id: '5', meta: { name: 'Eli Wren' }, status: 'Draft', score: 84 },
  { id: '6', meta: { name: 'Fay York' }, status: 'Live', score: 98 },
] as const;

describe.each([
  ['modern', ModernTable],
  ['rustic', RusticTable],
] as const)('Table rendering advanced %s engine coverage', (_engine, EngineTable) => {
  it('covers filter rows, expand icons, summary, title/footer, virtual rows, and loading overlays', async () => {
    const { container, rerender } = renderWithEngine(
      <EngineTable
        columns={RENDER_COLUMNS as any}
        dataSource={RENDER_DATA as any}
        rowKey={(record: (typeof RENDER_DATA)[number]) => record.id}
        rowSelection={{ onChange: () => undefined }}
        expandable={{
          columnTitle: 'Expand',
          expandedRowRender: (record: (typeof RENDER_DATA)[number]) => (
            <div>Expanded {record.id}</div>
          ),
          expandIcon: ({ expanded, onExpand, record }: any) => (
            <button type="button" onClick={onExpand} aria-label={`Toggle ${record.id}`}>
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          ),
        }}
        pagination={{ pageSize: 6 }}
        summary={(rows) => (
          <tr>
            <td colSpan={5}>Summary {rows.length}</td>
          </tr>
        )}
        title={(rows) => <span>Title {rows.length}</span>}
        footer={(rows) => <span>Footer {rows.length}</span>}
        scroll={{ y: 96, x: 720 }}
        virtual
        sticky={{ offsetHeader: 12 }}
        tableLayout="fixed"
      />,
      _engine
    );

    expect(await screen.findByText('Title 6')).toBeInTheDocument();
    expect(screen.getByText('Footer 6')).toBeInTheDocument();
    expect(screen.getByText('Summary 6')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Filter Name...' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Filter Status...' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Filter Status...' }), {
      target: { value: 'Live' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('Live').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle 2' }));
    expect(await screen.findByText('Expanded 2')).toBeInTheDocument();

    const table = screen.getByRole('grid');
    if (_engine === 'modern') {
      expect(table.className).toContain('table-fixed');
      expect(screen.getByText('Bea Stone').closest('td')?.className).toContain('truncate');
    } else {
      expect((table as HTMLTableElement).style.tableLayout).toBe('fixed');
      expect(screen.getByText('Bea Stone').closest('td')).toHaveStyle({
        textOverflow: 'ellipsis',
      });
    }

    const hiddenRows = container.querySelectorAll('tr[aria-hidden="true"]');
    expect(hiddenRows.length).toBeGreaterThan(0);

    rerender(
      <EngineTable
        columns={RENDER_COLUMNS as any}
        dataSource={RENDER_DATA as any}
        loading
        pagination={{ pageSize: 6 }}
      />
    );

    if (_engine === 'modern') {
      expect(container.querySelector('.loading-spinner')).toBeTruthy();
    } else {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    }
  });
});
