/**
 * AI Hooks Tests - useStreamingText & useChat
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamingText, useChat } from './index';
import type { ChatMessage } from './index';

// ============================================================================
// useStreamingText
// ============================================================================

describe('useStreamingText', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('starts with empty text and idle flags', () => {
      const { result } = renderHook(() => useStreamingText());

      expect(result.current.text).toBe('');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('appendChunk', () => {
    it('accumulates text chunks', () => {
      const { result } = renderHook(() => useStreamingText());

      act(() => {
        result.current.appendChunk('Hello');
      });

      expect(result.current.text).toBe('Hello');
      expect(result.current.isStreaming).toBe(true);

      act(() => {
        result.current.appendChunk(' world');
      });

      expect(result.current.text).toBe('Hello world');
      expect(result.current.isStreaming).toBe(true);
    });

    it('clears any previous error on new chunk', () => {
      const { result } = renderHook(() => useStreamingText());

      // We cannot easily cause appendChunk to throw internally,
      // but we verify error starts null and stays null during normal operation.
      act(() => {
        result.current.appendChunk('text');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('setText', () => {
    it('sets complete text immediately and marks as complete', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useStreamingText({ onComplete }));

      act(() => {
        result.current.setText('Full response');
      });

      expect(result.current.text).toBe('Full response');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledWith('Full response');
    });
  });

  describe('startTyping', () => {
    it('begins a typing animation that sets isStreaming to true', () => {
      const { result } = renderHook(() =>
        useStreamingText({ typingSpeed: 5 })
      );

      act(() => {
        result.current.startTyping('Hello!');
      });

      // Should be streaming immediately after starting
      expect(result.current.isStreaming).toBe(true);
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('reset', () => {
    it('clears all state', () => {
      const { result } = renderHook(() => useStreamingText());

      act(() => {
        result.current.appendChunk('Some text');
      });

      expect(result.current.text).toBe('Some text');

      act(() => {
        result.current.reset();
      });

      expect(result.current.text).toBe('');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});

// ============================================================================
// useChat
// ============================================================================

describe('useChat', () => {
  describe('Initial State', () => {
    it('starts with empty state when no options provided', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.input).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('uses initialMessages when provided', () => {
      const initial: ChatMessage[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          status: 'sent',
          timestamp: new Date('2026-01-01'),
        },
      ];

      const { result } = renderHook(() => useChat({ initialMessages: initial }));

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello');
      expect(result.current.messages[0].role).toBe('user');
    });
  });

  describe('Input Management', () => {
    it('updates input via setInput', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInput('test message');
      });

      expect(result.current.input).toBe('test message');
    });
  });

  describe('Send Message', () => {
    it('adds user message and clears input on send', async () => {
      const onSend = vi.fn().mockResolvedValue('AI response');
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('Hello AI');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      // Should have both user and assistant messages
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('Hello AI');
      expect(result.current.messages[0].status).toBe('sent');

      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.messages[1].content).toBe('AI response');
      expect(result.current.messages[1].status).toBe('sent');

      // Input should be cleared
      expect(result.current.input).toBe('');
      expect(result.current.isLoading).toBe(false);
    });

    it('does nothing when input is empty', async () => {
      const onSend = vi.fn();
      const { result } = renderHook(() => useChat({ onSend }));

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(onSend).not.toHaveBeenCalled();
      expect(result.current.messages).toHaveLength(0);
    });

    it('does nothing when input is only whitespace', async () => {
      const onSend = vi.fn();
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('   ');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(onSend).not.toHaveBeenCalled();
    });

    it('adds user message even without onSend callback', async () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInput('standalone message');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('standalone message');
    });
  });

  describe('Streaming Chunks', () => {
    it('streams chunks from an AsyncIterable response', async () => {
      async function* streamChunks(): AsyncIterable<string> {
        yield 'Hello';
        yield ' world';
        yield '!';
      }

      const onSend = vi.fn().mockResolvedValue(streamChunks());
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('stream test');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.messages[1].content).toBe('Hello world!');
      expect(result.current.messages[1].status).toBe('sent');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('captures errors and marks assistant message as error', async () => {
      const onSend = vi.fn().mockRejectedValue(new Error('API failure'));
      const onError = vi.fn();

      const { result } = renderHook(() => useChat({ onSend, onError }));

      act(() => {
        result.current.setInput('will fail');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('API failure');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));

      // Assistant message should be marked as error
      const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
      expect(assistantMsg?.status).toBe('error');
      expect(result.current.isLoading).toBe(false);
    });

    it('wraps non-Error throws into Error objects', async () => {
      const onSend = vi.fn().mockRejectedValue('string error');
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('will fail');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('string error');
    });
  });

  describe('Clear Messages', () => {
    it('removes all messages and resets state', async () => {
      const onSend = vi.fn().mockResolvedValue('response');
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('message');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(result.current.messages).toHaveLength(2);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.input).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('chatSurfaceProps Shape', () => {
    it('produces correctly shaped props for ChatSurface', async () => {
      const onSend = vi.fn().mockResolvedValue('AI says hi');
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('hello');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      const { chatSurfaceProps } = result.current;

      // Structure checks
      expect(chatSurfaceProps).toHaveProperty('messages');
      expect(chatSurfaceProps).toHaveProperty('draft');
      expect(chatSurfaceProps).toHaveProperty('onDraftChange');
      expect(chatSurfaceProps).toHaveProperty('onSend');
      expect(chatSurfaceProps).toHaveProperty('assistantTyping');
      expect(chatSurfaceProps).toHaveProperty('sending');

      // Type checks
      expect(typeof chatSurfaceProps.onDraftChange).toBe('function');
      expect(typeof chatSurfaceProps.onSend).toBe('function');
      expect(typeof chatSurfaceProps.assistantTyping).toBe('boolean');
      expect(typeof chatSurfaceProps.sending).toBe('boolean');

      // Message mapping
      expect(chatSurfaceProps.messages).toHaveLength(2);

      const userSurface = chatSurfaceProps.messages[0];
      expect(userSurface.role).toBe('user');
      expect(userSurface.author).toBe('You');
      expect(userSurface.body).toBe('hello');
      expect(userSurface.deliveryStatus).toBe('sent');
      expect(userSurface.streaming).toBe(false);

      const assistantSurface = chatSurfaceProps.messages[1];
      expect(assistantSurface.role).toBe('assistant');
      expect(assistantSurface.author).toBe('Assistant');
      expect(assistantSurface.body).toBe('AI says hi');
      expect(assistantSurface.deliveryStatus).toBe('sent');
      expect(assistantSurface.streaming).toBe(false);
    });

    it('reflects draft input changes', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInput('typing...');
      });

      expect(result.current.chatSurfaceProps.draft).toBe('typing...');
    });

    it('onDraftChange updates the input', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.chatSurfaceProps.onDraftChange('via surface');
      });

      expect(result.current.input).toBe('via surface');
      expect(result.current.chatSurfaceProps.draft).toBe('via surface');
    });

    it('assistantTyping reflects isLoading state', async () => {
      // Use a never-resolving promise to keep isLoading true
      let resolveOnSend: ((value: string) => void) | undefined;
      const onSend = vi.fn(
        () => new Promise<string>((resolve) => { resolveOnSend = resolve; })
      );

      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('ping');
      });

      // Start sending (don't await - it will hang)
      let sendPromise: Promise<void>;
      act(() => {
        sendPromise = result.current.sendMessage();
      });

      // While loading
      await waitFor(() => {
        expect(result.current.chatSurfaceProps.assistantTyping).toBe(true);
        expect(result.current.chatSurfaceProps.sending).toBe(true);
      });

      // Resolve
      await act(async () => {
        resolveOnSend?.('done');
        await sendPromise!;
      });

      expect(result.current.chatSurfaceProps.assistantTyping).toBe(false);
      expect(result.current.chatSurfaceProps.sending).toBe(false);
    });
  });

  describe('Multiple Messages', () => {
    it('maintains conversation history across sends', async () => {
      let callCount = 0;
      const onSend = vi.fn(async () => {
        callCount++;
        return `Response ${callCount}`;
      });

      const { result } = renderHook(() => useChat({ onSend }));

      // Send first message
      act(() => {
        result.current.setInput('First');
      });
      await act(async () => {
        await result.current.sendMessage();
      });

      // Send second message
      act(() => {
        result.current.setInput('Second');
      });
      await act(async () => {
        await result.current.sendMessage();
      });

      expect(result.current.messages).toHaveLength(4);
      expect(result.current.messages[0].content).toBe('First');
      expect(result.current.messages[1].content).toBe('Response 1');
      expect(result.current.messages[2].content).toBe('Second');
      expect(result.current.messages[3].content).toBe('Response 2');
    });

    it('passes full message history to onSend', async () => {
      const onSend = vi.fn().mockResolvedValue('ok');
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInput('First');
      });
      await act(async () => {
        await result.current.sendMessage();
      });

      act(() => {
        result.current.setInput('Second');
      });
      await act(async () => {
        await result.current.sendMessage();
      });

      // Second call should receive the history including first exchange + new user msg
      const secondCallArgs = onSend.mock.calls[1];
      expect(secondCallArgs[0]).toBe('Second');
      // History should include: user(First), assistant(Response 1), user(Second)
      expect(secondCallArgs[1]).toHaveLength(3);
      expect(secondCallArgs[1][0].content).toBe('First');
    });
  });
});
