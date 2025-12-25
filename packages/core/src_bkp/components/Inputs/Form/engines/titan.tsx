'use client';

/**
 * Titan Form Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Form as AntForm } from 'antd';
import type { FormProps, FormItemProps, FormInstance, FormValues } from '../types';

/**
 * Titan Form Component
 *
 * Uses Ant Design Form under the hood.
 */
function TitanForm<T extends FormValues = FormValues>(props: FormProps<T>) {
  return <AntForm<T> {...props} />;
}

/**
 * Titan Form.Item Component
 */
function TitanFormItem(props: FormItemProps) {
  return <AntForm.Item {...props} />;
}

// Attach Item to Form
TitanForm.Item = TitanFormItem;

// Export useForm hook
TitanForm.useForm = AntForm.useForm as <T extends FormValues = FormValues>() => [FormInstance<T>];

TitanForm.displayName = 'TitanForm';

export default TitanForm;
