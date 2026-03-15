'use client';

/**
 * @fileoverview AI Hooks - Rottay Design System
 * @description React hooks for AI chat integration, streaming text rendering,
 * and provider-agnostic chat state management.
 *
 * @remarks
 * The AI hooks provide:
 * - **useStreamingText**: Manages incremental text rendering with chunk append,
 *   full-text set, and simulated typing animation.
 * - **useChat**: Full chat state machine with message history, streaming
 *   assistant responses, error handling, and ready-made ChatSurface props.
 *
 * These hooks are intentionally provider-agnostic. The consumer supplies an
 * `onSend` callback that can integrate with any backend (SSE, WebSocket,
 * Vercel AI SDK, custom fetch, etc.).
 *
 * @example Streaming text from SSE
 * ```tsx
 * import { useStreamingText, StreamingText } from '@rottay/design-system';
 *
 * function AIResponse() {
 *   const { text, isStreaming, appendChunk } = useStreamingText({
 *     onComplete: (full) => console.log('Done:', full),
 *   });
 *
 *   useEffect(() => {
 *     const es = new EventSource('/api/stream');
 *     es.onmessage = (e) => appendChunk(e.data);
 *     return () => es.close();
 *   }, [appendChunk]);
 *
 *   return <StreamingText text={text} streaming={isStreaming} />;
 * }
 * ```
 *
 * @example Chat with ChatSurface
 * ```tsx
 * import { useChat, ChatSurface } from '@rottay/design-system';
 *
 * function AIChatPage() {
 *   const { chatSurfaceProps } = useChat({
 *     onSend: async (message) => {
 *       const res = await fetch('/api/chat', { method: 'POST', body: message });
 *       return res.body; // AsyncIterable<string>
 *     },
 *   });
 *
 *   return (
 *     <ChatSurface config={{
 *       visual: {},
 *       presentation: { chrome: { title: 'AI Assistant' } },
 *       behavior: chatSurfaceProps,
 *     }} />
 *   );
 * }
 * ```
 *
 * @module System/Hooks/AI
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// useStreamingText
// ============================================================================

/**
 * Configuration options for the `useStreamingText` hook.
 */
export interface UseStreamingTextOptions {
  /** Called when streaming completes (all chunks received or typing finishes). */
  onComplete?: (fullText: string) => void;
  /** Called when an error occurs during streaming or typing simulation. */
  onError?: (error: Error) => void;
  /** Characters revealed per animation frame during simulated typing. @default 2 */
  typingSpeed?: number;
}

/**
 * Return type of the `useStreamingText` hook.
 */
export interface UseStreamingTextReturn {
  /** The current visible text content. */
  text: string;
  /** Whether text is actively being received or animated. */
  isStreaming: boolean;
  /** Whether the stream has completed at least once. */
  isComplete: boolean;
  /** The last error encountered, or null. */
  error: Error | null;
  /** Append a text chunk (for SSE / WebSocket integration). */
  appendChunk: (chunk: string) => void;
  /** Set the complete text at once (marks as complete immediately). */
  setText: (text: string) => void;
  /** Start a simulated typing effect that reveals the given text progressively. */
  startTyping: (fullText: string) => void;
  /** Reset all state to initial values. */
  reset: () => void;
}

/**
 * Hook for managing streaming text state.
 *
 * Provides three modes of text delivery:
 * 1. **Chunk append** - Call `appendChunk` as data arrives from SSE/WS
 * 2. **Full set** - Call `setText` to display all text immediately
 * 3. **Simulated typing** - Call `startTyping` for a typewriter effect
 *
 * @param options - Configuration options
 * @returns Streaming text state and control functions
 *
 * @example
 * ```tsx
 * const { text, isStreaming, appendChunk, reset } = useStreamingText({
 *   onComplete: (full) => saveToHistory(full),
 * });
 * ```
 */
