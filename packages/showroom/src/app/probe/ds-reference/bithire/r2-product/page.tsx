import { R2ProductScene, type R2Case } from '../../sections/r2-product';
import { JudgeOverlay } from '../../judge';

const CASES: R2Case[] = [
  'autocomplete',
  'mentions',
  'transfer',
  'modal',
  'progress',
  'pagination',
  'steps',
];

export default async function R2ProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '') ? (raw as R2Case) : 'progress';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <R2ProductScene only={only} />
    </>
  );
}
