'use client';

/**
 * @fileoverview Domain-free FormSurface fixture for the tenant-theme preview.
 *
 * Renders a generic detail-edit form (a handful of labelled fields, a described
 * aside, and a submit/cancel action cluster) so a compiled tenant theme visibly
 * re-skins a real form surface -- input chrome, control radius, button style,
 * label rhythm -- inside the preview scope. It uses only generic vocabulary
 * (record name, summary, category, priority) and knows nothing about tenants,
 * candidates, roles, companies, interviews, or events.
 *
 * @remarks
 * Preview fixture, not product code: it lives under a `fixtures/` container so it
 * may compose the surface tier for demonstration only.
 */

import type { FormSurfaceConfig } from '@/ui/surfaces';
import { FormSurface } from '@/ui/surfaces';
import { Text } from '@/ui/primitives';

const noop = (): void => undefined;

const CONFIG: FormSurfaceConfig = {
  visual: { layout: 'grid', columns: 2, maxWidth: 640 },
  presentation: {
    chrome: { title: 'Edit record', subtitle: 'Detail form' },
    description: 'A generic detail-edit form rendered under the previewed theme.',
    aside: <Text size="xs">Changes are scoped to this preview.</Text>,
  },
  behavior: {
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Record name', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Short summary', colSpan: 2 },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Priority', value: 'priority' },
        ],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'High', value: 'high' },
        ],
      },
      { name: 'active', label: 'Active', type: 'switch' },
    ],
    initialValues: { name: 'Alpha workspace', category: 'priority', priority: 'high', active: true },
    submitAction: { id: 'save', label: 'Save changes', variant: 'primary', onClick: noop },
    cancelAction: { id: 'cancel', label: 'Cancel', onClick: noop },
  },
};

/** A themed detail-edit form surface for the live preview scope. */
export function FormDetailPreviewFixture(): React.ReactElement {
  return <FormSurface config={CONFIG} />;
}
