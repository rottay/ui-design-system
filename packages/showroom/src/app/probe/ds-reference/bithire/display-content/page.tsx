import { DisplayContentScene } from '../../sections/display-content';
import { JudgeOverlay } from '../../judge';

export default async function DisplayContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <DisplayContentScene />
    </>
  );
}
