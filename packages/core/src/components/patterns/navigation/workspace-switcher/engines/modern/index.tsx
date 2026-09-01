'use client';

/**
 * @fileoverview Modern (token-driven) engine for the WorkspaceSwitcher pattern.
 * Renders a workspace picker: a Button trigger and a menu panel with rich
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
 * `role="menu"`: its rows carry avatar + metadata + badge + settings,
 * which the Dropdown primitive's label+icon menu items cannot express —
 * Escape dismisses, focus returns to the trigger and click-outside
 * dismissal is preserved. The
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

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import type { WorkspaceSwitcherProps } from '../../contracts';
import { Button } from '../../../../../primitives/inputs/button';
import { Badge } from '../../../../../primitives/display/badge';
import ModernAvatar from '../../../../../primitives/display/avatar/engines/modern';
import ModernInput from '../../../../../primitives/inputs/input/engines/modern';
import ModernEmpty from '../../../../../primitives/display/empty/engines/modern';
import { ActionAddIcon } from '@/graphics/icons/semantic/generated/roles/action-add';
import { NavigationDownIcon } from '@/graphics/icons/semantic/generated/roles/navigation-down';
import { NavigationSettingsIcon } from '@/graphics/icons/semantic/generated/roles/navigation-settings';
import { StatusVerifiedIcon } from '@/graphics/icons/semantic/generated/roles/status-verified';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Reading-direction probe (house idiom): nearest explicit `dir` wins,
    otherwise the document direction applies. */
function isRtlContext(el: HTMLElement): boolean {
  const scoped = el.closest('[dir]');
  if (scoped) return scoped.getAttribute('dir') === 'rtl';
  return document.documentElement.dir === 'rtl';
}

