import { notFound } from 'next/navigation';

import { MOTION_BUDGET_SCENES, isMotionBudgetScene } from '../roster';
import { MotionBudgetScene } from '../scenes';

export const dynamicParams = false;

export function generateStaticParams() {
  return MOTION_BUDGET_SCENES.map((scene) => ({ scene }));
}

export default async function MotionBudgetScenePage({
  params,
}: {
  params: Promise<{ scene: string }>;
}) {
  const { scene } = await params;
  if (!isMotionBudgetScene(scene)) notFound();
  return <MotionBudgetScene scene={scene} />;
}
