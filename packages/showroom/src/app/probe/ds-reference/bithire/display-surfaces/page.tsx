import { DisplaySurfacesScene } from '../../sections/display-surfaces';
import { JudgeOverlay } from '../../judge';

export default async function DisplaySurfacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <DisplaySurfacesScene />
    </>
  );
}
