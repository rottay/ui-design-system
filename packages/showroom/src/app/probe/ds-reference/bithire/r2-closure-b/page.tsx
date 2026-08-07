import { R2ClosureBScene, type R2ClosureBCase } from '../../sections/r2-closure-b';
import { JudgeOverlay } from '../../judge';

const CASES: R2ClosureBCase[] = [
  'table-anatomy',
  'tree-anatomy',
  'carousel-anatomy',
  'transfer-oneway-remove',
];

export default async function R2ClosureBPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '') ? (raw as R2ClosureBCase) : 'table-anatomy';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <R2ClosureBScene only={only} />
    </>
  );
}
