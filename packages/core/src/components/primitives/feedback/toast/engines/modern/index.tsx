'use client';

/**
 * @fileoverview Toast Modern Engine - Rottay Design System.
 *
 * The toast role of the Notifier: the Modern engine renders a toast as a
 * `ds-notifier` surface with `data-variant="toast"`, keeping the Toast public
 * contract (visibility, lifetime, action, pause on hover) on top of it.
 *
 * @module Toast/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect, useState } from 'react';
import type { ToastProps, ToastVariant } from '../../contracts';
import { TOAST_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NotifierItem, type NotifierTone } from '../../../notifier';

const TOAST_TONES: Record<ToastVariant, NotifierTone> = {
  default: 'neutral',
  primary: 'primary',
  secondary: 'secondary',
  gradient: 'gradient',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

export default function ModernToast(props: ToastProps): React.ReactElement | null {
  const i18n = useOptionalTranslation('common');
  const {
    variant = TOAST_DEFAULTS.variant,
    title,
    description,
    icon,
    duration = TOAST_DEFAULTS.duration,
    closable = TOAST_DEFAULTS.closable,
    onClose,
    action,
    visible = true,
    pauseOnHover = TOAST_DEFAULTS.pauseOnHover,
    showProgress = TOAST_DEFAULTS.showProgress,
    radius = 'md',
    shadow,
    children,
    className,
    style,
    id,
    'data-testid': dataTestId,
  } = props;

  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  if (!mounted) return null;

  return (
    <NotifierItem
      role="toast"
      tone={TOAST_TONES[variant as ToastVariant] ?? 'neutral'}
      title={title}
      description={description}
      icon={icon}
      closable={closable}
      closeLabel={i18n?.tOr('close', 'Close') ?? 'Close'}
      action={action}
      duration={duration}
      showProgress={showProgress}
      pauseOnHover={pauseOnHover}
      open={visible}
      onExited={() => {
        setMounted(false);
        onClose?.();
      }}
      announce="alert"
      radius={radius}
      elevated={shadow !== false}
      id={id}
      className={className}
      style={style}
      data-testid={dataTestId}
    >
      {children}
    </NotifierItem>
  );
}

ModernToast.displayName = 'ModernToast';
