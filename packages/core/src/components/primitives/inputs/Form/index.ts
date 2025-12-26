/**
 * Form - Engine Router
 *
 * Compound component with:
 * - Form.Item
 * - Form.List
 * - Form.ErrorList
 * - Form.useForm
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { FormProps } from './types';

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
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

// Re-export useForm from each engine
// Note: In a real multi-engine scenario, you'd want to import based on current engine
export { useForm } from './engines/titan';

// Export the Form component
// Note: Compound components (Form.Item, Form.List, etc.) are available
// when using the specific engine exports
export const Form = FormBase;
