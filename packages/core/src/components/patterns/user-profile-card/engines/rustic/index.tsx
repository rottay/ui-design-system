'use client';

/**
 * UserProfileCard - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { type CSSProperties } from 'react';
import type { UserProfileCardProps } from '../../types';

const statusColors: Record<string, string> = {
  active: 'var(--ds-color-success, #22c55e)',
  away: 'var(--ds-color-warning, #f59e0b)',
  busy: 'var(--ds-color-error, #ef4444)',
  offline: 'var(--ds-color-neutral-400, #9ca3af)',
};

const sizeMap = {
  sm: { avatar: 36, titleSize: 13, descSize: 11, padding: 12, btnPad: '4px 10px' },
  md: { avatar: 56, titleSize: 16, descSize: 13, padding: 20, btnPad: '6px 16px' },
  lg: { avatar: 80, titleSize: 20, descSize: 14, padding: 28, btnPad: '8px 20px' },
};

const cardStyle: CSSProperties = {
  border: '1px solid var(--ds-color-neutral-200, #e5e7eb)',
  borderRadius: 'var(--ds-radius-lg, 8px)',
  background: 'var(--ds-color-background, #fff)',
  overflow: 'hidden',
};

const avatarStyle = (size: number): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'var(--ds-color-neutral-200, #e5e7eb)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: size * 0.35,
  fontWeight: 600,
  color: 'var(--ds-color-text-muted)',
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative' as const,
});

const btnBase: CSSProperties = {
  borderRadius: 'var(--ds-radius-md, 6px)',
  border: '1px solid var(--ds-color-neutral-300, #d1d5db)',
  background: 'var(--ds-color-background, #fff)',
  color: 'var(--ds-color-text)',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 'var(--ds-font-size-sm, 13px)',
};

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
      <div className={className} style={{ ...cardStyle, textAlign: 'center', padding: 48, ...style }}>
        <span style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</span>
      </div>
    );
  }

  const statusDot: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: size === 'sm' ? 8 : 12,
    height: size === 'sm' ? 8 : 12,
    borderRadius: '50%',
    background: isOnline ? statusColors.active : statusColors.offline,
    border: '2px solid var(--ds-color-background, #fff)',
  };

  const renderAvatar = () => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={avatarStyle(s.avatar)}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>
      <div style={statusDot} />
    </div>
  );

  const getBtnStyle = (v?: string): CSSProperties => {
    if (v === 'primary') return { ...btnBase, padding: s.btnPad, background: 'var(--ds-color-primary)', color: 'var(--ds-color-primary-foreground, #fff)', borderColor: 'var(--ds-color-primary)' };
    if (v === 'danger') return { ...btnBase, padding: s.btnPad, color: 'var(--ds-color-error, #ef4444)', borderColor: 'var(--ds-color-error, #ef4444)' };
    return { ...btnBase, padding: s.btnPad };
  };

  if (variant === 'compact') {
    return (
      <div
        className={className}
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
          <div style={{ fontWeight: 600, fontSize: s.titleSize, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </div>
          <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-muted)' }}>
            {user.role}
          </div>
        </div>
        {headerExtra}
      </div>
    );
  }

  return (
    <div
      className={className}
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
        <div style={{ fontWeight: 600, fontSize: s.titleSize }}>{user.name}</div>
        <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-muted)', marginTop: 2 }}>{user.role}</div>
      </div>

      {user.department && (
        <div style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 'var(--ds-radius-sm, 4px)',
          background: 'var(--ds-color-primary-50, #eff6ff)',
          color: 'var(--ds-color-primary)',
          fontSize: 'var(--ds-font-size-xs, 11px)',
          fontWeight: 500,
          marginBottom: 8,
        }}>
          {user.department}
        </div>
      )}

      {user.email && (
        <div style={{ fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-muted)', marginBottom: 8 }}>
          {user.email}
        </div>
      )}

      {user.status && (
        <div style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 'var(--ds-radius-sm, 4px)',
          background: statusColors[user.status],
          color: '#fff',
          fontSize: 'var(--ds-font-size-xs, 11px)',
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
              style={{
                ...getBtnStyle(action.variant),
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
