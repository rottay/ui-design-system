import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardSurface } from '..';
import type { DashboardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import {
  MotionContext,
  resolveMotionPolicy,
  type MotionContextValue,
} from '@/infrastructure/runtime/motion';

// TASK S item 3: opt-in .ds-scroll-reveal (entry fade-up) on dashboard section
// reveals, gated by the ambient dial (allowAmbientMotion) and reduce-neutralized.

const HERE = dirname(fileURLToPath(import.meta.url));
const transitions = readFileSync(
  resolve(HERE, '../../../../../../../foundation/tokens/css/foundation/animations/transitions.css'),
  'utf8',
);

function buildConfig(): DashboardSurfaceConfig {
  return {
    visual: { statsColumns: 2, sectionsColumns: 12 },
    presentation: {
      chrome: { title: 'Ops', subtitle: 'Live' },
      sections: [
        { key: 'primary', title: 'Open items', span: 8, content: <div>Section A</div> },
        { key: 'secondary', title: 'Trends', span: 4, content: <div>Section B</div> },
      ],
    },
    behavior: { stats: [], headerActions: [] },
    access: {},
  } as unknown as DashboardSurfaceConfig;
}

function motionValue(ambient: 'subtle' | 'off', reduce = false): MotionContextValue {
  return {
    systemPrefersReducedMotion: reduce,
    prefersReducedMotion: reduce,
    policy: resolveMotionPolicy({
      profile: 'expressive',
      tenantDial: { ambient },
      reduce,
      pointer: 'fine',
      power: 'normal',
      visible: true,
    }),
  } as MotionContextValue;
}

describe('DashboardSurface scroll-reveal (ambient-gated)', () => {
  it('stamps .ds-scroll-reveal on section cells when ambient motion is allowed', async () => {
    const { container } = renderSurface(
      <MotionContext.Provider value={motionValue('subtle')}>
        <DashboardSurface config={buildConfig()} />
      </MotionContext.Provider>,
    );
    // Wait for the engine-switched surface to resolve past its Suspense
    // fallback, then assert one reveal per rendered section.
    await waitFor(() =>
      expect(container.querySelectorAll('.ds-scroll-reveal').length).toBeGreaterThanOrEqual(2),
    );
  });

  it('omits .ds-scroll-reveal when the ambient dial is off', async () => {
    const { container } = renderSurface(
      <MotionContext.Provider value={motionValue('off')}>
        <DashboardSurface config={buildConfig()} />
      </MotionContext.Provider>,
    );
    await screen.findByText('Section A');
    expect(container.querySelector('.ds-scroll-reveal')).toBeNull();
  });

  it('omits .ds-scroll-reveal under reduced motion even with ambient subtle', async () => {
    const { container } = renderSurface(
      <MotionContext.Provider value={motionValue('subtle', true)}>
        <DashboardSurface config={buildConfig()} />
      </MotionContext.Provider>,
    );
    await screen.findByText('Section A');
    expect(container.querySelector('.ds-scroll-reveal')).toBeNull();
  });
});

describe('.ds-scroll-reveal CSS is reduce-neutralized and view()-scoped', () => {
  it('reveals only under an animation-timeline: view() @supports block', () => {
    expect(transitions).toMatch(/@supports \(animation-timeline: view\(\)\)\s*\{[\s\S]*?\.ds-scroll-reveal\s*\{/);
    expect(transitions).toContain('animation-timeline: view()');
  });

  it('neutralizes to a static end state under prefers-reduced-motion', () => {
    const reduceBlock = /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.ds-scroll-reveal\s*\{[\s\S]*?animation:\s*none;[\s\S]*?opacity:\s*1;[\s\S]*?\}/;
    expect(transitions).toMatch(reduceBlock);
  });
});
