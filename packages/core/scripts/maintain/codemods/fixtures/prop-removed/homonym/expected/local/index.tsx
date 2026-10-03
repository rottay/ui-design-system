export function PatternGridView({ columns, minColumnWidth }: { columns: number; minColumnWidth: number }) {
  return <div data-columns={columns} data-min={minColumnWidth} />;
}
