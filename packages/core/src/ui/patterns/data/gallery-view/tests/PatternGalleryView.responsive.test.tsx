import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
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
  it('floors the auto track at 100% of the container so it cannot overflow a narrow parent', async () => {
    const { container } = renderWithEngine(
      <PatternGalleryView<Photo>
        data={data}
        imageField="image"
        captionField="title"
        rowKey="id"
        minColumnWidth={320}
      />,
      'modern',
    );

    const columns = (await root(container)).style.gridTemplateColumns;
    // Without the min(..., 100%) floor the track resolves to a bare 320px
    // minimum and overflows any container narrower than that.
    expect(columns).toContain('min(320px, 100%)');
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
