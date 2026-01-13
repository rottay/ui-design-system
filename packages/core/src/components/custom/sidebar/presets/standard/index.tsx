/**
 * Sidebar - Standard Preset (Icons + Labels)
 */

// import React from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SidebarProps } from '../../core';

export const StandardSidebar = createPreset<SidebarProps>({
  name: 'Sidebar.Standard',
  render: ({ primitives, props, tokens }: PresetContext<SidebarProps>) => {
    const { Box, Stack } = primitives;
    const { items, activeKey, header, footer, width = 260, itemSpacing = 'xs', className, style } = props;

    return (
      <Box className={className} style={{ width: `${width}px`, height: '100vh', backgroundColor: tokens.colors.neutral[50], borderRight: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', ...style }}>
        {header && <Box style={{ padding: tokens.spacing[4], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>{header}</Box>}
        <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[3] }}>
          <Stack direction="vertical" spacing={itemSpacing}>
            {items.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <div key={item.key} onClick={item.onClick} style={{ position: 'relative', padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[3], borderRadius: '0.375rem', backgroundColor: isActive ? '#EFF6FF' : 'transparent', color: isActive ? '#2563EB' : tokens.colors.neutral[700], transition: 'all 0.2s', fontWeight: isActive ? 600 : 400 }}>
                  {item.icon && <Box style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</Box>}
                  <Box style={{ flex: 1 }}>{item.label}</Box>
                  {item.badge && <Box style={{ backgroundColor: '#DC2626', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: tokens.typography.fontSize.xs, fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.badge}</Box>}
                </div>
              );
            })}
          </Stack>
        </Box>
        {footer && <Box style={{ padding: tokens.spacing[4], borderTop: `1px solid ${tokens.colors.neutral[200]}` }}>{footer}</Box>}
      </Box>
    );
  },
});
