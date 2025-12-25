'use client';

import { Button as AntButton } from 'antd';
import type { ButtonProps } from '../types';

/**
 * Titan Button (Ant Design)
 *
 * Full-featured button component using Ant Design.
 * Supports all standard button props including variants, sizes, states.
 */
export const TitanButton: React.FC<ButtonProps> = ({
  fullWidth = false,
  style,
  ...rest
}) => {
  return (
    <AntButton
      style={{
        width: fullWidth ? '100%' : undefined,
        ...style,
      }}
      {...rest}
    />
  );
};

TitanButton.displayName = 'TitanButton';
export default TitanButton;
