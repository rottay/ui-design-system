'use client';

/**
 * WorkspaceSwitcher - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import type { WorkspaceSwitcherProps, Workspace } from '../WorkspaceSwitcher.types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 50,
  width: 280,
  maxHeight: 440,
  background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
  border: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
  borderRadius: 'var(--ds-radius-lg, 12px)',
  boxShadow: 'var(--ds-shadow-xl)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
  fontSize: 'var(--ds-font-size-xs, 11px)',
  fontWeight: 600,
  color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const avatarStyle = (size: number): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: 'var(--ds-radius-md, 8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: size > 28 ? 13 : 10,
  background: 'var(--ds-color-primary)',
  color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
  overflow: 'hidden',
  flexShrink: 0,
});

const linkBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '2px 4px',
  cursor: 'pointer',
  color: 'var(--ds-color-text-muted)',
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ds-radius-sm, 4px)',
};

const dividerStyle: CSSProperties = {
  height: 1,
  background: 'var(--ds-color-border-primary, var(--ds-color-neutral-200))',
  margin: 0,
};

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
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

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
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: position === 'sidebar' ? '6px 10px' : '4px 8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 'var(--ds-radius-md, 8px)',
          width: position === 'sidebar' ? '100%' : undefined,
          color: 'var(--ds-color-text)',
        }}
        onClick={() => setOpen(!open)}
        data-testid="workspace-trigger"
        aria-label="Switch workspace"
      >
        <div style={avatarStyle(position === 'sidebar' ? 32 : 24)}>
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
            fontSize: 'var(--ds-font-size-sm, 13px)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activeWorkspace?.name ?? 'Select workspace'}
          </span>
        )}
        <span style={{ fontSize: 10, opacity: 0.5 }}>{'\u25BC'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
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
          <div style={headerStyle}>Workspaces</div>

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
                  data-testid={`workspace-item-${ws.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    background: isFocused
                      ? 'var(--ds-color-bg-muted, var(--ds-color-neutral-100))'
                      : isActive
                      ? 'var(--ds-color-primary-50, var(--ds-color-bg-muted))'
                      : undefined,
                    borderLeft: isActive
                      ? '3px solid var(--ds-color-primary)'
                      : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => {
                    onSwitch(ws.id);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setFocusIndex(idx)}
                >
                  <div style={avatarStyle(36)}>
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
                        fontSize: 'var(--ds-font-size-sm, 13px)',
                        fontWeight: isActive ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {ws.name}
                      </span>
                      {isActive && (
                        <span style={{ color: 'var(--ds-color-primary)', fontSize: 12 }}>{'\u2713'}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--ds-font-size-xs, 11px)', color: 'var(--ds-color-text-muted)' }}>
                      {ws.role && <span>{ws.role}</span>}
                      {ws.plan && <span style={{ textTransform: 'capitalize' }}>{ws.plan}</span>}
                      {typeof ws.online === 'number' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ds-color-success)', display: 'inline-block' }} />
                          {ws.online}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {typeof ws.unreadCount === 'number' && ws.unreadCount > 0 && (
                      <span style={{
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        background: 'var(--ds-color-primary)',
                        color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
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
              <div style={dividerStyle} />
              <div style={{ padding: '6px 12px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    background: 'none',
                    border: '1px dashed var(--ds-color-border-secondary, var(--ds-color-border-primary))',
                    borderRadius: 'var(--ds-radius-md, 6px)',
                    cursor: 'pointer',
                    fontSize: 'var(--ds-font-size-sm, 13px)',
                    color: 'var(--ds-color-text-muted)',
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
              <div style={dividerStyle} />
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}
                data-testid="workspace-current-user"
              >
                <div style={{
                  ...avatarStyle(28),
                  borderRadius: '50%',
                  background: 'var(--ds-color-accent)',
                }}>
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
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
                    <div style={{
                      fontSize: 'var(--ds-font-size-xs, 11px)',
                      color: 'var(--ds-color-text-muted)',
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
