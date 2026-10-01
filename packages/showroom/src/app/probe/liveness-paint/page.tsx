'use client';

import { Suspense, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';

import { AppShell, Box, MotionProvider, Stack, Text, WorkspaceShell } from '@rottay/design-system';

import { TortureSurface } from '@/components/torture-surface';

type Scene = 'drawer' | 'particle-primary' | 'particle-secondary';

const PARTICLE_CHANNEL: Record<Exclude<Scene, 'drawer'>, string> = {
  'particle-primary': '--ds-workspace-shell-particle-primary',
  'particle-secondary': '--ds-workspace-shell-particle-secondary',
};

function readScene(value: string | null): Scene {
  return value === 'particle-primary' || value === 'particle-secondary' ? value : 'drawer';
}

function readOverride(value: string | null): string | null {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : null;
}

function DrawerScene() {
  return (
    <AppShell
      sidebar={{
        logo: <Text weight="bold">Probe</Text>,
        nav: (
          <Stack spacing="sm" data-testid="liveness-drawer-nav">
            <Text>First destination</Text>
            <Text>Second destination</Text>
          </Stack>
        ),
      }}
    >
      <Box data-testid="liveness-drawer-content" style={{ padding: 24 }}>
        <Text>Shell content</Text>
      </Box>
    </AppShell>
  );
}

function ParticleScene({
  scene,
  override,
}: {
  scene: Exclude<Scene, 'drawer'>;
  override: string | null;
}) {
  const style = (override ? { [PARTICLE_CHANNEL[scene]]: override } : {}) as CSSProperties;
  return (
    <MotionProvider
      profile="expressive"
      tenantDial={{ ambient: 'subtle', durationScale: 1, intensity: 1 }}
    >
      <WorkspaceShell
        variant="ai-field"
        mood="calm"
        fieldPattern={scene === 'particle-primary' ? 'orbital' : 'ambient'}
        intensity="high"
        particleField={{ mode: 'live' }}
        style={{ minHeight: 640, ...style }}
      >
        <Box data-testid="liveness-particle-content" style={{ minHeight: 600 }} />
      </WorkspaceShell>
    </MotionProvider>
  );
}

function LivenessPaintProbeContent() {
  const searchParams = useSearchParams();
  const scene = readScene(searchParams.get('scene'));
  const override = readOverride(searchParams.get('override'));

  return (
    <TortureSurface fixture="bithire" engine="modern">
      <main
        data-testid="probe-liveness-paint"
        data-scene={scene}
        data-override={override ?? 'none'}
        style={{ minHeight: '100vh', background: 'var(--ds-color-bg-primary)' }}
      >
        {scene === 'drawer' ? <DrawerScene /> : <ParticleScene scene={scene} override={override} />}
      </main>
    </TortureSurface>
  );
}

export default function LivenessPaintProbePage() {
  return (
    <Suspense fallback={null}>
      <LivenessPaintProbeContent />
    </Suspense>
  );
}
