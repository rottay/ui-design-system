'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { Box, LoadingOverlay, Stack, Text } from '@rottay/design-system';

import {
  TortureSurface,
  type ProbeEngine,
  type TortureFixture,
} from '@/composition/components/torture-surface';

function readFixture(value: string | null): TortureFixture {
  return value === 'bithire' ? 'bithire' : 'rottay';
}

function readEngine(value: string | null): ProbeEngine {
  return value === 'rustic' ? 'rustic' : 'modern';
}

function LoadingOverlayProbeContent() {
  const searchParams = useSearchParams();
  const fixture = readFixture(searchParams.get('fixture'));
  const engine = readEngine(searchParams.get('engine'));

  return (
    <TortureSurface fixture={fixture} engine={engine}>
      <main
        data-testid="probe-loading-overlay"
        data-fixture={fixture}
        data-engine={engine}
        style={{
          minHeight: '100vh',
          padding: 32,
          background: 'var(--ds-color-bg-primary)',
        }}
      >
        <Box
          data-testid="loading-overlay-stage"
          style={{
            position: 'relative',
            width: 'min(680px, 100%)',
            minHeight: 360,
            margin: '0 auto',
            overflow: 'hidden',
            border: '1px solid var(--ds-color-border-secondary)',
            borderRadius: 18,
            background: 'var(--ds-color-bg-elevated)',
          }}
        >
          <Stack spacing="md" style={{ padding: 24 }}>
            <Text size="lg" weight="bold">Settlement workspace</Text>
            <Text size="sm" color="secondary">
              The content remains mounted while the live overlay protects it.
            </Text>
            {[0, 1, 2].map((row) => (
              <Box
                key={row}
                style={{
                  height: 58,
                  border: '1px solid var(--ds-color-border-secondary)',
                  borderRadius: 12,
                  background: 'var(--ds-color-bg-secondary)',
                }}
              />
            ))}
          </Stack>

          <LoadingOverlay
            visible
            message="Syncing records"
            logo={
              <Box
                data-testid="loading-overlay-logo-mark"
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--ds-color-primary)',
                  borderRadius: 16,
                  background: 'var(--ds-color-bg-elevated)',
                }}
              >
                <Text size="sm" weight="bold" color="primary">DS</Text>
              </Box>
            }
          />
        </Box>
      </main>
    </TortureSurface>
  );
}

export default function LoadingOverlayProbePage() {
  return (
    <Suspense fallback={<main data-testid="probe-loading-overlay-loading" />}>
      <LoadingOverlayProbeContent />
    </Suspense>
  );
}
