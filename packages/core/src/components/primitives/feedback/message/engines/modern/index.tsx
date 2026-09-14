'use client';

/**
 * @fileoverview Message Modern Engine - Rottay Design System.
 *
 * The message role of the Notifier: the provider keeps the queue and the
 * focus hand-off, and renders each entry as a `ds-notifier` surface with
 * `data-variant="message"` inside one live-region notifier stack.
 *
 * Static methods are not supported in Modern; use the provider and
 * `useMessage`.
 *
 * @module Message/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { MessageConfig, MessageInstance, MessageItemProps, MessageProviderProps, MessageType } from '../../contracts';
import { MESSAGE_DEFAULTS } from '../../contracts';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import { useFieldOverlay } from '../../../../runtime/overlay/field-overlay';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NotifierItem, NotifierStack } from '../../../notifier';

interface InternalMessage extends MessageItemProps {
  key?: string | number;
}

const MessageContext = createContext<MessageInstance | null>(null);

let messageId = 0;
const generateId = () => `modern-message-${++messageId}`;

type MessageMethodResult = ReturnType<MessageInstance['success']>;

function settled(): MessageMethodResult {
  const result = (() => {}) as MessageMethodResult;
  result.then = () => {};
  return result;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
  maxCount = MESSAGE_DEFAULTS.maxCount,
  placement = MESSAGE_DEFAULTS.placement,
  top = MESSAGE_DEFAULTS.top,
}) => {
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const stackRef = useRef<HTMLDivElement>(null);
  const revisionRef = useRef(0);

  const overlay = useFieldOverlay({
    kind: 'toast',
    open: messages.length > 0,
    surface: 'viewport',
    render: 'inline',
    modal: false,
    lockScroll: false,
    restoreFocus: false,
  });

  // Removing the message that holds focus hands focus to the next message's
  // close control, or back to where it came from, never to the document body.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pendingFocusHandoffRef = useRef(false);

  const removeMessage = useCallback((id: string) => {
    const stack = stackRef.current;
    const active = stack?.ownerDocument.activeElement as HTMLElement | null;
    if (stack && active) {
      const card = Array.from(stack.querySelectorAll<HTMLElement>('[data-notifier-key]')).find(
        (node) => node.dataset.notifierKey === id,
      );
      if (card?.contains(active)) pendingFocusHandoffRef.current = true;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleStackFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    const from = event.relatedTarget as HTMLElement | null;
    if (from && !event.currentTarget.contains(from)) returnFocusRef.current = from;
  }, []);

  useLayoutEffect(() => {
    if (!pendingFocusHandoffRef.current) return;
    pendingFocusHandoffRef.current = false;
    const nextControl = stackRef.current?.querySelector<HTMLElement>('[data-part="close-button"]');
    if (nextControl) {
      nextControl.focus();
      return;
    }
    const back = returnFocusRef.current;
    returnFocusRef.current = null;
    if (back?.isConnected) back.focus();
  }, [messages]);

  const addMessage = useCallback(
    (config: MessageConfig & { type: MessageType }): (() => void) => {
      const id = config.key?.toString() || generateId();
      const entry: InternalMessage = {
        id,
        key: config.key,
        type: config.type,
        content: config.content,
        duration: config.duration ?? MESSAGE_DEFAULTS.duration,
        onClose: config.onClose,
        icon: config.icon,
        className: config.className,
        style: config.style,
        closable: config.closable,
        closeIcon: config.closeIcon,
        revision: ++revisionRef.current,
      };
      setMessages((prev) => {
        const existing = prev.findIndex((m) => config.key && m.key === config.key);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = entry;
          return updated;
        }
        const updated = [...prev, entry];
        return updated.length > maxCount ? updated.slice(-maxCount) : updated;
      });
      return () => removeMessage(id);
    },
    [maxCount, removeMessage],
  );

  const method = useCallback(
    (type: MessageType) =>
      (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void): MessageMethodResult => {
        const config: MessageConfig & { type: MessageType } =
          typeof content === 'object' && content !== null && 'content' in content
            ? { ...(content as MessageConfig), type }
            : { content: content as ReactNode, duration, onClose, type };
        const destroy = addMessage(config);
        const result = (() => destroy()) as MessageMethodResult;
        result.then = (fn: () => void) => {
          setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
        };
        return result;
      },
    [addMessage],
  );

  const api: MessageInstance = {
    success: method('success'),
    error: method('error'),
    info: method('info'),
    warning: method('warning'),
    loading: method('loading'),
    open: (config: MessageConfig) => method(config.type || 'info')(config),
    destroy: (key?: string | number) => {
      if (key !== undefined) setMessages((prev) => prev.filter((m) => m.key !== key && m.id !== key.toString()));
      else setMessages([]);
    },
  };

  return (
    <MessageContext.Provider value={api}>
      {children}
      <NotifierStack
        ref={stackRef}
        role="message"
        placement={placement}
        layer={overlay.zIndex}
        offset={placement === 'top' ? top : undefined}
        data-overlay-layer={overlay.panelProps['data-overlay-layer']}
        data-overlay-kind={overlay.panelProps['data-overlay-kind']}
        liveRole="log"
        aria-live="polite"
        onFocus={handleStackFocus}
      >
        {messages.map(({ key: _key, ...item }) => (
          <MessageItem key={item.id} {...item} onRemove={removeMessage} />
        ))}
      </NotifierStack>
    </MessageContext.Provider>
  );
};

MessageProvider.displayName = 'MessageProvider.Modern';

export function useMessage(): [MessageInstance, React.ReactElement | null] {
  const context = useContext(MessageContext);
  if (context) return [context, null];
  return [
    {
      success: settled,
      error: settled,
      info: settled,
      warning: settled,
      loading: settled,
      open: settled,
      destroy: () => {},
    },
    null,
  ];
}

export const MessageItem: React.FC<MessageItemProps> = ({
  id,
  type,
  content,
  duration = MESSAGE_DEFAULTS.duration,
  onClose,
  icon,
  className,
  style,
  closable,
  closeIcon,
  onRemove,
  revision,
}) => {
  const i18n = useOptionalTranslation('common');
  return (
    <NotifierItem
      role="message"
      tone={type}
      title={content}
      icon={icon || undefined}
      closable={closable === true}
      closeIcon={closeIcon}
      closeLabel={i18n?.tOr('close', 'Close') ?? 'Close'}
      duration={duration > 0 ? duration * 1000 : 0}
      pauseOnHover
      dismissOnEscape={false}
      onExited={() => {
        onRemove?.(id);
        onClose?.();
      }}
      announce="alert"
      live="polite"
      itemKey={id}
      revision={revision}
      className={className}
      style={style}
    />
  );
};

MessageItem.displayName = 'MessageItem.Modern';

const requireProvider = (): MessageMethodResult => {
  warnOnceInDev(
    'message-modern:provider-required',
    'Modern message: Please use MessageProvider and useMessage hook for full functionality',
  );
  return settled();
};

export const message: MessageInstance = {
  success: requireProvider,
  error: requireProvider,
  info: requireProvider,
  warning: requireProvider,
  loading: requireProvider,
  open: requireProvider,
  destroy: () => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality',
    );
  },
};

export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
