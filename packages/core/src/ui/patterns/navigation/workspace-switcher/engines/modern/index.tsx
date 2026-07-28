'use client';

/**
 * @fileoverview Modern (token-driven) engine for the WorkspaceSwitcher pattern.
 * Renders a workspace picker: a Button trigger and a listbox panel with rich
 * rows (avatar, name + active check, metadata, unread Badge, settings gear).
 *
 * COMPOSITION LAW (Lote 2): the trigger, the per-row settings gear and the
 * create action are the public Button primitive; the unread counter is the
 * public Badge primitive (caller `data-part` wins the root anatomy hook per
 * P-79, so `workspace-switcher.css` owns their paint). The raw `<button>`
 * elements are gone and their inline geometry moved to the skin. The panel
 * stays a pattern-owned `role="listbox"`: its rows carry avatar + metadata +
 * badge + settings, which the Dropdown primitive's label+icon menu items
 * cannot express — the keyboard contract (ArrowUp/Down virtual focus, Enter
 * selects, Escape dismisses) and the click-outside dismissal are preserved
 * verbatim. The active row's former LEFT ACCENT (`border-l-[3px]`) is
 * replaced by the skin's framed-surface treatment (product law).
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
import type { WorkspaceSwitcherProps, Workspace } from '../../contracts';
import { menuSectionTitleStyle } from '../../../../foundation/engine-styles/modern';
import { Button } from '../../../../../primitives/inputs/Button';
import { Badge } from '../../../../../primitives/display/Badge';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { NavigationSettingsIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-settings';
import { StatusVerifiedIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-verified';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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
 * Modern engine workspace switcher composed on DS primitives (see the module
 * docblock). Uses a pattern-owned listbox panel for the rich workspace rows.
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

  /* ---- localized copy (components catalog, English floor) ---- */
  const translation = useOptionalTranslation('components');
  const switchLabel = translation?.tOr('workspaceSwitcher.switch', 'Switch workspace') ?? 'Switch workspace';
  const panelLabel = translation?.tOr('workspaceSwitcher.panel', 'Workspaces') ?? 'Workspaces';
  const selectLabel = translation?.tOr('workspaceSwitcher.select', 'Select workspace') ?? 'Select workspace';
  const createLabel = translation?.tOr('workspaceSwitcher.create', 'Create workspace') ?? 'Create workspace';
  const settingsLabel = translation?.tOr('workspaceSwitcher.settings', 'Settings for') ?? 'Settings for';

  const [open, setOpen] = useState(false);
  // -1 means no keyboard focus; updated on ArrowUp/Down or mouse hover.
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Click-outside dismissal for the pattern-owned listbox panel.
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
      className={`ds-pattern-workspace-switcher ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-position={position}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <Button
        engine="modern"
        variant="ghost"
        size="sm"
        data-part="trigger"
        onClick={() => setOpen(!open)}
        data-testid="workspace-trigger"
        aria-label={switchLabel}
        aria-expanded={open}
      >
        <span data-part="avatar-frame" data-frame="trigger">
          {activeWorkspace?.logo ? (
            <img src={activeWorkspace.logo} alt={activeWorkspace.name} />
          ) : (
            <span data-part="avatar-fallback">
              {activeWorkspace ? getInitials(activeWorkspace.name) : '?'}
            </span>
          )}
        </span>
        {position === 'sidebar' && (
          <span data-part="trigger-name">
            {activeWorkspace?.name ?? selectLabel}
          </span>
        )}
        <NavigationDownIcon decorative size={12} data-part="chevron" />
      </Button>

      {/* Panel -- positioned contextually in the skin: sidebar opens to the
          inline-end so it doesn't overlap the nav rail; topbar opens below. */}
      {open && (
        <div
          data-part="panel"
          role="listbox"
          aria-label={panelLabel}
        >
          {/* Header */}
          <div data-part="header">
            <span style={menuSectionTitleStyle}>{panelLabel}</span>
          </div>

          {/* Workspace list */}
          <div data-part="list">
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
                  onClick={() => {
                    onSwitch(ws.id);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setFocusIndex(idx)}
                >
                  <span data-part="avatar-frame" data-frame="item">
                    {ws.logo ? (
                      <img src={ws.logo} alt={ws.name} />
                    ) : (
                      <span data-part="avatar-fallback">
                        {getInitials(ws.name)}
                      </span>
                    )}
                  </span>
                  {/* Workspace name + metadata row. */}
                  <span data-part="item-copy">
                    <span data-part="item-title-row">
                      <span data-part="item-name" data-active={isActive}>{ws.name}</span>
                      {/* Checkmark confirms which workspace is currently active. */}
                      {isActive && (
                        <StatusVerifiedIcon decorative size={12} data-part="check" />
                      )}
                    </span>
                    {/* Secondary metadata line: role, billing plan, and online count. */}
                    <span data-part="item-meta">
                      {ws.role && <span>{ws.role}</span>}
                      {ws.plan && <span data-part="item-plan">{ws.plan}</span>}
                      {typeof ws.online === 'number' && (
                        <span data-part="item-online">
                          {/* Green dot indicates active members. */}
                          <span data-part="online-dot" />
                          {ws.online}
                        </span>
                      )}
                    </span>
                  </span>
                  {/* Trailing controls: unread badge + settings gear.
                      Settings is revealed on row hover/focus (skin-owned). */}
                  <span data-part="item-controls">
                    {typeof ws.unreadCount === 'number' && ws.unreadCount > 0 && (
                      <Badge
                        engine="modern"
                        size="sm"
                        tone="primary"
                        data-part="badge"
                        count={ws.unreadCount}
                      />
                    )}
                    {onSettings && (
                      <Button
                        engine="modern"
                        variant="ghost"
                        size="xs"
                        data-part="settings"
                        data-focused={isFocused}
                        icon={<NavigationSettingsIcon decorative size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSettings(ws.id);
                        }}
                        data-testid={`workspace-settings-${ws.id}`}
                        aria-label={`${settingsLabel} ${ws.name}`}
                      />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Create workspace */}
          {showCreateButton && onCreate && (
            <>
              <div data-part="divider" />
              <div data-part="create-row">
                <Button
                  engine="modern"
                  variant="ghost"
                  size="sm"
                  data-part="create"
                  icon={<ActionAddIcon decorative size={14} />}
                  onClick={() => {
                    onCreate();
                    setOpen(false);
                  }}
                  data-testid="workspace-create"
                >
                  {createLabel}
                </Button>
              </div>
            </>
          )}

          {/* Current user */}
          {currentUser && (
            <>
              <div data-part="divider" />
              <div data-part="current-user" data-testid="workspace-current-user">
                <span data-part="avatar-frame" data-frame="user">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} />
                  ) : (
                    <span data-part="avatar-fallback">
                      {getInitials(currentUser.name)}
                    </span>
                  )}
                </span>
                <span data-part="current-user-copy">
                  <span data-part="current-user-name">{currentUser.name}</span>
                  {currentUser.email && (
                    <span data-part="current-user-email">{currentUser.email}</span>
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
