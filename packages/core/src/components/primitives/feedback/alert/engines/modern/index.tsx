'use client';

/**
 * @fileoverview Alert Modern Engine - Rottay Design System.
 *
 * Renders the alert surface with the message line, the description, compound
 * children and an optional dismiss; the modern alert skin paints it.
 *
 * @module Alert/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { AlertProps, AlertType } from '../../contracts';
import { ALERT_DEFAULTS, TONE_TO_ALERT_TYPE } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { AlertSurface } from '../../presentation/surface';

export default function ModernAlert(props: AlertProps): React.ReactElement | null {
  const i18n = useOptionalTranslation('common');
  const {
    tone,
    type = ALERT_DEFAULTS.type as AlertType,
    icon,
    showIcon = ALERT_DEFAULTS.showIcon,
    message,
    description,
    children,
    action,
    compact = ALERT_DEFAULTS.compact,
    closable = ALERT_DEFAULTS.closable,
    onClose,
    className,
    style,
  } = props;

  return (
    <AlertSurface
      tone={tone ? TONE_TO_ALERT_TYPE[tone] : type}
      title={message}
      description={description}
      icon={icon}
      showIcon={showIcon}
      action={action}
      compact={compact}
      closable={closable}
      closeLabel={i18n?.tOr('close', 'Close') ?? 'Close'}
      onClose={onClose}
      dismissKey={typeof message === 'string' || typeof message === 'number' ? message : null}
      announce="alert"
      className={className}
      style={style}
    >
      {children}
    </AlertSurface>
  );
}

ModernAlert.displayName = 'Alert.Modern';
