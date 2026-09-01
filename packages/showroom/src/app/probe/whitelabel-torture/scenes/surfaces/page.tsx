import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { RecordFbStates } from '@/components/torture-sections/record';
import { DashboardWidgetsStates } from '@/components/torture-sections/dashboard';
import { WorkspaceChromeFbStates } from '@/components/torture-sections/workspace-chrome';
import { ApplicationSurfaceStates } from '@/components/torture-sections/application-surfaces';
import { SurfacesLongTailFixture } from '@/components/fixtures/surfaces/long-tail';

export default async function SurfacesScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <RecordFbStates />
        <DashboardWidgetsStates />
        <WorkspaceChromeFbStates />
        <ApplicationSurfaceStates />
        <SurfacesLongTailFixture />
      </TortureFrame>
    </>
  );
}
