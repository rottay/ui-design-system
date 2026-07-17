import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { EffectRuntimeTelemetryListener } from '@/foundation/contracts/runtime/effects';
import {
  EffectRuntimeProvider as PublicEffectRuntimeProvider,
} from '../../../../../../..';
import {
  EffectRuntimeProvider,
  useEffectRuntimeControl,
} from '..';

function ControlProbe({
  enabled,
  onTelemetry,
}: {
  enabled?: unknown;
  onTelemetry?: EffectRuntimeTelemetryListener;
}) {
  const control = useEffectRuntimeControl(enabled, onTelemetry);
  return (
    <button
      data-enabled={String(control.enabled)}
      onClick={() => control.emitTelemetry(Object.freeze({
        schemaVersion: 1,
        name: 'ds.effect.resolution',
        effectId: 'particle-field',
        current: Object.freeze({ mode: 'static', reason: 'effect-disabled' }),
      }))}
      type="button"
    >
      probe
    </button>
  );
}

describe('EffectRuntimeProvider', () => {
  it('is the public root provider and defaults to an enabled standalone boundary', () => {
    expect(PublicEffectRuntimeProvider).toBe(EffectRuntimeProvider);
    render(<ControlProbe />);
    expect(screen.getByRole('button')).toHaveAttribute('data-enabled', 'true');
  });

  it('disables a complete subtree monotonically', () => {
    render(
      <EffectRuntimeProvider enabled={false}>
        <ControlProbe />
        <EffectRuntimeProvider enabled>
          <ControlProbe />
        </EffectRuntimeProvider>
      </EffectRuntimeProvider>,
    );

    for (const probe of screen.getAllByRole('button')) {
      expect(probe).toHaveAttribute('data-enabled', 'false');
    }
  });

  it('lets one instance opt out but rejects malformed truthy controls', () => {
    const { rerender } = render(<ControlProbe enabled={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-enabled', 'false');

    rerender(<ControlProbe enabled={'yes'} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-enabled', 'false');

    rerender(<ControlProbe enabled />);
    expect(screen.getByRole('button')).toHaveAttribute('data-enabled', 'true');
  });

  it('bubbles frozen telemetry, deduplicates listeners and isolates listener failures', () => {
    const eventSink = vi.fn();
    const throwingSink = vi.fn(() => {
      throw new Error('telemetry transport failed');
    });
    render(
      <EffectRuntimeProvider onTelemetry={eventSink}>
        <EffectRuntimeProvider onTelemetry={throwingSink}>
          <ControlProbe onTelemetry={eventSink} />
        </EffectRuntimeProvider>
      </EffectRuntimeProvider>,
    );

    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    expect(eventSink).toHaveBeenCalledTimes(1);
    expect(throwingSink).toHaveBeenCalledTimes(1);

    const event = eventSink.mock.calls[0]?.[0];
    expect(event).toEqual({
      schemaVersion: 1,
      name: 'ds.effect.resolution',
      effectId: 'particle-field',
      current: { mode: 'static', reason: 'effect-disabled' },
    });
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.current)).toBe(true);
  });
});
