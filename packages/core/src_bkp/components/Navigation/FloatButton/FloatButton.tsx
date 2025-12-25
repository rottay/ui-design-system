'use client';

/**
 * FloatButton Component
 *
 * Multi-engine floating action button with Group and BackTop support.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { FloatButtonProps } from './types';

import TitanFloatButton from './engines/titan';

const HermesFloatButton = lazyEngine(() => import('./engines/hermes'));
const ApolloFloatButton = lazyEngine(() => import('./engines/apollo'));
const AthenaFloatButton = lazyEngine(() => import('./engines/athena'));

/**
 * FloatButton component with multi-engine support
 */
export const FloatButton = createEngineComponent<FloatButtonProps>({
  titan: TitanFloatButton,
  hermes: HermesFloatButton,
  apollo: ApolloFloatButton,
  athena: AthenaFloatButton,
});

FloatButton.displayName = 'FloatButton';
