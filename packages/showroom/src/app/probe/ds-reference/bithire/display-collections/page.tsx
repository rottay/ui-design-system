import { DisplayCollectionsScene } from '../../sections/display-collections';
import { JudgeOverlay } from '../../judge';

export default async function DisplayCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <DisplayCollectionsScene />
    </>
  );
}
