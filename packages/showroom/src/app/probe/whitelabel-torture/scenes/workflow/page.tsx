import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { RecordFbStates } from '@/components/torture-sections/record';
import { NavigationPatternsFbStates } from '@/components/torture-sections/navigation-patterns';
import { CommunicationFbStates } from '@/components/torture-sections/communication';
import { MiscH2FbStates } from '@/components/torture-sections/misc-h2';

export default async function WorkflowScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <RecordFbStates />
        <NavigationPatternsFbStates />
        <CommunicationFbStates />
        <MiscH2FbStates />
      </TortureFrame>
    </>
  );
}
