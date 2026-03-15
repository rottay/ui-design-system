import type { EngineAwareProps } from '../../../../types';

export type NewsFeedPreset = 'standard' | 'compact';

export interface FeedPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date | string;
  reactions?: Array<{
    emoji: string;
    count: number;
  }>;
  commentCount?: number;
  image?: string;
  liked?: boolean;
}

export interface NewsFeedProps extends EngineAwareProps {
  preset?: NewsFeedPreset;
  posts: FeedPost[];
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const NEWS_FEED_DEFAULTS = {
  preset: 'standard' as NewsFeedPreset,
};
