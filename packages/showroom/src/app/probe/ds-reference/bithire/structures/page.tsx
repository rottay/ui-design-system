import { notFound } from 'next/navigation';

import { StructureScene } from '../../sections/structures';
import { STRUCTURE_CASES } from '../../sections/structures/cases';

export default async function StructuresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another family, which would photograph the wrong structure as if it passed. */
  if (!raw || !STRUCTURE_CASES.includes(raw)) notFound();
  return <StructureScene only={raw} />;
}
