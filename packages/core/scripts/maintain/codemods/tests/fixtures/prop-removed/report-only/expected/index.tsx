import { BarChart, ChartScaffold } from '@rottay/design-system';

export function Charts({ busy }: { busy: boolean }) {
  return (
    <>
      <ChartScaffold loading />
      <ChartScaffold loading={busy} />
      <BarChart loading data={[]} />
    </>
  );
}
