'use client';

/**
 * @fileoverview RecordWorkbenchSurface - entity detail page with tabs and actions.
 *
 * Enhanced DetailSurface with: tab management, related records, action toolbar,
 * history/audit trail, sidebar metadata.
 *
 * For: user detail, candidate profile, event detail, order detail, etc.
 *
 * Composition notes (SU35): the surface coordinates primitives and the shared
 * state kits; it does NOT rebuild headers. DetailHeader (S08) and
 * WorkbenchHeader (PT32) were evaluated and rejected — the pinned anatomy
 * (`__status-badge[data-part]`, `__action[data-action-variant]`,
 * `__tab[data-active]`, `__tab-badge[data-part]`) is surface-owned, and both
 * candidates require chrome this contract does not declare (backHref,
 * saved-views, archetypes). The APG tab keyboard contract mirrors the
 * DetailHeader tab-strip implementation. Record structures (S12 content,
 * S13 edit-fields, S14 form-sections) compose INSIDE `tab.render()`, which
 * stays consumer-owned.
 */

import React, { useState, useCallback, useId } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { Box } from '../../../../../primitives/layout/Box';
import { Stack } from '../../../../../primitives/layout/Stack';
import { Flex } from '../../../../../primitives/layout/Flex';
import { Text } from '../../../../../primitives/display/Typography';
import { Button } from '../../../../../primitives/inputs/Button';
import { Skeleton } from '../../../../../primitives/feedback/Skeleton';
import { ContentDocumentIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-document';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecordTab {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  render: () => ReactNode;
  /** Per-tab empty state, shown when `render()` returns nullish content. */
  emptyState?: ReactNode;
}

export interface RecordAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'default';
  onClick: () => void;
  disabled?: boolean;
  /** Busy state for async actions (spinner + interaction lock). */
  loading?: boolean;
}

export interface MetadataField {
  key: string;
  label: string;
  value: ReactNode;
}

export interface RecordWorkbenchSurfaceProps {
  /** Record title (entity name, user name, etc.). */
  title: string;
  /** Subtitle or description. */
  subtitle?: string;
  /** Status badge. */
  status?: { label: string; variant?: 'success' | 'warning' | 'error' | 'info' | 'default' };
  /** Avatar or icon for the record. */
  avatar?: ReactNode;

  /** Tabs for the record detail sections. */
  tabs: RecordTab[];
  /** Default active tab key. */
  defaultTab?: string;
  /** Controlled active tab. */
  activeTab?: string;
  /** Tab change handler. */
  onTabChange?: (tabKey: string) => void;

  /** Action buttons (edit, delete, archive, etc.). */
  actions?: RecordAction[];

  /** Sidebar metadata fields. */
  metadata?: MetadataField[];
  /** Sidebar width. */
  sidebarWidth?: string;
  /** Force the sidebar on even with no metadata fields. */
  showSidebar?: boolean;
  /** Hide sidebar. */
  hideSidebar?: boolean;

  /** Related records section (shown below tabs). */
  relatedRecords?: ReactNode;

  /** Breadcrumbs slot. */
  breadcrumbs?: ReactNode;
  /** Header slot (above title). */
  headerSlot?: ReactNode;
  /** Footer slot. */
  footerSlot?: ReactNode;

