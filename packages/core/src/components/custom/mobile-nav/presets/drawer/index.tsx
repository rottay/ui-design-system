'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { MobileNavProps, MobileNavItem } from '../../core';

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
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleToggle = () => {
    const newOpen = !open;
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const renderItem = (item: MobileNavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.has(item.key);

    const navItemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[4],
      padding: tokens.spacing[4],
      paddingLeft: `calc(${tokens.spacing[4]} + ${depth * 20}px)`,
      borderRadius: tokens.borderRadius.md,
      cursor: 'pointer',
      backgroundColor:
        activeKey === item.key ? tokens.colors.primaryScale[50] : 'transparent',
      color:
        activeKey === item.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
      transition: `all ${tokens.motion.hover}`,
      textDecoration: 'none',
    };
    const handleItemClick = () => {
      if (hasChildren) {
        toggleExpanded(item.key);
      } else {
        item.onClick?.();
        handleToggle();
      }
    };
    const handleItemMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      if (activeKey !== item.key) {
        e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
      }
    };
    const handleItemMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      if (activeKey !== item.key) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    };
    const navItemContent = (
      <>
        {item.icon && (
          <Box style={{ width: '20px', height: '20px', flexShrink: 0 }}>
            {item.icon}
          </Box>
        )}
        <Text
          style={{
            flex: 1,
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.medium,
          }}
        >
          {item.label}
        </Text>
        {hasChildren && (
          <Box
            style={{
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${tokens.motion.hover}`,
            }}
          >
            ▼
          </Box>
        )}
      </>
    );

    return (
      <Box key={item.key}>
        {item.href ? (
          <a href={item.href} onClick={handleItemClick} style={navItemStyle} onMouseEnter={handleItemMouseEnter} onMouseLeave={handleItemMouseLeave}>
            {navItemContent}
          </a>
        ) : (
          <div onClick={handleItemClick} style={navItemStyle} onMouseEnter={handleItemMouseEnter} onMouseLeave={handleItemMouseLeave}>
            {navItemContent}
          </div>
        )}
        {hasChildren && isExpanded && (
          <Box style={{ marginTop: tokens.spacing[1] }}>
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
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
          padding: tokens.spacing[1],
        }}
      >
        <Box
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: tokens.colors.neutral[700],
            transition: `all ${tokens.motion.hover}`,
            transform: open ? 'rotate(45deg) translateY(8px)' : 'none',
          }}
        />
        <Box
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: tokens.colors.neutral[700],
            transition: `all ${tokens.motion.hover}`,
            opacity: open ? 0 : 1,
          }}
        />
        <Box
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: tokens.colors.neutral[700],
            transition: `all ${tokens.motion.hover}`,
            transform: open ? 'rotate(-45deg) translateY(-8px)' : 'none',
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
            }}
          />

          {/* Drawer */}
          <Box
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              backgroundColor: tokens.colors.common.white,
              boxShadow: tokens.shadows.xl,
              zIndex: 999,
              padding: tokens.spacing[6],
              overflowY: 'auto',
            }}
          >
            {/* Logo */}
            {logo && (
              <Box style={{ marginBottom: tokens.spacing[8] }}>
                {logo}
              </Box>
            )}

            {/* Nav Items */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              {items.map((item) => renderItem(item))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
});
