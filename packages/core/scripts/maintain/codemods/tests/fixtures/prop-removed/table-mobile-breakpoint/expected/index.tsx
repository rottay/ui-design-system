import { PatternDataTable } from '@rottay/design-system';

interface Row {
  id: string;
}

export function Table({ rows, mobileBreakpoint }: { rows: Row[]; mobileBreakpoint?: number }) {
  return (
    <>
      <PatternDataTable data={rows} rowKey="id" columns={[]} mobileBreakpoint={mobileBreakpoint} />
      <PatternDataTable
        data={rows}
        rowKey="id"
        columns={[]}
        mobileBreakpoint={640}
      />
      <PatternDataTable data={rows} rowKey="id" columns={[]} />
    </>
  );
}
