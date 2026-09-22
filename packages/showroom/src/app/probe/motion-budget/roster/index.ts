// The scene ids are the keys of budget/index.json `ratchets.droppedFrames.scenes`.
export const MOTION_BUDGET_SCENES = ['reflow', 'size-interpolate', 'size-measured', 'presence'] as const;

export type MotionBudgetSceneId = (typeof MOTION_BUDGET_SCENES)[number];

export function isMotionBudgetScene(value: string): value is MotionBudgetSceneId {
  return (MOTION_BUDGET_SCENES as readonly string[]).includes(value);
}

/** The DOM contract the budget spec drives; the scene stamps nothing else. */
export const MOTION_BUDGET_DOM = {
  scene: 'data-motion-budget-scene',
  ready: 'data-motion-budget-ready',
  kernelExports: 'data-motion-budget-kernel-exports',
  sizeStrategy: 'data-motion-budget-size-strategy',
  subject: 'data-motion-budget-subject',
  trigger: 'data-motion-budget-trigger',
} as const;
