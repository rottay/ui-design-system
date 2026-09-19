/**
 * The `search-command-bar` family's FIRST suite.
 *
 * The WO-FAM-11 census measured this owner at zero `*.test.tsx` files and zero
 * executable accessibility assertions -- the gate's `a11yAssertions` arm had no
 * partial credit to give. What follows is the honest floor: the bar's
 * accessible anatomy, the voice affordance's names in every status it reaches,
 * the permission drawer's dialog semantics, and the keyboard owner the cut
 * moved this family onto.
 */
import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SearchCommandBar } from '..';
import { renderWithEngine } from '@tests/support/engine';

/**
 * The voice runtime is a browser capability, not a DS decision. The suite pins
 * the two branches the anatomy actually forks on -- supported and not -- rather
 * than asking a jsdom for SpeechRecognition.
 */
const voiceState = {
  isSupported: false,
  status: 'idle' as 'idle' | 'listening' | 'transcribing' | 'error',
  permissionState: 'granted' as PermissionState | 'unknown',
  transcriptPreview: '',
  errorMessage: undefined as string | undefined,
};

vi.mock('@/infrastructure/runtime/application/automation/voice/composition/react/input', () => ({
  useVoiceInput: () => ({
    isSupported: voiceState.isSupported,
    status: voiceState.status,
    permissionState: voiceState.permissionState,
    transcriptPreview: voiceState.transcriptPreview,
    errorMessage: voiceState.errorMessage,
    requestPermission: async () => true,
    startListening: () => undefined,
    stopListening: () => undefined,
    cancelListening: () => undefined,
    resetVoiceFeedback: () => undefined,
  }),
}));

function bar(overrides: Partial<React.ComponentProps<typeof SearchCommandBar>> = {}) {
  return (
    <SearchCommandBar
      command={{ placeholder: 'Search records', value: '', onSearch: () => undefined }}
      {...overrides}
    />
  );
}

beforeEach(() => {
  voiceState.isSupported = false;
  voiceState.status = 'idle';
  voiceState.permissionState = 'granted';
  voiceState.transcriptPreview = '';
  voiceState.errorMessage = undefined;
});

describe('SearchCommandBar -- accessible anatomy', () => {
  it('exposes the command input as a named textbox', async () => {
    renderWithEngine(bar(), 'modern');
    const input = await screen.findByRole('textbox');
    expect(input).toHaveAccessibleName('Search records');
  });

  it('names the clear control instead of leaving an icon-only button unnamed', async () => {
    voiceState.isSupported = true;
    renderWithEngine(
      bar({ command: { placeholder: 'Search records', value: 'draft', onSearch: () => undefined } }),
      'modern',
    );
    const clear = await screen.findByRole('button', { name: 'Clear search' });
    expect(clear).toHaveAccessibleName('Clear search');
  });

  it('names the voice affordance for the action it performs, not for its glyph', async () => {
    voiceState.isSupported = true;
    renderWithEngine(bar(), 'modern');
    expect(await screen.findByRole('button', { name: 'Start voice input' })).toBeInTheDocument();
  });

  it('renames the voice affordance while a session is live', async () => {
    voiceState.isSupported = true;
    voiceState.status = 'listening';
    renderWithEngine(bar(), 'modern');
    expect(await screen.findByRole('button', { name: 'Stop voice input' })).toBeInTheDocument();
  });

  it('gives the suggestion strip a group role with its own label', async () => {
    renderWithEngine(
      bar({
        command: {
          placeholder: 'Search records',
          value: '',
          onSearch: () => undefined,
          suggestions: [{ key: 'open', label: 'Open only', query: 'status:open' }],
        },
      }),
      'modern',
    );
    const group = await screen.findByRole('group', { name: 'Smart refine' });
    const chip = await screen.findByRole('button', { name: 'Open only' });
    expect(group).toContainElement(chip);
  });

  it('hides the voice anatomy entirely when the browser cannot dictate', async () => {
    renderWithEngine(bar(), 'modern');
    await screen.findByRole('textbox');
    expect(screen.queryByRole('button', { name: 'Start voice input' })).toBeNull();
  });
});

describe('SearchCommandBar -- the microphone-permission drawer', () => {
  it('opens as a named dialog and closes through a named control', async () => {
    // The blocked branch is the one that reaches the drawer and stays there:
    // a grantable prompt resolves and the drawer closes itself again.
    voiceState.isSupported = true;
    voiceState.permissionState = 'denied';
    voiceState.status = 'error';
    voiceState.errorMessage = 'Microphone access is blocked for this site.';
    renderWithEngine(bar(), 'modern');

    const toggle = await screen.findByRole('button', { name: 'Start voice input' });
    await act(async () => {
      fireEvent.click(toggle);
    });

    const drawer = await screen.findByRole('dialog', { name: 'Enable microphone' });
    expect(drawer).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Close microphone help' }),
    ).toHaveAccessibleName('Close microphone help');
  });
});

describe('SearchCommandBar -- the keyboard owner', () => {
  it('holds no listener of its own: `/` arrives through the shortcut registry', async () => {
    const onSearch = vi.fn();
    renderWithEngine(
      bar({ command: { placeholder: 'Search records', value: '', onSearch } }),
      'modern',
    );
    const input = await screen.findByRole('textbox');

    act(() => {
      document.dispatchEvent(
        new (window as unknown as { KeyboardEvent: typeof KeyboardEvent }).KeyboardEvent('keydown', {
          key: '/',
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    // `DesignSystemProvider` mounts the single `ShortcutProvider`, so the chord
    // resolves with no per-family window listener anywhere in this tree.
    expect(input).toHaveFocus();
  });

  it('does not steal `/` while the user is typing in a field', async () => {
    renderWithEngine(
      <>
        <input data-testid="other-field" />
        {bar()}
      </>,
      'modern',
    );
    const other = await screen.findByTestId('other-field');
    act(() => {
      other.focus();
    });
    act(() => {
      fireEvent.keyDown(other, { key: '/' });
    });

    expect(other).toHaveFocus();
  });
});
