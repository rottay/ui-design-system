'use client';

/**
 * Sidebar - Collapsible Preset (With collapse toggle)
 * Premium: smooth width transition, section headers, hover states, active bar, engine-differentiated
 */

import { useState, useCallback } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SidebarProps, SidebarItem } from '../../core';
import {
  createFilterPillStyle,
  createHoverStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export const CollapsibleSidebar = createPreset<SidebarProps>({
  name: 'Sidebar.Collapsible',
  render: ({ primitives, props, tokens, engine }: PresetContext<SidebarProps>) => {
    const { Box, Stack, Text, Badge } = primitives;
    const {
      items,
      activeKey,
      collapsed: controlledCollapsed,
      onCollapse,
      header,
      footer,
      width = 260,
      collapsedWidth = 72,
      itemSpacing = 'xs',
      className,
      style,
    } = props;

    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const collapsed = controlledCollapsed ?? internalCollapsed;

    const handleToggle = useCallback(() => {
      const newCollapsed = !collapsed;
      if (controlledCollapsed === undefined) setInternalCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    }, [collapsed, controlledCollapsed, onCollapse]);

    const currentWidth = collapsed ? collapsedWidth : width;

    const renderItem = (item: SidebarItem) => {
      const isActive = item.key === activeKey;
      const isHovered = hoveredKey === item.key;

      // Section header
      if (item.disabled) {
        if (collapsed) return null;
        return (
          <Box
            key={item.key}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              marginTop: tokens.spacing[2],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[400],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {item.label}
            </Text>
          </Box>
        );
      }

      if (collapsed) {
        return (
          <div
            key={item.key}
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
            onClick={item.onClick}
            title={item.label}
            style={{
              position: 'relative',
              padding: `${tokens.spacing[2]}px`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: isActive
                ? tokens.colors.primaryScale[50]
                : isHovered
                  ? tokens.colors.neutral[100]
                  : 'transparent',
              color: isActive
                ? tokens.colors.primaryScale[600]
                : isHovered
                  ? tokens.colors.neutral[800]
                  : tokens.colors.neutral[500],
              minHeight: '40px',
            }}
          >
            {item.icon && (
              <Box style={{ fontSize: tokens.typography.fontSize.xl, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
            )}
            {item.badge && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.errorScale[500],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                }}
              />
            )}
          </div>
        );
      }

      return (
        <div
          key={item.key}
          onMouseEnter={() => setHoveredKey(item.key)}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={item.onClick}
          style={{
            position: 'relative',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            borderRadius: tokens.borderRadius.md,
            backgroundColor: isActive
              ? tokens.colors.primaryScale[50]
              : isHovered
                ? tokens.colors.neutral[100]
                : 'transparent',
            color: isActive
              ? tokens.colors.primaryScale[600]
              : tokens.colors.neutral[700],
            fontWeight: isActive
              ? tokens.typography.fontWeight.semibold
              : tokens.typography.fontWeight.normal,
            fontSize: tokens.typography.fontSize.sm,
            transform: isHovered && !isActive ? tokens.motion.transform : 'none',
            userSelect: 'none',
          }}
        >
          {isActive && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: '20%',
                bottom: '20%',
                width: '3px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[500],
              }}
            />
          )}

          {item.icon && (
            <Box
              style={{
                fontSize: tokens.typography.fontSize.md,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                color: isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[500],
                transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
              }}
            >
              {item.icon}
            </Box>
          )}

          <Box style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </Box>

          {item.badge && (
            <Badge
              content={item.badge}
              style={{
                backgroundColor: tokens.colors.primaryScale[500],
                fontSize: tokens.typography.fontSize.xs,
              }}
            />
          )}
        </div>
      );
    };

    return (
      <Box
        className={className}
        style={{
          width: `${currentWidth}px`,
          height: '100%',
          backgroundColor: tokens.colors.common.white,
          borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          flexDirection: 'column',
          transition: `width 300ms ${tokens.motion.spring}`,
          boxShadow: engine === 'modern' ? tokens.shadows.sm : 'none',
          ...style,
        }}
      >
        {/* Header with collapse toggle */}
        <Box
          style={{
            padding: `${tokens.spacing[3]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {!collapsed && header}
          <div
            onClick={handleToggle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = tokens.colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
            style={{
              cursor: 'pointer',
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              transition: `all ${tokens.motion.hover}`,
              color: tokens.colors.neutral[500],
              fontSize: tokens.typography.fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {collapsed ? '→' : '←'}
          </div>
        </Box>

        {/* Items */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: tokens.spacing[collapsed ? 1 : 2],
          }}
        >
          <Stack direction="vertical" spacing={itemSpacing}>
            {items.map(item => renderItem(item))}
          </Stack>
        </Box>

        {/* Footer */}
        {footer && (
          <Box
            style={{
              padding: tokens.spacing[3],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              justifyContent: collapsed ? 'center' : 'flex-start',
              flexShrink: 0,
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    );
  },
});
