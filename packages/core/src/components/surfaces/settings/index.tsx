'use client';

/**
 * @fileoverview SettingsSurface -- tabbed settings page shell.
 * @description Centralizes the repetitive settings route structure: title, intro copy,
 * action bar, tab navigation, and optional sidebar. Each app owns the actual settings
 * panels and field renderers.
 *
 * @remarks
 * Premium polish integrates personality tokens (accent bar, entrance animation,
 * card variant, section spacing) so every product profile gets a cohesive
 * settings experience without per-instance configuration.
 */

import React from 'react';
import { Card, Grid, Stack, Tabs, Text } from '../../primitives';
import { FadeIn } from '../../../motion';
import { filterSurfaceTabbedViews } from '../helpers';
import type { SettingsSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { useSurfaceResponsiveLayout } from '../responsive';
import {
  resolveStackSpacing,
  resolveHeadingFontWeight,
  SurfaceAccentBarWrapper,
} from '../personality-helpers';
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
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const headingWeight = resolveHeadingFontWeight(profileDefaults.headerWeight);
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
          <Stack spacing={sectionSpacing}>
            {tab.description && (
              <Text
                size="sm"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  lineHeight: 1.5,
                }}
              >
                {tab.description}
              </Text>
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

  const settingsContent = (
    <Grid columns={config.presentation.sidebar && !shouldStack ? 12 : 1} gap="lg">
      <Grid.Item span={config.presentation.sidebar && !shouldStack ? 8 : undefined}>
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <Stack spacing={sectionSpacing}>
              {config.presentation.intro && (
                <Text
                  size="sm"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  {config.presentation.intro}
                </Text>
              )}
              {tabsNode}
              {config.presentation.footer && (
                <Card
                  variant={profileDefaults.cardVariant}
                  style={{
                    borderColor: 'var(--ds-color-border-secondary)',
                    background: 'var(--ds-color-bg-secondary)',
                  }}
                >
                  <Card.Body>{config.presentation.footer}</Card.Body>
                </Card>
              )}
            </Stack>
          </Card.Body>
        </Card>
      </Grid.Item>

      {config.presentation.sidebar && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card
            variant={profileDefaults.cardVariant}
            style={{
              position: shouldStack ? undefined : 'sticky',
              top: shouldStack ? undefined : 16,
            }}
          >
            <Card.Body>{config.presentation.sidebar}</Card.Body>
          </Card>
        </Grid.Item>
      )}
    </Grid>
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
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn duration={profileDefaults.entranceDuration}>
            {settingsContent}
          </FadeIn>
        ) : (
          settingsContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
