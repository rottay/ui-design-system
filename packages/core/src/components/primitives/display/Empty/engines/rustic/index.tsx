/**
 * @fileoverview Empty Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS empty state with maximum accessibility.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free empty state using only
 * inline styles and semantic HTML elements.
 *
 * **Exported Components:**
 * - `RusticEmpty` - Main empty state component
 * - `DefaultImage` - Standard empty box SVG
 * - `SimpleImage` - Minimal SVG variant
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - Flexbox-based centering layout
 * - SVG images with neutral colors
 * - ARIA attributes for screen readers
 *
 * **Accessibility Features:**
 * - `role="status"` on container
 * - `aria-label` with description text
 * - `aria-hidden="true"` on decorative SVGs
 * - Semantic HTML structure
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility compliance
 * - SSR-safe implementation
 *
 * @example Basic Usage
 * ```tsx
 * import { Empty } from '@rottay/design-system';
 *
 * <Empty engine="rustic" />
 * ```
 *
 * @example With Custom Content
 * ```tsx
 * <Empty engine="rustic" description="Nothing here">
 *   <button>Create First Item</button>
 * </Empty>
 * ```
 *
 * @see {@link Empty} for the main component
 * @module Empty/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { EmptyProps } from '../../types';
import { EMPTY_DEFAULTS } from '../../types';
import { useTranslation } from '../../../../../../theme/i18n';

/**
 * Default SVG image for empty states.
 * Uses neutral colors suitable for both light and dark themes.
 *
 * @returns SVG element representing an empty box
 */
const DefaultImage: React.FC = () => (
  <svg
    width="64"
    height="41"
    viewBox="0 0 64 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(0 1)" fillRule="evenodd">
      <ellipse cx="32" cy="33" rx="32" ry="7" fill="var(--ds-color-bg-secondary)" />
      <g fillRule="nonzero" stroke="var(--ds-color-border-secondary)">
        <path
          d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
          fill="var(--ds-color-bg-secondary)"
        />
        <path
          d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
          fill="var(--ds-color-bg-secondary)"
        />
      </g>
    </g>
  </svg>
);

/**
 * Simple SVG image variant with minimal visual weight.
 * Suitable for inline or secondary empty states.
 *
 * @returns SVG element with simplified styling
 */
const SimpleImage: React.FC = () => (
  <svg
    width="64"
    height="41"
    viewBox="0 0 64 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
      <ellipse cx="32" cy="33" rx="32" ry="7" fill="var(--ds-color-bg-tertiary)" />
      <g stroke="var(--ds-color-border-secondary)" strokeWidth="1">
        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" />
      </g>
    </g>
  </svg>
);

/**
 * Rustic implementation of the Empty component.
 *
 * Uses pure HTML and CSS for:
 * - Zero external dependencies
 * - Maximum accessibility (ARIA attributes, semantic HTML)
 * - Full control over styling
 * - Predictable behavior across environments
 * - Server-side rendering compatibility
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RusticEmpty />
 *
 * // With custom description and styling
 * <RusticEmpty
 *   description="No search results"
 *   style={{ padding: '40px' }}
 * />
 *
 * // With custom image
 * <RusticEmpty
 *   image={<MyCustomIcon />}
 *   description="Custom empty state"
 * />
 *
 * // With action
 * <RusticEmpty description="Nothing here yet">
 *   <button>Create First Item</button>
 * </RusticEmpty>
 * ```
 *
 * @param props - Empty component props
 * @param ref - Forwarded ref to the container element
 * @returns Pure HTML/CSS empty state component
 */
const RusticEmpty = forwardRef<HTMLDivElement, EmptyProps>(
  (props, ref) => {
    const { t } = useTranslation('components');

    const {
      image = EMPTY_DEFAULTS.image,
      imageStyle,
      description,
      children,
      className,
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

    /** Container styles for the empty state */
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--ds-empty-padding, 32px 8px)',
      textAlign: 'center',
      ...style,
    };

    /** Image container styles */
    const imageContainerStyle: React.CSSProperties = {
      marginBottom: '16px',
      lineHeight: 1,
      ...imageStyle,
    };

    /** Description text styles */
    const descriptionStyle: React.CSSProperties = {
      margin: 0,
      marginBottom: children ? '16px' : 0,
      color: 'var(--ds-empty-description-color, var(--ds-color-text-tertiary, rgba(0, 0, 0, 0.25)))',
      fontSize: 'var(--ds-empty-description-font-size, 14px)',
      lineHeight: '1.5',
    };

    /** Footer container styles for actions */
    const footerStyle: React.CSSProperties = {
      marginTop: '8px',
    };

    return (
      <div
        ref={ref}
        className={`rottay-empty rottay-empty--rustic ${className || ''}`}
        style={containerStyle}
        role="status"
        aria-label={typeof displayDescription === 'string' ? displayDescription : 'Empty state'}
      >
        {image && (
          <div className="rottay-empty__image" style={imageContainerStyle}>
            {renderImage()}
          </div>
        )}

        {displayDescription && (
          <p className="rottay-empty__description" style={descriptionStyle}>
            {displayDescription}
          </p>
        )}

        {children && (
          <div className="rottay-empty__footer" style={footerStyle}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

RusticEmpty.displayName = 'RusticEmpty';

export default RusticEmpty;
