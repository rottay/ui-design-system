'use client';

/**
 * @fileoverview Form Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Form component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Form component, providing enterprise-grade
 * features including async validation, rich feedback icons, and scroll-to-error.
 *
 * **Ant Design Features Utilized:**
 * - Full form validation with async support
 * - Layout modes (horizontal, vertical, inline)
 * - Label/wrapper column configuration
 * - Form.Item with hasFeedback icons
 * - Form.List for dynamic fields
 * - Form.ErrorList for error display
 * - scrollToFirstError for UX
 * - useForm hook with full API
 *
 * **Prop Mapping:**
 * - Direct pass-through to Ant Design Form props
 * - `size="default"` → `size="middle"` (Ant Design naming)
 * - Validation rules are passed directly to Ant Design
 *
 * **Compound Components:**
 * - `Form.Item` - Wraps Ant Design Form.Item
 * - `Form.List` - Wraps Ant Design Form.List
 * - `Form.ErrorList` - Wraps Ant Design Form.ErrorList
 * - `Form.useForm` - Re-exports Ant Design useForm
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Form, Input, useForm } from '@rottay/design-system';
 *
 * const [form] = useForm();
 *
 * <Form
 *   engine="classic"
 *   form={form}
 *   layout="horizontal"
 *   labelCol={{ span: 6 }}
 *   wrapperCol={{ span: 18 }}
 *   onFinish={handleSubmit}
 * >
 *   <Form.Item
 *     name="email"
 *     label="Email"
 *     rules={[{ required: true, type: 'email' }]}
 *     hasFeedback
 *   >
 *     <Input />
 *   </Form.Item>
 * </Form>
 * ```
 *
 * @see {@link Form} for the main component
 * @see {@link ModernForm} for DaisyUI implementation
 * @see {@link RusticForm} for vanilla implementation
 * @module ClassicForm
 * @category Inputs
 * @package @rottay/design-system
 */

import {
  ClassicFormBase,
  ClassicFormErrorList,
  ClassicFormItem,
  ClassicFormList,
  useForm,
} from './foundation';

export { useForm } from './foundation';

/**
 * Classic Form compound component assembled via Object.assign.
 *
 * Attaching sub-components (Item, List, ErrorList, useForm) directly onto the
 * base Form component allows the familiar `<Form.Item>` JSX pattern without
 * requiring separate imports for each piece.
 *
 * @param props - Ant Design Form props passed through to `ClassicFormBase`
 * @returns A fully-featured form element backed by Ant Design
 */
export const Form = Object.assign(ClassicFormBase, {
  Item: ClassicFormItem,
  List: ClassicFormList,
  ErrorList: ClassicFormErrorList,
  useForm,
});

export default Form;
