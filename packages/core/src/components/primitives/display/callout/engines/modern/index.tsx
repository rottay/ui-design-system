'use client';

/**
 * @fileoverview Callout Modern Engine - Rottay Design System.
 *
 * Callout is folded into Alert: the Modern engine renders the alert surface
 * with the callout's title, body and action tray. Urgent tones announce as an
 * alert, the rest as a status.
 *
 * @module Callout/Engines/Modern
 * @category Display
 * @package @rottay/design-system
 */

import React from 'react';
import type { CalloutProps } from '../../contracts';
import { CALLOUT_DEFAULTS, TONE_TO_CALLOUT_VARIANT } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { AlertSurface } from '../../../../feedback/alert/presentation/surface';

export default function ModernCallout(props: CalloutProps): React.ReactElement | null {
  const i18n = useOptionalTranslation('common');
  const {
    tone,
    variant: variantProp = CALLOUT_DEFAULTS.variant,
    title,
    children,
    icon,
    closable = CALLOUT_DEFAULTS.closable,
    onClose,
    action,
    className,
    style,
  } = props;
  const variant = tone ? TONE_TO_CALLOUT_VARIANT[tone] : variantProp;

  return (
    <AlertSurface
      tone={variant}
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
