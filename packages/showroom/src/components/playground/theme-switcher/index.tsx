'use client';

import { Flex, Box, Text } from '@rottay/design-system';

export interface ThemeSwitcherProps {
  value: string;
  onChange: (slug: string) => void;
}

const TENANTS = [
  { slug: 'rottay', label: 'Rottay', color: '#0066CC' },
  { slug: 'bithire', label: 'BitHire', color: '#0A66C2' },
  { slug: 'evnto', label: 'Evnto', color: '#171717' },
];

export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  return (
    <Flex gap={0} style={{ borderRadius: 'var(--ds-border-radius-md, 8px)', overflow: 'hidden', border: '1px solid var(--ds-color-border, #e5e7eb)' }}>
      {TENANTS.map((tenant, index) => {
        const isActive = value === tenant.slug;
        const isLast = index === TENANTS.length - 1;
        return (
          <Box
            key={tenant.slug}
            as="button"
            onClick={() => onChange(tenant.slug)}
            padding="sm"
            style={{
              cursor: 'pointer',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: isActive
                ? 'var(--ds-color-bg-elevated, #f5f5f5)'
                : 'var(--ds-color-bg-container, #ffffff)',
              border: 'none',
              borderRight: !isLast ? '1px solid var(--ds-color-border, #e5e7eb)' : 'none',
              transition: 'background 0.2s ease',
              outline: 'none',
              minWidth: 120,
            }}
          >
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: tenant.color,
                flexShrink: 0,
                border: isActive ? '2px solid var(--ds-color-primary, #0066cc)' : '2px solid transparent',
              }}
            />
            <Text
              size="sm"
              weight={isActive ? 'semibold' : 'normal'}
              style={{
                color: isActive
                  ? 'var(--ds-color-text-primary, #1a1a1a)'
                  : 'var(--ds-color-text-secondary, #666666)',
              }}
            >
              {tenant.label}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
}
