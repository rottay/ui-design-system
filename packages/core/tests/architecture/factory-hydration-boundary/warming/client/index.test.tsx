/**
 * @fileoverview The client warm (W-5, W-6, W-7, W-9).
 *
 * A warm is the family's own public `loader()` call, made only for a family
 * the document lists and the client registered, at most once, and never shared
 * with the lazy. A list parsed after module evaluation warms on
 * `DOMContentLoaded`; a document without a list warms nothing.
 */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RENDERED_FAMILIES_CHANNEL } from '@/infrastructure/runtime/engines/composition/react/rendered-families';
import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';

import { byTestId, mountHtml, settle } from '../../harness';

type LabelProps = { label: string };
const Label = ({ label }: LabelProps) => <span data-testid={label}>{label}</span>;

function loader() {
  return vi.fn(async () => ({ default: Label }));
}

function list(families: string[]): HTMLElement {
  return mountHtml(`<script type="application/json" data-ds-rendered-families>${JSON.stringify(families)}</script>`);
}

beforeEach(() => {
  RENDERED_FAMILIES_CHANNEL.open = true;
});

afterEach(() => {
  RENDERED_FAMILIES_CHANNEL.open = false;
  vi.restoreAllMocks();
});

describe('client warm', () => {
  it('W-5 warms only families the document lists and the client registered', async () => {
    list(['W5Listed@modern', 'W5Unregistered@modern']);
    const listed = { modern: loader(), classic: loader() };
    const unlisted = loader();
    createEngineComponent<LabelProps>('W5Listed', { ...listed, rustic: null });
    createEngineComponent<LabelProps>('W5Unlisted', { classic: null, rustic: null, modern: unlisted });
    await settle();

    expect(listed.modern).toHaveBeenCalledTimes(1);
    expect(listed.classic).not.toHaveBeenCalled();
    expect(unlisted).not.toHaveBeenCalled();
  });

  it('W-6 a rejected warm does not reject the lazy, which loads and renders on its own call', async () => {
    list(['W6Renders@modern']);
    let calls = 0;
    const modern = vi.fn(async () => {
      calls += 1;
      if (calls === 1) throw new Error('chunk load failed');
      return { default: Label };
    });
    const Fam = createEngineComponent<LabelProps>('W6Renders', { classic: null, rustic: null, modern });
    await settle();
    expect(modern).toHaveBeenCalledTimes(1);

    const container = mountHtml('');
    const root = createRoot(container);
    await act(async () => root.render(<Fam engine="modern" label="w6-renders" />));
    await settle();

    expect(modern).toHaveBeenCalledTimes(2);
    expect(byTestId(container, 'w6-renders')?.textContent).toBe('w6-renders');
    act(() => root.unmount());
  });

  it('W-7 a list parsed after module evaluation warms on DOMContentLoaded, once per family', async () => {
    const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const early = loader();
    const late = loader();
    createEngineComponent<LabelProps>('W7Early', { classic: null, rustic: null, modern: early });
    list(['W7Early@modern', 'W7Late@modern']);
    createEngineComponent<LabelProps>('W7Late', { classic: null, rustic: null, modern: late });
    expect(early).not.toHaveBeenCalled();
    expect(late).toHaveBeenCalledTimes(1);

    readyState.mockReturnValue('interactive');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(early).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('DOMContentLoaded'));
    createEngineComponent<LabelProps>('W7Early', { classic: null, rustic: null, modern: early });
    await settle();

    expect(early).toHaveBeenCalledTimes(1);
    expect(late).toHaveBeenCalledTimes(1);
  });

  it('W-9 a document without a list warms nothing; the lazy loads on render', async () => {
    const modern = loader();
    const Fam = createEngineComponent<LabelProps>('W9NoList', { classic: null, rustic: null, modern });
    await settle();
    expect(modern).not.toHaveBeenCalled();

    const container = mountHtml('');
    const root = createRoot(container);
    await act(async () => root.render(<Fam engine="modern" label="w9" />));
    await settle();

    expect(modern).toHaveBeenCalledTimes(1);
    expect(byTestId(container, 'w9')).not.toBeNull();
    act(() => root.unmount());
  });

  it('the closed channel warms nothing even with a list', async () => {
    RENDERED_FAMILIES_CHANNEL.open = false;
    list(['WClosed@modern']);
    const modern = loader();
    createEngineComponent<LabelProps>('WClosed', { classic: null, rustic: null, modern });
    await settle();

    expect(modern).not.toHaveBeenCalled();
  });
});
