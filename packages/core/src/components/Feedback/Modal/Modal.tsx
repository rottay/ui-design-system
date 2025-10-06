import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps } from './types';

export const Modal: React.FC<ModalProps> = (props) => {
  return <AntModal {...props} />;
};

Modal.displayName = 'Modal';
