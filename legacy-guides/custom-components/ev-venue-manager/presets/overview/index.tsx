'use client';

/**
 * EvVenueManager - Overview Preset
 * Venue info header, zone status grid with capacity bars, stage cards, alerts panel
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvVenueManagerProps } from '../../core';

export const OverviewEvVenueManager = createPreset<EvVenueManagerProps>({
  name: 'EvVenueManager.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvVenueManagerProps>) => {
    const { Box, Text } = primitives;

    const {
      venue,
      zones,
      stages,
      alerts,
      onZoneClick,
      onAlertDismiss,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    const mockVenue = venue || {
      id: 'v1',
      name: 'Arena Complex',
      address: '1200 Festival Blvd, Austin TX 78701',
      totalCapacity: 4400,
      currentOccupancy: 2975,
      zonesCount: 4,
      status: 'open' as const,
    };

    const mockZones = zones?.length ? zones : [
      { id: 'z1', name: 'Main Floor', capacity: 3000, currentCount: 2100, accessLevel: 'General', isActive: true },
      { id: 'z2', name: 'VIP Lounge', capacity: 500, currentCount: 380, accessLevel: 'VIP', isActive: true },
      { id: 'z3', name: 'Beer Garden', capacity: 800, currentCount: 450, accessLevel: 'General', isActive: true },
      { id: 'z4', name: 'Backstage', capacity: 100, currentCount: 45, accessLevel: 'Staff Only', isActive: true },
    ];

    const mockStages = stages?.length ? stages : [
      { id: 's1', name: 'Main Stage', zone: 'Main Floor', isActive: true, currentAct: 'Aurora Beats', nextAct: 'DJ Nova', nextTime: new Date('2026-02-08T22:00:00') },
      { id: 's2', name: 'Side Stage', zone: 'Beer Garden', isActive: true, currentAct: 'The Velvet Band', nextAct: 'MC Flux', nextTime: new Date('2026-02-08T21:30:00') },
      { id: 's3', name: 'DJ Booth', zone: 'VIP Lounge', isActive: false, currentAct: undefined, nextAct: 'Synthwave Sally', nextTime: new Date('2026-02-08T23:00:00') },
    ];

    const mockAlerts = alerts?.length ? alerts : [
      { id: 'a1', type: 'capacity' as const, message: 'Main Floor approaching 70% capacity', severity: 'medium' as const, time: new Date(Date.now() - 5 * 60000) },
      { id: 'a2', type: 'maintenance' as const, message: 'VIP bar tap 3 needs replacement', severity: 'low' as const, time: new Date(Date.now() - 18 * 60000) },
      { id: 'a3', type: 'security' as const, message: 'Unauthorized access attempt at Backstage gate B', severity: 'high' as const, time: new Date(Date.now() - 2 * 60000) },
      { id: 'a4', type: 'weather' as const, message: 'Light rain expected at 23:00 - Beer Garden tarps ready', severity: 'medium' as const, time: new Date(Date.now() - 45 * 60000) },
    ];

    const visibleAlerts = mockAlerts.filter(a => !dismissedAlerts.has(a.id));
    const occupancyPct = Math.round((mockVenue.currentOccupancy / mockVenue.totalCapacity) * 100);

    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
      open: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
      closed: { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[700], dot: tokens.colors.neutral[400] },
      maintenance: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    };

    const severityColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      high: { bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200], icon: '🚨' },
      medium: { bg: tokens.colors.warningScale[50], text: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200], icon: '⚠️' },
      low: { bg: tokens.colors.infoScale[50], text: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200], icon: 'ℹ️' },
    };

    const alertTypeIcons: Record<string, string> = { capacity: '👥', maintenance: '🔧', security: '🔒', weather: '🌧️' };

    const getZoneBarColor = (pct: number) => {
      if (pct >= 85) return tokens.colors.errorScale[500];
      if (pct >= 65) return tokens.colors.warningScale[500];
      return tokens.colors.successScale[500];
    };

    const handleDismiss = (id: string) => {
      setDismissedAlerts(prev => new Set([...prev, id]));
      onAlertDismiss?.(id);
    };

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* Venue Info Header */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[6], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <div style={{ width: 56, height: 56, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏟️</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{mockVenue.name}</Text>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                  textTransform: 'uppercase' as const,
                  backgroundColor: statusColors[mockVenue.status].bg,
                  color: statusColors[mockVenue.status].text,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: statusColors[mockVenue.status].dot }} />
                  {mockVenue.status}
                </span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>📍 {mockVenue.address}</Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[6] }}>
            <div style={{ textAlign: 'center' as const }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1], textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em' }}>Occupancy</span>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: occupancyPct >= 85 ? tokens.colors.errorScale[600] : occupancyPct >= 65 ? tokens.colors.warningScale[600] : tokens.colors.successScale[600] }}>{occupancyPct}%</span>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1], textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em' }}>Guests</span>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{mockVenue.currentOccupancy.toLocaleString()}</span>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1], textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em' }}>Capacity</span>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{mockVenue.totalCapacity.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: tokens.spacing[6] }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Zone Status Grid */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Zone Status</Text>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{mockZones.length} zones active</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                {mockZones.map((zone) => {
                  const pct = Math.round((zone.currentCount / zone.capacity) * 100);
                  return (
                    <div
                      key={zone.id}
                      onClick={() => onZoneClick?.(zone.id)}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.neutral[50],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                        <div>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{zone.name}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{zone.accessLevel}</span>
                        </div>
                        <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: getZoneBarColor(pct) }}>{pct}%</span>
                      </div>
                      <div style={{ height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden', marginBottom: tokens.spacing[1] }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: getZoneBarColor(pct), borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{zone.isActive ? '● Active' : '○ Inactive'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Cards */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Stages</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {mockStages.map((stage) => (
                  <div
                    key={stage.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      borderLeft: `3px solid ${stage.isActive ? tokens.colors.successScale[500] : tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.neutral[50],
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: tokens.borderRadius.md, backgroundColor: stage.isActive ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg, flexShrink: 0 }}>🎤</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{stage.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, textTransform: 'uppercase' as const,
                          padding: '1px 6px', borderRadius: tokens.borderRadius.sm,
                          backgroundColor: stage.isActive ? tokens.colors.successScale[100] : tokens.colors.neutral[100],
                          color: stage.isActive ? tokens.colors.successScale[700] : tokens.colors.neutral[600],
                        }}>{stage.isActive ? 'LIVE' : 'IDLE'}</span>
                      </div>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stage.zone}</span>
                    </div>
                    <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                      {stage.currentAct ? (
                        <>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Now Playing</span>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600], display: 'block' }}>{stage.currentAct}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontStyle: 'italic' as const }}>No act playing</span>
                      )}
                      {stage.nextAct && (
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginTop: 2 }}>
                          Next: {stage.nextAct} @ {stage.nextTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Alerts Panel */}
          <div style={cardBase}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Alerts</Text>
                {visibleAlerts.length > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.errorScale[500], color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                  }}>{visibleAlerts.length}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {visibleAlerts.length === 0 ? (
                <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: tokens.spacing[2] }}>✅</span>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>All clear - no active alerts</Text>
                </div>
              ) : (
                visibleAlerts.sort((a, b) => {
                  const order = { high: 0, medium: 1, low: 2 };
                  return order[a.severity] - order[b.severity];
                }).map((alert) => {
                  const sc = severityColors[alert.severity];
                  return (
                    <div
                      key={alert.id}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: sc.bg,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm }}>{alertTypeIcons[alert.type]}</span>
                          <span style={{
                            fontSize: 10, fontWeight: tokens.typography.fontWeight.bold,
                            textTransform: 'uppercase' as const, color: sc.text,
                          }}>{alert.severity}</span>
                        </div>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          style={{
                            border: 'none', background: 'none', cursor: 'pointer',
                            color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm,
                            padding: 0, lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: sc.text, display: 'block', marginBottom: tokens.spacing[1] }}>{alert.message}</Text>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {Math.round((Date.now() - alert.time.getTime()) / 60000)}m ago
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
