import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { mockMatchMedia } from '@tests/support/browser/match-media';
import ModernListToolbar from '../engines/modern';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function badgeText(locale: 'en' | 'es') {
  mockMatchMedia(1280);
  renderWithEngineContext(
    <I18nProvider locale={locale}>
      <ModernListToolbar
        title="Candidates"
        totalCount={12345}
        search=""
        onSearchChange={() => undefined}
        viewMode="list"
        onViewModeChange={() => undefined}
        density="comfortable"
        onDensityChange={() => undefined}
      />
    </I18nProvider>,
    'classic',
  );
  await screen.findByText('Candidates');
  const text = document.body.textContent ?? '';
  cleanup();
  return text;
}

describe('Modern ListToolbar — provider locale', () => {
  it('formats the total count badge in the provider locale', async () => {
    expect(await badgeText('es')).toContain('12.345');
    expect(await badgeText('en')).toContain('12,345');
  });
});
