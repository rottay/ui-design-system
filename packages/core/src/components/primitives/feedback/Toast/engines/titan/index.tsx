/**
 * Toast - Titan Engine (Ant Design)
 */

import React from 'react';
import { message } from 'antd';
import type { ToastProps } from '../types';
import { TOAST_DEFAULTS } from '../types';

export default function TitanToast(props: ToastProps): React.ReactElement {
  const {
    variant = TOAST_DEFAULTS.variant,
    title,
    description,
    duration = TOAST_DEFAULTS.duration,
    icon,
  } = props;

  React.useEffect(() => {
    const content = description || title;
    if (!content) return;

    const durationInSeconds = duration ? duration / 1000 : 0;

    switch (variant) {
      case 'success':
        message.success({ content, icon, duration: durationInSeconds });
        break;
      case 'error':
        message.error({ content, icon, duration: durationInSeconds });
        break;
      case 'warning':
        message.warning({ content, icon, duration: durationInSeconds });
        break;
      case 'info':
        message.info({ content, icon, duration: durationInSeconds });
        break;
      default:
        message.open({ content, icon, duration: durationInSeconds });
    }
  }, []);

  return <></>;
}
