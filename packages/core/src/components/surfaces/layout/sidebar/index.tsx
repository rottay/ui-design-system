'use client';

/**
 * @fileoverview SidebarSurface -- collapsible sidebar layout shell.
 * @description Provides first-class DS contract for sidebar layouts used in app
 * shells, admin workspaces, and split-pane pages. Handles collapse/expand state,
 * responsive stacking, and optional overlay mode on mobile.
 */

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Flex } from '../../../primitives';
import { useSurfaceTranslations } from '../../foundation/i18n';
import { useSurfaceResponsiveLayout } from '../../foundation/responsive';
import type { SidebarSurfaceConfig } from '../../foundation/types';
import { SurfaceActionBar } from '../../foundation/shared';

export interface SidebarSurfaceProps {
  config: SidebarSurfaceConfig;
}

export function SidebarSurface({ config }: SidebarSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  // Collapse state supports controlled (app owns state) and uncontrolled
  // (surface manages toggling) modes.
  const [internalCollapsed, setInternalCollapsed] = useState(config.behavior.collapsed ?? false);

  // Sync internal state when the app takes control of the collapsed prop.
  useEffect(() => {
    if (config.behavior.collapsed !== undefined) {
      setInternalCollapsed(config.behavior.collapsed);
    }
  }, [config.behavior.collapsed]);

  const collapsed = config.behavior.collapsed ?? internalCollapsed;
  // Collapsed width defaults to 88px -- enough for icon-only navigation.
  // Expanded width defaults to 280px, a standard sidebar width that
  // accommodates most nav label lengths without wrapping.
  const sidebarWidth = collapsed
    ? config.visual.collapsedWidth ?? 88
    : config.visual.sidebarWidth ?? 280;

  const setCollapsed = (nextValue: boolean): void => {
    if (config.behavior.collapsed === undefined) {
      setInternalCollapsed(nextValue);
    }

    config.behavior.onCollapsedChange?.(nextValue);
  };

  // On desktop, a CSS grid creates the sidebar | main | aside three-column
  // layout. On mobile, flexbox column stacking replaces it. The minmax(0, 1fr)
  // on the main column prevents content from overflowing into the sidebar.
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
