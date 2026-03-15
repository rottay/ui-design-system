'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { MobileNavProps } from '../../core';
import {
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<MobileNavProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    items,
    activeKey,
    open: controlledOpen,
    onOpenChange,
    logo,
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
    <Box className={className} style={style}>
      {/* Hamburger Button */}
      <Box
        onClick={handleToggle}
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          transition: `all ${tokens.motion.hover}`,
          padding: tokens.spacing[1],
        }}
      >
        <Box
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: tokens.colors.neutral[700],
            transition: `all ${tokens.motion.hover}`,
          }}
        />
        <Box
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: tokens.colors.neutral[700],
            transition: `all ${tokens.motion.hover}`,
          }}
        />
        <Box
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: tokens.colors.neutral[700],
            transition: `all ${tokens.motion.hover}`,
          }}
        />
      </Box>

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
              backgroundColor: tokens.overlay?.medium,
              zIndex: 998,
            }}
          />

          {/* Bottom Sheet */}
          <Box
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: tokens.colors.common.white,
              borderTopLeftRadius: tokens.borderRadius.xl,
              borderTopRightRadius: tokens.borderRadius.xl,
              boxShadow: tokens.shadows.xl,
              zIndex: 999,
              padding: tokens.spacing[6],
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <Box
              style={{
                width: '40px',
                height: '4px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[300],
                margin: `0 auto ${tokens.spacing[6]}`,
              }}
            />

            {/* Logo */}
            {logo && (
              <Box style={{ marginBottom: tokens.spacing[6], textAlign: 'center' }}>
                {logo}
              </Box>
            )}

            {/* Nav Items Grid */}
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: tokens.spacing[4],
              }}
            >
              {items.map((item) => {
                const navItemStyle: React.CSSProperties = {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.lg,
                  cursor: 'pointer',
                  backgroundColor:
                    activeKey === item.key ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                  transition: `all ${tokens.motion.hover}`,
                  textDecoration: 'none',
                };
                const handleItemClick = () => {
                  item.onClick?.();
                  handleToggle();
                };
                const handleItemMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.backgroundColor =
                    activeKey === item.key ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100];
                };
                const handleItemMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.backgroundColor =
                    activeKey === item.key ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50];
                };
                const navItemContent = (
                  <>
                    {item.icon && (
                      <Box
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color:
                            activeKey === item.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        }}
                      >
                        {item.icon}
                      </Box>
                    )}
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color:
                          activeKey === item.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        textAlign: 'center',
                      }}
                    >
                      {item.label}
                    </Text>
                  </>
                );
                return item.href ? (
                  <a key={item.key} href={item.href} onClick={handleItemClick} style={navItemStyle} onMouseEnter={handleItemMouseEnter} onMouseLeave={handleItemMouseLeave}>
                    {navItemContent}
                  </a>
                ) : (
                  <div key={item.key} onClick={handleItemClick} style={navItemStyle} onMouseEnter={handleItemMouseEnter} onMouseLeave={handleItemMouseLeave}>
                    {navItemContent}
                  </div>
                );
              })}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
});
