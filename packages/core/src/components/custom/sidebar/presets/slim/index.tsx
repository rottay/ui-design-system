/**
 * Sidebar - Slim Preset (Icons only)
 */

// import React from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SidebarProps } from '../../core';

export const SlimSidebar = createPreset<SidebarProps>({
  name: 'Sidebar.Slim',
  render: ({ primitives, props, tokens }: PresetContext<SidebarProps>) => {
    const { Box, Stack } = primitives;
    const { items, activeKey, header, footer, collapsedWidth = 72, itemSpacing = 'xs', className, style } = props;

    return (
      <Box className={className} style={{ width: `${collapsedWidth}px`, height: '100vh', backgroundColor: tokens.colors.neutral[50], borderRight: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', ...style }}>
        {header && <Box style={{ padding: tokens.spacing[4], borderBottom: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', justifyContent: 'center' }}>{header}</Box>}
        <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[2] }}>
          <Stack direction="vertical" spacing={itemSpacing}>
            {items.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <div key={item.key} onClick={item.onClick} style={{ position: 'relative', padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[1], borderRadius: '0.375rem', backgroundColor: isActive ? '#EFF6FF' : 'transparent', color: isActive ? '#2563EB' : tokens.colors.neutral[600], transition: 'all 0.2s' }}>
                  {item.icon && <Box style={{ fontSize: '20px' }}>{item.icon}</Box>}
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, textAlign: 'center', fontWeight: isActive ? 600 : 400 }}>{item.label}</Box>
                  {item.badge && <Box style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#DC2626', color: 'white', borderRadius: '12px', padding: '2px 6px', fontSize: tokens.typography.fontSize.xs, fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.badge}</Box>}
                </div>
              );
            })}
          </Stack>
        </Box>
        {footer && <Box style={{ padding: tokens.spacing[4], borderTop: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', justifyContent: 'center' }}>{footer}</Box>}
      </Box>
    );
  },
});
