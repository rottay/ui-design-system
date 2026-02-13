'use client';

/**
 * BhClientDirectory - Directory Preset
 * Split-panel layout with filterable client list (left) and
 * rich detail panel (right) showing contacts, contract, metrics.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createIconContainerStyle,
  createEmptyStateStyle,
  createEntranceAnimation,
  createStaggerDelay,
} from '../../../helpers';
import type {
  BhClientDirectoryProps, ClientItem, ClientFilter,
  ClientType, ClientStatus, ClientTier, ApprovalStatus,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Search, Plus, Building2, User, X, Mail, Phone, Briefcase,
  DollarSign, Calendar, FileText, CheckCircle2, Clock, XCircle,
  Edit3, Users, Star, Shield, Eye, TrendingUp, ChevronDown,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

const STATUS_CFG: Record<ClientStatus, { label: string; color: (t: DesignTokens) => string }> = {
  active: { label: 'Active', color: t => t.colors.successScale[500] },
  inactive: { label: 'Inactive', color: t => t.colors.neutral[400] },
  pending_approval: { label: 'Pending', color: t => t.colors.warningScale[500] },
  suspended: { label: 'Suspended', color: t => t.colors.errorScale[500] },
};

const TIER_CFG: Record<ClientTier, { label: string; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = {
  standard: { label: 'Standard', color: t => t.colors.primaryScale[600], bg: t => t.colors.primaryScale[50] },
  premium: { label: 'Premium', color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  enterprise: { label: 'Enterprise', color: t => t.colors.secondaryScale[600], bg: t => t.colors.secondaryScale[50] },
};

function fmtRev(v: number): string { return v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`; }
function fmtFee(f: ClientItem['feeStructure']): string {
  if (!f) return 'N/A';
  if (f.type === 'percentage') return `${f.value}%`;
  if (f.type === 'retainer') return `${f.currency ?? 'USD'} ${f.value.toLocaleString()}/mo`;
  return `${f.currency ?? 'USD'} ${f.value.toLocaleString()}`;
}

function filterClients(clients: ClientItem[], f: ClientFilter): ClientItem[] {
  return clients.filter(c => {
    if (f.type && f.type !== 'all' && c.type !== f.type) return false;
    if (f.status && f.status !== 'all' && c.status !== f.status) return false;
    if (f.tier && f.tier !== 'all' && c.tier !== f.tier) return false;
    if (f.search) { const q = f.search.toLowerCase(); if (!c.name.toLowerCase().includes(q) && !c.industry.toLowerCase().includes(q)) return false; }
    return true;
  });
}

const DEFAULT_CLIENTS: ClientItem[] = [
  { id: 'cl-1', name: 'Acme Corporation', type: 'company', status: 'active', tier: 'enterprise', industry: 'Technology', positionsCount: 12, revenue: 450000, approvalStatus: 'approved', contacts: [{ name: 'Lisa Park', email: 'lisa@acme.co', phone: '+1 (555) 100-2000', role: 'VP Engineering' }, { name: 'Tom Walsh', email: 'tom@acme.co', phone: '+1 (555) 100-2001', role: 'Hiring Manager' }], contractInfo: { terms: 'Annual', startDate: '2025-01-15', endDate: '2026-01-14' }, feeStructure: { type: 'percentage', value: 20 } },
  { id: 'cl-2', name: 'Horizon Labs', type: 'company', status: 'active', tier: 'premium', industry: 'Healthcare', positionsCount: 5, revenue: 180000, approvalStatus: 'approved', contacts: [{ name: 'Mark Rivera', email: 'mark@horizon.io', phone: '+1 (555) 200-3000', role: 'HR Director' }], feeStructure: { type: 'retainer', value: 8000 } },
  { id: 'cl-3', name: 'Nova Ventures', type: 'company', status: 'pending_approval', tier: 'standard', industry: 'Finance', positionsCount: 3, revenue: 75000, approvalStatus: 'pending', contacts: [{ name: 'Sam Ortiz', email: 'sam@nova.vc', phone: '+1 (555) 300-4000', role: 'Talent Lead' }], feeStructure: { type: 'fixed', value: 25000 } },
  { id: 'cl-4', name: 'David Chen', type: 'individual', status: 'active', tier: 'standard', industry: 'Consulting', positionsCount: 1, revenue: 15000, approvalStatus: 'approved', contacts: [{ name: 'David Chen', email: 'david@chen.consulting', phone: '+1 (555) 400-5000', role: 'Owner' }] },
  { id: 'cl-5', name: 'Meridian Group', type: 'company', status: 'inactive', tier: 'premium', industry: 'Real Estate', positionsCount: 0, revenue: 95000, approvalStatus: 'approved', contacts: [{ name: 'Kate Yu', email: 'kate@meridian.com', phone: '+1 (555) 500-6000', role: 'COO' }] },
];

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const DirectoryBhClientDirectory = createPreset<BhClientDirectoryProps>({
  name: 'BhClientDirectory.Directory',
  render: ({ primitives, props, tokens: t }: PresetContext<BhClientDirectoryProps>) => {
    const { Box, Text } = primitives;
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);

    const glassStyle = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur };
      }
      return {};
    }, [t]);

    const {
      clients = DEFAULT_CLIENTS,
      filters: filtersProp,
      onFilterChange,
      onClientSelect,
      selectedClient: selectedProp,
      onAddClient,
      onEditClient,
      className, style,
    } = props;

    const [internalSelected, setInternalSelected] = useState<string | null>(selectedProp ?? null);
    const [internalFilters, setInternalFilters] = useState<ClientFilter>(filtersProp ?? { type: 'all', status: 'all', tier: 'all', search: '' });


    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const selectedId = selectedProp ?? internalSelected;
    const filters = filtersProp ?? internalFilters;

    const updateFilter = useCallback((patch: Partial<ClientFilter>) => {
      const next = { ...filters, ...patch };
      setInternalFilters(next);
      onFilterChange?.(next);
    }, [filters, onFilterChange]);

    const selectClient = useCallback((id: string) => {
      setInternalSelected(id);
      onClientSelect?.(id);
    }, [onClientSelect]);

    const filtered = useMemo(() => filterClients(clients, filters), [clients, filters]);
    const selected = useMemo(() => clients.find(c => c.id === selectedId) ?? null, [clients, selectedId]);

    return (
      <Box className={className} role="region" aria-label="Client Directory" style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...glassStyle,
        ...entrance.animate, transition: entrance.transition,
        ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Building2 size={18} color={t.colors.primaryScale[500]} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>Client Directory</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{filtered.length} of {clients.length}</Text>
          </Box>
          {onAddClient && (
            <Box
              onClick={() => onAddClient({})}
              role="button"
              tabIndex={0}
              aria-label="Add new client"
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: br,
                backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
                fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Plus size={14} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>Add Client</Text>
            </Box>
          )}
        </Box>

        {/* Filter bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap',
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }} role="toolbar" aria-label="Filter controls">
          {[{ l: 'All', v: 'all' }, { l: 'Companies', v: 'company' }, { l: 'Individuals', v: 'individual' }].map(o => {
            const active = filters.type === o.v || (o.v === 'all' && (!filters.type || filters.type === 'all'));
            return (
              <Box
                key={o.v}
                onClick={() => updateFilter({ type: o.v as any })}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={`Filter by ${o.l}`}
                style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                  border: `1px solid ${active ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
                  color: active ? t.colors.primaryScale[700] : t.colors.neutral[600],
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs, color: 'inherit' }}>{o.l}</Text>
              </Box>
            );
          })}
          {/* Status filter */}
          <Box style={{
            position: 'relative',
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
            border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[700], backgroundColor: t.colors.common.white,
            display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
              {filters.status === 'all' || !filters.status ? 'All Statuses' : STATUS_CFG[filters.status as ClientStatus]?.label ?? filters.status}
            </Text>
            <ChevronDown size={12} color={t.colors.neutral[400]} />
            <select
              aria-label="Filter by status"
              value={filters.status ?? 'all'}
              onChange={(e: any) => updateFilter({ status: e.target.value as any })}
              style={{
                position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
              }}
            />
          </Box>
          {/* Search */}
          <Box style={{ flex: 1, minWidth: 160, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400], pointerEvents: 'none' }} />
            <input
              aria-label="Search clients"
              value={filters.search ?? ''}
              onChange={(e: any) => updateFilter({ search: e.target.value })}
              placeholder="Search..."
              style={{
                width: '100%', padding: `${t.spacing[1]}px ${t.spacing[3]}px ${t.spacing[1]}px ${t.spacing[8]}px`,
                border: `1px solid ${t.colors.neutral[200]}`, borderRadius: br,
                fontSize: t.typography.fontSize.xs, color: t.colors.neutral[900], backgroundColor: t.colors.common.white, outline: 'none',
              }}
            />
          </Box>
        </Box>

        {/* Split panel */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* List */}
          <Box style={{
            width: selected ? 360 : '100%', minWidth: selected ? 360 : undefined,
            borderRight: selected ? `1px solid ${t.colors.neutral[100]}` : 'none',
            overflowY: 'auto', backgroundColor: t.colors.common.white,
          }} role="listbox" aria-label="Client list">
            {filtered.length === 0 && (
              <Box style={{ ...createEmptyStateStyle(t) }}>
                <Search size={28} style={{ marginBottom: t.spacing[2], opacity: 0.4, color: t.colors.neutral[300] }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No clients found</Text>
              </Box>
            )}
            {filtered.map((client, idx) => {
              const isActive = client.id === selectedId;
              const sc = STATUS_CFG[client.status];
              const tc = TIER_CFG[client.tier];
              const itemEntrance = createEntranceAnimation(t, { index: idx });
              return (
                <Box
                  key={client.id}
                  onClick={() => selectClient(client.id)}
                  role="option"
                  tabIndex={0}
                  aria-selected={isActive}
                  aria-label={`${client.name}, ${sc.label}, ${tc.label}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[5]}px`, cursor: 'pointer',
                    borderBottom: `1px solid ${t.colors.neutral[50]}`,
                    borderLeft: isActive ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                    backgroundColor: isActive ? t.colors.primaryScale[50] : t.colors.common.white,
                    transition: `background-color ${t.motion.hover}`,
                    ...itemEntrance.animate,
                  }}
                >
                  <Box style={createIconContainerStyle(t, {
                    size: 36,
                    color: client.type === 'company' ? t.colors.primaryScale[50] : t.colors.secondaryScale[50],
                  })}>
                    {client.type === 'company'
                      ? <Building2 size={16} color={t.colors.primaryScale[600]} />
                      : <User size={16} color={t.colors.secondaryScale[600]} />}
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</Text>
                      <Box style={{ padding: `0 ${t.spacing[1]}px`, borderRadius: br, backgroundColor: tc.bg(t) }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: tc.color(t) }}>{tc.label}</Text>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], color: t.colors.neutral[500] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Box style={{ width: 5, height: 5, borderRadius: t.borderRadius.full, backgroundColor: sc.color(t) }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{sc.label}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Briefcase size={10} color={t.colors.neutral[500]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{client.positionsCount}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <DollarSign size={10} color={t.colors.neutral[500]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{fmtRev(client.revenue)}</Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Detail panel */}
          {selected ? (
            <Box style={{ flex: 1, overflowY: 'auto', padding: `${t.spacing[6]}px` }} role="complementary" aria-label={`${selected.name} details`}>
              {/* Client header */}
              <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Box style={createIconContainerStyle(t, {
                    size: 48,
                    color: selected.type === 'company' ? t.colors.primaryScale[50] : t.colors.secondaryScale[50],
                  })}>
                    {selected.type === 'company'
                      ? <Building2 size={22} color={t.colors.primaryScale[600]} />
                      : <User size={22} color={t.colors.secondaryScale[600]} />}
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{selected.name}</Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                      <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: TIER_CFG[selected.tier].bg(t) }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: TIER_CFG[selected.tier].color(t) }}>
                          <Star size={9} style={{ verticalAlign: 'middle', marginRight: t.spacing[1] }} />{TIER_CFG[selected.tier].label}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{selected.industry}</Text>
                    </Box>
                  </Box>
                </Box>
                <Box
                  onClick={() => onEditClient?.(selected.id, {})}
                  role="button"
                  tabIndex={0}
                  aria-label={`Edit ${selected.name}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: br,
                    border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                    color: t.colors.neutral[700], fontSize: t.typography.fontSize.xs, cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Edit3 size={12} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>Edit</Text>
                </Box>
              </Box>

              {/* Metrics */}
              <Box style={{ display: 'flex', gap: t.spacing[3], marginBottom: t.spacing[5] }}>
                {[
                  { label: 'Positions', value: selected.positionsCount },
                  { label: 'Revenue', value: fmtRev(selected.revenue) },
                  { label: 'Contacts', value: selected.contacts.length },
                  { label: 'Fee', value: fmtFee(selected.feeStructure) },
                ].map(m => (
                  <Box key={m.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                    flex: 1, textAlign: 'center', padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.xl,
                    backgroundColor: t.colors.neutral[50], border: `1px solid ${t.colors.neutral[100]}`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{m.value}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>{m.label}</Text>
                  </Box>
                ))}
              </Box>

              {/* Contacts */}
              <Box style={{ marginBottom: t.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                  <Users size={14} style={{ color: t.colors.primaryScale[500] }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>Contacts ({selected.contacts.length})</Text>
                </Box>
                {selected.contacts.map((c, ci) => (
                  <Box key={ci} style={{
                    padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg, marginBottom: t.spacing[2],
                    border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50],
                    display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>{c.name}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], display: 'block' }}>{c.role}</Text>
                    <Box style={{ display: 'flex', gap: t.spacing[4], marginTop: t.spacing[1] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Mail size={11} color={t.colors.neutral[500]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{c.email}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Phone size={11} color={t.colors.neutral[500]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{c.phone}</Text>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Contract */}
              {selected.contractInfo && (
                <Box style={{ marginBottom: t.spacing[5] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                    <FileText size={14} style={{ color: t.colors.primaryScale[500] }} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>Contract</Text>
                  </Box>
                  <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], padding: t.spacing[4], borderRadius: t.borderRadius.xl, border: `1px solid ${t.colors.neutral[100]}` }}>
                    {[
                      { label: 'Terms', value: selected.contractInfo.terms },
                      { label: 'Fee', value: fmtFee(selected.feeStructure) },
                      { label: 'Start', value: selected.contractInfo.startDate },
                      { label: 'End', value: selected.contractInfo.endDate },
                    ].map(f => (
                      <Box key={f.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{f.label}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{f.value}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : filtered.length > 0 ? (
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.colors.neutral[400] }}>
              <Users size={36} style={{ marginBottom: t.spacing[3], opacity: 0.4, color: t.colors.neutral[300] }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[400] }}>Select a client to view details</Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  },
});
