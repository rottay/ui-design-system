/**
 * Alert - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import { forwardRef } from 'react';
import type { AlertProps } from '../types';

/**
 * Base Alert component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseAlert = forwardRef<HTMLDivElement, AlertProps>(
  (props, ref) => {
    const {
      className = '',
      style = {},
      children,
      // Destructure custom props to avoid spreading them onto HTML element
      type: _type,
      message: _message,
      description: _description,
      icon: _icon,
      showIcon: _showIcon,
      closable: _closable,
      onClose: _onClose,
      engine: _engine,
      id,
      'data-testid': dataTestId,
    } = props;

    return (
      <div
        ref={ref}
        className={`rottay-alert ${className}`}
        style={style}
        id={id}
        data-testid={dataTestId}
      >
        {children}
      </div>
    );
  }
);

BaseAlert.displayName = 'BaseAlert';
