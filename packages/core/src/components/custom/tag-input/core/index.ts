import type { EngineAwareProps } from '../../../../types';

export type TagInputPreset = 'standard' | 'compact';

export interface Tag {
  key: string;
  label: string;
  color?: string;
}

export interface TagInputProps extends EngineAwareProps {
  preset?: TagInputPreset;
  tags?: Tag[];
  suggestions?: Tag[];
  onAdd?: (tag: Tag) => void;
  onRemove?: (key: string) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TAG_INPUT_DEFAULTS = {
  preset: 'standard' as TagInputPreset,
  placeholder: 'Add tags...',
};
