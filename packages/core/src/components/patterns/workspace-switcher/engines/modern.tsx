'use client';

/**
 * @fileoverview Modern (token-driven) engine for the WorkspaceSwitcher pattern.
 * Renders a dropdown workspace picker styled with inline DS token styles and
 * shared modern-styles helpers. Manages its own open/close state via a manual
 * click-outside listener rather than a native dropdown, giving finer control
 * over keyboard navigation and programmatic close-on-select behavior.
 *
 * @example
 * <ModernWorkspaceSwitcher
 *   workspaces={[{ id: '1', name: 'Acme Corp', plan: 'pro' }]}
 *   activeWorkspaceId="1"
 *   onSwitch={(id) => router.push(`/ws/${id}`)}
 *   position="sidebar"
 * />
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { WorkspaceSwitcherProps, Workspace } from '../WorkspaceSwitcher.types';
import { popupPanelStyle, pillBadgeSmStyle, menuSectionTitleStyle } from '../../../shared/modern-styles';

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

/**
 * Modern engine workspace switcher built on DS token inline styles and shared
 * modern-styles helpers. Uses a custom click-outside handler and manual dropdown
 * positioning instead of a native dropdown to support full keyboard navigation
 * and close-on-select.
 *
 * @param props - {@link WorkspaceSwitcherProps}
 * @returns A button trigger that toggles an absolutely-positioned workspace list.
 */
export default function ModernWorkspaceSwitcher(props: WorkspaceSwitcherProps) {
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

  // Manual click-outside detection because a native dropdown component
  // does not support keyboard navigation or programmatic close-on-select.
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

  // Full keyboard navigation for the dropdown. ArrowDown/ArrowUp move the
  // virtual focus index within the workspace list. Enter selects the focused
  // item and closes the dropdown. Escape dismisses without selecting.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          // Clamp to last item to prevent overflowing the list.
          setFocusIndex(prev => Math.min(prev + 1, workspaces.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Clamp to 0 so the focus never goes negative.
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
      className={`ds-pattern-workspace-switcher ds-engine-modern relative ${className ?? ''}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <button
        style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 40, borderRadius: 'var(--ds-radius-md)', ...(position === 'sidebar' ? { width: '100%', justifyContent: 'flex-start' } : {}) }}
        onClick={() => setOpen(!open)}
        data-testid="workspace-trigger"
        aria-label="Switch workspace"
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={`rounded-lg ${position === 'sidebar' ? 'w-8 h-8' : 'w-6 h-6'}`}>
            {activeWorkspace?.logo ? (
              <img src={activeWorkspace.logo} alt={activeWorkspace.name} />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xs font-bold" style={{ background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' }}>
                {activeWorkspace ? getInitials(activeWorkspace.name) : '?'}
              </div>
            )}
          </div>
        </div>
        {position === 'sidebar' && (
          <span className="flex-1 text-left text-sm font-semibold truncate">
            {activeWorkspace?.name ?? 'Select workspace'}
          </span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown -- positioned contextually: sidebar opens to the right so it
          doesn't overlap the nav rail; topbar opens below the trigger. */}
      {open && (
        <div
          className={`absolute z-50 mt-1 w-72 overflow-hidden ${
            position === 'sidebar' ? 'left-full top-0 ml-2' : 'top-full left-0'
          }`}
          style={{ ...popupPanelStyle, boxShadow: 'var(--ds-elevation-3)', padding: 0 }}
          role="listbox"
          aria-label="Workspaces"
        >
          {/* Header */}
          <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--ds-color-border)' }}>
            <span style={menuSectionTitleStyle}>Workspaces</span>
          </div>

          {/* Workspace list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {workspaces.map((ws, idx) => {
              const isActive = ws.id === activeWorkspaceId;
              const isFocused = idx === focusIndex;
              return (
                <div
                  key={ws.id}
                  role="option"
                  aria-selected={isActive}
                  data-testid={`workspace-item-${ws.id}`}
                  // Three visual states: keyboard-focused (--ds-surface-inset), active workspace
                  // (subtle primary tint + left accent border), and default (hover highlight).
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    isActive ? 'border-l-[3px]' : 'border-l-[3px] border-transparent'
                  }`}
                  style={{
                    ...(isFocused ? { background: 'var(--ds-surface-inset)' } : isActive ? { background: 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)' } : {}),
                    ...(isActive ? { borderColor: 'var(--ds-color-primary)' } : {}),
                  }}
                  onClick={() => {
                    onSwitch(ws.id);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setFocusIndex(idx)}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="w-9 h-9 rounded-lg">
                      {ws.logo ? (
                        <img src={ws.logo} alt={ws.name} />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-sm font-bold" style={{ background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' }}>
                          {getInitials(ws.name)}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Workspace name + metadata row. min-w-0 is required for
                      truncate to work inside a flex container. */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm truncate ${isActive ? 'font-semibold' : ''}`}>{ws.name}</span>
                      {/* Checkmark confirms which workspace is currently active. */}
                      {isActive && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--ds-color-primary)' }} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {/* Secondary metadata line: role, billing plan, and online count. */}
                    <div className="flex items-center gap-2 text-xs opacity-50">
                      {ws.role && <span>{ws.role}</span>}
                      {ws.plan && <span className="capitalize">{ws.plan}</span>}
                      {typeof ws.online === 'number' && (
                        <span className="flex items-center gap-1">
                          {/* Green dot indicates active members. */}
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--ds-color-success)' }} />
                          {ws.online}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Right-side controls: unread badge + settings gear.
                      Settings button is hidden by default and revealed on hover/focus
                      to keep the row visually clean. */}
                  <div className="flex items-center gap-1.5">
                    {typeof ws.unreadCount === 'number' && ws.unreadCount > 0 && (
                      <span style={{ ...pillBadgeSmStyle, background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' }}>{ws.unreadCount}</span>
                    )}
                    {onSettings && (
                      <button
                        style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 24, width: 24, padding: 0, fontSize: 12, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: isFocused ? 1 : 0, transition: 'opacity 0.15s' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSettings(ws.id);
                        }}
                        data-testid={`workspace-settings-${ws.id}`}
                        aria-label={`Settings for ${ws.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
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
              <div style={{ borderTop: '1px solid var(--ds-color-border)', margin: '0' }} />
              <div className="px-3 py-2">
                <button
                  style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%' }}
                  onClick={() => {
                    onCreate();
                    setOpen(false);
                  }}
                  data-testid="workspace-create"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create workspace
                </button>
              </div>
            </>
          )}

          {/* Current user */}
          {currentUser && (
            <>
              <div style={{ borderTop: '1px solid var(--ds-color-border)', margin: '0' }} />
              <div className="flex items-center gap-2 px-3 py-2" data-testid="workspace-current-user">
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="w-7 h-7 rounded-full">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-xs font-bold" style={{ background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' }}>
                        {getInitials(currentUser.name)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{currentUser.name}</div>
                  {currentUser.email && (
                    <div className="text-xs opacity-50 truncate">{currentUser.email}</div>
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
