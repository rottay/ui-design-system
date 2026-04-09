'use client';

/**
 * @fileoverview SavedViewsMenu — page-structure-tier saved-views dropdown for
 * workspace landing pages.
 *
 * @description
 * Engine-free saved-views switcher with its own trigger button, portal,
 * and viewport-aware positioning. The dropdown groups views into three
 * sections (system / persona / custom), highlights the active view in a
 * tinted card, and exposes inline duplicate / share / save-current
 * affordances. The menu also listens to a custom DOM event so the
 * workspace orchestrator can open it from a keyboard shortcut.
 *
 * Different from the SavedViewsBar pattern (also in DS), which is a
 * horizontal scrollable bar of view chips. SavedViewsMenu is a
 * trigger-button + dropdown panel suited for the workspace command bar
 * cluster, where horizontal real estate is constrained.
 *
 * The family stays domain-agnostic: it works with any saved-view shape
 * (`{ key, label, kind?, state }`) without knowing about tenants, users,
 * or any specific entity. View descriptions render generic state hints
 * (query, scope, filter count, column count, sort field, density).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  Bookmark,
  BookmarkPlus,
  Check,
  Copy,
  LayoutTemplate,
  Share2,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';

import { Box, Flex, Text } from '../../../primitives';

/** Discriminator for saved view kinds. */
export type SavedViewsMenuEntryKind = 'system' | 'persona' | 'custom';

/** A single active filter chip carried in a saved view's state snapshot. */
export interface SavedViewsMenuEntryFilter {
  key: string;
  label: string;
  value: string;
  displayValue?: string;
  field?: string;
}

/** Saved view shape consumed by the menu. Generic enough to compose with
 *  any richer SavedViewsMenuEntry<T> via structural subtyping. */
export interface SavedViewsMenuEntry {
  key: string;
  label: string;
  kind?: SavedViewsMenuEntryKind;
  isSystem?: boolean;
  isDefault?: boolean;
  state: {
    query?: string;
    scope?: string;
    filters?: SavedViewsMenuEntryFilter[];
    visibleColumns?: string[];
    columnOrder?: string[];
    density?: string;
    sort?: { field: string; direction: 'asc' | 'desc' };
  };
}

export interface SavedViewsMenuProps {
  views: SavedViewsMenuEntry[];
  activeViewKey: string;
  onViewSelect: (viewKey: string) => void;
  onViewDelete?: (viewKey: string) => void;
  onViewSave?: (view: SavedViewsMenuEntry) => void;
  onSaveCurrentView?: () => void;
  /**
   * Custom DOM event name the menu listens to in order to open/close from
   * outside (typically a keyboard shortcut handler in the workspace
   * orchestrator). Defaults to
   * `entity-table-workspace:toggle-views-menu` for backwards-compat with
   * the original app-platform extraction.
   */
  externalToggleEventName?: string;
}

const DEFAULT_TOGGLE_EVENT = 'entity-table-workspace:toggle-views-menu';

const triggerButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 40,
  padding: '0 12px',
  borderRadius: 12,
  border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 92%, white 8%), color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-color-bg-primary) 12%))',
  color: 'var(--ds-color-text-primary)',
  cursor: 'pointer',
  transition: 'border-color 0.16s ease, background 0.16s ease, color 0.16s ease',
} as const;

function ViewsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 4h12M2 8h12M2 12h12"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getViewKind(view: SavedViewsMenuEntry): SavedViewsMenuEntryKind {
  if (view.kind) return view.kind;
  return view.isSystem ? 'system' : 'custom';
}

function getViewKindLabel(view: SavedViewsMenuEntry): string {
  const kind = getViewKind(view);
  if (kind === 'system') return 'System';
  if (kind === 'persona') return 'Persona';
  return 'Custom';
}

function cloneViewState(view: SavedViewsMenuEntry): SavedViewsMenuEntry['state'] {
  return {
    ...view.state,
    filters: view.state.filters?.map((filter) => ({ ...filter })),
    visibleColumns: view.state.visibleColumns ? [...view.state.visibleColumns] : undefined,
    columnOrder: view.state.columnOrder ? [...view.state.columnOrder] : undefined,
  };
}

