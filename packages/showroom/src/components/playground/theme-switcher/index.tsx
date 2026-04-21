'use client';

import { Box, Flex, Stack, Text, useTokens } from '@rottay/design-system';
import { SHOWROOM_SURFACES } from '../surface-tokens';

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
  const tokens = useTokens();

  return (
    <Flex
      gap={0}
      style={{
        borderRadius: tokens.borderRadius.xl,
        overflow: 'hidden',
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: SHOWROOM_SURFACES.surface,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      {TENANTS.map((tenant, index) => {
        const isActive = value === tenant.slug;
        const isLast = index === TENANTS.length - 1;
        return (
          <Box
            key={tenant.slug}
            as="button"
            onClick={() => onChange(tenant.slug)}
            style={{
              cursor: 'pointer',
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: 10,
              padding: tokens.spacing[3],
              background: isActive ? SHOWROOM_SURFACES.subtle : SHOWROOM_SURFACES.surface,
              border: 'none',
              borderRight: !isLast ? `1px solid ${SHOWROOM_SURFACES.border}` : 'none',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
              outline: 'none',
              minWidth: 132,
              boxShadow: isActive
                ? `inset 0 1px 0 ${SHOWROOM_SURFACES.borderStrong}`
                : 'none',
            }}
          >
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: isActive ? 'var(--ds-color-primary)' : SHOWROOM_SURFACES.borderStrong,
                flexShrink: 0,
                border: isActive
                  ? '2px solid var(--ds-color-primary)'
                  : '2px solid transparent',
                marginTop: 4,
              }}
            />
            <Stack spacing={2} style={{ minWidth: 0, textAlign: 'left' }}>
              <Text
                size="sm"
                weight={isActive ? 'semibold' : 'medium'}
                style={{
                  color: SHOWROOM_SURFACES.text,
                }}
              >
                {tenant.label}
              </Text>
              <Text
                size="xs"
                style={{
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.45,
                }}
              >
                {tenant.slug}
              </Text>
            </Stack>
          </Box>
        );
      })}
    </Flex>
  );
}
