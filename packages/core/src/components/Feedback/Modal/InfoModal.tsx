import React from 'react';
import { Modal } from 'antd';
import type { ModalProps } from './types';

export interface InfoModalProps extends ModalProps {
  variant?: 'default' | 'large' | 'centered';
}

export const InfoModal: React.FC<InfoModalProps> = ({
  variant = 'default',
  footer = null,
  ...props
}) => {
  const modalProps: ModalProps = {
    ...props,
    footer,
  };

  if (variant === 'large') {
    modalProps.width = 800;
  }

  if (variant === 'centered') {
    modalProps.centered = true;
  }

  return <Modal {...modalProps} />;
};

InfoModal.displayName = 'InfoModal';
