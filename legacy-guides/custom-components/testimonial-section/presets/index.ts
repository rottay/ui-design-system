/**
 * TestimonialSection Presets
 */

import type { TestimonialSectionPreset, TestimonialSectionProps } from '../core';
import type { ComponentType } from 'react';
import { CardsTestimonialSection } from './cards';
import { CarouselTestimonialSection } from './carousel';
import { WallTestimonialSection } from './wall';

export const PRESETS: Record<TestimonialSectionPreset, ComponentType<TestimonialSectionProps>> = {
  cards: CardsTestimonialSection,
  carousel: CarouselTestimonialSection,
  wall: WallTestimonialSection,
};
