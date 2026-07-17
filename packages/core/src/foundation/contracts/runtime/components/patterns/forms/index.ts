import type { ReactNode } from 'react';

export type FormBuilderLayout = 'vertical' | 'horizontal' | 'grid' | 'steps';

export type FormBuilderRenderField<TField = unknown> = (
  field: TField,
  defaultRender: ReactNode,
  value: unknown,
) => ReactNode;

export type StepWizardOrientation = 'horizontal' | 'vertical';
