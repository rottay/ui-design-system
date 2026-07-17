/** @fileoverview ChatSurface tests -- transcript rendering, composer, and side panel. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ChatSurface } from '..';
import type { ChatSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<ChatSurfaceConfig>): ChatSurfaceConfig {
  return {
    visual: {
      composerRows: 3,
    },
    presentation: {
      chrome: {
        title: 'Copilot Chat',
      },
      composerPlaceholder: 'Ask the copilot',
    },
    behavior: {
      messages: [
        {
          id: 'm1',
          author: 'Assistant',
          body: 'Hello there',
        },
      ],
      onSend: vi.fn(),
    },
    access: undefined,
    ...overrides,
  };
}

describe('ChatSurface', () => {
  beforeAll(async () => {
    await import('../../../../../../primitives/inputs/Textarea/engines/rustic');
  });

  it('sends the current draft and clears uncontrolled composer state', async () => {
    const config = buildConfig();

    renderSurface(<ChatSurface config={config} />);

    const textarea = await screen.findByPlaceholderText('Ask the copilot', undefined, {
      timeout: 15000,
    });
    fireEvent.change(textarea, { target: { value: 'Show me the summary' } });
    const sendButton = screen.getByText('Send').closest('button');
    if (!sendButton) throw new Error('Send button not found');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(config.behavior.onSend).toHaveBeenCalledWith('Show me the summary');
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ask the copilot')).toHaveValue('');
    });
  });

  it('renders typed message parts, tool cards, and typing indicators', async () => {
    const config = buildConfig({
      behavior: {
        messages: [
          {
            id: 'm1',
            author: 'Assistant',
            role: 'assistant',
            deliveryStatus: 'streaming',
            parts: [
              { type: 'text', content: 'Searching the event catalog', streaming: true },
              {
                type: 'tool-status',
                name: 'search_events',
                status: 'complete',
                summary: 'Found 4 matching events',
              },
            ],
          },
        ],
        assistantTyping: true,
        onSend: vi.fn(),
      },
    });

    renderSurface(<ChatSurface config={config} />);

    expect(await screen.findByText('Searching the event catalog')).toBeInTheDocument();
    expect(screen.getByText('search_events')).toBeInTheDocument();
    expect(screen.getByText('Found 4 matching events')).toBeInTheDocument();
    expect(screen.getByText('Assistant is typing')).toBeInTheDocument();
  });

  it('allows custom part rendering and keeps send disabled for empty drafts', async () => {
    const config = buildConfig({
      presentation: {
        chrome: {
          title: 'Copilot Chat',
        },
        composerPlaceholder: 'Ask the copilot',
        renderPart: (part) =>
          part.type === 'tool-status' ? <div>Custom tool: {part.name}</div> : undefined,
      },
      behavior: {
        messages: [
          {
            id: 'm2',
            author: 'Assistant',
            parts: [
              {
                type: 'tool-status',
                name: 'summarize_event',
                status: 'running',
              },
            ],
          },
        ],
        onSend: vi.fn(),
      },
    });

    renderSurface(<ChatSurface config={config} />);

    expect(await screen.findByText('Custom tool: summarize_event')).toBeInTheDocument();
    const sendButton = screen.getByText('Send').closest('button');
    if (!sendButton) throw new Error('Send button not found');
    expect(sendButton).toBeDisabled();
  });

  it('keeps controlled drafts external, renders sidebar content, and localizes empty state', async () => {
    const onDraftChange = vi.fn();
    const config = buildConfig({
      presentation: {
        chrome: {
          title: 'Copilot Chat',
        },
        composerPlaceholder: 'Ask the copilot',
        headerContent: <div>Chat header</div>,
        sidebar: <div>Chat sidebar</div>,
      },
      behavior: {
        messages: [],
        draft: 'Locked draft',
        onDraftChange,
        sending: true,
        onSend: vi.fn(),
      },
    });

    renderSurface(<ChatSurface config={config} />, {
      tenantOverrides: { locale: 'es' },
    });

    const textarea = await screen.findByDisplayValue('Locked draft');
    fireEvent.change(textarea, { target: { value: 'Edited draft' } });

    expect(onDraftChange).toHaveBeenCalledWith('Edited draft');
    expect(screen.getByDisplayValue('Locked draft')).toBeInTheDocument();
    expect(screen.getByText('Chat header')).toBeInTheDocument();
    expect(screen.getByText('Chat sidebar')).toBeInTheDocument();
    expect(await screen.findByText('Todavia no hay mensajes')).toBeInTheDocument();
    expect(
      await screen.findByText('Envia el primer mensaje para comenzar la conversacion.')
    ).toBeInTheDocument();
    const localizedSendButton = screen.getByText('Enviar').closest('button');
    if (!localizedSendButton) throw new Error('Enviar button not found');
    expect(localizedSendButton).toBeDisabled();
  });

  it('projects transcript-first phone posture with a sticky composer', async () => {
    const config = buildConfig({
      visual: {
        hideListOnMobile: true,
        stickyInputOnMobile: true,
      },
      presentation: {
        chrome: { title: 'Copilot Chat' },
        sidebar: <div>Conversation list</div>,
      },
    });

    renderSurface(<ChatSurface config={config} />, {
      responsiveContext: {
        ...RESOLVED_PHONE_TEST_CONTEXT,
        virtualKeyboardInset: 276,
        isVirtualKeyboardOpen: true,
      },
    });

    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(document.querySelector('.ds-chat')).toHaveAttribute('data-mobile-sidebar', 'hidden');
    expect(document.querySelector('[data-part="composer"]')).toHaveAttribute(
      'data-mobile-sticky',
      'true'
    );
    expect(document.querySelector('[data-part="composer"]')).toHaveAttribute(
      'data-keyboard-open',
      'true'
    );
    expect(
      (document.querySelector('[data-part="composer"]') as HTMLElement).style.getPropertyValue(
        '--ds-virtual-keyboard-inset'
      )
    ).toBe('276px');
    expect(screen.queryByText('Conversation list')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });
});
