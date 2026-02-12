'use client';

/**
 * EvEventEditor - Wizard Preset
 * Composes PatternFormBuilder with steps layout for multi-step event creation
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { PatternFormBuilder, PatternStatsGrid } from '../../../../patterns';
import type { FieldDef, StatDef } from '../../../../patterns';
import { createCardStyle, createHoverStyle, createBadgeStyle, createProgressBarStyle } from '../../../helpers';
import type { EvEventEditorProps, EditorStep } from '../../core';

const MOCK_STEPS: EditorStep[] = [
  { key: 'details', label: 'Event Details', isComplete: true, isActive: false },
  { key: 'dates', label: 'Dates & Venue', isComplete: true, isActive: false },
  { key: 'tickets', label: 'Tickets', isComplete: false, isActive: true },
  { key: 'review', label: 'Review & Publish', isComplete: false, isActive: false },
];

const MOCK_FORM = {
  name: 'Summer Music Festival',
  description: 'The biggest outdoor music festival of the summer featuring top artists from around the world. Three stages, food vendors, and art installations.',
  venueId: 'arena-complex',
  dates: [{ date: new Date('2026-06-20'), startTime: '14:00', endTime: '23:00' }, { date: new Date('2026-06-21'), startTime: '12:00', endTime: '23:00' }],
  ticketTypes: [
    { name: 'General Admission', price: 45, quantity: 3000 },
    { name: 'VIP', price: 120, quantity: 500 },
    { name: 'Backstage Pass', price: 250, quantity: 100 },
  ],
};

export const WizardEvEventEditor = createPreset<EvEventEditorProps>({
  name: 'EvEventEditor.Wizard',
  render: ({ primitives, props, tokens }: PresetContext<EvEventEditorProps>) => {
    const { Box, Text } = primitives;
    const { steps: propSteps, formData: propForm, currentStep: propStep, onStepChange, onSave, onPublish, className, style } = props;

    const steps = propSteps && propSteps.length > 0 ? propSteps : MOCK_STEPS;
    const formData = propForm && propForm.name ? propForm : MOCK_FORM;

    const [activeStep, setActiveStep] = useState(propStep ?? 2);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const completedSteps = steps.filter(s => s.isComplete).length;
    const progressPct = Math.round((completedSteps / steps.length) * 100);
    const progressBar = useMemo(() => createProgressBarStyle(tokens, { percent: progressPct }), [tokens, progressPct]);

    const goToStep = (idx: number) => { setActiveStep(idx); onStepChange?.(idx); };

    // Build fields for each step
    const stepFields: FieldDef[][] = useMemo(() => [
      // Step 0: Event Details
      [
        { name: 'name', label: 'Event Name', type: 'text' as const, required: true, defaultValue: formData.name },
        { name: 'description', label: 'Description', type: 'textarea' as const, required: true, defaultValue: formData.description },
        { name: 'coverImage', label: 'Cover Image', type: 'file' as const },
      ],
      // Step 1: Dates & Venue
      [
        { name: 'venueId', label: 'Venue', type: 'select' as const, options: [{ label: 'Arena Complex', value: 'arena-complex' }], defaultValue: formData.venueId },
      ],
      // Step 2: Tickets (custom rendering needed)
      [
        { name: 'ticketTypes', label: 'Ticket Types', type: 'custom' as const, render: () => null },
      ],
      // Step 3: Review
      [],
    ], [formData]);

    const stepLabels = useMemo(() => steps.map(s => s.label), [steps]);

    const totalRevPotential = (formData.ticketTypes || []).reduce((s: number, t: any) => s + t.price * t.quantity, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Create Event
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Step {activeStep + 1} of {steps.length} - {steps[activeStep]?.label}
            </Text>
          </div>
          <div onClick={() => onSave?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
            Save Draft
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: tokens.spacing[5] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Progress</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>{progressPct}% complete</Text>
          </div>
          <div style={progressBar.track}><div style={progressBar.fill} /></div>
        </div>

        {/* Step indicator */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {steps.map((step, i) => {
              const isCurrent = i === activeStep;
              const isComplete = step.isComplete;
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1 }}>
                  <div onClick={() => goToStep(i)} style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isComplete ? tokens.colors.successScale[500] : isCurrent ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200], color: isComplete || isCurrent ? tokens.colors.common.white : tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', flexShrink: 0 }}>
                    {isComplete ? '\u2713' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div onClick={() => goToStep(i)} style={{ cursor: 'pointer' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: isCurrent ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500], display: 'block' }}>
                        {step.label}
                      </Text>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 40, height: 2, backgroundColor: isComplete ? tokens.colors.successScale[300] : tokens.colors.neutral[200], marginRight: tokens.spacing[2] }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form content - use PatternFormBuilder for applicable steps */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
            {steps[activeStep]?.label}
          </Text>
          {activeStep <= 1 && (
            <PatternFormBuilder
              fields={stepFields[activeStep]}
              layout="vertical"
              initialValues={formData as Record<string, unknown>}
              onSubmit={() => goToStep(activeStep + 1)}
              showLabels
              showRequired
            />
          )}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
              {(formData.ticketTypes || []).map((t: any, i: number) => (
                <div key={i} style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.common.white, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[2] }}>{t.name}</Text>
                  <PatternStatsGrid
                    stats={[
                      { key: `price-${i}`, label: 'Price', value: `$${t.price}`, color: tokens.colors.successScale[700] },
                      { key: `qty-${i}`, label: 'Quantity', value: t.quantity.toLocaleString() },
                      { key: `rev-${i}`, label: 'Revenue Potential', value: `$${(t.price * t.quantity).toLocaleString()}`, color: tokens.colors.primaryScale[700] },
                    ]}
                    columns={3}
                    variant="outlined"
                  />
                </div>
              ))}
              <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>Total Revenue Potential</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[800] }}>
                    ${totalRevPotential.toLocaleString()}
                  </Text>
                </div>
              </div>
            </div>
          )}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <PatternStatsGrid
                stats={[
                  { key: 'name', label: 'Name', value: formData.name || '' },
                  { key: 'venue', label: 'Venue', value: 'Arena Complex' },
                  { key: 'dates', label: 'Dates', value: `${(formData.dates || []).length} day(s)` },
                  { key: 'capacity', label: 'Total Capacity', value: (formData.ticketTypes || []).reduce((s: number, t: any) => s + t.quantity, 0).toLocaleString() },
                ]}
                columns={2}
                variant="outlined"
              />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => activeStep > 0 && goToStep(activeStep - 1)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: activeStep > 0 ? tokens.colors.neutral[100] : tokens.colors.neutral[50], color: activeStep > 0 ? tokens.colors.neutral[700] : tokens.colors.neutral[300], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: activeStep > 0 ? 'pointer' : 'not-allowed', ...hoverStyle }}>
            Previous
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {activeStep < steps.length - 1 ? (
              <div onClick={() => goToStep(activeStep + 1)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
                Next
              </div>
            ) : (
              <div onClick={() => onPublish?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
                Publish Event
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
