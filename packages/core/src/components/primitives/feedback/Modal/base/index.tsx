'use client';
import React, { forwardRef } from 'react';
import type { ModalProps } from '../types';

export const BaseModal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-modal ${className}`} style={style} {...rest}>{children}</div>;
});
BaseModal.displayName = 'BaseModal';
