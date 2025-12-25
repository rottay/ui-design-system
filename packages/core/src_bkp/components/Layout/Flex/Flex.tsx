/**
 * Flex Component
 *
 * A flexible box layout component for horizontal/vertical alignment.
 * Supports all four engines: titan, hermes, apollo, athena.
 */

'use client';

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { FlexProps } from './types';

// Titan is the default engine (synchronously loaded)
import TitanFlex from './engines/titan';

// Other engines are lazy loaded
const HermesFlex = lazyEngine(() => import('./engines/hermes'));
const ApolloFlex = lazyEngine(() => import('./engines/apollo'));
const AthenaFlex = lazyEngine(() => import('./engines/athena'));

/**
 * Flex component for flexible box layouts
 */
export const Flex = createEngineComponent<FlexProps>({
  titan: TitanFlex,
  hermes: HermesFlex,
  apollo: ApolloFlex,
  athena: AthenaFlex,
});

Flex.displayName = 'Flex';

export type { FlexProps, FlexBaseProps, FlexJustify, FlexAlign, FlexWrap, FlexGap } from './types';
