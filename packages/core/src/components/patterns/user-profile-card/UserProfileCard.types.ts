/**
 * UserProfileCard - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface UserProfile {
  name: string;
  avatar?: string;
  role: string;
  email?: string;
  department?: string;
  status?: 'active' | 'away' | 'busy' | 'offline';
}

export interface ProfileAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

export interface UserProfileCardProps extends PatternBaseProps {
  /** User profile data */
  user: UserProfile;
  /** Action buttons to display */
  actions?: ProfileAction[];
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Display variant */
  variant?: 'compact' | 'full';
  /** Whether user is online */
  online?: boolean;
  /** Click handler for the card */
  onClick?: () => void;
  /** Custom header content */
  headerExtra?: ReactNode;
}
