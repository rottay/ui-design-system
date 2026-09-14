'use client';

/**
 * @fileoverview Callout on the Modern engine - Rottay Design System.
 *
 * Callout is folded into Alert: the Modern engine renders the alert surface
 * with the callout's title, body and action tray. Urgent tones announce as an
 * alert, the rest as a status.
 *
 * @module Alert/Presentation/Callout
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { TONE_TO_VARIANT } from '@/foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { AlertType } from '../../contracts';
import { AlertSurface } from '../../runtime/surface';

/** The Callout contract as the alert surface reads it. */
export interface ModernCalloutProps {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  variant?: AlertType;
  title?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ModernCallout({
  tone,
  variant: variantProp = 'info',
  title,
  children,
  icon,
  closable = false,
  onClose,
  action,
  className,
  style,
}: ModernCalloutProps): React.ReactElement | null {
  const i18n = useOptionalTranslation('common');
  const variant: AlertType = tone ? TONE_TO_VARIANT[tone] : variantProp;

  return (
    <AlertSurface
      tone={variant}
      emphasis="subtle"
      title={title}
      description={children}
      icon={icon}
      action={action}
      closable={closable}
      closeLabel={i18n?.tOr('close', 'Close') ?? 'Close'}
      onClose={onClose}
      dismissKey={typeof children === 'string' || typeof children === 'number' ? children : null}
      announce={variant === 'warning' || variant === 'error' ? 'alert' : 'status'}
      className={className}
      style={style}
    />
  );
}

ModernCallout.displayName = 'Callout.Modern';
