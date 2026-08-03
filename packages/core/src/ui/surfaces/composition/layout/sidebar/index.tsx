'use client';

/**
 * @fileoverview SidebarSurface -- collapsible sidebar layout shell.
 * @description Provides first-class DS contract for sidebar layouts used in app
 * shells, admin workspaces, and split-pane pages. Handles collapse/expand state,
 * responsive stacking, and optional overlay mode on mobile.
 */

import React, { useEffect, useId, useState } from 'react';
import { Box, Button, Card, Flex } from '../../../../primitives';
import { useSurfaceTranslations } from '../../../runtime/helpers/states/i18n';
import { useSurfaceResponsiveLayout } from '../../../runtime/responsive';
import type { SidebarSurfaceConfig } from '../../../foundation/contracts';
import { SurfaceActionBar } from '../../../runtime/helpers/rendering';

export interface SidebarSurfaceProps {
  config: SidebarSurfaceConfig;
}

/** Contract widths are `number | string`: numbers resolve to px, strings pass through. */
function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function SidebarSurface({ config }: SidebarSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const navigationId = useId();
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
  // accommodates most nav label lengths without wrapping. Contract widths
  // are `number | string`, so numbers resolve to px and strings pass
  // through (the retired template literal produced `20rempx` for strings).
  const sidebarInlineSize = toCssLength(
    collapsed ? config.visual.collapsedWidth ?? 88 : config.visual.sidebarWidth ?? 280
  );

  const setCollapsed = (nextValue: boolean): void => {
    if (config.behavior.collapsed === undefined) {
      setInternalCollapsed(nextValue);
    }

    config.behavior.onCollapsedChange?.(nextValue);
  };

  // On desktop, a CSS grid creates the sidebar | main | aside three-column
  // layout; on mobile, flexbox column stacking replaces it. The minmax(0, 1fr)
  // on the main column prevents content from overflowing into the sidebar.
  // All of that geometry lives in the skin (layout-sidebar.css), keyed on the
  // data attributes; the only inline values are the config-resolved track
  // sizes, forwarded on family-private custom-property plumbing (never paint).
  return (
    <Box
      className="ds-surface ds-sidebar"
      data-part="root"
      data-collapsed={collapsed ? 'true' : 'false'}
      data-stacked={shouldStack ? 'true' : 'false'}
      data-aside={config.presentation.aside ? 'true' : 'false'}
      data-bordered={config.visual.bordered === false ? 'false' : 'true'}
      style={
        {
          '--_ds-sidebar-inline-size': sidebarInlineSize,
          '--_ds-sidebar-aside-inline-size': toCssLength(config.visual.asideWidth ?? 320),
        } as React.CSSProperties
      }
    >
      <Card
        className="ds-sidebar__panel"
        variant="outlined"
      >
        <Card.Body>
          <Flex direction="column" gap={16}>
            {config.visual.collapsible && (
              <Button
                className="ds-sidebar__toggle"
                data-collapsed={collapsed ? 'true' : 'false'}
                variant="secondary"
                size="sm"
                // Disclosure semantics: the toggle controls the navigation
                // region's collapsed posture, so it announces its state.
                aria-expanded={!collapsed}
                aria-controls={navigationId}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed
                  ? tSurface('sidebar.expand')
                  : config.behavior.toggleLabel ?? tSurface('sidebar.collapse')}
              </Button>
            )}

            <Box id={navigationId} className="ds-sidebar__navigation" data-part="navigation">{config.presentation.sidebar}</Box>
            <SurfaceActionBar
              actions={config.behavior.actions}
              access={config.access}
              justify="start"
            />
            {config.presentation.footer}
          </Flex>
        </Card.Body>
      </Card>

      <Flex className="ds-sidebar__main" data-part="main" direction="column" gap={16}>
        {config.presentation.header}
        <Box>{config.presentation.content}</Box>
      </Flex>

      {config.presentation.aside && (
        <Card className="ds-sidebar__aside" variant="outlined">
          <Card.Body>{config.presentation.aside}</Card.Body>
        </Card>
      )}
    </Box>
  );
}
