'use client';

/**
 * @fileoverview EmptyState -- Rustic engine (Vanilla / CSS variables).
 * Centered empty-state using an engine skin for paint and inline layout metrics.
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
import type { EmptyStateProps } from '../../contracts';

/** Pixel-based size presets -- includes padding, icon, text, and button dimensions */
const sizeDefs = {
  sm: { padding: 24, iconSize: 48, titleSize: 14, descSize: 12, btnPadding: '6px 16px' },
  md: { padding: 48, iconSize: 64, titleSize: 18, descSize: 14, btnPadding: '8px 24px' },
  lg: { padding: 64, iconSize: 96, titleSize: 24, descSize: 16, btnPadding: '12px 32px' },
};

/**
 * Rustic (Vanilla CSS) implementation of the EmptyState pattern.
 * Paint references --ds-* tokens in the engine skin, preserving tenant-theme
 * portability without any CSS framework.
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
      <div
        className={`ds-pattern-empty-state ds-engine-rustic ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        style={containerStyle}
      >
        <span className="ds-empty-state__loading-label" data-part="loading-label">Loading...</span>
      </div>
    );
  }

  /** Shared action layout metrics. */
  const btnBase: CSSProperties = {
    padding: s.btnPadding,
    fontSize: 'var(--ds-font-size-sm, 14px)',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.15s, border-color 0.15s',
  };

  /** Primary action layout. */
  const primaryBtn: CSSProperties = {
    ...btnBase,
  };

  /** Default action layout. */
  const defaultBtn: CSSProperties = {
    ...btnBase,
  };

  return (
    <div
      className={`ds-pattern-empty-state ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      style={containerStyle}
    >
      {/* Visual hierarchy: image > custom icon > nothing (no default fallback in Rustic) */}
      {image ? (
        <img data-part="image" src={image} alt={title} style={{ height: s.iconSize, objectFit: 'contain', marginBottom: 16 }} />
      ) : icon ? (
        <div data-part="icon" style={{ fontSize: s.iconSize, lineHeight: 1, marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      ) : null}
      {/* Title rendered with bold weight; the engine skin supplies its tokenized color */}
      <div className="ds-empty-state__title" data-part="title" style={{ fontSize: s.titleSize, fontWeight: 600, marginBottom: 8 }}>
        {title}
      </div>
      {description && (
        <div className="ds-empty-state__description" data-part="description" style={{ fontSize: s.descSize, marginBottom: 16, maxWidth: 400 }}>
          {description}
        </div>
      )}
      {/* Action buttons row -- only mounts when at least one action exists */}
      {(action || secondaryAction) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {/* Button variant selects between primary/default style objects */}
          {action && (
            <button className="ds-empty-state__action" data-part="action" data-variant={action.variant ?? 'default'} style={action.variant === 'primary' ? primaryBtn : defaultBtn} onClick={action.onClick}>
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button className="ds-empty-state__secondary-action" data-part="secondary-action" data-variant="default" style={defaultBtn} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
