/**
 * StatsSection Presets
 */

import type { StatsSectionPreset } from '../core';
import { InlineStatsSection } from './inline';
import { CardsStatsSection } from './cards';
import { LargeStatsSection } from './large';

export const PRESETS: Record<StatsSectionPreset, React.ComponentType<any>> = {
  inline: InlineStatsSection,
  cards: CardsStatsSection,
  large: LargeStatsSection,
};
