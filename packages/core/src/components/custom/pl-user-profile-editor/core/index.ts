/**
 * PlUserProfileEditor - Core Interface
 * User profile editor with full profile data management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlUserProfileEditorPreset = 'form' | 'sidebar';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  twoFactor: boolean;
}

export interface UserMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastPasswordChange?: Date;
  emailVerified: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  socialLinks?: SocialLinks;
  preferences: UserPreferences;
  metadata: UserMetadata;
}

export type ProfileSection = 'personal' | 'contact' | 'preferences' | 'security' | 'social';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  timestamp: Date;
  description: string;
}

export interface PlUserProfileEditorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlUserProfileEditorPreset;

  /** User profile data */
  profile: UserProfile;

  /** Callback when profile is updated */
  onSave?: (profile: UserProfile) => void | Promise<void>;

  /** Callback when cancel is clicked */
  onCancel?: () => void;

  /** Whether the form is in saving state */
  saving?: boolean;

  /** Validation errors */
  errors?: ValidationError[];

  /** Available departments for dropdown */
  departments?: string[];

  /** Available timezones for selector */
  timezones?: Array<{ value: string; label: string }>;

  /** Available date formats */
  dateFormats?: Array<{ value: string; label: string }>;

  /** Activity log entries (for sidebar preset) */
  activityLog?: ActivityLogEntry[];

  /** Whether password change section is enabled */
  allowPasswordChange?: boolean;

  /** Callback when password change is requested */
  onPasswordChange?: (currentPassword: string, newPassword: string) => void | Promise<void>;

  /** Whether avatar upload is enabled */
  allowAvatarUpload?: boolean;

  /** Callback when avatar is uploaded */
  onAvatarUpload?: (file: File) => void | Promise<void>;

  /** Callback when avatar is removed */
  onAvatarRemove?: () => void;

  /** Whether to show unsaved changes indicator */
  hasUnsavedChanges?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_USER_PROFILE_EDITOR_DEFAULTS: Partial<PlUserProfileEditorProps> = {
  preset: 'form',
  allowPasswordChange: true,
  allowAvatarUpload: true,
  hasUnsavedChanges: false,
  departments: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Support'],
  timezones: [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  ],
  dateFormats: [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  ],
};
