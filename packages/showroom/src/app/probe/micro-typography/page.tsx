'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Flex, Stack, Text } from '@rottay/design-system';
import { TenantPaletteSurface, surfaceLabelFor, type SurfaceTenant } from '@/components/state-gallery';

// ---------------------------------------------------------------------------
// Micro-typography evidence surface (WO-CRA-01)
//
// Proves the foundation micro-typography utilities on a real tenant palette:
//   - .ds-nums-tabular  → column-aligned figures (before/after vs proportional)
//   - .ds-text-balance  → even multi-line heading
//   - .ds-text-pretty   → body with no orphan last word
// These properties are inherited, so the utility class on a wrapper cascades to
// all descendant text. One tenant per load (html-anchored palette); capture
// ?tenant=rottay (dark) and ?tenant=bithire (light).
// ---------------------------------------------------------------------------

const TENANTS: SurfaceTenant[] = ['rottay', 'bithire', 'evnto'];

function sanitizeTenant(raw: string | null): SurfaceTenant {
  return raw && (TENANTS as string[]).includes(raw) ? (raw as SurfaceTenant) : 'rottay';
}

// Varying-width digits (1s are narrow, 8s wide) make proportional jitter obvious.
const METRIC_ROWS = [
  { label: 'Impressions', value: '1,118,181' },
  { label: 'Qualified leads', value: '808,080' },
  { label: 'Pipeline value', value: '$9,411,118' },
  { label: 'Win rate', value: '18.81%' },
];

function NumberColumn({ tabular }: { tabular: boolean }) {
  return (
    <Box
      className={tabular ? 'ds-nums-tabular' : undefined}
      style={{
        flex: 1,
        borderRadius: 12,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          display: 'block',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ds-color-text-muted)',
        }}
      >
        {tabular ? 'Tabular (.ds-nums-tabular)' : 'Proportional (default)'}
      </Text>
      <Stack spacing="sm">
        {METRIC_ROWS.map((row) => (
          <Flex key={row.label} align="baseline" justify="between" gap={16}>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              {row.label}
            </Text>
            <Text size="md" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
              {row.value}
            </Text>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}

function EvidenceContent() {
  const searchParams = useSearchParams();
  const tenant = useMemo(() => sanitizeTenant(searchParams.get('tenant')), [searchParams]);

  return (
    <TenantPaletteSurface tenant={tenant}>
      <Box style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}>
        <Box style={{ maxWidth: 960, margin: '0 auto' }}>
          <Stack spacing="lg" fullWidth>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ds-color-text-muted)',
              }}
            >
              Micro-typography · {tenant} · {surfaceLabelFor(tenant)}
            </Text>

            {/* Balanced heading + pretty body */}
            <Box
              style={{
                borderRadius: 16,
                border: '1px solid var(--ds-color-border)',
                background: 'var(--ds-color-bg-elevated)',
                padding: 24,
              }}
            >
              <Box className="ds-text-balance" style={{ maxWidth: 560 }}>
                <Text
                  as={'h1' as never}
                  size="3xl"
                  weight="bold"
                  style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
                >
                  A balanced multi-line heading keeps its line lengths even across the measure
                </Text>
              </Box>
              <Box className="ds-text-pretty" style={{ maxWidth: 560, marginTop: 16 }}>
                <Text size="md" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
                  Body copy uses text-wrap: pretty so the paragraph never ends on a single lonely
                  word. Optical sizing renders tenant variable fonts at their designed optical size,
                  and hyphenation is available for narrow measures. None of this bundles a font — the
                  family stays a BrandTheme choice.
                </Text>
              </Box>
            </Box>

            {/* Tabular vs proportional figures */}
            <Stack spacing="sm">
              <Text
                size="sm"
                weight="semibold"
                style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
              >
                Numeric alignment — proportional jitters, tabular locks to the grid
              </Text>
              <Flex gap={16} align="stretch">
                <NumberColumn tabular={false} />
                <NumberColumn tabular />
              </Flex>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </TenantPaletteSurface>
  );
}

export default function MicroTypographyEvidencePage() {
  return (
    <Suspense fallback={null}>
      <EvidenceContent />
    </Suspense>
  );
}
