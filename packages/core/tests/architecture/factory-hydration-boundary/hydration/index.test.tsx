/**
 * @fileoverview The engine factory's hydration boundary (T1-T7).
 *
 * A server-rendered or hydrated instance renders without a factory
 * `<Suspense>`, so the server tree and the hydrating client tree have the same
 * shape. A fresh client mount, or a change of implementation, keeps a
 * per-instance boundary, so a pending chunk never hides its siblings behind an
 * ancestor fallback.
 */
import { Suspense, useState, type ComponentType } from 'react';
import { act } from 'react';
import { flushSync } from 'react-dom';
import { describe, expect, it } from 'vitest';

import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';

import {
  byTestId,
  click,
  deferred,
  hydrate,
  hydrated,
  mountHtml,
  settle,
  visible,
  warmServerHtml,
  watchFallbacks,
} from '../harness';

type LabelProps = { label: string };
type Loaded = { default: ComponentType<LabelProps> };

const Label = ({ label }: LabelProps) => <span data-testid={`fam-${label}`}>{label}</span>;
const ClassicLabel = ({ label }: LabelProps) => <span data-testid={`classic-${label}`}>{label}</span>;
const ancestor = <i data-testid="ancestor">ancestor</i>;

/** One server definition and one cold client definition of the same family. */
function coldPair(name: string) {
  let phase: 'server' | 'client' = 'server';
  const gate = deferred<void>();
  const loaders = {
    classic: null,
    rustic: null,
    modern: async (): Promise<Loaded> => {
      if (phase === 'client') await gate.promise;
      return { default: Label };
    },
  };
  return {
    Server: createEngineComponent<LabelProps>(name, loaders),
    Client: createEngineComponent<LabelProps>(name, loaders),
    toClient: () => {
      phase = 'client';
    },
    open: () => gate.resolve(),
  };
}

