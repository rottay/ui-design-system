'use client';

/**
 * @fileoverview SidebarSurface -- collapsible sidebar layout shell.
 * @description Provides first-class DS contract for sidebar layouts used in app
 * shells, admin workspaces, and split-pane pages. Handles collapse/expand state,
 * the stacked posture resolved through the shared adaptation runtime, and the
 * optional aside track.
 */

import React, { useEffect, useId, useMemo, useState } from 'react';
import type { Adapt } from '../../../../../foundation/contracts/kernel/adaptation';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { Box, Button, Card } from '../../../../primitives';
import { useSurfaceTranslations } from '../../../foundation/chrome/runtime/i18n';
import type { SidebarSurfaceConfig } from '../../../foundation/chrome/contracts';
import { SurfaceActionBar } from '../../surface-chrome';

/** The sidebar surface's adaptation: whether the tracks stack into a column. */
export interface SidebarSurfaceAdaptation {
  readonly stacked?: boolean;
}

export interface ResolvedSidebarSurfaceAdaptation {
  readonly stacked: boolean;
}

export interface SidebarSurfaceProps {
  config: SidebarSurfaceConfig;
  /** Posture deltas the app declares; the surface's own defaults stack on phones and, when opted in, on tablets. */
  adapt?: Adapt<SidebarSurfaceAdaptation>;
}

/** Contract widths are `number | string`: numbers resolve to px, strings pass through. */
function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

const BASE_ADAPTATION: ResolvedSidebarSurfaceAdaptation = { stacked: false };

export function SidebarSurface({ config, adapt }: SidebarSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const navigationId = useId();
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const containerRef = useMemo(() => ({ current: rootElement }), [rootElement]);
  const { stackOnMobile, stackOnTablet } = config.visual;
  const defaults = useMemo<Adapt<SidebarSurfaceAdaptation>>(
    () => ({ phone: { stacked: stackOnMobile !== false }, tablet: { stacked: stackOnTablet === true } }),
    [stackOnMobile, stackOnTablet],
  );
  const { adaptation, postureAttribute } = useAdaptation(adapt, { base: BASE_ADAPTATION, defaults, containerRef });

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

  const setCollapsed = (nextValue: boolean): void => {
    if (config.behavior.collapsed === undefined) {
      setInternalCollapsed(nextValue);
    }

    config.behavior.onCollapsedChange?.(nextValue);
  };

  // A config width is runtime data written on the family's own channel; without one the
  // deriver's track, chained to the tenant's authored sidebar widths, applies.
  const stated = collapsed ? config.visual.collapsedWidth : config.visual.sidebarWidth;
  const trackChannels = {
    ...(stated !== undefined ? { '--ds-sidebar-surface-inline-size': toCssLength(stated) } : {}),
    ...(config.visual.asideWidth !== undefined
      ? { '--ds-sidebar-surface-aside-inline-size': toCssLength(config.visual.asideWidth) }
      : {}),
  } as React.CSSProperties;

  return (
    <Box
      ref={setRootElement}
      className="ds-structure ds-sidebar-surface"
      data-part="root"
      data-collapsed={collapsed ? 'true' : 'false'}
      data-stacked={adaptation.stacked ? 'true' : 'false'}
      data-aside={config.presentation.aside ? 'true' : 'false'}
      data-bordered={config.visual.bordered === false ? 'false' : 'true'}
      data-posture={postureAttribute}
      style={trackChannels}
    >
      <Card className="ds-sidebar-surface-panel" variant="outlined">
        <Card.Body>
          <Box data-part="panel-body">
            {config.visual.collapsible && (
              <Button
                className="ds-sidebar-surface-toggle"
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

            <Box as="nav" id={navigationId} data-part="navigation">
              {config.presentation.sidebar}
            </Box>
            <SurfaceActionBar
              actions={config.behavior.actions}
              access={config.access}
              justify="start"
            />
            {config.presentation.footer}
          </Box>
        </Card.Body>
      </Card>

      <Box data-part="main">
        {config.presentation.header}
        <Box>{config.presentation.content}</Box>
      </Box>

      {config.presentation.aside && (
        <Card className="ds-sidebar-surface-aside" variant="outlined">
          <Card.Body>{config.presentation.aside}</Card.Body>
        </Card>
      )}
    </Box>
  );
}
