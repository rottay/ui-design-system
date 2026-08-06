import { InputsMaterialScene } from '../../sections/inputs-material';
import { JudgeOverlay } from '../../judge';

export default async function InputsMaterialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <InputsMaterialScene />
    </>
  );
}
