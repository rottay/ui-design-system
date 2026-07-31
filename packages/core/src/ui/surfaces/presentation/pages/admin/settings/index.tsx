'use client';

/**
 * @fileoverview SettingsSurface -- tabbed settings page shell.
 * @description Centralizes the repetitive settings route structure: title, intro copy,
 * action bar, tab navigation, and optional sidebar. Each app owns the actual settings
 * panels and field renderers.
 *
 * @remarks
 * Composition: PageShellSurface chrome + Tabs + Card + shared state kits
 * (loading skeleton, empty, error with retry). Visible copy resolves through
 * `tSurfaceOr` under `surfaces.settings.*` with an English floor, and visual
 * defaults cascade config -> product profile -> DS defaults via
 * `useSurfaceProfileDefaultsWithOverrides` (entrance animation, card variant,
 * section spacing, density).
 */

import React from 'react';
import { Card, Grid, Stack, Tabs, Text } from '../../../../../primitives';
import { FadeIn } from '@/graphics/motion';
import { NavigationSettingsIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-settings';
import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { filterSurfaceTabbedViews } from '../../../../runtime/helpers';
import type { SettingsSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';
import { SurfaceActionBar, SurfaceTabbedLabel } from '../../../../runtime/helpers/rendering';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';

export interface SettingsSurfaceProps {
  config: SettingsSurfaceConfig;
  loading?: boolean;
  /** Load/render failure surfaced as an error state (ListSurface prop precedent). */
  error?: unknown;
  /** Retry handler rendered inside the error state when provided. */
  onRetry?: () => void | Promise<void>;
}

function isEmptyTabLabel(label: React.ReactNode): boolean {
  return (
    label === null ||
    label === undefined ||
    label === false ||
    (typeof label === 'string' && label.trim() === '')
  );
}

export function SettingsSurface({
  config,
  loading = false,
  error,
  onRetry,
}: SettingsSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { shouldStack, isMobile } = useSurfaceResponsiveLayout(config.visual);
  const { tSurfaceOr } = useSurfaceTranslations();
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const isCompact = profileDefaults.density === 'compact';
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} access={config.access} />;
  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  // Permission-filtered tabs prevent users from seeing settings categories
  // they cannot access, avoiding "access denied" dead ends inside the page.
  const visibleTabs = filterSurfaceTabbedViews(config.behavior.tabs, config.access);

  // Fall back to the first visible tab if the requested active tab was
  // removed by final access filtering.
  const resolvedActiveTabKey =
    visibleTabs.some((tab) => tab.key === config.behavior.activeTab)
      ? config.behavior.activeTab
      : visibleTabs[0]?.key;
  const isControlledTabState = config.behavior.activeTab !== undefined;
  const singleVisibleTab = visibleTabs.length === 1 ? visibleTabs[0] : undefined;
  const shouldUnboxTabs =
    !!singleVisibleTab &&
    isEmptyTabLabel(singleVisibleTab.label) &&
    !singleVisibleTab.icon &&
    !singleVisibleTab.badge;
  const contentFrame = config.presentation.contentFrame ?? 'auto';
  const shouldRenderContentCard =
    contentFrame === 'card' || (contentFrame === 'auto' && !shouldUnboxTabs);
  const hasVisibleTabs = visibleTabs.length > 0;
  const resolvedView = !hasVisibleTabs ? 'empty' : shouldUnboxTabs ? 'single' : 'tabs';

  // Error keeps the real page chrome and action bar so a retry never loses
  // context (ListSurface precedent). The shared contract stays untouched:
  // error/onRetry arrive as component props, like ListSurface/AuditSurface.
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const renderTabContent = (tab: (typeof visibleTabs)[number]) => (
    <Stack spacing={sectionSpacing}>
      {tab.description && (
        // The muted ink rides the Typography `color` channel; the class is the
        // pinned anatomy hook (SurfacesLongTailBatch) and stays as a pure
        // landing target — no skin paint attached to it anymore.
        <Text className="ds-settings__muted-text" size="sm" color="muted">
          {tab.description}
        </Text>
      )}
      {tab.content}
    </Stack>
  );

  const tabsNode = (
    <Tabs
      items={visibleTabs.map((tab) => ({
        key: tab.key,
        label: <SurfaceTabbedLabel view={tab} />,
        icon: tab.icon,
        disabled: tab.disabled,
        children: renderTabContent(tab),
      }))}
      type={config.visual.tabsType ?? profileDefaults.tabsType}
      centered={config.visual.centeredTabs}
      activeKey={isControlledTabState ? resolvedActiveTabKey : undefined}
      defaultActiveKey={!isControlledTabState ? resolvedActiveTabKey : undefined}
      onChange={config.behavior.onTabChange}
    />
  );

  /*
    Loading keeps the real page chrome and renders a form-shaped body skeleton
    inside the same card frame the loaded content uses: PatternPageShell's
    `loading` early return never renders children, so a structural skeleton can
    only exist here. Row count scales with density to mirror the final
    sections footprint and avoid layout shift. The sidebar is a presentation
    slot (like the chrome), so it stays mounted while the body skeletonizes.
  */
  const contentBody = loading ? (
    <SurfaceLoadingSkeleton rows={isCompact ? 8 : 5} />
  ) : !hasVisibleTabs ? (
    <SurfaceEmptyState
      title={tSurfaceOr('settings.empty_title', 'No settings sections')}
      description={tSurfaceOr(
        'settings.empty_description',
        'There are no settings sections available.'
      )}
      icon={<NavigationSettingsIcon decorative size={32} />}
    />
  ) : (
    <Stack spacing={sectionSpacing}>
      {config.presentation.intro && (
        <Text className="ds-settings__muted-text" size="sm" color="muted">
          {config.presentation.intro}
        </Text>
      )}
      {shouldUnboxTabs && singleVisibleTab ? renderTabContent(singleVisibleTab) : tabsNode}
      {config.presentation.footer && (
        shouldRenderContentCard ? (
          <Card
            className="ds-settings__footer-card"
            variant={profileDefaults.cardVariant}
          >
            <Card.Body>{config.presentation.footer}</Card.Body>
          </Card>
        ) : (
          config.presentation.footer
        )
      )}
    </Stack>
  );

  const framedContent = shouldRenderContentCard ? (
    <Card variant={profileDefaults.cardVariant}>
      <Card.Body>{contentBody}</Card.Body>
    </Card>
  ) : (
    contentBody
  );

  const settingsContent = (
    <Grid
      className={`ds-surface ds-settings ds-settings--${shouldStack ? 'stacked' : 'wide'}`}
      data-part="root"
      data-view={resolvedView}
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      {...densityScopeAttributes(profileDefaults.density)}
      aria-busy={loading}
      columns={config.presentation.sidebar && !shouldStack ? 12 : 1}
      gap="lg"
    >
      <Grid.Item span={config.presentation.sidebar && !shouldStack ? 8 : undefined}>
        {framedContent}
      </Grid.Item>

      {config.presentation.sidebar && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          {/*
            Sticky offset lives in the skin, keyed on the always-stamped
            `--wide` root modifier — never inline geometry. The slot content is
            caller-owned, so the surface stamps no landmark role over it; a
            caller rendering section navigation here owns its own `nav`.
          */}
          <Card className="ds-settings__sidebar" variant={profileDefaults.cardVariant}>
            <Card.Body>{config.presentation.sidebar}</Card.Body>
          </Card>
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    <PageShellSurface
      chrome={chrome}
      actions={actionsNode}
      loading={false}
    >
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>
            {settingsContent}
          </FadeIn>
        ) : (
          settingsContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
