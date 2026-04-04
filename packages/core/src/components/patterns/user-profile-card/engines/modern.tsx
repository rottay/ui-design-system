'use client';

/**
 * @fileoverview Modern (token-driven) engine for the UserProfileCard pattern.
 * Renders a DS token card with avatar, online/offline presence indicator, name,
 * role, department badge, status badge, and action buttons. Two layout variants:
 * "full" (centered card) and "compact" (horizontal flex row for lists/sidebars).
 *
 * @example
 * <ModernUserProfileCard
 *   user={{ name: 'Jane Doe', role: 'Engineer', status: 'active', avatar: '/avatars/jane.png' }}
 *   size="md"
 *   variant="full"
 *   onClick={() => openProfile('jane')}
 * />
 */

import React from 'react';
import type { UserProfileCardProps } from '../UserProfileCard.types';
import { panelCardStyle, pillBadgeSmStyle, spinnerStyle } from '../../../shared/modern-styles';

// DS token badge styles per status, providing a human-readable label.
const statusBadgeStyles: Record<string, React.CSSProperties> = {
  active: { background: 'color-mix(in srgb, var(--ds-color-success) 15%, transparent)', color: 'var(--ds-color-success)' },
  away: { background: 'color-mix(in srgb, var(--ds-color-warning) 15%, transparent)', color: 'var(--ds-color-warning)' },
  busy: { background: 'color-mix(in srgb, var(--ds-color-error) 15%, transparent)', color: 'var(--ds-color-error)' },
  offline: { background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-secondary)' },
};

// Tailwind class bundles per size tier, keeping avatar, text, and button scale
// consistent without per-element overrides.
/** Button size tokens per tier */
const btnSizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: 24, padding: '0 8px', fontSize: 12 },
  md: { height: 32, padding: '0 12px', fontSize: 13 },
  lg: { height: 36, padding: '0 16px', fontSize: 14 },
};

const sizeClasses = {
  sm: { avatar: 'w-10 h-10', title: 'text-sm', desc: 'text-xs' },
  md: { avatar: 'w-14 h-14', title: 'text-base', desc: 'text-sm' },
  lg: { avatar: 'w-20 h-20', title: 'text-xl', desc: 'text-base' },
};

/**
 * Modern engine user profile card built on DS token inline styles and shared
 * modern-styles helpers. Two layout variants: "full" (centered card body) and
 * "compact" (horizontal row). Online presence is shown via a positioned dot
 * indicator.
 *
 * @param props - {@link UserProfileCardProps}
 * @returns A token-styled card (full) or a flex container (compact).
 */
export default function ModernUserProfileCard(props: UserProfileCardProps) {
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

  const s = sizeClasses[size];
  // Default to online when user.status is 'active' unless explicitly overridden.
  const isOnline = online ?? (user.status === 'active');

  if (loading) {
    return (
      <div className={className ?? ''} style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' as const }}>
          <span style={spinnerStyle(24)} />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ds-pattern-user-profile-card ds-engine-modern ${onClick ? 'cursor-pointer' : ''} ${className ?? ''}`}
        style={style}
        onClick={onClick}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <div className={`${s.avatar} rounded-full`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="flex items-center justify-center w-full h-full" style={{ background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-primary)' }}>
                <span className={s.desc}>{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--ds-surface-card)', background: isOnline ? 'var(--ds-color-success)' : 'var(--ds-color-text-secondary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold ${s.title} truncate`}>{user.name}</div>
          <div className={`${s.desc} opacity-50`}>{user.role}</div>
        </div>
        {headerExtra}
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-user-profile-card ds-engine-modern ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className ?? ''}`}
      style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}
      onClick={onClick}
    >
      <div className="items-center text-center" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <div className={`${s.avatar} rounded-full`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="flex items-center justify-center w-full h-full" style={{ background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-primary)' }}>
                <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--ds-surface-card)', background: isOnline ? 'var(--ds-color-success)' : 'var(--ds-color-text-secondary)' }} />
        </div>

        <div className="mt-2">
          <h3 className={`font-semibold ${s.title}`}>{user.name}</h3>
          <p className={`${s.desc} opacity-50`}>{user.role}</p>
        </div>

        {user.department && (
          <span className="mt-1" style={{ ...pillBadgeSmStyle, background: 'color-mix(in srgb, var(--ds-color-info) 15%, transparent)', color: 'var(--ds-color-info)' }}>{user.department}</span>
        )}

        {user.email && (
          <p className="text-xs opacity-40 mt-1">{user.email}</p>
        )}

        {user.status && (
          <span className="mt-1" style={{ ...pillBadgeSmStyle, ...statusBadgeStyles[user.status] }}>
            {user.status}
          </span>
        )}

        {headerExtra && <div className="mt-2">{headerExtra}</div>}

        {/* Action buttons using DS token inline styles. Variant mapping:
            primary -> primary fill, danger -> error fill, default -> ghost. */}
        {actions.length > 0 && (
          <div className="mt-3" style={{ display: 'flex', gap: 8 }}>
            {actions.map(action => (
              <button
                key={action.key}
                style={{
                  ...btnSizeStyles[size],
                  borderRadius: 'var(--ds-radius-md)',
                  border: 'none',
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  ...(action.variant === 'primary'
                    ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' }
                    : action.variant === 'danger'
                      ? { background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)' }
                      : { background: 'transparent', color: 'var(--ds-color-text-primary)' }),
                }}
                disabled={action.disabled}
                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
