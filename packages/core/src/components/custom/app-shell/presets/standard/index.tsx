'use client';

import { createPreset } from '../../../factory';
import type { AppShellProps } from '../../core';

export default createPreset<AppShellProps>('standard', (context) => {
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
    <Box
      className={className}
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: tokens.colors.neutral[50],
        ...style,
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

      {/* Main Content Area */}
      <Stack
        direction="vertical"
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        {header && (
          <Box
            style={{
              flexShrink: 0,
              backgroundColor: tokens.colors.common.white,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.sm,
              zIndex: 10,
            }}
          >
            {header}
          </Box>
        )}

        {/* Content */}
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {children}
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
    </Box>
  );
});
