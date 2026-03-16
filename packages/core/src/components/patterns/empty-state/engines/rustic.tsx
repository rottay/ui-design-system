'use client';

/**
 * @fileoverview EmptyState -- Rustic engine (Vanilla / CSS variables).
 * Centered empty-state using only inline styles with --ds-* design tokens.
 * No framework dependency. Supports icon, image, title, description,
 * and primary/secondary action buttons. Sizing is driven by pixel-based
 * presets (sm/md/lg) for padding, icon height, and font sizes.
 *
 * @example
 * <RusticEmptyState
 *   title="No results found"
 *   description="Try adjusting your search filters."
 *   action={{ label: 'Reset', onClick: reset, variant: 'primary' }}
 *   size="md"
 * />
 */

import React, { type CSSProperties } from 'react';
import type { EmptyStateProps } from '../EmptyState.types';

/** Pixel-based size presets -- includes padding, icon, text, and button dimensions */
const sizeDefs = {
  sm: { padding: 24, iconSize: 48, titleSize: 14, descSize: 12, btnPadding: '6px 16px' },
  md: { padding: 48, iconSize: 64, titleSize: 18, descSize: 14, btnPadding: '8px 24px' },
  lg: { padding: 64, iconSize: 96, titleSize: 24, descSize: 16, btnPadding: '12px 32px' },
};

/**
 * Rustic (Vanilla CSS) implementation of the EmptyState pattern.
 * All visual properties use inline styles referencing --ds-* tokens,
 * ensuring tenant-theme portability without any CSS framework.
 *
 * @param props - See {@link EmptyStateProps} for the full prop contract.
 * @returns The rendered empty state.
 */
export default function RusticEmptyState(props: EmptyStateProps) {
  const {
    icon,
    title,
    description,
    action,
    secondaryAction,
    image,
    size = 'md',
    loading,
    className,
    style,
  } = props;

  /* Resolve pixel-based size preset for padding, icon, text, and button dimensions */
  const s = sizeDefs[size];

  /* Flexbox column layout centers content both horizontally and vertically */
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: s.padding,
    ...style,
  };

  if (loading) {
    return (
      <div className={className} style={containerStyle}>
        <span style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</span>
      </div>
    );
  }

  /** Shared base button styles -- all action buttons inherit radius, padding, and transition */
  const btnBase: CSSProperties = {
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-md, 6px)',
    padding: s.btnPadding,
    fontSize: 'var(--ds-font-size-sm, 14px)',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.15s, border-color 0.15s',
  };

  /** Primary variant -- uses tenant primary color with contrast foreground */
  const primaryBtn: CSSProperties = {
    ...btnBase,
    background: 'var(--ds-color-primary)',
    color: 'var(--ds-color-primary-foreground, #fff)',
    borderColor: 'var(--ds-color-primary)',
  };

  /** Default variant -- neutral background with standard text color */
  const defaultBtn: CSSProperties = {
    ...btnBase,
    background: 'var(--ds-color-background)',
    color: 'var(--ds-color-text)',
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Visual hierarchy: image > custom icon > nothing (no default fallback in Rustic) */}
      {image ? (
        <img src={image} alt={title} style={{ height: s.iconSize, objectFit: 'contain', marginBottom: 16 }} />
      ) : icon ? (
        <div style={{ fontSize: s.iconSize, lineHeight: 1, marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      ) : null}
      {/* Title rendered with bold weight; color inherits from ds text token */}
      <div style={{ fontSize: s.titleSize, fontWeight: 600, color: 'var(--ds-color-text)', marginBottom: 8 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-muted)', marginBottom: 16, maxWidth: 400 }}>
          {description}
        </div>
      )}
      {/* Action buttons row -- only mounts when at least one action exists */}
      {(action || secondaryAction) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {/* Button variant selects between primary/default style objects */}
          {action && (
            <button style={action.variant === 'primary' ? primaryBtn : defaultBtn} onClick={action.onClick}>
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button style={defaultBtn} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
