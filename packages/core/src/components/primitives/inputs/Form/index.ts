'use client';

/**
 * @fileoverview Form - Rottay Design System
 * @description Form component for handling user input, validation, and submission.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Form component provides a comprehensive solution for building forms with
 * validation, state management, and accessibility. It supports multiple layouts,
 * validation rules, and integrates with all input components in the design system.
 *
 * **Multi-Engine Architecture:**
 * - **Classic** (Ant Design): Full-featured form with async validation and rich feedback
 * - **Modern** (DaisyUI/Tailwind): Lightweight form with custom validation
 * - **Rustic** (Vanilla HTML/CSS): Headless form with full accessibility
 *
 * **Multi-Tenant Support:**
 * Form appearance adapts to tenant themes via CSS custom properties
 * (--form-*), ensuring consistent branding across tenants.
 *
 * **Compound Components:**
 * - `Form.Item` - Individual form field wrapper with label, validation, and feedback
 * - `Form.List` - Dynamic list of fields with add/remove operations
 * - `Form.ErrorList` - Displays validation errors for a field or entire form
 *
 * **useForm Hook:**
 * Provides programmatic control over form state, validation, and submission.
 *
 * @example Basic Usage
 * ```tsx
 * import { Form, Input, Button, useForm } from '@rottay/design-system';
 *
 * function MyForm() {
 *   const [form] = useForm();
 *
 *   const onFinish = (values) => {
 *     console.log('Success:', values);
 *   };
 *
 *   return (
 *     <Form form={form} onFinish={onFinish} layout="vertical">
 *       <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
 *         <Input placeholder="Enter email" />
 *       </Form.Item>
 *       <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
 *         <Input type="password" placeholder="Enter password" />
 *       </Form.Item>
 *       <Button type="submit" variant="primary">Submit</Button>
 *     </Form>
 *   );
 * }
 * ```
 *
 * @example With Validation Rules
 * ```tsx
 * import { Form, Input } from '@rottay/design-system';
 *
 * <Form.Item
 *   name="username"
 *   label="Username"
 *   rules={[
 *     { required: true, message: 'Username is required' },
 *     { min: 3, message: 'Must be at least 3 characters' },
 *     { max: 20, message: 'Must be at most 20 characters' },
 *     { pattern: /^[a-z0-9_]+$/, message: 'Only lowercase letters, numbers, and underscores' },
 *   ]}
 * >
 *   <Input placeholder="Enter username" />
 * </Form.Item>
 * ```
 *
 * @example Dynamic Field List
 * ```tsx
 * import { Form, Input, Button } from '@rottay/design-system';
 *
 * <Form.List name="users">
 *   {(fields, { add, remove }) => (
 *     <>
 *       {fields.map(({ key, name }) => (
 *         <div key={key}>
 *           <Form.Item name={[name, 'name']} rules={[{ required: true }]}>
 *             <Input placeholder="Name" />
 *           </Form.Item>
 *           <Button onClick={() => remove(name)}>Remove</Button>
 *         </div>
 *       ))}
 *       <Button onClick={() => add()}>Add User</Button>
 *     </>
 *   )}
 * </Form.List>
 * ```
 *
 * @see {@link FormItem} for individual form fields
 * @see {@link FormList} for dynamic field lists
 * @see {@link useForm} for programmatic form control
 * @module Form
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { FormProps, FormItemProps, FormListProps, FormErrorListProps } from './types';

// Import compound components from Classic engine (they work across all engines)
import { Form as ClassicForm } from './engines/classic';

export {
  type FormProps,
  type FormItemProps,
  type FormListProps,
  type FormErrorListProps,
  type FormInstance,
  type FormLayout,
  type FormSize,
  type FormLabelAlign,
  type FormRequiredMark,
  type FormRule,
  type FieldData,
  type FormListFieldData,
  type FormListOperation,
  FORM_DEFAULTS,
  FORM_ITEM_DEFAULTS,
} from './types';

// Create the base Form component with engine routing
const FormBase = createEngineComponent<FormProps>('Form', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

// Re-export useForm from each engine
// Note: In a real multi-engine scenario, you'd want to import based on current engine
export { useForm } from './engines/classic';

// Export the Form component with compound components attached
// Compound components (Item, List, ErrorList) are attached from the Classic engine
// They work with any engine since they render children normally
export const Form = Object.assign(FormBase, {
  Item: ClassicForm.Item,
  List: ClassicForm.List,
  ErrorList: ClassicForm.ErrorList,
  useForm: ClassicForm.useForm,
});
