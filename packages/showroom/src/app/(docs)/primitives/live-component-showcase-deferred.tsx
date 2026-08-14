'use client';

import dynamic from 'next/dynamic';
import { Box, Card, Stack, Text } from '@/components/showroom-ui';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
} from '@/components/playground/surface-tokens';

const LiveComponentShowcase = dynamic(
  () =>
    import('@/components/live-component-showcase').then(
      (module) => module.LiveComponentShowcase
    ),
  {
    ssr: false,
    loading: () => (
      <Card
        style={{
          padding: 18,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        }}
      >
        <Stack spacing="sm" fullWidth>
          <Text size="sm" weight="semibold">
            Preparing live DS runtime
          </Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The provider-backed component shelf loads after the route shell so the page stays responsive.
          </Text>
          <Box
            style={{
              width: '100%',
              height: 144,
              borderRadius: 18,
              background: `linear-gradient(180deg, ${mixWithCanvas(
                'var(--ds-color-primary, #60a5fa)',
                6,
              )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
            }}
          />
        </Stack>
      </Card>
    ),
  }
);

export function LiveComponentShowcaseDeferred() {
  return <LiveComponentShowcase mode="compact" showIntro={false} />;
}
