'use client';

/**
 * UserMenu - Named Preset
 * Avatar + Name + chevron trigger with dropdown menu.
 * Default preset. Balanced between minimal and detailed.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { UserMenuProps } from '../../core';

export const NamedUserMenu = createPreset<UserMenuProps>({
  name: 'UserMenu.Named',
  render: ({ primitives, props, tokens, engine }: PresetContext<UserMenuProps>) => {
    const { Box, Card, Stack, Avatar } = primitives;
    const {
      user,
      items = [],
      onLogout,
      showLogout = true,
      className,
      style,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [isTriggerHovered, setIsTriggerHovered] = useState(false);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const allItems = [...items];
    if (showLogout && onLogout) {
      if (items.length > 0) {
        allItems.push({ key: 'divider', label: '', divider: true });
      }
      allItems.push({
        key: 'logout',
        label: 'Logout',
        danger: true,
        onClick: onLogout,
      });
    }

    const dropdownSurface = useMemo(() => createSurfaceStyle(tokens, {
      elevation: 'lg',
      glass: engine === 'modern',
    }), [tokens, engine]);

    return (
      <div
        ref={menuRef}
        className={className}
        style={{ position: 'relative', display: 'inline-block', ...style }}
      >
        {/* Named trigger: Avatar + Name + Arrow */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsTriggerHovered(true)}
          onMouseLeave={() => setIsTriggerHovered(false)}
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: isTriggerHovered ? tokens.colors.neutral[100] : 'transparent',
            transform: isTriggerHovered ? tokens.motion.transform : 'none',
          }}
        >
          <Avatar src={user.avatar} size="sm">
            {!user.avatar && user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ fontWeight: tokens.typography.fontWeight.medium }}>
            {user.name}
          </Box>
          <Box style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            transition: `all ${tokens.motion.hover}`,
          }}>
            {isOpen ? '\u25B2' : '\u25BC'}
          </Box>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <Card
            variant="elevated"
            padding="none"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: tokens.spacing[2],
              minWidth: '220px',
              zIndex: 1000,
              boxShadow: tokens.shadows.lg,
              ...dropdownSurface,
            }}
          >
            {/* User info header */}
            <Box style={{
              padding: tokens.spacing[4],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <Box style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[1],
              }}>
                {user.name}
              </Box>
              {user.email && (
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}>
                  {user.email}
                </Box>
              )}
              {user.role && (
                <Box style={{
                  marginTop: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  display: 'inline-block',
                }}>
                  {user.role}
                </Box>
              )}
            </Box>

            {/* Menu items */}
            <Stack direction="vertical" spacing="none">
              {allItems.map((item) => {
                if (item.divider) {
                  return (
                    <Box
                      key={item.key}
                      style={{
                        height: '1px',
                        backgroundColor: tokens.colors.neutral[200],
                        margin: `${tokens.spacing[2]}px 0`,
                      }}
                    />
                  );
                }

                const isHovered = hoveredKey === item.key;

                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      color: item.danger ? tokens.colors.errorScale[600] : undefined,
                      backgroundColor: isHovered ? tokens.colors.neutral[100] : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </Stack>
          </Card>
        )}
      </div>
    );
  },
});
