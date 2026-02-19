'use client';

/**
 * BhClientDirectory - Cards Preset
 * Card grid layout with expandable client cards, status badges, tier indicators,
 * revenue metrics, contact details, and approval workflow visualization.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  createMetadataGridStyle,
  createStatValueStyle,
  createStatLabelStyle,
  formatAbbreviated,
  ICON_SIZES,
  createPersonalityAccentBar,
} from '../../../helpers';
import type {
  BhClientDirectoryProps, ClientFilter,
  ClientStatusFilter, ClientTierFilter, ClientTypeFilter,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ---------------------------------------------------------------------------
 * Local display types (enriched from DBClient for rendering)
 * -------------------------------------------------------------------------*/

type ClientStatus = 'active' | 'suspended' | 'pending_approval' | 'draft' | 'terminated' | 'archived';
type ClientTier = 'standard' | 'premium' | 'enterprise' | 'strategic';

interface ClientContact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ClientItem {
  id: string;
  name: string;
  type: 'company' | 'individual';
  status: ClientStatus;
  tier: ClientTier;
  industry: string;
  positionsCount: number;
  revenue: number;
  approvalStatus?: string;
  contacts: ClientContact[];
  contractInfo?: { terms: string; startDate: string; endDate: string };
  feeStructure?: { type: 'percentage' | 'retainer' | 'fixed'; value: number; currency?: string };
}
import {
  Search, Plus, Building2, User, ChevronDown, ChevronUp, X,
  Mail, Phone, Briefcase, DollarSign, Calendar, FileText,
  CheckCircle2, Clock, XCircle, Edit3, Users, Star, Shield, Eye,
  ChevronLeft, ChevronRight, List, LayoutGrid,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

const STATUS_MAP: Record<string, { label: string; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = {
  active: { label: 'Active', color: t => t.colors.successScale[600], bg: t => t.colors.successScale[50] },
  suspended: { label: 'Suspended', color: t => t.colors.errorScale[600], bg: t => t.colors.errorScale[50] },
  pending_approval: { label: 'Pending', color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  draft: { label: 'Draft', color: t => t.colors.neutral[500], bg: t => t.colors.neutral[100] },
  terminated: { label: 'Terminated', color: t => t.colors.errorScale[600], bg: t => t.colors.errorScale[50] },
  archived: { label: 'Archived', color: t => t.colors.neutral[500], bg: t => t.colors.neutral[100] },
};

const TIER_MAP: Record<string, { label: string; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = {
  standard: { label: 'Standard', color: t => t.colors.primaryScale[600], bg: t => t.colors.primaryScale[50] },
  premium: { label: 'Premium', color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  enterprise: { label: 'Enterprise', color: t => t.colors.secondaryScale[600], bg: t => t.colors.secondaryScale[50] },
  strategic: { label: 'Strategic', color: t => t.colors.infoScale[600], bg: t => t.colors.infoScale[50] },
};

function formatRevenue(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function formatFee(f: ClientItem['feeStructure']): string {
  if (!f) return 'N/A';
  if (f.type === 'percentage') return `${f.value}%`;
  if (f.type === 'retainer') return `${f.currency ?? 'USD'} ${(f.value ?? 0).toLocaleString()}/mo`;
  return `${f.currency ?? 'USD'} ${(f.value ?? 0).toLocaleString()}`;
}

/**
 * Map a DBClient (or any record) to the local ClientItem for rendering.
 */
function toClientItem(raw: any): ClientItem {
  return {
    id: raw.id ?? '',
    name: raw.displayName ?? raw.clientCompanyName ?? raw.name ?? '',
    type: raw.type ?? 'company',
    status: raw.status ?? 'draft',
    tier: raw.tier ?? 'standard',
    industry: raw.industry ?? '',
    positionsCount: raw.openPositions ?? raw.positionsCount ?? 0,
    revenue: Number(raw.totalRevenue ?? raw.revenue ?? 0),
    approvalStatus: raw.approvalStatus,
    contacts: Array.isArray(raw.contacts) ? raw.contacts : [],
    contractInfo: raw.contractInfo,
    feeStructure: raw.feeStructure,
  };
}

function filterClients(clients: ClientItem[], f: ClientFilter): ClientItem[] {
  return clients.filter(c => {
    if (f.type && f.type !== 'all' && c.type !== f.type) return false;
    if (f.status && f.status !== 'all' && c.status !== f.status) return false;
    if (f.tier && f.tier !== 'all' && c.tier !== f.tier) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!(c.name || '').toLowerCase().includes(q) && !(c.industry || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const CardsBhClientDirectory = createPreset<BhClientDirectoryProps>({
  name: 'BhClientDirectory.Cards',
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
      clients: clientsProp,
      filters: filtersProp,
      onFilterChange,
      onClientSelect,
      onAddClient,
      onEditClient,
      viewMode,
      onViewModeChange,
      totalCount: totalCountProp,
      pageSize: pageSizeProp,
      currentPage: currentPageProp,
      onPageChange,
      className, style,
    } = props;

    const clients: ClientItem[] = useMemo(
      () => clientsProp?.length ? clientsProp.map(toClientItem) : [],
      [clientsProp],
    );

    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

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

    const toggleExpand = useCallback((id: string) => {
      const next = expandedCard === id ? null : id;
      setExpandedCard(next);
      onClientSelect?.(id);
    }, [expandedCard, onClientSelect]);

    return (
      <Box className={className} role="region" aria-label="Client Directory Cards" style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...glassStyle,
        ...entrance.animate, transition: entrance.transition,
        ...style,
      }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Building2 size={ICON_SIZES.section} color={t.colors.primaryScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
                Client Directory
              </Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>{filtered.length} clients</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {/* View mode toggle */}
            {onViewModeChange && (
              <Box style={{ display: 'flex', border: `1px solid ${t.colors.neutral[200]}`, borderRadius: br, overflow: 'hidden' }}>
                {([{ mode: 'list' as const, icon: List }, { mode: 'grid' as const, icon: LayoutGrid }]).map(({ mode, icon: Icon }) => (
                  <Box
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={viewMode === mode}
                    aria-label={`${mode} view`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      backgroundColor: viewMode === mode ? t.colors.primaryScale[50] : t.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Icon size={14} color={viewMode === mode ? t.colors.primaryScale[600] : t.colors.neutral[400]} />
                  </Box>
                ))}
              </Box>
            )}
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
        </Box>

        {/* Filter bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap',
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }} role="toolbar" aria-label="Filter controls">
          {[
            { label: 'All', value: 'all' as const, icon: <Users size={ICON_SIZES.label} /> },
            { label: 'Companies', value: 'company' as const, icon: <Building2 size={12} /> },
            { label: 'Individuals', value: 'individual' as const, icon: <User size={12} /> },
          ].map(opt => {
            const active = !filters.type || filters.type === opt.value || (opt.value === 'all' && !filters.type);
            return (
              <Box
                key={opt.value}
                onClick={() => updateFilter({ type: opt.value })}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={`Filter by ${opt.label}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                  border: `1px solid ${active ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
                  color: active ? t.colors.primaryScale[700] : t.colors.neutral[600],
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                {opt.icon}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: 'inherit' }}>{opt.label}</Text>
              </Box>
            );
          })}
          {/* Status filter */}
          <Box
            style={{
              position: 'relative',
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
              border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[700], backgroundColor: t.colors.common.white, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
            }}
          >
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
              {filters.status === 'all' || !filters.status ? 'All Statuses' : STATUS_MAP[filters.status as ClientStatus]?.label ?? filters.status}
            </Text>
            <ChevronDown size={12} color={t.colors.neutral[400]} />
            <select
              aria-label="Filter by status"
              value={filters.status ?? 'all'}
              onChange={(e: any) => updateFilter({ status: e.target.value as ClientStatus | 'all' })}
              style={{
                position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
              }}
            />
          </Box>
          {/* Tier filter */}
          <Box
            style={{
              position: 'relative',
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
              border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[700], backgroundColor: t.colors.common.white, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
            }}
          >
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
              {filters.tier === 'all' || !filters.tier ? 'All Tiers' : TIER_MAP[filters.tier as ClientTier]?.label ?? filters.tier}
            </Text>
            <ChevronDown size={12} color={t.colors.neutral[400]} />
            <select
              aria-label="Filter by tier"
              value={filters.tier ?? 'all'}
              onChange={(e: any) => updateFilter({ tier: e.target.value as ClientTier | 'all' })}
              style={{
                position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
              }}
            />
          </Box>
          {/* Search */}
          <Box style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400], pointerEvents: 'none' }} />
            <input
              aria-label="Search clients"
              value={filters.search ?? ''}
              onChange={(e: any) => updateFilter({ search: e.target.value })}
              placeholder="Search clients..."
              style={{
                width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px ${t.spacing[8]}px`,
                border: `1px solid ${t.colors.neutral[200]}`, borderRadius: br,
                fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900], backgroundColor: t.colors.common.white,
                outline: 'none',
              }}
            />
          </Box>
        </Box>

        {/* Card grid */}
        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
          {filtered.length === 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...createEmptyStateStyle(t) }}>
              <Search size={32} style={{ marginBottom: t.spacing[3], opacity: 0.5, color: t.colors.neutral[300] }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[400] }}>No clients found</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Try adjusting your filters</Text>
            </Box>
          )}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: t.spacing[4] }}>
            {filtered.map((client, idx) => {
              const isExpanded = expandedCard === client.id;
              const st = STATUS_MAP[client.status] ?? STATUS_MAP.draft;
              const ti = TIER_MAP[client.tier] ?? TIER_MAP.standard;
              const itemEntrance = createEntranceAnimation(t, { index: idx });

              return (
                <Box key={client.id} style={{
                  ...animStyle(idx),
                  borderRadius: t.borderRadius.xl, border: `1px solid ${isExpanded ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                  backgroundColor: t.colors.common.white, overflow: 'hidden', transition: `border-color ${t.motion.hover}`,
                  ...itemEntrance.animate,
                }}>
                  {/* Card header */}
                  <Box
                    onClick={() => toggleExpand(client.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`${client.name} - ${st.label} - ${ti.label}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[3],
                      padding: `${t.spacing[4]}px`, cursor: 'pointer',
                    }}
                  >
                    <Box style={createIconContainerStyle(t, {
                      size: 44,
                      color: client.type === 'company' ? t.colors.primaryScale[50] : t.colors.secondaryScale[50],
                    })}>
                      {client.type === 'company'
                        ? <Building2 size={ICON_SIZES.feature} color={t.colors.primaryScale[600]} />
                        : <User size={ICON_SIZES.feature} color={t.colors.secondaryScale[600]} />}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{client.name}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                        <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: ti.bg(t) }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: ti.color(t), fontWeight: t.typography.fontWeight.medium }}>
                            <Star size={ICON_SIZES.inline} style={{ verticalAlign: 'middle', marginRight: t.spacing[1] }} />{ti.label}
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
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
                      { label: 'Positions', value: client.positionsCount },
                      { label: 'Revenue', value: formatRevenue(client.revenue) },
                      { label: 'Contacts', value: client.contacts.length },
                    ].map(s => (
                      <Box key={s.label} style={{ ...createMetadataFieldStyle(t), flex: 1, textAlign: 'center', padding: `${t.spacing[3]}px 0` }}>
                        <Text style={createStatValueStyle(t, { size: 'lg' })}>{s.value}</Text>
                        <Text style={createStatLabelStyle(t)}>{s.label}</Text>
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
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                        <Users size={13} style={{ color: t.colors.primaryScale[500] }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>Contacts</Text>
                      </Box>
                      {client.contacts.map((contact, ci) => (
                        <Box key={ci} style={{
                          ...animStyle(ci),
                          display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                          backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[100]}`,
                        }}>
                          <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.secondaryScale[50] })}>
                            <User size={13} color={t.colors.secondaryScale[600]} />
                          </Box>
                          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{contact.name}</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{contact.role}</Text>
                          </Box>
                          <Mail size={ICON_SIZES.label} style={{ color: t.colors.primaryScale[400] }} />
                          <Phone size={ICON_SIZES.label} style={{ color: t.colors.primaryScale[400] }} />
                        </Box>
                      ))}

                      {/* Contract */}
                      {client.contractInfo && (
                        <Box style={{ marginTop: t.spacing[3] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                            <FileText size={13} style={{ color: t.colors.primaryScale[500] }} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>Contract</Text>
                          </Box>
                          <Box style={{
                            ...createMetadataGridStyle(t, { columns: 2 }),
                            gap: t.spacing[2],
                            padding: t.spacing[3], borderRadius: t.borderRadius.lg,
                            backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[100]}`,
                          }}>
                            <Box style={createMetadataFieldStyle(t)}>
                              <Text style={createMetadataLabelStyle(t)}>Terms</Text>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{client.contractInfo.terms}</Text>
                            </Box>
                            <Box style={createMetadataFieldStyle(t)}>
                              <Text style={createMetadataLabelStyle(t)}>Fee</Text>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{formatFee(client.feeStructure)}</Text>
                            </Box>
                            <Box style={createMetadataFieldStyle(t)}>
                              <Text style={createMetadataLabelStyle(t)}>Start</Text>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                                <Calendar size={ICON_SIZES.inline} color={t.colors.neutral[500]} />
                                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800] }}>{client.contractInfo.startDate}</Text>
                              </Box>
                            </Box>
                            <Box style={createMetadataFieldStyle(t)}>
                              <Text style={createMetadataLabelStyle(t)}>End</Text>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                                <Calendar size={ICON_SIZES.inline} color={t.colors.neutral[500]} />
                                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800] }}>{client.contractInfo.endDate}</Text>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box style={{ display: 'flex', gap: t.spacing[2], justifyContent: 'flex-end', marginTop: t.spacing[3], paddingTop: t.spacing[3], borderTop: `1px solid ${t.colors.neutral[100]}` }}>
                        <Box
                          onClick={() => onEditClient?.(client.id, {})}
                          role="button"
                          tabIndex={0}
                          aria-label={`Edit ${client.name}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: t.spacing[1],
                            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                            border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                            color: t.colors.neutral[700], fontSize: t.typography.fontSize.xs, cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                          }}
                        >
                          <Edit3 size={11} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>Edit</Text>
                        </Box>
                        <Box
                          onClick={() => onClientSelect?.(client.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`View ${client.name} details`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: t.spacing[1],
                            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                            backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                          }}
                        >
                          <Briefcase size={11} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>View Details</Text>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Pagination */}
          {(totalCountProp != null || currentPageProp != null || pageSizeProp != null) && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${t.spacing[3]}px 0`,
              marginTop: t.spacing[3],
            }} role="navigation" aria-label="Pagination">
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {totalCountProp != null
                  ? `${totalCountProp} total client${totalCountProp !== 1 ? 's' : ''}`
                  : `${filtered.length} client${filtered.length !== 1 ? 's' : ''}`}
                {pageSizeProp != null && ` | ${pageSizeProp} per page`}
              </Text>
              {currentPageProp != null && onPageChange && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box
                    onClick={() => currentPageProp > 1 && onPageChange(currentPageProp - 1)}
                    role="button"
                    tabIndex={0}
                    aria-label="Previous page"
                    aria-disabled={currentPageProp <= 1}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: br,
                      border: `1px solid ${t.colors.neutral[200]}`,
                      backgroundColor: t.colors.common.white,
                      cursor: currentPageProp > 1 ? 'pointer' : 'not-allowed',
                      opacity: currentPageProp > 1 ? 1 : 0.4,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <ChevronLeft size={14} color={t.colors.neutral[600]} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                    Page {currentPageProp}{totalCountProp != null && pageSizeProp ? ` of ${Math.ceil(totalCountProp / pageSizeProp)}` : ''}
                  </Text>
                  <Box
                    onClick={() => {
                      const totalPages = totalCountProp != null && pageSizeProp ? Math.ceil(totalCountProp / pageSizeProp) : Infinity;
                      if (currentPageProp < totalPages) onPageChange(currentPageProp + 1);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Next page"
                    aria-disabled={totalCountProp != null && pageSizeProp ? currentPageProp >= Math.ceil(totalCountProp / pageSizeProp) : false}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: br,
                      border: `1px solid ${t.colors.neutral[200]}`,
                      backgroundColor: t.colors.common.white,
                      cursor: 'pointer',
                      opacity: totalCountProp != null && pageSizeProp && currentPageProp >= Math.ceil(totalCountProp / pageSizeProp) ? 0.4 : 1,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <ChevronRight size={14} color={t.colors.neutral[600]} />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