describe('factory hydration boundary', () => {
  it('T1 a warm server render emits no factory boundary', async () => {
    const Fam = createEngineComponent<LabelProps>('HbT1', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Label }),
    });

    const html = await warmServerHtml(() => (
      <>
        <Fam engine="modern" label="a" />
        <Fam engine="modern" label="b" />
      </>
    ));

    expect(html).toContain('data-testid="fam-a"');
    expect(html.match(/<!--\$/g) ?? []).toEqual([]);
  });

  it('T2 hydration reports no recoverable error and keeps the server node', async () => {
    const Fam = createEngineComponent<LabelProps>('HbT2', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Label }),
    });
    const App = () => (
      <Suspense fallback={ancestor}>
        <b data-testid="sibling">sibling</b>
        <Fam engine="modern" label="ssr" />
      </Suspense>
    );

    const container = mountHtml(await warmServerHtml(() => <App />));
    const serverNode = byTestId(container, 'fam-ssr');
    const { recoverable } = await hydrate(container, <App />);
    await settle();

    expect(recoverable).toEqual([]);
    expect(serverNode).not.toBeNull();
    expect(byTestId(container, 'fam-ssr')).toBe(serverNode);
    expect(hydrated(serverNode)).toBe(true);
  });

  describe('after hydration', () => {
    async function hydratedApp() {
      const Rendered = createEngineComponent<LabelProps>('HbRendered', {
        classic: null,
        rustic: null,
        modern: async () => ({ default: Label }),
      });
      const late = deferred<Loaded>();
      const Late = createEngineComponent<LabelProps>('HbLate', {
        classic: null,
        rustic: null,
        modern: () => late.promise,
      });
      const classic = deferred<Loaded>();
      const Switchable = createEngineComponent<LabelProps>('HbSwitch', {
        classic: () => classic.promise,
        rustic: null,
        modern: async () => ({ default: Label }),
      });
      const control = { open: () => {}, toClassic: () => {}, siblingClicks: 0 };
      function App() {
        const [open, setOpen] = useState(false);
        const [engine, setEngine] = useState<'modern' | 'classic'>('modern');
        control.open = () => setOpen(true);
        control.toClassic = () => setEngine('classic');
        return (
          <Suspense fallback={ancestor}>
            <button type="button" data-testid="sibling" onClick={() => (control.siblingClicks += 1)}>
              sibling
            </button>
            <button type="button" data-testid="opener" onClick={() => setOpen(true)}>
              open
            </button>
            <Rendered engine="modern" label="ssr" />
            <Switchable engine={engine} label="sw" />
            {open ? <Late engine="modern" label="late" /> : null}
          </Suspense>
        );
      }
      const container = mountHtml(await warmServerHtml(() => <App />));
      const { recoverable } = await hydrate(container, <App />);
      await settle();
      return { container, recoverable, control, late, classic, fallbacks: watchFallbacks(container, ['ancestor']) };
    }

    it('T3 a fresh mount with a pending chunk keeps its siblings visible', async () => {
      const { container, control, late, fallbacks } = await hydratedApp();

      act(() => flushSync(() => control.open()));

      expect(visible(container, 'sibling')).toBe(true);
      expect(fallbacks).toEqual(new Set());

      await act(async () => late.resolve({ default: Label }));
      await settle();
      expect(visible(container, 'fam-late')).toBe(true);
      expect(fallbacks).toEqual(new Set());
    });

    it('T6 a click-triggered mount next to a hydrated sibling keeps the sibling interactive', async () => {
      const { container, control, late, fallbacks } = await hydratedApp();

      await click(byTestId(container, 'opener'));
      expect(visible(container, 'sibling')).toBe(true);
      await click(byTestId(container, 'sibling'));
      expect(control.siblingClicks).toBe(1);
      expect(fallbacks).toEqual(new Set());

      await act(async () => late.resolve({ default: Label }));
      await settle();
      expect(visible(container, 'fam-late')).toBe(true);
      expect(fallbacks).toEqual(new Set());
    });

    it('T4 a hydrated instance switching to a pending engine keeps its siblings visible', async () => {
      const { container, recoverable, control, classic, fallbacks } = await hydratedApp();

      act(() => flushSync(() => control.toClassic()));

      expect(visible(container, 'sibling')).toBe(true);
      expect(fallbacks).toEqual(new Set());

      await act(async () => classic.resolve({ default: ClassicLabel }));
      await settle();
      expect(visible(container, 'classic-sw')).toBe(true);
      expect(fallbacks).toEqual(new Set());
      expect(recoverable).toEqual([]);
    });
  });

  it('T5 a cold client definition hydrates over a dehydrated click without a mismatch', async () => {
    const pair = coldPair('HbT5');
    let clicks = 0;
    const App = ({ Fam }: { Fam: typeof pair.Server }) => (
      <Suspense fallback={ancestor}>
        <section>
          <Suspense fallback={<i data-testid="fallback-a">a</i>}>
            <Fam engine="modern" label="a" />
          </Suspense>
        </section>
        <section>
          <Suspense fallback={<i data-testid="fallback-b">b</i>}>
            <button type="button" data-testid="button" onClick={() => (clicks += 1)}>
              click
            </button>
            <Fam engine="modern" label="b" />
          </Suspense>
        </section>
      </Suspense>
    );

    const container = mountHtml(await warmServerHtml(() => <App Fam={pair.Server} />));
    const nodes = ['fam-a', 'fam-b', 'button'].map((id) => byTestId(container, id));
    const fallbacks = watchFallbacks(container, ['ancestor', 'fallback-a', 'fallback-b']);
    pair.toClient();
    const { recoverable } = await hydrate(container, <App Fam={pair.Client} />);
    await click(byTestId(container, 'button'));
    await act(async () => pair.open());
    await settle(50);
    await click(byTestId(container, 'button'));

    expect(recoverable).toEqual([]);
    expect(['fam-a', 'fam-b', 'button'].map((id) => byTestId(container, id))).toEqual(nodes);
    expect(nodes.every((node) => node !== null && hydrated(node))).toBe(true);
    expect(fallbacks).toEqual(new Set());
    expect(clicks).toBeGreaterThanOrEqual(1);
  });

  it('T7 out-of-order selective hydration of two cold regions keeps both server trees', async () => {
    const first = coldPair('HbT7First');
    const second = coldPair('HbT7Second');
    const App = ({ client }: { client: boolean }) => {
      const First = client ? first.Client : first.Server;
      const Second = client ? second.Client : second.Server;
      return (
        <Suspense fallback={ancestor}>
          <section>
            <Suspense fallback={<i data-testid="fallback-first">first</i>}>
              <First engine="modern" label="first" />
            </Suspense>
          </section>
          <section>
            <Suspense fallback={<i data-testid="fallback-second">second</i>}>
              <button type="button" data-testid="second-button">
                second
              </button>
              <Second engine="modern" label="second" />
            </Suspense>
          </section>
        </Suspense>
      );
    };

    const html = await warmServerHtml(() => <App client={false} />);
    expect(html.match(/<!--\$-->/g)).toHaveLength(3);
    const container = mountHtml(html);
    const ids = ['fam-first', 'fam-second', 'second-button'];
    const nodes = ids.map((id) => byTestId(container, id));
    const fallbacks = watchFallbacks(container, ['ancestor', 'fallback-first', 'fallback-second']);
    first.toClient();
    second.toClient();
    const { recoverable } = await hydrate(container, <App client />);

    await click(byTestId(container, 'second-button'));
    await act(async () => second.open());
    await settle();
    expect(hydrated(byTestId(container, 'fam-second'))).toBe(true);
    expect(hydrated(byTestId(container, 'fam-first'))).toBe(false);

    await act(async () => first.open());
    await settle();
    expect(recoverable).toEqual([]);
    expect(ids.map((id) => byTestId(container, id))).toEqual(nodes);
    expect(nodes.every((node) => hydrated(node))).toBe(true);
    expect(fallbacks).toEqual(new Set());
  });
});
