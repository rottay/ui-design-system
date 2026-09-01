import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ModerationItem } from '../contracts';
import ModernModerationGallery from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/moderation-gallery/index.css',
  ),
  'utf8',
);

const ITEMS: ModerationItem[] = [
  {
    id: '1',
    thumbnailUrl: 'https://example.test/a.jpg',
    type: 'image',
    status: 'pending',
    uploadedBy: 'Ana',
    uploadedAt: '2026-03-18T10:00:00.000Z',
  },
];

describe('Modern ModerationGallery skin — the media fit is not faked on the frame', () => {
  it('retires object-fit from the thumbnail wrapper', () => {
    // `[data-part='card-thumbnail']` is a <span>. `object-fit` only applies to
    // replaced elements, so the declaration could never affect a pixel.
    const frame = SKIN.slice(SKIN.indexOf("[data-part='card-thumbnail'] {"));
    expect(frame.slice(0, frame.indexOf('}'))).not.toContain('object-fit');
  });

  it('keeps the real fit on the composed Image primitive contract', () => {
    const { container } = render(<ModernModerationGallery items={ITEMS} />);

    const wrapper = container.querySelector('[data-part="card-thumbnail"]');
    expect(wrapper?.tagName).toBe('SPAN');
    expect(container.querySelector('[data-object-fit="cover"]')).not.toBeNull();
  });
});
