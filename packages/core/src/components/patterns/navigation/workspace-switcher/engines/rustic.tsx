'use client';

/**
 * @fileoverview Rustic (Vanilla/CSS-variable) engine for the WorkspaceSwitcher pattern.
 * Zero external UI library dependency -- renders with plain HTML elements and inline
 * styles that reference `--ds-*` CSS custom properties for theming. This makes the
 * component portable to any host app without requiring Ant Design or DaisyUI.
 *
 * @example
 * <RusticWorkspaceSwitcher
 *   workspaces={[{ id: '1', name: 'Acme Corp', role: 'Admin' }]}
 *   activeWorkspaceId="1"
 *   onSwitch={(id) => setActiveWs(id)}
 *   position="topbar"
 * />
 */

import React, { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import type { WorkspaceSwitcherProps, Workspace } from '../WorkspaceSwitcher.types';

/**
 * Extracts up to two uppercase initials from a workspace or user name.
 * Used as a fallback when no logo/avatar image is available.
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// --- Shared style constants ---
// Extracted as module-level objects to avoid re-creating on every render.
// All colors reference --ds-* tokens so themes can override appearance.

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 50,
  width: 280,
  maxHeight: 440,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: 'var(--ds-font-size-xs, 12px)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const avatarStyle = (size: number): CSSProperties => ({
  width: size,
  height: size,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: size > 28 ? 13 : 10,
  overflow: 'hidden',
  flexShrink: 0,
});

const linkBtnStyle: CSSProperties = {
  padding: '2px 4px',
  cursor: 'pointer',
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const dividerStyle: CSSProperties = {
  height: 1,
  margin: 0,
};

/**
 * Rustic workspace switcher using authored engine CSS and token-backed runtime layout values.
 * Mirrors the feature set of Classic/Modern engines (keyboard nav, unread badges,
 * create workspace, current user footer) without any third-party UI dependency.
 *
 * @param props - {@link WorkspaceSwitcherProps}
 * @returns A button trigger that toggles an absolutely-positioned workspace list.
 */
export default function RusticWorkspaceSwitcher(props: WorkspaceSwitcherProps) {
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
  // -1 means no keyboard focus; updated on ArrowUp/Down or mouse hover.
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Close the dropdown when the user clicks anywhere outside the container.
  // This replaces focus-trap behavior that would otherwise require a library.
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

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

  return (
    <div
      ref={containerRef}
      className={`ds-pattern-workspace-switcher ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <button
        data-part="trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: position === 'sidebar' ? '6px 10px' : '4px 8px',
          cursor: 'pointer',
          width: position === 'sidebar' ? '100%' : undefined,
        }}
        onClick={() => setOpen(!open)}
        data-testid="workspace-trigger"
        aria-label="Switch workspace"
      >
        <div data-part="avatar" style={avatarStyle(position === 'sidebar' ? 32 : 24)}>
          {activeWorkspace?.logo ? (
            <img
              src={activeWorkspace.logo}
              alt={activeWorkspace.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            activeWorkspace ? getInitials(activeWorkspace.name) : '?'
          )}
        </div>
        {position === 'sidebar' && (
          <span style={{
            flex: 1,
            textAlign: 'left',
            fontSize: 'var(--ds-font-size-sm, 14px)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activeWorkspace?.name ?? 'Select workspace'}
          </span>
        )}
        {/* Unicode down-pointing triangle as a lightweight caret icon */}
        <span style={{ fontSize: 10, opacity: 0.5 }}>{'\u25BC'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          data-part="panel"
          style={{
            ...dropdownStyle,
            ...(position === 'sidebar'
              ? { left: '100%', top: 0, marginLeft: 8 }
              : { top: '100%', left: 0, marginTop: 4 }),
          }}
          role="listbox"
          aria-label="Workspaces"
        >
          {/* Header */}
          <div data-part="header" style={headerStyle}>Workspaces</div>

          {/* Workspace list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0', maxHeight: 260 }}>
            {workspaces.map((ws, idx) => {
              const isActive = ws.id === activeWorkspaceId;
              const isFocused = idx === focusIndex;
              return (
                <div
                  key={ws.id}
                  role="option"
                  aria-selected={isActive}
                  data-part="item"
                  data-active={isActive}
                  data-focused={isFocused}
                  data-testid={`workspace-item-${ws.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => {
                    onSwitch(ws.id);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setFocusIndex(idx)}
                >
                  <div data-part="avatar" style={avatarStyle(36)}>
                    {ws.logo ? (
                      <img
                        src={ws.logo}
                        alt={ws.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      getInitials(ws.name)
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 'var(--ds-font-size-sm, 14px)',
                        fontWeight: isActive ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {ws.name}
                      </span>
                      {isActive && (
                        <span data-part="check" style={{ fontSize: 12 }}>{'\u2713'}</span>
                      )}
                    </div>
                    <div data-part="meta" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--ds-font-size-xs, 12px)' }}>
                      {ws.role && <span>{ws.role}</span>}
                      {ws.plan && <span style={{ textTransform: 'capitalize' }}>{ws.plan}</span>}
                      {typeof ws.online === 'number' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span data-part="online-dot" style={{ width: 5, height: 5, display: 'inline-block' }} />
                          {ws.online}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {typeof ws.unreadCount === 'number' && ws.unreadCount > 0 && (
                      <span data-part="badge" style={{
                        minWidth: 18,
                        height: 18,
                        fontSize: 10,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 5px',
                      }}>
                        {ws.unreadCount}
                      </span>
                    )}
                    {onSettings && (
                      <button
                        data-part="settings"
                        style={{ ...linkBtnStyle, opacity: isFocused ? 1 : 0.4 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSettings(ws.id);
                        }}
                        data-testid={`workspace-settings-${ws.id}`}
                        aria-label={`Settings for ${ws.name}`}
                      >
                        {'\u2699'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create workspace */}
          {showCreateButton && onCreate && (
            <>
              <div data-part="divider" style={dividerStyle} />
              <div style={{ padding: '6px 12px' }}>
                <button
                  data-part="create"
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: 'var(--ds-font-size-sm, 14px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onClick={() => {
                    onCreate();
                    setOpen(false);
                  }}
                  data-testid="workspace-create"
                >
                  + Create workspace
                </button>
              </div>
            </>
          )}

          {/* Current user */}
          {currentUser && (
            <>
              <div data-part="divider" style={dividerStyle} />
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}
                data-testid="workspace-current-user"
              >
                <div data-part="avatar" style={avatarStyle(28)}>
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      data-part="avatar-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--ds-font-size-xs, 12px)',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {currentUser.name}
                  </div>
                  {currentUser.email && (
                    <div data-part="user-email" style={{
                      fontSize: 'var(--ds-font-size-xs, 12px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {currentUser.email}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
