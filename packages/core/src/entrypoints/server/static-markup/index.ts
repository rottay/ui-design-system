/**
 * Resolved static markup from @rottay/design-system.
 *
 * Import as: import { renderResolvedStaticMarkup } from '@rottay/design-system/server/static-markup';
 *
 * Engine components load their implementation through `React.lazy`. A cold
 * lazy cannot render under synchronous `renderToStaticMarkup`: React throws
 * "suspended while responding to synchronous input". This helper is the
 * supported legacy-SSR path. It runs on the server (or a test realm) only and
 * is published on its own subpath so `./server` stays free of `react-dom`.
 */

import { version, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prerender } from 'react-dom/static';

/**
 * Renders `node` to static HTML after every `React.lazy` payload it reaches
 * has resolved.
 *
 * Two passes: React's public `prerender` waits for every Suspense boundary, so
 * each lazy caches its resolved module; then `renderToStaticMarkup` renders the
 * same node synchronously. The output therefore equals `renderToStaticMarkup`,
 * with no Suspense markers.
 *
 * It resolves code-split payloads, which cache on the lazy object. It is NOT a
 * general data-suspense renderer: a promise that is not cached between renders
 * suspends again in the second pass and throws there.
 *
 * Requires React >= 19 (`react-dom/static`). On React 18 this module fails to
 * load: `react-dom` 18 publishes no `react-dom/static`, so Node reports
 * `ERR_PACKAGE_PATH_NOT_EXPORTED` before this function can run.
 *
 * @example
 * ```tsx
 * const html = await renderResolvedStaticMarkup(
 *   <DesignSystemProvider engine="modern"><Checkbox label="One" /></DesignSystemProvider>
 * );
 * ```
 */
export async function renderResolvedStaticMarkup(node: ReactNode): Promise<string> {
  if (Number.parseInt(version, 10) < 19) {
    throw new Error(`renderResolvedStaticMarkup requires React >= 19; this realm runs React ${version}.`);
  }
  const { prelude } = await prerender(node);
  await new Response(prelude).arrayBuffer();
  return renderToStaticMarkup(node);
}
