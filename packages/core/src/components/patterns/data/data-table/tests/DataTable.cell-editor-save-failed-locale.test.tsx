import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { InlineCellEditor } from '../engines/modern/cell-editor';

afterEach(cleanup);

function renderEditor(onSave: () => Promise<void>, locale?: SupportedLocale) {
  const editor = (
    <InlineCellEditor
      value="Ada"
      row={{ id: 1 }}
      columnKey="name"
      config={{ type: 'text' }}
      onSave={onSave}
      onCancel={() => {}}
    />
  );
  return render(
    locale ? (
      <I18nProvider locale={locale} fallbackLocale={locale}>
        {editor}
      </I18nProvider>
    ) : (
      editor
    ),
  );
}

async function rejectedSaveMessage(onSave: () => Promise<void>, locale?: SupportedLocale) {
  const { container } = renderEditor(onSave, locale);
  const input = container.querySelector('[data-part="editor-input"]') as HTMLInputElement;
  fireEvent.keyDown(input, { key: 'Enter' });
  return await waitFor(() => {
    const error = container.querySelector('[data-part="editor-error"]');
    expect(error).not.toBeNull();
    return error!.textContent;
  });
}

const rejectWithoutMessage = () => Promise.reject('offline');

describe('InlineCellEditor modern — the save-failed copy comes from the catalog', () => {
  it.each([
    ['es', 'No se pudo guardar este cambio.'],
    ['fr', "Impossible d'enregistrer cette modification."],
    ['ar', 'تعذّر حفظ هذا التغيير.'],
    ['en', 'Unable to save this change.'],
  ] as const)('words a message-less rejection in %s', async (locale, expected) => {
    expect(await rejectedSaveMessage(rejectWithoutMessage, locale)).toBe(expected);
  });

  it('keeps a thrown Error message above the catalog', async () => {
    const reject = () => Promise.reject(new Error('Row locked by another editor'));
    expect(await rejectedSaveMessage(reject, 'es')).toBe('Row locked by another editor');
  });

  it('keeps the English floor without a provider', async () => {
    expect(await rejectedSaveMessage(rejectWithoutMessage)).toBe('Unable to save this change.');
  });
});
