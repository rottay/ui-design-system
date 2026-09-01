import { PrimitiveInteractionScene, type PrimitiveInteractionCase } from '../../sections/primitive-interactions';
import { JudgeOverlay } from '../../judge';

const CASES: PrimitiveInteractionCase[] = [
  'autocomplete',
  'mentions',
  'transfer',
  'modal',
  'progress',
  'pagination',
  'steps',
];

export default async function PrimitiveInteractionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '') ? (raw as PrimitiveInteractionCase) : 'progress';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <PrimitiveInteractionScene only={only} />
    </>
  );
}
