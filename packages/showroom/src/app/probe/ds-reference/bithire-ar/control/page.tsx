import { ControlScene } from '../../sections/control';
import { JudgeOverlay } from '../../judge';

export default async function ControlPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <ControlScene />
    </>
  );
}
