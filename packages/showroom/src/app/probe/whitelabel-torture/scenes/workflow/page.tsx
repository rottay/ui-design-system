import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { RecordFbStates } from '@/components/torture-sections/record';
import { NavigationPatternsFbStates } from '@/components/torture-sections/navigation-patterns';
import { CommunicationFbStates } from '@/components/torture-sections/communication';
import { ApplicationSurfaceStates } from '@/components/torture-sections/application-surfaces';

export default async function WorkflowScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <RecordFbStates />
        <NavigationPatternsFbStates />
        <CommunicationFbStates />
        <ApplicationSurfaceStates />
      </TortureFrame>
    </>
  );
}
