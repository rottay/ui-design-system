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
import type { UserProfileCardProps, UserProfile } from '../../contracts';
import { panelCardStyle, pillBadgeSmStyle, spinnerStyle } from '../../../../../foundation/engine-styles/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* English floors for the presence vocabulary. */
const STATUS_FLOORS: Record<NonNullable<UserProfile['status']>, string> = {
  active: 'Active',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

type GraphemeSegmenter = { segment(input: string): Iterable<{ segment: string }> };

const SegmenterCtor = (
  Intl as unknown as {
    Segmenter?: new (
      locales?: string | string[],
      options?: { granularity: 'grapheme' },
    ) => GraphemeSegmenter;
  }
).Segmenter;

/** First GRAPHEME, not charAt(0): that splits surrogate pairs and combining
 *  marks, rendering half a character in the avatar well. */
function avatarInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const first = SegmenterCtor
    ? new SegmenterCtor(undefined, { granularity: 'grapheme' })
        .segment(trimmed)
        [Symbol.iterator]()
        .next().value?.segment
    : String.fromCodePoint(trimmed.codePointAt(0) ?? 0);
  return (first ?? '').toLocaleUpperCase();
}

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

  const i18n = useOptionalTranslation('components');
  const statusLabel = user.status
    ? i18n?.tOr(`userProfileCard.status.${user.status}`, STATUS_FLOORS[user.status]) ??
      STATUS_FLOORS[user.status]
    : '';

  /* A caller-owned avatar URL can 404. Without this the circular frame kept a
     broken-image glyph and the initial fallback never engaged. */
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  React.useEffect(() => {
    setAvatarFailed(false);
  }, [user.avatar]);
  const showAvatarImage = Boolean(user.avatar) && !avatarFailed;

  const renderAvatar = () => (
    <div data-part="avatar-container">
      <div data-part="avatar">
        {showAvatarImage ? (
          /* The name is rendered adjacent, so the image is decorative: an
             `alt` here made every reader announce the name twice. */
          <img src={user.avatar} alt="" onError={() => setAvatarFailed(true)} />
        ) : (
          <div data-part="avatar-fallback" className="ds-user-profile-card__avatar-fallback">
            <span data-part="avatar-initial">{avatarInitial(user.name)}</span>
          </div>
        )}
      </div>
      <span className="ds-user-profile-card__presence-dot" data-part="presence-dot" data-online={isOnline} />
    </div>
  );

  /* A clickable card is promoted to a real button only when it owns no nested
   controls, since role="button" makes descendants presentational. */
  const hasNestedControls = actions.length > 0 || Boolean(headerExtra);
  const rootIsButton = Boolean(onClick) && !hasNestedControls;
  const handleRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onClick?.();
  };

  if (loading) {
    return (
      <div
        className={`ds-pattern-user-profile-card ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        /* The spinner is decorative-only, so aria-busy is the sole pending
           signal AT gets for this card (page-shell modern idiom). */
        aria-busy="true"
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
        role={rootIsButton ? 'button' : undefined}
        tabIndex={rootIsButton ? 0 : undefined}
        onKeyDown={rootIsButton ? handleRootKeyDown : undefined}
      >
        {renderAvatar()}
        <div data-part="identity">
          {/* Name and role are clipped to one ellipsised line by the skin, so
              both advertise their full text on hover. */}
          <div data-part="name" title={user.name}><bdi>{user.name}</bdi></div>
          <div data-part="role" title={user.role}><bdi>{user.role}</bdi></div>
        </div>
        {headerExtra && <div data-part="header-extra">{headerExtra}</div>}
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
      role={rootIsButton ? 'button' : undefined}
      tabIndex={rootIsButton ? 0 : undefined}
      onKeyDown={rootIsButton ? handleRootKeyDown : undefined}
    >
      <div data-part="body">
        {renderAvatar()}

        <div data-part="identity">
          {/* Name and role are clipped to one ellipsised line by the skin, so
              both advertise their full text on hover. */}
          <h3 data-part="name" title={user.name}><bdi>{user.name}</bdi></h3>
          <p data-part="role" title={user.role}><bdi>{user.role}</bdi></p>
        </div>

        {user.department && (
          <span data-part="department-badge" className="ds-user-profile-card__department-badge" style={pillBadgeSmStyle}><bdi>{user.department}</bdi></span>
        )}

        {user.email && (
          <p data-part="email"><bdi>{user.email}</bdi></p>
        )}

        {user.status && (
          <span data-part="status-badge" data-status={user.status} className="ds-user-profile-card__status-badge" style={pillBadgeSmStyle}>
            {statusLabel}
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
