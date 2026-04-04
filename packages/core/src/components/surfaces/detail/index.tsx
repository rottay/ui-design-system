'use client';

/**
 * @fileoverview DetailSurface - Rottay Design System
 * @description Reusable detail-page shell that combines adapter mapping,
 * permission-aware actions, tabs, and sidebar content.
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

import { Box, Stack } from '../../primitives';
import { PatternDetailPanel } from '../../patterns';
import { FadeIn } from '../../../motion';
import { useBreakpoints } from '../../../hooks/responsive/useBreakpoints';
import {
  filterDetailSurfaceTabs,
  filterSurfaceActions,
  resolveSurfaceDetailActionVariant,
} from '../helpers';
import { useSurfaceTranslations } from '../i18n';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { SurfaceAccentBar } from '../personality-helpers';
import type { DetailSurfaceConfig, EntityAdapter } from '../types';
import { SurfaceEmptyState, SurfaceErrorState } from '../states';
import { PageShellSurface } from '../page-shell';

export interface DetailSurfaceProps<TRaw, TView> {
  data?: TRaw | null;
  adapter: EntityAdapter<TRaw, TView>;
  config: DetailSurfaceConfig<TView>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
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
  const profileDefaults = useSurfaceProfileDefaults();
  const { isMobile } = useBreakpoints();

  if (error) {
    return (
      <Box>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </Box>
    );
  }

  // Empty state only shows when not loading -- showing "not found" while data
  // is still in-flight would flash a misleading screen.
  if (!data && !loading) {
    return (
      <Box>
        {config.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface('detail.empty_title')}
            description={tSurface('detail.empty_description')}
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
    ? filterSurfaceActions(config.behavior.actions, config.permissions, item).map((action) => ({
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
      }))
    : [];

  // Tabs are filtered after mapping the item so `visible` and `badge` callbacks can inspect real data.
  const visibleTabs = item
    ? filterDetailSurfaceTabs(config.presentation.tabs, config.permissions, item).map((tab) => ({
        key: tab.key,
        label: tab.label,
        icon: tab.icon,
        content: tab.content(item),
        badge: typeof tab.badge === 'function' ? tab.badge(item) : tab.badge,
        disabled: tab.disabled,
      }))
    : [];
  // Validate that the configured active tab actually exists in the visible
  // set. If the active tab was hidden by permissions or visibility rules,
  // fall back to the first visible tab to avoid a blank content area.
  const resolvedActiveTab =
    visibleTabs.some((tab) => tab.key === config.behavior.activeTab)
      ? config.behavior.activeTab
      : visibleTabs[0]?.key;
  // When activeTab is undefined the Tabs component manages its own state
  // (uncontrolled mode). We track this so we pass the right prop.
  const isControlledTabState = config.behavior.activeTab !== undefined;
  const resolvedSidebar = item ? config.presentation.sidebar?.(item) : undefined;
  const shouldCollapseSidebarOnMobile =
    isMobile && !!resolvedSidebar && config.visual.collapseSidebarOnMobile !== false;
  const resolvedFooter =
    item && (config.presentation.footer?.(item) || shouldCollapseSidebarOnMobile) ? (
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
  const pageTitle = config.presentation.chrome?.pageTitle
    ?? (typeof derivedTitle === 'string' ? derivedTitle : (loading ? tSurface('detail.loading') : ''));

  const detailPanel = (
    <Box
      style={{
        position: profileDefaults.accentPosition !== 'none' ? 'relative' : undefined,
        overflow: profileDefaults.accentPosition !== 'none' ? 'hidden' : undefined,
      }}
    >
      {/* Accent bars are rendered at the surface layer so patterns remain presentation-agnostic. */}
      {profileDefaults.accentPosition !== 'none' && (
        <SurfaceAccentBar
          position={profileDefaults.accentPosition}
          thickness={profileDefaults.accentBarThickness}
          barStyle={profileDefaults.accentBarStyle}
        />
      )}
      <Box
        style={
          profileDefaults.accentPosition === 'left'
            ? { paddingLeft: profileDefaults.accentBarThickness + 4 }
            : profileDefaults.accentPosition === 'top'
              ? { paddingTop: profileDefaults.accentBarThickness }
              : undefined
        }
      >
        <PatternDetailPanel
          data={item as TView}
          /* When wrapped in PageShell, the page-level heading shows the title.
             DetailPanel suppresses its own <h2> to avoid a double heading.
             The entity header still shows avatar, status, subtitle, and actions. */
          title={hasPageChrome ? undefined : (item ? config.presentation.title(item) : tSurface('detail.loading'))}
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
          breadcrumbs={hasPageChrome ? undefined : config.presentation.chrome?.breadcrumbs}
          onBack={hasPageChrome ? undefined : config.presentation.chrome?.back?.onClick}
        />
      </Box>
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
    <Box
      style={{
        maxWidth: config.presentation.chrome?.maxWidth,
        margin: config.presentation.chrome?.maxWidth ? '0 auto' : undefined,
      }}
    >
      {detailPanel}
    </Box>
  );

  if (profileDefaults.animateEntrance) {
    return (
      <FadeIn duration={profileDefaults.entranceDuration}>
        {detailContent}
      </FadeIn>
    );
  }

  return detailContent;
}
