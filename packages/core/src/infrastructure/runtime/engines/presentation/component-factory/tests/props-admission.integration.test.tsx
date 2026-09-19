/**
 * `admitProps` -- the router's generic refusal for an input the SELECTED
 * engine cannot honor.
 *
 * The factory already refuses an undeclared engine and a declared
 * implementation absence by name. This is the third refusal of the same kind
 * and the only one a FAMILY declares, because the engine that cannot honor the
 * input may be frozen and unwritable. Two halves, both load-bearing:
 *
 *   - development throws, under the component's own displayName, so the
 *     degraded paint is never mistaken for the requested one;
 *   - production does not even call the admission, so whatever the engine
 *     documents as its fallback is what ships.
 */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createEngineComponent } from '..';

interface WidgetProps {
  placement?: string;
}

function Widget({ placement }: WidgetProps) {
  return <div data-testid="widget">{placement ?? 'none'}</div>;
}

const loader = () => Promise.resolve({ default: Widget });

const admitProps = vi.fn((props: WidgetProps, engine: string) =>
  props.placement === 'unsupported' ? `"${engine}" cannot honor that placement.` : undefined
);

const AdmittingWidget = createEngineComponent<WidgetProps>(
  'AdmittingWidget',
  { classic: loader, modern: loader, rustic: loader },
  { admitProps }
);

afterEach(() => {
  cleanup();
  admitProps.mockClear();
  vi.unstubAllEnvs();
});

describe('development', () => {
  it('throws the refusal under the component name', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(<AdmittingWidget engine="rustic" placement="unsupported" />)
      ).toThrow('AdmittingWidget: "rustic" cannot honor that placement.');
    } finally {
      consoleError.mockRestore();
    }
  });

  it('renders when the admission returns nothing, and is asked with the resolved engine', async () => {
    render(<AdmittingWidget engine="classic" placement="supported" />);

    expect(await screen.findByTestId('widget')).toHaveTextContent('supported');
    expect(admitProps).toHaveBeenCalledWith(
      expect.objectContaining({ placement: 'supported' }),
      'classic'
    );
  });
});

describe('production', () => {
  it('never asks, so the engine keeps whatever it documents as its fallback', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    render(<AdmittingWidget engine="rustic" placement="unsupported" />);

    expect(await screen.findByTestId('widget')).toHaveTextContent('unsupported');
    expect(admitProps).not.toHaveBeenCalled();
  });
});
