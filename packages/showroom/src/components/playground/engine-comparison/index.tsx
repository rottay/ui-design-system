'use client';

import type { ReactNode } from 'react';
import {
  Badge,
  Box,
  DesignSystemProvider,
  Flex,
  Stack,
  Text,
  getKnownTenantConfig,
} from '@rottay/design-system';
import {
  getShowroomProductProfileKey,
  getShowroomVerticalKey,
  type ShowroomEngine,
  type ShowroomTheme,
  useShowroom,
} from '@/components/showroom-context';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '../surface-tokens';

export interface EngineComparisonProps {
  children: ReactNode;
  tenantSlug?: string;
  title?: string;
  description?: string;
}

const ENGINES: Array<{
  id: ShowroomEngine;
  label: string;
  subtitle: string;
  accent: string;
}> = [
  {
    id: 'classic',
    label: 'Classic',
    subtitle: 'Ant Design',
    accent: '#60a5fa',
  },
  {
    id: 'modern',
    label: 'Modern',
    subtitle: 'DaisyUI',
    accent: '#34d399',
  },
  {
    id: 'rustic',
    label: 'Rustic',
    subtitle: 'Vanilla CSS',
    accent: '#fbbf24',
  },
];

function tenantLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EngineComparison({
  children,
  tenantSlug,
  title = 'Engine comparison',
  description = 'The active tenant stays real while the same component is rendered by every engine. The wrapper stays intentionally quiet so engine differences come from the DS itself.',
}: EngineComparisonProps) {
  const { tenantSlug: activeTenantSlug } = useShowroom();
  const resolvedTenantSlug = tenantSlug || activeTenantSlug || 'rottay';
  const resolvedTheme: ShowroomTheme =
    resolvedTenantSlug === 'bithire' || resolvedTenantSlug === 'evnto'
      ? resolvedTenantSlug
      : 'rottay';
  const tenantConfig =
    getKnownTenantConfig(resolvedTheme) ?? getKnownTenantConfig('rottay');

  if (!tenantConfig) {
    return null;
  }

  return (
    <Box
      style={{
        borderRadius: 22,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.canvas} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      <Box
        style={{
          padding: 18,
          borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: SHOWROOM_SURFACES.subtle,
        }}
      >
        <Flex
          align="start"
          justify="between"
          gap={12}
          style={{ flexWrap: 'wrap' }}
        >
          <Box style={{ minWidth: 0, maxWidth: 760 }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: SHOWROOM_SURFACES.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Engine comparison
            </Text>
            <Text
              size="sm"
              weight="semibold"
              style={{
                display: 'block',
                color: SHOWROOM_SURFACES.text,
                marginTop: 6,
                lineHeight: 1.35,
              }}
            >
              {title}
            </Text>
            <Text
              size="xs"
              style={{
                display: 'block',
                marginTop: 6,
                color: SHOWROOM_SURFACES.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Text>
          </Box>

          <Box
            style={{
              padding: '10px 12px',
              borderRadius: 16,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: SHOWROOM_SURFACES.surface,
            }}
          >
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">{tenantLabel(resolvedTenantSlug)}</Badge>
              <Badge variant="secondary">{ENGINES.length} live engines</Badge>
              <Badge variant="secondary">Same tenant, isolated engine</Badge>
            </Flex>
          </Box>
        </Flex>
      </Box>

      <Box
        className="showroom-engine-comparison-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 12,
          padding: 12,
          background: SHOWROOM_SURFACES.canvas,
          alignItems: 'stretch',
        }}
      >
        {ENGINES.map((engine) => {
          return (
            <Box
              key={engine.id}
              style={{
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                display: 'grid',
                gridTemplateRows: 'auto minmax(0, 1fr)',
                borderRadius: 18,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: SHOWROOM_SURFACES.surface,
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  padding: 14,
                  borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: SHOWROOM_SURFACES.surface,
                }}
              >
                <Flex
                  align="start"
                  justify="between"
                  gap={10}
                  style={{ flexWrap: 'wrap' }}
                >
                  <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: engine.accent,
                        boxShadow: `0 0 0 4px ${mixWithSurface(engine.accent, 18, 'transparent')}`,
                        flexShrink: 0,
                      }}
                    />
                    <Box style={{ minWidth: 0 }}>
                      <Text
                        size="sm"
                        weight="semibold"
                        style={{ display: 'block', color: SHOWROOM_SURFACES.text }}
                      >
                        {engine.label}
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          display: 'block',
                          marginTop: 4,
                          color: SHOWROOM_SURFACES.textSecondary,
                        }}
                      >
                        {engine.subtitle}
                      </Text>
                    </Box>
                  </Flex>

                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Live provider
                  </Text>
                </Flex>
              </Box>

              <Box style={{ padding: 16, minHeight: 0 }}>
                <Box
                  style={{
                    height: '100%',
                    minHeight: 'clamp(560px, 68vh, 760px)',
                    display: 'grid',
                    gridTemplateRows: 'auto minmax(0, 1fr)',
                    padding: 14,
                    borderRadius: 20,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
                    boxShadow: `inset 0 1px 0 ${mixWithSurface(engine.accent, 14, 'transparent')}`,
                  }}
                >
                  <Stack spacing="sm" fullWidth>
                    <Flex gap={6}>
                      {['12%', '22%', '32%'].map((opacity, dotIndex) => (
                        <Box
                          key={`${engine.id}-${dotIndex}`}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: `color-mix(in srgb, ${engine.accent} ${opacity}, ${SHOWROOM_SURFACES.text})`,
                          }}
                        />
                      ))}
                    </Flex>

                    <Box
                      style={{
                        width: '100%',
                        minWidth: 0,
                        minHeight: 0,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        paddingRight: 4,
                      }}
                    >
                      <DesignSystemProvider
                        tenantConfig={tenantConfig}
                        productProfile={getShowroomProductProfileKey(
                          resolvedTheme,
                          engine.id
                        )}
                        vertical={getShowroomVerticalKey(resolvedTheme)}
                        forceEngine={engine.id}
                      >
                        {children}
                      </DesignSystemProvider>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      <style>{`
        @container showroom-content (max-width: 1240px) {
          .showroom-engine-comparison-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @container showroom-content (max-width: 900px) {
          .showroom-engine-comparison-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Box>
  );
}