/**
 * Modern engine workspace switcher composed on DS primitives (see the module
 * docblock). Uses a pattern-owned menu panel for the rich workspace rows.
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
  const searchRef = useRef<HTMLInputElement>(null);

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

  // Instance-scoped ids: two switchers on one page must not collide, or the
  // trigger's aria-controls resolves into the wrong panel.
  const instanceId = useId();
  const menuId = `${instanceId}-menu`;
  const itemId = (workspaceId: string) => `${instanceId}-item-${workspaceId}`;
  const hasOptions = visibleWorkspaces.length > 0;

  /** The menu's two columns in DOM order -- the row controls and their gears.
      Queried by part for the same reason `focusTrigger` is. */
  const columnNodes = useCallback(
    (part: 'item' | 'settings'): HTMLElement[] =>
      Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(`[data-part="${part}"]`) ?? [],
      ),
    [],
  );

  /** Moves REAL focus within one column, wrapping at both ends, and keeps the
      roving index (and with it the row reveal state) in step. */
  const focusInColumn = useCallback(
    (part: 'item' | 'settings', index: number) => {
      const nodes = columnNodes(part);
      if (nodes.length === 0) return;
      const wrapped = ((index % nodes.length) + nodes.length) % nodes.length;
      setFocusIndex(wrapped);
      nodes[wrapped]?.focus();
    },
    [columnNodes],
  );

  /** The single dismissal primitive: the panel closes and the trigger takes
      focus back, so no path can strand focus on `<body>`. */
  const dismiss = useCallback(() => {
    setOpen(false);
    focusTrigger();
  }, [focusTrigger]);

  const selectWorkspace = useCallback(
    (workspaceId: string) => {
      onSwitch(workspaceId);
      dismiss();
    },
    [onSwitch, dismiss],
  );

  // Focus returns to the trigger only when it still sits inside the panel, so
  // a pointer landing on another control is not robbed of it.
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const root = containerRef.current;
      if (root && !root.contains(e.target as Node)) {
        const focusWasInside = root.contains(document.activeElement);
        setOpen(false);
        if (focusWasInside) focusTrigger();
      }
    },
    [focusTrigger],
  );

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  // Root-level keys only: Escape dismisses from anywhere in the panel and
  // ArrowDown/ArrowUp open the closed trigger (APG menu-button).
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    },
    [open, dismiss],
  );

  // The search holds DOM focus on open: ArrowDown/ArrowUp hand focus to the
  // first/last row, Enter takes the highlighted row (the first if none is).
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (visibleWorkspaces.length === 0) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusInColumn('item', 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusInColumn('item', -1);
          break;
        case 'Enter': {
          e.preventDefault();
          const target =
            focusIndex >= 0 ? visibleWorkspaces[focusIndex] : visibleWorkspaces[0];
          if (target) selectWorkspace(target.id);
          break;
        }
      }
    },
    [visibleWorkspaces, focusIndex, focusInColumn, selectWorkspace],
  );

  // Row column: Up/Down and Home/End rove real focus over the rows; the
  // inline-END arrow crosses to that row's own gear (mirrored under RTL).
  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, index: number, workspaceId: string) => {
      const toTrailing = isRtlContext(e.currentTarget) ? 'ArrowLeft' : 'ArrowRight';
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusInColumn('item', index + 1);
          return;
        case 'ArrowUp':
          e.preventDefault();
          focusInColumn('item', index - 1);
          return;
        case 'Home':
          e.preventDefault();
          focusInColumn('item', 0);
          return;
        case 'End':
          e.preventDefault();
          focusInColumn('item', -1);
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          selectWorkspace(workspaceId);
          return;
      }
      if (e.key === toTrailing) {
        e.preventDefault();
        focusInColumn('settings', index);
        return;
      }
      // Type-ahead belongs to the filter: this menu's only text surface is the
      // search, so a printable key hands focus back to it and lands there.
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setQuery(prev => prev + e.key);
        setFocusIndex(-1);
        searchRef.current?.focus();
      }
    },
    [focusInColumn, selectWorkspace],
  );

  // Gear column: Up/Down and Home/End stay in the trailing column; the
  // inline-START arrow returns to the gear's own row (mirrored under RTL).
  const handleSettingsKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const toLeading = isRtlContext(e.currentTarget) ? 'ArrowRight' : 'ArrowLeft';
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusInColumn('settings', index + 1);
          return;
        case 'ArrowUp':
          e.preventDefault();
          focusInColumn('settings', index - 1);
          return;
        case 'Home':
          e.preventDefault();
          focusInColumn('settings', 0);
          return;
        case 'End':
          e.preventDefault();
          focusInColumn('settings', -1);
          return;
      }
      if (e.key === toLeading) {
        e.preventDefault();
        focusInColumn('item', index);
      }
    },
    [focusInColumn],
  );

  // Filtering can shrink the list under the virtual focus; clamp it.
  useEffect(() => {
    setFocusIndex(prev => Math.min(prev, visibleWorkspaces.length - 1));
  }, [visibleWorkspaces.length]);

  // Dismissal discards the transient session: a stale filter must not survive
  // into the next open (the panel would read as an empty roster).
  useEffect(() => {
    if (open) return;
    setQuery('');
    setFocusIndex(-1);
  }, [open]);

  // The menu is ONE tab stop: exactly one row and its gear stay in the tab
  // sequence, and the arrow keys reach every other item.
  const rovingIndex =
    focusIndex >= 0 && focusIndex < visibleWorkspaces.length ? focusIndex : 0;

  /* ---- Loading skeleton (PatternBaseProps.loading): the trigger's exact
          footprint, so the swap never shifts the surrounding chrome. ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-workspace-switcher ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-position={position}
        data-loading="true"
        aria-busy="true"
        style={style}
      >
        <div data-part="skeleton" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ds-pattern-workspace-switcher ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-position={position}
      data-open={open ? 'true' : 'false'}
      data-loading="false"
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger: APG menu-button disclosure (locale-switcher precedent) --
          aria-controls resolves once the panel mounts. */}
      <Button
        engine="modern"
        variant="ghost"
        size="sm"
        data-part="trigger"
        onClick={() => setOpen(!open)}
        data-testid="workspace-trigger"
        aria-label={switchLabel}
        aria-haspopup="menu"
        aria-controls={open && hasOptions ? menuId : undefined}
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
        <div data-part="panel">
          {/* Header -- typography lives in the skin (the shared inline
              menuSectionTitleStyle object is drained, wave p612b). */}
          <div data-part="header">
            <span data-part="header-title">{panelLabel}</span>
          </div>

          {/* A textbox may not own a menu popup, so the search is a plain searchbox
             that hands focus on to the rows with the arrow keys. */}
          {workspaces.length > 0 && (
            <div data-part="search">
              <ModernInput
                ref={searchRef}
                size="sm"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                data-testid="workspace-search"
                autoFocus
                role="searchbox"
                aria-controls={hasOptions ? menuId : undefined}
                value={query}
                onKeyDown={handleSearchKeyDown}
                onChange={(v) => {
                  setQuery(String(v ?? ''));
                  setFocusIndex(-1);
                }}
              />
            </div>
          )}

          {/* The menu role sits HERE, not on the panel: only menuitem/group/separator
             children are legal inside it. */}
          <div
            data-part="list"
            id={hasOptions ? menuId : undefined}
            role={hasOptions ? 'menu' : undefined}
            aria-label={hasOptions ? panelLabel : undefined}
          >
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
                // Presentational row frame (APG `li role="none"` idiom): it owns
                // the row SURFACE so the tint spans the sibling gear too.
                <div
                  key={ws.id}
                  data-part="item-row"
                  role="none"
                  data-active={isActive}
                  data-focused={isFocused}
                >
                  <div
                    id={itemId(ws.id)}
                    role="menuitemradio"
                    aria-checked={isActive}
                    tabIndex={idx === rovingIndex ? 0 : -1}
                    data-part="item"
                    data-active={isActive}
                    data-focused={isFocused}
                    data-testid={`workspace-item-${ws.id}`}
                    onClick={() => selectWorkspace(ws.id)}
                    onMouseEnter={() => setFocusIndex(idx)}
                    onFocus={() => setFocusIndex(idx)}
                    onKeyDown={(e) => handleItemKeyDown(e, idx, ws.id)}
                  >
                    <span data-part="avatar-frame" data-frame="item">
                      <ModernAvatar name={ws.name} src={ws.logo} size="md" />
                    </span>
                    {/* Workspace name + metadata row. */}
                    <span data-part="item-copy">
                      <span data-part="item-title-row">
                        {/* The name truncates in the skin; the title attribute
                            is the long-workspace-name affordance. */}
                        <span data-part="item-name" data-active={isActive} title={ws.name}>{ws.name}</span>
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
                    {/* Trailing controls: unread badge. */}
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
                    </span>
                  </div>
                  {/* Settings is revealed on row hover/focus (skin-owned). */}
                  {onSettings && (
                    <Button
                      engine="modern"
                      variant="ghost"
                      size="xs"
                      role="menuitem"
                      tabIndex={idx === rovingIndex ? 0 : -1}
                      data-part="settings"
                      data-focused={isFocused}
                      icon={<NavigationSettingsIcon decorative size={14} />}
                      onClick={() => onSettings(ws.id)}
                      onFocus={() => setFocusIndex(idx)}
                      onKeyDown={(e) => handleSettingsKeyDown(e, idx)}
                      data-testid={`workspace-settings-${ws.id}`}
                      aria-label={settingsLabelFor(ws.name)}
                    />
                  )}
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
                    dismiss();
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
                    <span data-part="current-user-email" title={currentUser.email}>{currentUser.email}</span>
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
