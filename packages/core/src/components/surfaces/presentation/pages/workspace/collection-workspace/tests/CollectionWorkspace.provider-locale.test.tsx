import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import { CollectionWorkspaceSurface } from '../index';
import { renderSurface } from '../../../../../foundation/common/test-utils';

type Row = { id: string; name: string };

const DESKTOP: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

async function rangeLabel(locale: 'en' | 'es') {
  const view = renderSurface(
    <I18nProvider locale={locale}>
      <CollectionWorkspaceSurface<Row>
        title="Records"
        data={[{ id: '1', name: 'Alpha' }]}
        columns={[{ key: 'name', dataIndex: 'name', title: 'Name' } as never]}
        rowKey="id"
        presentation={{ enhancedInteractions: true }}
        behavior={{
          pagination: { current: 5, pageSize: 1000, total: 12345, pageSizeOptions: [500, 1000], onChange: vi.fn() },
        }}
      />
    </I18nProvider>,
    { engine: 'modern', responsiveContext: DESKTOP },
  );
  await waitFor(() => {
    expect(view.container.querySelector('[data-part="page-size-control"]')).not.toBeNull();
  });
  const text = view.container.querySelector('[data-part="page-size-control"]')?.textContent ?? '';
  view.unmount();
  return text;
}

describe('CollectionWorkspaceSurface — provider locale', () => {
  it('formats the paged range in the provider locale', async () => {
    const es = await rangeLabel('es');
    expect(es).toContain('4001-5000');
    expect(es).toContain('12.345');

    const en = await rangeLabel('en');
    expect(en).toContain('4,001-5,000');
    expect(en).toContain('12,345');
  });
});
