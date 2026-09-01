'use client';

/**
 * @fileoverview Rustic (Vanilla/CSS-variable) engine for the UserProfileCard pattern.
 * Zero external UI library dependency -- renders with plain HTML elements, a token
 * skin, and inline layout values. Supports "full" (centered card)
 * and "compact" (horizontal row) variants, with configurable size tiers (sm/md/lg).
 *
 * @example
 * <RusticUserProfileCard
 *   user={{ name: 'Jane Doe', role: 'Engineer', department: 'Platform', status: 'active' }}
 *   size="lg"
 *   actions={[{ key: 'edit', label: 'Edit', variant: 'primary', onClick: () => {} }]}
 * />
 */

import React, { type CSSProperties } from 'react';
import type { UserProfileCardProps } from '../../contracts';

// Pixel dimensions per size tier. Avatar, typography, padding, and button
// padding scale together so each tier feels proportional.
const sizeMap = {
  sm: { avatar: 36, titleSize: 13, descSize: 11, padding: 12, btnPad: '4px 10px' },
  md: { avatar: 56, titleSize: 16, descSize: 13, padding: 20, btnPad: '6px 16px' },
  lg: { avatar: 80, titleSize: 20, descSize: 14, padding: 28, btnPad: '8px 20px' },
};

// Base card container layout.
const cardStyle: CSSProperties = {
  overflow: 'hidden',
};

// Dynamic avatar style: font-size scales at 35% of the avatar diameter
// to keep the fallback initial letter visually centered.
const avatarStyle = (size: number): CSSProperties => ({
  width: size,
  height: size,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: size * 0.35,
  fontWeight: 600,
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative' as const,
});

// Base button typography shared by all action button variants.
const btnBase: CSSProperties = {
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 'var(--ds-font-size-sm, 14px)',
};

/**
 * Rustic engine user profile card using native elements and CSS variables.
 * Mirrors Classic/Modern feature set (avatar, status dot, department/status tags,
 * action buttons) without any third-party UI dependency.
 *
 * @param props - {@link UserProfileCardProps}
 * @returns A styled div card (full) or flex row (compact).
 */
export default function RusticUserProfileCard(props: UserProfileCardProps) {
  const {
    user,
    actions = [],
    size = 'md',
    variant = 'full',
    online,
    onClick,
    headerExtra,
    loading,
    className,
    style,
  } = props;

  const s = sizeMap[size];
  const isOnline = online ?? (user.status === 'active');

  if (loading) {
    return (
      <div
        className={`ds-pattern-user-profile-card ds-engine-rustic ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-variant={variant}
        style={{ ...cardStyle, textAlign: 'center', padding: 48, ...style }}
      >
        <span className="ds-user-profile-card__loading-label" data-part="loading-label">Loading...</span>
      </div>
    );
  }

  const statusDot: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: size === 'sm' ? 8 : 12,
    height: size === 'sm' ? 8 : 12,
  };

  const renderAvatar = () => (
    <div data-part="avatar-container" style={{ position: 'relative', display: 'inline-block' }}>
      <div className="ds-user-profile-card__avatar" data-part="avatar" style={avatarStyle(s.avatar)}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="ds-user-profile-card__presence-dot" data-part="presence-dot" data-online={isOnline} style={statusDot} />
    </div>
  );

  const getBtnStyle = (): CSSProperties => ({ ...btnBase, padding: s.btnPad });

  if (variant === 'compact') {
    return (
      <div
        className={`ds-pattern-user-profile-card ds-engine-rustic ${className ?? ''}`}
        data-part="root"
        data-loading={false}
        data-variant={variant}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: s.padding,
          cursor: onClick ? 'pointer' : undefined,
          ...style,
        }}
        onClick={onClick}
      >
        {renderAvatar()}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div data-part="name" style={{ fontWeight: 600, fontSize: s.titleSize, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </div>
          <div className="ds-user-profile-card__role" data-part="role" style={{ fontSize: s.descSize }}>
            {user.role}
          </div>
        </div>
        {headerExtra}
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-user-profile-card ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-variant={variant}
      style={{
        ...cardStyle,
        textAlign: 'center',
        padding: s.padding,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'box-shadow 0.15s',
        ...style,
      }}
      onClick={onClick}
    >
      {renderAvatar()}

      <div style={{ marginTop: 12, marginBottom: 4 }}>
        <div data-part="name" style={{ fontWeight: 600, fontSize: s.titleSize }}>{user.name}</div>
        <div className="ds-user-profile-card__role" data-part="role" style={{ fontSize: s.descSize, marginTop: 2 }}>{user.role}</div>
      </div>

      {user.department && (
        <div className="ds-user-profile-card__department-badge" data-part="department-badge" style={{
          display: 'inline-block',
          padding: '2px 10px',
          fontSize: 'var(--ds-font-size-xs, 12px)',
          fontWeight: 500,
          marginBottom: 8,
        }}>
          {user.department}
        </div>
      )}

      {user.email && (
        <div className="ds-user-profile-card__email" data-part="email" style={{ fontSize: 'var(--ds-font-size-xs, 12px)', marginBottom: 8 }}>
          {user.email}
        </div>
      )}

      {user.status && (
        <div className="ds-user-profile-card__status-badge" data-part="status-badge" data-status={user.status} style={{
          display: 'inline-block',
          padding: '2px 10px',
          fontSize: 'var(--ds-font-size-xs, 12px)',
          fontWeight: 500,
          marginBottom: 12,
        }}>
          {user.status}
        </div>
      )}

      {headerExtra && <div style={{ marginBottom: 12 }}>{headerExtra}</div>}

      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          {actions.map(action => (
            <button
              key={action.key}
              className="ds-user-profile-card__action-button"
              data-part="action-button"
              data-variant={action.variant ?? 'default'}
              data-disabled={!!action.disabled}
              style={{
                ...getBtnStyle(),
                opacity: action.disabled ? 0.5 : 1,
                cursor: action.disabled ? 'not-allowed' : 'pointer',
              }}
              disabled={action.disabled}
              onClick={(e) => { e.stopPropagation(); action.onClick(); }}
            >
              {action.icon && <span style={{ marginRight: 4 }}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
