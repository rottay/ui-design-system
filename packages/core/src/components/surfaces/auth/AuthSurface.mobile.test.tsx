import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthSurface } from '.';
import type { AuthSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';
import { mockMatchMedia } from '../../../testing/helpers/match-media';

function buildConfig(): AuthSurfaceConfig {
  return {
    visual: {
      layout: 'split',
    },
    presentation: {
      title: 'Sign in',
      subtitle: 'Access your workspace',
      form: <div>Auth form</div>,
      hero: <div>Hero content</div>,
    },
    behavior: {},
  };
}

describe('AuthSurface responsive layout', () => {
  it('keeps the hero visible when the split layout stacks on mobile', async () => {
    mockMatchMedia(375);

    renderSurface(<AuthSurface config={buildConfig()} />);

    expect(await screen.findByText('Hero content')).toBeInTheDocument();
    expect(await screen.findByText('Auth form')).toBeInTheDocument();
  });
});
