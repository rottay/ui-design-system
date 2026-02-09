import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type SocialWallPreset = 'display' | 'moderate';

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'twitter' | 'internal' | 'tiktok';
  author: string;
  authorAvatar?: string;
  content: string;
  mediaUrl?: string;
  timestamp: Date;
  likes: number;
  status: 'approved' | 'pending' | 'rejected';
}

export interface SocialWallProps extends EngineAwareProps {
  preset?: SocialWallPreset;
  posts?: SocialPost[];
  bannedWords?: string[];
  onApprove?: (postId: string) => void;
  onReject?: (postId: string) => void;
  onFilterChange?: (filters: { platform?: string; status?: string }) => void;
  style?: CSSProperties;
  className?: string;
}

export const SOCIAL_WALL_DEFAULTS: Required<
  Pick<SocialWallProps, 'preset' | 'posts' | 'bannedWords'>
> = {
  preset: 'display',
  posts: [],
  bannedWords: [],
};