export function useStreamingText(
  options?: UseStreamingTextOptions
): UseStreamingTextReturn {
  const { onComplete, onError, typingSpeed = 2 } = options ?? {};

  const [text, setTextState] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs for stable callback access and typing animation
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const typingFrameRef = useRef<number | null>(null);
  const fullTextRef = useRef('');
  const cursorRef = useRef(0);

  // Cleanup typing animation on unmount
  useEffect(() => {
    return () => {
      if (typingFrameRef.current !== null) {
        cancelAnimationFrame(typingFrameRef.current);
      }
    };
  }, []);

  const cancelTyping = useCallback(() => {
    if (typingFrameRef.current !== null) {
      cancelAnimationFrame(typingFrameRef.current);
      typingFrameRef.current = null;
    }
  }, []);

  const markComplete = useCallback((finalText: string) => {
    setIsStreaming(false);
    setIsComplete(true);
    onCompleteRef.current?.(finalText);
  }, []);

  const appendChunk = useCallback(
    (chunk: string) => {
      try {
        cancelTyping();
        setIsStreaming(true);
        setError(null);
        setTextState((prev) => {
          const next = prev + chunk;
          return next;
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
      }
    },
    [cancelTyping]
  );

  const setText = useCallback(
    (newText: string) => {
      cancelTyping();
      setTextState(newText);
      setError(null);
      markComplete(newText);
    },
    [cancelTyping, markComplete]
  );

  const startTyping = useCallback(
    (fullText: string) => {
      cancelTyping();
      fullTextRef.current = fullText;
      cursorRef.current = 0;
      setTextState('');
      setIsStreaming(true);
      setIsComplete(false);
      setError(null);

      const tick = (): void => {
        try {
          const nextCursor = Math.min(
            cursorRef.current + typingSpeed,
            fullTextRef.current.length
          );
          cursorRef.current = nextCursor;
          const visibleText = fullTextRef.current.slice(0, nextCursor);
          setTextState(visibleText);

          if (nextCursor >= fullTextRef.current.length) {
            typingFrameRef.current = null;
            setIsStreaming(false);
            setIsComplete(true);
            onCompleteRef.current?.(fullTextRef.current);
          } else {
            typingFrameRef.current = requestAnimationFrame(tick);
          }
        } catch (err) {
          typingFrameRef.current = null;
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsStreaming(false);
          onErrorRef.current?.(error);
        }
      };

      typingFrameRef.current = requestAnimationFrame(tick);
    },
    [cancelTyping, typingSpeed]
  );

  const reset = useCallback(() => {
    cancelTyping();
    fullTextRef.current = '';
    cursorRef.current = 0;
    setTextState('');
    setIsStreaming(false);
    setIsComplete(false);
    setError(null);
  }, [cancelTyping]);

  return {
    text,
    isStreaming,
    isComplete,
    error,
    appendChunk,
    setText,
    startTyping,
    reset,
  };
}

// ============================================================================
// useChat
// ============================================================================

/**
 * A single message in the chat conversation.
 */
export interface ChatMessage {
  /** Unique identifier for this message. */
  id: string;
  /** The role of the message author. */
  role: 'user' | 'assistant' | 'system' | 'tool';
  /** Text content of the message. */
  content: string;
  /** Delivery/processing status. */
  status?: 'sending' | 'streaming' | 'sent' | 'error';
  /** When the message was created. */
  timestamp?: Date;
  /** Tool calls associated with this assistant message. */
  toolCalls?: {
    id: string;
    name: string;
    args: unknown;
    result?: unknown;
    status: 'queued' | 'running' | 'complete' | 'error';
  }[];
}

/**
 * Configuration options for the `useChat` hook.
 */
export interface UseChatOptions {
  /** Pre-populated messages to display on mount. */
  initialMessages?: ChatMessage[];
  /**
   * Callback invoked when the user sends a message.
   *
   * Receives the message text and the full message history (including the
   * just-added user message). Should return either:
   * - An `AsyncIterable<string>` for streaming responses (SSE, WS, AI SDK)
   * - A plain `string` for a single-shot response
   *
   * If omitted, messages are added to the list but no assistant response
   * is generated.
   */
  onSend?: (
    message: string,
    messages: ChatMessage[]
  ) => Promise<AsyncIterable<string> | string>;
  /** Called when an error occurs during message sending or streaming. */
  onError?: (error: Error) => void;
}

/**
 * Return type of the `useChat` hook.
 */
export interface UseChatReturn {
  /** The full message history. */
  messages: ChatMessage[];
  /** Current draft input value. */
  input: string;
  /** Update the draft input value. */
  setInput: (input: string) => void;
  /** Send the current draft as a user message and trigger the onSend callback. */
  sendMessage: () => Promise<void>;
  /** Whether a message is currently being sent or streamed. */
  isLoading: boolean;
  /** The last error encountered, or null. */
  error: Error | null;
  /** Remove all messages from the history. */
  clearMessages: () => void;
  /**
   * Ready-made props that map directly to ChatSurface's behavior config.
   *
   * Spread these onto `config.behavior` to wire up the surface with zero glue.
   */
  chatSurfaceProps: {
    messages: {
      id: string;
      author: string;
      body: string;
      role: 'user' | 'assistant' | 'system' | 'tool';
      deliveryStatus: 'sending' | 'streaming' | 'sent' | 'error' | 'draft';
      streaming: boolean;
      timestamp: string | undefined;
    }[];
    draft: string;
    onDraftChange: (draft: string) => void;
    onSend: () => void;
    assistantTyping: boolean;
    sending: boolean;
  };
}

let chatMessageIdCounter = 0;

function generateMessageId(): string {
  chatMessageIdCounter += 1;
  return `msg_${Date.now()}_${chatMessageIdCounter}`;
}

/**
 * Determines if a value is an AsyncIterable (duck-type check).
 */
function isAsyncIterable(value: unknown): value is AsyncIterable<string> {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    Symbol.asyncIterator in (value as object)
  );
}

/**
 * Full chat state management hook.
 *
 * Manages message history, input state, streaming assistant responses, error
 * handling, and produces ready-made props for the ChatSurface component.
 *
 * The `onSend` callback is intentionally generic: return an `AsyncIterable<string>`
 * for token-by-token streaming, or a plain `string` for single-shot replies.
 * This makes the hook compatible with any AI provider or backend.
 *
 * @param options - Hook configuration
 * @returns Chat state, control functions, and ChatSurface integration props
 *
 * @example Basic usage
 * ```tsx
 * const { messages, input, setInput, sendMessage, isLoading } = useChat({
 *   onSend: async (text) => {
 *     const res = await fetch('/api/chat', {
 *       method: 'POST',
 *       body: JSON.stringify({ message: text }),
 *     });
 *     return res.text();
 *   },
 * });
 * ```
 *
 * @example Streaming with AsyncIterable
 * ```tsx
 * const chat = useChat({
 *   onSend: async (text) => {
 *     const stream = await fetchSSE('/api/stream', { message: text });
 *     return stream; // AsyncIterable<string>
 *   },
 * });
 * ```
 */
export function useChat(options?: UseChatOptions): UseChatReturn {
  const { initialMessages = [], onSend, onError } = options ?? {};

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Abort controller for cancelling in-flight streams on unmount
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: trimmed,
      status: 'sent',
      timestamp: new Date(),
    };

    setInput('');
    setError(null);

    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    if (!onSendRef.current) return;

    // Create placeholder assistant message
    const assistantMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: '',
      status: 'streaming',
      timestamp: new Date(),
    };

    setMessages([...updatedMessages, assistantMessage]);
    setIsLoading(true);

    // Abort any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await onSendRef.current(trimmed, updatedMessages);

      if (controller.signal.aborted) return;

      if (isAsyncIterable(response)) {
        // Streaming response: consume token by token
        let accumulated = '';

        for await (const chunk of response) {
          if (controller.signal.aborted) return;
          accumulated += chunk;

          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (lastIdx >= 0 && copy[lastIdx].id === assistantMessage.id) {
              copy[lastIdx] = {
                ...copy[lastIdx],
                content: accumulated,
                status: 'streaming',
              };
            }
            return copy;
          });
        }

        if (controller.signal.aborted) return;

        // Mark as sent
        setMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].id === assistantMessage.id) {
            copy[lastIdx] = {
              ...copy[lastIdx],
              content: accumulated,
              status: 'sent',
            };
          }
          return copy;
        });
      } else {
        // Single-shot string response
        if (controller.signal.aborted) return;

        setMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].id === assistantMessage.id) {
            copy[lastIdx] = {
              ...copy[lastIdx],
              content: response,
              status: 'sent',
            };
          }
          return copy;
        });
      }
    } catch (err) {
      if (controller.signal.aborted) return;

      const chatError = err instanceof Error ? err : new Error(String(err));
      setError(chatError);
      onErrorRef.current?.(chatError);

      // Mark assistant message as error
      setMessages((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (lastIdx >= 0 && copy[lastIdx].id === assistantMessage.id) {
          copy[lastIdx] = {
            ...copy[lastIdx],
            status: 'error',
          };
        }
        return copy;
      });
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        abortRef.current = null;
      }
    }
  }, [input, isLoading, messages]);

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setError(null);
  }, []);

  // Map ChatMessage[] to the shape ChatSurface expects
  const surfaceMessages = messages.map((msg) => ({
    id: msg.id,
    author: msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Assistant' : msg.role,
    body: msg.content,
    role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
    deliveryStatus: (msg.status ?? 'sent') as 'sending' | 'streaming' | 'sent' | 'error' | 'draft',
    streaming: msg.status === 'streaming',
    timestamp: msg.timestamp?.toLocaleTimeString() ?? undefined,
  }));

  const handleSurfaceSend = useCallback(() => {
    void sendMessage();
  }, [sendMessage]);

  const chatSurfaceProps = {
    messages: surfaceMessages,
    draft: input,
    onDraftChange: setInput,
    onSend: handleSurfaceSend,
    assistantTyping: isLoading,
    sending: isLoading,
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    chatSurfaceProps,
  };
}
