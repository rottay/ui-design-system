import { notFound } from 'next/navigation';

import { R4StructureScene } from '../../sections/r4-structures';
import { R4_CASES } from '../../sections/r4-structures/cases';

export default async function R4StructuresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another family, which would photograph the wrong structure as if it passed. */
  if (!raw || !R4_CASES.includes(raw)) notFound();
  return <R4StructureScene only={raw} />;
}