function buildShareSnapshot(view: SavedViewsMenuEntry): string {
  const lines = [
    `Workspace view: ${view.label}`,
    `Type: ${getViewKindLabel(view)}`,
  ];

  if (view.state.scope) {
    lines.push(`Scope: ${view.state.scope}`);
  }

  if (view.state.query) {
    lines.push(`Query: ${view.state.query}`);
  }

  if (view.state.filters?.length) {
    lines.push(
      `Filters: ${view.state.filters
        .map((filter) => `${filter.label}=${filter.displayValue ?? filter.value}`)
        .join(', ')}`,
    );
  }

  if (view.state.visibleColumns?.length) {
    lines.push(`Columns: ${view.state.visibleColumns.join(', ')}`);
  }

  if (view.state.sort?.field) {
    lines.push(`Sort: ${view.state.sort.field} ${view.state.sort.direction}`);
  }

  if (view.state.density) {
    lines.push(`Density: ${view.state.density}`);
  }

  const query = new URLSearchParams({
    view: view.key,
    label: view.label,
  });

  if (view.state.scope) query.set('scope', view.state.scope);
  if (view.state.query) query.set('query', view.state.query);

  return `${lines.join('\n')}\n\n${typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?${query.toString()}` : ''}`.trim();
}

export function SavedViewsMenu({
  views,
  activeViewKey,
  onViewSelect,
  onViewDelete,
  onViewSave,
  onSaveCurrentView,
  externalToggleEventName = DEFAULT_TOGGLE_EVENT,
}: SavedViewsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 420 });
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const shareTimerRef = useRef<number | null>(null);

  const systemViews = useMemo(() => views.filter((view) => getViewKind(view) === 'system'), [views]);
  const personaViews = useMemo(() => views.filter((view) => getViewKind(view) === 'persona'), [views]);
  const customViews = useMemo(() => views.filter((view) => getViewKind(view) === 'custom'), [views]);
  const activeView = useMemo(
    () => views.find((view) => view.key === activeViewKey) ?? views.find((view) => view.isDefault) ?? views[0],
    [activeViewKey, views],
  );
  const activeViewKind = activeView ? getViewKind(activeView) : 'custom';

  const handleSelect = useCallback(
    (key: string) => {
      onViewSelect(key);
      setIsOpen(false);
    },
    [onViewSelect],
  );

  const handleDelete = useCallback(
    (event: React.MouseEvent, key: string) => {
      event.stopPropagation();
      onViewDelete?.(key);
    },
    [onViewDelete],
  );

  const handleDuplicateActiveView = useCallback(() => {
    if (!activeView || !onViewSave) return;

    const duplicateLabel = activeView.label.toLowerCase().endsWith(' copy')
      ? `${activeView.label} 2`
      : `${activeView.label} copy`;

    onViewSave({
      ...activeView,
      key: `custom-${Date.now()}`,
      label: duplicateLabel,
      kind: 'custom',
      isSystem: false,
      isDefault: false,
      state: cloneViewState(activeView),
    });
  }, [activeView, onViewSave]);

  const handleShareActiveView = useCallback(async () => {
    if (!activeView || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(buildShareSnapshot(activeView));
      setShareState('copied');

      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }

      shareTimerRef.current = window.setTimeout(() => {
        setShareState('idle');
        shareTimerRef.current = null;
      }, 1800);
    } catch {
      setShareState('idle');
    }
  }, [activeView]);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const width = 420;
    const gutter = 16;
    const left = Math.min(
      Math.max(gutter, rect.right - width),
      window.innerWidth - width - gutter,
    );

    setPanelPosition({
      top: rect.bottom + 8,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePanelPosition();

    const handleViewportChange = () => updatePanelPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => {
        const next = !prev;
        if (!prev) {
          requestAnimationFrame(() => updatePanelPosition());
        }
        return next;
      });
    };

    window.addEventListener(externalToggleEventName, handleToggle as EventListener);
    return () => {
      window.removeEventListener(externalToggleEventName, handleToggle as EventListener);
    };
  }, [externalToggleEventName, updatePanelPosition]);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setShareState('idle');
  }, [activeViewKey]);

  return (
    <Box style={{ position: 'relative', zIndex: isOpen ? 60 : 1 }}>
      <Box
        as="button"
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        title={activeView ? `Views: ${activeView.label}` : 'Views'}
        aria-label={activeView ? `Views: ${activeView.label}` : 'Views'}
        style={{
          ...triggerButtonStyle,
          width: 42,
          minWidth: 42,
          height: 42,
          minHeight: 42,
          padding: 0,
          justifyContent: 'center',
          borderColor: isOpen
            ? 'color-mix(in srgb, var(--ds-color-primary) 34%, transparent)'
            : triggerButtonStyle.border,
          background: isOpen
            ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card)))'
            : triggerButtonStyle.background,
        }}
      >
        <Flex align="center" justify="center" style={{ minWidth: 0 }}>
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isOpen
                ? 'color-mix(in srgb, var(--ds-color-primary) 16%, transparent)'
                : 'color-mix(in srgb, var(--ds-color-bg-primary) 56%, transparent)',
              color: isOpen ? 'var(--ds-color-primary)' : 'var(--ds-color-text-secondary)',
              flexShrink: 0,
            }}
          >
            <ViewsIcon />
          </Box>
        </Flex>
      </Box>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          <Box onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1990 }} />

          <Box
            style={{
              position: 'fixed',
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
              zIndex: 2000,
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 98%, white 2%), color-mix(in srgb, var(--ds-color-bg-primary) 28%, var(--ds-surface-card)))',
              border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 78%, transparent)',
              borderRadius: 18,
              boxShadow: '0 24px 60px color-mix(in srgb, black 24%, transparent)',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                padding: '16px 18px 14px',
                borderBottom:
                  '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent), transparent)',
              }}
            >
              <Flex align="start" justify="between" gap={12}>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" weight="medium" style={{ display: 'block', fontSize: 14 }}>
                    Saved views
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 12,
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    Switch between curated workspace states without leaving the list.
                  </Text>
                </Box>
                <Flex align="center" gap={6} wrap="wrap" justify="end">
                  <CountPill label={`${systemViews.length} system`} />
                  <CountPill label={`${personaViews.length} persona`} />
                  <CountPill label={`${customViews.length} custom`} />
                </Flex>
              </Flex>

              {activeView && (
                <Box
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid color-mix(in srgb, var(--ds-color-primary) 20%, transparent)',
                    background:
                      'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card)))',
                  }}
                >
                  <Flex align="start" justify="between" gap={12}>
                    <Flex align="start" gap={10} style={{ minWidth: 0 }}>
                      <ViewGlyph isSystem={activeView.isSystem} active />
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" weight="medium" style={{ display: 'block' }}>
                          {activeView.label}
                        </Text>
                        <Text
                          size="xs"
                          style={{
                            display: 'block',
                            marginTop: 4,
                            color: 'var(--ds-color-text-muted)',
                            fontSize: 12,
                          }}
                        >
                          {describeView(activeView)}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={6} wrap="wrap" justify="end">
                      <StatusPill label="Current" tone="primary" />
                      <StatusPill
                        label={activeViewKind === 'system' ? 'System' : activeViewKind === 'persona' ? 'Persona' : 'Custom'}
                        tone="neutral"
                      />
                      {activeView.isDefault && <StatusPill label="Default" tone="neutral" />}
                    </Flex>
                  </Flex>

                  <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 12 }}>
                    {onViewSave && (
                      <Box
                        as="button"
                        onClick={handleDuplicateActiveView}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          minHeight: 32,
                          padding: '0 12px',
                          borderRadius: 999,
                          border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 86%, transparent)',
                          background: 'color-mix(in srgb, var(--ds-surface-card) 84%, var(--ds-color-bg-primary) 16%)',
                          color: 'var(--ds-color-text-secondary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Copy style={{ width: 12, height: 12 }} />
                        Duplicate
                      </Box>
                    )}

                    {activeView && (
                      <Box
                        as="button"
                        onClick={handleShareActiveView}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          minHeight: 32,
                          padding: '0 12px',
                          borderRadius: 999,
                          border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 86%, transparent)',
                          background: 'color-mix(in srgb, var(--ds-surface-card) 84%, var(--ds-color-bg-primary) 16%)',
                          color: 'var(--ds-color-text-secondary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Share2 style={{ width: 12, height: 12 }} />
                        {shareState === 'copied' ? 'Copied' : 'Share'}
                      </Box>
                    )}

                    {onSaveCurrentView && (
                      <Box
                        as="button"
                        onClick={() => {
                          onSaveCurrentView();
                          setIsOpen(false);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          minHeight: 32,
                          padding: '0 12px',
                          borderRadius: 999,
                          border: '1px solid color-mix(in srgb, var(--ds-color-primary) 26%, transparent)',
                          background: 'color-mix(in srgb, var(--ds-color-primary) 9%, transparent)',
                          color: 'var(--ds-color-primary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <BookmarkPlus style={{ width: 12, height: 12 }} />
                        Save current
                      </Box>
                    )}
                  </Flex>
                </Box>
              )}
            </Box>

            <Box style={{ padding: '12px 12px 10px', maxHeight: 420, overflowY: 'auto' }}>
              {systemViews.length > 0 && (
                <Section title="System views" count={systemViews.length}>
                  {systemViews.map((view) => (
                    <ViewItem
                      key={view.key}
                      view={view}
                      isActive={view.key === activeView?.key}
                      onSelect={handleSelect}
                    />
                  ))}
                </Section>
              )}

              {personaViews.length > 0 && (
                <Section title="Persona views" count={personaViews.length}>
                  {personaViews.map((view) => (
                    <ViewItem
                      key={view.key}
                      view={view}
                      isActive={view.key === activeView?.key}
                      onSelect={handleSelect}
                      onDelete={
                        onViewDelete
                          ? (event: React.MouseEvent) => handleDelete(event, view.key)
                          : undefined
                      }
                    />
                  ))}
                </Section>
              )}

              {customViews.length > 0 && (
                <Section title="Custom views" count={customViews.length}>
                  {customViews.map((view) => (
                    <ViewItem
                      key={view.key}
                      view={view}
                      isActive={view.key === activeView?.key}
                      onSelect={handleSelect}
                      onDelete={
                        onViewDelete
                          ? (event: React.MouseEvent) => handleDelete(event, view.key)
                          : undefined
                      }
                    />
                  ))}
                </Section>
              )}

              {personaViews.length === 0 && (onSaveCurrentView || onViewSave) && (
                <Box
                  style={{
                    padding: '18px 16px',
                    borderRadius: 14,
                    border: '1px dashed color-mix(in srgb, var(--ds-color-border-subtle) 92%, transparent)',
                    background: 'color-mix(in srgb, var(--ds-color-bg-primary) 18%, transparent)',
                  }}
                >
                  <Flex align="start" gap={10}>
                    <Sparkles style={{ width: 16, height: 16, color: 'var(--ds-color-text-muted)', marginTop: 2 }} />
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" weight="medium" style={{ display: 'block' }}>
                        No persona views yet
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          display: 'block',
                          marginTop: 4,
                          color: 'var(--ds-color-text-muted)',
                        }}
                      >
                        Save the current slice or duplicate a system view to start a personal workspace.
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              )}

              {views.length === 0 && (
                <Box
                  style={{
                    padding: '28px 16px',
                    borderRadius: 14,
                    border: '1px dashed color-mix(in srgb, var(--ds-color-border-subtle) 92%, transparent)',
                    textAlign: 'center' as const,
                  }}
                >
                  <Sparkles
                    style={{
                      width: 18,
                      height: 18,
                      margin: '0 auto 8px',
                      color: 'var(--ds-color-text-muted)',
                    }}
                  />
                  <Text size="sm" weight="medium" style={{ display: 'block' }}>
                    No saved views yet
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    Create curated filters and column layouts once save is wired for this workspace.
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </>,
        document.body,
      )}
    </Box>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Box style={{ marginBottom: 12 }}>
      <Flex align="center" justify="between" style={{ padding: '0 6px 8px' }}>
        <Text
          size="xs"
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: 'var(--ds-color-text-muted)',
          }}
        >
          {title}
        </Text>
        <CountPill label={String(count)} />
      </Flex>
      <Flex direction="column" gap={8}>
        {children}
      </Flex>
    </Box>
  );
}

interface ViewItemProps {
  view: SavedViewsMenuEntry;
  isActive: boolean;
  onSelect: (key: string) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

function ViewItem({ view, isActive, onSelect, onDelete }: ViewItemProps) {
  const kindLabel = getViewKindLabel(view);

  return (
    <Box
      as="button"
      onClick={() => onSelect(view.key)}
      style={{
        width: '100%',
        padding: 0,
        textAlign: 'left' as const,
        border: isActive
          ? '1px solid color-mix(in srgb, var(--ds-color-primary) 28%, transparent)'
          : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
        borderRadius: 14,
        background: isActive
          ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card)))'
          : 'color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%)',
        cursor: 'pointer',
      }}
    >
      <Flex align="start" justify="between" gap={12} style={{ padding: 12 }}>
        <Flex align="start" gap={10} style={{ minWidth: 0, flex: 1 }}>
          <ViewGlyph isSystem={view.isSystem} active={isActive} />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Flex align="center" gap={6} wrap="wrap">
              <Text
                size="sm"
                weight={isActive ? 'medium' : undefined}
                style={{
                  color: 'var(--ds-color-text-primary)',
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {view.label}
              </Text>
              {isActive && <StatusPill label="Current" tone="primary" />}
              {view.isDefault && <StatusPill label="Default" tone="neutral" />}
              <StatusPill label={kindLabel} tone="neutral" />
            </Flex>
            <Text
              size="xs"
              style={{
                display: 'block',
                marginTop: 5,
                color: 'var(--ds-color-text-muted)',
                fontSize: 12,
              }}
            >
              {describeView(view)}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={6} style={{ flexShrink: 0 }}>
          {isActive && (
            <Check
              style={{
                width: 14,
                height: 14,
                color: 'var(--ds-color-primary)',
              }}
            />
          )}
          {onDelete && (
            <Box
              as="button"
              onClick={onDelete}
              aria-label={`Delete ${view.label}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 10,
                border: '1px solid color-mix(in srgb, var(--ds-color-danger) 18%, transparent)',
                background: 'transparent',
                color: 'var(--ds-color-text-muted)',
                cursor: 'pointer',
              }}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

