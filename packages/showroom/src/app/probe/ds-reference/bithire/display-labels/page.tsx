import { DisplayLabelsScene } from '../../sections/display-labels';
import { JudgeOverlay } from '../../judge';

export default async function DisplayLabelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <DisplayLabelsScene />
    </>
  );
}
