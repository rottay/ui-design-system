/**
 * @fileoverview Image Compound Components - Rottay Design System
 * @description Compound components for enhanced Image functionality.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports compound components that extend Image functionality:
 *
 * **ImageFallback:**
 * Custom fallback content displayed when image fails to load.
 *
 * **ImageSkeleton:**
 * Custom loading placeholder displayed while image loads.
 *
 * @example Custom Fallback
 * ```tsx
 * <Image src="/photo.jpg" alt="Photo">
 *   <Image.Fallback>
 *     <Icon name="image-off" />
 *     <span>Image not available</span>
 *   </Image.Fallback>
 * </Image>
 * ```
 *
 * @example Custom Skeleton
 * ```tsx
 * <Image src="/photo.jpg" alt="Photo">
 *   <Image.Skeleton animate>
 *     <Spinner />
 *   </Image.Skeleton>
 * </Image>
 * ```
 *
 * @see {@link Image} for the main component
 * @module ImageCompound
 * @category Display
 * @package @rottay/design-system
 */

export { ImageFallback } from './Fallback';
export { ImageSkeleton } from './Skeleton';
