'use client';

/**
 * @fileoverview Modern (token-driven) engine for the UserProfileCard pattern.
 * Renders a DS token card with avatar, online/offline presence indicator, name,
 * role, department badge, status badge, and action buttons. Two layout variants:
 * "full" (centered card) and "compact" (horizontal flex row for lists/sidebars).
 *
 * GEOMETRY/PAINT OWNERSHIP: the modern skin owns layout, typography scale,
 * state paint (hover/active/disabled), presence-dot placement (logical
 * properties, so RTL mirrors) and motion. The engine only stamps the
 * data-part/data-size/data-variant/data-interactive contract. The shared
 * `panelCardStyle`/`pillBadgeSmStyle`/`spinnerStyle()` spreads stay inline on
 * purpose (P-78: they carry caller-overridable card chrome the skin module
 * deliberately does not redefine).
 *
 * ANATOMY LAW: the data-part set is pinned by the cross-capability contract
 * (avatar-container/avatar/avatar-fallback/presence-dot/name/role/
 * department-badge/email/status-badge/action-button/spinner) -- additive
 * attributes (data-size, data-interactive, data-part="loading-body") only,
 * never a rename. The certified Avatar primitive is NOT composed: the pinned
 * contract requires this family's own fallback + presence-dot anatomy, which
 * the Avatar engine neither stamps nor forwards (documented BLOCKED pin).
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
import type { UserProfileCardProps } from '../../contracts';
import { panelCardStyle, pillBadgeSmStyle, spinnerStyle } from '../../../../../foundation/engine-styles/modern';

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

  // Default to online when user.status is 'active' unless explicitly overridden.
  const isOnline = online ?? (user.status === 'active');

  if (loading) {
    return (
      <div
        className={`ds-pattern-user-profile-card ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-variant={variant}
        data-size={size}
        data-interactive="false"
        style={{ ...panelCardStyle, ...style }}
      >
        <div data-part="loading-body">
          <span data-part="spinner" style={spinnerStyle(24)} />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`ds-pattern-user-profile-card ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading={false}
        data-variant={variant}
        data-size={size}
        data-interactive={onClick ? 'true' : 'false'}
        style={style}
        onClick={onClick}
      >
        <div data-part="avatar-container">
          <div data-part="avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div data-part="avatar-fallback" className="ds-user-profile-card__avatar-fallback">
                <span data-part="avatar-initial">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span className="ds-user-profile-card__presence-dot" data-part="presence-dot" data-online={isOnline} />
        </div>
        <div data-part="identity">
          <div data-part="name">{user.name}</div>
          <div data-part="role">{user.role}</div>
        </div>
        {headerExtra}
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-user-profile-card ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-variant={variant}
      data-size={size}
      data-interactive={onClick ? 'true' : 'false'}
      style={{ ...panelCardStyle, ...style }}
      onClick={onClick}
    >
      <div data-part="body">
        <div data-part="avatar-container">
          <div data-part="avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div data-part="avatar-fallback" className="ds-user-profile-card__avatar-fallback">
                <span data-part="avatar-initial">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span className="ds-user-profile-card__presence-dot" data-part="presence-dot" data-online={isOnline} />
        </div>

        <div data-part="identity">
          <h3 data-part="name">{user.name}</h3>
          <p data-part="role">{user.role}</p>
        </div>

        {user.department && (
          <span data-part="department-badge" className="ds-user-profile-card__department-badge" style={pillBadgeSmStyle}>{user.department}</span>
        )}

        {user.email && (
          <p data-part="email">{user.email}</p>
        )}

        {user.status && (
          <span data-part="status-badge" data-status={user.status} className="ds-user-profile-card__status-badge" style={pillBadgeSmStyle}>
            {user.status}
          </span>
        )}

        {headerExtra && <div data-part="header-extra">{headerExtra}</div>}

        {/* Action buttons: size/geometry and every interactive state live in
            the skin (keyed on root[data-size]); variant mapping stays pinned:
            primary -> primary fill, danger -> error fill, default -> ghost. */}
        {actions.length > 0 && (
          <div data-part="actions">
            {actions.map(action => (
              <button
                key={action.key}
                className="ds-user-profile-card__action-button"
                data-part="action-button"
                data-variant={action.variant ?? 'default'}
                data-disabled={!!action.disabled}
                disabled={action.disabled}
                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
              >
                {action.icon && <span data-part="action-icon">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
