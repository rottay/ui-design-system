/**
 * Titan Notification Engine
 *
 * Wraps Ant Design notification API.
 */

'use client';

import { notification as antNotification } from 'antd';
import type { NotificationInstance, NotificationConfig, NotificationGlobalConfig } from '../types';

const titanNotification: NotificationInstance = {
  open: (config: NotificationConfig) => antNotification.open(config as any),
  success: (config: NotificationConfig) => antNotification.success(config as any),
  error: (config: NotificationConfig) => antNotification.error(config as any),
  info: (config: NotificationConfig) => antNotification.info(config as any),
  warning: (config: NotificationConfig) => antNotification.warning(config as any),
  destroy: (key?: string) => antNotification.destroy(key),
  config: (options: NotificationGlobalConfig) => antNotification.config(options as any),
};

export default titanNotification;
