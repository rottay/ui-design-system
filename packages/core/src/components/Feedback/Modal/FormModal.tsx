import React, { useState } from 'react';
import { Modal, Form } from 'antd';
import type { ModalProps } from './types';
import type { FormInstance } from 'antd';

export interface FormModalProps extends Omit<ModalProps, 'onOk'> {
  form?: FormInstance;
  onOk?: (values: any) => void | Promise<void>;
  onFinish?: (values: any) => void | Promise<void>;
  onFinishFailed?: (errorInfo: any) => void;
  preserveFormOnClose?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  form: externalForm,
  onOk,
  onFinish,
  onFinishFailed,
  preserveFormOnClose = false,
  children,
  afterClose,
  ...modalProps
}) => {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (onOk) {
        await onOk(values);
      }
      if (onFinish) {
        await onFinish(values);
      }

      setLoading(false);

      if (!preserveFormOnClose) {
        form.resetFields();
      }
    } catch (error) {
      setLoading(false);
      if (onFinishFailed) {
        onFinishFailed(error);
      }
    }
  };

  const handleAfterClose = () => {
    if (!preserveFormOnClose) {
      form.resetFields();
    }
    afterClose?.();
  };

  return (
    <Modal
      {...modalProps}
      onOk={handleOk}
      confirmLoading={loading}
      afterClose={handleAfterClose}
    >
      <Form form={form} layout="vertical">
        {children}
      </Form>
    </Modal>
  );
};

FormModal.displayName = 'FormModal';
