'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Flex, Text, useTokens } from '@rottay/design-system';
import {
  ChevronRightIcon,
  HomeIcon,
  ExternalLinkIcon,
  SearchIcon,
} from '@rottay/design-system/icons';
import { useShowroom } from '@/components/showroom-context';

type Engine = 'classic' | 'modern' | 'rustic';
type Theme = 'rottay' | 'bithire' | 'evnto';

/**
 * Derives breadcrumb segments from the current pathname.
 */
function useBreadcrumbs(): { label: string; href: string }[] {
  const pathname = usePathname();
  if (!pathname || pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    href: '/' + segments.slice(0, index + 1).join('/'),
  }));
}

interface HeaderProps {
  onSearchOpen?: () => void;
}

export function Header({ onSearchOpen }: HeaderProps) {
  const tokens = useTokens();
  const { engine: activeEngine, setEngine: setActiveEngine, tenantSlug: activeTheme, setTenantSlug: setActiveTheme } = useShowroom();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  const engines: { key: Engine; label: string }[] = [
    { key: 'classic', label: 'Classic' },
    { key: 'modern', label: 'Modern' },
    { key: 'rustic', label: 'Rustic' },
  ];

  const themes: { key: Theme; label: string }[] = [
    { key: 'rottay', label: 'Rottay' },
    { key: 'bithire', label: 'BitHire' },
    { key: 'evnto', label: 'Evnto' },
  ];

  return (
    <Flex
      align="center"
      justify="between"
      style={{
        height: 56,
        padding: '0 24px',
        borderBottom: '1px solid var(--ds-color-neutral-200)',
        background: 'var(--ds-color-white)',
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <Flex align="center" gap={6}>
        <Box style={{ color: 'var(--ds-color-text-tertiary)' }}>
          <HomeIcon size={14} />
        </Box>
        {breadcrumbs.map((crumb, index) => (
          <Flex key={crumb.href} align="center" gap={6}>
            <Box style={{ color: 'var(--ds-color-text-tertiary)' }}>
              <ChevronRightIcon size={12} />
            </Box>
            <Text
              size="sm"
              color={index === breadcrumbs.length - 1 ? 'default' : 'muted'}
              weight={index === breadcrumbs.length - 1 ? 'medium' : 'normal'}
            >
              {crumb.label}
            </Text>
          </Flex>
        ))}
        {breadcrumbs.length === 0 && (
          <Text size="sm" style={{ color: "var(--ds-color-text-muted)" }}>Home</Text>
        )}
      </Flex>

      {/* Controls */}
      <Flex align="center" gap={16}>
        {/* Search button */}
        <Box
          as="button"
          onClick={() => onSearchOpen?.()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 10px 5px 8px',
            borderRadius: 6,
            border: '1px solid var(--ds-color-neutral-200)',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            color: 'var(--ds-color-text-tertiary)',
            background: 'var(--ds-color-white)',
            transition: 'border-color 150ms ease',
          }}
        >
          <SearchIcon size={14} />
          <span style={{ marginRight: 8 }}>Search</span>
          <span
            style={{
              padding: '1px 5px',
              borderRadius: 4,
              border: '1px solid var(--ds-color-neutral-300)',
              fontSize: '0.6875rem',
              color: 'var(--ds-color-text-tertiary)',
              lineHeight: 1.4,
            }}
          >
            {'\u2318'}K
          </span>
        </Box>

        {/* Engine switcher */}
        <Flex
          align="center"
          gap={2}
          style={{
            background: 'var(--ds-color-neutral-100)',
            borderRadius: 8,
            padding: 2,
          }}
        >
          {engines.map((engine) => (
            <Box
              key={engine.key}
              as="button"
              onClick={() => setActiveEngine(engine.key)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: activeEngine === engine.key ? 600 : 400,
                color: activeEngine === engine.key
                  ? 'var(--ds-color-primary-700)'
                  : 'var(--ds-color-text-secondary)',
                background: activeEngine === engine.key
                  ? 'var(--ds-color-white)'
                  : 'transparent',
                boxShadow: activeEngine === engine.key
                  ? '0 1px 2px rgba(0,0,0,0.06)'
                  : 'none',
                transition: 'all 150ms ease',
              }}
            >
              {engine.label}
            </Box>
          ))}
        </Flex>

        {/* Theme switcher */}
        <Box style={{ position: 'relative' }}>
          <Box
            as="button"
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              border: '1px solid var(--ds-color-neutral-200)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--ds-color-text-primary)',
              background: 'var(--ds-color-white)',
              transition: 'border-color 150ms ease',
            }}
          >
            {themes.find((t) => t.key === activeTheme)?.label}
          </Box>

          {themeDropdownOpen && (
            <Box
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: 'var(--ds-color-white)',
                border: '1px solid var(--ds-color-neutral-200)',
                borderRadius: 8,
                boxShadow: tokens.shadows.md,
                overflow: 'hidden',
                zIndex: 100,
                minWidth: 120,
              }}
            >
              {themes.map((theme) => (
                <Box
                  key={theme.key}
                  as="button"
                  onClick={() => {
                    setActiveTheme(theme.key);
                    setThemeDropdownOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    fontWeight: activeTheme === theme.key ? 600 : 400,
                    color: activeTheme === theme.key
                      ? 'var(--ds-color-primary-600)'
                      : 'var(--ds-color-text-primary)',
                    background: activeTheme === theme.key
                      ? 'var(--ds-color-primary-50)'
                      : 'var(--ds-color-white)',
                    transition: 'background 100ms ease',
                  }}
                >
                  {theme.label}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* GitHub link */}
        <Box
          as="a"
          {...({ href: "https://github.com/rottay/design-system", target: "_blank", rel: "noopener noreferrer" } as any)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 6,
            color: 'var(--ds-color-text-secondary)',
            transition: 'color 150ms ease, background 150ms ease',
            background: 'transparent',
          }}
        >
          <ExternalLinkIcon size={16} />
        </Box>
      </Flex>
    </Flex>
  );
}
