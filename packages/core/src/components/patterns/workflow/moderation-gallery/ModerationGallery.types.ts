/**
 * @fileoverview Type definitions for the ModerationGallery pattern component.
 *
 * ModerationGallery renders a media moderation grid with status states,
 * engagement metrics, triage actions, and bulk review capabilities.
 *
 * @module Patterns/ModerationGallery/Types
 * @category Patterns
 * @package @rottay/design-system
 */

import type { PatternBaseProps } from '../../foundation/types';

/**
 * A single media item in the moderation gallery.
 */
export interface ModerationItem {
  /** Unique identifier for the media item. */
  id: string;
  /** URL of the media thumbnail image. */
  thumbnailUrl: string;
  /** Media content type. */
  type: 'image' | 'video';
  /** Current moderation status. */
  status: 'pending' | 'approved' | 'rejected';
  /** Engagement metric count (e.g., views, likes). */
  engagement?: number;
  /** Name or identifier of the user who uploaded the media. */
  uploadedBy: string;
  /** ISO 8601 timestamp of when the media was uploaded. */
  uploadedAt: string;
}

/**
 * Bulk action type for operating on multiple selected items.
 */
export type ModerationBulkAction = 'approve' | 'reject';

/**
 * Props for the ModerationGallery pattern component.
 *
 * Renders a grid of media cards with status overlay, action buttons
 * on hover, engagement metrics, and optional bulk selection.
 *
 * @example
 * ```tsx
 * <PatternModerationGallery
 *   items={[
 *     { id: '1', thumbnailUrl: '/img/photo1.jpg', type: 'image',
 *       status: 'pending', engagement: 142, uploadedBy: 'user42',
 *       uploadedAt: '2026-03-18T08:00:00Z' },
 *   ]}
 *   selectable
 *   onApprove={(id) => approve(id)}
 *   onReject={(id) => reject(id)}
 *   onBulkAction={(action, ids) => handleBulk(action, ids)}
 * />
 * ```
 */
export interface ModerationGalleryProps extends PatternBaseProps {
  /** Media items to display in the gallery grid. */
  items: ModerationItem[];
  /** Callback fired when a single item is approved. */
  onApprove?: (id: string) => void;
  /** Callback fired when a single item is rejected. */
  onReject?: (id: string) => void;
  /** Callback fired for bulk actions on selected items. */
  onBulkAction?: (action: ModerationBulkAction, ids: string[]) => void;
  /** When true, items display selection checkboxes for bulk operations. */
  selectable?: boolean;
  /** Message displayed when no items are available. */
  emptyMessage?: string;
}
