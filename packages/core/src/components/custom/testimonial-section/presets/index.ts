/**
 * TestimonialSection Presets
 */

import type { TestimonialSectionPreset } from '../core';
import { CardsTestimonialSection } from './cards';
import { CarouselTestimonialSection } from './carousel';
import { WallTestimonialSection } from './wall';

export const PRESETS: Record<TestimonialSectionPreset, React.ComponentType<any>> = {
  cards: CardsTestimonialSection,
  carousel: CarouselTestimonialSection,
  wall: WallTestimonialSection,
};
