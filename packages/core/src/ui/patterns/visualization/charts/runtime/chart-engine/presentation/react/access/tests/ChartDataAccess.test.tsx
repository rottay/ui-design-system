import React, { act } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ChartDataAccess, type ChartDataAccessProps } from '..';
import type {
  ChartDataAccessColumn,
  ChartDataAccessLabels,
} from '../../../../foundation/access';

interface Row {
  readonly id: string;
  readonly name: string;
  readonly score: number;
  readonly note: string;
}

const labels: ChartDataAccessLabels = {
  summaryHeading: 'Key facts',
  openTable: 'View data table',
  closeTable: 'Close data table',
  exportCsv: 'Export all rows as CSV',
  tableCaption: 'Candidate evidence',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  emptyTable: 'No evidence available',
  pageStatus: ({ page, pageCount, firstRow, lastRow, totalRows }) => (
    `Page ${page} of ${pageCount}; rows ${firstRow}-${lastRow} of ${totalRows}`
  ),
};

function createRows(count: number): readonly Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index + 1}`,
    name: `Candidate ${index + 1}`,
    score: index + 1,
    note: index === count - 1 ? '=LAST()' : `Evidence ${index + 1}`,
  }));
}

const columns = [
  { id: 'name', label: 'Candidate', getValue: (row: Row) => row.name },
  { id: 'score', label: 'Score', getValue: (row: Row) => row.score },
  { id: 'note', label: 'Evidence', getValue: (row: Row) => row.note },
] as const satisfies readonly [
  ChartDataAccessColumn<Row>,
  ...ChartDataAccessColumn<Row>[],
];

const summary = Array.from({ length: 6 }, (_, index) => ({
  id: `fact-${index + 1}`,
  label: `Fact ${index + 1}`,
  value: `Summary value ${index + 1}`,
}));

function props(overrides: Partial<ChartDataAccessProps<Row>> = {}): ChartDataAccessProps<Row> {
  return {
    summary,
    columns,
    rows: createRows(120),
    getRowKey: (row) => row.id,
    labels,
    csvFilename: 'candidate-evidence',
    ...overrides,
  };
}

describe('ChartDataAccess', () => {
  it('shows at most five compact facts and mounts no dataset while collapsed', () => {
    const trackedColumns = columns.map((column) => ({
      ...column,
      getValue: vi.fn(column.getValue),
    })) as unknown as ChartDataAccessProps<Row>['columns'];
    const { container } = render(<ChartDataAccess {...props({ columns: trackedColumns })} />);

    expect(screen.getByText('Summary value 1')).toBeVisible();
    expect(screen.getByText('Summary value 5')).toBeVisible();
    expect(screen.queryByText('Summary value 6')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('Candidate 1');
    expect(trackedColumns.every((column) => vi.mocked(column.getValue).mock.calls.length === 0)).toBe(true);
    expect(screen.getByRole('button', { name: labels.openTable })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('mounts only the open page, clamps it to 50 rows and unmounts prior pages', () => {
    const { container } = render(
      <ChartDataAccess {...props({ pageSize: 500 })} />,
    );
    fireEvent.click(screen.getByRole('button', { name: labels.openTable }));

    const table = screen.getByRole('table', { name: labels.tableCaption });
    expect(table).toHaveAttribute('aria-rowcount', '121');
    expect(container.querySelectorAll('tbody tr')).toHaveLength(50);
    expect(within(table).getByText('Candidate 1')).toBeVisible();
    expect(within(table).queryByText('Candidate 51')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: labels.nextPage }));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(50);
    expect(screen.queryByText('Candidate 1')).not.toBeInTheDocument();
    expect(screen.getByText('Candidate 51')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: labels.nextPage }));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('Candidate 120')).toBeVisible();
    expect(screen.getByRole('button', { name: labels.nextPage })).toBeDisabled();
  });

  it('exports the complete dataset through the injected callback with a safe filename', () => {
    const downloadCsv = vi.fn();
    render(
      <ChartDataAccess
        {...props({
          rows: createRows(75),
          pageSize: 10,
          csvFilename: '../../Candidate evidence.CSV',
          downloadCsv,
        })}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: labels.openTable }));
    expect(screen.queryByText('Candidate 75')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: labels.exportCsv }));

    expect(downloadCsv).toHaveBeenCalledOnce();
    const file = downloadCsv.mock.calls[0]?.[0];
    expect(file).toMatchObject({
      filename: 'Candidate-evidence.csv',
      mimeType: 'text/csv;charset=utf-8',
      rowCount: 75,
    });
    expect(file.content).toContain('Candidate 75,75,\'=LAST()\r\n');
  });

  it('closes on Escape or the explicit action and restores focus to the trigger', () => {
    render(<ChartDataAccess {...props()} />);
    const trigger = screen.getByRole('button', { name: labels.openTable });

    fireEvent.click(trigger);
    const close = screen.getAllByRole('button', { name: labels.closeTable })[1]!;
    close.focus();
    fireEvent.keyDown(close, { key: 'Escape' });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.click(screen.getAllByRole('button', { name: labels.closeTable })[1]!);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps the collapsed server markup stable through hydration', async () => {
    const element = <ChartDataAccess {...props({ rows: createRows(3) })} />;
    const serverMarkup = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = serverMarkup;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelector('[aria-expanded="false"]')).not.toBeNull();
    expect(consoleError).not.toHaveBeenCalled();

    await act(async () => root?.unmount());
    consoleError.mockRestore();
    container.remove();
  });
});
