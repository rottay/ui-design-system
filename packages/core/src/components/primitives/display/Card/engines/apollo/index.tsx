/**
 * Card - Apollo Engine (Pure HTML/CSS)
 */

'use client';

import React, { useState } from 'react';
import type { CardProps } from '../../types';
import { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP } from '../../types';

export default function ApolloCard(props: CardProps): React.ReactElement {
  const {
    children,
    title,
    description,
    cover,
    coverPosition = 'top',
    extra,
    actions,
    variant = CARD_DEFAULTS.variant,
    size: _size = CARD_DEFAULTS.size,
    hoverable = CARD_DEFAULTS.hoverable,
    clickable = CARD_DEFAULTS.clickable,
    loading = CARD_DEFAULTS.loading,
    bordered: _bordered = CARD_DEFAULTS.bordered,
    shadowed: _shadowed,
    radius = CARD_DEFAULTS.radius,
    padding = CARD_DEFAULTS.padding,
    divider,
    backgroundColor,
    onClick,
    className = '',
    style,
  } = props;

  const [isHovered, setIsHovered] = useState(false);

  const paddingValue = PADDING_MAP[padding] || PADDING_MAP.md;
  const borderRadiusValue = RADIUS_MAP[radius] || RADIUS_MAP.md;

  // Variant-specific styles
  const variantStyles: Record<string, React.CSSProperties> = {
    elevated: {
      backgroundColor: backgroundColor || '#fff',
      border: 'none',
      boxShadow: isHovered && hoverable ? SHADOW_MAP.lg : SHADOW_MAP.md,
    },
    outlined: {
      backgroundColor: backgroundColor || '#fff',
      border: '1px solid var(--color-neutral-200, #e5e5e5)',
      boxShadow: 'none',
    },
    filled: {
      backgroundColor: backgroundColor || 'var(--color-neutral-100, #f5f5f5)',
      border: 'none',
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
    },
  };

  // Card container style
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: borderRadiusValue,
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
    cursor: clickable || onClick ? 'pointer' : undefined,
    opacity: loading ? 0.7 : 1,
    pointerEvents: loading ? 'none' : 'auto',
    ...variantStyles[variant],
    ...style,
  };

  // Header style
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: paddingValue,
    borderBottom: divider ? '1px solid var(--color-neutral-200, #e5e5e5)' : 'none',
  };

  // Cover image style
  const coverStyle: React.CSSProperties = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  };

  // Actions style
  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: paddingValue,
    borderTop: '1px solid var(--color-neutral-200, #e5e5e5)',
  };

  // Loading overlay
  const loadingOverlay = loading && (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e0e0e0',
          borderTopColor: '#1890ff',
          borderRadius: '50%',
          animation: 'rottay-apollo-card-spin 1s linear infinite',
        }}
      />
    </div>
  );

  return (
    <div
      className={`rottay-card rottay-card--apollo ${className}`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
    >
      {loadingOverlay}

      {/* Cover image at top */}
      {cover && coverPosition === 'top' && (
        <img
          src={cover}
          alt={typeof title === 'string' ? title : 'Card cover'}
          style={coverStyle}
        />
      )}

      {/* Header with title, description, and extra */}
      {(title || description || extra) && (
        <div style={headerStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: description ? '4px' : 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--color-neutral-500, #8c8c8c)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {description}
              </div>
            )}
          </div>
          {extra && <div style={{ flexShrink: 0, marginLeft: '12px' }}>{extra}</div>}
        </div>
      )}

      {/* Main content */}
      <div style={{ padding: paddingValue, flex: 1 }}>{children}</div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div style={actionsStyle}>
          {actions.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </div>
      )}

      {/* Cover image at bottom */}
      {cover && coverPosition === 'bottom' && (
        <img
          src={cover}
          alt={typeof title === 'string' ? title : 'Card cover'}
          style={coverStyle}
        />
      )}

      {/* Keyframes for loading spinner */}
      <style>{`
        @keyframes rottay-apollo-card-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

ApolloCard.displayName = 'ApolloCard';
