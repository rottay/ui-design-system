'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the UserProfileCard pattern.
 * Renders a DaisyUI card with avatar, online/offline presence indicator, name,
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

// DaisyUI avatar presence class. "online" shows a green ring; "offline" shows gray.
// Note: DaisyUI does not differentiate "away" and "busy" -- both map to "offline"
// visually, but the status badge below provides the semantic distinction.
const statusClasses: Record<string, string> = {
  active: 'online',
  away: 'offline',
  busy: 'offline',
  offline: 'offline',
};

// DaisyUI badge color class per status, providing a human-readable label.
const statusBadgeClasses: Record<string, string> = {
  active: 'badge-success',
  away: 'badge-warning',
  busy: 'badge-error',
  offline: 'badge-ghost',
};

// Tailwind class bundles per size tier, keeping avatar, text, and button scale
// consistent without per-element overrides.
const sizeClasses = {
  sm: { avatar: 'w-10 h-10', title: 'text-sm', desc: 'text-xs', btn: 'btn-xs' },
  md: { avatar: 'w-14 h-14', title: 'text-base', desc: 'text-sm', btn: 'btn-sm' },
  lg: { avatar: 'w-20 h-20', title: 'text-xl', desc: 'text-base', btn: 'btn-md' },
};

/**
 * Modern engine user profile card built on DaisyUI card/avatar/badge components.
 * Two layout variants: "full" (centered card body) and "compact" (horizontal row).
 * Online presence is shown via DaisyUI's avatar online/offline indicator ring.
 *
 * @param props - {@link UserProfileCardProps}
 * @returns A DaisyUI card (full) or a flex container (compact).
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
      <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
        <div className="card-body items-center text-center">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ds-pattern-user-profile-card ds-engine-modern ${onClick ? 'cursor-pointer hover:bg-base-200' : ''} ${className ?? ''}`}
        style={style}
        onClick={onClick}
      >
        <div className={`avatar ${isOnline ? 'online' : 'offline'}`}>
          <div className={`${s.avatar} rounded-full`}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="bg-neutral text-neutral-content flex items-center justify-center w-full h-full">
                <span className={s.desc}>{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
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
      className={`card bg-base-100 shadow-sm ds-pattern-user-profile-card ds-engine-modern ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className ?? ''}`}
      style={style}
      onClick={onClick}
    >
      <div className="card-body items-center text-center p-6">
        <div className={`avatar ${isOnline ? 'online' : 'offline'}`}>
          <div className={`${s.avatar} rounded-full`}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="bg-neutral text-neutral-content flex items-center justify-center w-full h-full">
                <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          <h3 className={`font-semibold ${s.title}`}>{user.name}</h3>
          <p className={`${s.desc} opacity-50`}>{user.role}</p>
        </div>

        {user.department && (
          <span className="badge badge-info badge-sm mt-1">{user.department}</span>
        )}

        {user.email && (
          <p className="text-xs opacity-40 mt-1">{user.email}</p>
        )}

        {user.status && (
          <span className={`badge ${statusBadgeClasses[user.status]} badge-sm mt-1`}>
            {user.status}
          </span>
        )}

        {headerExtra && <div className="mt-2">{headerExtra}</div>}

        {/* Action buttons using DaisyUI btn classes. Variant mapping:
            primary -> btn-primary, danger -> btn-error, default -> btn-ghost. */}
        {actions.length > 0 && (
          <div className="card-actions mt-3">
            {actions.map(action => (
              <button
                key={action.key}
                className={`btn ${s.btn} ${
                  action.variant === 'primary' ? 'btn-primary' :
                  action.variant === 'danger' ? 'btn-error' :
                  'btn-ghost'
                }`}
                disabled={action.disabled}
                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
