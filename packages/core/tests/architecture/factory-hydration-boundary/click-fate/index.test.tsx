/**
 * @fileoverview Click fate in a region whose engine chunk is still loading at
 * hydration (C-1, C-2).
 *
 * C-1 is a BASELINE DETECTOR of the factory without a mitigation, not the
 * accepted end state: with no factory boundary, a cold family keeps its whole
 * region dehydrated and clicks there are not handled. It flips deliberately
 * when a mitigation lands. C-2 pins the narrow guidance: a cold family in its
 * own app `<Suspense>` leaves the siblings outside it interactive. C-1W is the
 * target with the rendered-families warm: the listed chunk is fetched before
 * hydration asks, so the region hydrates and handles the same clicks.
 */
import { Suspense, type ReactNode } from 'react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap/facade/react/provider';
import { RENDERED_FAMILIES_CHANNEL } from '@/infrastructure/runtime/engines/composition/react/rendered-families';
import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';

import { byTestId, click, deferred, hydrate, mountHtml, serverHtml, settle, warmServerHtml } from '../harness';

type ButtonProps = { label: string; onClick?: () => void };
const DsButton = ({ label, onClick }: ButtonProps) => (
  <button data-testid={`ds-${label}`} onClick={onClick}>
    {label}
  </button>
);

/** `isolate` wraps the cold family alone, or (`wide`) the whole region, in an app `<Suspense>`. */
async function regionClicks(isolate: 'none' | 'cold-only' | 'wide') {
  let phase: 'server' | 'client' = 'server';
  const gate = deferred<void>();
  const warmLoaders = { classic: null, rustic: null, modern: async () => ({ default: DsButton }) };
  const coldLoaders = {
    classic: null,
    rustic: null,
    modern: async () => {
      if (phase === 'client') await gate.promise;
      return { default: DsButton };
    },
  };
  const server = {
    Warm: createEngineComponent<ButtonProps>('CfWarm', warmLoaders),
    Cold: createEngineComponent<ButtonProps>('CfCold', coldLoaders),
  };
  const client = {
    Warm: createEngineComponent<ButtonProps>('CfWarm', warmLoaders),
    Cold: createEngineComponent<ButtonProps>('CfCold', coldLoaders),
  };
  const counts = { app: 0, appNative: 0, warm: 0, cold: 0, submits: 0 };

  function App({ Warm, Cold }: typeof server) {
    const cold = <Cold engine="modern" label="cold" onClick={() => (counts.cold += 1)} />;
    const siblings: ReactNode = (
      <>
        <button type="button" data-testid="app" onClick={() => (counts.app += 1)}>
          app
        </button>
        <Warm engine="modern" label="warm" onClick={() => (counts.warm += 1)} />
      </>
    );
    const region =
      isolate === 'wide' ? (
        <Suspense fallback={<i>isolated</i>}>
          {siblings}
          {cold}
        </Suspense>
      ) : (
        <>
          {siblings}
          {isolate === 'cold-only' ? <Suspense fallback={<i>isolated</i>}>{cold}</Suspense> : cold}
        </>
      );
    return (
      <Suspense fallback={<i>ancestor</i>}>
        <form data-testid="form" onSubmit={(event) => event.preventDefault()}>
          <Suspense fallback={<i>region</i>}>{region}</Suspense>
        </form>
      </Suspense>
    );
  }

  const container = mountHtml(await warmServerHtml(() => <App {...server} />));
  byTestId(container, 'app')?.addEventListener('click', () => (counts.appNative += 1));
  byTestId(container, 'form')?.addEventListener('submit', (event) => {
    counts.submits += 1;
    event.preventDefault();
  });
  phase = 'client';
  await serverHtml(<client.Warm engine="modern" label="prewarm" />);
  const { recoverable } = await hydrate(container, <App {...client} />);
  await settle(20);

  for (const id of ['app', 'ds-warm', 'ds-cold']) await click(byTestId(container, id));
  const whileGated = { ...counts };
  await act(async () => gate.resolve());
  await settle(50);
  return { recoverable, whileGated, afterResolve: { ...counts } };
}

