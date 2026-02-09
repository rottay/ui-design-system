'use client';

/**
 * EvOnboardingFlow - Venue Preset
 * Condensed single-column venue onboarding wizard with horizontal step bar,
 * zone capacity cards, amenities grid, venue summary, and completion state
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
  { key: 'info', label: 'Venue Info', description: 'Basic venue details', isComplete: true, isActive: false },
  { key: 'zones', label: 'Zones & Capacity', description: 'Define venue zones', isComplete: true, isActive: false },
  { key: 'amenities', label: 'Amenities', description: 'Select available amenities', isComplete: false, isActive: true },
  { key: 'safety', label: 'Safety & Compliance', description: 'Safety requirements', isComplete: false, isActive: false },
];

const MOCK_ZONES = [
  { name: 'Main Floor', capacity: 500, current: 320, type: 'general' },
  { name: 'VIP Lounge', capacity: 80, current: 45, type: 'vip' },
  { name: 'Backstage', capacity: 40, current: 18, type: 'restricted' },
  { name: 'Outdoor Terrace', capacity: 200, current: 120, type: 'general' },
  { name: 'Bar Area', capacity: 100, current: 75, type: 'general' },
  { name: 'Control Room', capacity: 10, current: 4, type: 'restricted' },
];

const MOCK_AMENITIES = [
  { name: 'Sound System', icon: '🔊', category: 'audio', enabled: true },
  { name: 'Stage Lighting', icon: '💡', category: 'lighting', enabled: true },
  { name: 'Projector', icon: '📽️', category: 'visual', enabled: false },
  { name: 'WiFi', icon: '📶', category: 'tech', enabled: true },
  { name: 'Parking', icon: '🅿️', category: 'facility', enabled: true },
  { name: 'Green Room', icon: '🎭', category: 'facility', enabled: false },
  { name: 'Catering Kitchen', icon: '🍽️', category: 'food', enabled: true },
  { name: 'Loading Dock', icon: '🚛', category: 'logistics', enabled: true },
  { name: 'First Aid Station', icon: '🏥', category: 'safety', enabled: true },
  { name: 'Coat Check', icon: '🧥', category: 'facility', enabled: false },
  { name: 'ATM', icon: '🏧', category: 'facility', enabled: false },
  { name: 'Accessible Entry', icon: '♿', category: 'accessibility', enabled: true },
];

const CATEGORY_OPTIONS = ['all', 'audio', 'lighting', 'visual', 'tech', 'facility', 'food', 'logistics', 'safety', 'accessibility'];

export const VenueEvOnboardingFlow = createPreset<EvOnboardingFlowProps>({
  name: 'EvOnboardingFlow.Venue',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvOnboardingFlowProps>) => {
    const { Box, Text } = primitives;
    const { steps: propSteps, currentStep = 2, onStepComplete, onFinish, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const steps = propSteps?.length ? propSteps : MOCK_STEPS;
    const [activeStep] = useState(currentStep);
    const [amenityFilter, setAmenityFilter] = useState<string>('all');
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [hoveredAmenity, setHoveredAmenity] = useState<string | null>(null);
    const [toggledAmenities, setToggledAmenities] = useState<Set<string>>(
      new Set(MOCK_AMENITIES.filter(a => a.enabled).map(a => a.name))
    );

    const completedCount = steps.filter(s => s.isComplete).length;
    const progressPct = Math.round((completedCount / steps.length) * 100);
    const isFinished = completedCount === steps.length;
    const progressBar = createProgressBarStyle(tokens, {
      percent: progressPct,
      color: isFinished ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500],
    });

    const totalCapacity = MOCK_ZONES.reduce((s, z) => s + z.capacity, 0);
    const enabledAmenities = toggledAmenities.size;

    const filteredAmenities = useMemo(() => {
      if (amenityFilter === 'all') return MOCK_AMENITIES;
      return MOCK_AMENITIES.filter(a => a.category === amenityFilter);
    }, [amenityFilter]);

    const toggleAmenity = (name: string) => {
      setToggledAmenities(prev => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'🏟️'} Venue Setup
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Step {activeStep + 1} of {steps.length} {'·'} {progressPct}% complete
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
            <div style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block' }}>{totalCapacity}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Total Capacity</Text>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>{enabledAmenities}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Amenities</Text>
            </div>
          </div>
        </div>

        {/* Horizontal Step Bar */}
        <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
            {steps.map((step, i) => (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  onClick={() => step.isComplete && onStepComplete?.(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: step.isComplete ? tokens.colors.successScale[50] : step.isActive ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${step.isComplete ? tokens.colors.successScale[200] : step.isActive ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                    cursor: step.isComplete ? 'pointer' : 'default',
                    flex: 1,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: tokens.borderRadius.full, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: step.isComplete ? tokens.colors.successScale[500] : step.isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                    color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0,
                  }}>
                    {step.isComplete ? '✓' : i + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: step.isActive ? tokens.colors.primaryScale[700] : step.isComplete ? tokens.colors.successScale[700] : tokens.colors.neutral[500], display: 'block', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{step.label}</Text>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: tokens.spacing[3], height: 2, backgroundColor: step.isComplete ? tokens.colors.successScale[300] : tokens.colors.neutral[200], flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
          <div style={progressBar.track}><div style={progressBar.fill} /></div>
        </div>

        {isFinished ? (
          /* Completion State */
          <div style={{ ...cardBase, padding: tokens.spacing[10], textAlign: 'center' as const }}>
            <Text style={{ fontSize: '64px', display: 'block', marginBottom: tokens.spacing[4] }}>{'🎉'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[2] }}>
              Venue Setup Complete!
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[6] }}>
              Your venue is configured with {MOCK_ZONES.length} zones and {enabledAmenities} amenities.
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3], maxWidth: 480, margin: '0 auto', marginBottom: tokens.spacing[6] }}>
              {[
                { label: 'Total Capacity', value: totalCapacity, color: tokens.colors.primaryScale[600] },
                { label: 'Active Zones', value: MOCK_ZONES.length, color: tokens.colors.successScale[600] },
                { label: 'Amenities', value: enabledAmenities, color: tokens.colors.infoScale[600] },
              ].map(s => (
                <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
                </div>
              ))}
            </div>
            <div onClick={() => onFinish?.({})} style={{ display: 'inline-block', padding: `${tokens.spacing[3]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', ...hoverStyle }}>
              Go to Dashboard
            </div>
          </div>
        ) : (
          <>
            {/* Zone Capacity Cards */}
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>{'📍'} Venue Zones</Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
                {MOCK_ZONES.map(zone => {
                  const fillPct = Math.round((zone.current / zone.capacity) * 100);
                  const zoneBar = createProgressBarStyle(tokens, {
                    percent: fillPct,
                    color: fillPct > 80 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500],
                  });
                  const isHovered = hoveredZone === zone.name;
                  return (
                    <div
                      key={zone.name}
                      onMouseEnter={() => setHoveredZone(zone.name)}
                      onMouseLeave={() => setHoveredZone(null)}
                      style={{
                        ...cardBase,
                        padding: tokens.spacing[3],
                        transition: `all ${tokens.motion.hover}`,
                        ...(isHovered ? { transform: 'translateY(-2px)', boxShadow: tokens.shadows.md } : {}),
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{zone.name}</Text>
                        <span style={createBadgeStyle(tokens, zone.type === 'vip' ? 'warning' : zone.type === 'restricted' ? 'error' : 'success')}>
                          {zone.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{zone.current}/{zone.capacity}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: fillPct > 80 ? tokens.colors.warningScale[600] : tokens.colors.successScale[600] }}>{fillPct}%</Text>
                      </div>
                      <div style={zoneBar.track}><div style={zoneBar.fill} /></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities Grid */}
            <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{'🏗️'} Amenities ({enabledAmenities}/{MOCK_AMENITIES.length} enabled)</Text>
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                {CATEGORY_OPTIONS.map(cat => (
                  <div key={cat} onClick={() => setAmenityFilter(cat)} style={createFilterPillStyle(tokens, { active: amenityFilter === cat })}>
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[2] }}>
                {filteredAmenities.map(amenity => {
                  const isEnabled = toggledAmenities.has(amenity.name);
                  const isHovered = hoveredAmenity === amenity.name;
                  return (
                    <div
                      key={amenity.name}
                      onClick={() => toggleAmenity(amenity.name)}
                      onMouseEnter={() => setHoveredAmenity(amenity.name)}
                      onMouseLeave={() => setHoveredAmenity(null)}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isEnabled ? tokens.colors.successScale[300] : tokens.colors.neutral[200]}`,
                        backgroundColor: isEnabled ? tokens.colors.successScale[50] : isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                        cursor: 'pointer',
                        textAlign: 'center' as const,
                        transition: `all ${tokens.motion.hover}`,
                        ...(isHovered ? { transform: 'scale(1.02)' } : {}),
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.xl, display: 'block', marginBottom: tokens.spacing[1] }}>{amenity.icon}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: isEnabled ? tokens.colors.successScale[700] : tokens.colors.neutral[600], display: 'block' }}>{amenity.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isEnabled ? tokens.colors.successScale[500] : tokens.colors.neutral[400] }}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </Text>
                    </div>
                  );
                })}
              </div>
              {filteredAmenities.length === 0 && (
                <div style={{ textAlign: 'center' as const, padding: tokens.spacing[6], color: tokens.colors.neutral[400] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No amenities in this category</Text>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
                {'←'} Previous
              </div>
              <div onClick={() => onStepComplete?.(activeStep)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
                Continue {'→'}
              </div>
            </div>
          </>
        )}
      </Box>
    );
  },
});
