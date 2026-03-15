import type { EngineAwareProps } from '../../../../types';

export type ReviewListPreset = 'standard' | 'compact';

export interface Review {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  content: string;
  date: Date | string;
  helpful?: number;
  avatar?: string;
}

export interface RatingBreakdown {
  average: number;
  total: number;
  distribution: number[];
}

export interface ReviewListProps extends EngineAwareProps {
  preset?: ReviewListPreset;
  reviews: Review[];
  breakdown?: RatingBreakdown;
  onHelpful?: (reviewId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const REVIEW_LIST_DEFAULTS = {
  preset: 'standard' as ReviewListPreset,
};
