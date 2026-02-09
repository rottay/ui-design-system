'use client';

/**
 * EvEventEditor - Wizard Preset
 * Multi-step wizard with step indicator, form fields, preview, prev/next navigation
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createSurfaceStyle,
} from '../../../helpers';
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
  render: ({ primitives, props, tokens, engine }: PresetContext<EvEventEditorProps>) => {
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

    const inputStyle = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.common.white,
      outline: 'none',
    };

    const labelStyle = {
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[600],
      display: 'block' as const,
      marginBottom: tokens.spacing[1],
    };

    const renderStepContent = () => {
      switch (activeStep) {
        case 0: // Event Details
          return (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              <div>
                <Text style={labelStyle}>{'\uD83C\uDFB5'} Event Name</Text>
                <input type="text" value={formData.name || ''} readOnly style={inputStyle} />
              </div>
              <div>
                <Text style={labelStyle}>{'\uD83D\uDCDD'} Description</Text>
                <textarea readOnly value={formData.description || ''} style={{ ...inputStyle, minHeight: 100, resize: 'vertical' as const }} />
              </div>
              <div>
                <Text style={labelStyle}>{'\uD83D\uDDBC\uFE0F'} Cover Image</Text>
                <div style={{ height: 120, borderRadius: tokens.borderRadius.md, border: `2px dashed ${tokens.colors.neutral[300]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.colors.neutral[50] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDCF7'} Click to upload or drag & drop</Text>
                </div>
              </div>
            </div>
          );
        case 1: // Dates & Venue
          return (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              <div>
                <Text style={labelStyle}>{'\uD83C\uDFDB\uFE0F'} Venue</Text>
                <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>Arena Complex</Text>
                  <span style={createBadgeStyle(tokens, 'success')}>{'\u2705'} Available</span>
                </div>
              </div>
              <Text style={{ ...labelStyle, marginBottom: 0 }}>{'\uD83D\uDCC5'} Event Dates</Text>
              {(formData.dates || []).map((d: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: tokens.spacing[3], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Date</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                      Day {i + 1} - {d.date instanceof Date ? d.date.toLocaleDateString() : String(d.date)}
                    </Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Start</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{d.startTime}</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>End</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{d.endTime}</Text>
                  </div>
                </div>
              ))}
              <div style={{ padding: `${tokens.spacing[2]}px`, textAlign: 'center' as const, borderRadius: tokens.borderRadius.md, border: `2px dashed ${tokens.colors.primaryScale[200]}`, color: tokens.colors.primaryScale[600], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
                + Add Another Date
              </div>
            </div>
          );
        case 2: // Tickets
          return (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              <Text style={{ ...labelStyle, marginBottom: 0 }}>{'\uD83C\uDFAB'} Ticket Types</Text>
              {(formData.ticketTypes || []).map((t: any, i: number) => (
                <div key={i} style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.common.white, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{t.name}</Text>
                    <span style={createBadgeStyle(tokens, i === 0 ? 'primary' : i === 1 ? 'warning' : 'error')}>
                      {i === 0 ? '\uD83C\uDFAB' : i === 1 ? '\u2B50' : '\uD83C\uDF1F'} {t.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Price</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>${t.price}</Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Quantity</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{t.quantity.toLocaleString()}</Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Revenue Potential</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>${(t.price * t.quantity).toLocaleString()}</Text>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: `${tokens.spacing[2]}px`, textAlign: 'center' as const, borderRadius: tokens.borderRadius.md, border: `2px dashed ${tokens.colors.primaryScale[200]}`, color: tokens.colors.primaryScale[600], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
                + Add Ticket Type
              </div>
              {/* Total revenue */}
              <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>{'\uD83D\uDCB0'} Total Revenue Potential</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[800] }}>
                    ${(formData.ticketTypes || []).reduce((s: number, t: any) => s + t.price * t.quantity, 0).toLocaleString()}
                  </Text>
                </div>
              </div>
            </div>
          );
        case 3: // Review
          return (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>
                {'\uD83D\uDD0D'} Review Your Event
              </Text>
              {/* Summary card */}
              <div style={{ padding: tokens.spacing[4], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Name</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{formData.name}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Venue</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>Arena Complex</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Dates</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{(formData.dates || []).length} day(s)</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Ticket Types</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{(formData.ticketTypes || []).length} types</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Total Capacity</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                      {(formData.ticketTypes || []).reduce((s: number, t: any) => s + t.quantity, 0).toLocaleString()} attendees
                    </Text>
                  </div>
                </div>
              </div>
              {/* Readiness checklist */}
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block' }}>{'\u2705'} Readiness Checklist</Text>
              {[
                { label: 'Event details completed', done: true },
                { label: 'Venue selected & confirmed', done: true },
                { label: 'Ticket types configured', done: true },
                { label: 'Cover image uploaded', done: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <div style={{ width: 20, height: 20, borderRadius: tokens.borderRadius.full, backgroundColor: item.done ? tokens.colors.successScale[100] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: item.done ? tokens.colors.successScale[600] : tokens.colors.neutral[400] }}>
                    {item.done ? '\u2713' : '\u2022'}
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: item.done ? tokens.colors.neutral[700] : tokens.colors.neutral[400], textDecoration: item.done ? 'none' : 'none' }}>{item.label}</Text>
                </div>
              ))}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\u270F\uFE0F'} Create Event
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Step {activeStep + 1} of {steps.length} - {steps[activeStep]?.label}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <div onClick={() => onSave?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
              {'\uD83D\uDCBE'} Save Draft
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: tokens.spacing[5] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Progress</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>{progressPct}% complete</Text>
          </div>
          <div style={progressBar.track}>
            <div style={progressBar.fill} />
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {steps.map((step, i) => {
              const isCurrent = i === activeStep;
              const isComplete = step.isComplete;
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1 }}>
                  <div
                    onClick={() => goToStep(i)}
                    style={{
                      width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isComplete ? tokens.colors.successScale[500] : isCurrent ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                      color: isComplete || isCurrent ? tokens.colors.common.white : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold,
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    {isComplete ? '\u2713' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div onClick={() => goToStep(i)} style={{ cursor: 'pointer' }}><Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: isCurrent ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500], display: 'block' }}>
                      {step.label}
                    </Text>
                  </div></div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 40, height: 2, backgroundColor: isComplete ? tokens.colors.successScale[300] : tokens.colors.neutral[200], marginRight: tokens.spacing[2] }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form content */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
            {steps[activeStep]?.label}
          </Text>
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            onClick={() => activeStep > 0 && goToStep(activeStep - 1)}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              backgroundColor: activeStep > 0 ? tokens.colors.neutral[100] : tokens.colors.neutral[50],
              color: activeStep > 0 ? tokens.colors.neutral[700] : tokens.colors.neutral[300],
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: activeStep > 0 ? 'pointer' : 'not-allowed',
              ...hoverStyle,
            }}
          >
            {'\u2190'} Previous
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {activeStep < steps.length - 1 ? (
              <div onClick={() => goToStep(activeStep + 1)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
                Next {'\u2192'}
              </div>
            ) : (
              <div onClick={() => onPublish?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
                {'\uD83D\uDE80'} Publish Event
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
