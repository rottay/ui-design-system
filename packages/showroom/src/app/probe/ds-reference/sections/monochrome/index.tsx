'use client';

/* Pure router: two disjoint fixture modules, each returning null for slugs it
   does not own.

   No private kit stylesheet is imported here any more. The ten DS owners of
   this cohort were reclassified by role (primitives, patterns, one structure),
   so their skins ship through the package's normal `styles.css` entrypoint,
   which the root layout already loads. ProductWindow is showroom-local and
   imports its own CSS. */

import type { ReactNode } from 'react';
import type { MonochromeCase } from './cases';
import { ConfigMonochromeASurface } from './config-a';
import { ConfigMonochromeBSurface } from './config-b';

function Monochrome({ only }: { only: MonochromeCase }): ReactNode {
  return (
    <>
      <ConfigMonochromeASurface only={only} />
      <ConfigMonochromeBSurface only={only} />
    </>
  );
}

export function MonochromeScene({ only }: { only: MonochromeCase }) {
  return (
    <div data-testid="lab-scene">
      <div data-testid={`lab-monochrome-${only}`}>
        <Monochrome only={only} />
      </div>
      <p data-testid="lab-monochrome-readout">{`monochrome: ${only}`}</p>
    </div>
  );
}
