/**
 * The press stamp behind the skin's press-scale rule.
 *
 * The skin paints `scale(var(--ds-state-press-scale))` under
 * `:is([data-state~='pressed'], :active)`. The `:active` arm is the platform's
 * fallback; the stamped arm is what makes the governed press decision reach a
 * keyboard-driven press and what the tenant-difference probe can read. A twin
 * with no producer is a dead selector, so this pins the producer.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';

import { VoiceInputButton } from '..';

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'classic');

const skin = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/voice-input-button/index.css',
  ),
  'utf8',
);

class FakeSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  maxAlternatives = 1;
  onstart: ((event: Event) => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onspeechend: ((event: Event) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  start() {}
  stop() {}
  abort() {}
}

const w = window as unknown as { SpeechRecognition?: unknown };

describe('VoiceInputButton press stamp', () => {
  beforeEach(() => {
    w.SpeechRecognition = FakeSpeechRecognition;
  });
  afterEach(() => {
    delete w.SpeechRecognition;
    cleanup();
  });

  it('pairs the skin press rule with the stamped state, not `:active` alone', () => {
    expect(skin).toContain(
      ".ds-voice-input-button[data-part='root']:is([data-state~='pressed'], :active)",
    );
    expect(skin).toContain('transform: scale(var(--ds-state-press-scale));');
    // The bare pseudo-class must not survive as the only arm of a press rule.
    expect(skin).not.toMatch(/\[data-part='root'\]:active\s*\{/u);
  });

  it('carries no data-state at rest, so resting paint is unchanged', async () => {
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('stamps pressed on pointer down and clears it on pointer up', async () => {
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')?.split(' ')).toContain('pressed');

    fireEvent.pointerUp(root);
    expect(root.getAttribute('data-state')?.split(' ') ?? []).not.toContain('pressed');
  });

  it('keeps the tooltip-injected aria wiring the clone owns', async () => {
    const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    // Tooltip clones the trigger and owns `aria-label`/`title`; the stamp is
    // spread after the passthrough but must not displace the clone's props.
    expect(root.getAttribute('aria-label')).toBe('Start voice input');
    expect(root.getAttribute('data-part')).toBe('root');
    expect(root.getAttribute('data-size')).toBe('md');
  });

  it('lets a caller data attribute through while the stamp still wins data-state', async () => {
    const { container } = render(
      <VoiceInputButton lang="en-US" onTranscript={vi.fn()} data-testid="voice" data-state="junk" />,
    );
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute('data-testid')).toBe('voice');
    expect(root.hasAttribute('data-state')).toBe(false);
  });
});
