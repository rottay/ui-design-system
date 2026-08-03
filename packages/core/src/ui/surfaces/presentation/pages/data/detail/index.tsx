"use client";

/**
 * @fileoverview DetailSurface - Rottay Design System
 * @description Reusable detail-page shell that combines adapter mapping,
 * app-resolved actions, tabs, and sidebar content.
 *
 * @remarks
 * The detail surface keeps page-level chrome standardized while allowing apps
 * to supply field rendering and item-specific tab content.
 *
 * When `chrome` is configured (breadcrumbs, back, maxWidth), the surface wraps
 * the detail panel in a `PageShellSurface` so the user gets a two-tier premium
 * layout: PageShell provides the page-level chrome (breadcrumbs, title, back
 * navigation), while DetailPanel renders entity-specific content (tabs,
 * sidebar, actions, avatar, status).
 */

import { Box, Stack } from "../../../../../primitives";
import { PatternDetailPanel, resolveRowKey } from "../../../../../patterns";
import { FadeIn, recordTransitionName } from "@/graphics/motion";
import { useBreakpoints } from "@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state";
import {
  filterDetailSurfaceTabs,
  filterSurfaceActions,
  isAllSurfaceAccess,
  resolveSurfaceCapabilityRegistry,
  resolveSurfaceDetailActionVariant,
} from "../../../../runtime/helpers";
import { useSurfaceTranslations } from "../../../../runtime/helpers/states/i18n";
import { useSurfaceProfileDefaultsWithOverrides } from "../../../../runtime/profile-defaults/overrides";
import type {
  DetailSurfaceConfig,
  EntityAdapter,
  SurfaceCapabilityRegistration,
} from "../../../../foundation/contracts";
import {
  SurfaceCapabilityAnatomy,
  SurfaceEmptyState,
  SurfaceErrorState,
} from "../../../../runtime/helpers/states";
import { PageShellSurface } from "../../../../composition/layout/page-shell";

export interface DetailSurfaceProps<TRaw, TView> {
  data?: TRaw | null;
  adapter: EntityAdapter<TRaw, TView>;
  config: DetailSurfaceConfig<TView>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

function resolveDetailErrorCapabilities<TRaw, TView>(
  adapter: EntityAdapter<TRaw, TView>,
  config: DetailSurfaceConfig<TView>
): SurfaceCapabilityRegistration[] {
  const access = config.access;
  const includeStaticHidden = isAllSurfaceAccess(access);
  const registrations: SurfaceCapabilityRegistration[] = [
    ...adapter.fields.map((field) => ({
      kind: "field" as const,
      id: field.fieldId,
      label: field.label ?? field.key,
    })),
    ...(config.presentation.tabs ?? [])
      .filter((tab) => includeStaticHidden || tab.visible !== false)
      .map((tab) => ({
        kind: "tab" as const,
        id: tab.capabilityId ?? tab.permissionId ?? tab.key,
        label: tab.label,
        disabled: tab.disabled,
      })),
    ...(config.behavior.actions ?? []).map((action) => ({
      kind: "action" as const,
      id: action.id,
      label: action.label,
      disabled: action.disabled,
    })),
  ];

  return resolveSurfaceCapabilityRegistry(registrations, access);
}

/** Detail-page shell with adapter mapping, action normalization, and tab filtering. */
export function DetailSurface<TRaw, TView>({
  data,
  adapter,
  config,
  loading = false,
  error,
  onRetry,
}: DetailSurfaceProps<TRaw, TView>): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { isMobile } = useBreakpoints();

  if (error) {
    const capabilities = resolveDetailErrorCapabilities(adapter, config);
    return (
      <Box
        className="ds-surface ds-detail-surface"
        data-part="root"
        data-state="error"
        data-capability-count={capabilities.length}
      >
        <Box data-part="error-state" aria-live="polite">
          <SurfaceErrorState error={error} onRetry={onRetry} />
        </Box>
        <SurfaceCapabilityAnatomy
          capabilities={capabilities}
          ariaLabel="Registered detail capabilities"
        />
      </Box>
    );
  }

