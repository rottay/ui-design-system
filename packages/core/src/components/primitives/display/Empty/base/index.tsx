/**
 * Empty Component - Base Implementation
 *
 * This is the base Empty component using CSS variables from design tokens.
 * It provides a consistent foundation that can be extended by engine-specific
 * implementations (Titan, Hermes, Apollo).
 *
 * The component displays a placeholder with an optional image and description
 * when there is no data to display.
 *
 * @module Empty/base
 * @category Display
 */

'use client';

import React, { forwardRef } from 'react';
import type { EmptyProps } from '../types';
import { EMPTY_DEFAULTS } from '../types';

/**
 * Default SVG image displayed when no custom image is provided.
 * This is a standard empty box illustration commonly used in data tables,
 * search results, and other empty states.
 *
 * @returns SVG element representing an empty state
 */
const DefaultImage: React.FC = () => (
  <svg
    className="rottay-empty__image-default"
    width="64"
    height="41"
    viewBox="0 0 64 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(0 1)" fillRule="evenodd">
      <ellipse
        cx="32"
        cy="33"
        rx="32"
        ry="7"
        fill="var(--empty-image-shadow-color, #f5f5f5)"
      />
      <g fillRule="nonzero" stroke="var(--empty-image-stroke-color, #d9d9d9)">
        <path
          d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
          fill="var(--empty-image-fill-color, #fafafa)"
        />
        <path
          d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
          fill="var(--empty-image-fill-color, #fafafa)"
        />
      </g>
    </g>
  </svg>
);

/**
 * Simple SVG image for minimal empty states.
 * A simplified version of the default image with less visual weight.
 *
 * @returns SVG element representing a simple empty state
 */
const SimpleImage: React.FC = () => (
  <svg
    className="rottay-empty__image-simple"
    width="64"
    height="41"
    viewBox="0 0 64 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
      <ellipse
        cx="32"
        cy="33"
        rx="32"
        ry="7"
        fill="var(--empty-image-shadow-color, #f5f5f5)"
      />
      <g stroke="var(--empty-image-stroke-color, #d9d9d9)" strokeWidth="1">
        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" />
      </g>
    </g>
  </svg>
);

/**
 * Base Empty component using CSS variables for theming.
 *
 * This component serves as the foundation for all engine implementations.
 * It uses CSS custom properties (variables) to allow consistent theming
 * across the design system.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BaseEmpty />
 *
 * // With custom description
 * <BaseEmpty description="No results found" />
 *
 * // With action button
 * <BaseEmpty description="No items yet">
 *   <Button>Add Item</Button>
 * </BaseEmpty>
 *
 * // With custom image
 * <BaseEmpty image={<CustomIcon />} description="Custom empty state" />
 * ```
 *
 * @param props - Component props
 * @param ref - Forwarded ref to the container div
 * @returns React element representing an empty state
 */
export const BaseEmpty = forwardRef<HTMLDivElement, EmptyProps>(
  (props, ref) => {
    const {
      image = EMPTY_DEFAULTS.image,
      imageStyle,
      description = EMPTY_DEFAULTS.description,
      children,
      className = '',
      style = {},
    } = props;

    // Determine which image to render
    const renderImage = () => {
      if (image === 'default') {
        return <DefaultImage />;
      }
      if (image === 'simple') {
        return <SimpleImage />;
      }
      return image;
    };

    // Build CSS variables for theming
    const emptyVars: React.CSSProperties = {
      '--empty-padding': 'var(--empty-container-padding, 32px 8px)',
      '--empty-description-color': 'var(--empty-text-color, rgba(0, 0, 0, 0.25))',
      '--empty-description-font-size': 'var(--empty-font-size, 14px)',
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...emptyVars,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--empty-padding)',
      textAlign: 'center',
      ...style,
    };

    // Image container styles
    const imageContainerStyle: React.CSSProperties = {
      marginBottom: 'var(--empty-image-margin-bottom, 16px)',
      lineHeight: 1,
      ...imageStyle,
    };

    // Description styles
    const descriptionStyle: React.CSSProperties = {
      margin: 0,
      marginBottom: children ? 'var(--empty-description-margin-bottom, 16px)' : 0,
      color: 'var(--empty-description-color)',
      fontSize: 'var(--empty-description-font-size)',
    };

    return (
      <div
        ref={ref}
        className={`rottay-empty ${className}`}
        style={containerStyle}
        role="status"
        aria-label={typeof description === 'string' ? description : 'Empty state'}
      >
        {image && (
          <div className="rottay-empty__image" style={imageContainerStyle}>
            {renderImage()}
          </div>
        )}

        {description && (
          <p className="rottay-empty__description" style={descriptionStyle}>
            {description}
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

BaseEmpty.displayName = 'BaseEmpty';

export { DefaultImage, SimpleImage };
