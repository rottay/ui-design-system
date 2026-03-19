'use client';

/**
 * @fileoverview BottomTabBar - mobile app-style bottom tab navigation.
 *
 * @description
 * A fixed-bottom tab bar with up to 5 items, each displaying an icon and label.
 * Supports active state highlighting, optional badge indicators, and safe area
 * insets for notched devices.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex, Text) which resolve
 * through the engine system themselves.
 *
 * @example
 * ```tsx
 * <BottomTabBar
 *   items={[
 *     { key: 'home', label: 'Home', icon: <HomeIcon /> },
 *     { key: 'search', label: 'Search', icon: <SearchIcon /> },
 *     { key: 'profile', label: 'Profile', icon: <UserIcon />, badge: 3 },
 *   ]}
 *   activeKey="home"
 *   onChange={(key) => navigate(key)}
 * />
 * ```
 *
 * @module BottomTabBar
 * @category Navigation
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';

import { Box } from '../../layout/Box';
import { Flex } from '../../layout/Flex';
import { Text } from '../../display/Typography';

import type { BottomTabBarProps, BottomTabBarItem } from './BottomTabBar.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ITEMS = 5;

// ---------------------------------------------------------------------------
// TabItem sub-component
// ---------------------------------------------------------------------------

interface TabItemRendererProps {
  item: BottomTabBarItem;
  isActive: boolean;
  onSelect: () => void;
}

function TabItemRenderer({ item, isActive, onSelect }: TabItemRendererProps) {
  const color = isActive
    ? 'var(--ds-color-primary)'
    : 'var(--ds-color-text-muted)';

  const handleClick = () => {
    item.onClick?.();
    onSelect();
  };

  const tabStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    paddingTop: 6,
    paddingBottom: 2,
    cursor: 'pointer',
    position: 'relative',
    background: 'none',
    border: 'none',
    color,
    WebkitTapHighlightColor: 'transparent',
    textDecoration: 'none',
  };

  // Use Box as="button" for non-link items, Box as="a" for links
  const Element = item.href ? 'a' : 'button';

  return (
    <Box
      as={Element}
      {...(item.href ? { href: item.href } as any : { type: 'button' } as any)}
      style={tabStyle}
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      aria-label={item.label}
      data-testid={`tab-item-${item.key}`}
    >
      {/* Icon container with optional badge */}
      <Box style={{ position: 'relative', width: 24, height: 24 }}>
        <Box
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {item.icon}
        </Box>

        {/* Badge indicator */}
        {item.badge != null && item.badge > 0 && (
          <Box
            style={{
              position: 'absolute',
              top: -4,
              right: -8,
              minWidth: item.badge > 99 ? 20 : 16,
              height: 16,
              borderRadius: 8,
              background: 'var(--ds-color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 4,
              paddingRight: 4,
            }}
            data-testid={`tab-badge-${item.key}`}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: 600,
                lineHeight: '16px',
                color: '#fff',
              }}
            >
              {item.badge > 99 ? '99+' : String(item.badge)}
            </Text>
          </Box>
        )}
      </Box>

      {/* Label */}
      <Text
        style={{
          fontSize: 11,
          lineHeight: '14px',
          marginTop: 2,
          color,
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {item.label}
      </Text>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Fixed-bottom tab bar for mobile app-style navigation.
 *
 * Renders up to 5 items evenly distributed horizontally. Each item shows an
 * icon (24px) and label (11px) stacked vertically, with active state using
 * the primary color. Optional badge indicator appears top-right of the icon.
 */
export function BottomTabBar({
  items,
  activeKey,
  onChange,
  style,
}: BottomTabBarProps) {
  // Enforce max items
  const visibleItems = items.slice(0, MAX_ITEMS);

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    background: 'var(--ds-color-bg-primary)',
    borderTop: '1px solid var(--ds-color-border)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    zIndex: 40,
    ...style,
  };

  return (
    <Box
      as="nav"
      style={containerStyle}
      data-testid="bottom-tab-bar"
      role="tablist"
      aria-label="Bottom navigation"
    >
      <Flex
        align="stretch"
        justify="evenly"
        style={{ width: '100%' }}
      >
        {visibleItems.map((item) => (
          <TabItemRenderer
            key={item.key}
            item={item}
            isActive={activeKey === item.key}
            onSelect={() => onChange?.(item.key)}
          />
        ))}
      </Flex>
    </Box>
  );
}

BottomTabBar.displayName = 'BottomTabBar';

export default BottomTabBar;
