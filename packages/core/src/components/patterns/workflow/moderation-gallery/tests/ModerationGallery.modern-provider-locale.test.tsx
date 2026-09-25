import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { ModerationItem } from '../contracts';
import ModernModerationGallery from '../engines/modern';

const UPLOADED_AT = '2026-03-14T15:30:00.000Z';

const ITEM: ModerationItem = {
  id: 'm1',
  thumbnailUrl: 'https://example.test/a.png',
  type: 'image',
  status: 'pending',
  engagement: 12345,
  uploadedBy: 'Ana',
  uploadedAt: UPLOADED_AT,
};

function mount(locale: 'en' | 'es') {
  const { container, unmount } = render(
    <I18nProvider locale={locale}>
      <ModernModerationGallery items={[ITEM]} />
    </I18nProvider>,
  );
  const read = (part: string) => container.querySelector(`[data-part="${part}"]`)?.textContent ?? '';
  const values = { engagement: read('card-engagement'), uploaded: read('card-uploaded-at') };
  unmount();
  return values;
}

describe('Modern ModerationGallery — provider locale', () => {
  it('formats the engagement count and an older upload date in the provider locale', () => {
    const shape: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const at = new Date(UPLOADED_AT);

    const es = mount('es');
    expect(es.engagement).toContain('12.345');
    expect(es.uploaded).toBe(new Intl.DateTimeFormat('es-ES', shape).format(at));

    const en = mount('en');
    expect(en.engagement).toContain('12,345');
    expect(en.uploaded).toBe(new Intl.DateTimeFormat('en-US', shape).format(at));
  });
});
