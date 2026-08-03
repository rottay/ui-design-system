import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { PatternFilterBuilder } from '../filter-builder';
import type { FilterFieldDefinition, FilterGroup } from '../filter-builder';
import { PatternFormBuilder } from '../form-builder';
import type { FieldDef } from '../../../../foundation/contracts/runtime/components/patterns/core';
import { PatternStepWizard } from '../step-wizard';
import type { WizardStep } from '../step-wizard';
import { PatternInvoiceTemplate } from '../invoice-template';
import type { InvoiceData } from '../invoice-template';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-D/F -- the patterns/forms family (FilterBuilder,
// FormBuilder, StepWizard, InvoiceTemplate) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus component-private state attributes
// -- data-root/data-logic/data-field-type on FilterBuilder, data-active/
// data-completed/data-collapsed on FormBuilder and StepWizard, data-status
// on InvoiceTemplate, etc.) onto all four components under both engines
// without moving any paint. Per the checkpoint contract this cluster is SIX
// INDEPENDENT SKINS: each component owns its own private enum-to-style map,
// so the vocabularies below are intentionally NOT shared across components,
// matching FilterBuilder's `logic-toggle`/`value-input` having no relation
// to FormBuilder's `step-indicator` or InvoiceTemplate's `status-badge`.
//
// Every base component here renders through `createEngineComponent`'s
// Suspense-wrapped lazy engine loader, so a synchronous
// `container.querySelector(...)` right after `render()` can race the still-
// pending engine chunk -- same `waitForPart` idiom as
// NavigationBatch/StatusBatch.contract.test.tsx.
//
// Two REAL, PRE-EXISTING cross-engine gaps are asserted explicitly below
// rather than papered over (code over inventory): FormBuilder's rustic
// engine destructures `loading` but never branches on it (no skeleton, no
// `data-loading`), and FormBuilder's `readonly-value` switch exists only in
// the modern engine -- rustic expresses read-only mode via the native
// `readOnly` HTML attribute on the same live `value-input` controls it
// always renders.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('Forms-family data-part contract (WO-SKIN-06 checkpoint CK-D/F)', () => {
  describe('FilterBuilder', () => {
    const fields: FilterFieldDefinition[] = [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }] },
      { key: 'joined', label: 'Joined', type: 'date' },
      { key: 'active', label: 'Active', type: 'boolean' },
    ];

    const value: FilterGroup = {
      id: 'root',
      logic: 'and',
      rules: [
        { id: 'r1', field: 'name', operator: 'contains', value: 'ada' },
        {
          id: 'g1',
          logic: 'or',
          rules: [
            { id: 'r2', field: 'status', operator: 'equals', value: 'active' },
            { id: 'r3', field: 'joined', operator: 'equals', value: '2026-01-01' },
            { id: 'r4', field: 'age', operator: 'gt', value: 21 },
            { id: 'r5', field: 'active', operator: 'equals', value: true },
          ],
        },
      ],
    };

    it.each(ENGINES)(
      'stamps root/group(data-root)/logic-toggle(data-logic)/rule/rule-logic-label/field-select/' +
        'operator-select/value-input(data-field-type)/remove-button/add-rule-button/add-group-button/' +
        'add-filter-trigger(data-open)/clear-button under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <PatternFilterBuilder
            fields={fields}
            value={value}
            onChange={vi.fn()}
            allowGrouping
            showAddFilter
            showClear
            onClear={vi.fn()}
          />,
          engine,
        );

        await waitForPart(container, 'root');

        const groups = container.querySelectorAll('[data-part="group"]');
        expect(groups.length).toBeGreaterThanOrEqual(2);
        expect(container.querySelector('[data-part="group"][data-root="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="group"]:not([data-root])')).not.toBeNull();

        const logicToggle = container.querySelector('[data-part="logic-toggle"]');
        expect(logicToggle, `${engine}: nested group logic-toggle missing`).not.toBeNull();
        expect(logicToggle?.getAttribute('data-logic')).toBe('or');

        expect(container.querySelectorAll('[data-part="rule"]').length).toBe(5);
        expect(container.querySelector('[data-part="rule-logic-label"]')?.textContent).toBe('Where');

        const fieldPart = engine === 'modern' ? 'rule-field' : 'field-select';
        const operatorPart = engine === 'modern' ? 'rule-operator' : 'operator-select';
        const valuePart = engine === 'modern' ? 'rule-value' : 'value-input';
        expect(container.querySelectorAll(`[data-part="${fieldPart}"]`).length).toBe(5);
        expect(container.querySelectorAll(`[data-part="${operatorPart}"]`).length).toBe(5);

        const fieldTypes = new Set(
          Array.from(container.querySelectorAll(`[data-part="${valuePart}"]`)).map((el) =>
            el.getAttribute('data-field-type'),
          ),
        );
        for (const type of ['text', 'number', 'select', 'date', 'boolean']) {
          expect(fieldTypes.has(type), `${engine}: missing value-input for field-type "${type}"`).toBe(true);
        }

        expect(container.querySelectorAll('[data-part="remove-button"]').length).toBeGreaterThanOrEqual(5);
        expect(container.querySelectorAll('[data-part="add-rule-button"]').length).toBe(2);
        expect(container.querySelectorAll('[data-part="add-group-button"]').length).toBeGreaterThanOrEqual(1);

        const addFilterTrigger = container.querySelector('[data-part="add-filter-trigger"]');
        expect(addFilterTrigger).not.toBeNull();
        expect(addFilterTrigger?.getAttribute('data-open')).toBe('false');

        expect(container.querySelector('[data-part="clear-button"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('opens the add-filter dropdown: stamps add-filter-dropdown/add-filter-option under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PatternFilterBuilder
          fields={fields}
          value={{ id: 'root', logic: 'and', rules: [] }}
          onChange={vi.fn()}
          showAddFilter
        />,
        engine,
      );

      const trigger = await waitForPart(container, 'add-filter-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(container.querySelector('[data-part="add-filter-dropdown"]')).not.toBeNull();
      });
      expect(trigger.getAttribute('data-open')).toBe('true');
      expect(container.querySelector('[data-part="add-filter-dropdown"]')?.getAttribute('data-open')).toBe('true');
      expect(container.querySelectorAll('[data-part="add-filter-option"]').length).toBe(fields.length);
    });

    it.each(ENGINES)('stamps the loading root(data-loading)/spinner under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PatternFilterBuilder
          fields={fields}
          value={{ id: 'root', logic: 'and', rules: [] }}
          onChange={vi.fn()}
          loading
        />,
        engine,
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-loading')).toBe('true');
      if (engine === 'modern') {
        expect(container.querySelector('[data-part="spinner"]')).not.toBeNull();
      } else {
        // Rustic's loading state is text-only ("Loading...") -- no spinner
        // element exists to stamp, preserved byte-exact.
        expect(container.querySelector('[data-part="spinner"]')).toBeNull();
        expect(root.textContent).toContain('Loading');
      }
    });
  });

  describe('FormBuilder', () => {
    const stepFields: FieldDef[] = [
      { name: 'a', label: 'A', type: 'text' },
      { name: 'b', label: 'B', type: 'text' },
    ];

    it.each(ENGINES)(
      'steps layout: stamps active/completed step state under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <PatternFormBuilder
            fields={stepFields}
            layout="steps"
            stepLabels={['One', 'Two', 'Three']}
            currentStep={1}
            onStepChange={vi.fn()}
            onSubmit={vi.fn()}
          />,
          engine,
        );

        await waitForPart(container, 'root');

        if (engine === 'modern') {
          expect(container.querySelector('[data-part="item"][data-status="process"]')).not.toBeNull();
          expect(container.querySelector('[data-part="item"][data-status="finish"]')).not.toBeNull();
          expect(container.querySelectorAll('[data-part="step-list"] [data-part="label"]').length).toBe(3);
          expect(container.querySelectorAll('[data-part="step-list"] [data-part="trigger"]').length).toBe(3);
          expect(container.querySelector('[data-part="wizard-step-counter"]')?.textContent).toContain('Step 2 of 3');
        } else {
          // Rustic's step tab is a two-state (past-or-current vs future)
          // model, not three-state -- data-active is "true" for steps 0
          // AND 1 (i <= currentStep), preserved byte-exact, not unified
          // with modern's three-state model.
          const tabs = container.querySelectorAll('[data-part="step-tab"]');
          expect(tabs.length).toBe(3);
          expect(tabs[0].getAttribute('data-active')).toBe('true');
          expect(tabs[1].getAttribute('data-active')).toBe('true');
          expect(tabs[2].getAttribute('data-active')).toBe('false');
        }

        expect(container.querySelector('[data-part="wizard-prev-button"]')).not.toBeNull();
        expect(container.querySelector('[data-part="wizard-next-button"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('read-only mode under the %s engine', async (engine) => {
      const fields: FieldDef[] = [
        { name: 'color', label: 'Color', type: 'color' },
        { name: 'note', label: 'Note', type: 'text' },
      ];
      const { container } = renderWithEngine(
        <PatternFormBuilder
          fields={fields}
          readOnly
          values={{ color: '#4f46e5', note: 'hi' }}
          onSubmit={vi.fn()}
        />,
        engine,
      );

      await waitForPart(container, 'root');

      if (engine === 'modern') {
        // Modern owns a real read-only renderer -- readonly-value/
        // color-swatch are modern-only parts.
        expect(container.querySelectorAll('[data-part="readonly-value"]').length).toBeGreaterThanOrEqual(2);
        const swatch = container.querySelector('[data-part="color-swatch"]') as HTMLElement | null;
        expect(swatch, 'modern: color-swatch missing').not.toBeNull();
        // Category B (SKIN-EXEMPT-RUNTIME-VALUE): background is the raw
        // runtime value, never a token -- asserted here so a future edit
        // cannot silently move it onto a token without this test noticing.
        expect(swatch?.style.background).toBeTruthy();
        expect(swatch?.style.background ?? '').not.toContain('var(--ds-');
      } else {
        // Rustic has no separate read-only renderer -- it reuses the live
        // value-input controls with the native `readOnly` attribute. This
        // is a real, pre-existing engine gap (not this pre-step's to fix).
        expect(container.querySelector('[data-part="readonly-value"]')).toBeNull();
        const colorInput = container.querySelector('[data-part="value-input"][data-field-type="color"]');
        expect(colorInput, 'rustic: color value-input missing in readOnly mode').not.toBeNull();
      }
    });

    it.each(ENGINES)('default layout: stamps field/field-description/field-error/action-bar under the %s engine', async (engine) => {
      const fields: FieldDef[] = [
        {
          name: 'agree',
          label: 'Agree to terms',
          type: 'checkbox',
          required: true,
          description: 'You must agree to continue.',
        },
      ];
      const { container } = renderWithEngine(
        <PatternFormBuilder
          fields={fields}
          onSubmit={vi.fn()}
          actions={<button type="submit">Save</button>}
        />,
        engine,
      );

      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="field"]').length).toBe(1);
      expect(container.querySelector('[data-part="field-description"]')).not.toBeNull();
      expect(container.querySelector('[data-part="action-bar"]')).not.toBeNull();

      if (engine === 'rustic') {
        expect(container.querySelector('[data-part="field-label"]')).toBeNull(); // checkbox hides the outer label
        expect(container.querySelector('[data-part="value-input"][data-field-type="checkbox"]')).not.toBeNull();
      }

      const form = container.querySelector('form') as HTMLFormElement;
      expect(form).not.toBeNull();
      fireEvent.submit(form);

      await waitFor(() => {
        expect(container.querySelector('[data-part="field-error"]')).not.toBeNull();
      });
    });

    it.each(ENGINES)('loading: modern stamps data-loading/skeleton-bar; rustic has no loading branch (%s)', async (engine) => {
      const { container } = renderWithEngine(
        <PatternFormBuilder fields={stepFields} onSubmit={vi.fn()} loading />,
        engine,
      );

      await waitForPart(container, 'root');
      const root = container.querySelector('[data-part="root"]');

      if (engine === 'modern') {
        expect(root?.getAttribute('data-loading')).toBe('true');
        expect(container.querySelectorAll('[data-part="skeleton-bar"]').length).toBeGreaterThan(0);
      } else {
        // Pre-existing gap: rustic destructures `loading` but never
        // branches on it -- confirmed here, not fixed here.
        expect(root?.getAttribute('data-loading')).toBeNull();
        expect(container.querySelectorAll('[data-part="skeleton-bar"]').length).toBe(0);
      }
    });
  });

  describe('StepWizard', () => {
    const steps: WizardStep[] = [
      { key: 's1', title: 'One', content: <span>One</span> },
      { key: 's2', title: 'Two', description: 'Second step', content: <span>Two</span> },
      { key: 's3', title: 'Three', content: <span>Three</span>, optional: true },
      { key: 's4', title: 'Four', content: <span>Four</span> },
    ];

    it.each(ENGINES)(
      'horizontal, mid-step: stamps step/step-indicator/step-title/' +
        'step-connector(data-completed)/prev-button/skip-button/next-button under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <PatternStepWizard
            steps={steps}
            // index2 of 4 so both a completed connector (renderConnector's
            // `index < current` is true for the connector leading into
            // index1) and a next-button (index2 < length-1) coexist --
            // with only 3 steps this is unreachable (byte-exact quirk of
            // the source formula, not something this test should paper
            // over by shrinking the fixture instead).
            currentStep={2}
            onStepChange={vi.fn()}
            onComplete={vi.fn()}
            allowSkip
            orientation="horizontal"
          />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="step-rail"][data-orientation="horizontal"]')).not.toBeNull();
        if (engine === 'modern') {
          // Modern delegates the rail to the canonical Steps primitive.
          expect(container.querySelector('[data-part="item"][data-status="process"]')).not.toBeNull();
          expect(container.querySelector('[data-part="item"][data-status="finish"]')).not.toBeNull();
          expect(container.querySelectorAll('[data-part="step-rail"] [data-part="label"]').length).toBe(steps.length);
          expect(container.querySelectorAll('[data-part="step-rail"] [data-part="description"]').length).toBe(1);
        } else {
          expect(container.querySelector('[data-part="step"][data-active="true"]')).not.toBeNull();
          expect(container.querySelector('[data-part="step"][data-completed="true"]')).not.toBeNull();
          expect(container.querySelector('[data-part="step-indicator"][data-active="true"]')).not.toBeNull();
          expect(container.querySelector('[data-part="step-title"]')).not.toBeNull();
          expect(container.querySelector('[data-part="step-title"]')?.hasAttribute('data-completed')).toBe(false);
          expect(container.querySelectorAll('[data-part="step-connector"]').length).toBe(3);
          expect(container.querySelector('[data-part="step-connector"][data-completed="true"]')).not.toBeNull();
        }
        if (engine === 'modern') {
          // Modern composes the canonical Progress primitive. Its native
          // <progress> owns meter semantics; the legacy pattern-owned
          // track/fill anatomy must not return.
          expect(container.querySelector('[data-part="root"][data-type="line"]')).not.toBeNull();
          expect(container.querySelector('progress[data-part="fill"]')).not.toBeNull();
          expect(container.querySelector('[data-part="progress-track"]')).toBeNull();
          expect(container.querySelector('[data-part="progress-fill"]')).toBeNull();
        } else {
          expect(container.querySelector('[data-part="progress-track"]')).not.toBeNull();
          expect(container.querySelector('[data-part="progress-fill"]')).not.toBeNull();
        }
        expect(container.querySelector('[data-part="prev-button"]')).not.toBeNull();
        expect(container.querySelector('[data-part="skip-button"]')).not.toBeNull();
        expect(container.querySelector('[data-part="next-button"]')).not.toBeNull();
        expect(container.querySelector('[data-part="complete-button"]')).toBeNull();
      },
    );

    it.each(ENGINES)('last step: stamps complete-button, no next-button under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PatternStepWizard
          steps={steps}
          currentStep={steps.length - 1}
          onStepChange={vi.fn()}
          onComplete={vi.fn()}
        />,
        engine,
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="complete-button"]')).not.toBeNull();
      expect(container.querySelector('[data-part="next-button"]')).toBeNull();
      expect(container.querySelector('[data-part="prev-button"]')).not.toBeNull();
    });

    it.each(ENGINES)('vertical orientation: stamps step-rail/step-label-group/step-description under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PatternStepWizard
          steps={steps}
          currentStep={1}
          onStepChange={vi.fn()}
          onComplete={vi.fn()}
          orientation="vertical"
        />,
        engine,
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="step-rail"][data-orientation="vertical"]')).not.toBeNull();
      if (engine === 'modern') {
        expect(container.querySelector('[data-part="step-rail"] [data-part="description"]')?.textContent).toBe('Second step');
        expect(container.querySelectorAll('[data-part="step-rail"] [data-part="description"]').length).toBe(1);
      } else {
        expect(container.querySelector('[data-part="step-label-group"]')).not.toBeNull();
        expect(container.querySelector('[data-part="step-description"]')?.textContent).toBe('Second step');
      }
      expect(container.querySelector('[data-part="content"]')).not.toBeNull();
    });

    it.each(ENGINES)('stamps the loading root(data-loading)/skeleton-progress/skeleton-content under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PatternStepWizard steps={steps} onComplete={vi.fn()} loading />,
        engine,
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-loading')).toBe('true');
      expect(container.querySelector('[data-part="skeleton-progress"]')).not.toBeNull();
      expect(container.querySelector('[data-part="skeleton-content"]')).not.toBeNull();
    });
  });

  describe('InvoiceTemplate', () => {
    const invoice: InvoiceData = {
      number: 'INV-001',
      date: '2026-07-01',
      dueDate: '2026-07-15',
      currency: '$',
      company: {
        name: 'Rottay Inc.',
        address: '1 Market St',
        city: 'San Francisco',
        taxId: '94-1234567',
        email: 'billing@rottay.com',
      },
      client: {
        name: 'Acme Corp',
        address: '500 Main Ave',
        city: 'Austin',
        taxId: '74-7654321',
        email: 'ap@acme.example',
      },
      items: [
        { id: 'li-1', description: 'License', quantity: 1, unitPrice: 100, total: 100 },
        { id: 'li-2', description: 'Support', quantity: 2, unitPrice: 50, total: 100 },
      ],
      subtotal: 200,
      taxRate: 10,
      tax: 20,
      total: 220,
      status: 'paid',
      notes: 'Thank you.',
    };

    it.each(ENGINES)(
      'stamps root/header/company/metadata/bill-to/client/items-table/totals/notes under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <PatternInvoiceTemplate invoice={invoice} onPrint={vi.fn()} onExport={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="actions-bar"]')).not.toBeNull();
        expect(container.querySelector('[data-part="print-button"]')).not.toBeNull();
        expect(container.querySelector('[data-part="export-button"]')).not.toBeNull();
        expect(container.querySelector('[data-part="header"]')).not.toBeNull();
        expect(container.querySelector('[data-part="company-name"]')?.textContent).toBe('Rottay Inc.');
        expect(container.querySelectorAll('[data-part="company-address-line"]').length).toBe(4);
        expect(container.querySelector('[data-part="metadata"]')).not.toBeNull();
        expect(container.querySelector('[data-part="watermark"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="metadata-line"]').length).toBe(3);
        expect(container.querySelector('[data-part="status-badge"]')?.getAttribute('data-status')).toBe('paid');
        expect(container.querySelector('[data-part="bill-to"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="section-label"]').length).toBe(2); // Bill To + Notes
        expect(container.querySelector('[data-part="client-name"]')?.textContent).toBe('Acme Corp');
        expect(container.querySelectorAll('[data-part="client-address-line"]').length).toBe(4);
        expect(container.querySelector('[data-part="items-table"]')).not.toBeNull();
        expect(container.querySelector('[data-part="items-header-row"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="items-header-cell"]').length).toBe(5);
        expect(container.querySelectorAll('[data-part="items-row"]').length).toBe(2);
        expect(container.querySelectorAll('[data-part="items-cell"]').length).toBe(10);
        expect(container.querySelector('[data-part="totals"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="totals-row"]').length).toBe(3);
        expect(container.querySelector('[data-part="totals-row"][data-row="total"]')).not.toBeNull();
        expect(container.querySelector('[data-part="totals-divider"]')).not.toBeNull();
        expect(container.querySelector('[data-part="notes"]')).not.toBeNull();
        expect(container.querySelector('[data-part="notes-text"]')).not.toBeNull();

        if (engine === 'modern') {
          expect(container.querySelector('[data-part="items-table-wrapper"]')).not.toBeNull();
        }
      },
    );

    it.each(ENGINES)('stamps every data-status enum member on status-badge under the %s engine', async (engine) => {
      for (const status of ['draft', 'sent', 'paid', 'overdue'] as const) {
        const { container, unmount } = renderWithEngine(
          <PatternInvoiceTemplate
            invoice={{
              number: `INV-${status}`,
              date: '2026-07-01',
              company: { name: 'Rottay Inc.' },
              client: { name: 'Acme Corp' },
              items: [{ id: 'li-1', description: 'Item', quantity: 1, unitPrice: 10, total: 10 }],
              subtotal: 10,
              tax: 0,
              total: 10,
              status,
            }}
            showActions={false}
          />,
          engine,
        );

        const badge = await waitForPart(container, 'status-badge');
        expect(badge.getAttribute('data-status'), `${engine}: status-badge for "${status}"`).toBe(status);
        unmount();
      }
    });

    it.each(ENGINES)('stamps the loading root(data-loading)/spinner-or-loading-text under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PatternInvoiceTemplate
          invoice={{ number: 'INV-LOADING', date: '2026-07-01', company: { name: 'X' }, client: { name: 'Y' }, items: [], subtotal: 0, tax: 0, total: 0 }}
          loading
        />,
        engine,
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-loading')).toBe('true');

      if (engine === 'modern') {
        expect(container.querySelector('[data-part="spinner"]')).not.toBeNull();
      } else {
        expect(container.querySelector('[data-part="loading-text"]')).not.toBeNull();
      }
    });
  });
});