  /** Loading state. */
  loading?: boolean;
  /** Load/render failure — replaces the work area with a retry-able error. */
  error?: unknown;
  /** Retry handler for the error state. */
  onRetry?: () => void | Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map the surface-level action vocabulary onto the Button primitive variants. */
function resolveRecordActionVariant(
  variant: RecordAction['variant'],
): 'primary' | 'danger' | 'secondary' {
  if (variant === 'primary') return 'primary';
  if (variant === 'danger') return 'danger';
  return 'secondary';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecordWorkbenchSurface(props: RecordWorkbenchSurfaceProps) {
  const {
    title,
    subtitle,
    status,
    avatar,
    tabs,
    defaultTab,
    activeTab: controlledTab,
    onTabChange,
    actions,
    metadata,
    sidebarWidth = '280px',
    showSidebar: forceSidebar,
    hideSidebar,
    relatedRecords,
    breadcrumbs,
    headerSlot,
    footerSlot,
    loading,
    error,
    onRetry,
  } = props;

  const { tSurfaceOr } = useSurfaceTranslations();
  const { isMobile } = useBreakpoints();

  const instanceId = useId();
  const tabId = (key: string) => `${instanceId}-tab-${key}`;
  const panelId = (key: string) => `${instanceId}-panel-${key}`;
  const sidebarTitleId = `${instanceId}-sidebar-title`;

  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.key ?? '');
  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = useCallback(
    (key: string) => {
      setInternalTab(key);
      onTabChange?.(key);
    },
    [onTabChange],
  );

  /**
   * APG tab keyboard contract (mirrors the DetailHeader tab strip): tabs are
   * real Buttons, so Enter/Space activate natively; the arrow keys
   * (direction-aware under RTL), Home and End move focus between tabs without
   * activating them (manual-activation model, roving tabindex below).
   */
  const handleTabKeyDown = useCallback((event: ReactKeyboardEvent) => {
    const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!navKeys.includes(event.key)) {
      return;
    }
    event.preventDefault();
    const currentTab = event.currentTarget as HTMLElement;
    const strip = currentTab.closest('[data-part="tab-list"]');
    const stripTabs = Array.from(
      strip?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [],
    );
    const currentIndex = stripTabs.indexOf(currentTab);
    if (currentIndex < 0) {
      return;
    }
    const rtl = Boolean(currentTab.closest('[dir="rtl"]'));
    let nextIndex = currentIndex;
    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = stripTabs.length - 1;
    } else {
      const forward = event.key === 'ArrowRight' ? !rtl : rtl;
      nextIndex =
        (currentIndex + (forward ? 1 : -1) + stripTabs.length) % stripTabs.length;
    }
    stripTabs[nextIndex]?.focus();
  }, []);

  const activeTabContent = tabs.find((t) => t.key === activeTab);
  const hasTabs = tabs.length > 0;
  const showSidebar =
    !hideSidebar && (forceSidebar || (metadata && metadata.length > 0));

  // The active tab's rendered content; a nullish render (or a missing tab)
  // resolves to the per-tab empty slot or the shared empty-state kit. The
  // consumer render only runs for the settled (non-loading, non-error) view.
  const isSettled = !loading && (error === undefined || error === null);
  const renderedTabContent = isSettled ? activeTabContent?.render() : undefined;
  const tabPanelBody =
    renderedTabContent ??
    activeTabContent?.emptyState ?? (
      <SurfaceEmptyState
        icon={<ContentDocumentIcon decorative size={32} />}
        title={tSurfaceOr('record_workbench.empty_tab_title', 'Nothing here yet')}
        description={tSurfaceOr(
          'record_workbench.empty_tab_description',
          'This section has no content for this record yet.',
        )}
      />
    );

  return (
    <Stack
      className="ds-surface ds-record-workbench"
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      data-mobile={isMobile ? 'true' : 'false'}
      spacing="md"
      aria-busy={loading ? 'true' : undefined}
    >
      {headerSlot}
      {breadcrumbs}

      {loading && (
        <Text
          as="span"
          className="ds-record-workbench__loading-label"
          data-part="loading-label"
        >
          {tSurfaceOr('record_workbench.loading_label', 'Loading record…')}
        </Text>
      )}

      {/* Record header */}
      <Flex className="ds-record-workbench__header" data-part="header" align="center" gap={4} wrap="wrap">
        {loading ? (
          <Flex
            className="ds-record-workbench__identity"
            align="center"
            gap={4}
            aria-hidden="true"
          >
            {avatar && <Skeleton variant="circular" width={40} height={40} />}
            <Box className="ds-record-workbench__identity-text">
              <Skeleton variant="text" width="40%" height={24} />
              {subtitle && (
                <Skeleton
                  className="ds-record-workbench__skeleton-subtitle"
                  variant="text"
                  width="25%"
                  height={16}
                />
              )}
            </Box>
          </Flex>
        ) : (
          <>
            {avatar && <Box className="ds-record-workbench__avatar">{avatar}</Box>}
            <Box className="ds-record-workbench__identity">
              <Flex align="center" gap={2} wrap="wrap">
                <Text className="ds-record-workbench__title" data-part="title" size="xl" weight="semibold">{title}</Text>
                {status && (
                  <span
                    className="ds-record-workbench__status-badge"
                    data-part="status-badge"
                    data-variant={status.variant ?? 'default'}
                  >
                    {status.label}
                  </span>
                )}
              </Flex>
              {subtitle && <Text className="ds-record-workbench__muted-text" size="sm" color="muted">{subtitle}</Text>}
            </Box>
          </>
        )}

        {/* Action buttons */}
        {actions && actions.length > 0 && (
          <Flex className="ds-record-workbench__actions" gap={2} wrap="wrap">
            {actions.map((action) => (
              <Button
                className="ds-record-workbench__action"
                data-action-variant={action.variant ?? 'default'}
                key={action.key}
                variant={resolveRecordActionVariant(action.variant)}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || loading}
                loading={action.loading}
                icon={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </Flex>
        )}
      </Flex>

      {/* Error state replaces the work area; the record identity stays visible. */}
      {error !== undefined && error !== null && !loading ? (
        <SurfaceErrorState error={error} onRetry={onRetry} />
      ) : (
        <>
          {/* Tab bar */}
          {loading ? (
            <Flex
              className="ds-record-workbench__tab-list"
              data-part="tab-list"
              data-loading="true"
              gap={2}
              aria-hidden="true"
            >
              <Skeleton variant="rounded" width={96} height={32} />
              <Skeleton variant="rounded" width={96} height={32} />
              <Skeleton variant="rounded" width={96} height={32} />
            </Flex>
          ) : hasTabs ? (
            <div
              className="ds-record-workbench__tab-list"
              data-part="tab-list"
              role="tablist"
              aria-label={tSurfaceOr('record_workbench.tabs_aria', 'Record sections')}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Button
                    className="ds-record-workbench__tab"
                    data-active={isActive ? 'true' : 'false'}
                    key={tab.key}
                    id={tabId(tab.key)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={isActive ? panelId(tab.key) : undefined}
                    tabIndex={isActive ? 0 : -1}
                    variant="ghost"
                    onClick={() => handleTabChange(tab.key)}
                    onKeyDown={handleTabKeyDown}
                    icon={tab.icon}
                  >
                    {tab.label}
                    {tab.badge !== undefined && (
                      <span
                        className="ds-record-workbench__tab-badge"
                        data-part="tab-badge"
                      >
                        {tab.badge}
                      </span>
                    )}
                    {/* Active indicator: surface-owned element because the
                        modern Button engine layer owns ghost border/box-shadow
                        (see skin LAYER TRUTH). Decorative; the active state is
                        already exposed via aria-selected. */}
                    <span
                      className="ds-record-workbench__tab-underline"
                      data-part="tab-underline"
                      aria-hidden="true"
                    />
                  </Button>
                );
              })}
            </div>
          ) : null}

          {/* Content area with optional sidebar */}
          <Flex className="ds-record-workbench__content" data-part="content" gap={5}>
            {/* Main content */}
            <Box
              className="ds-record-workbench__tabpanel"
              data-part="tabpanel"
              role={hasTabs ? 'tabpanel' : undefined}
              id={hasTabs ? panelId(activeTab) : undefined}
              aria-labelledby={hasTabs ? tabId(activeTab) : undefined}
            >
              {loading ? (
                <Skeleton
                  className="ds-record-workbench__skeleton-content"
                  variant="rounded"
                  width="100%"
                  height={160}
                />
              ) : (
                tabPanelBody
              )}

              {/* Related records */}
              {relatedRecords && !loading && (
                <Box className="ds-record-workbench__related" data-part="related">
                  {relatedRecords}
                </Box>
              )}
            </Box>

            {/* Sidebar */}
            {showSidebar && (
              <Box
                as="aside"
                className="ds-record-workbench__sidebar"
                data-part="sidebar"
                aria-labelledby={loading ? undefined : sidebarTitleId}
                style={
                  {
                    '--_ds-instance-record-workbench-sidebar-width': sidebarWidth,
                  } as React.CSSProperties
                }
              >
                {loading ? (
                  <Stack spacing="sm" aria-hidden="true">
                    <Skeleton variant="text" width="50%" height={16} />
                    <Skeleton variant="text" width="100%" height={14} />
                    <Skeleton variant="text" width="100%" height={14} />
                    <Skeleton variant="text" width="75%" height={14} />
                  </Stack>
                ) : (
                  <>
                    <Text
                      id={sidebarTitleId}
                      className="ds-record-workbench__sidebar-title"
                      data-part="sidebar-title"
                      size="sm"
                      weight="medium"
                    >
                      {tSurfaceOr('record_workbench.details_title', 'Details')}
                    </Text>
                    <Stack spacing="sm">
                      {(metadata ?? []).map((field) => (
                        <Box className="ds-record-workbench__field" key={field.key}>
                          <Text className="ds-record-workbench__muted-text" size="xs" color="muted">{field.label}</Text>
                          <Box className="ds-record-workbench__field-value">
                            {typeof field.value === 'string' ? (
                              <Text size="sm">{field.value}</Text>
                            ) : (
                              field.value
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            )}
          </Flex>
        </>
      )}

      {footerSlot}
    </Stack>
  );
}
