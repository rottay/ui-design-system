/**
 * HeroSection Presets
 */

import type { HeroSectionPreset } from '../core';
import { CenteredHeroSection } from './centered';
import { SplitHeroSection } from './split';
import { GradientHeroSection } from './gradient';

export const PRESETS: Record<HeroSectionPreset, React.ComponentType<any>> = {
  centered: CenteredHeroSection,
  split: SplitHeroSection,
  gradient: GradientHeroSection,
};
