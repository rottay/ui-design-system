/**
 * @fileoverview Engine gap smoke tests for components needing explicit engine imports.
 * Covers Calendar, Tree, Link, Splitter, and Tour which require per-engine
 * module pre-loading before they render correctly.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import * as DS from '../../../../index';
import { STABLE_ENGINES, renderWithEngine } from '../../helpers/engine';

describe('engine gap smoke coverage', () => {
  it.each(STABLE_ENGINES)('renders Calendar through the %s engine', async (engine) => {
    if (engine === 'classic') {
      await import('../../../../ui/primitives/display/Calendar/engines/classic');
    } else if (engine === 'modern') {
      await import('../../../../ui/primitives/display/Calendar/engines/modern');
    } else {
      await import('../../../../ui/primitives/display/Calendar/engines/rustic');
    }

    renderWithEngine(
      <DS.Calendar
        engine={engine}
        defaultValue={new Date('2026-03-18T09:00:00')}
        headerRender={() => <div>Calendar header</div>}
      />,
      engine
    );

    await waitFor(() => {
      if (engine === 'classic') {
        expect(document.body.textContent).toContain('Calendar header');
        return;
      }

      expect(document.body.textContent).toContain('March');
      expect(document.body.textContent).toContain('2026');
    }, { timeout: 15000 });
  });

  it.each(STABLE_ENGINES)('renders Tree through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Tree
        engine={engine}
        treeData={[
          {
            key: 'ops',
            title: 'Operations',
            children: [{ key: 'security', title: 'Security' }],
          },
        ]}
        defaultExpandedKeys={['ops']}
      />,
      engine
    );

    expect(await screen.findByText('Operations')).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Link through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Link engine={engine} href="/docs">
        Documentation
      </DS.Link>,
      engine
    );

    expect(await screen.findByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
  });

  it.each(STABLE_ENGINES)('renders Splitter through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Splitter engine={engine} layout="horizontal">
        <DS.Splitter.Panel engine={engine} defaultSize={40}>
          Left panel
        </DS.Splitter.Panel>
        <DS.Splitter.Panel engine={engine}>Right panel</DS.Splitter.Panel>
      </DS.Splitter>,
      engine
    );

    expect(await screen.findByText('Left panel')).toBeInTheDocument();
    expect(await screen.findByText('Right panel')).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Tour through the %s engine', async (engine) => {
    if (engine === 'classic') {
      await import('../../../../ui/primitives/overlay/Tour/engines/classic');
    } else if (engine === 'modern') {
      await import('../../../../ui/primitives/overlay/Tour/engines/modern');
    } else {
      await import('../../../../ui/primitives/overlay/Tour/engines/rustic');
    }

    renderWithEngine(
      <div>
        <button id="tour-target" type="button">
          Target
        </button>
        <DS.Tour
          engine={engine}
          open
          current={0}
          steps={[
            {
              target: '#tour-target',
              title: 'Guided step',
              description: 'This is the first tour step',
            },
          ]}
        />
      </div>,
      engine
    );

    await waitFor(() => {
      expect(document.body.textContent).toContain('Guided step');
      expect(document.body.textContent).toContain('This is the first tour step');
    }, { timeout: 15000 });
  });
});
