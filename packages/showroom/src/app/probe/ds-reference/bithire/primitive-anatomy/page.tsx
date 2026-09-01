import { PrimitiveAnatomyScene, type PrimitiveAnatomyCase } from '../../sections/primitive-anatomy';
import { JudgeOverlay } from '../../judge';

const CASES: PrimitiveAnatomyCase[] = [
  'table-anatomy',
  'tree-anatomy',
  'carousel-anatomy',
  'transfer-oneway-remove',
];

export default async function PrimitiveAnatomyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '') ? (raw as PrimitiveAnatomyCase) : 'table-anatomy';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <PrimitiveAnatomyScene only={only} />
    </>
  );
}
