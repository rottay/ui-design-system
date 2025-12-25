'use client';

/**
 * Titan Carousel Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Carousel as AntCarousel } from 'antd';
import type { CarouselProps } from '../types';

/**
 * Titan Carousel Component
 *
 * Uses Ant Design Carousel under the hood.
 */
export default function TitanCarousel(props: CarouselProps) {
  return <AntCarousel {...props} />;
}
