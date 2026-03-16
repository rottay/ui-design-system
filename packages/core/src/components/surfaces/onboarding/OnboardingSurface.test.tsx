/** @fileoverview OnboardingSurface tests -- step progression, checklist, and guidance. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OnboardingSurface } from '.';
import type { OnboardingSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';
import { mockMatchMedia } from '../../../testing/helpers/match-media';

function buildConfig(overrides?: Partial<OnboardingSurfaceConfig>): OnboardingSurfaceConfig {
  return {
    visual: {
      showProgress: true,
      stackOnMobile: true,
    },
    presentation: {
      chrome: { title: 'Launch Setup' },
      description: 'Configure the workspace before going live.',
      hero: <div>Hero guidance</div>,
      checklist: <div>Checklist content</div>,
    },
    behavior: {
      currentStep: 0,
      onStepChange: vi.fn(),
      submitAction: {
        id: 'complete',
        label: 'Complete setup',
        variant: 'primary',
        onClick: vi.fn(),
      },
      steps: [
        {
          key: 'details',
          title: 'Details',
          fields: [{ name: 'workspace', label: 'Workspace', type: 'text' }],
        },
      ],
    },
    ...overrides,
  };
}

describe('OnboardingSurface', () => {
  it('forwards onboarding content into the wizard aside', async () => {
    renderSurface(<OnboardingSurface config={buildConfig()} />);

    expect(await screen.findByText('Hero guidance')).toBeInTheDocument();
    expect(await screen.findByText('Checklist content')).toBeInTheDocument();
  });

  it('keeps hero and checklist visible when the onboarding flow stacks on mobile', async () => {
    mockMatchMedia(375);

    renderSurface(<OnboardingSurface config={buildConfig()} />);

    expect(await screen.findByText('Hero guidance')).toBeInTheDocument();
    expect(await screen.findByText('Checklist content')).toBeInTheDocument();
  });
});
