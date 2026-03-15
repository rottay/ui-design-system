import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type ProfileCardPreset = 'standard' | 'horizontal' | 'minimal';

export interface ProfileCardProps extends EngineAwareProps {
  preset?: ProfileCardPreset;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  social?: Array<{
    icon: ReactNode;
    href?: string;
  }>;
  online?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PROFILE_CARD_DEFAULTS = {
  preset: 'standard' as ProfileCardPreset,
};
