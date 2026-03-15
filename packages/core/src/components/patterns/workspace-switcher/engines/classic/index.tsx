'use client';

/**
 * WorkspaceSwitcher - Classic Engine (Ant Design)
 */

import React, { useState, useCallback } from 'react';
import { Avatar, Badge, Button, Divider, Popover, Space, Tooltip } from 'antd';
import {
  SwapOutlined,
  PlusOutlined,
  SettingOutlined,
  CheckOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { WorkspaceSwitcherProps, Workspace } from '../../types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ClassicWorkspaceSwitcher(props: WorkspaceSwitcherProps) {
  const {
    workspaces,
    activeWorkspaceId,
    onSwitch,
    onCreate,
    onSettings,
    currentUser,
    trigger = 'click',
    position = 'sidebar',
    showCreateButton = true,
    loading,
    className,
    style,
  } = props;

  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex(prev => Math.min(prev + 1, workspaces.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < workspaces.length) {
            onSwitch(workspaces[focusIndex].id);
            setOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [open, focusIndex, workspaces, onSwitch],
  );

  const content = (
    <div
      style={{ width: 280, maxHeight: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="listbox"
      aria-label="Workspaces"
    >
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--ds-color-border-secondary, var(--ds-color-neutral-200, #e5e7eb))' }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ds-color-text-secondary, var(--ds-color-neutral-500, #737373))' }}>Workspaces</span>
      </div>

      {/* Workspace list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {workspaces.map((ws, idx) => {
          const isActive = ws.id === activeWorkspaceId;
          const isFocused = idx === focusIndex;
          return (
            <div
              key={ws.id}
              role="option"
              aria-selected={isActive}
              data-testid={`workspace-item-${ws.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                background: isFocused
                  ? 'var(--ds-workspace-switcher-hover-bg, var(--ds-color-bg-secondary))'
                  : isActive
                    ? 'var(--ds-workspace-switcher-active-bg, var(--ds-color-primary-50))'
                    : undefined,
                borderLeft: isActive
                  ? '3px solid var(--ds-workspace-switcher-active-border, var(--ds-color-primary-500))'
                  : '3px solid transparent',
              }}
              onClick={() => {
                onSwitch(ws.id);
                setOpen(false);
              }}
              onMouseEnter={() => setFocusIndex(idx)}
            >
              {ws.logo ? (
                <Avatar src={ws.logo} size={36} shape="square" style={{ borderRadius: 8 }} />
              ) : (
                <Avatar
                  size={36}
                  shape="square"
                  style={{
                    borderRadius: 8,
                    background: 'var(--ds-workspace-switcher-avatar-bg, var(--ds-color-primary-500))',
                    color: 'var(--ds-workspace-switcher-avatar-color, var(--ds-color-text-inverse, var(--ds-color-bg-base)))',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {getInitials(ws.name)}
                </Avatar>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {ws.name}
                  </span>
                  {isActive && (
                    <CheckOutlined
                      style={{
                        fontSize: 11,
                        color: 'var(--ds-workspace-switcher-active-indicator, var(--ds-color-primary-500))',
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    color: 'var(--ds-workspace-switcher-meta-color, var(--ds-color-text-secondary))',
                  }}
                >
                  {ws.role && <span>{ws.role}</span>}
                  {ws.plan && <span style={{ textTransform: 'capitalize' }}>{ws.plan}</span>}
                  {typeof ws.online === 'number' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <TeamOutlined style={{ fontSize: 10 }} /> {ws.online}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {typeof ws.unreadCount === 'number' && ws.unreadCount > 0 && (
                  <Badge count={ws.unreadCount} size="small" />
                )}
                {onSettings && (
                  <Tooltip title="Settings">
                    <Button
                      type="text"
                      size="small"
                      icon={<SettingOutlined style={{ fontSize: 12 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSettings(ws.id);
                      }}
                      data-testid={`workspace-settings-${ws.id}`}
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create workspace */}
      {showCreateButton && onCreate && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '6px 12px' }}>
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
              data-testid="workspace-create"
            >
              Create workspace
            </Button>
          </div>
        </>
      )}

      {/* Current user */}
      {currentUser && (
        <>
          <Divider style={{ margin: 0 }} />
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}
            data-testid="workspace-current-user"
          >
            {currentUser.avatar ? (
              <Avatar src={currentUser.avatar} size={28} />
            ) : (
              <Avatar
                size={28}
                style={{
                  background:
                    'var(--ds-workspace-switcher-user-avatar-bg, var(--ds-color-success-500, var(--ds-color-success)))',
                  color: 'var(--ds-workspace-switcher-user-avatar-color, var(--ds-color-text-inverse, var(--ds-color-bg-base)))',
                  fontSize: 12,
                }}
              >
                {getInitials(currentUser.name)}
              </Avatar>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </div>
              {currentUser.email && (
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ds-workspace-switcher-meta-color, var(--ds-color-text-secondary))',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser.email}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const triggerElement = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        padding: position === 'sidebar' ? '6px 8px' : '4px 8px',
        borderRadius: 8,
      }}
      data-testid="workspace-trigger"
    >
      {activeWorkspace?.logo ? (
        <Avatar src={activeWorkspace.logo} size={position === 'sidebar' ? 32 : 24} shape="square" style={{ borderRadius: 6 }} />
      ) : (
        <Avatar
          size={position === 'sidebar' ? 32 : 24}
          shape="square"
          style={{
            borderRadius: 6,
            background: 'var(--ds-workspace-switcher-avatar-bg, var(--ds-color-primary-500))',
            color: 'var(--ds-workspace-switcher-avatar-color, var(--ds-color-text-inverse, var(--ds-color-bg-base)))',
            fontSize: position === 'sidebar' ? 14 : 11,
            fontWeight: 600,
          }}
        >
          {activeWorkspace ? getInitials(activeWorkspace.name) : '?'}
        </Avatar>
      )}
      {position === 'sidebar' && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activeWorkspace?.name ?? 'Select workspace'}
          </div>
        </div>
      )}
      <SwapOutlined
        style={{
          fontSize: 12,
          color: 'var(--ds-workspace-switcher-meta-color, var(--ds-color-text-secondary))',
        }}
      />
    </div>
  );

  return (
    <div className={`ds-pattern-workspace-switcher ds-engine-classic ${className ?? ''}`} style={style}>
      <Popover
        content={content}
        trigger={trigger === 'hover' ? 'hover' : 'click'}
        open={open}
        onOpenChange={setOpen}
        placement={position === 'sidebar' ? 'rightTop' : 'bottomLeft'}
        arrow={false}
        styles={{ body: { padding: 0 } }}
      >
        {triggerElement}
      </Popover>
    </div>
  );
}
