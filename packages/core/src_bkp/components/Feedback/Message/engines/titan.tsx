/**
 * Titan Message Engine
 *
 * Wraps Ant Design message API.
 */

'use client';

import { message } from 'antd';
import type { ReactNode } from 'react';
import type {
  MessageAPI,
  MessageContentOptions,
  MessageConfigOptions,
  MessageInstance,
} from '../../../../types/components/message';
import { normalizeMessageConfig } from '../../../../types/components/message';

const titanMessageAPI: MessageAPI = {
  success(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    const config = normalizeMessageConfig(content, duration, onClose);
    return message.success({
      content: config.content,
      duration: config.duration,
      icon: config.icon,
      key: config.key,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });
  },

  error(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    const config = normalizeMessageConfig(content, duration, onClose);
    return message.error({
      content: config.content,
      duration: config.duration,
      icon: config.icon,
      key: config.key,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });
  },

  info(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    const config = normalizeMessageConfig(content, duration, onClose);
    return message.info({
      content: config.content,
      duration: config.duration,
      icon: config.icon,
      key: config.key,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });
  },

  warning(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    const config = normalizeMessageConfig(content, duration, onClose);
    return message.warning({
      content: config.content,
      duration: config.duration,
      icon: config.icon,
      key: config.key,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });
  },

  loading(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    const config = normalizeMessageConfig(content, duration, onClose);
    return message.loading({
      content: config.content,
      duration: config.duration,
      icon: config.icon,
      key: config.key,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });
  },

  open(config: MessageContentOptions): MessageInstance {
    return message.open({
      content: config.content,
      duration: config.duration,
      icon: config.icon,
      key: config.key,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
      type: config.type,
    });
  },

  config(options: MessageConfigOptions): void {
    message.config({
      duration: options.duration,
      maxCount: options.maxCount,
      top: options.top,
      rtl: options.rtl,
      prefixCls: options.prefixCls,
      getContainer: options.getContainer,
    });
  },

  destroy(key?: string | number): void {
    if (key !== undefined) {
      message.destroy(key);
    } else {
      message.destroy();
    }
  },
};

export default titanMessageAPI;
