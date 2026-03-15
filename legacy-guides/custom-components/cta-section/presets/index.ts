/**
 * CtaSection Presets
 */

import type { CtaSectionPreset, CtaSectionProps } from '../core';
import type { ComponentType } from 'react';
import { BannerCtaSection } from './banner';
import { CenteredCtaSection } from './centered';
import { SplitCtaSection } from './split';

export const PRESETS: Record<CtaSectionPreset, ComponentType<CtaSectionProps>> = {
  banner: BannerCtaSection,
  centered: CenteredCtaSection,
  split: SplitCtaSection,
};
