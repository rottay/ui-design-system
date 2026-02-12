'use client';

/**
 * BhClientDirectory - Directory Preset
 * Split-panel layout with filterable client list (left) and
 * rich detail panel (right) showing contacts, contract, metrics.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type {
  BhClientDirectoryProps, ClientItem, ClientFilter,
  ClientType, ClientStatus, ClientTier, ApprovalStatus,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search, Plus, Building2, User, X, Mail, Phone, Briefcase,
  DollarSign, Calendar, FileText, CheckCircle2, Clock, XCircle,
  Edit3, Users, Star, Shield, Eye, TrendingUp,
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
    const br = getPersonalityBadgeRadius(t);

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
    const selected = clients.find(c => c.id === selectedId) ?? null;

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Building2 size={18} style={{ color: t.colors.primaryScale[500] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>Client Directory</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{filtered.length} of {clients.length}</Text>
          </Box>
          {onAddClient && (
            <button onClick={() => onAddClient({})} style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: br, border: 'none',
              backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
              fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer',
            }}><Plus size={14} /> Add Client</button>
          )}
        </Box>

        {/* Filter bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap',
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {[{ l: 'All', v: 'all' }, { l: 'Companies', v: 'company' }, { l: 'Individuals', v: 'individual' }].map(o => {
            const active = filters.type === o.v || (o.v === 'all' && (!filters.type || filters.type === 'all'));
            return (
              <button key={o.v} onClick={() => updateFilter({ type: o.v as any })} style={{
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                border: `1px solid ${active ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
                color: active ? t.colors.primaryScale[700] : t.colors.neutral[600],
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
              }}>{o.l}</button>
            );
          })}
          <select value={filters.status ?? 'all'} onChange={e => updateFilter({ status: e.target.value as any })} style={{
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
            border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], backgroundColor: t.colors.common.white,
          }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_approval">Pending</option>
          </select>
          <Box style={{ flex: 1, minWidth: 160, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
            <input value={filters.search ?? ''} onChange={e => updateFilter({ search: e.target.value })} placeholder="Search..." style={{
              width: '100%', padding: `${t.spacing[1]}px ${t.spacing[3]}px ${t.spacing[1]}px ${t.spacing[8]}px`,
              border: `1px solid ${t.colors.neutral[200]}`, borderRadius: br,
              fontSize: t.typography.fontSize.xs, color: t.colors.neutral[900], backgroundColor: t.colors.common.white, outline: 'none',
            }} />
          </Box>
        </Box>

        {/* Split panel */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* List */}
          <Box style={{
            width: selected ? 360 : '100%', minWidth: selected ? 360 : undefined,
            borderRight: selected ? `1px solid ${t.colors.neutral[100]}` : 'none',
            overflowY: 'auto', backgroundColor: t.colors.common.white,
          }}>
            {filtered.length === 0 && (
              <Box style={{ textAlign: 'center', padding: t.spacing[8], color: t.colors.neutral[400] }}>
                <Search size={28} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                <Text style={{ fontSize: t.typography.fontSize.sm }}>No clients found</Text>
              </Box>
            )}
            {filtered.map(client => {
              const isActive = client.id === selectedId;
              const sc = STATUS_CFG[client.status];
              const tc = TIER_CFG[client.tier];
              return (
                <Box key={client.id} onClick={() => selectClient(client.id)} style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[3],
                  padding: `${t.spacing[3]}px ${t.spacing[5]}px`, cursor: 'pointer',
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: isActive ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                  backgroundColor: isActive ? t.colors.primaryScale[50] : t.colors.common.white,
                  transition: 'background-color 0.1s ease',
                }}>
                  <Box style={{
                    width: 36, height: 36, flexShrink: 0,
                    borderRadius: client.type === 'company' ? t.borderRadius.md : t.borderRadius.full,
                    backgroundColor: client.type === 'company' ? t.colors.primaryScale[50] : t.colors.secondaryScale[50],
                    color: client.type === 'company' ? t.colors.primaryScale[600] : t.colors.secondaryScale[600],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{client.type === 'company' ? <Building2 size={16} /> : <User size={16} />}</Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: 2 }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</Text>
                      <Box style={{ padding: `0 ${t.spacing[1]}px`, borderRadius: br, backgroundColor: tc.bg(t) }}>
                        <Text style={{ fontSize: 10, color: tc.color(t) }}>{tc.label}</Text>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box style={{ width: 5, height: 5, borderRadius: t.borderRadius.full, backgroundColor: sc.color(t) }} />
                        {sc.label}
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Briefcase size={10} /> {client.positionsCount}</Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}><DollarSign size={10} /> {fmtRev(client.revenue)}</Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Detail panel */}
          {selected ? (
            <Box style={{ flex: 1, overflowY: 'auto', padding: `${t.spacing[6]}px` }}>
              {/* Client header */}
              <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Box style={{
                    width: 48, height: 48, borderRadius: selected.type === 'company' ? t.borderRadius.lg : t.borderRadius.full,
                    backgroundColor: selected.type === 'company' ? t.colors.primaryScale[50] : t.colors.secondaryScale[50],
                    color: selected.type === 'company' ? t.colors.primaryScale[600] : t.colors.secondaryScale[600],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{selected.type === 'company' ? <Building2 size={22} /> : <User size={22} />}</Box>
                  <Box>
                    <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{selected.name}</Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: 2 }}>
                      <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: TIER_CFG[selected.tier].bg(t) }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: TIER_CFG[selected.tier].color(t) }}><Star size={9} style={{ verticalAlign: 'middle', marginRight: 2 }} />{TIER_CFG[selected.tier].label}</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{selected.industry}</Text>
                    </Box>
                  </Box>
                </Box>
                <button onClick={() => onEditClient?.(selected.id, {})} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: br,
                  border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[700], fontSize: t.typography.fontSize.xs, cursor: 'pointer',
                }}><Edit3 size={12} /> Edit</button>
              </Box>

              {/* Metrics */}
              <Box style={{ display: 'flex', gap: t.spacing[3], marginBottom: t.spacing[5] }}>
                {[
                  { label: 'Positions', value: selected.positionsCount, color: t.colors.primaryScale[700] },
                  { label: 'Revenue', value: fmtRev(selected.revenue), color: t.colors.successScale[600] },
                  { label: 'Contacts', value: selected.contacts.length, color: t.colors.infoScale[600] },
                  { label: 'Fee', value: fmtFee(selected.feeStructure), color: t.colors.primaryScale[600] },
                ].map(m => (
                  <Box key={m.label} style={{
                    flex: 1, textAlign: 'center', padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.xl,
                    backgroundColor: t.colors.neutral[50], border: `1px solid ${t.colors.neutral[100]}`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: m.color }}>{m.value}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{m.label}</Text>
                  </Box>
                ))}
              </Box>

              {/* Contacts */}
              <Box style={{ marginBottom: t.spacing[5] }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[3], display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={14} style={{ color: t.colors.primaryScale[500] }} /> Contacts ({selected.contacts.length})
                </Text>
                {selected.contacts.map((c, ci) => (
                  <Box key={ci} style={{
                    padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg, marginBottom: t.spacing[2],
                    border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50],
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: 2 }}>{c.name}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>{c.role}</Text>
                    <Box style={{ display: 'flex', gap: t.spacing[4] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={11} /> {c.email}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={11} /> {c.phone}</Text>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Contract */}
              {selected.contractInfo && (
                <Box style={{ marginBottom: t.spacing[5] }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[3], display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileText size={14} style={{ color: t.colors.primaryScale[500] }} /> Contract
                  </Text>
                  <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], padding: t.spacing[4], borderRadius: t.borderRadius.xl, border: `1px solid ${t.colors.neutral[100]}` }}>
                    {[
                      { label: 'Terms', value: selected.contractInfo.terms },
                      { label: 'Fee', value: fmtFee(selected.feeStructure) },
                      { label: 'Start', value: selected.contractInfo.startDate },
                      { label: 'End', value: selected.contractInfo.endDate },
                    ].map(f => (
                      <Box key={f.label}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: 2 }}>{f.label}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{f.value}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : filtered.length > 0 ? (
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.colors.neutral[400] }}>
              <Users size={36} style={{ marginBottom: t.spacing[3], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>Select a client to view details</Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  },
});
