'use client';

/**
 * BhAgentGallery - Gallery Preset
 * Grid-based agent browse and select with preview modal,
 * tab navigation, filter bar, agent cards, and marketplace section.
 *
 * Design: Rich card grid with sparkline usage charts, hover action
 * overlays, featured marketplace section, and personality-driven styling.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createDividerStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createIconContainerStyle,
  createPersonalityAccentBar,
  createSectionHeaderStyle,
  getCardPadding,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhAgentGalleryProps,
  AgentFilter,
  AgentTab,
  AgentViewMode,
  AgentType,
  AgentStatus,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Bot,
  Users,
  Store,
  Search,
  Grid3X3,
  List,
  Copy,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Eye,
  Star,
  Download,
  X,
  Play,
  Phone,
  MessageSquare,
  Calendar,
  Mail,
  Compass,
  Settings,
  Filter,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline polyline points from data array                 */
/* ------------------------------------------------------------------ */
function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function sparklinePolygonPoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const line = sparklinePoints(data, width, height, padding);
  const lastX = padding + (data.length - 1) * ((width - padding * 2) / (data.length - 1 || 1));
  return `${padding},${height - padding} ${line} ${lastX},${height - padding}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: agent type icon mapping                                   */
/* ------------------------------------------------------------------ */
function getAgentTypeIcon(type: AgentType, size: number) {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (type) {
    case 'screener': return <Phone {...iconProps} />;
    case 'interviewer': return <MessageSquare {...iconProps} />;
    case 'scheduler': return <Calendar {...iconProps} />;
    case 'outreach': return <Mail {...iconProps} />;
    case 'sourcer': return <Compass {...iconProps} />;
    case 'custom': return <Settings {...iconProps} />;
    default: return <Bot {...iconProps} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: language label (no emoji flags)                           */
/* ------------------------------------------------------------------ */
function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    en: 'EN', es: 'ES', fr: 'FR', de: 'DE', pt: 'PT',
    ja: 'JA', ko: 'KO', zh: 'ZH', it: 'IT', nl: 'NL',
    ar: 'AR', hi: 'HI', ru: 'RU',
  };
  return labels[language.toLowerCase()] || language.toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Helper: status color mapping                                      */
/* ------------------------------------------------------------------ */
function getStatusInfo(status: AgentStatus, tokens: DesignTokens): { color: string; bg: string; label: string } {
  switch (status) {
    case 'active':
      return { color: tokens.colors.successScale[600], bg: tokens.colors.successScale[100], label: 'Active' };
    case 'inactive':
      return { color: tokens.colors.neutral[500], bg: tokens.colors.neutral[100], label: 'Inactive' };
    case 'draft':
      return { color: tokens.colors.warningScale[600], bg: tokens.colors.warningScale[100], label: 'Draft' };
    case 'error':
      return { color: tokens.colors.errorScale[600], bg: tokens.colors.errorScale[100], label: 'Error' };
    default:
      return { color: tokens.colors.neutral[500], bg: tokens.colors.neutral[100], label: status };
  }
}

/* ------------------------------------------------------------------ */
/*  Gallery Preset                                                    */
/* ------------------------------------------------------------------ */
export const GalleryBhAgentGallery = createPreset<BhAgentGalleryProps>({
  name: 'BhAgentGallery.Gallery',
  render: ({ primitives, props, tokens }: PresetContext<BhAgentGalleryProps>) => {
    const { Box, Text } = primitives;

    const {
      agents = [],
      activeTab: controlledTab,
      onTabChange,
      filters: controlledFilters,
      onFilterChange,
      selectedAgent: controlledSelected,
      onAgentSelect,
      onDuplicate,
      onEdit,
      onActivate,
      onDeactivate,
      onDelete,
      viewMode: controlledViewMode,
      onViewModeChange,
      showPreview: controlledShowPreview,
      onPreviewToggle,
      previewData,
      tabCounts,
      className,
      style,
    } = props;

    /* ---- Local state with controlled/uncontrolled support ---- */
    const [localTab, setLocalTab] = useState<AgentTab>('my');
    const [localFilters, setLocalFilters] = useState<AgentFilter>({ type: 'all', language: 'all', provider: 'all', tone: 'all', status: 'all', search: '' });
    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const [localShowPreview, setLocalShowPreview] = useState(false);
    const [localViewMode, setLocalViewMode] = useState<AgentViewMode>('grid');

    const activeTab = controlledTab ?? localTab;
    const filters = controlledFilters ?? localFilters;
    const selectedAgent = controlledSelected ?? localSelected;
    const showPreview = controlledShowPreview ?? localShowPreview;
    const viewMode = controlledViewMode ?? localViewMode;

    const handleTabChange = useCallback((tab: AgentTab) => { onTabChange?.(tab); if (controlledTab === undefined) setLocalTab(tab); }, [onTabChange, controlledTab]);
    const handleFilterChange = useCallback((f: AgentFilter) => { onFilterChange?.(f); if (controlledFilters === undefined) setLocalFilters(f); }, [onFilterChange, controlledFilters]);
    const handleSelect = useCallback((id: string) => { onAgentSelect?.(id); if (controlledSelected === undefined) setLocalSelected(id); }, [onAgentSelect, controlledSelected]);
    const handlePreviewToggle = useCallback((show: boolean) => { onPreviewToggle?.(show); if (controlledShowPreview === undefined) setLocalShowPreview(show); }, [onPreviewToggle, controlledShowPreview]);
    const handleViewModeChange = useCallback((mode: AgentViewMode) => { onViewModeChange?.(mode); if (controlledViewMode === undefined) setLocalViewMode(mode); }, [onViewModeChange, controlledViewMode]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = useMemo(() => getHoverTransform(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);
    const emptyState = useMemo(() => createEmptyStateStyle(tokens), [tokens]);
    const iconContainer = useMemo(() => createIconContainerStyle(tokens, { size: 40, color: tokens.colors.primaryScale[50] }), [tokens]);
    const iconContainerSm = useMemo(() => createIconContainerStyle(tokens, { size: 32, color: tokens.colors.primaryScale[50] }), [tokens]);

    /* ---- Filtering ---- */
    const filteredAgents = useMemo(() => {
      return agents.filter((a) => {
        if (filters.type && filters.type !== 'all' && a.type !== filters.type) return false;
        if (filters.language && filters.language !== 'all' && a.language !== filters.language) return false;
        if (filters.provider && filters.provider !== 'all' && a.voiceProvider !== filters.provider) return false;
        if (filters.status && filters.status !== 'all' && a.status !== filters.status) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          if (!a.name.toLowerCase().includes(q) && !a.type.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    }, [agents, filters]);

    const selectedAgentData = useMemo(() => agents.find((a) => a.id === selectedAgent), [agents, selectedAgent]);
    const counts = tabCounts ?? { my: agents.length, team: 0, marketplace: 0 };

    /* ---- Tab config ---- */
    const tabs: { key: AgentTab; label: string; icon: React.ReactNode; count: number }[] = [
      { key: 'my', label: 'My Agents', icon: <Bot size={16} strokeWidth={1.5} />, count: counts.my },
      { key: 'team', label: 'Team Agents', icon: <Users size={16} strokeWidth={1.5} />, count: counts.team },
      { key: 'marketplace', label: 'Marketplace', icon: <Store size={16} strokeWidth={1.5} />, count: counts.marketplace },
    ];

    /* ---- Filter options ---- */
    const typeOptions: { value: string; label: string }[] = [
      { value: 'all', label: 'All Types' },
      { value: 'screener', label: 'Screener' },
      { value: 'interviewer', label: 'Interviewer' },
      { value: 'scheduler', label: 'Scheduler' },
      { value: 'outreach', label: 'Outreach' },
      { value: 'sourcer', label: 'Sourcer' },
      { value: 'custom', label: 'Custom' },
    ];

    const statusOptions: { value: string; label: string }[] = [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'draft', label: 'Draft' },
      { value: 'error', label: 'Error' },
    ];

    const uniqueLanguages = useMemo(() => {
      const langs = new Set(agents.map((a) => a.language));
      return ['all', ...Array.from(langs)];
    }, [agents]);

    const uniqueProviders = useMemo(() => {
      const provs = new Set(agents.map((a) => a.voiceProvider));
      return ['all', ...Array.from(provs)];
    }, [agents]);

    /* ---- Reusable icon button style ---- */
    const iconBtnStyle = useCallback((bg: string, color: string): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: tokens.spacing[7],
      height: tokens.spacing[7],
      borderRadius: tokens.borderRadius.md,
      border: 'none',
      backgroundColor: bg,
      boxShadow: tokens.shadows.sm,
      color,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    }), [tokens]);

    /* ---- Select style helper ---- */
    const selectStyle: React.CSSProperties = useMemo(() => ({
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      outline: 'none',
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
      backgroundImage: 'none',
      minWidth: 120,
    }), [tokens]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  1. Tab Bar                                                  */}
        {/* =========================================================== */}
        <Box
          role="tablist"
          aria-label="Agent tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...(isGlass ? { backdropFilter: tokens.glass?.blur, WebkitBackdropFilter: tokens.glass?.blur, backgroundColor: tokens.glass?.bg } : {}),
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Box
                key={tab.key}
                role="tab"
                tabIndex={0}
                aria-selected={isActive}
                aria-label={`${tab.label} (${tab.count})`}
                onClick={() => handleTabChange(tab.key)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabChange(tab.key); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: badgeRadius,
                  border: isActive
                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                  backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                  color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400] }}>
                  {tab.icon}
                </Box>
                <Text>{tab.label}</Text>
                <Box
                  style={{
                    padding: `0 ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: isActive ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                    color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    minWidth: tokens.spacing[5],
                    textAlign: 'center' as const,
                  }}
                >
                  <Text>{tab.count}</Text>
                </Box>
              </Box>
            );
          })}

          {/* View mode toggle */}
          <Box style={{ marginLeft: 'auto', display: 'flex', gap: tokens.spacing[1] }} role="radiogroup" aria-label="View mode">
            {(['grid', 'list'] as const).map((mode) => (
              <Box
                key={mode}
                role="radio"
                tabIndex={0}
                aria-checked={viewMode === mode}
                aria-label={`${mode} view`}
                onClick={() => handleViewModeChange(mode)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewModeChange(mode); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tokens.spacing[8],
                  height: tokens.spacing[8],
                  borderRadius: tokens.borderRadius.md,
                  border: viewMode === mode
                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: viewMode === mode ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: viewMode === mode ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {mode === 'grid' ? <Grid3X3 size={16} strokeWidth={1.5} /> : <List size={16} strokeWidth={1.5} />}
              </Box>
            ))}
          </Box>
        </Box>

        {/* =========================================================== */}
        {/*  2. Filter Bar                                               */}
        {/* =========================================================== */}
        <Box
          role="search"
          aria-label="Filter agents"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}
        >
          {/* Search */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              flex: 1,
              maxWidth: 320,
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}
          >
            <Search size={16} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search agents..."
              aria-label="Search agents"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                flex: 1,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                fontFamily: 'inherit',
              }}
            />
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', color: tokens.colors.neutral[400] }}>
            <Filter size={16} strokeWidth={1.5} />
          </Box>

          <select aria-label="Filter by type" value={filters.type || 'all'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange({ ...filters, type: e.target.value as AgentType | 'all' })} style={selectStyle}>
            {typeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>

          <select aria-label="Filter by language" value={filters.language || 'all'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange({ ...filters, language: e.target.value })} style={selectStyle}>
            {uniqueLanguages.map((lang) => (<option key={lang} value={lang}>{lang === 'all' ? 'All Languages' : getLanguageLabel(lang)}</option>))}
          </select>

          <select aria-label="Filter by provider" value={filters.provider || 'all'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange({ ...filters, provider: e.target.value })} style={selectStyle}>
            {uniqueProviders.map((prov) => (<option key={prov} value={prov}>{prov === 'all' ? 'All Providers' : prov}</option>))}
          </select>

          <select aria-label="Filter by status" value={filters.status || 'all'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange({ ...filters, status: e.target.value as AgentStatus | 'all' })} style={selectStyle}>
            {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </Box>

        {/* =========================================================== */}
        {/*  3. Agent Cards Grid                                         */}
        {/* =========================================================== */}
        <Box style={{ flex: 1, overflow: 'auto' as const, padding: tokens.spacing[5] }}>
          {filteredAgents.length === 0 ? (
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...emptyState, padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px` }}>
              <Bot size={48} strokeWidth={1} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[4] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>
                No agents found
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                Try adjusting your filters or create a new agent
              </Text>
            </Box>
          ) : (
            <>
              {/* Marketplace featured section */}
              {activeTab === 'marketplace' && filteredAgents.some((a) => a.rating && a.rating >= 4.5) && (
                <Box style={{ marginBottom: tokens.spacing[6] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <Star size={16} strokeWidth={1.5} style={{ color: tokens.colors.warningScale[500] }} />
                    <Text style={{ ...sectionHeader, marginBottom: 0 }}>Featured Agents</Text>
                  </Box>
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
                    {filteredAgents
                      .filter((a) => a.rating && a.rating >= 4.5)
                      .slice(0, 3)
                      .map((agent) => (
                        <Box
                          key={`featured-${agent.id}`}
                          role="button"
                          tabIndex={0}
                          aria-label={`Select featured agent ${agent.name}`}
                          onClick={() => handleSelect(agent.id)}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(agent.id); } }}
                          style={{
                            ...cardBase,
                            padding: padding,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            border: selectedAgent === agent.id
                              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[400]}`
                              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                            background: isGlass ? tokens.glass?.bg : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.secondaryScale[50]})`,
                            position: 'relative' as const,
                            overflow: 'hidden',
                            ...accentLayout.outer,
                          }}
                          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                            Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                            (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                          }}
                          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                            (e.currentTarget as HTMLDivElement).style.transform = 'none';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.sm;
                          }}
                        >
                          <Box style={accentBar || undefined} />
                          <Box style={accentLayout.inner}>
                          {/* Featured badge */}
                          <Box
                            style={{
                              position: 'absolute' as const,
                              top: tokens.spacing[2],
                              right: tokens.spacing[2],
                              ...createBadgeStyle(tokens, 'warning'),
                              fontSize: tokens.typography.fontSize.xs,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Star size={12} strokeWidth={2} style={{ marginRight: tokens.spacing[1] }} />
                            <Text>Featured</Text>
                          </Box>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                            <Box style={{ ...iconContainer, color: tokens.colors.primaryScale[600] }}>
                              {getAgentTypeIcon(agent.type, 20)}
                            </Box>
                            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], display: 'block' }}>
                                {agent.name}
                              </Text>
                              {agent.author && (
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>by {agent.author}</Text>
                              )}
                            </Box>
                          </Box>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                            {agent.rating !== undefined && (
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                <Star size={14} strokeWidth={2} style={{ color: tokens.colors.warningScale[500], fill: tokens.colors.warningScale[500] }} />
                                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                                  {(agent.rating ?? 0).toFixed(1)}
                                </Text>
                              </Box>
                            )}
                            {agent.downloads !== undefined && (
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                <Download size={14} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                                  {(agent.downloads ?? 0).toLocaleString()}
                                </Text>
                              </Box>
                            )}
                          </Box>
                          </Box>
                        </Box>
                      ))}
                  </Box>

                  <Box style={divider} />
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
                    <Bot size={16} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
                    <Text style={{ ...sectionHeader, marginBottom: 0 }}>All Agents</Text>
                  </Box>
                </Box>
              )}

              {/* Main grid */}
              <Box role="list" aria-label="Agent cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: tokens.spacing[4] }}>
                {filteredAgents.map((agent) => {
                  const statusInfo = getStatusInfo(agent.status, tokens);
                  const isSelected = selectedAgent === agent.id;

                  return (
                    <Box
                      key={agent.id}
                      role="listitem"
                      onClick={() => handleSelect(agent.id)}
                      style={{
                        ...cardBase,
                        padding: 0,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        border: isSelected
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[400]}`
                          : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        overflow: 'hidden',
                        position: 'relative' as const,
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                        Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                        (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                        const actions = e.currentTarget.querySelector('[data-agent-actions]') as HTMLDivElement | null;
                        if (actions) actions.style.opacity = '1';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'none';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.sm;
                        const actions = e.currentTarget.querySelector('[data-agent-actions]') as HTMLDivElement | null;
                        if (actions) actions.style.opacity = '0';
                      }}
                    >
                      {/* Card content */}
                      <Box style={{ padding: padding }}>
                        {/* Header: Icon + Name + Status */}
                        <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                          <Box
                            style={{
                              ...iconContainer,
                              backgroundColor: tokens.colors.primaryScale[50],
                              color: tokens.colors.primaryScale[600],
                            }}
                          >
                            {getAgentTypeIcon(agent.type, 20)}
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.md,
                                  fontWeight: typo.headingWeight,
                                  letterSpacing: typo.headingLetterSpacing,
                                  color: tokens.colors.neutral[900],
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap' as const,
                                }}
                              >
                                {agent.name}
                              </Text>
                              {agent.isDefault && (
                                <Box style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px`, lineHeight: tokens.typography.lineHeight.relaxed }}>
                                  <Text>Default</Text>
                                </Box>
                              )}
                            </Box>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <Box style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px`, textTransform: 'capitalize' as const }}>
                                <Text>{agent.type}</Text>
                              </Box>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                <Box style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: statusInfo.color }} />
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: statusInfo.color }}>{statusInfo.label}</Text>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* Meta row */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>
                              {getLanguageLabel(agent.language)}
                            </Text>
                          </Box>
                          <Box style={{ ...createBadgeStyle(tokens, 'secondary'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px` }}>
                            <Text>{agent.voiceProvider}</Text>
                          </Box>
                          {activeTab === 'marketplace' && agent.rating !== undefined && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginLeft: 'auto' }}>
                              <Star size={12} strokeWidth={2} style={{ color: tokens.colors.warningScale[500], fill: tokens.colors.warningScale[500] }} />
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                                {(agent.rating ?? 0).toFixed(1)}
                              </Text>
                              {agent.downloads !== undefined && (
                                <>
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], margin: `0 ${tokens.spacing[1]}px` }}>|</Text>
                                  <Download size={12} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{(agent.downloads ?? 0).toLocaleString()}</Text>
                                </>
                              )}
                            </Box>
                          )}
                        </Box>

                        {/* Usage sparkline */}
                        {agent.usageSparkline.length > 0 && (
                          <Box style={{ marginBottom: tokens.spacing[2] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginBottom: tokens.spacing[1] }}>
                              Usage (last 14 days)
                            </Text>
                            <svg width="100%" height={40} viewBox="0 0 200 40" preserveAspectRatio="none" style={{ display: 'block' }} aria-hidden="true">
                              <polygon points={sparklinePolygonPoints(agent.usageSparkline, 200, 40, 2)} fill={tokens.colors.primaryScale[100]} stroke="none" />
                              <polyline points={sparklinePoints(agent.usageSparkline, 200, 40, 2)} fill="none" stroke={tokens.colors.primaryScale[500]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Box>
                        )}

                        {/* Preview button */}
                        <Box
                          role="button"
                          tabIndex={0}
                          aria-label={`Preview ${agent.name}`}
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelect(agent.id); handlePreviewToggle(true); }}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleSelect(agent.id); handlePreviewToggle(true); } }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: tokens.spacing[1],
                            width: '100%',
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            backgroundColor: tokens.colors.neutral[50],
                            color: tokens.colors.neutral[600],
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Eye size={14} strokeWidth={1.5} />
                          <Text>Preview</Text>
                        </Box>
                      </Box>

                      {/* ---- Hover Actions Overlay ---- */}
                      <Box
                        data-agent-actions=""
                        style={{
                          position: 'absolute' as const,
                          top: tokens.spacing[2],
                          right: tokens.spacing[2],
                          display: 'flex',
                          gap: tokens.spacing[1],
                          opacity: 0,
                          transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
                        }}
                      >
                        {onDuplicate && (
                          <Box role="button" tabIndex={0} aria-label={`Duplicate ${agent.name}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDuplicate(agent.id); }} style={iconBtnStyle(tokens.colors.common.white, tokens.colors.neutral[600])}>
                            <Copy size={14} strokeWidth={1.5} />
                          </Box>
                        )}
                        {onEdit && (
                          <Box role="button" tabIndex={0} aria-label={`Edit ${agent.name}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(agent.id); }} style={iconBtnStyle(tokens.colors.common.white, tokens.colors.neutral[600])}>
                            <Pencil size={14} strokeWidth={1.5} />
                          </Box>
                        )}
                        {agent.status === 'active' && onDeactivate && (
                          <Box role="button" tabIndex={0} aria-label={`Deactivate ${agent.name}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDeactivate(agent.id); }} style={iconBtnStyle(tokens.colors.warningScale[50], tokens.colors.warningScale[600])}>
                            <PowerOff size={14} strokeWidth={1.5} />
                          </Box>
                        )}
                        {agent.status !== 'active' && onActivate && (
                          <Box role="button" tabIndex={0} aria-label={`Activate ${agent.name}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onActivate(agent.id); }} style={iconBtnStyle(tokens.colors.successScale[50], tokens.colors.successScale[600])}>
                            <Power size={14} strokeWidth={1.5} />
                          </Box>
                        )}
                        {onDelete && (
                          <Box role="button" tabIndex={0} aria-label={`Delete ${agent.name}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(agent.id); }} style={iconBtnStyle(tokens.colors.errorScale[50], tokens.colors.errorScale[600])}>
                            <Trash2 size={14} strokeWidth={1.5} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </Box>

        {/* =========================================================== */}
        {/*  4. Preview Modal                                            */}
        {/* =========================================================== */}
        {showPreview && selectedAgentData && (
          <Box
            role="dialog"
            aria-modal="true"
            aria-label={`Preview ${selectedAgentData.name}`}
            style={{
              position: 'fixed' as const,
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: tokens.overlay?.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: tokens.spacing[6],
            }}
            onClick={() => handlePreviewToggle(false)}
          >
            <Box
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                ...cardBase,
                padding: 0,
                width: '100%',
                maxWidth: 640,
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column' as const,
                ...(isGlass
                  ? { backdropFilter: tokens.glass?.blurLg, WebkitBackdropFilter: tokens.glass?.blurLg, backgroundColor: tokens.glass?.bgHeavy, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass?.border}` }
                  : { backgroundColor: tokens.colors.common.white }),
              }}
            >
              {/* Modal header */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <Box
                    style={{
                      ...iconContainer,
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[600],
                    }}
                  >
                    {getAgentTypeIcon(selectedAgentData.type, 20)}
                  </Box>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], display: 'block' }}>
                      {selectedAgentData.name}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px`, textTransform: 'capitalize' as const }}>
                        <Text>{selectedAgentData.type}</Text>
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {getLanguageLabel(selectedAgentData.language)} | {selectedAgentData.voiceProvider}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Close preview"
                  onClick={() => handlePreviewToggle(false)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreviewToggle(false); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[8],
                    height: tokens.spacing[8],
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[500],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <X size={18} strokeWidth={1.5} />
                </Box>
              </Box>

              {/* Modal body */}
              <Box style={{ flex: 1, overflow: 'auto' as const, padding: tokens.spacing[5] }}>
                {previewData && (
                  <>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[3] }}>
                      Configuration Summary
                    </Text>
                    <Box
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.neutral[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        marginBottom: tokens.spacing[5],
                      }}
                    >
                      {Object.entries(previewData.configSummary).map(([key, value]) => (
                        <Box key={key} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], textTransform: 'capitalize' as const }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                            {value}
                          </Text>
                        </Box>
                      ))}
                    </Box>

                    {/* Sample conversation */}
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[3] }}>
                      Sample Conversation
                    </Text>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2], marginBottom: tokens.spacing[5] }}>
                      {previewData.sampleConversation.map((line, i) => {
                        const isAgent = i % 2 === 1;
                        return (
                          <Box key={i} style={{ display: 'flex', justifyContent: isAgent ? 'flex-start' : 'flex-end' }}>
                            <Box
                              style={{
                                maxWidth: '75%',
                                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                borderRadius: tokens.borderRadius.lg,
                                backgroundColor: isAgent ? tokens.colors.neutral[100] : tokens.colors.primaryScale[600],
                                color: isAgent ? tokens.colors.neutral[800] : tokens.colors.common.white,
                                fontSize: tokens.typography.fontSize.sm,
                                lineHeight: tokens.typography.lineHeight.relaxed,
                              }}
                            >
                              <Text>{line}</Text>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Voice preview */}
                    {previewData.voicePreviewUrl && (
                      <Box style={{ marginBottom: tokens.spacing[5] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[3] }}>
                          Voice Preview
                        </Text>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[3],
                            padding: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: tokens.colors.neutral[50],
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          }}
                        >
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label="Play voice preview"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: tokens.spacing[9],
                              height: tokens.spacing[9],
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.primaryScale[600],
                              color: tokens.colors.common.white,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            <Play size={16} strokeWidth={2} />
                          </Box>
                          <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: tokens.spacing[0] || 1 }}>
                            {Array.from({ length: 40 }).map((_, i) => (
                              <Box
                                key={i}
                                style={{
                                  flex: 1,
                                  height: Math.max(4, Math.random() * 24),
                                  borderRadius: tokens.borderRadius.sm,
                                  backgroundColor: i < 15 ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200],
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Estimated cost */}
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.infoScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.infoScale[700], fontWeight: tokens.typography.fontWeight.medium }}>
                        Estimated Cost per Conversation
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[800] }}>
                        ${(previewData.estimatedCost ?? 0).toFixed(2)}
                      </Text>
                    </Box>
                  </>
                )}

                {!previewData && (
                  <Box style={{ ...emptyState, padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px` }}>
                    <Eye size={32} strokeWidth={1} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Preview data not available</Text>
                  </Box>
                )}
              </Box>

              {/* Modal footer */}
              <Box
                style={{
                  display: 'flex',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                {onDuplicate && (
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Duplicate agent"
                    onClick={() => { onDuplicate(selectedAgentData.id); handlePreviewToggle(false); }}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDuplicate(selectedAgentData.id); handlePreviewToggle(false); } }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[700],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Copy size={14} strokeWidth={1.5} />
                    <Text>Duplicate</Text>
                  </Box>
                )}
                {onEdit && (
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Edit agent"
                    onClick={() => { onEdit(selectedAgentData.id); handlePreviewToggle(false); }}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(selectedAgentData.id); handlePreviewToggle(false); } }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: tokens.colors.primaryScale[600],
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      marginLeft: 'auto',
                    }}
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                    <Text>Edit Agent</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
