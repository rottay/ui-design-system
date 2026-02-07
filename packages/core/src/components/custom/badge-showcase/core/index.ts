import type { EngineAwareProps } from '../../../../types';

export type BadgeShowcasePreset = 'grid' | 'list';

export interface AchievementBadge {
  key: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  earned?: boolean;
  earnedDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface BadgeShowcaseProps extends EngineAwareProps {
  preset?: BadgeShowcasePreset;
  badges: AchievementBadge[];
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BADGE_SHOWCASE_DEFAULTS = {
  preset: 'grid' as BadgeShowcasePreset,
};
