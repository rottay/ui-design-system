/**
 * Space Component
 *
 * A component for setting spacing between inline elements.
 * Supports all four engines: titan, hermes, apollo, athena.
 */

'use client';

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { SpaceProps } from './types';

// Titan is the default engine (synchronously loaded)
import TitanSpace from './engines/titan';

// Other engines are lazy loaded
const HermesSpace = lazyEngine(() => import('./engines/hermes'));
const ApolloSpace = lazyEngine(() => import('./engines/apollo'));
const AthenaSpace = lazyEngine(() => import('./engines/athena'));

/**
 * Space component for inline element spacing
 */
export const Space = createEngineComponent<SpaceProps>({
  titan: TitanSpace,
  hermes: HermesSpace,
  apollo: ApolloSpace,
  athena: AthenaSpace,
});

Space.displayName = 'Space';

export type { SpaceProps, SpaceBaseProps, SpaceSize, SpaceDirection, SpaceAlign } from './types';
