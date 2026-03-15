'use client';

/**
 * InvoiceTemplate - Pattern Component
 *
 * Engine-aware printable invoice document layout.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { InvoiceTemplateProps } from './types';

export type { InvoiceTemplateProps, InvoiceData, InvoiceCompany, InvoiceClient, InvoiceLineItem } from './types';

export const PatternInvoiceTemplate = createEngineComponent<InvoiceTemplateProps>(
  'PatternInvoiceTemplate',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
