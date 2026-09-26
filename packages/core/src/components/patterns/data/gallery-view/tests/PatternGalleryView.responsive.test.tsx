import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { PatternGalleryView } from '../presentation/gallery';

interface Photo {
  id: string;
  image: string;
  title: string;
}

const data: Photo[] = [
  { id: 'a', image: 'https://example.test/a.png', title: 'Photo A' },
  { id: 'b', image: 'https://example.test/b.png', title: 'Photo B' },
];

async function root(container: HTMLElement): Promise<HTMLElement> {
  return (await waitFor(() => {
    const node = container.querySelector('.ds-pattern-gallery-view[data-part="root"]');
    if (!node) throw new Error('gallery root not found');
    return node;
  })) as HTMLElement;
}

describe('PatternGalleryView responsive + style pass-through', () => {
  it('lays out as the auto-fit Grid at the sm tile preset and ignores the legacy column model', async () => {
    const { container } = renderWithEngine(
      <PatternGalleryView<Photo>
        data={data}
        imageField="image"
        captionField="title"
        rowKey="id"
        columns={4}
        minColumnWidth={320}
      />,
      'modern',
    );

    // The root IS the Grid primitive in its auto-fit mode: the track model and
    // its min(100%, ...) overflow floor are the Grid skin's recipe.
    const grid = await root(container);
    expect(grid.getAttribute('data-component')).toBe('grid');
    expect(grid.getAttribute('data-auto-fit')).toBe('true');
    expect(grid.getAttribute('data-min-item')).toBe('sm');
    expect(grid.style.gridTemplateColumns).toBe('');
    expect(grid.getAttribute('style') ?? '').not.toMatch(/320|minmax|auto-fill/);
  });

  it('leaves every family channel unstamped when the caller states nothing', async () => {
    const { container } = renderWithEngine(
      <PatternGalleryView<Photo> data={data} imageField="image" rowKey="id" />,
      'modern',
    );

    // Negative control for the ratio case below: an unconditional stamp would
    // shadow the skin's resting declaration on every render.
    const grid = await root(container);
    expect(grid.style.getPropertyValue('--ds-gallery-view-columns')).toBe('');
    expect(grid.style.getPropertyValue('--ds-gallery-view-gap')).toBe('');
    expect(grid.style.getPropertyValue('--ds-gallery-view-aspect-ratio')).toBe('');
    expect(grid.getAttribute('data-gap-preset')).toBe('md');
  });

  it('hands a stated gap to the Grid and stamps the media ratio it owns', async () => {
    const { container } = renderWithEngine(
      <PatternGalleryView<Photo>
        data={data}
        imageField="image"
        rowKey="id"
        gap={24}
        aspectRatio="16/9"
      />,
      'modern',
    );

    const grid = await root(container);
    expect(grid.style.gap).toBe('24px');
    expect(grid.style.getPropertyValue('--ds-gallery-view-aspect-ratio')).toBe('16/9');

    const length = await root(
      renderWithEngine(<PatternGalleryView<Photo> data={data} imageField="image" rowKey="id" gap="1.5rem" />, 'modern')
        .container,
    );
    expect(length.style.getPropertyValue('--ds-grid-gap')).toBe('1.5rem');
  });

  it('carries a stated minItem and templateColumns to the Grid, and stamps the resolved posture', async () => {
    const grid = await root(
      renderWithEngine(
        <PatternGalleryView<Photo> data={data} imageField="image" rowKey="id" minItem="lg" templateColumns="1fr 2fr" />,
        'modern',
      ).container,
    );
    expect(grid.getAttribute('data-min-item')).toBe('lg');
    expect(grid.style.gridTemplateColumns).toBe('1fr 2fr');
    expect(grid.getAttribute('data-posture')).toMatch(/^(phone|tablet|desktop)( (compact|regular|expanded))?$/);
  });

  it('keeps the caller style once data arrives, not only while loading and empty', async () => {
    const loadingView = renderWithEngine(
      <PatternGalleryView<Photo>
        data={[]}
        imageField="image"
        rowKey="id"
        loading
        style={{ maxWidth: '640px' }}
      />,
      'modern',
    );
    expect((await root(loadingView.container)).style.maxWidth).toBe('640px');

    const loadedView = renderWithEngine(
      <PatternGalleryView<Photo>
        data={data}
        imageField="image"
        captionField="title"
        rowKey="id"
        style={{ maxWidth: '640px' }}
      />,
      'modern',
    );
    const loaded = (await root(loadedView.container));
    expect(loaded.getAttribute('data-empty')).toBe('false');
    // The loaded grid used to build its style from scratch and drop `style`,
    // so the box jumped width the instant data replaced the skeleton.
    expect(loaded.style.maxWidth).toBe('640px');
  });
});
