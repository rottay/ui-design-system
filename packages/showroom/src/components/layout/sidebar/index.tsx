'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Flex, Stack, Text, useTokens } from '@rottay/design-system';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  LayersIcon,
  LayoutGridIcon,
  LayoutTemplateIcon,
  BracesIcon,
  SparklesIcon,
  GlobeIcon,
  RocketIcon,
  SettingsIcon,
} from '@rottay/design-system/icons';

/**
 * Navigation item that may have nested children for sub-navigation.
 */
interface NavChild {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

/**
 * Navigation group definition for the sidebar tree.
 */
interface NavGroup {
  label: string;
  icon: React.ReactNode;
  basePath: string;
  children: NavChild[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Foundations',
    icon: <LayersIcon size={16} />,
    basePath: '/foundations',
    children: [
      {
        label: 'Tokens',
        href: '/foundations/tokens',
        children: [
          { label: 'Colors', href: '/foundations/tokens/colors' },
          { label: 'Spacing', href: '/foundations/tokens/spacing' },
          { label: 'Typography', href: '/foundations/tokens/typography' },
          { label: 'Radius', href: '/foundations/tokens/radius' },
          { label: 'Shadows', href: '/foundations/tokens/shadows' },
          { label: 'Motion', href: '/foundations/tokens/motion' },
        ],
      },
      { label: 'Colors', href: '/foundations/colors' },
      { label: 'Typography', href: '/foundations/typography' },
      { label: 'Spacing', href: '/foundations/spacing' },
      { label: 'Motion', href: '/foundations/motion' },
      { label: 'Icons', href: '/foundations/icons' },
    ],
  },
  {
    label: 'Primitives',
    icon: <LayoutGridIcon size={16} />,
    basePath: '/primitives',
    children: [
      { label: 'Button', href: '/primitives/button' },
      { label: 'Input', href: '/primitives/input' },
      { label: 'Text', href: '/primitives/text' },
      { label: 'Card', href: '/primitives/card' },
      { label: 'Modal', href: '/primitives/modal' },
      { label: 'Tabs', href: '/primitives/tabs' },
      { label: 'Box', href: '/primitives/box' },
      { label: 'Flex', href: '/primitives/flex' },
      { label: 'Stack', href: '/primitives/stack' },
    ],
  },
  {
    label: 'Patterns',
    icon: <LayoutTemplateIcon size={16} />,
    basePath: '/patterns',
    children: [
      { label: 'DataTable', href: '/patterns/data-table' },
      { label: 'FormBuilder', href: '/patterns/form-builder' },
      { label: 'KanbanBoard', href: '/patterns/kanban-board' },
      { label: 'StatsGrid', href: '/patterns/stats-grid' },
      { label: 'Charts', href: '/patterns/charts' },
    ],
  },
  {
    label: 'Structures',
    icon: <BracesIcon size={16} />,
    basePath: '/structures',
    children: [
      { label: 'CollectionHeader', href: '/structures/collection-header' },
      { label: 'SearchCommandBar', href: '/structures/search-command-bar' },
      { label: 'TableToolbar', href: '/structures/table-toolbar' },
      { label: 'RecordFieldGrid', href: '/structures/record-field-grid' },
    ],
  },
  {
    label: 'Surfaces',
    icon: <SparklesIcon size={16} />,
    basePath: '/surfaces',
    children: [
      { label: 'ListSurface', href: '/surfaces/list-surface' },
      { label: 'DashboardSurface', href: '/surfaces/dashboard-surface' },
      { label: 'FormSurface', href: '/surfaces/form-surface' },
      { label: 'CollectionWorkspace', href: '/surfaces/collection-workspace' },
    ],
  },
  {
    label: 'Verticals',
    icon: <GlobeIcon size={16} />,
    basePath: '/verticals',
    children: [
      { label: 'Platform', href: '/verticals/platform' },
      { label: 'BitHire', href: '/verticals/bithire' },
      { label: 'Evnto', href: '/verticals/evnto' },
    ],
  },
  {
    label: 'Playground',
    icon: <RocketIcon size={16} />,
    basePath: '/playground',
    children: [
      { label: 'Theme Builder', href: '/playground/theme-builder' },
      { label: 'Engine Switcher', href: '/playground/engine-switcher' },
    ],
  },
  {
    label: 'Developers',
    icon: <SettingsIcon size={16} />,
    basePath: '/developers',
    children: [
      { label: 'Getting Started', href: '/developers/getting-started' },
      { label: 'Architecture', href: '/developers/architecture' },
      { label: 'Contributing', href: '/developers/contributing' },
      { label: 'Changelog', href: '/developers/changelog' },
    ],
  },
];

function NavGroupItem({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const isGroupActive = pathname.startsWith(group.basePath);
  const [isOpen, setIsOpen] = useState(isGroupActive);

  return (
    <Box>
      <Box
        as="button"
        {...({ type: 'button' } as any)}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '6px 12px',
          cursor: 'pointer',
          borderRadius: 6,
          transition: 'background 150ms ease',
          background: isGroupActive ? 'var(--ds-color-primary-50)' : 'transparent',
          border: 'none',
          textAlign: 'left',
        }}
      >
        <Flex align="center" gap={8}>
          <Box style={{ color: isGroupActive ? 'var(--ds-color-primary-500)' : 'var(--ds-color-text-secondary)' }}>
            {group.icon}
          </Box>
          <Text
            size="sm"
            weight={isGroupActive ? 'semibold' : 'medium'}
            color={isGroupActive ? 'primary' : 'default'}
          >
            {group.label}
          </Text>
        </Flex>
        <Box style={{ color: 'var(--ds-color-text-tertiary)' }}>
          {isOpen ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
        </Box>
      </Box>

      {isOpen && (
        <Stack spacing={2} style={{ paddingLeft: 28, paddingTop: 4 }}>
          {group.children.map((item) => {
            const isActive = pathname === item.href;
            const isChildActive = item.children?.some((c) => pathname === c.href) ?? false;
            return (
              <Box key={item.href}>
                <Link
                  href={item.href}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      transition: 'background 150ms ease',
                      background: (isActive || isChildActive) ? 'var(--ds-color-primary-100)' : 'transparent',
                    }}
                  >
                    <Text
                      size="sm"
                      weight={(isActive || isChildActive) ? 'medium' : 'normal'}
                      color={(isActive || isChildActive) ? 'primary' : 'secondary'}
                    >
                      {item.label}
                    </Text>
                  </Box>
                </Link>
                {item.children && (isActive || isChildActive || pathname.startsWith(item.href + '/')) && (
                  <Stack spacing={1} style={{ paddingLeft: 16, paddingTop: 2 }}>
                    {item.children.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            style={{
                              padding: '4px 10px',
                              borderRadius: 5,
                              transition: 'background 100ms ease',
                              background: isSubActive ? 'var(--ds-color-primary-50)' : 'transparent',
                            }}
                          >
                            <Text
                              size="xs"
                              weight={isSubActive ? 'medium' : 'normal'}
                              color={isSubActive ? 'primary' : 'muted'}
                            >
                              {sub.label}
                            </Text>
                          </Box>
                        </Link>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export function Sidebar() {
  const tokens = useTokens();
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <Box
      style={{
        width: 280,
        minWidth: 280,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid var(--ds-color-neutral-200)',
        background: 'var(--ds-color-white)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo / Title */}
      <Flex
        align="center"
        gap={10}
        style={{
          height: 56,
          padding: '0 20px',
          borderBottom: '1px solid var(--ds-color-neutral-200)',
          flexShrink: 0,
        }}
      >
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--ds-color-primary-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text size="sm" weight="bold" style={{ color: 'var(--ds-color-white)' }}>
            R
          </Text>
        </Box>
        <Stack spacing={0}>
          <Text size="sm" weight="bold">Rottay DS</Text>
          <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>Design System</Text>
        </Stack>
      </Flex>

      {/* Navigation */}
      <Box style={{ flex: 1, overflow: 'auto', padding: '12px 8px' }}>
        <Stack spacing="xs">
          {/* Home link */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Flex
              align="center"
              gap={8}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: isHome ? 'var(--ds-color-primary-50)' : 'transparent',
                transition: 'background 150ms ease',
              }}
            >
              <Box style={{ color: isHome ? 'var(--ds-color-primary-500)' : 'var(--ds-color-text-secondary)' }}>
                <HomeIcon size={16} />
              </Box>
              <Text
                size="sm"
                weight={isHome ? 'semibold' : 'medium'}
                color={isHome ? 'primary' : 'default'}
              >
                Home
              </Text>
            </Flex>
          </Link>

          {/* Nav groups */}
          {NAV_GROUPS.map((group) => (
            <NavGroupItem key={group.basePath} group={group} />
          ))}
        </Stack>
      </Box>

      {/* Sidebar footer */}
      <Box
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--ds-color-neutral-200)',
          flexShrink: 0,
        }}
      >
        <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>v0.1.0</Text>
      </Box>
    </Box>
  );
}