function ViewGlyph({ isSystem, active }: { isSystem?: boolean; active?: boolean }) {
  const Icon = isSystem ? LayoutTemplate : Bookmark;
  return (
    <Box
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: active
          ? 'color-mix(in srgb, var(--ds-color-primary) 14%, transparent)'
          : 'color-mix(in srgb, var(--ds-color-bg-primary) 54%, transparent)',
        color: active ? 'var(--ds-color-primary)' : 'var(--ds-color-text-secondary)',
      }}
    >
      <Icon style={{ width: 14, height: 14 }} />
    </Box>
  );
}

function CountPill({ label }: { label: string }) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 22,
        padding: '0 8px',
        borderRadius: 999,
        background: 'color-mix(in srgb, var(--ds-color-bg-primary) 72%, transparent)',
        color: 'var(--ds-color-text-secondary)',
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {label}
    </Box>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'primary' | 'neutral';
}) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 20,
        padding: '0 8px',
        borderRadius: 999,
        background:
          tone === 'primary'
            ? 'color-mix(in srgb, var(--ds-color-primary) 12%, transparent)'
            : 'color-mix(in srgb, var(--ds-color-bg-primary) 72%, transparent)',
        color: tone === 'primary' ? 'var(--ds-color-primary)' : 'var(--ds-color-text-secondary)',
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {tone === 'primary' ? <Star style={{ width: 10, height: 10 }} /> : null}
      {label}
    </Box>
  );
}

function describeView(view: SavedViewsMenuEntry): string {
  const details: string[] = [];

  if (view.state.query) details.push(`Query: ${view.state.query}`);
  if (view.state.scope) details.push(`Scope: ${view.state.scope}`);
  if (view.state.filters?.length) {
    details.push(`${view.state.filters.length} filter${view.state.filters.length === 1 ? '' : 's'}`);
  }
  if (view.state.visibleColumns?.length) details.push(`${view.state.visibleColumns.length} columns`);
  if (view.state.sort?.field) details.push(`Sorted by ${view.state.sort.field}`);
  if (view.state.density) details.push(`${view.state.density} density`);

  return details.length > 0 ? details.slice(0, 3).join(' • ') : 'No custom scope, filters, or layout saved yet.';
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { SavedViewsMenu as WorkspaceViewsMenu };
export type {
  SavedViewsMenuProps as WorkspaceViewsMenuProps,
  SavedViewsMenuEntry as WorkspaceSavedView,
  SavedViewsMenuEntryKind as WorkspaceSavedViewKind,
  SavedViewsMenuEntryFilter as WorkspaceSavedViewFilter,
};
