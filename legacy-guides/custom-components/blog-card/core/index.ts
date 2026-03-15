import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type BlogCardPreset = 'horizontal' | 'vertical' | 'minimal';

export interface BlogAuthor {
  name: string;
  avatar?: string;
}

export interface BlogCardProps extends EngineAwareProps {
  preset?: BlogCardPreset;
  title: string;
  description?: string;
  image?: string | ReactNode;
  category?: string;
  author?: BlogAuthor;
  date?: string;
  readTime?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BLOG_CARD_DEFAULTS = {
  preset: 'vertical' as BlogCardPreset,
};
