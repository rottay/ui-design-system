'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { FormProps, FormValues, FormItemProps, FormInstance } from './types';
import TitanForm from './engines/titan';

/**
 * Form Component
 *
 * Multi-engine form that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Form (default, full featured)
 * - hermes: DaisyUI-based form (lazy loaded)
 * - apollo: Native HTML + Tailwind form (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Form onFinish={(values) => console.log(values)}>
 *   <Form.Item name="username" label="Username" rules={[{ required: true }]}>
 *     <Input />
 *   </Form.Item>
 *   <Form.Item name="password" label="Password" rules={[{ required: true }]}>
 *     <Input type="password" />
 *   </Form.Item>
 *   <Button type="submit">Submit</Button>
 * </Form>
 *
 * // With useForm hook
 * const [form] = Form.useForm();
 *
 * <Form form={form} onFinish={handleSubmit}>
 *   <Form.Item name="email" rules={[{ type: 'email' }]}>
 *     <Input />
 *   </Form.Item>
 * </Form>
 *
 * // Horizontal layout
 * <Form layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
 *   <Form.Item name="field" label="Field">
 *     <Input />
 *   </Form.Item>
 * </Form>
 * ```
 */
const FormBase = createEngineComponent<FormProps>(
  {
    titan: TitanForm,
    hermes: lazyEngine(() =>
      import('./engines/hermes').then((m) => ({
        default: m.default,
      }))
    ),
    apollo: lazyEngine(() =>
      import('./engines/apollo').then((m) => ({
        default: m.default,
      }))
    ),
    athena: lazyEngine(() =>
      import('./engines/athena').then((m) => ({
        default: m.default,
      }))
    ),
  },
  { displayName: 'Form' }
);

// Export Form with Item and useForm attached
// Note: In actual usage, the engine's Item and useForm are used
// This is a simplified export that relies on the default titan engine
export const Form = Object.assign(FormBase, {
  Item: TitanForm.Item,
  useForm: TitanForm.useForm,
}) as typeof FormBase & {
  Item: React.FC<FormItemProps>;
  useForm: <T extends FormValues = FormValues>() => [FormInstance<T>];
};
