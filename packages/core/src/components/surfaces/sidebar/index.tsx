'use client';

/**
 * SidebarSurface
 *
 * The point of this surface is layout ownership, not domain ownership. It
 * gives app shells, admin workspaces, and split-pane pages a first-class DS
 * contract instead of pushing every sidebar arrangement into one-off wrappers.
 */

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Flex } from '../../primitives';
import { useSurfaceTranslations } from '../i18n';
import { useSurfaceResponsiveLayout } from '../responsive';
import type { SidebarSurfaceConfig } from '../types';
import { SurfaceActionBar } from '../shared';

export interface SidebarSurfaceProps {
  config: SidebarSurfaceConfig;
}

export function SidebarSurface({ config }: SidebarSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const [internalCollapsed, setInternalCollapsed] = useState(config.behavior.collapsed ?? false);

  useEffect(() => {
    if (config.behavior.collapsed !== undefined) {
      setInternalCollapsed(config.behavior.collapsed);
    }
  }, [config.behavior.collapsed]);

  const collapsed = config.behavior.collapsed ?? internalCollapsed;
  const sidebarWidth = collapsed
    ? config.visual.collapsedWidth ?? 88
    : config.visual.sidebarWidth ?? 280;

  const setCollapsed = (nextValue: boolean): void => {
    if (config.behavior.collapsed === undefined) {
      setInternalCollapsed(nextValue);
    }

    config.behavior.onCollapsedChange?.(nextValue);
  };

  return (
    <Box
      style={{
        display: shouldStack ? 'flex' : 'grid',
        flexDirection: shouldStack ? 'column' : undefined,
        gridTemplateColumns: shouldStack
          ? undefined
          : `${sidebarWidth}px minmax(0, 1fr)${
              config.presentation.aside ? ` ${config.visual.asideWidth ?? 320}px` : ''
            }`,
        gap: 24,
        alignItems: 'start',
      }}
    >
      <Card
        variant="outlined"
        style={{
          minHeight: '100%',
          borderRight: config.visual.bordered === false ? 'none' : undefined,
        }}
      >
        <Card.Body>
          <Flex direction="column" gap={16}>
            {config.visual.collapsible && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed
                  ? tSurface('sidebar.expand')
                  : config.behavior.toggleLabel ?? tSurface('sidebar.collapse')}
              </Button>
            )}

            <Box>{config.presentation.sidebar}</Box>
            <SurfaceActionBar
              actions={config.behavior.actions}
              permissions={config.permissions}
              justify="start"
            />
            {config.presentation.footer}
          </Flex>
        </Card.Body>
      </Card>

      <Flex direction="column" gap={16}>
        {config.presentation.header}
        <Box>{config.presentation.content}</Box>
      </Flex>

      {config.presentation.aside && (
        <Card variant="outlined">
          <Card.Body>{config.presentation.aside}</Card.Body>
        </Card>
      )}
    </Box>
  );
}
