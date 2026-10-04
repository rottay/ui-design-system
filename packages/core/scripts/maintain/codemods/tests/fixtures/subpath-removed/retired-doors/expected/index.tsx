import { AreaChart, BarChart as Bars, Sparkline } from '@rottay/design-system';
import { LineChart, ChartLegend } from '@rottay/design-system/patterns/charts';
import * as Charts from '@rottay/design-system/patterns/charts';
import manifest from '@rottay/design-system/public-entrypoints-manifest';
import { ChartFrame } from '@rottay/design-system/charts';

export { PieChart, TreeMap } from '@rottay/design-system';
export * from '@rottay/design-system/patterns/charts';

export const lazy = () => import('@rottay/design-system/patterns/charts');
export const governed = Object.keys(manifest.entries);

export function Board() {
  return (
    <ChartFrame title="Volume">
      <AreaChart data={[]} />
      <Bars data={[]} />
      <Sparkline data={[]} />
      <LineChart data={[]} />
      <ChartLegend />
      <Charts.GaugeChart value={1} />
    </ChartFrame>
  );
}
