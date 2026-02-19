'use client';

/**
 * BhClientList - Table Preset
 * DataTable layout with sortable columns, tier/contract badges,
 * revenue formatting, and row-level click interaction.
 */

import { useMemo, useCallback } from 'react';
import {
  Building,
  Briefcase,
  DollarSign,
  UserCheck,
  Crown,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createEmptyStateStyle,
  createPersonalityAccentBar,

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhClientListProps, RecruiterClient } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function getClientName(client: RecruiterClient): string {
  return client.displayName ?? client.clientCompanyName ?? '';
}

function getTierBadge(tier: string | null | undefined) {
  switch (tier) {
    case 'enterprise': return { color: 'primary' as const, icon: Crown };
    case 'premium': return { color: 'info' as const, icon: Shield };
    case 'strategic': return { color: 'warning' as const, icon: Crown };
    case 'standard':
    default: return { color: 'secondary' as const, icon: Zap };
  }
}

function getStatusBadge(status: string | null | undefined) {
  switch (status) {
    case 'active': return { color: 'success' as const, icon: CheckCircle2 };
    case 'suspended': return { color: 'warning' as const, icon: AlertTriangle };
    case 'terminated':
    case 'archived': return { color: 'error' as const, icon: Clock };
    case 'draft':
    case 'pending_approval':
    default: return { color: 'secondary' as const, icon: Clock };
  }
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Table Preset                                                       */
/* ------------------------------------------------------------------ */
export const TableBhClientList = createPreset<BhClientListProps>({
  name: 'BhClientList.Table',
  render: ({ primitives, props, tokens }: PresetContext<BhClientListProps>) => {
    const isGlass = tokens.surface.useGlass;
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      clients: clientsProp,
      onClientClick,
      selectedClientId,
      sortBy,
      onSortChange,
      filterStatus,
      filterTier,
      loading,
      className,
      style,
    } = props;

    const clients = clientsProp?.length ? clientsProp : [];

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 0 }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const handleClientClick = useCallback((clientId: string) => { onClientClick?.(clientId); }, [onClientClick]);
    const handleSortChange = useCallback((field: string) => { onSortChange?.(field); }, [onSortChange]);

    // Use top-level helper functions for tier/status badge rendering

    const formatRevenue = useCallback((amount: number) => {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
      return `$${amount}`;
    }, []);

    /* -- Loading --------------------------------------------------- */
    if (loading) {
      return (
        <Box className={className} style={{ ...card, padding: t.spacing[6], ...style }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[3], padding: t.spacing[8] }}>
            <Loader2 size={20} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>Loading clients...</Text>
          </Box>
        </Box>
      );
    }

    if (clients.length === 0) {
      return (
        <Box className={className} style={{ ...card, ...style }}>
          <Box style={emptyStyle}>
            <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }}>
              <Building size={40} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>
              No clients found
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              Clients will appear here once added.
            </Text>
          </Box>
        </Box>
      );
    }

    const columns = [
      { key: 'name', label: 'Client', width: '2fr' },
      { key: 'tier', label: 'Tier', width: '100px' },
      { key: 'status', label: 'Status', width: '110px' },
      { key: 'openPositions', label: 'Open Roles', width: '90px' },
      { key: 'totalHires', label: 'Hires', width: '70px' },
      { key: 'revenue', label: 'Revenue', width: '100px' },
      { key: '', label: '', width: '40px' },
    ];

    const gridCols = columns.map((c) => c.width).join(' ');

    return (
      <Box className={className} style={{ ...card, overflow: 'hidden', width: '100%', ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{ color: t.colors.primaryScale[500] }}>
              <Building size={18} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
              Clients
            </Text>
            <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, marginLeft: t.spacing[2] }}>
              <Text style={{ fontSize: 'inherit' }}>{clients.length}</Text>
            </Box>
            {filterStatus && (
              <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, marginLeft: t.spacing[1] }}>
                <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>Status: {filterStatus}</Text>
              </Box>
            )}
            {filterTier && (
              <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR, marginLeft: t.spacing[1] }}>
                <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>Tier: {filterTier}</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Column headers */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: t.spacing[2],
            padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
            backgroundColor: t.colors.neutral[50],
            borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
          }}
        >
          {columns.map((col) => (
            <Box
              key={col.key || 'action'}
              role={col.key && onSortChange ? 'button' : undefined}
              tabIndex={col.key && onSortChange ? 0 : undefined}
              aria-label={col.key && onSortChange ? `Sort by ${col.label}` : undefined}
              onClick={col.key && onSortChange ? () => handleSortChange(col.key) : undefined}
              onKeyDown={col.key && onSortChange ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSortChange(col.key); }
              } : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                cursor: col.key && onSortChange ? 'pointer' : 'default',
              }}
            >
              <Text style={{ ...sectionHdr, marginBottom: 0 }}>{col.label}</Text>
              {col.key && onSortChange && (
                <ArrowUpDown size={10} style={{ color: sortBy === col.key ? t.colors.primaryScale[500] : t.colors.neutral[400] }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Rows */}
        {clients.map((client, idx) => {
          const isSelected = selectedClientId === client.id;
          const clientDisplayName = getClientName(client);
          const tb = getTierBadge(client.tier);
          const cb = getStatusBadge(client.status);
          const TierIcon = tb.icon;
          const ContractIcon = cb.icon;

          return (
            <Box
              key={client.id}
              role="button"
              tabIndex={0}
              aria-label={`View client ${clientDisplayName}`}
              aria-selected={isSelected}
              onClick={() => handleClientClick(client.id)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClientClick(client.id); }
              }}
              style={{
                ...animStyle(idx),
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: t.spacing[2],
                padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[600]}` : '3px solid transparent',
                transition: `all ${t.motion.hover}`,
                ...entrance.animate,
              }}
              onMouseEnter={(e: any) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = t.colors.neutral[50];
              }}
              onMouseLeave={(e: any) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Client name */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], minWidth: 0 }}>
                <Box style={{
                  ...createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[100] }),
                  color: t.colors.primaryScale[700],
                  flexShrink: 0,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
                    {(clientDisplayName || '').charAt(0)}
                  </Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, minWidth: 0 }}>
                  {clientDisplayName}
                </Text>
              </Box>

              {/* Tier */}
              <Box>
                <Box style={{ ...createBadgeStyle(t, tb.color), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <TierIcon size={10} />
                  <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{client.tier ?? 'standard'}</Text>
                </Box>
              </Box>

              {/* Contract */}
              <Box>
                <Box style={{ ...createBadgeStyle(t, cb.color), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <ContractIcon size={10} />
                  <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{client.status ?? 'draft'}</Text>
                </Box>
              </Box>

              {/* Open positions */}
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], textAlign: 'center' as const }}>
                {client.openPositions ?? 0}
              </Text>

              {/* Hires */}
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], textAlign: 'center' as const }}>
                {client.totalPositions ?? 0}
              </Text>

              {/* Revenue */}
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>
                {formatRevenue(Number(client.totalRevenue ?? 0))}
              </Text>

              {/* Chevron */}
              <Box style={{ display: 'flex', justifyContent: 'center', color: t.colors.neutral[400] }}>
                <ChevronRight size={16} />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  },
});
