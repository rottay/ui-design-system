import type { ChartInsightSummary as ChartInsightSummarySpec } from '../spec';
import { isChartInsightSummary } from '../spec';

export interface ChartInsightSummaryProps {
  readonly summary: ChartInsightSummarySpec | unknown;
}

/**
 * App-authored summary markup. The DS stamps disclosure/provenance fields but
 * renders only the supplied text and never infers causality or explanatory copy.
 */
export function ChartInsightSummary({
  summary,
}: ChartInsightSummaryProps): React.ReactElement | null {
  if (!isChartInsightSummary(summary)) return null;

  return (
    <aside
      data-part="chart-insight-summary"
      data-insight-id={summary.id}
      data-insight-mode={summary.mode}
      data-provenance-source-ids={JSON.stringify(summary.provenance.sourceIds)}
      data-provenance-method-id={summary.provenance.methodId}
    >
      {summary.text}
    </aside>
  );
}
