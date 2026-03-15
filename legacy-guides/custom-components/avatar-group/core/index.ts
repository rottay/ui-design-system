import type { EngineAwareProps } from '../../../../types';

export type AvatarGroupPreset = 'stacked' | 'grid';

export interface AvatarItem {
  key: string;
  name: string;
  src?: string;
  color?: string;
}

export interface AvatarGroupProps extends EngineAwareProps {
  preset?: AvatarGroupPreset;
  avatars: AvatarItem[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  onOverflowClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AVATAR_GROUP_DEFAULTS = {
  preset: 'stacked' as AvatarGroupPreset,
  size: 'md' as const,
  max: 5,
};
