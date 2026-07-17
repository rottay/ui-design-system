'use client';

/**
 * @fileoverview HeaderSurface -- lightweight page chrome with optional tabs.
 * @description For pages that need strong title/breadcrumb chrome and optional
 * tabbed body without the heavier mechanics of SettingsSurface or DashboardSurface.
 */

import React from 'react';
import { Box, Stack, Tabs, Text } from '../../../../../primitives';
import { filterSurfaceTabbedViews } from '../../../../runtime/helpers';
import type { HeaderSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '..';
import { useSurfaceProfileDefaults } from '../../../../runtime/profile-defaults';
import { SurfaceActionBar, SurfaceTabbedLabel } from '../../../../runtime/helpers/rendering';

export interface HeaderSurfaceProps {
  config: HeaderSurfaceConfig;
  loading?: boolean;
}

export function HeaderSurface({
  config,
  loading = false,
}: HeaderSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  // Tabs are permission-filtered so restricted tabs never appear in the
  // navigation, avoiding confusing "access denied" states.
  const visibleTabs = filterSurfaceTabbedViews(config.behavior.tabs ?? [], config.access ?? config.permissions);
  // Fall back to the first visible tab if the requested activeTab was
  // hidden by permissions or does not exist in the config.
  const resolvedActiveTabKey =
    visibleTabs.some((tab) => tab.key === config.behavior.activeTab)
      ? config.behavior.activeTab
      : visibleTabs[0]?.key;
  const isControlledTabState = config.behavior.activeTab !== undefined;

  // actionsStart allows apps to inject custom UI (e.g. search or status
  // indicators) before the standard action buttons. Both slots live inside
  // a Stack so they share consistent spacing.
  const actionsNode = (
    <Stack spacing="sm">
      {config.presentation.actionsStart}
      <SurfaceActionBar actions={config.behavior.actions} permissions={config.access ?? config.permissions} />
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={actionsNode}
      loading={loading}
    >
      <Stack
        className="ds-surface ds-header"
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        spacing="lg"
      >
        {config.presentation.description && (
          <Text
            className="ds-header__muted-text"
            data-part="muted-text"
          >
            {config.presentation.description}
          </Text>
        )}

        {config.presentation.metadata}
        {config.presentation.headerContent}

        {visibleTabs.length > 0 && (
          <Tabs
            items={visibleTabs.map((tab) => ({
              key: tab.key,
              label: <SurfaceTabbedLabel view={tab} />,
              icon: tab.icon,
              disabled: tab.disabled,
              children: (
                <Stack spacing="md">
                  {tab.description && (
                    <Text
                      className="ds-header__muted-text"
                      data-part="muted-text"
                    >{tab.description}</Text>
                  )}
                  <Box>{tab.content}</Box>
                </Stack>
              ),
            }))}
            // Tabs type (line vs card) falls back to the personality-derived
            // default so the surface stays visually consistent with the rest
            // of the product without per-page overrides.
            type={config.visual.tabsType ?? profileDefaults.tabsType}
            centered={config.visual.centeredTabs}
            // Controlled vs uncontrolled: passing activeKey makes the Tabs
            // component fully controlled; passing defaultActiveKey lets it
            // manage its own state. We never pass both.
            activeKey={isControlledTabState ? resolvedActiveTabKey : undefined}
            defaultActiveKey={!isControlledTabState ? resolvedActiveTabKey : undefined}
            onChange={config.behavior.onTabChange}
          />
        )}

        {config.presentation.footer}
      </Stack>
    </PageShellSurface>
  );
}
