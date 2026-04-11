'use client';

/**
 * @fileoverview InvoiceTemplate pattern -- engine-aware printable invoice
 * document layout with company/client info, line items, and totals.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { InvoiceTemplateProps } from './InvoiceTemplate.types';

export type { InvoiceTemplateProps, InvoiceData, InvoiceCompany, InvoiceClient, InvoiceLineItem } from './InvoiceTemplate.types';

export const PatternInvoiceTemplate = createEngineComponent<InvoiceTemplateProps>(
  'PatternInvoiceTemplate',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
