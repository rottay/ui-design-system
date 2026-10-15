/**
 * @fileoverview The factory's named refusals survive the hydration boundary
 * (R1-R3): an undeclared engine throws in the router, and a declared absence
 * or a pack without the component is refused by name inside the factory's
 * error boundary.
 */
import { Component, type ReactNode } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import {
  clearCustomRegistry,
  registerCustomComponent,
} from '@/infrastructure/runtime/engines/selection/customization/component-registry';
import { TenantContext } from '@/infrastructure/runtime/tenant/foundation/context';

import { settle } from '../harness';

class Caught extends Component<{ children: ReactNode }, { message?: string }> {
  state: { message?: string } = {};
  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }
  render() {
    return this.state.message ? <output data-testid="caught">{this.state.message}</output> : this.props.children;
  }
}

const Label = ({ label }: { label: string }) => <span data-testid="rendered">{label}</span>;

async function render(node: ReactNode): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(<Caught>{node}</Caught>));
  await settle();
  cleanups.push(() => {
    act(() => root.unmount());
    container.remove();
  });
  return container;
}

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  clearCustomRegistry();
  vi.restoreAllMocks();
});

describe('factory refusals', () => {
  it('R1 an undeclared engine throws in the router, by name', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Fam = createEngineComponent<{ label: string }>('RfR1', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Label }),
    });

    const container = await render(<Fam label="x" />);

    expect(container.querySelector('[data-testid="caught"]')?.textContent).toMatch(/^RfR1: no engine is declared/);
    expect(container.querySelector('[data-testid="rendered"]')).toBeNull();
  });

  it('R2 a declared Modern absence is refused by name inside the factory error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Fam = createEngineComponent<{ label: string }>('RfR2', {
      classic: async () => ({ default: Label }),
      rustic: null,
      modern: null,
    });

    const container = await render(<Fam engine="modern" label="x" />);

    expect(container.querySelector('[role="alert"]')?.textContent).toContain('RfR2 has no modern implementation');
    expect(container.querySelector('[data-testid="caught"]')).toBeNull();
  });

  it('R3 a custom pack without the component is refused by name inside the factory error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    registerCustomComponent('RfR3Other', Label as never, 'pack-z');
    const Fam = createEngineComponent<{ label: string }>('RfR3', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Label }),
    });

    const container = await render(
      <TenantContext.Provider value={{ config: { componentPack: 'pack-z' } } as never}>
        <Fam engine="custom" label="x" />
      </TenantContext.Provider>
    );

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'No custom implementation registered for "RfR3" in pack "pack-z"'
    );
    expect(container.querySelector('[data-testid="caught"]')).toBeNull();
  });
});
