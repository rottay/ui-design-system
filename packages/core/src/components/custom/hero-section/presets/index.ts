/**
 * HeroSection Presets
 */

import type { HeroSectionPreset, HeroSectionProps } from '../core';
import type { ComponentType } from 'react';
import { CenteredHeroSection } from './centered';
import { SplitHeroSection } from './split';
import { GradientHeroSection } from './gradient';

export const PRESETS: Record<HeroSectionPreset, ComponentType<HeroSectionProps>> = {
  centered: CenteredHeroSection,
  split: SplitHeroSection,
  gradient: GradientHeroSection,
};
