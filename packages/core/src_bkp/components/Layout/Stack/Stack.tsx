/**
 * Stack Component
 *
 * A vertical flex layout component (convenience wrapper).
 * Supports all four engines: titan, hermes, apollo, athena.
 */

'use client';

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { StackProps } from './types';

// Titan is the default engine (synchronously loaded)
import TitanStack from './engines/titan';

// Other engines are lazy loaded
const HermesStack = lazyEngine(() => import('./engines/hermes'));
const ApolloStack = lazyEngine(() => import('./engines/apollo'));
const AthenaStack = lazyEngine(() => import('./engines/athena'));

/**
 * Stack component for vertical flex layouts
 */
export const Stack = createEngineComponent<StackProps>({
  titan: TitanStack,
  hermes: HermesStack,
  apollo: ApolloStack,
  athena: AthenaStack,
});

Stack.displayName = 'Stack';

export type { StackProps, StackBaseProps, StackJustify, StackAlign, StackGap } from './types';
