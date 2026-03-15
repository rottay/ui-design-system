'use client';

/**
 * DetailSurface
 *
 * Wraps the generic detail panel pattern with:
 * - adapter mapping
 * - field/action permission filtering
 * - function-based tab/sidebar/header rendering
 */

import { Box } from '../../primitives';
import { PatternDetailPanel } from '../../patterns';
import { FadeIn } from '../../../animations';
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

export interface DetailSurfaceProps<TRaw, TView> {
  data?: TRaw | null;
  adapter: EntityAdapter<TRaw, TView>;
  config: DetailSurfaceConfig<TView>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

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

  if (error) {
    return (
      <Box>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </Box>
    );
  }

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

  const item = data ? adapter.map(data) : undefined;

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
  const resolvedActiveTab =
    visibleTabs.some((tab) => tab.key === config.behavior.activeTab)
      ? config.behavior.activeTab
      : visibleTabs[0]?.key;
  const isControlledTabState = config.behavior.activeTab !== undefined;

  const detailContent = (
    <Box
      style={{
        maxWidth: config.presentation.chrome?.maxWidth,
        margin: config.presentation.chrome?.maxWidth ? '0 auto' : undefined,
        position: profileDefaults.accentPosition !== 'none' ? 'relative' : undefined,
        overflow: profileDefaults.accentPosition !== 'none' ? 'hidden' : undefined,
      }}
    >
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
          title={item ? config.presentation.title(item) : tSurface('detail.loading')}
          subtitle={item ? config.presentation.subtitle?.(item) : undefined}
          avatar={item ? config.presentation.avatar?.(item) : undefined}
          status={item ? config.presentation.status?.(item) : undefined}
          tabs={visibleTabs}
          actions={actions}
          sidebar={item ? config.presentation.sidebar?.(item) : undefined}
          sidebarPosition={config.visual.sidebarPosition}
          sidebarWidth={config.visual.sidebarWidth}
          onBack={config.presentation.chrome?.back?.onClick}
          headerExtra={item ? config.presentation.headerExtra?.(item) : undefined}
          footer={item ? config.presentation.footer?.(item) : undefined}
          breadcrumbs={config.presentation.chrome?.breadcrumbs}
          activeTab={isControlledTabState ? resolvedActiveTab : undefined}
          onTabChange={config.behavior.onTabChange}
          loading={loading}
        />
      </Box>
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
