import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { RecordFbStates } from '@/components/torture-sections/record';
import { DashboardWidgetsStates } from '@/components/torture-sections/dashboard';
import { WorkspaceChromeFbStates } from '@/components/torture-sections/workspace-chrome';
import { MiscH2FbStates } from '@/components/torture-sections/misc-h2';
import { SurfacesLongTailFixture } from '@/components/surfaces-long-tail-fixture';

export default async function SurfacesScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <RecordFbStates />
        <DashboardWidgetsStates />
        <WorkspaceChromeFbStates />
        <MiscH2FbStates />
        <SurfacesLongTailFixture />
      </TortureFrame>
    </>
  );
}
