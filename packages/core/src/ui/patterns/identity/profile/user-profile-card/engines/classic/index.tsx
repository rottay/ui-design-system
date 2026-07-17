'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the UserProfileCard pattern.
 * Renders a centered card with avatar, online status dot, name/role/department,
 * email, status tag, and configurable action buttons. Supports two variants:
 * "full" (Card with centered layout) and "compact" (horizontal inline row).
 * Built entirely on Ant Design primitives (Card, Avatar, Tag, Button, Space).
 *
 * @example
 * <ClassicUserProfileCard
 *   user={{ name: 'Jane Doe', role: 'Engineer', email: 'jane@acme.com', status: 'active' }}
 *   size="md"
 *   actions={[{ key: 'msg', label: 'Message', variant: 'primary', onClick: () => {} }]}
 * />
 */

import React from 'react';
import { Card, Avatar, Tag, Button, Space, Tooltip } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import type { UserProfileCardProps } from '../../contracts';

// Maps user status to the --ds-* color token used for the online indicator dot.
const statusColors: Record<string, string> = {
  active: 'var(--ds-color-success)',
  away: 'var(--ds-color-warning)',
  busy: 'var(--ds-color-error)',
  offline: 'var(--ds-color-text-tertiary)',
};

// Ant Design Tag `color` prop value per status, driving the tag background tint.
const statusTagColors: Record<string, string> = {
  active: 'success',
  away: 'warning',
  busy: 'error',
  offline: 'default',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

// Pixel dimensions per size tier. Keeps avatar, typography, and padding
// proportional so the card scales visually at sm/md/lg without ad-hoc overrides.
const sizeMap = {
  sm: { avatar: 40, titleSize: 14, descSize: 12, padding: 12 },
  md: { avatar: 56, titleSize: 16, descSize: 13, padding: 16 },
  lg: { avatar: 80, titleSize: 20, descSize: 14, padding: 24 },
};

/**
 * Classic engine user profile card built on Ant Design Card/Avatar/Tag.
 * Two layout variants: "full" (centered card with all details) and "compact"
 * (horizontal row suited for sidebars and lists). Includes an online status
 * dot positioned absolutely over the avatar.
 *
 * @param props - {@link UserProfileCardProps}
 * @returns An Ant Design Card (full) or a plain flex container (compact).
 */
export default function ClassicUserProfileCard(props: UserProfileCardProps) {
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

  if (loading) {
    return <Card className={className} style={style} loading />;
  }

  // Default to online when user.status is 'active' unless explicitly overridden
  // by the `online` prop, allowing the consumer to decouple presence from status.
  const isOnline = online ?? (user.status === 'active');

  if (variant === 'compact') {
    return (
      <div
        className={`ds-pattern-user-profile-card ds-engine-classic ${className ?? ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: s.padding, cursor: onClick ? 'pointer' : undefined, ...style }}
        onClick={onClick}
      >
        <div style={{ position: 'relative' }}>
          <Avatar
            src={user.avatar}
            icon={!user.avatar ? <UserOutlined /> : undefined}
            size={s.avatar}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isOnline ? statusColors.active : statusColors.offline,
            border: '2px solid var(--ds-color-bg-base)',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: s.titleSize, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </div>
          <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-secondary)' }}>
            {user.role}
          </div>
        </div>
        {headerExtra}
      </div>
    );
  }

  return (
    <Card
      className={`ds-pattern-user-profile-card ds-engine-classic ${className ?? ''}`}
      style={{ textAlign: 'center', ...style }}
      hoverable={!!onClick}
      onClick={onClick}
    >
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
        <Avatar
          src={user.avatar}
          icon={!user.avatar ? <UserOutlined /> : undefined}
          size={s.avatar}
        />
        <div style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: isOnline ? statusColors.active : statusColors.offline,
          border: '2px solid var(--ds-color-bg-base)',
        }} />
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontWeight: 600, fontSize: s.titleSize }}>{user.name}</div>
        <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-secondary)', marginTop: 2 }}>{user.role}</div>
      </div>

      {user.department && (
        <Tag color="blue" style={{ marginBottom: 8 }}>{user.department}</Tag>
      )}

      {user.email && (
        <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)', marginBottom: 12 }}>
          <MailOutlined style={{ marginRight: 4 }} />
          {user.email}
        </div>
      )}

      {user.status && (
        <Tag color={statusTagColors[user.status]} style={{ marginBottom: 12 }}>
          {statusLabels[user.status]}
        </Tag>
      )}

      {headerExtra && <div style={{ marginBottom: 12 }}>{headerExtra}</div>}

      {/* Action buttons rendered with Ant Design's Space for consistent gap.
          "danger" variant maps to Ant's `danger` prop on a primary button,
          while unrecognized variants fall back to the default button style. */}
      {actions.length > 0 && (
        <Space wrap style={{ justifyContent: 'center' }}>
          {actions.map(action => (
            <Button
              key={action.key}
              type={action.variant === 'primary' ? 'primary' : action.variant === 'danger' ? 'primary' : 'default'}
              danger={action.variant === 'danger'}
              disabled={action.disabled}
              onClick={(e) => { e.stopPropagation(); action.onClick(); }}
              icon={action.icon}
              size={size === 'sm' ? 'small' : 'middle'}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      )}
    </Card>
  );
}
