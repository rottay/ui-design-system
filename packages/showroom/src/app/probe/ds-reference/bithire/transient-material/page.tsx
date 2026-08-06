import { TransientMaterialScene } from '../../sections/transient-material';
import { JudgeOverlay } from '../../judge';

export default async function TransientMaterialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <TransientMaterialScene />
    </>
  );
}
