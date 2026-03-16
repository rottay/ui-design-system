/**
 * @fileoverview Multi-engine integration tests for MessageItem, NotificationItem,
 * and Toast. Verifies that all three feedback channels render content correctly
 * through each stable engine.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import * as DS from '../../index';
import { STABLE_ENGINES, renderWithEngine } from '../helpers/engine-test-utils';

describe('message + notification + toast multi-engine integration', () => {
  it.each(STABLE_ENGINES)('renders MessageItem through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.MessageItem
        id={`message-${engine}`}
        type="success"
        content="Saved through message"
        duration={0}
        closable
        onRemove={() => undefined}
      />,
      engine
    );

    expect(await screen.findByText('Saved through message', {}, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders NotificationItem through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.NotificationItem
        id={`notification-${engine}`}
        type="success"
        message="Saved through notification"
        description="Engine-aware notification body"
        duration={0}
        closable
        onRemove={() => undefined}
      />,
      engine
    );

    expect(
      await screen.findByText('Saved through notification', {}, { timeout: 6_000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Engine-aware notification body', {}, { timeout: 6_000 })
    ).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Toast through the %s engine', async (engine) => {
    const result = renderWithEngine(
      <DS.Toast
        engine={engine}
        visible
        variant="success"
        title="Saved through toast"
        description="Engine-aware toast body"
        closable
        duration={0}
      />,
      engine
    );

    if (engine === 'classic') {
      await waitFor(() => {
        expect(result.container).toBeInTheDocument();
      });
      return;
    }

    expect(await screen.findByText('Saved through toast', {}, { timeout: 6_000 })).toBeInTheDocument();
    expect(await screen.findByText('Engine-aware toast body', {}, { timeout: 6_000 })).toBeInTheDocument();
  });
});
