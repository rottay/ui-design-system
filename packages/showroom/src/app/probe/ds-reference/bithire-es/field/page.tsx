import { FieldScene } from '../../sections/field';
import { JudgeOverlay } from '../../judge';

export default async function FieldPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <FieldScene />
    </>
  );
}
