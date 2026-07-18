import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { FormSections, FormFactsCard } from '../form-sections';
import { RecordSummaryStrip, RecordFieldGrid, RecordField, RecordActionBar, RecordPanel } from '../content';
import {
  InlineEditorGroup,
  InlineEditor,
  InlineEditGrid,
  InlineEditField,
  MoreFieldsToggle,
  InlineEditFooter,
} from '../edit-fields';
import { PatternApprovalWorkflow } from '../../../patterns/workflow/approval-workflow';
import type { ApprovalStep } from '../../../patterns/workflow/approval-workflow';
import { GuidedDraftFormSurface } from '../../../surfaces/presentation/pages/forms/guided-draft-form';
import type { FormSection } from '../../../surfaces/presentation/pages/forms/guided-draft-form';
import { FormSurface } from '../../../surfaces/presentation/pages/forms/form';
import { WizardSurface } from '../../../surfaces/presentation/pages/forms/wizard';
import { DetailFormSurface } from '../../../surfaces/presentation/pages/forms/detail-form';
import type { FormSurfaceConfig, WizardSurfaceConfig, DetailFormSurfaceConfig } from '../../../surfaces/foundation/contracts';
import { Input } from '../../../primitives';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-D/R -- record + workflow + form-surfaces
// (FormSections, FormFactsCard, record's five exports, edit-fields' eight
// exports, ApprovalWorkflow, GuidedDraftFormSurface, and the three
// composition-only surfaces FormSurface/WizardSurface/DetailFormSurface)
// data-part contract evidence.
//
// The pre-step stamps `data-part` (plus the state attributes each
// component's OWN map keys on: form-sections' tone + open/closed;
// approval-workflow's five statuses; record's field states; edit-fields'
// requirement/error; guided-draft-form's draft status + layout variant)
// without moving any paint. This file proves the stamp reached the DOM for
// each component; it does not assert paint (that is record-batch.spec.ts's
// job).
//
// form-sections/record/edit-fields/guided-draft-form/form/wizard/
// detail-form are engine-agnostic (one DOM tree under every engine), but
// several of them compose engine-switched leaf primitives (Button, Input,
// Select) that render through `createEngineComponent`'s Suspense-wrapped
// lazy engine loader -- same `waitForPart` idiom as NavigationBatch/
// StatusBatch/PickersBatch, needed even for the single-engine renders below.
// ApprovalWorkflow is genuinely engine-split (modern/rustic render
// different DOM), so it is exercised under both engines.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

// Short, explicit timeout: a missing part/class should fail in ~2s and NAME
// itself, not burn this repo's 30s `asyncUtilTimeout` (test-setup.ts) and
// report a generic "Test timed out" that reads as a hang.
const WAIT_TIMEOUT = 2000;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

/**
 * A surface owns no DOM of its own -- it owns composition. `Grid` (unlike
 * Box/Stack/Flex/Text) has no rest-spread in its own prop destructuring, and
 * `Card`/`Button` stamp their own `partAttributes(...)` after caller rest in
 * EVERY engine (pass-through honesty law: engines win on data-part), so none
 * of them forward a consumer-passed `data-part` to the DOM. A surface's
 * anatomy on a composed Grid/Card/Button is therefore carried by className,
 * never by data-part.
 */
