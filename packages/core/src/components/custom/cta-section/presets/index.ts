/**
 * CtaSection Presets
 */

import type { CtaSectionPreset } from '../core';
import { BannerCtaSection } from './banner';
import { CenteredCtaSection } from './centered';
import { SplitCtaSection } from './split';

export const PRESETS: Record<CtaSectionPreset, React.ComponentType<any>> = {
  banner: BannerCtaSection,
  centered: CenteredCtaSection,
  split: SplitCtaSection,
};
