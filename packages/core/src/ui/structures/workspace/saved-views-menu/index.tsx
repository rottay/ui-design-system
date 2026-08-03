'use client';

/**
 * @fileoverview SavedViewsMenu — structures-tier saved-views dropdown for
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

import {
  BookmarkIcon as Bookmark,
  BookmarkPlusIcon as BookmarkPlus,
  CheckIcon as Check,
  CopyIcon as Copy,
  LayoutTemplateIcon as LayoutTemplate,
  Share2Icon as Share2,
  SparklesIcon as Sparkles,
  StarIcon as Star,
  Trash2Icon as Trash2,
} from '../../../../graphics/icons';
import { LayoutListIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-list';

import { Box, Flex, Text } from '../../../primitives';
import { Portal } from '../../../primitives/runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../primitives/runtime/overlay/portal-scope';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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

/** Panel geometry constants shared by the JS viewport clamp and the skin. */
const PANEL_WIDTH = 420;
const PANEL_VIEWPORT_GUTTER = 16;

/**
 * Every user-visible string the menu renders, resolved through the i18n
 * catalog with an English floor. Threaded into the module-level helpers
 * (describeView, buildShareSnapshot) and the leaf subcomponents so none of
 * them hardcode copy.
 */
interface SavedViewsMenuLabels {
  views: string;
  headerTitle: string;
  headerDescription: string;
  current: string;
  default: string;
  system: string;
  persona: string;
  custom: string;
  systemSuffix: string;
  personaSuffix: string;
  customSuffix: string;
  duplicate: string;
  share: string;
  copied: string;
  saveCurrent: string;
  systemViewsSection: string;
  personaViewsSection: string;
  customViewsSection: string;
  noPersonaTitle: string;
  noPersonaDescription: string;
  noViewsTitle: string;
  noViewsDescription: string;
  deletePrefix: string;
  copySuffix: string;
  panelLabel: string;
  queryPrefix: string;
  scopePrefix: string;
  filterSingular: string;
  filterPlural: string;
  columnsSuffix: string;
  sortedByPrefix: string;
  densitySuffix: string;
  emptyDescription: string;
  shareViewPrefix: string;
  shareTypePrefix: string;
  shareFiltersPrefix: string;
  shareColumnsPrefix: string;
  shareSortPrefix: string;
  shareDensityPrefix: string;
}

function getViewKind(view: SavedViewsMenuEntry): SavedViewsMenuEntryKind {
  if (view.kind) return view.kind;
  return view.isSystem ? 'system' : 'custom';
}

function getViewKindLabel(view: SavedViewsMenuEntry, labels: SavedViewsMenuLabels): string {
  const kind = getViewKind(view);
  if (kind === 'system') return labels.system;
  if (kind === 'persona') return labels.persona;
  return labels.custom;
}

function cloneViewState(view: SavedViewsMenuEntry): SavedViewsMenuEntry['state'] {
  return {
    ...view.state,
    filters: view.state.filters?.map((filter) => ({ ...filter })),
    visibleColumns: view.state.visibleColumns ? [...view.state.visibleColumns] : undefined,
    columnOrder: view.state.columnOrder ? [...view.state.columnOrder] : undefined,
  };
}

