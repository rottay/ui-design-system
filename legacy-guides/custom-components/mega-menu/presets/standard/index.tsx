'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { MegaMenuProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export default createPreset<MegaMenuProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    groups,
    open: controlledOpen,
    onOpenChange,
    trigger,
    className,
    style,
  } = props;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleToggle = () => {
    const newOpen = !open;
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Box
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      {/* Trigger */}
      <Box onClick={handleToggle} style={{ cursor: 'pointer' }}>
        {trigger || (
          <Box
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            Menu
          </Box>
        )}
      </Box>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <Box
            onClick={handleToggle}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: tokens.overlay?.light,
              zIndex: 999,
            }}
          />

          {/* Menu Content */}
          <Box
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: tokens.spacing[2],
              width: '100vw',
              maxWidth: '1200px',
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              boxShadow: tokens.shadows.xl,
              padding: tokens.spacing[8],
              zIndex: 1000,
              display: 'grid',
              gridTemplateColumns: `repeat(${groups.length}, 1fr)`,
              gap: tokens.spacing[8],
            }}
          >
            {groups.map((group) => (
              <Box key={group.key}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  {group.title}
                </Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  {group.items.map((item) => {
                    const menuItemStyle: React.CSSProperties = {
                      display: 'flex',
                      gap: tokens.spacing[2],
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      textDecoration: 'none',
                      backgroundColor: group.featured ? tokens.colors.primaryScale[50] : 'transparent',
                    };
                    const handleItemClick = () => {
                      item.onClick?.();
                      handleToggle();
                    };
                    const handleItemMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
                      e.currentTarget.style.backgroundColor = group.featured
                        ? tokens.colors.primaryScale[100]
                        : tokens.colors.neutral[50];
                    };
                    const handleItemMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
                      e.currentTarget.style.backgroundColor = group.featured
                        ? tokens.colors.primaryScale[50]
                        : 'transparent';
                    };
                    const menuItemContent = (
                      <>
                      {item.icon && (
                        <Box
                          style={{
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </Box>
                      )}
                      <Box style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: group.featured ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
                            marginBottom: item.description ? tokens.spacing[1] : 0,
                          }}
                        >
                          {item.label}
                        </Text>
                        {item.description && (
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[600],
                              lineHeight: tokens.typography.lineHeight.normal,
                            }}
                          >
                            {item.description}
                          </Text>
                        )}
                      </Box>
                      </>
                    );
                    return item.href ? (
                      <a key={item.key} href={item.href} onClick={handleItemClick} style={menuItemStyle} onMouseEnter={handleItemMouseEnter} onMouseLeave={handleItemMouseLeave}>
                        {menuItemContent}
                      </a>
                    ) : (
                      <div key={item.key} onClick={handleItemClick} style={menuItemStyle} onMouseEnter={handleItemMouseEnter} onMouseLeave={handleItemMouseLeave}>
                        {menuItemContent}
                      </div>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
});
