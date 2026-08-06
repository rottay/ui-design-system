import { OverlayEdgeScene, type OverlayEdgeCase } from '../../sections/overlay-edge';
import { JudgeOverlay } from '../../judge';

const CASES: OverlayEdgeCase[] = ['alertdialog', 'confirmdialog', 'sheet', 'tour', 'menu'];

export default async function OverlayEdgePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '') ? (raw as OverlayEdgeCase) : 'menu';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <OverlayEdgeScene only={only} />
    </>
  );
}
