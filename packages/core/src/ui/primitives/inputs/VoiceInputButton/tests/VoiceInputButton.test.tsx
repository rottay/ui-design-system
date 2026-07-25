/**
 * VoiceInputButton Tests
 * Colocated with component following approved architecture
 *
 * Drives the real component + real `useVoiceInput` hook against a minimal
 * fake SpeechRecognition constructor (mirrors the FieldsBatch contract stub),
 * plus fs-level skin ownership assertions (mirrors Badge Pass-1 pattern).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { useVoiceInput } from '../../../../../infrastructure/runtime/application/automation/voice';

import { VoiceInputButton } from '..';

const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/voice-input-button.css'),
  'utf8',
);
const componentSource = readFileSync(join(__dirname, '..', 'index.tsx'), 'utf8');

type ResultHandler = ((event: unknown) => void) | null;

class FakeSpeechRecognition {
  static lastInstance: FakeSpeechRecognition | null = null;

  continuous = false;
  interimResults = false;
  lang = 'en-US';
  maxAlternatives = 1;
  started = false;
  aborted = false;
  onstart: ((event: Event) => void) | null = null;
  onresult: ResultHandler = null;
  onspeechend: ((event: Event) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor() {
    FakeSpeechRecognition.lastInstance = this;
  }
  start() {
    this.started = true;
  }
  stop() {
    this.started = false;
  }
  abort() {
    this.aborted = true;
  }
}

function finalResultEvent(transcript: string) {
  const alternative = { transcript };
  const result = {
    isFinal: true,
    length: 1,
    item: () => alternative,
    0: alternative,
  };
  return {
    resultIndex: 0,
    results: { length: 1, item: () => result, 0: result },
  };
}

const w = window as unknown as {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

describe('VoiceInputButton', () => {
  beforeEach(() => {
    FakeSpeechRecognition.lastInstance = null;
    w.SpeechRecognition = FakeSpeechRecognition;
  });

  afterEach(() => {
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    cleanup();
  });

  it('renders null when the Web Speech API is unavailable', () => {
    delete w.SpeechRecognition;
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    expect(container.querySelector('[data-part="root"]')).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('mounts once the browser reports support, with default size/variant anatomy', async () => {
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('data-size')).toBe('md');
    expect(root.getAttribute('data-variant')).toBe('ghost');
    expect(root.getAttribute('data-status')).toBe('idle');
    expect(screen.getByRole('button', { name: 'Start voice input' })).toBeInTheDocument();
  });

  it('carries no inline paint or geometry: the skin is the single owner', async () => {
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('style')).toBeNull();
    expect(componentSource).not.toContain('style={{');
  });

  it('reflects size and variant props as data attributes for the skin', async () => {
    const { container } = render(
      <VoiceInputButton lang="es-AR" onTranscript={vi.fn()} size="sm" variant="filled" />,
    );
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('data-size')).toBe('sm');
    expect(root.getAttribute('data-variant')).toBe('filled');
  });

  it('honors the ariaLabel override', async () => {
    render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} ariaLabel="Dictar mensaje" />);
    await screen.findByRole('button', { name: 'Dictar mensaje' });
  });

  it('toggles listening on click and flips the accessible name', async () => {
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    const button = await screen.findByRole('button', { name: 'Start voice input' });

    fireEvent.click(button);
    await waitFor(() => expect(FakeSpeechRecognition.lastInstance?.started).toBe(true));
    await act(async () => {
      FakeSpeechRecognition.lastInstance?.onstart?.(new Event('start'));
    });

    await screen.findByRole('button', { name: 'Stop voice input' });
    expect(container.querySelector('[data-part="root"]')!.getAttribute('data-status')).toBe(
      'listening',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Stop voice input' }));
    await waitFor(() => expect(FakeSpeechRecognition.lastInstance?.started).toBe(false));
  });

  it('commits the final transcript through onTranscript when recognition ends', async () => {
    const onTranscript = vi.fn();
    render(<VoiceInputButton lang="en-US" onTranscript={onTranscript} />);
    const button = await screen.findByRole('button', { name: 'Start voice input' });

    fireEvent.click(button);
    await waitFor(() => expect(FakeSpeechRecognition.lastInstance?.started).toBe(true));

    const recognition = FakeSpeechRecognition.lastInstance!;
    await act(async () => {
      recognition.onstart?.(new Event('start'));
    });
    await act(async () => {
      recognition.onresult?.(finalResultEvent('hola mundo'));
    });
    await act(async () => {
      recognition.onend?.(new Event('end'));
    });

    expect(onTranscript).toHaveBeenCalledTimes(1);
    expect(onTranscript).toHaveBeenCalledWith('hola mundo');
  });

  it('surfaces the blocked-permission error state', async () => {
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    await screen.findByRole('button', { name: 'Start voice input' });

    const recognition = FakeSpeechRecognition.lastInstance!;
    await act(async () => {
      recognition.onerror?.({ error: 'not-allowed' });
    });

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('data-status')).toBe('error');
    expect(root.getAttribute('data-error')).toBe('true');
    expect(root.getAttribute('data-blocked')).toBe('true');
    expect(root.getAttribute('title')).toContain('Microphone blocked');
  });
});

describe('VoiceInputButton guarded i18n channel (K4-B)', () => {
  beforeEach(() => {
    FakeSpeechRecognition.lastInstance = null;
    w.SpeechRecognition = FakeSpeechRecognition;
  });

  afterEach(() => {
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    cleanup();
  });

  it('keeps the English fallbacks when the keys are missing in locale AND fallback locale (echo guard)', async () => {
    // fr/pt JSONs do not carry the voiceInput keys yet; pinning both locales
    // to fr keeps the catalog silent so the guard must fall back.
    render(
      <I18nProvider locale="fr" fallbackLocale="fr">
        <VoiceInputButton lang="en-US" onTranscript={vi.fn()} />
      </I18nProvider>,
    );
    await screen.findByRole('button', { name: 'Start voice input' });
  });

  it('consumes components.voiceInput.start once the key lands', async () => {
    render(
      <I18nProvider
        locale="es"
        customTranslations={{ components: { voiceInput: { start: 'Iniciar dictado' } } }}
      >
        <VoiceInputButton lang="en-US" onTranscript={vi.fn()} />
      </I18nProvider>,
    );
    await screen.findByRole('button', { name: 'Iniciar dictado' });
  });

  it('consumes components.voiceInput.blocked for the blocked title', async () => {
    const { container } = render(
      <I18nProvider
        locale="es"
        customTranslations={{ components: { voiceInput: { blocked: 'Micrófono bloqueado' } } }}
      >
        <VoiceInputButton lang="en-US" onTranscript={vi.fn()} />
      </I18nProvider>,
    );
    await screen.findByRole('button');

    await act(async () => {
      FakeSpeechRecognition.lastInstance?.onerror?.({ error: 'not-allowed' });
    });

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('data-blocked')).toBe('true');
    expect(root.getAttribute('title')).toBe('Micrófono bloqueado');
  });

  it('resolves hook-owned error strings through voiceInput.error.* with English fallbacks', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <I18nProvider
        locale="es"
        customTranslations={{
          components: { voiceInput: { error: { noSpeech: 'No se detectó ninguna voz' } } },
        }}
      >
        {children}
      </I18nProvider>
    );
    const { result } = renderHook(() => useVoiceInput({ lang: 'en-US', onTranscript: vi.fn() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSupported).toBe(true));

    // customTranslations win over the (landed) es catalog for the same key.
    await act(async () => {
      FakeSpeechRecognition.lastInstance?.onerror?.({ error: 'no-speech' });
    });
    expect(result.current.errorMessage).toBe('No se detectó ninguna voz');
  });

  it('keeps the hook-owned English error fallback when the key is missing in locale AND fallback locale (echo guard)', async () => {
    // fr/pt JSONs do not carry the voiceInput keys yet; pinning both locales
    // to fr keeps the catalog silent so the guard must fall back.
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <I18nProvider locale="fr" fallbackLocale="fr">
        {children}
      </I18nProvider>
    );
    const { result } = renderHook(() => useVoiceInput({ lang: 'en-US', onTranscript: vi.fn() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSupported).toBe(true));

    await act(async () => {
      FakeSpeechRecognition.lastInstance?.onerror?.({ error: 'network' });
    });
    expect(result.current.errorMessage).toBe(
      'Voice transcription had a network issue. Try again or type your query.',
    );
  });
});

describe('VoiceInputButton skin ownership — Pass 1', () => {
  it('owns the pulse/spin keyframes and references them from state rules', () => {
    expect(skin).toMatch(/@keyframes\s+ds-voice-input-button-pulse\b/);
    expect(skin).toMatch(/@keyframes\s+ds-voice-input-button-spin\b/);
    expect(skin).toMatch(/\[data-status='listening'\][^{]*\{[^}]*ds-voice-input-button-pulse/);
    expect(skin).toMatch(/\[data-status='transcribing'\][^{]*\{[^}]*ds-voice-input-button-spin/);
  });

  it('owns the control and icon geometry per data-size, with logical sizing properties', () => {
    for (const size of ['sm', 'md'] as const) {
      expect(skin).toContain(`[data-size='${size}']`);
    }
    expect(skin).toContain('inline-size: 28px');
    expect(skin).toContain('inline-size: 34px');
    expect(skin).toContain('inline-size: 13px');
    expect(skin).toContain('inline-size: 15px');
    expect(skin).not.toMatch(/(^|[\s{;])(min-)?width\s*:/);
    expect(skin).not.toMatch(/(^|[\s{;])(min-)?height\s*:/);
  });

  it('rides the motion token instead of literal timing, and silences the decorative pulse under reduced motion', () => {
    expect(skin).toContain('var(--ds-motion-feedback)');
    // No literal timing survives in declarations (the docblock's backticked
    // mention of the old value is not a declaration).
    expect(skin).not.toMatch(/[\s{;]0\.14s/);
    expect(skin).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(skin).toContain('animation: none');
  });

  it('keeps all paint unlayered on the root (no physical directional properties, no !important)', () => {
    expect(skin).not.toContain('!important');
    expect(skin).not.toMatch(/margin-(left|right)\s*:/);
    expect(skin).not.toMatch(/padding-(left|right)\s*:/);
    expect(skin).not.toMatch(/border-(left|right)\s*:/);
    expect(skin).not.toMatch(/(^|[\s{;])(left|right)\s*:/);
  });

  it('owns a visible focus ring (Pass 2: UA outline was the only affordance)', () => {
    expect(skin).toContain(".ds-voice-input-button[data-part='root']:focus-visible");
    expect(skin).toContain('--ds-voice-input-focus-ring');
    expect(skin).toContain('color-mix(in srgb, var(--ds-color-primary) 24%, transparent)');
    expect(skin).toContain('@media (forced-colors: active)');
  });
});
