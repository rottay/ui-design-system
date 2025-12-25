/**
 * Alert - Titan Engine (Ant Design)
 */

import React from 'react';
import { Alert as AntAlert } from 'antd';
import type { AlertProps } from '../types';
import { ALERT_DEFAULTS } from '../types';

export default function TitanAlert(props: AlertProps): React.ReactElement {
  const {
    type = ALERT_DEFAULTS.type,
    message,
    description,
    icon,
    showIcon = ALERT_DEFAULTS.showIcon,
    closable = ALERT_DEFAULTS.closable,
    onClose,
    className,
    style,
  } = props;

  return (
    <AntAlert
      type={type}
      message={message}
      description={description}
      icon={icon}
      showIcon={showIcon}
      closable={closable}
      onClose={onClose}
      className={className}
      style={style}
    />
  );
}
