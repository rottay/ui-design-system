/**
 * @fileoverview The factory boundary re-arms on implementation identity
 * (P1, P1s, P1c, SB).
 *
 * A hydrated instance gains a per-instance boundary exactly when its
 * implementation type changes, which remounts it anyway. A pack change that
 * keeps the Modern implementation neither remounts it nor loses its state.
 */
import { Suspense, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { act } from 'react';
import { flushSync } from 'react-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import {
  clearCustomRegistry,
  registerCustomComponent,
} from '@/infrastructure/runtime/engines/selection/customization/component-registry';
import { TenantContext } from '@/infrastructure/runtime/tenant/foundation/context';

import {
  byTestId,
  click,
  hydrate,
  mountHtml,
  settle,
  visible,
  warmServerHtml,
  watchFallbacks,
} from '../harness';

type LabelProps = { label: string };
const ancestor = <i data-testid="ancestor">ancestor</i>;

afterEach(() => clearCustomRegistry());

/** A tenant whose component pack the test switches after hydration. */
function packApp(initialPack: string | undefined, children: ReactNode) {
  const control = { setPack: (_pack: string | undefined) => {} };
  function App() {
    const [pack, setPack] = useState(initialPack);
    control.setPack = setPack;
    return (
      <TenantContext.Provider value={{ config: { componentPack: pack } } as never}>
        <Suspense fallback={ancestor}>
          <b data-testid="sibling">sibling</b>
          {children}
        </Suspense>
      </TenantContext.Provider>
    );
  }
  return { App, control };
}

async function hydrated(App: () => ReactNode) {
  const container = mountHtml(await warmServerHtml(() => <App />));
  const { recoverable } = await hydrate(container, <App />);
  await settle();
  return { container, recoverable, fallbacks: watchFallbacks(container, ['ancestor']) };
}

describe('factory boundary re-arm', () => {
  it('P1 a pack change on a hydrated Modern instance keeps its mount and node', async () => {
    let mounts = 0;
    const Impl = ({ label }: LabelProps) => {
      useEffect(() => {
        mounts += 1;
      }, []);
      return <span data-testid="p1">{label}</span>;
    };
    const Fam = createEngineComponent<LabelProps>('ReP1', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Impl }),
    });
    const { App, control } = packApp(undefined, <Fam engine="modern" label="x" />);
    const { container, recoverable, fallbacks } = await hydrated(App);
    const node = byTestId(container, 'p1');
    expect(mounts).toBe(1);

    await act(async () => flushSync(() => control.setPack('acme')));
    await settle();

    expect(mounts).toBe(1);
    expect(node).not.toBeNull();
    expect(byTestId(container, 'p1')).toBe(node);
    expect(fallbacks).toEqual(new Set());
    expect(recoverable).toEqual([]);
  });

  it('P1s state and an uncontrolled input survive hydration and a Modern pack change', async () => {
    const Impl = () => {
      const [count, setCount] = useState(0);
      return (
        <span>
          <button type="button" data-testid="count" onClick={() => setCount((value) => value + 1)}>
            {count}
          </button>
          <input aria-label="note" data-testid="note" defaultValue="" />
        </span>
      );
    };
    const Fam = createEngineComponent<Record<never, never>>('ReP1s', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Impl as ComponentType<Record<never, never>> }),
    });
    const { App, control } = packApp(undefined, <Fam engine="modern" />);
    const container = mountHtml(await warmServerHtml(() => <App />));
    const input = byTestId(container, 'note') as HTMLInputElement;
    input.value = 'before hydration';
    const { recoverable } = await hydrate(container, <App />);
    await settle();
    expect(byTestId(container, 'note')).toBe(input);
    expect(input.value).toBe('before hydration');

    await click(byTestId(container, 'count'));
    input.value = 'after hydration';
    await act(async () => flushSync(() => control.setPack('acme')));
    await settle();

    expect(byTestId(container, 'note')).toBe(input);
    expect(input.value).toBe('after hydration');
    expect(byTestId(container, 'count')?.textContent).toBe('1');
    expect(recoverable).toEqual([]);
  });

  it('P1c a pack change on a hydrated custom instance keeps its siblings visible', async () => {
    const PackA = ({ label }: LabelProps) => <span data-testid="p1c">A{label}</span>;
    const PackB = ({ label }: LabelProps) => <span data-testid="p1c">B{label}</span>;
    registerCustomComponent('ReP1c', PackA as never, 'pack-a');
    registerCustomComponent('ReP1c', PackB as never, 'pack-b');
    const Fam = createEngineComponent<LabelProps>('ReP1c', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: PackA }),
    });
    const { App, control } = packApp('pack-a', <Fam engine="custom" label="x" />);
    const { container, recoverable, fallbacks } = await hydrated(App);

    act(() => flushSync(() => control.setPack('pack-b')));
    expect(visible(container, 'sibling')).toBe(true);
    expect(fallbacks).toEqual(new Set());

    await settle();
    expect(byTestId(container, 'p1c')?.textContent).toBe('Bx');
    expect(visible(container, 'sibling')).toBe(true);
    expect(fallbacks).toEqual(new Set());
    expect(recoverable).toEqual([]);
  });

  it('SB custom X -> Y -> X re-arms without an ancestor fallback or an extra remount', async () => {
    const mounts = { a: 0, b: 0 };
    const PackA = () => {
      useEffect(() => {
        mounts.a += 1;
      }, []);
      return <span data-testid="sb">A</span>;
    };
    const PackB = () => {
      useEffect(() => {
        mounts.b += 1;
      }, []);
      return <span data-testid="sb">B</span>;
    };
    registerCustomComponent('ReSb', PackA as never, 'pack-x');
    registerCustomComponent('ReSb', PackB as never, 'pack-y');
    const Fam = createEngineComponent<Record<never, never>>('ReSb', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: PackA }),
    });
    const { App, control } = packApp('pack-x', <Fam engine="custom" />);
    const { container, recoverable, fallbacks } = await hydrated(App);
    expect(mounts).toEqual({ a: 1, b: 0 });

    act(() => flushSync(() => control.setPack('pack-y')));
    expect(fallbacks).toEqual(new Set());
    await settle();
    expect(byTestId(container, 'sb')?.textContent).toBe('B');
    expect(mounts).toEqual({ a: 1, b: 1 });

    act(() => flushSync(() => control.setPack('pack-x')));
    await settle();
    expect(byTestId(container, 'sb')?.textContent).toBe('A');
    expect(mounts).toEqual({ a: 2, b: 1 });
    expect(fallbacks).toEqual(new Set());
    expect(recoverable).toEqual([]);
  });
});
