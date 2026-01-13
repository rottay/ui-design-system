/**
 * Sidebar - Collapsible Preset (With toggle)
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SidebarProps } from '../../core';

export const CollapsibleSidebar = createPreset<SidebarProps>({
  name: 'Sidebar.Collapsible',
  render: ({ primitives, props, tokens }: PresetContext<SidebarProps>) => {
    const { Box, Stack } = primitives;
    const { items, activeKey, collapsed: controlledCollapsed, onCollapse, header, footer, width = 260, collapsedWidth = 72, itemSpacing = 'xs', className, style } = props;
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const collapsed = controlledCollapsed ?? internalCollapsed;

    const handleToggle = () => {
      const newCollapsed = !collapsed;
      if (controlledCollapsed === undefined) setInternalCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    };

    const currentWidth = collapsed ? collapsedWidth : width;

    return (
      <Box className={className} style={{ width: `${currentWidth}px`, height: '100vh', backgroundColor: tokens.colors.neutral[50], borderRight: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', ...style }}>
        {header && (
          <Box style={{ padding: tokens.spacing[4], borderBottom: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center' }}>
            {!collapsed && header}
            <div onClick={handleToggle} style={{ cursor: 'pointer', padding: tokens.spacing[2], borderRadius: '0.25rem', transition: 'background-color 0.2s' }}>{collapsed ? '→' : '←'}</div>
          </Box>
        )}
        <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[collapsed ? 2 : 3] }}>
          <Stack direction="vertical" spacing={itemSpacing}>
            {items.map((item) => {
              const isActive = item.key === activeKey;
              if (collapsed) {
                return (
                  <div key={item.key} onClick={item.onClick} title={item.label} style={{ position: 'relative', padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[1], borderRadius: '0.375rem', backgroundColor: isActive ? '#EFF6FF' : 'transparent', color: isActive ? '#2563EB' : tokens.colors.neutral[600], transition: 'all 0.2s' }}>
                    {item.icon && <Box style={{ fontSize: '20px' }}>{item.icon}</Box>}
                    {item.badge && <Box style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#DC2626', color: 'white', borderRadius: '50%', width: '8px', height: '8px' }} />}
                  </div>
                );
              }
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
        {footer && <Box style={{ padding: tokens.spacing[4], borderTop: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>{footer}</Box>}
      </Box>
    );
  },
});
