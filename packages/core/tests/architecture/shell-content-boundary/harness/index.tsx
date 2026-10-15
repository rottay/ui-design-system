/**
 * @fileoverview Server render, census and fixture helpers for the shell
 * content-boundary laws.
 *
 * The server pass runs with no `window`, as a server realm renders. A render
 * that fails its shell is reported as `shell-error`: that is the full-page
 * failure (HTTP 500) the content boundaries exist to prevent.
 *
 * @module Tests/Architecture/shell-content-boundary/harness
 */

import { act, type ReactNode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToReadableStream } from 'react-dom/server.browser';
import { afterEach, vi } from 'vitest';

import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';

export type ServerResult =
  | { status: 'complete'; html: string; errors: string[] }
  | { status: 'shell-error'; error: string };

export async function serverRender(node: ReactNode, options: { progressiveChunkSize?: number } = {}): Promise<ServerResult> {
  const errors: string[] = [];
  vi.stubGlobal('window', undefined);
  try {
    const stream = await renderToReadableStream(node, {
      ...options,
      onError: (error) => {
        errors.push(String((error as Error)?.message ?? error));
      },
    });
    await stream.allReady;
    return { status: 'complete', html: await new Response(stream).text(), errors };
  } catch (error) {
    return { status: 'shell-error', error: String((error as Error)?.message ?? error) };
  } finally {
    vi.unstubAllGlobals();
  }
}

/** The first pass resolves every server lazy; the second is the warm response. */
export async function warmServerRender(node: () => ReactNode): Promise<ServerResult> {
  await serverRender(node());
  return serverRender(node());
}

export function completeHtml(result: ServerResult): string {
  if (result.status !== 'complete') throw new Error(`expected a complete render, got a shell error: ${result.error}`);
  return result.html;
}

const count = (html: string, token: string) => html.split(token).length - 1;

/** `<!--$-->` inline, `<!--$?-->` outlined or pending, `<!--$!-->` client-rendered. */
export function boundaryCensus(html: string) {
  return {
    inline: count(html, '<!--$-->'),
    outlined: count(html, '<!--$?-->'),
    clientRendered: count(html, '<!--$!-->'),
    revealScript: /\$R[CR]\b/.test(html),
  };
}

/** The 4b admission rule on one response: no boundary outlined and no reveal script. */
export function admitted(html: string): boolean {
  const census = boundaryCensus(html);
  return census.outlined === 0 && !census.revealScript;
}

/** A Modern family that throws during a server render and renders on the client. */
export function serverThrowingFamily(name: string) {
  const Throws = () => {
    if (typeof window === 'undefined') throw new Error(`${name} failed on the server`);
    return <span data-testid={name}>client rendered</span>;
  };
  return createEngineComponent<Record<string, never>>(name, {
    classic: null,
    rustic: null,
    modern: async () => ({ default: Throws }),
  });
}

/** A Modern family that renders `text` in both realms. */
export function textFamily(name: string) {
  const Text = ({ text }: { text: string }) => <span data-testid={name}>{text}</span>;
  return createEngineComponent<{ text: string }>(name, {
    classic: null,
    rustic: null,
    modern: async () => ({ default: Text }),
  });
}

const roots: Root[] = [];
const containers: HTMLElement[] = [];

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  for (const container of containers.splice(0)) container.remove();
});

/** The body markup of a full-document response, mounted as a server would serve it. */
export function mountHtml(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  containers.push(container);
  return container;
}

export async function hydrate(container: HTMLElement, node: ReactNode): Promise<string[]> {
  const recoverable: string[] = [];
  await act(async () => {
    roots.push(
      hydrateRoot(container, node, {
        onRecoverableError: (error) => recoverable.push(String((error as Error)?.message ?? error)),
      }),
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  return recoverable;
}
