import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ModerationItem } from '../contracts';
import ModernModerationGallery from '../engines/modern';

const ITEMS: ModerationItem[] = [
  {
    id: '1',
    thumbnailUrl: '/does-not-exist.jpg',
    type: 'image',
    status: 'pending',
    uploadedBy: 'user42',
    uploadedAt: new Date().toISOString(),
  },
];

describe('Modern ModerationGallery — dead thumbnail', () => {
  it('composes the governed Image frame instead of a raw <img>', () => {
    const { container } = render(<ModernModerationGallery items={ITEMS} />);

    const frame = container.querySelector('[data-part="card-thumbnail"] .rottay-image');
    expect(frame).not.toBeNull();
    expect(container.querySelector('[data-part="img"]')).not.toBeNull();
  });

  it('shows the governed fallback when the media fails to load', async () => {
    const { container } = render(<ModernModerationGallery items={ITEMS} />);

    // Before: the raw <img> surfaced the browser's broken-image glyph — the
    // card had no governed error posture at all.
    expect(container.querySelector('[data-part="card-thumbnail"] [data-part="fallback"]')).toBeNull();

    const img = container.querySelector('[data-part="img"]');
    expect(img).not.toBeNull();
    fireEvent.error(img as Element);

    await waitFor(() => {
      expect(container.querySelector('[data-part="card-thumbnail"] [data-part="fallback"]')).not.toBeNull();
    });
  });
});
