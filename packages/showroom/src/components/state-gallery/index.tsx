'use client';

import { Box, Flex, Stack, Text } from '@rottay/design-system';
import { FLAGSHIP_SPECS, type FlagshipSpec } from './specs/flagships';
import { RESPONSIVE_SPECS } from './specs/responsive';

export type { FlagshipSpec, StateGroup, StateCell } from './specs/flagships';
export { FLAGSHIP_SPECS } from './specs/flagships';
export { RESPONSIVE_SPECS } from './specs/responsive';
export { TenantPaletteSurface, surfaceLabelFor } from './tenants';
export type { SurfaceTenant } from './tenants';

/** Slugs that have an authored variant + state gallery (the ENG-02 flagship set). */
export const FLAGSHIP_SLUGS: string[] = FLAGSHIP_SPECS.map((spec) => spec.slug);

/** Slugs covered by the responsive-only gallery (components absent from FLAGSHIP_SPECS). */
export const RESPONSIVE_SLUGS: string[] = RESPONSIVE_SPECS.map((spec) => spec.slug);

export function getFlagshipSpec(slug: string): FlagshipSpec | undefined {
  return FLAGSHIP_SPECS.find((spec) => spec.slug === slug);
}

export function getResponsiveSpec(slug: string): FlagshipSpec | undefined {
  return RESPONSIVE_SPECS.find((spec) => spec.slug === slug);
}

/**
 * Renders a flagship or responsive-set component's real variants and states
 * as a labeled grid. Returns null for slugs without an authored spec in
 * either set so callers can fall back.
 */
export function StateGallery({ slug }: { slug: string }) {
  const spec = getFlagshipSpec(slug) ?? getResponsiveSpec(slug);

  if (!spec) {
    return null;
  }

  return (
    <Stack spacing="md" fullWidth>
      {spec.groups.map((group) => (
        <Stack key={group.label} spacing="sm">
          <Text
            size="xs"
            weight="semibold"
            style={{
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ds-color-text-secondary)',
            }}
          >
            {group.label}
          </Text>
          <Flex gap={16} wrap="wrap" align="end">
            {group.cells.map((cell) => (
              <Stack key={cell.label} spacing="xs" style={{ minWidth: 0 }}>
                <Box>{cell.node}</Box>
                <Text size="xs" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
                  {cell.label}
                </Text>
              </Stack>
            ))}
          </Flex>
        </Stack>
      ))}
    </Stack>
  );
}