async function waitForClass(container: HTMLElement, className: string): Promise<Element> {
  await waitFor(
    () => {
      if (!container.querySelector(`.${className}`)) {
        throw new Error(`expected .${className} in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`.${className}`) as Element;
}

describe('Record + workflow + form-surfaces data-part contract (WO-SKIN-06 checkpoint CK-D/R)', () => {
  describe('FormSections', () => {
    const sections = [
      { key: 'default', title: 'Default', tone: 'default' as const, required: true, children: <div>Default content</div> },
      { key: 'editorial', title: 'Editorial', tone: 'editorial' as const, optional: true, summary: 'Summary badge', children: <div>Editorial content</div> },
      { key: 'technical', title: 'Technical', tone: 'technical' as const, children: <div>Technical content</div> },
      { key: 'governance', title: 'Governance', tone: 'governance' as const, children: <div>Governance content</div> },
    ];

    it('stamps root/section(data-tone/data-open/data-appearance)/section-header/section-toggle(data-open)/section-chip(data-badge-tone)', async () => {
      const { container } = renderWithEngine(
        <FormSections sections={sections} collapsible activeKeys={['default', 'editorial']} onChange={vi.fn()} />,
        'modern',
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="section"][data-tone="default"][data-open="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section"][data-tone="editorial"][data-open="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section"][data-tone="technical"][data-open="false"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section"][data-tone="governance"][data-open="false"]')).not.toBeNull();
      expect(container.querySelectorAll('[data-part="section-header"]').length).toBe(4);
      expect(container.querySelector('[data-part="section-toggle"][data-open="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section-chip"][data-badge-tone="required"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section-chip"][data-badge-tone="optional"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section-summary"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section-index"]')).not.toBeNull();
      expect(container.querySelector('[data-part="section-title"]')).not.toBeNull();
    });

    it('non-collapsible: stamps section-header on a plain Box (not a button)', async () => {
      const { container } = renderWithEngine(
        <FormSections sections={sections.slice(0, 1)} />,
        'modern',
      );
      const header = await waitForPart(container, 'section-header');
      expect(header.tagName).not.toBe('BUTTON');
    });
  });

  describe('FormFactsCard', () => {
    it('stamps facts-card/facts-card-eyebrow/title/description/item/item-label/item-value/item-helper', async () => {
      const { container } = renderWithEngine(
        <FormFactsCard
          eyebrow="Summary"
          title="Account facts"
          description="Read-only facts"
          items={[{ label: 'Plan', value: 'Enterprise', helper: 'Renews annually' }]}
        />,
        'modern',
      );

      await waitForPart(container, 'facts-card');
      expect(container.querySelector('[data-part="facts-card-eyebrow"]')).not.toBeNull();
      expect(container.querySelector('[data-part="facts-card-title"]')).not.toBeNull();
      expect(container.querySelector('[data-part="facts-card-description"]')).not.toBeNull();
      expect(container.querySelector('[data-part="facts-card-item"]')).not.toBeNull();
      expect(container.querySelector('[data-part="facts-card-item-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="facts-card-item-value"]')).not.toBeNull();
      expect(container.querySelector('[data-part="facts-card-item-helper"]')).not.toBeNull();
    });
  });

  describe('RecordSummaryStrip', () => {
    const items = [{ label: 'Status', value: 'Active', helper: 'Since yesterday' }];

    it.each(['default', 'editorial', 'technical', 'governance', 'metrics'] as const)(
      'stamps summary-strip(data-variant=%s)/summary-item/summary-item-label/value/helper',
      async (variant) => {
        const { container } = renderWithEngine(<RecordSummaryStrip items={items} variant={variant} />, 'modern');

        const root = await waitForPart(container, 'summary-strip');
        expect(root.getAttribute('data-variant')).toBe(variant);
        expect(container.querySelector('[data-part="summary-item"]')).not.toBeNull();
        expect(container.querySelector('[data-part="summary-item-label"]')).not.toBeNull();
        expect(container.querySelector('[data-part="summary-item-value"]')).not.toBeNull();
        expect(container.querySelector('[data-part="summary-item-helper"]')).not.toBeNull();
      },
    );
  });

  describe('RecordFieldGrid + RecordField', () => {
    it('stamps field-grid/field(data-empty/data-mono)/field-label/field-helper', async () => {
      const { container } = renderWithEngine(
        <RecordFieldGrid>
          <RecordField label="Name" value="Ada Lovelace" helper="Legal name" />
          <RecordField label="Reference" value="REC-1" mono />
          <RecordField label="Notes" value={undefined} />
        </RecordFieldGrid>,
        'modern',
      );

      await waitForPart(container, 'field-grid');
      expect(container.querySelector('[data-part="field"][data-empty="false"][data-mono="false"]')).not.toBeNull();
      expect(container.querySelector('[data-part="field"][data-mono="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="field"][data-empty="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="field-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="field-helper"]')).not.toBeNull();
      await waitFor(() => {
        expect(container.querySelector('[data-part="field-value"]')).not.toBeNull();
      });
    });
  });

  describe('RecordActionBar', () => {
    it('stamps action-bar/action-bar-meta', async () => {
      const { container } = renderWithEngine(
        <RecordActionBar
          meta="3 unsaved changes"
          actionItems={[{ label: 'Save', variant: 'primary', onClick: vi.fn() }]}
        />,
        'modern',
      );

      await waitForPart(container, 'action-bar');
      expect(container.querySelector('[data-part="action-bar-meta"]')).not.toBeNull();
    });
  });

  describe('RecordPanel', () => {
    it('stamps panel', async () => {
      const { container } = renderWithEngine(<RecordPanel><div>content</div></RecordPanel>, 'modern');
      await waitForPart(container, 'panel');
    });
  });

  describe('edit-fields', () => {
    it('stamps group/editor(data-headerless)/editor-header/editor-icon/editor-eyebrow/editor-title/editor-description/editor-actions', async () => {
      const { container } = renderWithEngine(
        <InlineEditorGroup>
          <InlineEditor title="Profile" eyebrow="Section 01" description="Primary fields" actions={<span>action</span>}>
            <div>body</div>
          </InlineEditor>
        </InlineEditorGroup>,
        'modern',
      );

      await waitForPart(container, 'group');
      const editor = await waitForPart(container, 'editor');
      expect(editor.getAttribute('data-headerless')).toBe('false');
      expect(container.querySelector('[data-part="editor-header"]')).not.toBeNull();
      expect(container.querySelector('[data-part="editor-eyebrow"]')).not.toBeNull();
      expect(container.querySelector('[data-part="editor-title"]')).not.toBeNull();
      expect(container.querySelector('[data-part="editor-description"]')).not.toBeNull();
      expect(container.querySelector('[data-part="editor-actions"]')).not.toBeNull();
    });

    it('headerless: omits editor-header', async () => {
      const { container } = renderWithEngine(
        <InlineEditor title="Preferences" headerless><div>body</div></InlineEditor>,
        'modern',
      );
      const editor = await waitForPart(container, 'editor');
      expect(editor.getAttribute('data-headerless')).toBe('true');
      expect(container.querySelector('[data-part="editor-header"]')).toBeNull();
    });

    it('InlineEditGrid: stamps grid(data-kind/data-expanded) for primary and advanced', async () => {
      const { container } = renderWithEngine(
        <>
          <InlineEditGrid kind="primary"><div>primary</div></InlineEditGrid>
          <InlineEditGrid kind="advanced" expanded unmountWhenCollapsed={false}><div>advanced</div></InlineEditGrid>
        </>,
        'modern',
      );

      await waitFor(() => {
        expect(container.querySelectorAll('[data-part="grid"]').length).toBe(2);
      });
      expect(container.querySelector('[data-part="grid"][data-kind="primary"]')).not.toBeNull();
      expect(container.querySelector('[data-part="grid"][data-kind="advanced"][data-expanded="true"]')).not.toBeNull();
    });

    // `optional` is excluded here: `shouldShowRequirement` defaults to
    // `requirement !== 'optional'`, so the badge does not render for
    // 'optional' unless the caller passes `showRequirement` explicitly --
    // covered by the dedicated test below, not this loop.
    it.each(['required', 'recommended'] as const)(
      'InlineEditField: stamps field(data-requirement=%s)/field-label-row/field-label/field-requirement',
      async (requirement) => {
        const { container } = renderWithEngine(
          <InlineEditField label="Full name" requirement={requirement} htmlFor="probe-field">
            <Input id="probe-field" />
          </InlineEditField>,
          'modern',
        );

        const field = await waitForPart(container, 'field');
        expect(field.getAttribute('data-requirement')).toBe(requirement);
        expect(container.querySelector('[data-part="field-label-row"]')).not.toBeNull();
        expect(container.querySelector('[data-part="field-label"]')).not.toBeNull();
        expect(container.querySelector('[data-part="field-requirement"]')).not.toBeNull();
      },
    );

    it('InlineEditField: requirement="optional" omits field-requirement by default, shows it when showRequirement is forced', async () => {
      const { container } = renderWithEngine(
        <>
          <InlineEditField label="Bio" requirement="optional" htmlFor="probe-optional">
            <Input id="probe-optional" />
          </InlineEditField>
          <InlineEditField label="Nickname" requirement="optional" showRequirement htmlFor="probe-optional-forced">
            <Input id="probe-optional-forced" />
          </InlineEditField>
        </>,
        'modern',
      );

      await waitFor(() => {
        expect(container.querySelectorAll('[data-part="field"]').length).toBe(2);
      });
      expect(container.querySelectorAll('[data-part="field-requirement"]').length).toBe(1);
      expect(container.querySelector('[data-part="field"][data-requirement="optional"] [data-part="field-requirement"]')).not.toBeNull();
    });

    it('InlineEditField: stamps field(data-error=true)/field-error when hasError', async () => {
      const { container } = renderWithEngine(
        <InlineEditField label="Email" hasError errorMessage="Invalid email">
          <Input />
        </InlineEditField>,
        'modern',
      );

      const field = await waitForPart(container, 'field');
      expect(field.getAttribute('data-error')).toBe('true');
      expect(container.querySelector('[data-part="field-error"]')).not.toBeNull();
    });

    it('MoreFieldsToggle: stamps toggle(data-expanded/data-sticky)', async () => {
      const { container } = renderWithEngine(
        <MoreFieldsToggle expanded onToggle={vi.fn()} sticky />,
        'modern',
      );

      const toggle = await waitForPart(container, 'toggle');
      expect(toggle.getAttribute('data-expanded')).toBe('true');
      expect(toggle.getAttribute('data-sticky')).toBe('true');
    });

    it('InlineEditFooter: stamps footer(data-saving/data-error)/footer-support/footer-summary', async () => {
      const { container } = renderWithEngine(
        <InlineEditFooter error="Fix the errors" onCancel={vi.fn()} onSave={vi.fn()} isSaving />,
        'modern',
      );

      const footer = await waitForPart(container, 'footer');
      expect(footer.getAttribute('data-saving')).toBe('true');
      expect(footer.getAttribute('data-error')).toBe('true');
      expect(container.querySelector('[data-part="footer-support"]')).not.toBeNull();
      expect(container.querySelector('[data-part="footer-summary"]')).not.toBeNull();
    });
  });

  describe('ApprovalWorkflow', () => {
    const steps: ApprovalStep[] = [
      { key: 'a', approver: 'Approver A', status: 'approved' },
      { key: 'b', approver: 'Approver B', status: 'pending' },
      { key: 'c', approver: 'Approver C', status: 'skipped' },
      { key: 'd', approver: 'Approver D', status: 'rejected' },
      { key: 'e', approver: 'Approver E', status: 'escalated' },
    ];

    it.each(ENGINES)(
      'stamps root(data-loading)/header/title/timeline/step(data-status) for all 5 statuses under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <PatternApprovalWorkflow
            title="Expense report"
            entity="EXP-1"
            steps={steps}
            currentStep={1}
            onApprove={vi.fn()}
            onReject={vi.fn()}
            onEscalate={vi.fn()}
          />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-loading')).toBe('false');
        expect(container.querySelector('[data-part="header"]')).not.toBeNull();
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="timeline"]')).not.toBeNull();
        for (const status of ['approved', 'pending', 'skipped', 'rejected', 'escalated']) {
          expect(container.querySelector(`[data-part="step"][data-status="${status}"]`)).not.toBeNull();
        }
        expect(container.querySelector('[data-part="step"][data-current="true"][data-status="pending"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)(
      'stamps step-action-button(data-action) for approve/reject/escalate on the current pending step under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <PatternApprovalWorkflow
            title="Expense report"
            steps={[{ key: 'b', approver: 'Approver B', status: 'pending' }]}
            currentStep={0}
            onApprove={vi.fn()}
            onReject={vi.fn()}
            onEscalate={vi.fn()}
          />,
          engine,
        );

        await waitForPart(container, 'step-actions');
        expect(container.querySelector('[data-part="step-action-button"][data-action="approve"]')).not.toBeNull();
        expect(container.querySelector('[data-part="step-action-button"][data-action="reject"]')).not.toBeNull();
        expect(container.querySelector('[data-part="step-action-button"][data-action="escalate"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('loading: stamps root(data-loading=true)/skeleton under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PatternApprovalWorkflow title="Loading" steps={[]} loading />,
        engine,
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-loading')).toBe('true');
      expect(container.querySelector('[data-part="skeleton"]')).not.toBeNull();
    });
  });

  describe('GuidedDraftFormSurface', () => {
    const sections: FormSection[] = [
      { key: 'basics', title: 'Basics', render: () => <div>Basics</div>, isComplete: true },
      { key: 'details', title: 'Details', render: () => <div>Details</div>, hasErrors: true },
    ];

    it('stamps root(data-mode)/draft-status(data-status)/section-nav(data-layout)/section-nav-item(data-active/data-complete/data-errors)/submit-bar', async () => {
      const { container } = renderWithEngine(
        <GuidedDraftFormSurface
          title="New posting"
          sections={sections}
          draftStatus="saving"
          onSubmit={vi.fn()}
          adaptive={{ desktop: { formLayout: 'sidebar-nav' } }}
        />,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-mode')).toBe('scroll');
      const draftStatus = await waitForPart(container, 'draft-status');
      expect(draftStatus.getAttribute('data-status')).toBe('saving');
      const nav = await waitForPart(container, 'section-nav');
      expect(nav.getAttribute('data-layout')).toBe('sidebar');
      // section-nav-item is a Button primitive -- its own `partAttributes`
      // spread wins over any consumer-passed `data-part` (same rule as
      // RecordField's copy button / SelectionPreviewRail's close button),
      // so it is addressed by className, not data-part.
      expect(container.querySelector('.ds-guided-draft-form__section-nav-item[data-active="true"]')).not.toBeNull();
      expect(container.querySelector('.ds-guided-draft-form__section-nav-item[data-complete="true"]')).not.toBeNull();
      expect(container.querySelector('.ds-guided-draft-form__section-nav-item[data-errors="true"]')).not.toBeNull();
      // section-card is a Card primitive (composed, not self-rendered) --
      // same className-not-data-part rule as validation-summary below.
      await waitForClass(container, 'ds-guided-draft-form__section-card--active');
      await waitForClass(container, 'ds-guided-draft-form__section-card--complete');
      await waitForClass(container, 'ds-guided-draft-form__section-card--errors');
      expect(container.querySelector('[data-part="section-card-title"]')).not.toBeNull();
      expect(container.querySelector('[data-part="submit-bar"]')).not.toBeNull();
    });

    it.each([
      ['pill-nav', 'pills'],
      ['dropdown-nav', 'dropdown'],
    ] as const)('forces section-nav data-layout via adaptive.formLayout=%s', async (formLayout, expectedLayout) => {
      const { container } = renderWithEngine(
        <GuidedDraftFormSurface
          title="New posting"
          sections={sections}
          onSubmit={vi.fn()}
          adaptive={{ desktop: { formLayout } }}
        />,
        'modern',
      );

      const nav = await waitForPart(container, 'section-nav');
      expect(nav.getAttribute('data-layout')).toBe(expectedLayout);
    });

    it('stamps validation-summary via className (Card composed, not a self-rendered part) when validationIssues are present', async () => {
      const { container } = renderWithEngine(
        <GuidedDraftFormSurface
          title="New posting"
          sections={sections}
          onSubmit={vi.fn()}
          validationIssues={[{ field: 'Title', message: 'Required', severity: 'error' }]}
        />,
        'modern',
      );

      await waitForClass(container, 'ds-guided-draft-form__validation-summary');
      await waitForClass(container, 'ds-guided-draft-form__validation-summary--error');
      expect(container.querySelector('[data-part="validation-summary-title"]')).not.toBeNull();
    });
  });

  describe('FormSurface / WizardSurface / DetailFormSurface', () => {
    // FormSurface/WizardSurface/DetailFormSurface own no DOM of their own --
    // they compose Grid/Stack/Card. Grid has no rest-spread in its own prop
    // destructuring, and Card stamps its own data-part after caller rest in
    // every engine, so neither forwards a consumer-passed
    // data-part to the DOM (confirmed for both engines of each), so their
    // anatomy is the className already on them (`ds-surface ds-form` /
    // `ds-wizard` / `ds-detail-form`, `ds-form__error-card`, etc.), never a
    // data-part attribute. Asserting `[data-part='root']` here would give a
    // FALSE PASS by matching Card's own unrelated internal `root` stamp
    // instead of proving this surface's own root landed -- verified by a
    // raw DOM dump: querying [data-part="root"] found Card's stamp, not the
    // Grid's (Grid drops it silently; tsc does not catch this because
    // BaseComponentProps types data-part broadly across the fleet).
    it('FormSurface: stamps root(className)/error-card(className)', async () => {
      const config: FormSurfaceConfig = {
        visual: {},
        presentation: { chrome: { title: 'Create record' }, error: <div>error</div> },
        behavior: { fields: [], submitAction: { id: 'submit', label: 'Submit', onClick: vi.fn() } },
      };
      const { container } = renderWithEngine(<FormSurface config={config} />, 'modern');

      await waitForClass(container, 'ds-form');
      await waitForClass(container, 'ds-form__error-card');
    });

    it('WizardSurface: stamps root(className)/error-card(className)', async () => {
      const config: WizardSurfaceConfig = {
        visual: {},
        presentation: { chrome: { title: 'Setup flow' }, error: <div>error</div> },
        behavior: {
          steps: [{ key: 'review', title: 'Review', content: <div>Review</div> }],
          submitAction: { id: 'complete', label: 'Complete', onClick: vi.fn() },
        },
      };
      const { container } = renderWithEngine(<WizardSurface config={config} />, 'modern');

      await waitForClass(container, 'ds-wizard');
      await waitForClass(container, 'ds-wizard__error-card');
    });

    // `config.visual.layout: 'stacked'` short-circuits the layout decision
    // regardless of breakpoint -- a deterministic way to force the Stack
    // branch without depending on jsdom's default viewport.
    it('DetailFormSurface: stamps root(className, stacked layout)/error-card(className)', async () => {
      const config: DetailFormSurfaceConfig = {
        visual: { layout: 'stacked' },
        presentation: { chrome: { title: 'Edit workspace' }, summary: <div>summary</div>, error: <div>error</div> },
        behavior: { fields: [], submitAction: { id: 'save', label: 'Save', onClick: vi.fn() } },
      };
      const { container } = renderWithEngine(<DetailFormSurface config={config} />, 'modern');

      await waitForClass(container, 'ds-detail-form--stacked');
      await waitForClass(container, 'ds-detail-form__error-card');
    });

    // `stackOnMobile`/`stackOnTablet: false` opt out of the responsive
    // stacking fallback regardless of jsdom's default breakpoint, forcing
    // the Grid branch -- the other deterministic override
    // useSurfaceResponsiveLayout exposes (no `adaptive` prop here, unlike
    // GuidedDraftFormSurface).
    it('DetailFormSurface: stamps root(className, split layout)/error-card(className)', async () => {
      const config: DetailFormSurfaceConfig = {
        visual: { stackOnMobile: false, stackOnTablet: false },
        presentation: { chrome: { title: 'Edit workspace' }, summary: <div>summary</div>, error: <div>error</div> },
        behavior: { fields: [], submitAction: { id: 'save', label: 'Save', onClick: vi.fn() } },
      };
      const { container } = renderWithEngine(<DetailFormSurface config={config} />, 'modern');

      await waitForClass(container, 'ds-detail-form--split');
      await waitForClass(container, 'ds-detail-form__error-card');
    });
  });
});
