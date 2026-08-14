import { notFound } from 'next/navigation';

import { MonochromeScene } from '../../sections/monochrome';
import { MONOCHROME_CASES } from '../../sections/monochrome/cases';

export default async function MonochromePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  /* Fail closed: a missing or unknown `only` returns 404 rather than rendering
     another family, which would photograph the wrong component as if it passed. */
  if (!raw || !MONOCHROME_CASES.includes(raw)) notFound();
  return <MonochromeScene only={raw} />;
}
