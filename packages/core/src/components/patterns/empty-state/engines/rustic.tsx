'use client';

/**
 * EmptyState - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { type CSSProperties } from 'react';
import type { EmptyStateProps } from '../EmptyState.types';

const sizeDefs = {
  sm: { padding: 24, iconSize: 48, titleSize: 14, descSize: 12, btnPadding: '6px 16px' },
  md: { padding: 48, iconSize: 64, titleSize: 18, descSize: 14, btnPadding: '8px 24px' },
  lg: { padding: 64, iconSize: 96, titleSize: 24, descSize: 16, btnPadding: '12px 32px' },
};

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

  const s = sizeDefs[size];

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

  const btnBase: CSSProperties = {
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-md, 6px)',
    padding: s.btnPadding,
    fontSize: 'var(--ds-font-size-sm, 14px)',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.15s, border-color 0.15s',
  };

  const primaryBtn: CSSProperties = {
    ...btnBase,
    background: 'var(--ds-color-primary)',
    color: 'var(--ds-color-primary-foreground, #fff)',
    borderColor: 'var(--ds-color-primary)',
  };

  const defaultBtn: CSSProperties = {
    ...btnBase,
    background: 'var(--ds-color-background)',
    color: 'var(--ds-color-text)',
  };

  return (
    <div className={className} style={containerStyle}>
      {image ? (
        <img src={image} alt={title} style={{ height: s.iconSize, objectFit: 'contain', marginBottom: 16 }} />
      ) : icon ? (
        <div style={{ fontSize: s.iconSize, lineHeight: 1, marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      ) : null}
      <div style={{ fontSize: s.titleSize, fontWeight: 600, color: 'var(--ds-color-text)', marginBottom: 8 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-muted)', marginBottom: 16, maxWidth: 400 }}>
          {description}
        </div>
      )}
      {(action || secondaryAction) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
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
