import { notFound } from 'next/navigation';

import { R6SurfaceScene } from '../../sections/r6-surfaces';
import { R6_CASES } from '../../sections/r6-surfaces/cases';

export default async function R6SurfacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another surface, which would photograph the wrong family as if it passed. */
  if (!raw || !R6_CASES.includes(raw)) notFound();
  return <R6SurfaceScene only={raw} />;
}
