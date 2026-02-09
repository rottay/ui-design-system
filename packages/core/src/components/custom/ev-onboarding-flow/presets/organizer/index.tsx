'use client';

/**
 * EvOnboardingFlow - Organizer Preset
 * Multi-step onboarding wizard for event organizers with vertical progress stepper,
 * team setup form, help tips sidebar, and completion celebration
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvOnboardingFlowProps, OnboardingStep } from '../../core';

const MOCK_STEPS: OnboardingStep[] = [
  { key: 'profile', label: 'Organization Profile', description: 'Tell us about your organization', isComplete: true, isActive: false },
  { key: 'events', label: 'Event Types', description: 'What kind of events do you organize?', isComplete: true, isActive: false },
  { key: 'team', label: 'Team Setup', description: 'Invite your team members', isComplete: false, isActive: true },
  { key: 'payment', label: 'Payment Setup', description: 'Configure payment processing', isComplete: false, isActive: false },
  { key: 'review', label: 'Review & Launch', description: 'Review your settings and go live', isComplete: false, isActive: false },
];

const TEAM_MEMBERS = [
  { name: 'Daniel A.', email: 'daniel@events.co', role: 'Admin', status: 'active' },
  { name: 'Sofia M.', email: 'sofia@events.co', role: 'Manager', status: 'pending' },
  { name: 'Marco P.', email: 'marco@events.co', role: 'Coordinator', status: 'pending' },
];

const HELP_TIPS = [
  { title: 'Team Roles', description: 'Admins have full access, Managers can manage events, Coordinators handle day-to-day operations.' },
  { title: 'Invitations', description: 'Team members will receive an email invitation to join your organization on the platform.' },
  { title: 'Permissions', description: 'You can customize permissions for each role after completing onboarding.' },
];

export const OrganizerEvOnboardingFlow = createPreset<EvOnboardingFlowProps>({
  name: 'EvOnboardingFlow.Organizer',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvOnboardingFlowProps>) => {
    const { Box, Text } = primitives;
    const { steps: propSteps, currentStep = 2, onStepComplete, onFinish, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const steps = propSteps?.length ? propSteps : MOCK_STEPS;
    const [activeStep] = useState(currentStep);
    const [hoveredTip, setHoveredTip] = useState<number | null>(null);

    const completedCount = steps.filter(s => s.isComplete).length;
    const progressPct = Math.round((completedCount / steps.length) * 100);
    const progressBar = createProgressBarStyle(tokens, { percent: progressPct, color: progressPct === 100 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500] });
    const isFinished = completedCount === steps.length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'🚀'} Organizer Onboarding
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Step {activeStep + 1} of {steps.length} {'·'} {progressPct}% complete
            </Text>
          </div>
          <div style={{ minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Progress</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{completedCount}/{steps.length}</Text>
            </div>
            <div style={progressBar.track}><div style={progressBar.fill} /></div>
          </div>
        </div>

        {isFinished ? (
          <div style={{ ...cardBase, padding: tokens.spacing[10], textAlign: 'center' as const }}>
            <Text style={{ fontSize: '64px', display: 'block', marginBottom: tokens.spacing[4] }}>{'🎉'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[2] }}>Welcome to the Platform!</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[6] }}>Your organizer account is all set up and ready to go.</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4], maxWidth: 500, margin: '0 auto', marginBottom: tokens.spacing[6] }}>
              {[
                { label: 'Create Event', emoji: '📅', desc: 'Launch your first event' },
                { label: 'Invite Staff', emoji: '👥', desc: 'Build your team' },
                { label: 'Sell Tickets', emoji: '🎫', desc: 'Start selling' },
              ].map(a => (
                <div key={a.label} style={{ ...cardBase, padding: tokens.spacing[4], cursor: 'pointer', textAlign: 'center' as const, ...hoverStyle }}>
                  <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{a.emoji}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{a.label}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{a.desc}</Text>
                </div>
              ))}
            </div>
            <div onClick={() => onFinish?.({})} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', display: 'inline-block', ...hoverStyle }}>
              Go to Dashboard
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: tokens.spacing[5] }}>
            {/* Step Progress Sidebar */}
            <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[4] }}>Steps</Text>
              {steps.map((step, i) => (
                <div key={step.key} style={{ display: 'flex', gap: tokens.spacing[3], marginBottom: tokens.spacing[3], cursor: 'pointer' }} onClick={() => step.isComplete && onStepComplete?.(i)}>
                  <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: step.isComplete ? tokens.colors.successScale[500] : step.isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: step.isComplete || step.isActive ? tokens.colors.common.white : tokens.colors.neutral[500], flexShrink: 0 }}>
                    {step.isComplete ? '✓' : i + 1}
                  </div>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: step.isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: step.isActive ? tokens.colors.primaryScale[700] : step.isComplete ? tokens.colors.neutral[900] : tokens.colors.neutral[500], display: 'block' }}>{step.label}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{step.description}</Text>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Step Form */}
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
                {steps[activeStep]?.label || 'Team Setup'}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[5] }}>
                {steps[activeStep]?.description || 'Invite your team members'}
              </Text>

              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>Team Members</Text>
              {TEAM_MEMBERS.map(m => (
                <div key={m.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, marginBottom: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{m.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{m.email}</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, 'info')}>{m.role}</span>
                    <span style={createBadgeStyle(tokens, m.status === 'active' ? 'success' : 'warning')}>{m.status}</span>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[3] }}>
                <input type="email" placeholder="Email address..." style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
                <select style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white }}>
                  <option>Coordinator</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
                <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>Invite</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[6] }}>
                <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>{'←'} Previous</div>
                <div onClick={() => onStepComplete?.(activeStep)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>Continue {'→'}</div>
              </div>
            </div>

            {/* Help Tips Sidebar */}
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>{'💡'} Tips</Text>
              {HELP_TIPS.map((tip, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredTip(i)}
                  onMouseLeave={() => setHoveredTip(null)}
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[3],
                    marginBottom: tokens.spacing[2],
                    backgroundColor: hoveredTip === i ? tokens.colors.infoScale[50] : tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${hoveredTip === i ? tokens.colors.infoScale[200] : tokens.colors.neutral[200]}`,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{tip.title}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{tip.description}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </Box>
    );
  },
});
