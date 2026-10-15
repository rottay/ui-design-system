/**
 * @fileoverview The rendered-families list a server response carries
 * (W-1, W-2, W-3, W-4, W-8).
 *
 * One list per render and per document, emitted by the outermost provider
 * after its children; the client renders the same text, custom packs are never
 * listed, and a family first rendered inside a boundary that suspends on the
 * server is a declared miss.
 */
import { Suspense, type ReactNode } from 'react';
import { renderToReadableStream } from 'react-dom/server.browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap/facade/react/provider';
import { RENDERED_FAMILIES_CHANNEL } from '@/infrastructure/runtime/engines/composition/react/rendered-families';
import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import {
  clearCustomRegistry,
  registerCustomComponent,
} from '@/infrastructure/runtime/engines/selection/customization/component-registry';

import { deferred, hydrate, mountHtml, serverHtml, settle, warmServerHtml } from '../../harness';

type LabelProps = { label: string };
const Label = ({ label }: LabelProps) => <span data-testid={label}>{label}</span>;
const modernOnly = { classic: null, rustic: null, modern: async () => ({ default: Label }) };

function tenant(slug: string): TenantConfig {
  return {
    slug,
    name: slug,
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: slug },
  };
}

function Ds({ slug, engine, children }: { slug: string; engine?: 'modern' | 'rustic'; children: ReactNode }) {
  return (
    <DesignSystemProvider tenantConfig={tenant(slug)} forceEngine={engine} skipCssLoading>
      {children}
    </DesignSystemProvider>
  );
}

function lists(html: string): string[][] {
  const host = document.createElement('div');
  host.innerHTML = html;
  return [...host.querySelectorAll('script[data-ds-rendered-families]')].map((node) =>
    JSON.parse(node.textContent ?? 'null')
  );
}

beforeEach(() => {
  RENDERED_FAMILIES_CHANNEL.open = true;
});

afterEach(() => {
  RENDERED_FAMILIES_CHANNEL.open = false;
  clearCustomRegistry();
  vi.restoreAllMocks();
});

describe('rendered-families list', () => {
  it('W-1 two concurrent server renders carry disjoint lists', async () => {
    const A = createEngineComponent<LabelProps>('W1RenderA', modernOnly);
    const B = createEngineComponent<LabelProps>('W1RenderB', modernOnly);
    const app = (slug: string, Fam: typeof A) => (
      <Ds slug={slug} engine="modern">
        <Fam label={slug} />
      </Ds>
    );
    await serverHtml(app('w1-a', A));
    await serverHtml(app('w1-b', B));

    vi.stubGlobal('window', undefined);
    try {
      const streams = await Promise.all([
        renderToReadableStream(app('w1-a', A)),
        renderToReadableStream(app('w1-b', B)),
      ]);
      const [a, b] = await Promise.all(streams.map((stream) => new Response(stream).text()));
      expect(lists(a)).toEqual([['W1RenderA@modern']]);
      expect(lists(b)).toEqual([['W1RenderB@modern']]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('W-2 nested providers on different tenants and engines emit one list, the union, with no mismatch', async () => {
    const both = { classic: null, rustic: async () => ({ default: Label }), modern: async () => ({ default: Label }) };
    const Outer = createEngineComponent<LabelProps>('W2Outer', both);
    const Inner = createEngineComponent<LabelProps>('W2Inner', both);
    const App = () => (
      <Ds slug="w2-outer" engine="modern">
        <Outer label="outer" />
        <Ds slug="w2-inner" engine="rustic">
          <Inner label="inner" />
        </Ds>
      </Ds>
    );
    const html = await warmServerHtml(() => <App />);
    expect(lists(html)).toEqual([['W2Inner@rustic', 'W2Outer@modern']]);

    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const container = mountHtml(html);
    const node = container.querySelector('script[data-ds-rendered-families]');
    const { recoverable } = await hydrate(container, <App />);
    await settle();

    expect(recoverable).toEqual([]);
    expect(errors.mock.calls.map(String).filter((call) => /hydrat|match/i.test(call))).toEqual([]);
    expect(container.querySelectorAll('script[data-ds-rendered-families]')).toHaveLength(1);
    expect(container.querySelector('script[data-ds-rendered-families]')).toBe(node);
  });

  it('W-3 the client renders the server text, so the list round-trips at hydration', async () => {
    const Fam = createEngineComponent<LabelProps>('W3RoundTrip', modernOnly);
    const App = () => (
      <Ds slug="w3" engine="modern">
        <Fam label="w3" />
      </Ds>
    );
    const html = await warmServerHtml(() => <App />);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const container = mountHtml(html);
    const node = container.querySelector('script[data-ds-rendered-families]');
    const text = node?.textContent;
    const { recoverable } = await hydrate(container, <App />);
    await settle();

    expect(text).toBe('["W3RoundTrip@modern"]');
    expect(recoverable).toEqual([]);
    expect(errors.mock.calls.map(String).filter((call) => /hydrat|match/i.test(call))).toEqual([]);
    expect(container.querySelector('script[data-ds-rendered-families]')).toBe(node);
    expect(node?.textContent).toBe(text);
  });

  it('W-4 a custom-pack family is never listed', async () => {
    registerCustomComponent('W4Custom', Label);
    const Custom = createEngineComponent<LabelProps>('W4Custom', modernOnly);
    const Modern = createEngineComponent<LabelProps>('W4Modern', modernOnly);
    const html = await warmServerHtml(() => (
      <Ds slug="w4" engine="modern">
        <Custom engine="custom" label="custom" />
        <Modern label="modern" />
      </Ds>
    ));

    expect(html).toContain('data-testid="custom"');
    expect(lists(html)).toEqual([['W4Modern@modern']]);
  });

  it('W-8 a family first rendered inside a server-suspended boundary is a declared miss', async () => {
    const Early = createEngineComponent<LabelProps>('W8Early', modernOnly);
    const Late = createEngineComponent<LabelProps>('W8Late', modernOnly);
    await serverHtml(
      <Ds slug="w8" engine="modern">
        <Early label="early" />
        <Late label="late" />
      </Ds>
    );
    const data = deferred<void>();
    let ready = false;
    const Data = ({ children }: { children: ReactNode }): ReactNode => {
      if (!ready) throw data.promise;
      return children;
    };
    setTimeout(() => {
      ready = true;
      data.resolve();
    }, 20);
    const html = await serverHtml(
      <Ds slug="w8" engine="modern">
        <Early label="early" />
        <Suspense fallback={<i>loading</i>}>
          <Data>
            <Late label="late" />
          </Data>
        </Suspense>
      </Ds>
    );

    expect(html).toContain('data-testid="late"');
    expect(lists(html)).toEqual([['W8Early@modern']]);
  });
});
