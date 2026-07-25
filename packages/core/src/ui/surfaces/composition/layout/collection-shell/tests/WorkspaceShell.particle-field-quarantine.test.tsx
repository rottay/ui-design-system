import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderSurface } from '../../../../foundation/common/test-utils';
import { WorkspaceShell, type WorkspaceShellProps } from '../index';

const liveProbe = vi.hoisted(() => ({
  moduleLoads: vi.fn(),
  renders: vi.fn(),
}));

vi.mock('@/graphics/motion/react/presentation/effects/particles', () => {
  liveProbe.moduleLoads();

  return {
    ParticleField: function LiveParticleFieldProbe() {
      liveProbe.renders();
      requestAnimationFrame(() => undefined);
      return <canvas data-testid="live-particle-field-probe" />;
    },
  };
});

const raf = vi.fn(() => 1);

beforeEach(() => {
  liveProbe.moduleLoads.mockClear();
  liveProbe.renders.mockClear();
  raf.mockClear();
  vi.stubGlobal('requestAnimationFrame', raf);
});

describe('WO-CRA-14 WorkspaceShell ParticleField quarantine', () => {
  it('defaults ai-field to a labelled CSS-only fallback without requesting the lazy runtime', async () => {
    const { container, getByRole } = renderSurface(
      <WorkspaceShell
        variant="ai-field"
        mood="focus"
        fieldPattern="hybrid"
        intensity="high"
      >
        Collection content
      </WorkspaceShell>,
    );

    await waitFor(() => {
      expect(
        getByRole('img', {
          name: 'Static atmospheric field indicating an AI-assisted collection workspace',
        }),
      ).toBeInTheDocument();
    });
    const shell = container.querySelector('[data-part="root"]');
    const fallback = getByRole('img', {
      name: 'Static atmospheric field indicating an AI-assisted collection workspace',
    });

    expect(shell).toHaveAttribute('data-particle-field-mode', 'quarantined');
    expect(fallback).toHaveAttribute('data-cra-14-static-fallback', 'true');
    expect(fallback).toHaveAttribute('data-part', 'particle-field-static-fallback');
    expect(fallback).toHaveAttribute('data-particle-field-runtime', 'static');
    expect(fallback).toHaveAttribute('data-particle-field-state', 'quarantined');
    expect(container.querySelector('canvas')).toBeNull();
    expect(liveProbe.moduleLoads).not.toHaveBeenCalled();
    expect(liveProbe.renders).not.toHaveBeenCalled();
    expect(raf).not.toHaveBeenCalled();
  });

  it('uses the route-owned accessible label and fails closed for an invalid runtime value', async () => {
    const invalidConfig = {
      fallbackLabel: 'Static identity field for the user directory',
      mode: 'unexpected-runtime',
    } as unknown as WorkspaceShellProps['particleField'];

    const { container, getByRole } = renderSurface(
      <WorkspaceShell variant="ai-field" particleField={invalidConfig}>
        Users
      </WorkspaceShell>,
    );

    await waitFor(() => {
      expect(
        getByRole('img', { name: 'Static identity field for the user directory' }),
      ).toBeInTheDocument();
    });
    expect(getByRole('img', { name: 'Static identity field for the user directory' })).toHaveAttribute(
      'data-particle-field-state',
      'quarantined',
    );
    expect(container.querySelector('canvas')).toBeNull();
    expect(liveProbe.moduleLoads).not.toHaveBeenCalled();
    expect(raf).not.toHaveBeenCalled();
  });

  it('requests and renders the isolated lazy module only after an explicit live opt-in', async () => {
    const { container } = renderSurface(
      <WorkspaceShell
        variant="ai-field"
        particleField={{ mode: 'live', fallbackLabel: 'Static users field' }}
      >
        Users
      </WorkspaceShell>,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="live-particle-field-probe"]')).not.toBeNull();
    });

    expect(liveProbe.moduleLoads).toHaveBeenCalledTimes(1);
    expect(liveProbe.renders).toHaveBeenCalled();
    expect(raf).toHaveBeenCalled();
  });

  it('keeps ParticleField behind the lazy boundary and pins CollectionWorkspace forwarding', () => {
    const shellSource = readFileSync(
      resolve(
        process.cwd(),
        'src/ui/surfaces/composition/layout/collection-shell/index.tsx',
      ),
      'utf8',
    );
    const shellSkin = readFileSync(
      resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/skin/collection-shell.css'),
      'utf8',
    );
    const consumablePlatformSkin = readFileSync(
      resolve(process.cwd(), 'styles/platform.css'),
      'utf8',
    );
    const motionEffectsBarrel = readFileSync(
      resolve(process.cwd(), 'src/graphics/motion/react/presentation/effects/index.ts'),
      'utf8',
    );
    const publicParticleFieldBoundary = readFileSync(
      resolve(process.cwd(), 'src/graphics/motion/react/presentation/effects/particles/index.tsx'),
      'utf8',
    );
    const collectionWorkspaceSource = readFileSync(
      resolve(
        process.cwd(),
        'src/ui/surfaces/presentation/pages/workspace/collection-workspace/index.tsx',
      ),
      'utf8',
    );

    expect(shellSource).not.toMatch(/import\s*\{\s*ParticleField/);
    expect(shellSource).toContain("import('@/graphics/motion/react/presentation/effects/particles')");
    expect(shellSource).toContain('.then(({ ParticleField }) => ({');
    expect(shellSkin).toContain('.ds-collection-shell__static-particle-field');
    expect(consumablePlatformSkin).toContain('.ds-collection-shell__static-particle-field');
    expect(shellSkin).toMatch(/\[data-field-pattern=(["'])hybrid\1\]/);
    expect(shellSkin).toContain('background-image: radial-gradient');
    expect(motionEffectsBarrel).toContain(
      "export { ParticleField, Particles } from './particles'",
    );
    expect(publicParticleFieldBoundary).toContain("import('./runtime/canvas')");
    expect(publicParticleFieldBoundary).not.toMatch(/from\s+['\"]\.\/runtime\/canvas['\"]/);
    expect(publicParticleFieldBoundary).not.toMatch(/style=\{\{/);
    expect(collectionWorkspaceSource).toContain(
      'particleField={shellConfig?.particleField}',
    );
  });
});
