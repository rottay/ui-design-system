/**
 * Titan Alert Engine
 *
 * Adapter that converts unified AlertProps to Ant Design Alert.
 */

'use client';

import { Alert as AntAlert } from 'antd';
import type { AlertProps } from '../../../../types/components/alert';

/**
 * Titan Alert - Ant Design implementation with unified AlertProps
 */
function TitanAlert({
  type,
  message,
  description,
  showIcon,
  closable,
  onClose,
  icon,
  className,
  style,
  id,
  banner,
  closeText,
  action,
  afterClose,
  closeIcon,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: AlertProps) {
  return (
    <AntAlert
      type={type}
      message={message}
      description={description}
      showIcon={showIcon}
      closable={closable}
      onClose={onClose}
      icon={icon}
      className={className}
      style={style}
      id={id}
      banner={banner}
      closeText={closeText}
      action={action}
      afterClose={afterClose}
      closeIcon={closeIcon}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    />
  );
}

TitanAlert.displayName = 'TitanAlert';

export default TitanAlert;
