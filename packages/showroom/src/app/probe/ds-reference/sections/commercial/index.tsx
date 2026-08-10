'use client';

/* Pure router: two disjoint fixture modules, each returning null for slugs it
   does not own. The kit ships its own stylesheet, imported once here. */

import '@rottay/design-system/commercial.css';

import type { ReactNode } from 'react';
import type { CommercialCase } from './cases';
import { ConfigCommercialASurface } from './config-a';
import { ConfigCommercialBSurface } from './config-b';

function Commercial({ only }: { only: CommercialCase }): ReactNode {
  return (
    <>
      <ConfigCommercialASurface only={only} />
      <ConfigCommercialBSurface only={only} />
    </>
  );
}

export function CommercialScene({ only }: { only: CommercialCase }) {
  return (
    <div data-testid="lab-scene">
      <div data-testid={`lab-commercial-${only}`}>
        <Commercial only={only} />
      </div>
      <p data-testid="lab-commercial-readout">{`commercial: ${only}`}</p>
    </div>
  );
}
