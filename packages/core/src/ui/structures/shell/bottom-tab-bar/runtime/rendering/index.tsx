'use client';

/**
 * @fileoverview BottomTabBar - mobile app-style bottom tab navigation.
 *
 * @description
 * A fixed-bottom navigation landmark with up to 5 items, each displaying an
 * icon and label. Supports active state highlighting (`aria-current="page"`),
 * optional badge indicators, and safe area insets for notched devices.
 *
 * A11y contract (APG navigation, R2+R3): the bar is a `<nav>` landmark with a
 * translated accessible name; the active item carries `aria-current="page"`.
 * A badged tab announces its count inside the accessible name (`{label},
 * {count}` floor; `bottomTabBar.itemWithBadge` catalogue key) and the visual
 * pill is `aria-hidden`, so the count is heard exactly once — the real count,
 * never the "99+" cap. The previous `tablist`/`tab`/`aria-selected` semantics
 * were dropped — a tab role without an owned `tabpanel` is a broken APG tabs
 * pattern.
 *
 * Ownership: the engine stamps anatomy (`data-part`) and state
 * (`data-selected`, `data-wide`); the skin
 * (`presentation/components/skin/bottom-tab-bar.css`) owns 100% of layout and
 * paint — typography included. The only inline style left is the caller's own
 * `style` prop merged onto the root.
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
 * @module Structures/Shell/BottomTabBar
 * @category Structure
 * @package @rottay/design-system
 */

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Box } from '@/ui/primitives/layout/Box';
import { Flex } from '@/ui/primitives/layout/Flex';

import type { BottomTabBarProps, BottomTabBarItem } from '../../contracts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ITEMS = 5;

/** English accessibility floor; overridable via the `components` namespace. */
const NAV_LABEL_KEY = 'bottomTabBar.navigation';
const NAV_LABEL_FALLBACK = 'Bottom navigation';

// ---------------------------------------------------------------------------
// TabItem sub-component
// ---------------------------------------------------------------------------

interface TabItemRendererProps {
  item: BottomTabBarItem;
  isActive: boolean;
  onSelect: () => void;
}

function TabItemRenderer({ item, isActive, onSelect }: TabItemRendererProps) {
  const i18n = useOptionalTranslation('components');
  const handleClick = () => {
    item.onClick?.();
    onSelect();
  };

  // Use Box as="button" for non-link items, Box as="a" for links
  const Element = item.href ? 'a' : 'button';

  // The badge count is part of the accessible name — sighted readers see the
  // pill, assistive tech must hear the count too. The visual pill is then
  // aria-hidden so it is never announced twice. The real count is announced
  // (not the "99+" cap). Floor mirrors the pre-i18n name byte-exactly when
  // no badge is present.
  const badge = item.badge ?? 0;
  const hasBadge = badge > 0;
  const accessibleName = hasBadge
    ? i18n?.tOr('bottomTabBar.itemWithBadge', `${item.label}, ${badge}`, {
        label: item.label,
        count: badge,
      }) ?? `${item.label}, ${badge}`
    : item.label;

  return (
    <Box
      as={Element}
      {...(item.href ? { href: item.href } as any : { type: 'button' } as any)}
      className="rottay-bottom-tab-bar__tab"
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={accessibleName}
      data-testid={`tab-item-${item.key}`}
      data-part="tab-button"
      data-selected={isActive}
    >
      {/* Icon container with optional badge; the active pill paints in the skin */}
      <Box data-part="icon-wrap" className="rottay-bottom-tab-bar__icon-wrap">
        <Box data-part="icon" className="rottay-bottom-tab-bar__icon">
          {item.icon}
        </Box>

        {/* Badge indicator */}
        {hasBadge && (
          <Box
            data-part="badge"
            className="rottay-bottom-tab-bar__badge"
            data-wide={badge > 99 || undefined}
            data-testid={`tab-badge-${item.key}`}
            aria-hidden="true"
          >
            <Box as="span" data-part="badge-text" className="rottay-bottom-tab-bar__badge-text">
              {badge > 99 ? '99+' : String(badge)}
            </Box>
          </Box>
        )}
      </Box>

      {/* Label */}
      <Box as="span" data-part="label" className="rottay-bottom-tab-bar__label">
        {item.label}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Fixed-bottom navigation bar for mobile app-style navigation.
 *
 * Renders up to 5 items evenly distributed horizontally. Each item shows an
 * icon and label stacked vertically, with the active item marked through
 * `aria-current="page"` and painted by the skin. An optional badge indicator
 * appears at the end edge of the icon.
 */
export function BottomTabBar({
  items,
  activeKey,
  onChange,
  style,
}: BottomTabBarProps) {
  // Enforce max items
  const visibleItems = items.slice(0, MAX_ITEMS);

  // Optional i18n: without an I18nProvider the hook returns null and the
  // English floor renders, byte-identical to the pre-i18n contract.
  const i18n = useOptionalTranslation('components');
  const navLabel = i18n?.tOr(NAV_LABEL_KEY, NAV_LABEL_FALLBACK) ?? NAV_LABEL_FALLBACK;

  return (
    <Box
      as="nav"
      className="rottay-bottom-tab-bar"
      style={style}
      data-testid="bottom-tab-bar"
      aria-label={navLabel}
      data-part="root"
    >
      <Flex
        align="stretch"
        justify="evenly"
        className="rottay-bottom-tab-bar__list"
        data-part="list"
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
