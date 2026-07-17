/**
 * @fileoverview Form Compound Components - Rottay Design System
 * @description Compound components that extend Form functionality.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * Form compound components are exported directly from each engine implementation
 * rather than from this barrel file. This is because Form.Item, Form.List, and
 * Form.ErrorList require tight integration with the engine-specific form context.
 *
 * **Available Compound Components (via engine exports):**
 * - `Form.Item` - Wraps form fields with label, validation, and feedback
 * - `Form.List` - Manages dynamic lists of fields
 * - `Form.ErrorList` - Displays validation errors
 * - `Form.useForm` - Hook for programmatic form control
 *
 * **Usage:**
 * Access compound components via the Form component after importing:
 * ```tsx
 * import { Form } from '@rottay/design-system';
 *
 * <Form>
 *   <Form.Item name="field" label="Label">
 *     <Input />
 *   </Form.Item>
 * </Form>
 * ```
 *
 * @see {@link Form} for the main component
 * @see {@link FormItem} for field wrapper
 * @see {@link FormList} for dynamic fields
 * @see {@link FormErrorList} for error display
 * @module FormCompound
 * @category Inputs
 * @package @rottay/design-system
 */

// Note: Form compound components (Form.Item, Form.List, Form.ErrorList, useForm)
// are exported directly from each engine implementation
export {};
