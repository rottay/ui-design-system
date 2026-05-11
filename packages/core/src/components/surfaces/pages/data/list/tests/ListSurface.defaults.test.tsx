/** @fileoverview ListSurface defaults tests -- profile-driven default view and density. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ListSurface } from '..';
import type { EntityAdapter, ListSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

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
  });
});
