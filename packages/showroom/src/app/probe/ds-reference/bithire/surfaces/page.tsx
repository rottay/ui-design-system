import { notFound } from 'next/navigation';

import { SurfaceScene } from '../../sections/surfaces';
import { SURFACE_CASES } from '../../sections/surfaces/cases';

export default async function SurfacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another surface, which would photograph the wrong family as if it passed. */
  if (!raw || !SURFACE_CASES.includes(raw)) notFound();
  return <SurfaceScene only={raw} />;
}
