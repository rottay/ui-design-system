/**
 * @fileoverview Rustic engine for the Empty component, using pure HTML/CSS.
 * Ships inline SVG illustrations coloured via CSS custom properties
 * (--ds-color-*), ensuring the component works without any CSS framework.
 *
 * @example
 * ```tsx
 * <Empty engine="rustic" description="Nothing to show">
 *   <Button>Add Item</Button>
 * </Empty>
 * ```
 */

'use client';

import React, { forwardRef } from 'react';
import type { EmptyProps } from '../Empty.types';
import { EMPTY_DEFAULTS } from '../Empty.types';
import { useTranslation } from '../../../../../i18n';

/** Detailed empty-box SVG illustration using CSS custom property colours for tenant theming. */
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

/** Minimal outline-only SVG illustration using tertiary background token for subtlety. */
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
 * Rustic (pure HTML/CSS) implementation of the Empty component.
 *
 * All styling is inline with CSS custom property fallbacks, ensuring it
 * renders correctly even without a loaded theme stylesheet. Uses
 * role="status" and aria-label for screen reader accessibility.
 *
 * @param props - Unified EmptyProps from the design system type contract
 * @param ref - Forwarded ref attached to the outer container div
 * @returns A dependency-free empty state element using only inline styles
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

    // i18n translation provides the default "No data" text; explicit prop overrides it
    const displayDescription = description ?? t('empty.description');

    // Resolve string shorthand to the matching inline SVG component, or pass through ReactNode
    const renderImage = () => {
      if (image === 'default') {
        return <DefaultImage />;
      }
      if (image === 'simple') {
        return <SimpleImage />;
      }
      return image;
    };

    // Vertically centred flex column; padding token has a generous default
    // so the empty state doesn't feel cramped inside cards or panels
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--ds-empty-padding, 32px 8px)',
      textAlign: 'center',
      ...style,
    };

    const imageContainerStyle: React.CSSProperties = {
      marginBottom: '16px',
      lineHeight: 1,
      ...imageStyle,
    };

    // Bottom margin only present when action children follow the description
    const descriptionStyle: React.CSSProperties = {
      margin: 0,
      marginBottom: children ? '16px' : 0,
      fontSize: 'var(--ds-empty-description-font-size, 14px)',
      lineHeight: '1.5',
    };

    const footerStyle: React.CSSProperties = {
      marginTop: '8px',
    };

    return (
      <div
        ref={ref}
        className={`rottay-empty rottay-empty--rustic ${className || ''}`}
        data-part="root"
        style={containerStyle}
        role="status"
        aria-label={typeof displayDescription === 'string' ? displayDescription : 'Empty state'}
      >
        {image && (
          <div className="rottay-empty__image" data-part="image" style={imageContainerStyle}>
            {renderImage()}
          </div>
        )}

        {displayDescription && (
          <p className="rottay-empty__description" data-part="description" style={descriptionStyle}>
            {displayDescription}
          </p>
        )}

        {children && (
          <div className="rottay-empty__footer" data-part="footer" style={footerStyle}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

RusticEmpty.displayName = 'RusticEmpty';

export default RusticEmpty;
