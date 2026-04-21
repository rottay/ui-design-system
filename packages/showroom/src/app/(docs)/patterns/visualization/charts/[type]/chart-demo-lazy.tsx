'use client';

import dynamic from 'next/dynamic';
import { Card, Stack, Text } from '@rottay/design-system';

const ChartDemo = dynamic(
  () => import('./chart-demo').then((module) => module.ChartDemo),
  {
    ssr: false,
    loading: () => (
      <Card style={{ padding: 24 }}>
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">
            Loading chart preview...
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The interactive chart canvas mounts client-side so the docs page stays
            stable while the preview runtime boots.
          </Text>
        </Stack>
      </Card>
    ),
  },
);

export function ChartDemoLazy({ slug }: { slug: string }) {
  return <ChartDemo slug={slug} />;
}
