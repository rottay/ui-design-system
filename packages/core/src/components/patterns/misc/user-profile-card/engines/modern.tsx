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
import { panelCardStyle, pillBadgeSmStyle, spinnerStyle } from '../../../_internal/engines/modern/styles';

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
 * Modern engine user profile card built on the DS token skin and shared
 * modern-style helpers. Two layout variants: "full" (centered card body) and
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
      <div
        className={`ds-pattern-user-profile-card ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-variant={variant}
        style={{ ...panelCardStyle, ...style }}
      >
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' as const }}>
          <span data-part="spinner" style={spinnerStyle(24)} />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ds-pattern-user-profile-card ds-engine-modern ${onClick ? 'cursor-pointer' : ''} ${className ?? ''}`}
        data-part="root"
        data-loading={false}
        data-variant={variant}
        style={style}
        onClick={onClick}
      >
        <div data-part="avatar-container" style={{ position: 'relative', display: 'inline-flex' }}>
          <div data-part="avatar" className={`${s.avatar} rounded-full`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div data-part="avatar-fallback" className="ds-user-profile-card__avatar-fallback flex items-center justify-center w-full h-full">
                <span className={s.desc}>{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span className="ds-user-profile-card__presence-dot" data-part="presence-dot" data-online={isOnline} style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10 }} />
        </div>
        <div className="flex-1 min-w-0">
          <div data-part="name" className={`font-semibold ${s.title} truncate`}>{user.name}</div>
          <div data-part="role" className={`${s.desc} opacity-50`}>{user.role}</div>
        </div>
        {headerExtra}
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-user-profile-card ds-engine-modern ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-variant={variant}
      style={{ ...panelCardStyle, ...style }}
      onClick={onClick}
    >
      <div className="items-center text-center" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div data-part="avatar-container" style={{ position: 'relative', display: 'inline-flex' }}>
          <div data-part="avatar" className={`${s.avatar} rounded-full`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div data-part="avatar-fallback" className="ds-user-profile-card__avatar-fallback flex items-center justify-center w-full h-full">
                <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span className="ds-user-profile-card__presence-dot" data-part="presence-dot" data-online={isOnline} style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12 }} />
        </div>

        <div className="mt-2">
          <h3 data-part="name" className={`font-semibold ${s.title}`}>{user.name}</h3>
          <p data-part="role" className={`${s.desc} opacity-50`}>{user.role}</p>
        </div>

        {user.department && (
          <span data-part="department-badge" className="ds-user-profile-card__department-badge mt-1" style={pillBadgeSmStyle}>{user.department}</span>
        )}

        {user.email && (
          <p data-part="email" className="text-xs opacity-40 mt-1">{user.email}</p>
        )}

        {user.status && (
          <span data-part="status-badge" data-status={user.status} className="ds-user-profile-card__status-badge mt-1" style={pillBadgeSmStyle}>
            {user.status}
          </span>
        )}

        {headerExtra && <div className="mt-2">{headerExtra}</div>}

        {/* Action buttons use the shared size map. Variant mapping:
            primary -> primary fill, danger -> error fill, default -> ghost. */}
        {actions.length > 0 && (
          <div className="mt-3" style={{ display: 'flex', gap: 8 }}>
            {actions.map(action => (
              <button
                key={action.key}
                className="ds-user-profile-card__action-button"
                data-part="action-button"
                data-variant={action.variant ?? 'default'}
                data-disabled={!!action.disabled}
                style={{
                  ...btnSizeStyles[size],
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
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
