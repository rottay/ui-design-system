import { MicrobatchMaterialScene } from '../../sections/microbatch-material';
import { JudgeOverlay } from '../../judge';

export default async function MicrobatchMaterialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <MicrobatchMaterialScene />
    </>
  );
}
