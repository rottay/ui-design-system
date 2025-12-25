/**
 * Apollo Notification Engine
 *
 * Pure HTML + Tailwind CSS notification implementation.
 */

'use client';

import type {
  NotificationInstance,
  NotificationConfig,
  NotificationType,
  NotificationPlacement,
  NotificationGlobalConfig,
} from '../types';
import { getNotificationTypeStyles, getPlacementClasses } from '../types';

let notificationContainer: HTMLDivElement | null = null;
const activeNotifications = new Map<string, HTMLDivElement>();

// Global configuration
const globalConfig: NotificationGlobalConfig = {
  duration: 4.5,
  placement: 'topRight',
  top: 24,
  bottom: 24,
};

function initContainer(placement: NotificationPlacement = 'topRight'): HTMLDivElement {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    const positionClasses = getPlacementClasses(placement);
    notificationContainer.className = `fixed z-[9999] flex flex-col gap-3 ${positionClasses}`;
    document.body.appendChild(notificationContainer);
  }
  return notificationContainer;
}

function createNotification(config: NotificationConfig, type?: NotificationType): void {
  const placement = config.placement ?? globalConfig.placement ?? 'topRight';
  const container = initContainer(placement);
  const key = config.key ?? `notification-${Date.now()}-${Math.random()}`;
  const typeStyles = getNotificationTypeStyles(type);

  const notification = document.createElement('div');
  notification.className = `max-w-md w-80 shadow-lg rounded-lg border p-4 flex gap-3 ${typeStyles.bg} ${typeStyles.border}`;
  if (config.className) notification.className += ` ${config.className}`;
  if (config.style) Object.assign(notification.style, config.style);

  const iconDiv = document.createElement('div');
  iconDiv.className = `flex-shrink-0 w-6 h-6 rounded-full bg-current flex items-center justify-center text-white text-sm font-bold ${typeStyles.text}`;
  iconDiv.textContent = typeStyles.icon;
  notification.appendChild(iconDiv);

  const content = document.createElement('div');
  content.className = 'flex-1';
  if (config.message) {
    const title = document.createElement('div');
    title.className = `font-semibold ${typeStyles.text}`;
    title.textContent = String(config.message);
    content.appendChild(title);
  }
  if (config.description) {
    const desc = document.createElement('div');
    desc.className = `text-sm ${typeStyles.text} opacity-80 mt-1`;
    desc.textContent = String(config.description);
    content.appendChild(desc);
  }
  notification.appendChild(content);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'flex-shrink-0 text-gray-400 hover:text-gray-600';
  closeBtn.innerHTML = '✕';
  closeBtn.onclick = () => {
    config.onClose?.();
    destroyNotification(key);
  };
  notification.appendChild(closeBtn);

  const duration = config.duration ?? globalConfig.duration ?? 4.5;
  if (duration > 0) {
    setTimeout(() => {
      config.onClose?.();
      destroyNotification(key);
    }, duration * 1000);
  }

  container.appendChild(notification);
  activeNotifications.set(key, notification);
}

function destroyNotification(key: string): void {
  const notification = activeNotifications.get(key);
  if (notification?.parentNode) {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.parentNode?.removeChild(notification);
      activeNotifications.delete(key);
      if (notificationContainer && activeNotifications.size === 0) {
        notificationContainer.remove();
        notificationContainer = null;
      }
    }, 300);
  } else {
    activeNotifications.delete(key);
  }
}

const apolloNotification: NotificationInstance = {
  open: (config) => createNotification(config),
  success: (config) => createNotification(config, 'success'),
  error: (config) => createNotification(config, 'error'),
  info: (config) => createNotification(config, 'info'),
  warning: (config) => createNotification(config, 'warning'),
  destroy: (key) => {
    if (key) {
      destroyNotification(key);
    } else {
      activeNotifications.forEach((_, k) => destroyNotification(k));
    }
  },
  config: (options: NotificationGlobalConfig) => {
    if (options.duration !== undefined) globalConfig.duration = options.duration;
    if (options.placement !== undefined) globalConfig.placement = options.placement;
    if (options.top !== undefined) globalConfig.top = options.top;
    if (options.bottom !== undefined) globalConfig.bottom = options.bottom;
    // Reset container to apply new placement on next notification
    if (notificationContainer && options.placement !== undefined) {
      notificationContainer.remove();
      notificationContainer = null;
    }
  },
};

export default apolloNotification;
