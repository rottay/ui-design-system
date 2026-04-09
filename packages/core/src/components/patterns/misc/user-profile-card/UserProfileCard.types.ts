/**
 * @fileoverview Type definitions for the UserProfileCard pattern. Defines
 * UserProfile (name, avatar, role, status), ProfileAction (action buttons),
 * and props controlling card size, variant, and online indicator.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Core data model for a user displayed inside the profile card.
 * Contains identity, organizational, and presence information.
 */
export interface UserProfile {
  /** Full display name of the user */
  name: string;
  /** URL to the user's avatar image */
  avatar?: string;
  /** Job title or role label (e.g. "Senior Engineer", "Admin") */
  role: string;
  /** Email address shown below the name */
  email?: string;
  /** Department or team the user belongs to */
  department?: string;
  /** Current availability status indicator */
  status?: 'active' | 'away' | 'busy' | 'offline';
}

/**
 * Describes a single action button rendered in the profile card's action area.
 * Typical actions include "Send Message", "Edit Profile", or "Remove User".
 */
export interface ProfileAction {
  /** Unique key used for list rendering and identification */
  key: string;
  /** Button label text */
  label: string;
  /** Optional icon rendered before the label */
  icon?: ReactNode;
  /** Click handler invoked when the action button is pressed */
  onClick: () => void;
  /** Visual style variant; "danger" is used for destructive actions */
  variant?: 'default' | 'primary' | 'danger';
  /** Whether the action button is disabled */
  disabled?: boolean;
}

/**
 * Props for the UserProfileCard pattern component.
 * Renders a compact or full-width card displaying user identity, status,
 * and contextual action buttons.
 *
 * @example
 * ```tsx
 * <UserProfileCard
 *   user={{ name: 'Jane Doe', role: 'Engineering Lead', status: 'active' }}
 *   actions={[
 *     { key: 'message', label: 'Message', onClick: () => openChat(user.id) },
 *     { key: 'remove', label: 'Remove', variant: 'danger', onClick: () => removeUser(user.id) },
 *   ]}
 *   size="md"
 *   variant="full"
 *   online
 * />
 * ```
 */
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
