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
            {items.map((item, index) => {
              const isActive = item.key === activeKey;

              // Render section header/divider
              if (item.disabled) {
                if (collapsed) return null;
                const isFirstItem = index === 0;
                return (
                  <Box key={item.key} className="ds-sidebar-group" style={{
                    marginTop: isFirstItem ? 0 : 'var(--ds-sidebar-group-margin-top, 12px)',
                    marginBottom: 'var(--ds-sidebar-group-margin-bottom, 4px)',
                    paddingTop: isFirstItem ? tokens.spacing[2] : 'var(--ds-sidebar-group-padding-top, 12px)',
                    paddingLeft: tokens.spacing[3],
                    paddingRight: tokens.spacing[3],
                    borderTop: isFirstItem ? 'none' : 'var(--ds-sidebar-group-border, 1px solid rgba(0, 0, 0, 0.06))',
                  }}>
                    {item.label && (
                      <Box className="ds-sidebar-group-label" style={{
                        fontSize: 'var(--ds-sidebar-group-font-size, 12px)',
                        fontWeight: 'var(--ds-sidebar-group-font-weight, 600)' as any,
                        color: 'var(--ds-sidebar-group-color, rgba(0, 0, 0, 0.5))',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--ds-sidebar-group-letter-spacing, 0.03em)',
                      }}>
                        {item.label}
                      </Box>
                    )}
                  </Box>
                );
              }

              if (collapsed) {
                return (
                  <div key={item.key} onClick={item.onClick} title={item.label} style={{ position: 'relative', padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[1], borderRadius: '0.375rem', backgroundColor: isActive ? '#EFF6FF' : 'transparent', color: isActive ? '#2563EB' : tokens.colors.neutral[600], transition: 'all 0.2s' }}>
                    {item.icon && <Box style={{ fontSize: '20px' }}>{item.icon}</Box>}
                    {item.badge && <Box style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#DC2626', color: 'white', borderRadius: '50%', width: '8px', height: '8px' }} />}
                  </div>
                );
              }
              return (
                <div key={item.key} onClick={item.onClick} className={`ds-sidebar-item ${isActive ? 'ds-sidebar-item-active' : ''}`} style={{
                  position: 'relative',
                  marginLeft: 'var(--ds-sidebar-item-indent, 6px)',
                  marginRight: tokens.spacing[1],
                  padding: 'var(--ds-sidebar-item-padding, 6px 10px)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  borderRadius: '0.375rem',
                  backgroundColor: isActive ? 'var(--ds-sidebar-item-bg-active, rgba(10, 102, 194, 0.08))' : 'transparent',
                  color: isActive ? 'var(--ds-sidebar-item-color-active, #0A66C2)' : 'var(--ds-sidebar-item-color, rgba(0, 0, 0, 0.7))',
                  transition: 'all 0.15s ease',
                  fontWeight: isActive ? 'var(--ds-sidebar-item-font-weight-active, 500)' as any : 'var(--ds-sidebar-item-font-weight, 400)' as any,
                  fontSize: 'var(--ds-sidebar-item-font-size, 13px)'
                }}>
                  {item.icon && <Box style={{ fontSize: 'var(--ds-sidebar-icon-size, 16px)', flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</Box>}
                  <Box style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</Box>
                  {item.badge && <Box style={{ backgroundColor: '#3B82F6', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontWeight: 500 }}>{item.badge}</Box>}
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
