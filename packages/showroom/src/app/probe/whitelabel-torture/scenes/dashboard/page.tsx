import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { DashboardWidgetsStates } from '@/components/torture-sections/dashboard';
import { VisualizationStates } from '@/components/torture-sections/visualizations';

export default async function DashboardScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <DashboardWidgetsStates />
        <VisualizationStates />
      </TortureFrame>
    </>
  );
}
