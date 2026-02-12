'use client';

/**
 * BhClientDirectory - Cards Preset
 * Card grid layout with expandable client cards, status badges, tier indicators,
 * revenue metrics, contact details, and approval workflow visualization.
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
  Search, Plus, Building2, User, ChevronDown, ChevronUp, X,
  Mail, Phone, Briefcase, DollarSign, Calendar, FileText,
  CheckCircle2, Clock, XCircle, Edit3, Users, Star, Shield, Eye,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

const STATUS_MAP: Record<ClientStatus, { label: string; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = {
  active: { label: 'Active', color: t => t.colors.successScale[600], bg: t => t.colors.successScale[50] },
  inactive: { label: 'Inactive', color: t => t.colors.neutral[500], bg: t => t.colors.neutral[100] },
  pending_approval: { label: 'Pending', color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  suspended: { label: 'Suspended', color: t => t.colors.errorScale[600], bg: t => t.colors.errorScale[50] },
};

const TIER_MAP: Record<ClientTier, { label: string; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = {
  standard: { label: 'Standard', color: t => t.colors.primaryScale[600], bg: t => t.colors.primaryScale[50] },
  premium: { label: 'Premium', color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  enterprise: { label: 'Enterprise', color: t => t.colors.secondaryScale[600], bg: t => t.colors.secondaryScale[50] },
};

function formatRevenue(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function formatFee(f: ClientItem['feeStructure']): string {
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
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.industry.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

const DEFAULT_CLIENTS: ClientItem[] = [
  { id: 'cl-1', name: 'Acme Corporation', type: 'company', status: 'active', tier: 'enterprise', industry: 'Technology', positionsCount: 12, revenue: 450000, approvalStatus: 'approved', contacts: [{ name: 'Lisa Park', email: 'lisa@acme.co', phone: '+1 (555) 100-2000', role: 'VP Engineering' }], contractInfo: { terms: 'Annual', startDate: '2025-01-15', endDate: '2026-01-14' }, feeStructure: { type: 'percentage', value: 20 } },
  { id: 'cl-2', name: 'Horizon Labs', type: 'company', status: 'active', tier: 'premium', industry: 'Healthcare', positionsCount: 5, revenue: 180000, approvalStatus: 'approved', contacts: [{ name: 'Mark Rivera', email: 'mark@horizon.io', phone: '+1 (555) 200-3000', role: 'HR Director' }], feeStructure: { type: 'retainer', value: 8000 } },
  { id: 'cl-3', name: 'Nova Ventures', type: 'company', status: 'pending_approval', tier: 'standard', industry: 'Finance', positionsCount: 3, revenue: 75000, approvalStatus: 'pending', contacts: [{ name: 'Sam Ortiz', email: 'sam@nova.vc', phone: '+1 (555) 300-4000', role: 'Talent Lead' }], feeStructure: { type: 'fixed', value: 25000 } },
  { id: 'cl-4', name: 'David Chen', type: 'individual', status: 'active', tier: 'standard', industry: 'Consulting', positionsCount: 1, revenue: 15000, approvalStatus: 'approved', contacts: [{ name: 'David Chen', email: 'david@chen.consulting', phone: '+1 (555) 400-5000', role: 'Owner' }] },
];

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const CardsBhClientDirectory = createPreset<BhClientDirectoryProps>({
  name: 'BhClientDirectory.Cards',
  render: ({ primitives, props, tokens: t }: PresetContext<BhClientDirectoryProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);

    const {
      clients = DEFAULT_CLIENTS,
      filters: filtersProp,
      onFilterChange,
      onClientSelect,
      onAddClient,
      onEditClient,
      className, style,
    } = props;

    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [internalFilters, setInternalFilters] = useState<ClientFilter>(
      filtersProp ?? { type: 'all', status: 'all', tier: 'all', search: '' },
    );
    const filters = filtersProp ?? internalFilters;
    const updateFilter = useCallback((patch: Partial<ClientFilter>) => {
      const next = { ...filters, ...patch };
      setInternalFilters(next);
      onFilterChange?.(next);
    }, [filters, onFilterChange]);

    const filtered = useMemo(() => filterClients(clients, filters), [clients, filters]);

    const toggleExpand = (id: string) => {
      const next = expandedCard === id ? null : id;
      setExpandedCard(next);
      onClientSelect?.(id);
    };

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
              <Building2 size={16} style={{ marginRight: t.spacing[2], verticalAlign: 'middle' }} />
              Client Directory
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>{filtered.length} clients</Text>
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
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {[
            { label: 'All', value: 'all' as const, icon: <Users size={12} /> },
            { label: 'Companies', value: 'company' as const, icon: <Building2 size={12} /> },
            { label: 'Individuals', value: 'individual' as const, icon: <User size={12} /> },
          ].map(opt => {
            const active = !filters.type || filters.type === opt.value || (opt.value === 'all' && !filters.type);
            return (
              <button key={opt.value} onClick={() => updateFilter({ type: opt.value })} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                border: `1px solid ${active ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
                color: active ? t.colors.primaryScale[700] : t.colors.neutral[600],
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
              }}>{opt.icon} {opt.label}</button>
            );
          })}
          <select value={filters.status ?? 'all'} onChange={e => updateFilter({ status: e.target.value as ClientStatus | 'all' })} style={{
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
            border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[700], backgroundColor: t.colors.common.white, cursor: 'pointer',
          }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_approval">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={filters.tier ?? 'all'} onChange={e => updateFilter({ tier: e.target.value as ClientTier | 'all' })} style={{
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
            border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[700], backgroundColor: t.colors.common.white, cursor: 'pointer',
          }}>
            <option value="all">All Tiers</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <Box style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
            <input value={filters.search ?? ''} onChange={e => updateFilter({ search: e.target.value })} placeholder="Search clients..." style={{
              width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px ${t.spacing[8]}px`,
              border: `1px solid ${t.colors.neutral[200]}`, borderRadius: br,
              fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900], backgroundColor: t.colors.common.white, outline: 'none',
            }} />
          </Box>
        </Box>

        {/* Card grid */}
        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
          {filtered.length === 0 && (
            <Box style={{ textAlign: 'center', padding: t.spacing[10], color: t.colors.neutral[400] }}>
              <Search size={32} style={{ marginBottom: t.spacing[3], opacity: 0.5 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>No clients found</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, marginTop: t.spacing[1] }}>Try adjusting your filters</Text>
            </Box>
          )}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: t.spacing[4] }}>
            {filtered.map(client => {
              const isExpanded = expandedCard === client.id;
              const st = STATUS_MAP[client.status];
              const ti = TIER_MAP[client.tier];

              return (
                <Box key={client.id} style={{
                  borderRadius: t.borderRadius.xl, border: `1px solid ${isExpanded ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                  backgroundColor: t.colors.common.white, overflow: 'hidden', transition: 'border-color 0.15s ease',
                }}>
                  {/* Card header */}
                  <Box onClick={() => toggleExpand(client.id)} style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[4]}px`, cursor: 'pointer',
                  }}>
                    <Box style={{
                      width: 44, height: 44, flexShrink: 0,
                      borderRadius: client.type === 'company' ? t.borderRadius.lg : t.borderRadius.full,
                      backgroundColor: client.type === 'company' ? t.colors.primaryScale[50] : t.colors.secondaryScale[50],
                      color: client.type === 'company' ? t.colors.primaryScale[600] : t.colors.secondaryScale[600],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {client.type === 'company' ? <Building2 size={20} /> : <User size={20} />}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: 2 }}>
                        <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: ti.bg(t) }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: ti.color(t), fontWeight: t.typography.fontWeight.medium }}><Star size={9} style={{ verticalAlign: 'middle', marginRight: 2 }} />{ti.label}</Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: st.color(t) }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{st.label}</Text>
                        </Box>
                      </Box>
                    </Box>
                    <Box style={{ color: t.colors.neutral[400] }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </Box>
                  </Box>

                  {/* Stats row */}
                  <Box style={{ display: 'flex', borderTop: `1px solid ${t.colors.neutral[50]}`, borderBottom: `1px solid ${t.colors.neutral[50]}` }}>
                    {[
                      { label: 'Positions', value: client.positionsCount, color: t.colors.primaryScale[700] },
                      { label: 'Revenue', value: formatRevenue(client.revenue), color: t.colors.successScale[600] },
                      { label: 'Contacts', value: client.contacts.length, color: t.colors.infoScale[600] },
                    ].map(s => (
                      <Box key={s.label} style={{ flex: 1, textAlign: 'center', padding: `${t.spacing[3]}px 0` }}>
                        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: s.color }}>{s.value}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{s.label}</Text>
                      </Box>
                    ))}
                  </Box>

                  {/* Footer */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[2]}px ${t.spacing[4]}px`, backgroundColor: t.colors.neutral[50] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{client.industry}</Text>
                    {client.feeStructure && (
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[600] }}>{formatFee(client.feeStructure)}</Text>
                    )}
                  </Box>

                  {/* Expanded */}
                  {isExpanded && (
                    <Box style={{ padding: `${t.spacing[4]}px`, borderTop: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50] }}>
                      {/* Contacts */}
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[2], display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} style={{ color: t.colors.primaryScale[500] }} /> Contacts
                      </Text>
                      {client.contacts.map((contact, ci) => (
                        <Box key={ci} style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                          backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[100]}`,
                        }}>
                          <Box style={{
                            width: 28, height: 28, borderRadius: t.borderRadius.full, flexShrink: 0,
                            backgroundColor: t.colors.secondaryScale[50], color: t.colors.secondaryScale[600],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}><User size={13} /></Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{contact.name}</Text>
                            <Text style={{ fontSize: 10, color: t.colors.neutral[500] }}>{contact.role}</Text>
                          </Box>
                          <Mail size={12} style={{ color: t.colors.primaryScale[400], cursor: 'pointer' }} />
                          <Phone size={12} style={{ color: t.colors.primaryScale[400], cursor: 'pointer' }} />
                        </Box>
                      ))}

                      {/* Contract */}
                      {client.contractInfo && (
                        <Box style={{ marginTop: t.spacing[3] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[2], display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FileText size={13} style={{ color: t.colors.primaryScale[500] }} /> Contract
                          </Text>
                          <Box style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[2],
                            padding: t.spacing[3], borderRadius: t.borderRadius.lg,
                            backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[100]}`,
                          }}>
                            <Box>
                              <Text style={{ fontSize: 10, color: t.colors.neutral[500] }}>Terms</Text>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{client.contractInfo.terms}</Text>
                            </Box>
                            <Box>
                              <Text style={{ fontSize: 10, color: t.colors.neutral[500] }}>Fee</Text>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{formatFee(client.feeStructure)}</Text>
                            </Box>
                            <Box>
                              <Text style={{ fontSize: 10, color: t.colors.neutral[500] }}>Start</Text>
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800], display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} /> {client.contractInfo.startDate}</Text>
                            </Box>
                            <Box>
                              <Text style={{ fontSize: 10, color: t.colors.neutral[500] }}>End</Text>
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800], display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} /> {client.contractInfo.endDate}</Text>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box style={{ display: 'flex', gap: t.spacing[2], justifyContent: 'flex-end', marginTop: t.spacing[3], paddingTop: t.spacing[3], borderTop: `1px solid ${t.colors.neutral[100]}` }}>
                        <button onClick={() => onEditClient?.(client.id, {})} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                          border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                          color: t.colors.neutral[700], fontSize: t.typography.fontSize.xs, cursor: 'pointer',
                        }}><Edit3 size={11} /> Edit</button>
                        <button onClick={() => onClientSelect?.(client.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                          border: 'none', backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer',
                        }}><Briefcase size={11} /> View Details</button>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
