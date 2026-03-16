'use client';

/**
 * @fileoverview SettingsSurface -- tabbed settings page shell.
 * @description Centralizes the repetitive settings route structure: title, intro copy,
 * action bar, tab navigation, and optional sidebar. Each app owns the actual settings
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
  // Permission-filtered tabs prevent users from seeing settings categories
  // they cannot access, avoiding "access denied" dead ends inside the page.
  const visibleTabs = filterSurfaceTabbedViews(config.behavior.tabs, config.permissions);
  // Fall back to the first visible tab if the requested active tab was
  // removed by permission filtering.
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
      {/* Optional sidebar (e.g. help links, plan summary) uses the 8/4 split.
          Without sidebar content the settings card takes full width. */}
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
