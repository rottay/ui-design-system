'use client';

import { Box, Flex, Stack, Text } from '@rottay/design-system';
import { FLAGSHIP_SPECS, type FlagshipSpec } from './flagship-specs';

export type { FlagshipSpec, StateGroup, StateCell } from './flagship-specs';
export { FLAGSHIP_SPECS } from './flagship-specs';
export { TenantPaletteSurface, surfaceLabelFor } from './tenant-axis';
export type { SurfaceTenant } from './tenant-axis';

/** Slugs that have an authored variant + state gallery (the ENG-02 flagship set). */
export const FLAGSHIP_SLUGS: string[] = FLAGSHIP_SPECS.map((spec) => spec.slug);

export function getFlagshipSpec(slug: string): FlagshipSpec | undefined {
  return FLAGSHIP_SPECS.find((spec) => spec.slug === slug);
}

/**
 * Renders a flagship component's real variants and states as a labeled grid.
 * Returns null for slugs without an authored spec so callers can fall back.
 */
export function StateGallery({ slug }: { slug: string }) {
  const spec = getFlagshipSpec(slug);

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
