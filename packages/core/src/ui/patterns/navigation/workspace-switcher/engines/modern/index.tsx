'use client';

/**
 * @fileoverview Modern (token-driven) engine for the WorkspaceSwitcher pattern.
 * Renders a workspace picker: a Button trigger and a listbox panel with rich
 * rows (avatar, name + active check, metadata, unread Badge, settings gear).
 *
 * COMPOSITION LAW (Lote 2; PT28 uplift): the trigger, the per-row settings
 * gear and the create action are the public Button primitive; the unread
 * counter is the public Badge primitive (caller `data-part` wins the root
 * anatomy hook per P-79, so `workspace-switcher.css` owns their paint);
 * workspace/user AVATARS are the public Avatar primitive (the hand-rolled
 * initials helper and the `avatar-fallback` paint are retired, and with
 * them the `--ds-workspace-switcher-avatar-font-size/-font-weight`
 * TENANT_CANDIDATE channels -- the primitive owns initials typography);
 * the panel search is the public Input primitive and the empty states the
 * public Empty primitive. The raw `<button>` elements are gone and their
 * inline geometry moved to the skin. The panel stays a pattern-owned
 * `role="listbox"`: its rows carry avatar + metadata + badge + settings,
 * which the Dropdown primitive's label+icon menu items cannot express —
 * the keyboard contract (ArrowUp/Down virtual focus with
 * aria-activedescendant, Enter selects, Escape dismisses and returns focus
 * to the trigger) and the click-outside dismissal are preserved. The
 * active row's former LEFT ACCENT (`border-l-[3px]`) is replaced by the
 * skin's framed-surface treatment (product law).
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
import type { WorkspaceSwitcherProps } from '../../contracts';
import { menuSectionTitleStyle } from '../../../../foundation/engine-styles/modern';
import { Button } from '../../../../../primitives/inputs/Button';
import { Badge } from '../../../../../primitives/display/Badge';
import ModernAvatar from '../../../../../primitives/display/Avatar/engines/modern';
import ModernInput from '../../../../../primitives/inputs/Input/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { NavigationSettingsIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-settings';
import { StatusVerifiedIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-verified';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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
  const searchPlaceholder = translation?.tOr('workspaceSwitcher.search_placeholder', 'Search workspaces') ?? 'Search workspaces';
  const emptyListLabel = translation?.tOr('workspaceSwitcher.empty', 'No workspaces') ?? 'No workspaces';
  const emptyResultsLabel = translation?.tOr('workspaceSwitcher.empty_results', 'No workspaces found') ?? 'No workspaces found';
  // ONE parametric message — never a translated fragment concatenated with
  // the workspace name (i18n law).
  const settingsLabelFor = (name: string) =>
    translation?.tOr('workspaceSwitcher.settings_for', 'Settings for {name}', { name }) ?? `Settings for ${name}`;

  const [open, setOpen] = useState(false);
  // -1 means no keyboard focus; updated on ArrowUp/Down or mouse hover.
  const [focusIndex, setFocusIndex] = useState(-1);
  // Client-side filter query for the panel search (composed Input).
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  /** Returns focus to the composed trigger Button (facade ref forwarding is
      not guaranteed, so the focus target is queried by its caller part). */
  const focusTrigger = useCallback(() => {
    containerRef.current
      ?.querySelector<HTMLElement>('[data-part="trigger"]')
      ?.focus();
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleWorkspaces = normalizedQuery
    ? workspaces.filter(w => w.name.toLowerCase().includes(normalizedQuery))
    : workspaces;

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
  // virtual focus index within the VISIBLE workspace list. Enter selects the
  // focused item and closes the dropdown. Escape dismisses without
  // selecting. Both close paths return focus to the trigger (popover law).
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          // Clamp to last item to prevent overflowing the list.
          setFocusIndex(prev => Math.min(prev + 1, visibleWorkspaces.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Clamp to 0 so the focus never goes negative.
          setFocusIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < visibleWorkspaces.length) {
            onSwitch(visibleWorkspaces[focusIndex].id);
            setOpen(false);
            focusTrigger();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          focusTrigger();
          break;
      }
    },
    [open, focusIndex, visibleWorkspaces, onSwitch, focusTrigger],
  );

  // Filtering can shrink the list under the virtual focus; clamp it.
  useEffect(() => {
    setFocusIndex(prev => Math.min(prev, visibleWorkspaces.length - 1));
  }, [visibleWorkspaces.length]);

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
          {/* Composed Avatar (P01): owns the image, the derived initials
              fallback and its paint; '?' covers the no-workspace case. */}
          <ModernAvatar
            name={activeWorkspace?.name ?? '?'}
            src={activeWorkspace?.logo}
            size="sm"
          />
        </span>
        {position === 'sidebar' && (
          <span data-part="trigger-name" title={activeWorkspace?.name}>
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
          aria-activedescendant={
            focusIndex >= 0 && visibleWorkspaces[focusIndex]
              ? `workspace-option-${visibleWorkspaces[focusIndex].id}`
              : undefined
          }
        >
          {/* Header */}
          <div data-part="header">
            <span style={menuSectionTitleStyle}>{panelLabel}</span>
          </div>

          {/* Search: the composed Input filters client-side; arrows typed in
              the box ride the container's listbox keyboard contract. */}
          {workspaces.length > 0 && (
            <div data-part="search">
              <ModernInput
                size="sm"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={query}
                onChange={(v) => {
                  setQuery(String(v ?? ''));
                  setFocusIndex(-1);
                }}
              />
            </div>
          )}

          {/* Workspace list */}
          <div data-part="list">
            {visibleWorkspaces.length === 0 ? (
              // Empty (no workspaces at all, or no filter results): the
              // composed Empty primitive owns the quiet hint -- never a mute
              // empty list.
              <div data-part="empty">
                <ModernEmpty description={workspaces.length === 0 ? emptyListLabel : emptyResultsLabel} />
              </div>
            ) : (
              visibleWorkspaces.map((ws, idx) => {
              const isActive = ws.id === activeWorkspaceId;
              const isFocused = idx === focusIndex;
              return (
                <div
                  key={ws.id}
                  id={`workspace-option-${ws.id}`}
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
                    <ModernAvatar name={ws.name} src={ws.logo} size="md" />
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
                          {/* Dot marks active members; the count carries the info. */}
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
                        aria-label={settingsLabelFor(ws.name)}
                      />
                    )}
                  </span>
                </div>
              );
              })
            )}
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
                  <ModernAvatar name={currentUser.name} src={currentUser.avatar} size="sm" />
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
