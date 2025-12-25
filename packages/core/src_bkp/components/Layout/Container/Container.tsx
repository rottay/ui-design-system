/**
 * Container Component
 *
 * A responsive container for centering content with max-width constraints.
 * Supports all four engines: titan, hermes, apollo, athena.
 */

'use client';

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { ContainerProps } from './types';

// Titan is the default engine (synchronously loaded)
import TitanContainer from './engines/titan';

// Other engines are lazy loaded
const HermesContainer = lazyEngine(() => import('./engines/hermes'));
const ApolloContainer = lazyEngine(() => import('./engines/apollo'));
const AthenaContainer = lazyEngine(() => import('./engines/athena'));

/**
 * Container component for centered, max-width layouts
 */
export const Container = createEngineComponent<ContainerProps>({
  titan: TitanContainer,
  hermes: HermesContainer,
  apollo: ApolloContainer,
  athena: AthenaContainer,
});

Container.displayName = 'Container';

export type { ContainerProps, ContainerBaseProps } from './types';
