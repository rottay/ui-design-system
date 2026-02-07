'use client';

/**
 * Sidebar - Standard Preset (Icons + Labels)
 * Premium: hover states, active indicator, badges with tokens, section headers, engine-differentiated
 */

import { useState, useCallback } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SidebarProps, SidebarItem } from '../../core';

export const StandardSidebar = createPreset<SidebarProps>({
  name: 'Sidebar.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<SidebarProps>) => {
    const { Box, Stack, Text, Badge } = primitives;
    const {
      items,
      activeKey,
      header,
      footer,
      width = 260,
      itemSpacing = 'xs',
      className,
      style,
    } = props;

    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    const toggleExpand = useCallback((key: string) => {
      setExpandedKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }, []);

    const renderItem = (item: SidebarItem, depth: number = 0) => {
      const isActive = item.key === activeKey;
      const isHovered = hoveredKey === item.key;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedKeys.has(item.key);

      if (item.disabled) {
        return (
          <Box
            key={item.key}
            style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              paddingLeft: depth > 0 ? tokens.spacing[6] : tokens.spacing[4],
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

      return (
        <Box key={item.key}>
          <div
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
            onClick={() => {
              if (hasChildren) toggleExpand(item.key);
              item.onClick?.();
            }}
            style={{
              position: 'relative',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              paddingLeft: depth > 0 ? tokens.spacing[4] + depth * tokens.spacing[3] : tokens.spacing[3],
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: isActive
                ? tokens.colors.primaryScale[50]
                : isHovered
                  ? tokens.colors.neutral[100]
                  : 'transparent',
              color: isActive
                ? tokens.colors.primaryScale[600]
                : tokens.colors.neutral[700],
              transition: `all ${tokens.motion.hover}`,
              fontWeight: isActive
                ? tokens.typography.fontWeight.semibold
                : tokens.typography.fontWeight.normal,
              transform: isHovered && !isActive ? tokens.motion.transform : 'none',
              fontSize: tokens.typography.fontSize.sm,
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
                  transition: `all ${tokens.motion.hover}`,
                }}
              />
            )}

            {item.icon && (
              <Box
                style={{
                  fontSize: '18px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[500],
                  transition: `color ${tokens.motion.hover}`,
                }}
              >
                {item.icon}
              </Box>
            )}

            <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </Box>

            {item.badge && (
              <Badge
                content={item.badge}
                style={{
                  backgroundColor: tokens.colors.errorScale[500],
                  fontSize: tokens.typography.fontSize.xs,
                }}
              />
            )}

            {hasChildren && (
              <Box
                style={{
                  fontSize: '12px',
                  color: tokens.colors.neutral[400],
                  transition: `transform ${tokens.motion.hover}`,
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                ▸
              </Box>
            )}
          </div>

          {hasChildren && isExpanded && (
            <Box style={{ overflow: 'hidden' }}>
              {item.children!.map(child => renderItem(child, depth + 1))}
            </Box>
          )}
        </Box>
      );
    };

    return (
      <Box
        className={className}
        style={{
          width: `${width}px`,
          height: '100%',
          backgroundColor: tokens.colors.common.white,
          borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: engine === 'modern' ? tokens.shadows.sm : 'none',
          ...style,
        }}
      >
        {header && (
          <Box
            style={{
              padding: tokens.spacing[4],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              flexShrink: 0,
            }}
          >
            {header}
          </Box>
        )}

        <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[2] }}>
          <Stack direction="vertical" spacing={itemSpacing}>
            {items.map(item => renderItem(item))}
          </Stack>
        </Box>

        {footer && (
          <Box
            style={{
              padding: tokens.spacing[3],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
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
