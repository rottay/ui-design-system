'use client';

/**
 * EvAdminCenter - Overview Preset
 * System metrics KPI row, tenant summary table, recent system events, quick admin actions
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvAdminCenterProps } from '../../core';

export const OverviewEvAdminCenter = createPreset<EvAdminCenterProps>({
  name: 'EvAdminCenter.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAdminCenterProps>) => {
    const { Box, Text } = primitives;

    const {
      systemMetrics,
      tenants,
      systemEvents,
      quickActions,
      onTenantClick,
      onEventClick,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const mockMetrics = systemMetrics?.length ? systemMetrics : [
      { label: 'Active Tenants', value: '24', status: 'healthy' as const },
      { label: 'Total Events', value: '1,847', status: 'healthy' as const },
      { label: 'API Uptime', value: '99.97%', status: 'healthy' as const },
      { label: 'Error Rate', value: '0.12%', status: 'warning' as const },
    ];

    const mockTenants = tenants?.length ? tenants : [
      { id: 't1', name: 'Neon Events', eventsCount: 342, revenue: 285000, status: 'active' as const },
      { id: 't2', name: 'Jazz Corp', eventsCount: 128, revenue: 152000, status: 'active' as const },
      { id: 't3', name: 'Beach Parties LLC', eventsCount: 87, revenue: 98500, status: 'active' as const },
      { id: 't4', name: 'Underground Sounds', eventsCount: 56, revenue: 45000, status: 'trial' as const },
      { id: 't5', name: 'Metro Festivals', eventsCount: 0, revenue: 0, status: 'suspended' as const },
    ];

    const mockEvents = systemEvents?.length ? systemEvents : [
      { id: 'e1', type: 'deployment', message: 'API v3.2.1 deployed to production', severity: 'info' as const, time: new Date(Date.now() - 12 * 60000) },
      { id: 'e2', type: 'auth', message: 'Failed login attempts spike from IP 192.168.1.x', severity: 'warning' as const, time: new Date(Date.now() - 35 * 60000) },
      { id: 'e3', type: 'billing', message: 'Jazz Corp payment processed - $12,500', severity: 'info' as const, time: new Date(Date.now() - 55 * 60000) },
      { id: 'e4', type: 'error', message: 'Webhook delivery failed for tenant Beach Parties', severity: 'error' as const, time: new Date(Date.now() - 90 * 60000) },
      { id: 'e5', type: 'tenant', message: 'Underground Sounds trial started', severity: 'info' as const, time: new Date(Date.now() - 180 * 60000) },
      { id: 'e6', type: 'maintenance', message: 'Database backup completed successfully', severity: 'info' as const, time: new Date(Date.now() - 240 * 60000) },
    ];

    const metricIcons = ['🏢', '📅', '🔗', '⚠️'];

    const statusBadgeColors: Record<string, { bg: string; text: string }> = {
      active: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
      trial: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] },
      suspended: { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] },
    };

    const statusMetricColors: Record<string, { bg: string; text: string }> = {
      healthy: { bg: tokens.colors.successScale[50], text: tokens.colors.successScale[600] },
      warning: { bg: tokens.colors.warningScale[50], text: tokens.colors.warningScale[600] },
      critical: { bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[600] },
    };

    const severityConfig: Record<string, { dot: string; text: string }> = {
      info: { dot: tokens.colors.infoScale[500], text: tokens.colors.infoScale[700] },
      warning: { dot: tokens.colors.warningScale[500], text: tokens.colors.warningScale[700] },
      error: { dot: tokens.colors.errorScale[500], text: tokens.colors.errorScale[700] },
    };

    const adminActions = [
      { icon: '👥', label: 'Manage Tenants', desc: 'Add, edit, suspend' },
      { icon: '🔑', label: 'API Keys', desc: 'Generate & revoke' },
      { icon: '📊', label: 'Usage Reports', desc: 'Platform analytics' },
      { icon: '🛡️', label: 'Security', desc: 'Audit & policies' },
      { icon: '💾', label: 'Backups', desc: 'DB snapshots' },
      { icon: '⚙️', label: 'Settings', desc: 'Platform config' },
    ];

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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Admin Center
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Platform overview and system management
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700],
              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500] }} />
              All Systems Operational
            </span>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {mockMetrics.map((metric, idx) => {
            const sc = statusMetricColors[metric.status];
            return (
              <div key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: tokens.spacing[1] }}>{metric.label}</span>
                    <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{metric.value}</span>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.md, backgroundColor: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg }}>{metricIcons[idx]}</div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                  color: sc.text,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sc.text }} />
                  {metric.status}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: tokens.spacing[6] }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Tenant Summary Table */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Tenant Summary</Text>
                <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.primaryScale[200]}`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ Add Tenant</button>
              </div>
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm, marginBottom: tokens.spacing[1] }}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>Tenant</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>Events</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>Revenue</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>Status</span>
              </div>
              {/* Table Rows */}
              {mockTenants.map((tenant) => {
                const badge = statusBadgeColors[tenant.status];
                return (
                  <div
                    key={tenant.id}
                    onClick={() => onTenantClick?.(tenant.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px', gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                      cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0,
                      }}>{tenant.name.charAt(0)}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{tenant.name}</span>
                    </div>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{tenant.eventsCount.toLocaleString()}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${(tenant.revenue / 1000).toFixed(0)}K</span>
                    <span style={{
                      display: 'inline-block', padding: '1px 8px', borderRadius: tokens.borderRadius.sm,
                      fontSize: 10, fontWeight: tokens.typography.fontWeight.bold,
                      textTransform: 'uppercase' as const,
                      backgroundColor: badge.bg, color: badge.text,
                    }}>{tenant.status}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Quick Actions</Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
                {adminActions.map((action, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' as const,
                    padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white, cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing[2], fontSize: tokens.typography.fontSize.xl }}>{action.icon}</div>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: 2 }}>{action.label}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{action.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - System Events */}
          <div style={cardBase}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>System Events</Text>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Last 24h</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {mockEvents.map((event) => {
                const sev = severityConfig[event.severity];
                const minutesAgo = Math.round((Date.now() - event.time.getTime()) / 60000);
                const timeLabel = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.round(minutesAgo / 60)}h ago`;
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event.id)}
                    style={{
                      padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50], cursor: 'pointer',
                      borderLeft: `3px solid ${sev.dot}`,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <span style={{
                        fontSize: 10, fontWeight: tokens.typography.fontWeight.bold,
                        textTransform: 'uppercase' as const, color: sev.text,
                      }}>{event.type}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{timeLabel}</span>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], display: 'block' }}>{event.message}</Text>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
