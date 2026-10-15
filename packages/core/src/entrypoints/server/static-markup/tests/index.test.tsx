import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import { renderResolvedStaticMarkup } from '..';

const Impl = ({ label }: { label: string }) => <span data-testid="resolved">{label}</span>;

describe('renderResolvedStaticMarkup', () => {
  it('renders a cold engine family with its resolved implementation', async () => {
    const Cold = createEngineComponent<{ label: string }>('StaticMarkupCold', {
      classic: null,
      rustic: null,
      modern: async () => ({ default: Impl }),
    });

    const html = await renderResolvedStaticMarkup(<Cold engine="modern" label="resolved once" />);

    expect(html).toBe('<span data-testid="resolved">resolved once</span>');
    expect(html).toBe(renderToStaticMarkup(<Cold engine="modern" label="resolved once" />));
  });

  it('is not a data-suspense renderer: an uncached promise suspends again and throws', async () => {
    // Suspends on the first render of each pass, like a fetch that is not cached across renders.
    let renders = 0;
    const Data = () => {
      renders += 1;
      if (renders % 2 === 1) throw new Promise<void>((resolve) => setTimeout(resolve, 0));
      return <i>data</i>;
    };

    await expect(renderResolvedStaticMarkup(<Data />)).rejects.toThrow(
      /suspended while responding to synchronous input/
    );
  });
});
