import { notFound } from 'next/navigation';

import { R5ChartScene } from '../../sections/r5-charts';
import { R5_CASES } from '../../sections/r5-charts/cases';

export default async function R5ChartsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another chart, which would photograph the wrong family as if it passed. */
  if (!raw || !R5_CASES.includes(raw)) notFound();
  return <R5ChartScene only={raw} />;
}