function buildShareSnapshot(view: SavedViewsMenuEntry, labels: SavedViewsMenuLabels): string {
  const lines = [
    `${labels.shareViewPrefix}: ${view.label}`,
    `${labels.shareTypePrefix}: ${getViewKindLabel(view, labels)}`,
  ];

  if (view.state.scope) {
    lines.push(`${labels.scopePrefix}: ${view.state.scope}`);
  }

  if (view.state.query) {
    lines.push(`${labels.queryPrefix}: ${view.state.query}`);
  }

  if (view.state.filters?.length) {
    lines.push(
      `${labels.shareFiltersPrefix}: ${view.state.filters
        .map((filter) => `${filter.label}=${filter.displayValue ?? filter.value}`)
        .join(', ')}`,
    );
  }

  if (view.state.visibleColumns?.length) {
    lines.push(`${labels.shareColumnsPrefix}: ${view.state.visibleColumns.join(', ')}`);
  }

  if (view.state.sort?.field) {
    lines.push(`${labels.shareSortPrefix}: ${view.state.sort.field} ${view.state.sort.direction}`);
  }

  if (view.state.density) {
    lines.push(`${labels.shareDensityPrefix}: ${view.state.density}`);
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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const shareTimerRef = useRef<number | null>(null);
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = useCallback(
    (key: string, fallback: string): string => {
      const resolved = i18n?.t(key);
      if (resolved === undefined || resolved === key || resolved === `components.${key}`) {
        return fallback;
      }
      return resolved;
    },
    [i18n],
  );
  const labels = useMemo<SavedViewsMenuLabels>(
    () => ({
      views: tOr('savedViewsMenu.views', 'Views'),
      headerTitle: tOr('savedViewsMenu.headerTitle', 'Saved views'),
      headerDescription: tOr('savedViewsMenu.headerDescription', 'Switch between curated workspace states without leaving the list.'),
      current: tOr('savedViewsMenu.current', 'Current'),
      default: tOr('savedViewsMenu.default', 'Default'),
      system: tOr('savedViewsMenu.system', 'System'),
      persona: tOr('savedViewsMenu.persona', 'Persona'),
      custom: tOr('savedViewsMenu.custom', 'Custom'),
      systemSuffix: tOr('savedViewsMenu.systemSuffix', 'system'),
      personaSuffix: tOr('savedViewsMenu.personaSuffix', 'persona'),
      customSuffix: tOr('savedViewsMenu.customSuffix', 'custom'),
      duplicate: tOr('savedViewsMenu.duplicate', 'Duplicate'),
      share: tOr('savedViewsMenu.share', 'Share'),
      copied: tOr('savedViewsMenu.copied', 'Copied'),
      saveCurrent: tOr('savedViewsMenu.saveCurrent', 'Save current'),
      systemViewsSection: tOr('savedViewsMenu.systemViewsSection', 'System views'),
      personaViewsSection: tOr('savedViewsMenu.personaViewsSection', 'Persona views'),
      customViewsSection: tOr('savedViewsMenu.customViewsSection', 'Custom views'),
      noPersonaTitle: tOr('savedViewsMenu.noPersonaTitle', 'No persona views yet'),
      noPersonaDescription: tOr('savedViewsMenu.noPersonaDescription', 'Save the current slice or duplicate a system view to start a personal workspace.'),
      noViewsTitle: tOr('savedViewsMenu.noViewsTitle', 'No saved views yet'),
      noViewsDescription: tOr('savedViewsMenu.noViewsDescription', 'Create curated filters and column layouts once save is wired for this workspace.'),
      deletePrefix: tOr('savedViewsMenu.deletePrefix', 'Delete'),
      copySuffix: tOr('savedViewsMenu.copySuffix', 'copy'),
      panelLabel: tOr('savedViewsMenu.panelLabel', 'Saved views'),
      queryPrefix: tOr('savedViewsMenu.queryPrefix', 'Query'),
      scopePrefix: tOr('savedViewsMenu.scopePrefix', 'Scope'),
      filterSingular: tOr('savedViewsMenu.filterSingular', 'filter'),
      filterPlural: tOr('savedViewsMenu.filterPlural', 'filters'),
      columnsSuffix: tOr('savedViewsMenu.columnsSuffix', 'columns'),
      sortedByPrefix: tOr('savedViewsMenu.sortedByPrefix', 'Sorted by'),
      densitySuffix: tOr('savedViewsMenu.densitySuffix', 'density'),
      emptyDescription: tOr('savedViewsMenu.emptyDescription', 'No custom scope, filters, or layout saved yet.'),
      shareViewPrefix: tOr('savedViewsMenu.shareViewPrefix', 'Workspace view'),
      shareTypePrefix: tOr('savedViewsMenu.shareTypePrefix', 'Type'),
      shareFiltersPrefix: tOr('savedViewsMenu.shareFiltersPrefix', 'Filters'),
      shareColumnsPrefix: tOr('savedViewsMenu.shareColumnsPrefix', 'Columns'),
      shareSortPrefix: tOr('savedViewsMenu.shareSortPrefix', 'Sort'),
      shareDensityPrefix: tOr('savedViewsMenu.shareDensityPrefix', 'Density'),
    }),
    [tOr],
  );
  // The panel leaves the trigger's DOM ancestry when it portals, so the
  // tenant/locale scope has to be re-stamped around it. `usePortalScope`
  // needs the anchor as state (a ref would not re-render when it lands), so
  // the trigger publishes to both.
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    setAnchorEl(node);
  }, []);
  const portalScope = usePortalScope(anchorEl);

  const systemViews = useMemo(() => views.filter((view) => getViewKind(view) === 'system'), [views]);
  const personaViews = useMemo(() => views.filter((view) => getViewKind(view) === 'persona'), [views]);
  const customViews = useMemo(() => views.filter((view) => getViewKind(view) === 'custom'), [views]);
  const activeView = useMemo(
    () => views.find((view) => view.key === activeViewKey) ?? views.find((view) => view.isDefault) ?? views[0],
    [activeViewKey, views],
  );

  // APG dialog closure: every dismissal path (select, Escape, backdrop,
  // save-current) funnels through one helper so focus always returns to the
  // trigger — the portaled panel is not a DOM descendant, so the browser
  // cannot restore focus on its own.
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (key: string) => {
      onViewSelect(key);
      closeMenu();
    },
    [onViewSelect, closeMenu],
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

    const duplicateLabel = activeView.label.toLowerCase().endsWith(` ${labels.copySuffix}`)
      ? `${activeView.label} 2`
      : `${activeView.label} ${labels.copySuffix}`;

    onViewSave({
      ...activeView,
      key: `custom-${Date.now()}`,
      label: duplicateLabel,
      kind: 'custom',
      isSystem: false,
      isDefault: false,
      state: cloneViewState(activeView),
    });
  }, [activeView, labels.copySuffix, onViewSave]);

  const handleShareActiveView = useCallback(async () => {
    if (!activeView || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(buildShareSnapshot(activeView, labels));
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
  }, [activeView, labels]);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    // Narrow viewports: clamp the panel width so it never overflows the
    // gutter — a 360px phone gets 328px instead of a horizontal bleed.
    const width = Math.min(PANEL_WIDTH, window.innerWidth - PANEL_VIEWPORT_GUTTER * 2);
    const left = Math.min(
      Math.max(PANEL_VIEWPORT_GUTTER, rect.right - width),
      window.innerWidth - width - PANEL_VIEWPORT_GUTTER,
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

  // Focus entry: when the dialog opens, focus lands on the panel itself
  // (tabIndex=-1) so keyboard and screen-reader users start inside the
  // portaled tree; closure paths hand focus back to the trigger.
  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  // Close on Escape and hand focus back to the trigger (APG disclosure).
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeMenu]);

  return (
    <Box style={{ position: 'relative', zIndex: isOpen ? 60 : 1 }}>
      <Box
        as="button"
        type="button"
        data-part="trigger"
        data-open={isOpen}
        className="ds-structure ds-saved-views-menu"
        ref={setTriggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        title={activeView ? `${labels.views}: ${activeView.label}` : labels.views}
        aria-label={activeView ? `${labels.views}: ${activeView.label}` : labels.views}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Flex align="center" justify="center" style={{ minWidth: 0 }}>
          <Box
            data-part="trigger-icon"
            data-open={isOpen}
          >
            {/* Governed semantic role icon (layout.list) — the retired local
                hand-drawn SVG violated the zero-local-SVG law. */}
            <LayoutListIcon decorative size={16} />
          </Box>
        </Flex>
      </Box>

      {/* Panel + backdrop go through the shared overlay substrate: the target
          resolves as explicit container > active top-layer host > shared
          `#rottay-portal-root`, so the menu stays visible when the workspace
          is itself inside a `showModal()` dialog. `PortalScope` carries the
          tenant/theme/direction lineage across the portal boundary. */}
      {isOpen && (
        <Portal>
          <PortalScope snapshot={portalScope}>
          <Box
            className="ds-structure ds-saved-views-menu-backdrop"
            data-part="backdrop"
            onClick={closeMenu}
          />

          <Box
            data-part="panel"
            data-open={isOpen}
            className="ds-structure ds-saved-views-menu-panel"
            role="dialog"
            aria-label={labels.panelLabel}
            ref={panelRef}
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
              zIndex: 2000,
              overflow: 'hidden',
            }}
          >
            <Box
              data-part="header"
              style={{
                padding: '16px 18px 14px',
              }}
            >
              <Flex align="start" justify="between" gap={12}>
                <Box style={{ minWidth: 0 }}>
                  <Text data-part="header-title" size="sm" weight="medium" style={{ display: 'block' }}>
                    {labels.headerTitle}
                  </Text>
                  <Text
                    data-part="header-description"
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                    }}
                  >
                    {labels.headerDescription}
                  </Text>
                </Box>
                <Flex align="center" gap={6} wrap="wrap" justify="end">
                  <CountPill label={`${systemViews.length} ${labels.systemSuffix}`} />
                  <CountPill label={`${personaViews.length} ${labels.personaSuffix}`} />
                  <CountPill label={`${customViews.length} ${labels.customSuffix}`} />
                </Flex>
              </Flex>

              {activeView && (
                <Box
                  data-part="active-card"
                  style={{
                    marginTop: 14,
                    padding: 14,
                  }}
                >
                  <Flex align="start" justify="between" gap={12}>
                    <Flex align="start" gap={10} style={{ minWidth: 0 }}>
                      <ViewGlyph isSystem={activeView.isSystem} active />
                      <Box style={{ minWidth: 0 }}>
                        <Text data-part="active-card-label" size="sm" weight="medium" style={{ display: 'block' }}>
                          {activeView.label}
                        </Text>
                        <Text
                          data-part="active-card-description"
                          size="xs"
                          style={{
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {describeView(activeView, labels)}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={6} wrap="wrap" justify="end">
                      <StatusPill label={labels.current} tone="primary" />
                      <StatusPill
                        label={getViewKindLabel(activeView, labels)}
                        tone="neutral"
                      />
                      {activeView.isDefault && <StatusPill label={labels.default} tone="neutral" />}
                    </Flex>
                  </Flex>

                  <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 12 }}>
                    {onViewSave && (
                      <Box
                        as="button"
                        type="button"
                        data-part="action-button"
                        data-tone="neutral"
                        onClick={handleDuplicateActiveView}
                      >
                        <Copy style={{ width: 12, height: 12 }} />
                        {labels.duplicate}
                      </Box>
                    )}

                    {activeView && (
                      <Box
                        as="button"
                        type="button"
                        data-part="action-button"
                        data-tone="neutral"
                        onClick={handleShareActiveView}
                      >
                        <Share2 style={{ width: 12, height: 12 }} />
                        {shareState === 'copied' ? labels.copied : labels.share}
                      </Box>
                    )}

                    {onSaveCurrentView && (
                      <Box
                        as="button"
                        type="button"
                        data-part="action-button"
                        data-tone="primary"
                        onClick={() => {
                          onSaveCurrentView();
                          closeMenu();
                        }}
                      >
                        <BookmarkPlus style={{ width: 12, height: 12 }} />
                        {labels.saveCurrent}
                      </Box>
                    )}
                  </Flex>
                </Box>
              )}
            </Box>

            <Box style={{ padding: '12px 12px 10px', maxHeight: 420, overflowY: 'auto' }}>
              {systemViews.length > 0 && (
                <Section title={labels.systemViewsSection} count={systemViews.length}>
                  {systemViews.map((view) => (
                    <ViewItem
                      key={view.key}
                      view={view}
                      isActive={view.key === activeView?.key}
                      onSelect={handleSelect}
                      labels={labels}
                    />
                  ))}
                </Section>
              )}

              {personaViews.length > 0 && (
                <Section title={labels.personaViewsSection} count={personaViews.length}>
                  {personaViews.map((view) => (
                    <ViewItem
                      key={view.key}
                      view={view}
                      isActive={view.key === activeView?.key}
                      onSelect={handleSelect}
                      labels={labels}
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
                <Section title={labels.customViewsSection} count={customViews.length}>
                  {customViews.map((view) => (
                    <ViewItem
                      key={view.key}
                      view={view}
                      isActive={view.key === activeView?.key}
                      onSelect={handleSelect}
                      labels={labels}
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
                  data-part="empty-state"
                  data-empty-state="persona"
                  style={{
                    padding: '18px 16px',
                  }}
                >
                  <Flex align="start" gap={10}>
                    <Sparkles data-part="empty-state-icon" style={{ width: 16, height: 16, marginTop: 2 }} />
                    <Box style={{ minWidth: 0 }}>
                      <Text data-part="empty-state-title" size="sm" weight="medium" style={{ display: 'block' }}>
                        {labels.noPersonaTitle}
                      </Text>
                      <Text
                        data-part="empty-state-description"
                        size="xs"
                        style={{
                          display: 'block',
                          marginTop: 4,
                        }}
                      >
                        {labels.noPersonaDescription}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              )}

              {views.length === 0 && (
                <Box
                  data-part="empty-state"
                  data-empty-state="all"
                  style={{
                    padding: '28px 16px',
                    textAlign: 'center' as const,
                  }}
                >
                  <Sparkles
                    data-part="empty-state-icon"
                    style={{
                      width: 18,
                      height: 18,
                      margin: '0 auto 8px',
                    }}
                  />
                  <Text data-part="empty-state-title" size="sm" weight="medium" style={{ display: 'block' }}>
                    {labels.noViewsTitle}
                  </Text>
                  <Text
                    data-part="empty-state-description"
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                    }}
                  >
                    {labels.noViewsDescription}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
          </PortalScope>
        </Portal>
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
        <Box as="span" data-part="section-header">
          {title}
        </Box>
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
  labels: SavedViewsMenuLabels;
  onDelete?: (event: React.MouseEvent) => void;
}

function ViewItem({ view, isActive, onSelect, labels, onDelete }: ViewItemProps) {
  const kindLabel = getViewKindLabel(view, labels);

  return (
    <Box
      data-part="view-item"
      data-active={isActive}
      style={{
        width: '100%',
        padding: 0,
      }}
    >
      <Flex align="stretch" justify="between" gap={6}>
        <button
          type="button"
          data-part="view-item-select"
          onClick={() => onSelect(view.key)}
          style={{
            minWidth: 0,
            flex: 1,
            padding: 12,
            textAlign: 'start' as const,
            cursor: 'pointer',
          }}
        >
          <Flex align="start" justify="between" gap={12}>
            <Flex align="start" gap={10} style={{ minWidth: 0, flex: 1 }}>
              <ViewGlyph isSystem={view.isSystem} active={isActive} />
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Flex align="center" gap={6} wrap="wrap">
                  <Text
                    data-part="view-item-label"
                    size="sm"
                    weight={isActive ? 'medium' : undefined}
                    style={{
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {view.label}
                  </Text>
                  {isActive && <StatusPill label={labels.current} tone="primary" />}
                  {view.isDefault && <StatusPill label={labels.default} tone="neutral" />}
                  <StatusPill label={kindLabel} tone="neutral" />
                </Flex>
                <Text
                  data-part="view-item-description"
                  size="xs"
                  style={{
                    display: 'block',
                    marginTop: 5,
                  }}
                >
                  {describeView(view, labels)}
                </Text>
              </Box>
            </Flex>
            {isActive && (
              <Check
                data-part="checkmark"
                data-active={true}
                style={{
                  width: 14,
                  height: 14,
                  flexShrink: 0,
                }}
              />
            )}
          </Flex>
        </button>
        {onDelete && (
          <button
            type="button"
            data-part="delete"
            onClick={onDelete}
            aria-label={`${labels.deletePrefix} ${view.label}`}
            style={{
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              marginInlineEnd: 8,
              cursor: 'pointer',
            }}
          >
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        )}
      </Flex>
    </Box>
  );
}

function ViewGlyph({ isSystem, active }: { isSystem?: boolean; active?: boolean }) {
  const Icon = isSystem ? LayoutTemplate : Bookmark;
  return (
    <Box
      data-part="glyph"
      data-active={!!active}
      style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: 14, height: 14 }} />
    </Box>
  );
}

function CountPill({ label }: { label: string }) {
  return (
    <Box
      data-part="count-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 22,
        padding: '0 8px',
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
      data-part="status-pill"
      data-tone={tone}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 20,
        padding: '0 8px',
      }}
    >
      {tone === 'primary' ? <Star style={{ width: 10, height: 10 }} /> : null}
      {label}
    </Box>
  );
}

function describeView(view: SavedViewsMenuEntry, labels: SavedViewsMenuLabels): string {
  const details: string[] = [];

  if (view.state.query) details.push(`${labels.queryPrefix}: ${view.state.query}`);
  if (view.state.scope) details.push(`${labels.scopePrefix}: ${view.state.scope}`);
  if (view.state.filters?.length) {
    details.push(`${view.state.filters.length} ${view.state.filters.length === 1 ? labels.filterSingular : labels.filterPlural}`);
  }
  if (view.state.visibleColumns?.length) details.push(`${view.state.visibleColumns.length} ${labels.columnsSuffix}`);
  if (view.state.sort?.field) details.push(`${labels.sortedByPrefix} ${view.state.sort.field}`);
  if (view.state.density) details.push(`${view.state.density} ${labels.densitySuffix}`);

  return details.length > 0 ? details.slice(0, 3).join(' • ') : labels.emptyDescription;
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
