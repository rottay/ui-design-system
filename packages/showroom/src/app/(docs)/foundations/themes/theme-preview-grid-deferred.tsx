'use client';

import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';

const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 20,
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            style={{
              height: 280,
              padding: 20,
              border: '1px solid var(--ds-color-neutral-200)',
              background: 'var(--ds-color-bg-elevated, #f8fafc)',
            }}
          >
            <Stack spacing="md">
              <Box
                style={{
                  width: '48%',
                  height: 14,
                  borderRadius: 999,
                  background: 'var(--ds-color-neutral-200)',
                }}
              />
              <Box
                style={{
                  width: '100%',
                  height: 72,
                  borderRadius: 18,
                  background: 'var(--ds-color-neutral-100)',
                }}
              />
              <Box
                style={{
                  width: '100%',
                  height: 124,
                  borderRadius: 18,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              />
            </Stack>
          </Card>
        ))}
      </Box>
    ),
  }
);

export function ThemePreviewGridDeferred() {
  return <ThemePreviewGrid />;
}