/**
 * A chunk fetch started before hydration has landed by the time hydration
 * asks; one started by hydration is still in flight while the user clicks.
 * The chunk is cached once fetched and dropped on failure, as webpack does.
 */
async function warmedRegionClicks() {
  let phase: 'server' | 'boot' | 'client' = 'server';
  const gate = deferred<void>();
  let chunk: Promise<void> | undefined;
  const fetchChunk = () =>
    (chunk ??= phase === 'client' ? gate.promise : Promise.resolve());
  const warmLoaders = { classic: null, rustic: null, modern: async () => ({ default: DsButton }) };
  const coldLoaders = {
    classic: null,
    rustic: null,
    modern: async () => {
      if (phase !== 'server') await fetchChunk();
      return { default: DsButton };
    },
  };
  const counts = { app: 0, appNative: 0, warm: 0, cold: 0, submits: 0 };
  const tenantConfig: TenantConfig = {
    slug: 'click-fate',
    name: 'click-fate',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'click-fate' },
  };

  function App({ Warm, Cold }: Record<'Warm' | 'Cold', ReturnType<typeof createEngineComponent<ButtonProps>>>) {
    return (
      <DesignSystemProvider tenantConfig={tenantConfig} forceEngine="modern" skipCssLoading>
        <Suspense fallback={<i>ancestor</i>}>
          <form data-testid="form" onSubmit={(event) => event.preventDefault()}>
            <Suspense fallback={<i>region</i>}>
              <button type="button" data-testid="app" onClick={() => (counts.app += 1)}>
                app
              </button>
              <Warm label="warm" onClick={() => (counts.warm += 1)} />
              <Cold label="cold" onClick={() => (counts.cold += 1)} />
            </Suspense>
          </form>
        </Suspense>
      </DesignSystemProvider>
    );
  }

  const server = {
    Warm: createEngineComponent<ButtonProps>('CwWarm', warmLoaders),
    Cold: createEngineComponent<ButtonProps>('CwCold', coldLoaders),
  };
  const container = mountHtml(await warmServerHtml(() => <App {...server} />));
  byTestId(container, 'app')?.addEventListener('click', () => (counts.appNative += 1));
  byTestId(container, 'form')?.addEventListener('submit', (event) => {
    counts.submits += 1;
    event.preventDefault();
  });

  phase = 'boot';
  const client = {
    Warm: createEngineComponent<ButtonProps>('CwWarm', warmLoaders),
    Cold: createEngineComponent<ButtonProps>('CwCold', coldLoaders),
  };
  await serverHtml(<client.Warm engine="modern" label="prewarm" />);
  await settle(20);
  phase = 'client';
  const { recoverable } = await hydrate(container, <App {...client} />);
  await settle(20);

  for (const id of ['app', 'ds-warm', 'ds-cold']) await click(byTestId(container, id));
  const whileGated = { ...counts };
  await act(async () => gate.resolve());
  await settle(50);
  return { recoverable, whileGated };
}

describe('click fate in a region with a cold engine chunk', () => {
  it('C-1 baseline detector: without a mitigation the region drops every click, and nothing replays', async () => {
    const { recoverable, whileGated, afterResolve } = await regionClicks('none');

    expect(whileGated).toEqual({ app: 0, appNative: 0, warm: 0, cold: 0, submits: 2 });
    expect(afterResolve).toEqual(whileGated);
    expect(recoverable).toEqual([]);
  });

  it('C-1W with the rendered-families warm the region hydrates and handles its clicks', async () => {
    RENDERED_FAMILIES_CHANNEL.open = true;
    try {
      const { recoverable, whileGated } = await warmedRegionClicks();

      expect(whileGated).toMatchObject({ app: 1, appNative: 1, warm: 1 });
      expect(recoverable).toEqual([]);
    } finally {
      RENDERED_FAMILIES_CHANNEL.open = false;
    }
  });

  it('C-2 a cold family in its own app <Suspense> leaves its siblings handled', async () => {
    const { recoverable, whileGated } = await regionClicks('cold-only');

    expect(whileGated).toMatchObject({ app: 1, appNative: 1, warm: 1, cold: 0 });
    expect(recoverable).toEqual([]);
  });
});
