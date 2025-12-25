import React, { useState } from 'react';
import { Drawer, Form, Space, Button } from 'antd';
import type { DrawerProps } from 'antd';
import type { FormInstance } from 'antd';

export interface FormDrawerProps extends Omit<DrawerProps, 'onClose'> {
  form?: FormInstance;
  onFinish?: (values: any) => void | Promise<void>;
  onFinishFailed?: (errorInfo: any) => void;
  onClose?: () => void;
  submitText?: string;
  cancelText?: string;
  preserveFormOnClose?: boolean;
  showFooter?: boolean;
}

export const FormDrawer: React.FC<FormDrawerProps> = ({
  form: externalForm,
  onFinish,
  onFinishFailed,
  onClose,
  submitText = 'Submit',
  cancelText = 'Cancel',
  preserveFormOnClose = false,
  showFooter = true,
  children,
  footer,
  afterOpenChange,
  ...drawerProps
}) => {
  const [internalForm] = Form.useForm();
  const formInstance = externalForm || internalForm;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await formInstance.validateFields();
      setLoading(true);

      if (onFinish) {
        await onFinish(values);
      }

      setLoading(false);

      if (!preserveFormOnClose) {
        formInstance.resetFields();
      }

      onClose?.();
    } catch (error) {
      setLoading(false);
      if (onFinishFailed) {
        onFinishFailed(error);
      }
    }
  };

  const handleClose = () => {
    if (!preserveFormOnClose) {
      formInstance.resetFields();
    }
    onClose?.();
  };

  const handleAfterOpenChange = (open: boolean) => {
    if (!open && !preserveFormOnClose) {
      formInstance.resetFields();
    }
    afterOpenChange?.(open);
  };

  const defaultFooter = showFooter ? (
    <Space>
      <Button onClick={handleClose}>{cancelText}</Button>
      <Button type="primary" onClick={handleSubmit} loading={loading}>
        {submitText}
      </Button>
    </Space>
  ) : null;

  return (
    <Drawer
      {...drawerProps}
      onClose={handleClose}
      afterOpenChange={handleAfterOpenChange}
      footer={footer !== undefined ? footer : defaultFooter}
    >
      <Form form={formInstance} layout="vertical">
        {children}
      </Form>
    </Drawer>
  );
};

FormDrawer.displayName = 'FormDrawer';
