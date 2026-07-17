/** @fileoverview AuthSurface mobile tests -- responsive stacking and hero collapse. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthSurface } from '..';
import type { AuthSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '../../../../../../../tooling/testing/helpers/browser/match-media';

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

  it('prefers the mobile hero when one is provided', async () => {
    mockMatchMedia(375);

    const config = buildConfig();
    config.presentation.mobileHero = <div>Mobile hero summary</div>;

    renderSurface(<AuthSurface config={config} />);

    expect(await screen.findByText('Mobile hero summary')).toBeInTheDocument();
    expect(screen.queryByText('Hero content')).not.toBeInTheDocument();
  });
});
