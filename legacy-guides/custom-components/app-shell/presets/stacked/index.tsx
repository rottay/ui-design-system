'use client';

import { createPreset } from '../../../factory';
import type { AppShellProps } from '../../core';
import {
  createPanelHeaderStyle,
} from '../../../helpers';

export default createPreset<AppShellProps>('stacked', (context) => {
  const { primitives, props, tokens } = context;
  const { Box, Stack } = primitives;

  const {
    sidebar,
    header,
    footer,
    children,
    sidebarWidth = 260,
    sidebarCollapsed = false,
    className,
    style,
  } = props;

  const actualSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth;

  return (
    <Stack
      direction="vertical"
      className={className}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: tokens.colors.neutral[50],
        ...style,
      }}
    >
      {/* Full-width Header */}
      {header && (
        <Box
          style={{
            flexShrink: 0,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.sm,
            zIndex: 20,
          }}
        >
          {header}
        </Box>
      )}

      {/* Content Area with Sidebar */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        {sidebar && !sidebarCollapsed && (
          <Box
            style={{
              width: actualSidebarWidth,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: tokens.colors.common.white,
              borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.sm,
              overflow: 'auto',
            }}
          >
            {sidebar}
          </Box>
        )}

        {/* Main Content */}
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          style={{
            flexShrink: 0,
            backgroundColor: tokens.colors.common.white,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.sm,
          }}
        >
          {footer}
        </Box>
      )}
    </Stack>
  );
});
