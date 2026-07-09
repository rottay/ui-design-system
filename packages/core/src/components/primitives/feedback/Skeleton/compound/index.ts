/**
 * @fileoverview Skeleton Compound Components - Rottay Design System
 * @description Re-exports all compound components for the Skeleton primitive.
 *
 * @remarks
 * This barrel file provides convenient access to all Skeleton compound
 * components. These components are designed to work together to create
 * structured loading placeholders with consistent styling and behavior.
 *
 * **Component Hierarchy:**
 * ```
 * <Skeleton>
 *   <Skeleton.Avatar />    ← Circular/square avatar placeholder
 *   <Skeleton.Text />      ← Multi-line text placeholder
 *   <Skeleton.Button />    ← Button shape placeholder
 *   <Skeleton.Card />      ← Card with optional image and text lines
 *   <Skeleton.ListItem />  ← List row with optional avatar
 *   <Skeleton.Table />     ← Table with header and body rows
 *   <Skeleton.Form />      ← Form with label + input pairs
 *   <Skeleton.Paragraph /> ← Text block with configurable last-line width
 * </Skeleton>
 * ```
 *
 * @example Full Skeleton Layout
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * function UserCardLoading() {
 *   return (
 *     <div className="user-card">
 *       <Skeleton.Avatar size="lg" shape="circle" />
 *       <div className="content">
 *         <Skeleton.Text lines={2} width="80%" />
 *         <Skeleton.Button size="sm" shape="round" />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Standalone Usage
 * ```tsx
 * import { SkeletonAvatar, SkeletonText, SkeletonButton } from '@rottay/design-system';
 *
 * // Direct imports for tree-shaking
 * <SkeletonAvatar size={48} shape="circle" />
 * <SkeletonText lines={3} />
 * <SkeletonButton size="lg" />
 * ```
 *
 * @module Skeleton/Compound
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Component Exports
// ============================================================================

export { SkeletonAvatar } from './Avatar';
export type { SkeletonAvatarProps } from './Avatar';

export { SkeletonText } from './Text';
export type { SkeletonTextProps } from './Text';

export { SkeletonButton } from './Button';
export type { SkeletonButtonProps } from './Button';

/**
 * Card skeleton with optional image area and text lines.
 * @see {@link SkeletonCardProps}
 */
export { SkeletonCard } from './Card';
export type { SkeletonCardProps } from './Card';

/**
 * List item skeleton with optional avatar and varied-width text lines.
 * @see {@link SkeletonListItemProps}
 */
export { SkeletonListItem } from './ListItem';
export type { SkeletonListItemProps } from './ListItem';

/**
 * Table skeleton with header row and configurable body rows/columns.
 * @see {@link SkeletonTableProps}
 */
export { SkeletonTable } from './Table';
export type { SkeletonTableProps } from './Table';

/**
 * Form skeleton with label + input pairs and submit button.
 * @see {@link SkeletonFormProps}
 */
export { SkeletonForm } from './FormSkeleton';
export type { SkeletonFormProps } from './FormSkeleton';

/**
 * Paragraph skeleton with configurable last-line width.
 * @see {@link SkeletonParagraphProps}
 */
export { SkeletonParagraph } from './Paragraph';
export type { SkeletonParagraphProps } from './Paragraph';

/**
 * Opacity-only crossfade between a skeleton placeholder and its real content.
 * @see {@link SkeletonTransitionProps}
 */
export { SkeletonTransition } from './Transition';
export type { SkeletonTransitionProps } from './Transition';
