import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { DashboardWidgetsStates } from '@/components/torture-sections/dashboard';
import { CkEStates } from '@/components/torture-sections/ck-e';

export default async function DashboardScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <DashboardWidgetsStates />
        <CkEStates />
      </TortureFrame>
    </>
  );
}
