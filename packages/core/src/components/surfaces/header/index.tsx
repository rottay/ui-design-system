'use client';

/**
 * HeaderSurface
 *
 * This surface exists for pages that primarily need strong page chrome plus an
 * optional tabbed body. It is deliberately lighter than SettingsSurface or
 * DashboardSurface because not every route with tabs should inherit those
 * heavier mechanics.
 */

import React from 'react';
import { Box, Stack, Tabs, Text } from '../../primitives';
import { filterSurfaceTabbedViews } from '../helpers';
import type { HeaderSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { SurfaceActionBar, SurfaceTabbedLabel } from '../shared';

export interface HeaderSurfaceProps {
  config: HeaderSurfaceConfig;
  loading?: boolean;
}

export function HeaderSurface({
  config,
  loading = false,
}: HeaderSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const visibleTabs = filterSurfaceTabbedViews(config.behavior.tabs ?? [], config.permissions);
  const resolvedActiveTabKey =
    visibleTabs.some((tab) => tab.key === config.behavior.activeTab)
      ? config.behavior.activeTab
      : visibleTabs[0]?.key;
  const isControlledTabState = config.behavior.activeTab !== undefined;

  const actionsNode = (
    <Stack spacing="sm">
      {config.presentation.actionsStart}
      <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />
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
      <Stack spacing="lg">
        {config.presentation.description && (
          <Text style={{ color: 'var(--ds-color-text-muted)' }}>
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
                    <Text style={{ color: 'var(--ds-color-text-muted)' }}>{tab.description}</Text>
                  )}
                  <Box>{tab.content}</Box>
                </Stack>
              ),
            }))}
            type={config.visual.tabsType ?? profileDefaults.tabsType}
            centered={config.visual.centeredTabs}
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
