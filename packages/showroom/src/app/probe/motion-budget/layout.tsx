import type { ReactNode } from 'react';

import { LabGround } from '../ds-reference/ground';

// One static ground is enough for a frame budget: bithire's motion channels ship in the
// bundled artifact, so no DB compile or client-only gate sits between the scene and its frames.
export default function MotionBudgetLayout({ children }: { children: ReactNode }) {
  return <LabGround tenant="bithire">{children}</LabGround>;
}
