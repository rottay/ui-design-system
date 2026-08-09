'use client';

/* Pure router: four disjoint fixture modules, each returning null for slugs it
   does not own. */

import type { ReactNode } from 'react';
import type { R6Case } from './cases';
import { ConfigASurface } from './config-a';
import { ConfigBSurface } from './config-b';
import { ConfigInheritedASurface } from './config-inherited-a';
import { ConfigInheritedBSurface } from './config-inherited-b';

function Surface({ only }: { only: R6Case }): ReactNode {
  return (
    <>
      <ConfigASurface only={only} />
      <ConfigBSurface only={only} />
      <ConfigInheritedASurface only={only} />
      <ConfigInheritedBSurface only={only} />
    </>
  );
}

export function R6SurfaceScene({ only }: { only: R6Case }) {
  return (
    <div data-testid="lab-scene">
      <div data-testid={`lab-surface-${only}`}>
        <Surface only={only} />
      </div>
      <p data-testid="lab-surface-readout">{`surface: ${only}`}</p>
    </div>
  );
}
