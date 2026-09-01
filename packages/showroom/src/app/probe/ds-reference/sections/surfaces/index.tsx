'use client';

/* Pure router: four disjoint fixture modules, each returning null for slugs it
   does not own. */

import type { ReactNode } from 'react';
import type { SurfaceCase } from './cases';
import { ConfigASurface } from './config-a';
import { ConfigBSurface } from './config-b';
import { ConfigInheritedASurface } from './config-inherited-a';
import { ConfigInheritedBSurface } from './config-inherited-b';

function Surface({ only }: { only: SurfaceCase }): ReactNode {
  return (
    <>
      <ConfigASurface only={only} />
      <ConfigBSurface only={only} />
      <ConfigInheritedASurface only={only} />
      <ConfigInheritedBSurface only={only} />
    </>
  );
}

export function SurfaceScene({ only }: { only: SurfaceCase }) {
  return (
    <div data-testid="lab-scene">
      <div data-testid={`lab-surface-${only}`}>
        <Surface only={only} />
      </div>
      <p data-testid="lab-surface-readout">{`surface: ${only}`}</p>
    </div>
  );
}
