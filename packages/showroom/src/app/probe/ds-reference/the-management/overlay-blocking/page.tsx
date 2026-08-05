import { OverlayScene } from '../../sections/overlay';
import { JudgeOverlay } from '../../judge';

export default async function OverlayBlockingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <OverlayScene layer="blocking" />
    </>
  );
}
