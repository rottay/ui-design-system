import { createPreset } from '../../../factory';
import type { AppShellProps } from '../../core';
import {
  createPanelHeaderStyle,
} from '../../../helpers';

export default createPreset<AppShellProps>('horizontal', (context) => {
  const { primitives, props, tokens } = context;
  const { Box, Stack } = primitives;

  const {
    header,
    footer,
    children,
    className,
    style,
  } = props;

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
  );
});
