import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render as renderBare, screen } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

import { VoiceInputButton } from '..';

class FakeSpeechRecognition {
  static lastInstance: FakeSpeechRecognition | null = null;

  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;
  onstart: ((event: Event) => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onspeechend: ((event: Event) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor() {
    FakeSpeechRecognition.lastInstance = this;
  }
  start() {}
  stop() {}
  abort() {}
}

const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'modern');

describe('VoiceInputButton default recognition language', () => {
  beforeEach(() => {
    FakeSpeechRecognition.lastInstance = null;
    w.SpeechRecognition = FakeSpeechRecognition;
  });

  afterEach(() => {
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    cleanup();
  });

  it.each([
    ['en', 'en-US'],
    ['es', 'es-ES'],
    ['fr', 'fr-FR'],
    ['pt', 'pt-BR'],
    ['ar', 'ar-EG'],
  ] as const)('derives the regional tag of provider locale %s as %s', async (locale, tag) => {
    render(
      <I18nProvider locale={locale} fallbackLocale={locale}>
        <VoiceInputButton onTranscript={vi.fn()} />
      </I18nProvider>
    );
    await screen.findByRole('button');
    expect(FakeSpeechRecognition.lastInstance?.lang).toBe(tag);
  });

  it('falls back to the bare provider locale when Intl.Locale is unavailable', async () => {
    vi.spyOn(Intl, 'Locale').mockImplementation(() => {
      throw new TypeError('Intl.Locale is not a constructor');
    });
    try {
      render(
        <I18nProvider locale="es" fallbackLocale="es">
          <VoiceInputButton onTranscript={vi.fn()} />
        </I18nProvider>
      );
      await screen.findByRole('button');
      expect(FakeSpeechRecognition.lastInstance?.lang).toBe('es');
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('keeps en-US when no i18n provider is mounted', async () => {
    renderBare(
      <EngineProvider defaultEngine="modern">
        <VoiceInputButton onTranscript={vi.fn()} />
      </EngineProvider>
    );
    await screen.findByRole('button');
    expect(FakeSpeechRecognition.lastInstance?.lang).toBe('en-US');
  });

  it('lets an explicit lang win over the provider locale', async () => {
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <VoiceInputButton lang="es-AR" onTranscript={vi.fn()} />
      </I18nProvider>
    );
    await screen.findByRole('button');
    expect(FakeSpeechRecognition.lastInstance?.lang).toBe('es-AR');
  });
});
