'use client';

/**
 * UserMenu - Detailed Preset (Avatar + Name + Role)
 */

import { useState, useRef, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { UserMenuProps } from '../../core';

export const DetailedUserMenu = createPreset<UserMenuProps>({
  name: 'UserMenu.Detailed',
  render: ({ primitives, props, tokens }: PresetContext<UserMenuProps>) => {
    const { Box, Card, Stack, Avatar } = primitives;
    const {
      user,
      items = [],
      onLogout,
      showLogout = true,
      className,
      style
    } = props;

    const [isOpen, setIsOpen] = useState(false);
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

    return (
      <div ref={menuRef} className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <Avatar src={user.avatar} size="md">
            {!user.avatar && user.name.charAt(0).toUpperCase()}
          </Avatar>
        </div>

        {isOpen && (
          <Card
            variant="elevated"
            padding="none"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              minWidth: '200px',
              zIndex: 1000,
            }}
          >
            {/* User info header */}
            <Box style={{
              padding: tokens.spacing[4],
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
            }}>
              <Box style={{ fontWeight: 600, marginBottom: '4px' }}>{user.name}</Box>
              {user.email && (
                <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  {user.email}
                </Box>
              )}
              {user.role && (
                <Box style={{
                  marginTop: '8px',
                  padding: '2px 8px',
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: '0.25rem',
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
                        margin: `${tokens.spacing[2]} 0`,
                      }}
                    />
                  );
                }

                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    style={{
                      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      color: item.danger ? '#DC2626' : undefined,
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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
