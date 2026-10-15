/**
 * @fileoverview Server render, hydration and observation helpers for the
 * factory hydration-boundary laws.
 *
 * The server pass runs with no `window`, as a server realm renders, so a
 * factory that decides its boundary from the environment is measured the way
 * production would run it.
 *
 * @module Tests/Architecture/factory-hydration-boundary/harness
 */

import { act, type ReactNode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToReadableStream } from 'react-dom/server.browser';
import { afterEach, vi } from 'vitest';

const roots: Root[] = [];
const containers: HTMLElement[] = [];

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  for (const container of containers.splice(0)) container.remove();
});

export async function serverHtml(node: ReactNode): Promise<string> {
  vi.stubGlobal('window', undefined);
  try {
    const stream = await renderToReadableStream(node);
    await stream.allReady;
    return await new Response(stream).text();
  } finally {
    vi.unstubAllGlobals();
  }
}

/** Server-renders twice: the first pass resolves the server lazies, the second is the warm response. */
export async function warmServerHtml(node: () => ReactNode): Promise<string> {
  await serverHtml(node());
  return serverHtml(node());
}

export function mountHtml(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  containers.push(container);
  return container;
}

export interface Hydration {
  root: Root;
  recoverable: string[];
}

export async function hydrate(container: HTMLElement, node: ReactNode): Promise<Hydration> {
  const recoverable: string[] = [];
  let root!: Root;
  await act(async () => {
    root = hydrateRoot(container, node, {
      onRecoverableError: (error) => recoverable.push(String((error as Error)?.message ?? error)),
    });
  });
  roots.push(root);
  return { root, recoverable };
}

export function settle(ms = 30): Promise<void> {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

export function byTestId(container: ParentNode, id: string): HTMLElement | null {
  return container.querySelector(`[data-testid="${id}"]`);
}

/** Present and not hidden by a Suspense fallback reveal. */
export function visible(container: ParentNode, id: string): boolean {
  const element = byTestId(container, id);
  return !!element && element.style.display !== 'none';
}

export function hydrated(element: Element | null): boolean {
  return !!element && Object.keys(element).some((key) => key.startsWith('__reactFiber$'));
}

/** Records every listed fallback that ever appears in `container`. */
export function watchFallbacks(container: HTMLElement, ids: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const record = (node: Node) => {
    if (!(node instanceof Element)) return;
    for (const id of ids) if (node.matches(`[data-testid="${id}"]`) || byTestId(node, id)) seen.add(id);
  };
  record(container);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) mutation.addedNodes.forEach(record);
  }).observe(container, { subtree: true, childList: true });
  return seen;
}

export function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

export async function click(element: HTMLElement | null): Promise<MouseEvent> {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  await act(async () => {
    element?.dispatchEvent(event);
  });
  return event;
}
