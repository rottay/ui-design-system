import { notFound } from 'next/navigation';

import { CompositionScene } from '../../sections/compositions';
import { COMPOSITION_CASES } from '../../sections/compositions/cases';

export default async function CompositionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another composition, which would photograph the wrong family as if it passed. */
  if (!raw || !COMPOSITION_CASES.includes(raw)) notFound();
  return <CompositionScene only={raw} />;
}
