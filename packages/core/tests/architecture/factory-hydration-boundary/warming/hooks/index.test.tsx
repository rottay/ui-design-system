/**
 * @fileoverview The warming channel's hook cost on the engine router.
 *
 * The channel adds exactly one hook per router render, a `useContext` of the
 * rendered-families collector, whether the channel is open or closed; every
 * other router hook keeps its kind and order.
 */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RENDERED_FAMILIES_CHANNEL, RenderedFamiliesContext } from '@/infrastructure/runtime/engines/composition/react/rendered-families';
import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import { TenantContext } from '@/infrastructure/runtime/tenant/foundation/context';

import { mountHtml, serverHtml, settle } from '../../harness';

const probe = vi.hoisted(() => ({ on: false, hooks: [] as unknown[][] }));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const wrapped: Record<string, unknown> = {};
  for (const name of Object.keys(actual)) {
    if (!/^use[A-Z]/.test(name)) continue;
    const real = (actual as unknown as Record<string, (...args: unknown[]) => unknown>)[name];
    wrapped[name] = (...args: unknown[]) => {
      if (probe.on) probe.hooks.push([name, args[0]]);
      return real(...args);
    };
  }
  return { ...actual, ...wrapped, default: actual };
});

type LabelProps = { label: string };
const Label = ({ label }: LabelProps) => <span>{label}</span>;

/** The router's hooks in order: W1's sequence plus the collector read. */
const ROUTER_LEDGER = [
  'useSyncExternalStore',
  'useRef',
  'useContext',
  'useContext:rendered-families',
  'useContext:tenant',
  'useMemo',
  'useRef',
];

async function routerLedger(): Promise<string[]> {
  const Fam = createEngineComponent<LabelProps>('HookLedger', {
    classic: null,
    rustic: null,
    modern: async () => ({ default: Label }),
  });
  await serverHtml(<Fam engine="modern" label="prewarm" />);
  const root = createRoot(mountHtml(''));
  probe.hooks.length = 0;
  probe.on = true;
  await act(async () => root.render(<Fam engine="modern" label="ledger" />));
  probe.on = false;
  await settle();
  act(() => root.unmount());
  return probe.hooks.map(([name, arg]) =>
    name !== 'useContext'
      ? String(name)
      : arg === RenderedFamiliesContext
        ? 'useContext:rendered-families'
        : arg === TenantContext
          ? 'useContext:tenant'
          : 'useContext'
  );
}

afterEach(() => {
  RENDERED_FAMILIES_CHANNEL.open = false;
});

describe('warming channel hook cost', () => {
  it('adds one useContext of the collector per router render, and no other hook', async () => {
    expect(await routerLedger()).toEqual(ROUTER_LEDGER);
  });

  it('costs the same hook with the channel open', async () => {
    RENDERED_FAMILIES_CHANNEL.open = true;
    expect(await routerLedger()).toEqual(ROUTER_LEDGER);
  });
});
