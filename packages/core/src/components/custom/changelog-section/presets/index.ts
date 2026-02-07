import type { ChangelogSectionProps, ChangelogSectionPreset } from '../core';
import { TimelinePreset } from './timeline';
import { CardsPreset } from './cards';

export const PRESETS: Record<ChangelogSectionPreset, React.ComponentType<ChangelogSectionProps>> = {
  timeline: TimelinePreset,
  cards: CardsPreset,
};
