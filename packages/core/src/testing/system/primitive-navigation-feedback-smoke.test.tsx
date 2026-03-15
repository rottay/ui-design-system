import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import * as DS from '../../index';
import { STABLE_ENGINES, renderWithEngine } from '../helpers/engine-test-utils';

describe('primitive navigation + feedback smoke coverage', () => {
  it.each(STABLE_ENGINES)('renders Stepper compounds through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Stepper engine={engine} current={1} clickable onChange={() => undefined}>
        <DS.Stepper.Step title="Plan" description="Prepare the show" />
        <DS.Stepper.Step title="Launch" description="Go live" />
        <DS.Stepper.Content stepIndex={1}>Launch checklist</DS.Stepper.Content>
      </DS.Stepper>,
      engine
    );

    expect(await screen.findByText('Plan', {}, { timeout: 6_000 })).toBeInTheDocument();
    expect(await screen.findByText('Launch', {}, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Menu compounds through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Menu engine={engine} mode="inline" defaultOpenKeys={['products']}>
        <DS.Menu.Item itemKey="home">Home</DS.Menu.Item>
        <DS.Menu.SubMenu itemKey="products" title="Products">
          <DS.Menu.Item itemKey="tickets">Tickets</DS.Menu.Item>
        </DS.Menu.SubMenu>
        <DS.Menu.Group title="Account">
          <DS.Menu.Item itemKey="profile">Profile</DS.Menu.Item>
        </DS.Menu.Group>
      </DS.Menu>,
      engine
    );

    expect((await screen.findAllByText('Home', {}, { timeout: 6_000 })).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Products', {}, { timeout: 6_000 })).length).toBeGreaterThan(0);
  });

  it.each(STABLE_ENGINES)('renders Modal through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Modal engine={engine} open onClose={() => undefined}>
        <DS.Modal.Header>Event modal</DS.Modal.Header>
        <DS.Modal.Body>Review event configuration.</DS.Modal.Body>
        <DS.Modal.Footer>
          <button type="button">Close</button>
        </DS.Modal.Footer>
      </DS.Modal>,
      engine
    );

    await waitFor(
      () => {
        expect(document.body.textContent).toContain('Event modal');
        expect(document.body.textContent).toContain('Review event configuration.');
      },
      { timeout: 6_000 }
    );
  });

  it.each(STABLE_ENGINES)('renders Statistic.Countdown through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Statistic.Countdown
        engine={engine}
        title="Sale ends"
        value={Date.now() + 60_000}
        format="mm:ss"
      />,
      engine
    );

    expect(await screen.findByText('Sale ends', {}, { timeout: 6_000 })).toBeInTheDocument();
  });
});
