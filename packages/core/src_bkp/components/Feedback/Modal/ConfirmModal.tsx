import { Modal } from 'antd';
import type { ModalFuncProps } from 'antd';

export interface ConfirmModalProps extends ModalFuncProps {
  type?: 'confirm' | 'info' | 'success' | 'error' | 'warning';
}

export const ConfirmModal = {
  show: (props: ConfirmModalProps) => {
    const { type = 'confirm', ...restProps } = props;

    switch (type) {
      case 'info':
        return Modal.info(restProps);
      case 'success':
        return Modal.success(restProps);
      case 'error':
        return Modal.error(restProps);
      case 'warning':
        return Modal.warning(restProps);
      case 'confirm':
      default:
        return Modal.confirm(restProps);
    }
  },
  confirm: (props: ModalFuncProps) => Modal.confirm(props),
  info: (props: ModalFuncProps) => Modal.info(props),
  success: (props: ModalFuncProps) => Modal.success(props),
  error: (props: ModalFuncProps) => Modal.error(props),
  warning: (props: ModalFuncProps) => Modal.warning(props),
  destroyAll: Modal.destroyAll,
};
