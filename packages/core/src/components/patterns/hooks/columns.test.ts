import { describe, expect, it } from 'vitest';

import { actionsColumn, column, columns } from './columns';

interface EventRow {
  name: string;
  status: string;
}

describe('column builders', () => {
  it('creates typed columns with inferred default headers', () => {
    const nameColumn = column<EventRow, 'name'>('name');

    expect(nameColumn).toEqual({
      key: 'name',
      accessorKey: 'name',
      header: 'Name',
    });
  });

  it('preserves explicit headers and additional options', () => {
    const statusColumn = column<EventRow, 'status'>('status', {
      header: 'Lifecycle',
      align: 'center',
    });

    expect(statusColumn.header).toBe('Lifecycle');
    expect(statusColumn.align).toBe('center');
  });

  it('returns column arrays and builds actions columns', () => {
    const defs = columns<EventRow>([
      column('name'),
      actionsColumn((row) => row.status, { width: 120 }),
    ]);

    expect(defs).toHaveLength(2);
    expect(defs[1]?.key).toBe('__actions');
    expect(defs[1]?.align).toBe('right');
    expect(defs[1]?.render?.(undefined, { name: 'Launch', status: 'live' }, 0)).toBe('live');
  });
});
