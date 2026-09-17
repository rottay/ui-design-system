/**
 * `aria-rowcount` / `aria-colcount` declare a grid whose rendered rows are a
 * window on the data. These probes pin the coordinates that let a reader place
 * a row inside that declaration.
 *
 * The counted sequence is the EXPOSED table in document order: the header row,
 * then every group header, body row and expanded detail row. Group headers are
 * interactive rows and take an index like any other; only the virtual spacers
 * stay out, because they paint scroll height, own no cell and are aria-hidden.
 * Collapsed group members are neither exposed nor counted. The column index
 * follows the rendered column order (selection, expansion, data, actions).
 *
 * The phone posture is a different contract and is pinned here too: a record
 * list is not a grid, so it carries none of these coordinates.
 */
import React, { Suspense } from 'react';
import { renderWithEngineContext } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';
import {
  fireEvent,
  render as renderReact,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/runtime/media-snapshot';
import type { TenantConfig } from '@/foundation/contracts';
import type { ColumnDef } from '@/foundation/contracts/runtime/components/patterns/core';
import ModernDataTable from '../engines/modern';
import { PatternDataTable } from '..';

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

/** The same three records, with two of them sharing an owner to group by. */
const groupedRows: Row[] = [
  { id: 1, name: 'Ada', owner: 'Core' },
  { id: 2, name: 'Bo', owner: 'Core' },
  { id: 3, name: 'Cy', owner: 'Edge' },
];

const manyRows: Row[] = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  name: `Row ${index + 1}`,
  owner: `Owner ${index + 1}`,
}));

function grid(container: HTMLElement): HTMLElement {
  return container.querySelector('table[role="grid"]') as HTMLElement;
}

function rowCount(container: HTMLElement): string | null {
  return grid(container).getAttribute('aria-rowcount');
}

function tableRows(container: HTMLElement): HTMLTableRowElement[] {
  return Array.from(grid(container).querySelectorAll('tr'));
}

/** The row's own `data-part`, or the one its single spanning cell carries. */
function rowPart(row: HTMLTableRowElement): string {
  const own = row.getAttribute('data-part');
  if (own) return own;
  return row.querySelector('[data-part]')?.getAttribute('data-part') ?? 'row';
}

/**
 * Every exposed row of the grid in document order, as `[part, aria-rowindex]`.
 * This is the accessibility-tree sequence a reader walks, so the assertions
 * below read as the table a reader is told it is in.
 */
function exposedRowCoordinates(container: HTMLElement): [string, string | null][] {
  return tableRows(container)
    .filter((row) => row.getAttribute('aria-hidden') !== 'true')
    .map((row): [string, string | null] => [rowPart(row), row.getAttribute('aria-rowindex')]);
}

function hiddenRows(container: HTMLElement): HTMLTableRowElement[] {
  return tableRows(container).filter(
    (row) => row.getAttribute('aria-hidden') === 'true',
  );
}

function bodyRowIndices(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('[data-part="body-row"]')).map((row) =>
    row.getAttribute('aria-rowindex'),
  );
}

function groupHeaderRows(container: HTMLElement): HTMLTableRowElement[] {
  return Array.from(
    container.querySelectorAll<HTMLTableRowElement>('[data-part="group-header-row"]'),
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
    // The control: no structural row exists, so the exposed sequence is the
    // header row plus one row per record and nothing else.
    expect(exposedRowCoordinates(container)).toEqual([
      ['header-row', '1'],
      ['body-row', '2'],
      ['body-row', '3'],
      ['body-row', '4'],
    ]);
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

describe('PatternDataTable modern — grouped rows are part of the exposed sequence', () => {
  it('counts and indexes every group header row', () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={groupedRows}
        rowKey="id"
        groupBy="owner"
      />,
    );

    // Three records in two groups expose six rows, and the count says six.
    expect(exposedRowCoordinates(container)).toEqual([
      ['header-row', '1'],
      ['group-header-row', '2'],
      ['body-row', '3'],
      ['body-row', '4'],
      ['group-header-row', '5'],
      ['body-row', '6'],
    ]);
    expect(rowCount(container)).toBe('6');
    // An interactive heading is never presentational: both carry an index.
    for (const header of groupHeaderRows(container)) {
      expect(header).toHaveAttribute('role', 'row');
      expect(header.getAttribute('aria-rowindex')).not.toBeNull();
    }
  });

  it('drops a collapsed group from the count and restores it on re-expand', () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={groupedRows}
        rowKey="id"
        groupBy="owner"
      />,
    );

    fireEvent.click(groupHeaderRows(container)[0]);

    // The collapsed group's two members are not exposed and not counted; the
    // group header keeps its own place in the sequence.
    expect(exposedRowCoordinates(container)).toEqual([
      ['header-row', '1'],
      ['group-header-row', '2'],
      ['group-header-row', '3'],
      ['body-row', '4'],
    ]);
    expect(rowCount(container)).toBe('4');
    expect(groupHeaderRows(container)[0]).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(groupHeaderRows(container)[0]);

    expect(exposedRowCoordinates(container)).toEqual([
      ['header-row', '1'],
      ['group-header-row', '2'],
      ['body-row', '3'],
      ['body-row', '4'],
      ['group-header-row', '5'],
      ['body-row', '6'],
    ]);
    expect(rowCount(container)).toBe('6');
  });
});

