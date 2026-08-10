import { notFound } from 'next/navigation';

import { CommercialScene } from '../../sections/commercial';
import { COMMERCIAL_CASES } from '../../sections/commercial/cases';

export default async function CommercialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another family, which would photograph the wrong component as if it passed. */
  if (!raw || !COMMERCIAL_CASES.includes(raw)) notFound();
  return <CommercialScene only={raw} />;
}
