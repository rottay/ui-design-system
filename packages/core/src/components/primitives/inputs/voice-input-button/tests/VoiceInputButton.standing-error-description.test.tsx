/**
 * The live announcement is a one-shot. Anyone reaching the button after it
 * fired needs the failure as a standing description on the control itself.
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, screen } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import { VoiceInputButton } from '..';

class FakeSpeechRecognition {
  static lastInstance: FakeSpeechRecognition | null = null;
  continuous = false;
  interimResults = false;
  lang = 'en-US';
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

const describedNodes = (button: HTMLElement) =>
  (button.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id));

describe('VoiceInputButton standing error description (modern)', () => {
  beforeEach(() => {
    FakeSpeechRecognition.lastInstance = null;
    w.SpeechRecognition = FakeSpeechRecognition;
  });

  afterEach(() => {
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    cleanup();
  });

  it('carries no description while idle', async () => {
    renderWithEngine(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />, 'modern');
    const button = await screen.findByRole('button', { name: 'Start voice input' });

    expect(describedNodes(button)).toHaveLength(0);
  });

  it('points the button at the failure text once recognition errors', async () => {
    renderWithEngine(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />, 'modern');
    const button = await screen.findByRole('button', { name: 'Start voice input' });

    await act(async () => {
      FakeSpeechRecognition.lastInstance?.onerror?.({ error: 'no-speech' });
    });

    const nodes = describedNodes(button);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toHaveTextContent('No speech detected. Try again or type your query.');
  });

  it('resolves the description to the same node the live region announces', async () => {
    renderWithEngine(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />, 'modern');
    const button = await screen.findByRole('button', { name: 'Start voice input' });

    await act(async () => {
      FakeSpeechRecognition.lastInstance?.onerror?.({ error: 'not-allowed' });
    });

    expect(describedNodes(button)[0]).toBe(screen.getByRole('status'));
  });

  it('gives two mounted buttons distinct description targets', async () => {
    renderWithEngine(
      <>
        <VoiceInputButton lang="en-US" onTranscript={vi.fn()} />
        <VoiceInputButton lang="en-US" onTranscript={vi.fn()} />
      </>,
      'modern'
    );
    await screen.findAllByRole('button');

    const regions = screen.getAllByRole('status');
    expect(regions).toHaveLength(2);
    expect(new Set(regions.map((r) => r.id)).size).toBe(2);
  });
});
