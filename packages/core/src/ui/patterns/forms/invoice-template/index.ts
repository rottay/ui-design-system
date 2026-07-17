'use client';

/**
 * @fileoverview InvoiceTemplate pattern -- engine-aware printable invoice
 * document layout with company/client info, line items, and totals.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { InvoiceTemplateProps } from './contracts';

export type { InvoiceTemplateProps, InvoiceData, InvoiceCompany, InvoiceClient, InvoiceLineItem } from './contracts';

export const PatternInvoiceTemplate = createEngineComponent<InvoiceTemplateProps>(
  'PatternInvoiceTemplate',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
