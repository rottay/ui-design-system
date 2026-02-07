'use client';

/**
 * BhAgentGallery - Gallery Preset
 * Grid-based agent browse and select with preview modal,
 * tab navigation, filter bar, agent cards, and marketplace section.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type {
  BhAgentGalleryProps,
  AgentSummary,
  AgentPreview,
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
  Pause,
  ChevronDown,
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
/*  Helper: language flag emoji                                       */
/* ------------------------------------------------------------------ */
function getLanguageFlag(language: string): string {
  const flags: Record<string, string> = {
    en: '\u{1F1FA}\u{1F1F8}',
    es: '\u{1F1EA}\u{1F1F8}',
    fr: '\u{1F1EB}\u{1F1F7}',
    de: '\u{1F1E9}\u{1F1EA}',
    pt: '\u{1F1E7}\u{1F1F7}',
    ja: '\u{1F1EF}\u{1F1F5}',
    ko: '\u{1F1F0}\u{1F1F7}',
    zh: '\u{1F1E8}\u{1F1F3}',
    it: '\u{1F1EE}\u{1F1F9}',
    nl: '\u{1F1F3}\u{1F1F1}',
    ar: '\u{1F1F8}\u{1F1E6}',
    hi: '\u{1F1EE}\u{1F1F3}',
    ru: '\u{1F1F7}\u{1F1FA}',
  };
  return flags[language.toLowerCase()] || '\u{1F310}';
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
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAgentGalleryProps>) => {
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

    const handleTabChange = (tab: AgentTab) => {
      onTabChange?.(tab);
      if (controlledTab === undefined) setLocalTab(tab);
    };
    const handleFilterChange = (f: AgentFilter) => {
      onFilterChange?.(f);
      if (controlledFilters === undefined) setLocalFilters(f);
    };
    const handleSelect = (id: string) => {
      onAgentSelect?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    };
    const handlePreviewToggle = (show: boolean) => {
      onPreviewToggle?.(show);
      if (controlledShowPreview === undefined) setLocalShowPreview(show);
    };
    const handleViewModeChange = (mode: AgentViewMode) => {
      onViewModeChange?.(mode);
      if (controlledViewMode === undefined) setLocalViewMode(mode);
    };

    const isGlass = engine === 'modern' && !!tokens.glass;
    const cardBase = createCardStyle(tokens, { elevation: 'sm', glass: isGlass });
    const hoverStyle = createHoverStyle(tokens);
    const hoverTransform = getHoverTransform(tokens);

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

    /* ---- Derived counts ---- */
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

    /* ---- Select style helper ---- */
    const selectStyle: React.CSSProperties = {
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      outline: 'none',
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
      backgroundImage: 'none',
      minWidth: 120,
    };

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  1. Tab Bar                                                  */}
        {/* =========================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...(isGlass
              ? {
                  backdropFilter: tokens.glass?.blur,
                  WebkitBackdropFilter: tokens.glass?.blur,
                  backgroundColor: tokens.glass?.bg,
                }
              : {}),
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: isActive
                    ? `1px solid ${tokens.colors.primaryScale[300]}`
                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                  backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                  color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  ...hoverStyle,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400] }}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span
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
                  {tab.count}
                </span>
              </button>
            );
          })}

          {/* View mode toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: tokens.spacing[1] }}>
            {(['grid', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleViewModeChange(mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tokens.spacing[8],
                  height: tokens.spacing[8],
                  borderRadius: tokens.borderRadius.md,
                  border: viewMode === mode
                    ? `1px solid ${tokens.colors.primaryScale[300]}`
                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: viewMode === mode ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: viewMode === mode ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                  cursor: 'pointer',
                  ...hoverStyle,
                }}
              >
                {mode === 'grid' ? <Grid3X3 size={16} strokeWidth={1.5} /> : <List size={16} strokeWidth={1.5} />}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================== */}
        {/*  2. Filter Bar                                               */}
        {/* =========================================================== */}
        <div
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
          <div
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
          </div>

          {/* Filter icon */}
          <div style={{ display: 'flex', alignItems: 'center', color: tokens.colors.neutral[400] }}>
            <Filter size={16} strokeWidth={1.5} />
          </div>

          {/* Type filter */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as AgentType | 'all' })}
            style={selectStyle}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Language filter */}
          <select
            value={filters.language || 'all'}
            onChange={(e) => handleFilterChange({ ...filters, language: e.target.value })}
            style={selectStyle}
          >
            {uniqueLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : `${getLanguageFlag(lang)} ${lang.toUpperCase()}`}
              </option>
            ))}
          </select>

          {/* Provider filter */}
          <select
            value={filters.provider || 'all'}
            onChange={(e) => handleFilterChange({ ...filters, provider: e.target.value })}
            style={selectStyle}
          >
            {uniqueProviders.map((prov) => (
              <option key={prov} value={prov}>{prov === 'all' ? 'All Providers' : prov}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange({ ...filters, status: e.target.value as AgentStatus | 'all' })}
            style={selectStyle}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* =========================================================== */}
        {/*  3. Agent Cards Grid                                         */}
        {/* =========================================================== */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: tokens.spacing[5],
          }}
        >
          {filteredAgents.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
                textAlign: 'center' as const,
              }}
            >
              <Bot size={48} strokeWidth={1} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[4] }} />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  display: 'block',
                  marginBottom: tokens.spacing[2],
                }}
              >
                No agents found
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                }}
              >
                Try adjusting your filters or create a new agent
              </Text>
            </div>
          ) : (
            <>
              {/* Marketplace featured section */}
              {activeTab === 'marketplace' && filteredAgents.some((a) => a.rating && a.rating >= 4.5) && (
                <div style={{ marginBottom: tokens.spacing[6] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    Featured Agents
                  </Text>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: tokens.spacing[4],
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    {filteredAgents
                      .filter((a) => a.rating && a.rating >= 4.5)
                      .slice(0, 3)
                      .map((agent) => {
                        const statusInfo = getStatusInfo(agent.status, tokens);
                        return (
                          <div
                            key={`featured-${agent.id}`}
                            onClick={() => handleSelect(agent.id)}
                            style={{
                              ...cardBase,
                              padding: tokens.spacing[4],
                              cursor: 'pointer',
                              border: selectedAgent === agent.id
                                ? `2px solid ${tokens.colors.primaryScale[400]}`
                                : `1px solid ${tokens.colors.primaryScale[200]}`,
                              background: isGlass
                                ? tokens.glass?.bg
                                : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.secondaryScale[50]})`,
                              position: 'relative' as const,
                              ...hoverStyle,
                            }}
                            onMouseEnter={(e) => {
                              Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                              (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.transform = 'none';
                              (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.sm;
                            }}
                          >
                            {/* Featured badge */}
                            <div
                              style={{
                                position: 'absolute' as const,
                                top: tokens.spacing[2],
                                right: tokens.spacing[2],
                                ...createBadgeStyle(tokens, 'warning'),
                                fontSize: tokens.typography.fontSize.xs,
                              }}
                            >
                              <Star size={12} strokeWidth={2} style={{ marginRight: tokens.spacing[1] }} />
                              Featured
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                              <div
                                style={{
                                  width: tokens.spacing[10],
                                  height: tokens.spacing[10],
                                  borderRadius: tokens.borderRadius.lg,
                                  backgroundColor: tokens.colors.primaryScale[100],
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: tokens.colors.primaryScale[600],
                                }}
                              >
                                {getAgentTypeIcon(agent.type, 20)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                  style={{
                                    fontSize: tokens.typography.fontSize.md,
                                    fontWeight: tokens.typography.fontWeight.semibold,
                                    color: tokens.colors.neutral[900],
                                    display: 'block',
                                  }}
                                >
                                  {agent.name}
                                </Text>
                                {agent.author && (
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                                    by {agent.author}
                                  </Text>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                              {agent.rating !== undefined && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                  <Star size={14} strokeWidth={2} style={{ color: tokens.colors.warningScale[500], fill: tokens.colors.warningScale[500] }} />
                                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                                    {agent.rating.toFixed(1)}
                                  </Text>
                                </div>
                              )}
                              {agent.downloads !== undefined && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                  <Download size={14} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                                    {agent.downloads.toLocaleString()}
                                  </Text>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      backgroundColor: tokens.colors.neutral[200],
                      marginBottom: tokens.spacing[4],
                    }}
                  />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    All Agents
                  </Text>
                </div>
              )}

              {/* Main grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: tokens.spacing[4],
                }}
              >
                {filteredAgents.map((agent) => {
                  const statusInfo = getStatusInfo(agent.status, tokens);
                  const isSelected = selectedAgent === agent.id;

                  return (
                    <div
                      key={agent.id}
                      onClick={() => handleSelect(agent.id)}
                      style={{
                        ...cardBase,
                        padding: 0,
                        cursor: 'pointer',
                        border: isSelected
                          ? `2px solid ${tokens.colors.primaryScale[400]}`
                          : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        overflow: 'hidden',
                        position: 'relative' as const,
                        ...hoverStyle,
                      }}
                      onMouseEnter={(e) => {
                        Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                        (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                        const actions = e.currentTarget.querySelector('[data-agent-actions]') as HTMLDivElement | null;
                        if (actions) actions.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'none';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.sm;
                        const actions = e.currentTarget.querySelector('[data-agent-actions]') as HTMLDivElement | null;
                        if (actions) actions.style.opacity = '0';
                      }}
                    >
                      {/* Card content */}
                      <div style={{ padding: tokens.spacing[4] }}>
                        {/* Header: Icon + Name + Status */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                          <div
                            style={{
                              width: tokens.spacing[10],
                              height: tokens.spacing[10],
                              borderRadius: tokens.borderRadius.lg,
                              backgroundColor: tokens.colors.primaryScale[50],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: tokens.colors.primaryScale[600],
                              flexShrink: 0,
                            }}
                          >
                            {getAgentTypeIcon(agent.type, 20)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.md,
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.neutral[900],
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap' as const,
                                }}
                              >
                                {agent.name}
                              </Text>
                              {agent.isDefault && (
                                <span
                                  style={{
                                    ...createBadgeStyle(tokens, 'primary'),
                                    fontSize: tokens.typography.fontSize.xs,
                                    padding: `0 ${tokens.spacing[2]}px`,
                                    lineHeight: tokens.typography.lineHeight.relaxed,
                                  }}
                                >
                                  Default
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <span
                                style={{
                                  ...createBadgeStyle(tokens, 'info'),
                                  fontSize: tokens.typography.fontSize.xs,
                                  padding: `0 ${tokens.spacing[2]}px`,
                                  textTransform: 'capitalize' as const,
                                }}
                              >
                                {agent.type}
                              </span>
                              {/* Status dot */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                <div
                                  style={{
                                    width: tokens.spacing[2],
                                    height: tokens.spacing[2],
                                    borderRadius: tokens.borderRadius.full,
                                    backgroundColor: statusInfo.color,
                                  }}
                                />
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: statusInfo.color }}>
                                  {statusInfo.label}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Meta row: Language, Provider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.sm }}>{getLanguageFlag(agent.language)}</span>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                              {agent.language.toUpperCase()}
                            </Text>
                          </div>
                          <div
                            style={{
                              ...createBadgeStyle(tokens, 'secondary'),
                              fontSize: tokens.typography.fontSize.xs,
                              padding: `0 ${tokens.spacing[2]}px`,
                            }}
                          >
                            {agent.voiceProvider}
                          </div>
                          {/* Marketplace rating */}
                          {activeTab === 'marketplace' && agent.rating !== undefined && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginLeft: 'auto' }}>
                              <Star size={12} strokeWidth={2} style={{ color: tokens.colors.warningScale[500], fill: tokens.colors.warningScale[500] }} />
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                                {agent.rating.toFixed(1)}
                              </Text>
                              {agent.downloads !== undefined && (
                                <>
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], margin: `0 ${tokens.spacing[1]}px` }}>
                                    |
                                  </Text>
                                  <Download size={12} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                                    {agent.downloads.toLocaleString()}
                                  </Text>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Usage sparkline */}
                        {agent.usageSparkline.length > 0 && (
                          <div style={{ marginBottom: tokens.spacing[2] }}>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[400],
                                display: 'block',
                                marginBottom: tokens.spacing[1],
                              }}
                            >
                              Usage (last 14 days)
                            </Text>
                            <svg
                              width="100%"
                              height={40}
                              viewBox="0 0 200 40"
                              preserveAspectRatio="none"
                              style={{ display: 'block' }}
                            >
                              <polygon
                                points={sparklinePolygonPoints(agent.usageSparkline, 200, 40, 2)}
                                fill={tokens.colors.primaryScale[100]}
                                stroke="none"
                              />
                              <polyline
                                points={sparklinePoints(agent.usageSparkline, 200, 40, 2)}
                                fill="none"
                                stroke={tokens.colors.primaryScale[500]}
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Preview button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(agent.id);
                            handlePreviewToggle(true);
                          }}
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
                            ...hoverStyle,
                          }}
                        >
                          <Eye size={14} strokeWidth={1.5} />
                          Preview
                        </button>
                      </div>

                      {/* ---- Hover Actions Overlay ---- */}
                      <div
                        data-agent-actions=""
                        style={{
                          position: 'absolute' as const,
                          top: tokens.spacing[2],
                          right: tokens.spacing[2],
                          display: 'flex',
                          gap: tokens.spacing[1],
                          opacity: 0,
                          transition: `opacity ${tokens.motion.hover}`,
                        }}
                      >
                        {onDuplicate && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDuplicate(agent.id); }}
                            title="Duplicate"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: tokens.spacing[7],
                              height: tokens.spacing[7],
                              borderRadius: tokens.borderRadius.md,
                              border: 'none',
                              backgroundColor: tokens.colors.common.white,
                              boxShadow: tokens.shadows.sm,
                              color: tokens.colors.neutral[600],
                              cursor: 'pointer',
                              ...hoverStyle,
                            }}
                          >
                            <Copy size={14} strokeWidth={1.5} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(agent.id); }}
                            title="Edit"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: tokens.spacing[7],
                              height: tokens.spacing[7],
                              borderRadius: tokens.borderRadius.md,
                              border: 'none',
                              backgroundColor: tokens.colors.common.white,
                              boxShadow: tokens.shadows.sm,
                              color: tokens.colors.neutral[600],
                              cursor: 'pointer',
                              ...hoverStyle,
                            }}
                          >
                            <Pencil size={14} strokeWidth={1.5} />
                          </button>
                        )}
                        {agent.status === 'active' && onDeactivate && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeactivate(agent.id); }}
                            title="Deactivate"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: tokens.spacing[7],
                              height: tokens.spacing[7],
                              borderRadius: tokens.borderRadius.md,
                              border: 'none',
                              backgroundColor: tokens.colors.warningScale[50],
                              boxShadow: tokens.shadows.sm,
                              color: tokens.colors.warningScale[600],
                              cursor: 'pointer',
                              ...hoverStyle,
                            }}
                          >
                            <PowerOff size={14} strokeWidth={1.5} />
                          </button>
                        )}
                        {agent.status !== 'active' && onActivate && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onActivate(agent.id); }}
                            title="Activate"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: tokens.spacing[7],
                              height: tokens.spacing[7],
                              borderRadius: tokens.borderRadius.md,
                              border: 'none',
                              backgroundColor: tokens.colors.successScale[50],
                              boxShadow: tokens.shadows.sm,
                              color: tokens.colors.successScale[600],
                              cursor: 'pointer',
                              ...hoverStyle,
                            }}
                          >
                            <Power size={14} strokeWidth={1.5} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
                            title="Delete"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: tokens.spacing[7],
                              height: tokens.spacing[7],
                              borderRadius: tokens.borderRadius.md,
                              border: 'none',
                              backgroundColor: tokens.colors.errorScale[50],
                              boxShadow: tokens.shadows.sm,
                              color: tokens.colors.errorScale[600],
                              cursor: 'pointer',
                              ...hoverStyle,
                            }}
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* =========================================================== */}
        {/*  4. Preview Modal                                            */}
        {/* =========================================================== */}
        {showPreview && selectedAgentData && (
          <div
            style={{
              position: 'fixed' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: tokens.spacing[6],
            }}
            onClick={() => handlePreviewToggle(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                ...cardBase,
                padding: 0,
                width: '100%',
                maxWidth: 640,
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                ...(isGlass
                  ? {
                      backdropFilter: tokens.glass?.blurLg,
                      WebkitBackdropFilter: tokens.glass?.blurLg,
                      backgroundColor: tokens.glass?.bgHeavy,
                      border: `1px solid ${tokens.glass?.border}`,
                    }
                  : { backgroundColor: tokens.colors.common.white }),
              }}
            >
              {/* Modal header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <div
                    style={{
                      width: tokens.spacing[10],
                      height: tokens.spacing[10],
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: tokens.colors.primaryScale[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tokens.colors.primaryScale[600],
                    }}
                  >
                    {getAgentTypeIcon(selectedAgentData.type, 20)}
                  </div>
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {selectedAgentData.name}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span
                        style={{
                          ...createBadgeStyle(tokens, 'info'),
                          fontSize: tokens.typography.fontSize.xs,
                          padding: `0 ${tokens.spacing[2]}px`,
                          textTransform: 'capitalize' as const,
                        }}
                      >
                        {selectedAgentData.type}
                      </span>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {getLanguageFlag(selectedAgentData.language)} {selectedAgentData.language.toUpperCase()} | {selectedAgentData.voiceProvider}
                      </Text>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePreviewToggle(false)}
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
                    ...hoverStyle,
                  }}
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Modal body */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: `${tokens.spacing[5]}px`,
                }}
              >
                {/* Config summary */}
                {previewData && (
                  <>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                        display: 'block',
                        marginBottom: tokens.spacing[3],
                      }}
                    >
                      Configuration Summary
                    </Text>
                    <div
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.neutral[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        marginBottom: tokens.spacing[5],
                      }}
                    >
                      {Object.entries(previewData.configSummary).map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: `${tokens.spacing[2]}px 0`,
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          }}
                        >
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], textTransform: 'capitalize' as const }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                            {value}
                          </Text>
                        </div>
                      ))}
                    </div>

                    {/* Sample conversation */}
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                        display: 'block',
                        marginBottom: tokens.spacing[3],
                      }}
                    >
                      Sample Conversation
                    </Text>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: tokens.spacing[2],
                        marginBottom: tokens.spacing[5],
                      }}
                    >
                      {previewData.sampleConversation.map((line, i) => {
                        const isAgent = i % 2 === 1;
                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: isAgent ? 'flex-start' : 'flex-end',
                            }}
                          >
                            <div
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
                              {line}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Voice preview */}
                    {previewData.voicePreviewUrl && (
                      <div style={{ marginBottom: tokens.spacing[5] }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[800],
                            display: 'block',
                            marginBottom: tokens.spacing[3],
                          }}
                        >
                          Voice Preview
                        </Text>
                        <div
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
                          <button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: tokens.spacing[9],
                              height: tokens.spacing[9],
                              borderRadius: tokens.borderRadius.full,
                              border: 'none',
                              backgroundColor: tokens.colors.primaryScale[600],
                              color: tokens.colors.common.white,
                              cursor: 'pointer',
                              ...hoverStyle,
                            }}
                          >
                            <Play size={16} strokeWidth={2} />
                          </button>
                          {/* Waveform placeholder */}
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {Array.from({ length: 40 }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  height: Math.max(4, Math.random() * 24),
                                  borderRadius: tokens.borderRadius.sm,
                                  backgroundColor: i < 15 ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200],
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Estimated cost */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.infoScale[50],
                        border: `1px solid ${tokens.colors.infoScale[200]}`,
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.infoScale[700], fontWeight: tokens.typography.fontWeight.medium }}>
                        Estimated Cost per Conversation
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[800] }}>
                        ${previewData.estimatedCost.toFixed(2)}
                      </Text>
                    </div>
                  </>
                )}

                {!previewData && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
                      textAlign: 'center' as const,
                    }}
                  >
                    <Eye size={32} strokeWidth={1} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                      Preview data not available
                    </Text>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div
                style={{
                  display: 'flex',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                {onDuplicate && (
                  <button
                    onClick={() => { onDuplicate(selectedAgentData.id); handlePreviewToggle(false); }}
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
                      ...hoverStyle,
                    }}
                  >
                    <Copy size={14} strokeWidth={1.5} />
                    Duplicate
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => { onEdit(selectedAgentData.id); handlePreviewToggle(false); }}
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
                      marginLeft: 'auto',
                      ...hoverStyle,
                    }}
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                    Edit Agent
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Box>
    );
  },
});
