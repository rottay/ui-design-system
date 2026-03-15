import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type UserProfilePreset = 'standard' | 'portfolio';

export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'offline';

export interface UserStat {
  label: string;
  value: string | number;
  prefix?: string;
}

export interface SocialLink {
  platform: 'linkedin' | 'instagram' | 'twitter' | 'github' | 'dribbble' | 'website' | 'other';
  url: string;
  icon?: ReactNode;
}

export interface UserProfileTab {
  key: string;
  label: string;
  content?: ReactNode;
  count?: number;
}

export interface UserProfileNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: string | ReactNode;
  section?: string;
}

export interface MediaUploadConfig {
  accept?: string;
  maxSize?: string;
  aspectRatios?: string[];
  minDimensions?: string;
  onUpload?: (file: File) => void;
  onBrowse?: () => void;
}

export interface UserProfileProps extends EngineAwareProps {
  preset?: UserProfilePreset;
  user: {
    name: string;
    title?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    availability?: AvailabilityStatus;
    stats?: UserStat[];
    socialLinks?: SocialLink[];
    verified?: boolean;
  };
  navItems?: UserProfileNavItem[];
  activeNavKey?: string;
  onNavSelect?: (key: string) => void;
  tabs?: UserProfileTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  mediaUpload?: MediaUploadConfig;
  headerContent?: ReactNode;
  sidebarHeader?: ReactNode;
  actions?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'default' | 'toggle';
    active?: boolean;
  }>;
  onSave?: () => void;
  onCopy?: () => void;
  editable?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const USER_PROFILE_DEFAULTS: Partial<UserProfileProps> = {
  preset: 'standard',
};
