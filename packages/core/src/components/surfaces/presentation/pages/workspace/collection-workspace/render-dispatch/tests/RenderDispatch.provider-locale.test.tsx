import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { CollectionRenderDispatch } from '..';
import { renderSurface } from '../../../../../../foundation/common/test-utils';

const JOINED = new Date(2026, 2, 14);
const rows = [{ id: '1', joined: JOINED }];
const columns = [{ key: 'joined', dataIndex: 'joined', title: 'Joined' }];

async function mount(locale: 'en' | 'es', loadMode: 'paged' | 'incremental') {
  const view = renderSurface(
    <I18nProvider locale={locale}>
      <CollectionRenderDispatch
        viewMode="cards"
        data={rows}
        columns={columns as any}
        rowKey="id"
        pagination={{ current: 5, pageSize: 1000, total: 12345, loadMode, onChange: () => undefined }}
      />
    </I18nProvider>,
    { engine: 'modern' },
  );
  await waitFor(() => expect(view.container.querySelector('[data-part="card-item"]')).not.toBeNull());
  const text = view.container.textContent ?? '';
  view.unmount();
  return text;
}

describe('CollectionRenderDispatch — provider locale', () => {
  it('formats a raw Date cell and the paged range in the provider locale', async () => {
    const es = await mount('es', 'paged');
    expect(es).toContain(new Intl.DateTimeFormat('es-ES').format(JOINED));
    expect(es).toContain('4001-5000');
    expect(es).toContain('12.345');

    const en = await mount('en', 'paged');
    expect(en).toContain(new Intl.DateTimeFormat('en-US').format(JOINED));
    expect(en).toContain('4,001');
    expect(en).toContain('12,345');
  });

  it('formats the incremental footer total in the provider locale', async () => {
    expect(await mount('es', 'incremental')).toContain('12.345');
    expect(await mount('en', 'incremental')).toContain('12,345');
  });
});
