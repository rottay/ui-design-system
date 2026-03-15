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
 *   <Skeleton.Avatar />  ← Circular/square avatar placeholder
 *   <Skeleton.Text />    ← Multi-line text placeholder
 *   <Skeleton.Button />  ← Button shape placeholder
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

export { SkeletonCard } from './Card';
export type { SkeletonCardProps } from './Card';

export { SkeletonListItem } from './ListItem';
export type { SkeletonListItemProps } from './ListItem';

export { SkeletonTable } from './Table';
export type { SkeletonTableProps } from './Table';

export { SkeletonForm } from './FormSkeleton';
export type { SkeletonFormProps } from './FormSkeleton';

export { SkeletonParagraph } from './Paragraph';
export type { SkeletonParagraphProps } from './Paragraph';
