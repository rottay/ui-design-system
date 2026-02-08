'use client';

/**
 * Sidebar - Slim Preset (Icons only, tooltip labels)
 * Premium: hover elevation, active indicator dot, badge pulse, engine-differentiated
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SidebarProps } from '../../core';
import {
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export const SlimSidebar = createPreset<SidebarProps>({
  name: 'Sidebar.Slim',
  render: ({ primitives, props, tokens, engine }: PresetContext<SidebarProps>) => {
    const { Box, Stack, Badge, Tooltip } = primitives;
    const {
      items,
      activeKey,
      header,
      footer,
      collapsedWidth = 72,
      itemSpacing = 'xs',
      className,
      style,
    } = props;

    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    return (
      <Box
        className={className}
        style={{
          width: `${collapsedWidth}px`,
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
              padding: tokens.spacing[3],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {header}
          </Box>
        )}

        <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[2] }}>
          <Stack direction="vertical" spacing={itemSpacing}>
            {items.filter(i => !i.disabled).map((item) => {
              const isActive = item.key === activeKey;
              const isHovered = hoveredKey === item.key;

              const itemContent = (
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
                    gap: tokens.spacing[1],
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
                    transform: isHovered ? tokens.motion.transform : 'none',
                    minHeight: '44px',
                  }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[500],
                      }}
                    />
                  )}

                  {item.icon && (
                    <Box style={{ fontSize: tokens.typography.fontSize.xl, display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </Box>
                  )}

                  {/* Badge dot */}
                  {item.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
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

              return <Box key={item.key}>{itemContent}</Box>;
            })}
          </Stack>
        </Box>

        {footer && (
          <Box
            style={{
              padding: tokens.spacing[3],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              justifyContent: 'center',
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
