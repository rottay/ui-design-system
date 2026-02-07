import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type TeamSectionPreset = 'grid' | 'carousel';

export interface SocialLink {
  icon: ReactNode;
  href?: string;
}

export interface TeamMemberDisplay {
  key: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  social?: SocialLink[];
}

export interface TeamSectionProps extends EngineAwareProps {
  preset?: TeamSectionPreset;
  members: TeamMemberDisplay[];
  title?: string;
  description?: string;
  columns?: 3 | 4;
  className?: string;
  style?: React.CSSProperties;
}

export const TEAM_SECTION_DEFAULTS = {
  preset: 'grid' as TeamSectionPreset,
  columns: 3 as const,
};
