import { notFound } from 'next/navigation';

import { ChartScene } from '../../sections/charts';
import { CHART_CASES } from '../../sections/charts/cases';

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another chart, which would photograph the wrong family as if it passed. */
  if (!raw || !CHART_CASES.includes(raw)) notFound();
  return <ChartScene only={raw} />;
}
