/**
 * Apollo Message Engine
 *
 * Pure HTML + Tailwind CSS toast implementation.
 */

'use client';

import type { ReactNode } from 'react';
import type {
  MessageAPI,
  MessageContentOptions,
  MessageConfigOptions,
  MessageInstance,
  MessageType,
} from '../../../../types/components/message';
import { normalizeMessageConfig, getMessageTypeIcon, getMessageTypeColor } from '../../../../types/components/message';

let messageContainer: HTMLElement | null = null;
let messageCount = 0;
const activeMessages = new Map<string | number, HTMLElement>();

const globalConfig: MessageConfigOptions = {
  duration: 3,
  maxCount: undefined,
  top: 24,
};

function getContainer(): HTMLElement {
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.className = 'fixed z-[9999] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none';
    messageContainer.style.top = `${globalConfig.top}px`;
    document.body.appendChild(messageContainer);
  }
  return messageContainer;
}

function showMessage(type: MessageType, config: MessageContentOptions): MessageInstance {
  const container = getContainer();
  const key = config.key ?? `message-${++messageCount}`;

  if (activeMessages.has(key)) {
    removeMessage(key);
  }

  if (globalConfig.maxCount !== undefined && activeMessages.size >= globalConfig.maxCount) {
    const firstKey = activeMessages.keys().next().value;
    if (firstKey !== undefined) {
      removeMessage(firstKey);
    }
  }

  const messageEl = document.createElement('div');
  messageEl.className = 'pointer-events-auto animate-[slideDown_0.3s_ease-out]';

  const colors = getMessageTypeColor(type);
  const icon = getMessageTypeIcon(type);

  const messageDiv = document.createElement('div');
  messageDiv.className = `${colors.bg} ${colors.text} border ${colors.border} rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-[500px]`;

  if (config.className) messageDiv.className += ` ${config.className}`;
  if (config.style) Object.assign(messageDiv.style, config.style);

  const iconSpan = document.createElement('span');
  iconSpan.className = 'text-lg font-bold flex-shrink-0';
  iconSpan.textContent = icon;
  messageDiv.appendChild(iconSpan);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1 text-sm';
  contentDiv.textContent = typeof config.content === 'string' ? config.content : String(config.content);
  messageDiv.appendChild(contentDiv);

  messageEl.appendChild(messageDiv);
  container.appendChild(messageEl);
  activeMessages.set(key, messageEl);

  const duration = config.duration ?? globalConfig.duration ?? 3;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (duration > 0) {
    timeoutId = setTimeout(() => {
      removeMessage(key);
      config.onClose?.();
    }, duration * 1000);
  }

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    removeMessage(key);
    config.onClose?.();
  };
}

function removeMessage(key: string | number): void {
  const messageEl = activeMessages.get(key);
  if (messageEl?.parentNode) {
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      messageEl.parentNode?.removeChild(messageEl);
      activeMessages.delete(key);
    }, 300);
  } else {
    activeMessages.delete(key);
  }
}

const apolloMessageAPI: MessageAPI = {
  success: (content, duration, onClose) => showMessage('success', normalizeMessageConfig(content, duration, onClose)),
  error: (content, duration, onClose) => showMessage('error', normalizeMessageConfig(content, duration, onClose)),
  info: (content, duration, onClose) => showMessage('info', normalizeMessageConfig(content, duration, onClose)),
  warning: (content, duration, onClose) => showMessage('warning', normalizeMessageConfig(content, duration, onClose)),
  loading: (content, duration, onClose) => showMessage('loading', normalizeMessageConfig(content, duration, onClose)),
  open: (config) => showMessage(config.type ?? 'info', config),
  config: (options) => {
    if (options.duration !== undefined) globalConfig.duration = options.duration;
    if (options.maxCount !== undefined) globalConfig.maxCount = options.maxCount;
    if (options.top !== undefined) {
      globalConfig.top = options.top;
      if (messageContainer) messageContainer.style.top = `${options.top}px`;
    }
  },
  destroy: (key) => {
    if (key !== undefined) {
      removeMessage(key);
    } else {
      activeMessages.forEach((_, k) => removeMessage(k));
    }
  },
};

export default apolloMessageAPI;
