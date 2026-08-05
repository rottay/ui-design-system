import { FeedbackScene } from '../../sections/feedback';
import { JudgeOverlay } from '../../judge';

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <FeedbackScene />
    </>
  );
}
