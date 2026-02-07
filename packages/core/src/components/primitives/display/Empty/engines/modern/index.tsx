/**
 * @fileoverview Empty Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based empty state with theme-aware colors.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI classes with Tailwind utilities
 * for a lightweight, theme-integrated empty state.
 *
 * **Exported Components:**
 * - `ModernEmpty` - Main empty state component
 * - `DefaultImage` - Theme-aware SVG illustration
 * - `SimpleImage` - Minimal SVG variant
 *
 * **Implementation Details:**
 * - Custom SVGs with `currentColor` for theming
 * - DaisyUI semantic color classes
 * - Tailwind flex utilities for layout
 * - ARIA role="status" for accessibility
 *
 * **Class Mappings:**
 * - `flex flex-col items-center` - Container layout
 * - `text-base-content/50` - Description color
 * - `text-base-content/20` - Image color
 * - `py-8` - Vertical padding
 *
 * **Advantages:**
 * - Lightweight CSS-only styling
 * - Automatic theme adaptation
 * - DaisyUI semantic colors
 * - Responsive-friendly
 *
 * @example Basic Usage
 * ```tsx
 * import { Empty } from '@rottay/design-system';
 *
 * <Empty engine="modern" />
 * ```
 *
 * @see {@link Empty} for the main component
 * @see {@link https://daisyui.com/} DaisyUI
 * @module Empty/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { EmptyProps } from '../../types';
import { EMPTY_DEFAULTS } from '../../types';
import { useTranslation } from '../../../../../../theme/i18n';

/**
 * Default SVG image using DaisyUI color tokens.
 * Displays an empty box illustration that adapts to the theme.
 *
 * @returns SVG element with theme-aware colors
 */
const DefaultImage: React.FC = () => (
  <svg
    className="w-24 h-24 text-base-content/20"
    viewBox="0 0 64 41"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
      <ellipse cx="32" cy="33" rx="32" ry="7" fill="currentColor" opacity="0.3" />
      <g fillRule="nonzero" stroke="currentColor" strokeWidth="1.5">
        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
        <path
          d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
          fill="currentColor"
          opacity="0.2"
        />
      </g>
    </g>
  </svg>
);

/**
 * Simple SVG image variant with minimal styling.
 * A more subtle version for less prominent empty states.
 *
 * @returns SVG element with reduced visual weight
 */
const SimpleImage: React.FC = () => (
  <svg
    className="w-16 h-10 text-base-content/15"
    viewBox="0 0 64 41"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(0 1)" fillRule="evenodd">
      <ellipse cx="32" cy="33" rx="32" ry="7" fill="currentColor" opacity="0.2" />
      <g strokeWidth="1">
        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" />
      </g>
    </g>
  </svg>
);

/**
 * Modern implementation of the Empty component.
 *
 * Uses DaisyUI and Tailwind CSS utilities for:
 * - Lightweight bundle size
 * - Theme-aware colors via DaisyUI semantic classes
 * - Responsive-friendly spacing
 * - Easy customization via className prop
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ModernEmpty />
 *
 * // With custom description
 * <ModernEmpty description="Your cart is empty" />
 *
 * // With action button
 * <ModernEmpty description="No items found">
 *   <button className="btn btn-primary">Add Item</button>
 * </ModernEmpty>
 * ```
 *
 * @param props - Empty component props
 * @param ref - Forwarded ref to the container element
 * @returns Tailwind-styled empty state component
 */
const ModernEmpty = forwardRef<HTMLDivElement, EmptyProps>(
  (props, ref) => {
    const { t } = useTranslation('components');

    const {
      image = EMPTY_DEFAULTS.image,
      imageStyle,
      description,
      children,
      className = '',
      style,
    } = props;

    // Use translation as default, allow prop override
    const displayDescription = description ?? t('empty.description');

    /**
     * Renders the appropriate image based on the image prop.
     */
    const renderImage = () => {
      if (image === 'default') {
        return <DefaultImage />;
      }
      if (image === 'simple') {
        return <SimpleImage />;
      }
      return image;
    };

    return (
      <div
        ref={ref}
        className={`rottay-empty rottay-empty--modern flex flex-col items-center justify-center py-8 ${className}`}
        style={style}
        role="status"
        aria-label={typeof displayDescription === 'string' ? displayDescription : 'Empty state'}
      >
        {image && (
          <div className="mb-4" style={imageStyle}>
            {renderImage()}
          </div>
        )}

        {displayDescription && (
          <p className="text-base-content/50 text-sm mb-4 text-center">
            {displayDescription}
          </p>
        )}

        {children && (
          <div className="rottay-empty__footer">
            {children}
          </div>
        )}
      </div>
    );
  }
);

ModernEmpty.displayName = 'ModernEmpty';

export default ModernEmpty;
