/**
 * PageHeader Presets
 */

export { StandardPageHeader } from './standard';
export { CompactPageHeader } from './compact';
export { HeroPageHeader } from './hero';

import type { PageHeaderPreset } from '../core';
import type { ComponentType } from 'react';
import type { PageHeaderProps } from '../core';
import { StandardPageHeader } from './standard';
import { CompactPageHeader } from './compact';
import { HeroPageHeader } from './hero';

export const PAGE_HEADER_PRESETS: Record<PageHeaderPreset, ComponentType<PageHeaderProps>> = {
  standard: StandardPageHeader,
  compact: CompactPageHeader,
  hero: HeroPageHeader,
};
