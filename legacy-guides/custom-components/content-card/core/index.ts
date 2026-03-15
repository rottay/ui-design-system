import type { EngineAwareProps } from '../../../../types';

export type ContentCardPreset = 'document' | 'link-preview' | 'file';

export interface ContentCardProps extends EngineAwareProps {
  preset?: ContentCardPreset;
  title: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  meta?: Array<{
    label: string;
    value: string;
  }>;
  tags?: string[];
  onClick?: () => void;
  href?: string;
  fileSize?: string;
  fileType?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CONTENT_CARD_DEFAULTS = {
  preset: 'document' as ContentCardPreset,
};