describe('PatternDataTable modern — expanded detail rows', () => {
  it('indexes a detail row immediately after its body row and counts it', async () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={rows}
        rowKey="id"
        expandedRow={(row) => <span>{`Detail ${row.name}`}</span>}
      />,
    );

    expect(rowCount(container)).toBe('4');

    const secondRow = container.querySelectorAll('[data-part="body-row"]')[1];
    const toggle = await waitFor(() => {
      const button = secondRow.querySelector('[data-part="expand-cell"] button');
      expect(button).not.toBeNull();
      return button as HTMLButtonElement;
    });
    fireEvent.click(toggle);

    expect(exposedRowCoordinates(container)).toEqual([
      ['header-row', '1'],
      ['body-row', '2'],
      ['body-row', '3'],
      ['expanded-row', '4'],
      ['body-row', '5'],
    ]);
    expect(rowCount(container)).toBe('5');
  });
});

describe('PatternDataTable modern — remote pagination with structural rows', () => {
  it('declares an unknown count when group headers share the page', () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={groupedRows}
        rowKey="id"
        groupBy="owner"
        // Page 2 of 3-record pages: the other pages' group headers are not
        // knowable from here, so no honest total exists.
        pagination={{ current: 2, pageSize: 3, total: 9, onChange: () => {} }}
      />,
    );

    expect(rowCount(container)).toBe('-1');
    // The page's own sequence is still coherent: strictly increasing indices
    // offset by the rows the previous pages already spent.
    expect(exposedRowCoordinates(container)).toEqual([
      ['header-row', '1'],
      ['group-header-row', '5'],
      ['body-row', '6'],
      ['body-row', '7'],
      ['group-header-row', '8'],
      ['body-row', '9'],
    ]);
  });

  it('declares an unknown count once a row on the page is expanded', async () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={rows}
        rowKey="id"
        expandedRow={(row) => <span>{`Detail ${row.name}`}</span>}
        pagination={{ current: 2, pageSize: 3, total: 9, onChange: () => {} }}
      />,
    );

    // Flat and unexpanded, the remote total is still the honest answer.
    expect(rowCount(container)).toBe('10');
    expect(bodyRowIndices(container)).toEqual(['5', '6', '7']);

    const firstRow = container.querySelector('[data-part="body-row"]') as HTMLElement;
    const toggle = await waitFor(() => {
      const button = firstRow.querySelector('[data-part="expand-cell"] button');
      expect(button).not.toBeNull();
      return button as HTMLButtonElement;
    });
    fireEvent.click(toggle);

    expect(rowCount(container)).toBe('-1');
    expect(exposedRowCoordinates(container)).toEqual([
      ['header-row', '1'],
      ['body-row', '5'],
      ['expanded-row', '6'],
      ['body-row', '7'],
      ['body-row', '8'],
    ]);
  });
});

describe('PatternDataTable modern — virtualized rows', () => {
  it('gives windowed rows absolute indices and leaves the spacers out', () => {
    const { container } = render(
      <ModernDataTable<Row>
        columns={columns}
        data={manyRows}
        rowKey="id"
        virtualized
        virtualRowHeight={48}
        maxHeight={240}
      />,
    );

    // The count covers the whole dataset plus the header row, even though the
    // window renders a slice of it.
    expect(rowCount(container)).toBe('41');
    expect(bodyRowIndices(container)).toEqual(
      Array.from({ length: 10 }, (_, index) => String(index + 2)),
    );

    const scrollRegion = container.querySelector(
      '[data-part="scroll"]',
    ) as HTMLElement;
    fireEvent.scroll(scrollRegion, { target: { scrollTop: 480 } });

    // Rows 6 through 20 of the dataset are grid rows 7 through 21: the window
    // moved, the coordinates did not become page-relative.
    expect(rowCount(container)).toBe('41');
    expect(bodyRowIndices(container)).toEqual(
      Array.from({ length: 15 }, (_, index) => String(index + 7)),
    );

    const spacers = hiddenRows(container);
    expect(spacers).toHaveLength(2);
    for (const spacer of spacers) {
      expect(spacer).toHaveAttribute('data-part', 'virtual-spacer');
      expect(spacer.getAttribute('aria-rowindex')).toBeNull();
    }
    expect(exposedRowCoordinates(container).map(([part]) => part)).toEqual([
      'header-row',
      ...Array.from({ length: 15 }, () => 'body-row'),
    ]);
  });
});

const MOBILE_TENANT: TenantConfig = {
  slug: 'aria-coordinates',
  name: 'Aria Coordinates',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: { companyName: 'Aria Coordinates' },
};

function MobileTable(): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={MOBILE_TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
    >
      <Suspense fallback={<div>Loading...</div>}>
        <PatternDataTable<Row>
          engine="modern"
          columns={columns}
          data={rows}
          rowKey="id"
        />
      </Suspense>
    </DesignSystemProvider>
  );
}

describe('PatternDataTable — the phone posture is a record list, not a grid', () => {
  beforeEach(() => {
    resetResponsiveMediaStore();
    mockMatchMedia(390);
  });

  afterEach(() => {
    resetResponsiveMediaStore();
  });

  it('renders records without a grid role, a row count or row indices', async () => {
    const { container } = renderReact(<MobileTable />);

    const records = await waitFor(() => {
      const found = container.querySelector(
        '[data-part="record-cards"], [data-part="record-list"]',
      );
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });

    // Grid coordinates are only defined on rows and cells inside a grid. The
    // cards must not acquire them, and must not acquire a grid role to carry
    // them: a reader would be told about columns this posture never renders.
    expect(records.querySelector('[role="grid"]')).toBeNull();
    expect(container.querySelector('[role="grid"]')).toBeNull();
    expect(container.querySelector('[aria-rowcount]')).toBeNull();
    expect(container.querySelector('[aria-rowindex]')).toBeNull();
    expect(container.querySelector('[aria-colindex]')).toBeNull();
  });
});
