/** @fileoverview ListSurface defaults tests -- profile-driven default view and density. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ListSurface } from '..';
import type { EntityAdapter, ListSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

interface RawCandidate {
  id: string;
  name: string;
}

const candidateAdapter: EntityAdapter<RawCandidate, RawCandidate> = {
  entity: 'candidate',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [
    {
      key: 'name',
      fieldId: 'candidate.name',
    },
  ],
};

function buildConfig(): ListSurfaceConfig<RawCandidate> {
  return {
    visual: {
      allowViewSwitch: false,
    },
    presentation: {
      chrome: {
        title: 'Candidates',
      },
      /**
       * A custom card renderer gives us a clean assertion target. If the
       * profile default switches the surface into card mode, this label will
       * render; if the surface stays in table mode, it will not.
       */
      renderCard: (item) => <div>{`Card view: ${item.name}`}</div>,
    },
    behavior: {
      columns: [
        {
          key: 'name',
          fieldId: 'candidate.name',
          header: 'Candidate',
        },
      ],
    },
  };
}

describe('ListSurface profile defaults', () => {
  it('uses the product profile list view when the surface does not force one', async () => {
    // `events.organizer` declares `surfaceDefaults.listView: 'table'`, so the
    // profile default IS the table. This leg used to assert the card renderer
    // instead and passed only because the test DOM answered `false` to every
    // media query at once -- a viewport neither at least 640px wide nor at most
    // 639px wide -- which put the surface in its MOBILE branch, where the card
    // view is the default regardless of profile.
    renderSurface(
      <ListSurface
        data={[
          {
            id: '1',
            name: 'Ana Gomez',
          },
        ]}
        adapter={candidateAdapter}
        config={buildConfig()}
      />,
      {
        productProfile: 'events.organizer',
      }
    );

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Ana Gomez')).toBeInTheDocument();
    expect(screen.queryByText('Card view: Ana Gomez')).toBeNull();
  });

  it('falls to the mobile card default below the stacking width', async () => {
    // The counterfactual for the leg above: the SAME profile and the SAME
    // config render the card view once the viewport really is a phone, which is
    // what makes the assertion above about the profile and not about the
    // environment.
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    try {
      renderSurface(
        <ListSurface
          data={[
            {
              id: '1',
              name: 'Ana Gomez',
            },
          ]}
          adapter={candidateAdapter}
          config={buildConfig()}
        />,
        {
          productProfile: 'events.organizer',
        }
      );

      expect(await screen.findByText('Card view: Ana Gomez')).toBeInTheDocument();
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: original });
    }
  });

  it('lets the surface instance override profile-driven card chrome', async () => {
    const config = buildConfig();
    config.visual.defaultView = 'cards';
    config.visual.profileOverrides = {
      cardVariant: 'ghost',
    };
    config.presentation.renderCard = undefined;

    renderSurface(
      <ListSurface
        data={[
          {
            id: '1',
            name: 'Ana Gomez',
          },
        ]}
        adapter={candidateAdapter}
        config={config}
      />,
      {
        productProfile: 'events.organizer',
      }
    );

    const cardContent = await screen.findByText('Ana Gomez');
    expect(cardContent.closest('.rottay-card')).toHaveAttribute('data-variant', 'ghost');
  });
});
