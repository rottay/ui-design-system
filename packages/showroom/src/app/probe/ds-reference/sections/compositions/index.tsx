'use client';

/* Pure router: two disjoint fixture modules, each returning null for slugs it
   does not own. */

import type { ReactNode } from 'react';
import type { CompositionCase } from './cases';
import { ConfigCompositionASurface } from './config-a';
import { ConfigCompositionBSurface } from './config-b';

function Composition({ only }: { only: CompositionCase }): ReactNode {
  return (
    <>
      <ConfigCompositionASurface only={only} />
      <ConfigCompositionBSurface only={only} />
    </>
  );
}

export function CompositionScene({ only }: { only: CompositionCase }) {
  return (
    <div data-testid="lab-scene">
      <div data-testid={`lab-composition-${only}`}>
        <Composition only={only} />
      </div>
      <p data-testid="lab-composition-readout">{`composition: ${only}`}</p>
    </div>
  );
}