  // Empty state only shows when not loading -- showing "not found" while data
  // is still in-flight would flash a misleading screen.
  if (!data && !loading) {
    return (
      <Box
        className="ds-surface ds-detail-surface"
        data-part="root"
        data-state="empty"
      >
        {config.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface("detail.empty_title")}
            description={tSurface("detail.empty_description")}
          />
        )}
      </Box>
    );
  }

  // The adapter transforms raw API/DB data into the view model that the
  // surface config expects. This keeps the surface decoupled from the
  // backend shape and lets the same config work across different data sources.
  const item = data ? adapter.map(data) : undefined;

  // Convert the surface action vocabulary into the narrower detail-panel contract.
  const actions = item
    ? filterSurfaceActions(config.behavior.actions, config.access, item).map(
        (action) => ({
          key: action.id,
          label: action.label,
          icon: action.icon,
          /**
           * DetailPanel exposes a narrower variant union than the generic
           * surface layer, so we explicitly translate here instead of leaking a
           * looser string type into the pattern contract.
           */
          variant: resolveSurfaceDetailActionVariant(action.variant),
          onClick: () => action.onClick?.(item),
          disabled: action.disabled,
          loading: action.loading,
        })
      )
    : [];

  // Tabs are filtered after mapping the item so `visible` and `badge` callbacks can inspect real data.
  const visibleTabs = item
    ? filterDetailSurfaceTabs(
        config.presentation.tabs,
        config.access,
        item
      ).map((tab) => ({
        key: tab.key,
        label: tab.label,
        icon: tab.icon,
        content: tab.content(item),
        badge: typeof tab.badge === "function" ? tab.badge(item) : tab.badge,
        disabled: tab.disabled,
      }))
    : [];
  // Validate that the configured active tab actually exists in the visible
  // set. If the active tab was hidden by access or visibility rules,
  // fall back to the first visible tab to avoid a blank content area.
  const resolvedActiveTab = visibleTabs.some(
    (tab) => tab.key === config.behavior.activeTab
  )
    ? config.behavior.activeTab
    : visibleTabs[0]?.key;
  // When activeTab is undefined the Tabs component manages its own state
  // (uncontrolled mode). We track this so we pass the right prop.
  const isControlledTabState = config.behavior.activeTab !== undefined;
  const resolvedSidebar = item
    ? config.presentation.sidebar?.(item)
    : undefined;
  const shouldCollapseSidebarOnMobile =
    isMobile &&
    !!resolvedSidebar &&
    config.visual.collapseSidebarOnMobile !== false;
  const resolvedFooter =
    item &&
    (config.presentation.footer?.(item) || shouldCollapseSidebarOnMobile) ? (
      <Stack spacing="md">
        {config.presentation.footer?.(item)}
        {shouldCollapseSidebarOnMobile ? resolvedSidebar : null}
      </Stack>
    ) : undefined;

  // Determine whether we have page-level chrome that warrants wrapping
  // the detail panel in a PageShell for the premium two-tier layout.
  const hasPageChrome = !!(
    config.presentation.chrome?.breadcrumbs?.length ||
    config.presentation.chrome?.back
  );

  // PageShell expects a plain string title. Priority:
  // 1. Explicit chrome.pageTitle (cleanest -- always a string)
  // 2. If title() returns a string, use it directly (safe, no coercion)
  // 3. Loading state falls back to generic label
  // 4. Empty string only if title() returns a non-string ReactNode (rare)
  const derivedTitle = item ? config.presentation.title(item) : undefined;
  const pageTitle =
    config.presentation.chrome?.pageTitle ??
    (typeof derivedTitle === "string"
      ? derivedTitle
      : loading
      ? tSurface("detail.loading")
      : "");

  // A record-derived name pairs this detail body with the list card that
  // resolves the SAME key (see ListSurfaceBehaviorConfig.rowKey +
  // resolveRowKey), producing a real element morph. Unlike the list, the
  // detail surface has no array index to fall back to, so without a
  // configured recordKey there is no reliable per-record identity here; the
  // body keeps a constant name instead of guessing one that could morph
  // from the wrong list card.
  const detailTransitionName =
    item && config.behavior.recordKey !== undefined
      ? recordTransitionName(resolveRowKey(item, config.behavior.recordKey, 0))
      : "ds-vt-detail-body";

  const detailPanel = (
    <Box
      className="ds-surface ds-detail-surface__panel"
      data-part="detail-panel"
      style={{
        // Record-derived seam when recordKey is configured, else the coarse
        // constant detail-body seam. Inert outside an active view transition.
        viewTransitionName: detailTransitionName,
      }}
    >
      <PatternDetailPanel
        data={item as TView}
        /* When wrapped in PageShell, the page-level heading shows the title.
             DetailPanel suppresses its own <h2> to avoid a double heading.
             The entity header still shows avatar, status, subtitle, and actions. */
        title={
          hasPageChrome
            ? undefined
            : item
            ? config.presentation.title(item)
            : tSurface("detail.loading")
        }
        subtitle={item ? config.presentation.subtitle?.(item) : undefined}
        avatar={item ? config.presentation.avatar?.(item) : undefined}
        status={item ? config.presentation.status?.(item) : undefined}
        tabs={visibleTabs}
        actions={actions}
        sidebar={shouldCollapseSidebarOnMobile ? undefined : resolvedSidebar}
        sidebarPosition={config.visual.sidebarPosition}
        sidebarWidth={config.visual.sidebarWidth}
        headerExtra={item ? config.presentation.headerExtra?.(item) : undefined}
        footer={resolvedFooter}
        activeTab={isControlledTabState ? resolvedActiveTab : undefined}
        onTabChange={config.behavior.onTabChange}
        loading={loading}
        breadcrumbs={
          hasPageChrome ? undefined : config.presentation.chrome?.breadcrumbs
        }
        onBack={
          hasPageChrome ? undefined : config.presentation.chrome?.back?.onClick
        }
      />
    </Box>
  );

  // When page chrome is present, wrap the detail panel in a PageShellSurface
  // so breadcrumbs, back navigation, and the page title sit above the detail
  // card as a cohesive premium page frame.
  const detailContent = hasPageChrome ? (
    <PageShellSurface
      chrome={{
        title: pageTitle,
        breadcrumbs: config.presentation.chrome?.breadcrumbs,
        back: config.presentation.chrome?.back,
        maxWidth: config.presentation.chrome?.maxWidth,
      }}
      loading={loading}
    >
      {detailPanel}
    </PageShellSurface>
  ) : (
    /* No page chrome: the surface frames the panel itself. The margin is a
       skin-owned logical property (RTL-safe); only the config-driven
       max-width stays inline (dynamic geometry, not paint). */
    <Box
      className="ds-detail-surface__frame"
      data-part="detail-frame"
      data-framed={config.presentation.chrome?.maxWidth ? "true" : "false"}
      style={{
        maxWidth: config.presentation.chrome?.maxWidth,
      }}
    >
      {detailPanel}
    </Box>
  );

  // State-consistent root anatomy (error/empty carry the same pair above).
  // The skin keeps this wrapper layout-inert while preserving a queryable
  // state boundary for integrations and tests.
  const readyRoot = (content: React.ReactNode) => (
    <Box
      className="ds-surface ds-detail-surface"
      data-part="root"
      data-state={loading ? "loading" : "ready"}
    >
      {content}
    </Box>
  );

  if (profileDefaults.animateEntrance) {
    return readyRoot(
      <FadeIn durationMs={profileDefaults.entranceDuration}>
        {detailContent}
      </FadeIn>
    );
  }

  return readyRoot(detailContent);
}
