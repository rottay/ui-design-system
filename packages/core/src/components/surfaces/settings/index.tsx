'use client';

/**
 * SettingsSurface
 *
 * Settings routes are structurally repetitive: title, intro copy, action bar,
 * tab navigation, and optional supporting sidebar content. This surface keeps
 * that structure centralized while letting each app own the actual settings
 * panels and field renderers.
 */

import React from 'react';
import { Card, Grid, Stack, Tabs, Text } from '../../primitives';
import { filterSurfaceTabbedViews } from '../helpers';
import type { SettingsSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar, SurfaceTabbedLabel } from '../shared';

export interface SettingsSurfaceProps {
  config: SettingsSurfaceConfig;
  loading?: boolean;
}

export function SettingsSurface({
  config,
  loading = false,
}: SettingsSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;
  const visibleTabs = filterSurfaceTabbedViews(config.behavior.tabs, config.permissions);
  const resolvedActiveTabKey =
    visibleTabs.some((tab) => tab.key === config.behavior.activeTab)
      ? config.behavior.activeTab
      : visibleTabs[0]?.key;
  const isControlledTabState = config.behavior.activeTab !== undefined;

  const tabsNode = (
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
            {tab.content}
          </Stack>
        ),
      }))}
      type={config.visual.tabsType ?? profileDefaults.tabsType}
      centered={config.visual.centeredTabs}
      activeKey={isControlledTabState ? resolvedActiveTabKey : undefined}
      defaultActiveKey={!isControlledTabState ? resolvedActiveTabKey : undefined}
      onChange={config.behavior.onTabChange}
    />
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
      <Grid columns={config.presentation.sidebar && !shouldStack ? 12 : 1} gap="lg">
        <Grid.Item span={config.presentation.sidebar && !shouldStack ? 8 : undefined}>
          <Card variant="outlined">
            <Card.Body>
              <Stack spacing="lg">
                {config.presentation.intro && (
                  <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                    {config.presentation.intro}
                  </Text>
                )}
                {tabsNode}
                {config.presentation.footer}
              </Stack>
            </Card.Body>
          </Card>
        </Grid.Item>

        {config.presentation.sidebar && (
          <Grid.Item span={!shouldStack ? 4 : undefined}>
            <Card variant="outlined">
              <Card.Body>{config.presentation.sidebar}</Card.Body>
            </Card>
          </Grid.Item>
        )}
      </Grid>
    </PageShellSurface>
  );
}
