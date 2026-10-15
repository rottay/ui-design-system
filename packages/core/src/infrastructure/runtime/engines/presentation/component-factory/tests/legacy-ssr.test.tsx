/**
 * Legacy synchronous SSR of an engine component. A family whose lazy
 * implementation has not resolved cannot render under `renderToStaticMarkup`:
 * it throws React's sync-input error instead of emitting an empty fallback.
 * Once resolved (the supported path, `renderResolvedStaticMarkup`), it renders.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { renderResolvedStaticMarkup } from '@tests/support/resolved-markup';
import { createEngineComponent } from '..';

const Impl = ({ label }: { label: string }) => <span data-testid="resolved">{label}</span>;

describe('legacy synchronous SSR of an unresolved engine component', () => {
  it('throws while cold and renders once resolved', async () => {
    const Cold = createEngineComponent<{ label: string }>('LegacySsrCold', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Impl }),
    });

    expect(() => renderToStaticMarkup(<Cold engine="modern" label="x" />)).toThrow(
      /suspended while responding to synchronous input/
    );
    expect(await renderResolvedStaticMarkup(<Cold engine="modern" label="x" />)).toContain('data-testid="resolved"');
    expect(renderToStaticMarkup(<Cold engine="modern" label="x" />)).toBe('<span data-testid="resolved">x</span>');
  });
});
