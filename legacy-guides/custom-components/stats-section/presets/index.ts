/**
 * StatsSection Presets
 */

import type { StatsSectionPreset, StatsSectionProps } from '../core';
import type { ComponentType } from 'react';
import { InlineStatsSection } from './inline';
import { CardsStatsSection } from './cards';
import { LargeStatsSection } from './large';

export const PRESETS: Record<StatsSectionPreset, ComponentType<StatsSectionProps>> = {
  inline: InlineStatsSection,
  cards: CardsStatsSection,
  large: LargeStatsSection,
};
