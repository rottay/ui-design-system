'use client';

/**
 * Carousel Component
 *
 * Multi-engine carousel/slider component.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { CarouselProps } from './types';

// Default engine (titan) - loaded synchronously
import TitanCarousel from './engines/titan';

// Lazy-loaded engines
const HermesCarousel = lazyEngine(() => import('./engines/hermes'));
const ApolloCarousel = lazyEngine(() => import('./engines/apollo'));
const AthenaCarousel = lazyEngine(() => import('./engines/athena'));

/**
 * Carousel component with multi-engine support
 */
export const Carousel = createEngineComponent<CarouselProps>({
  titan: TitanCarousel,
  hermes: HermesCarousel,
  apollo: ApolloCarousel,
  athena: AthenaCarousel,
});

Carousel.displayName = 'Carousel';
