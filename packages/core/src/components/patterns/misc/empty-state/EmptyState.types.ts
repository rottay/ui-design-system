/**
 * @fileoverview Type definitions for the EmptyState pattern. Defines props
 * for the placeholder UI shown when a list or page has no content, including
 * icon, title, description, primary/secondary actions, and size variants.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

/**
 * Props for the EmptyState pattern component.
 * Renders a centered placeholder UI when a list, table, or page has
 * no content to display. Supports an icon or illustration, descriptive
 * text, and up to two call-to-action buttons.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<InboxIcon />}
 *   title="No messages yet"
 *   description="When you receive messages, they will appear here."
 *   action={{ label: 'Compose', onClick: () => openCompose(), variant: 'primary' }}
 *   secondaryAction={{ label: 'Learn more', onClick: () => openDocs() }}
 *   size="md"
 * />
 * ```
 */
export interface EmptyStateProps extends PatternBaseProps {
  /** Icon element rendered above the title */
  icon?: ReactNode;
  /** Primary heading text describing the empty state */
  title: string;
  /** Supporting description text rendered below the title */
  description?: string;
  /** Primary call-to-action button configuration */
  action?: { label: string; onClick: () => void; variant?: 'primary' | 'default' };
  /** Optional secondary action button displayed below the primary action */
  secondaryAction?: { label: string; onClick: () => void };
  /** URL to an illustration image displayed instead of or alongside the icon */
  image?: string;
  /** Controls the overall padding and text size of the empty state */
  size?: 'sm' | 'md' | 'lg';
}
