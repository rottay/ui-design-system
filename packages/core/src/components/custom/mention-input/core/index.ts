import type { EngineAwareProps } from '../../../../types';

export type MentionInputPreset = 'standard' | 'minimal';

export interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface MentionInputProps extends EngineAwareProps {
  preset?: MentionInputPreset;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  users?: MentionUser[];
  placeholder?: string;
  submitLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const MENTION_INPUT_DEFAULTS = {
  preset: 'standard' as MentionInputPreset,
  placeholder: 'Type @ to mention someone...',
  submitLabel: 'Send',
  users: [] as MentionUser[],
};
