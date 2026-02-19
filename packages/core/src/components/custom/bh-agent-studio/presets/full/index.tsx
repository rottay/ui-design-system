'use client';

/**
 * BhAgentStudio - Full Preset
 * Complete AI agent builder with all configuration sections:
 * agent header, language, voice, personality, LLM config, system prompt,
 * script builder, tool configuration, call settings, and validation.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createDividerStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPersonalityAccentBar,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getCardPadding,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,

  createCardHoverStyles,
  createPersonalitySectionHeaderStyle,
  formatAbbreviated,
} from '../../../helpers';
import type {
  BhAgentStudioProps,
  AgentData,
  AgentType,
  VoiceProvider,
  PersonalityTrait,
  ScriptSection,
  ToolConfig,
  CallSettings,
  ValidationResult,
  ValidationStatus,
} from '../../core';
import {
  DEFAULT_AGENT_DATA,
  BH_AGENT_STUDIO_DEFAULTS,
  getAgentTypeConfig,
  getProviderConfig,
  getValidationStatusColors,
  SYSTEM_PROMPT_VARIABLES,
  formatEstimatedCost,
  getTemperatureLabel,
  getToneLevelLabel,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Bot,
  Phone,
  MessageSquare,
  Play,
  Pause,
  Plus,
  Trash2,
  GripVertical,
  Save,
  TestTube,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Settings,
  Mic,
  Globe,
  Brain,
  Code2,
  FileText,
  Wrench,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Volume2,
  Sparkles,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Copy,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: Generate waveform SVG polyline from seed                   */
/* ------------------------------------------------------------------ */
function generateWaveformPoints(width: number, height: number, bars: number, seed: number): string {
  const points: string[] = [];
  const barWidth = width / bars;
  for (let i = 0; i < bars; i++) {
    const x = i * barWidth + barWidth / 2;
    const amplitude = (Math.sin(i * 0.6 + seed) * 0.4 + 0.5) * (height * 0.8);
    const y = (height - amplitude) / 2;
    points.push(`${x},${y}`);
    points.push(`${x},${y + amplitude}`);
  }
  return points.join(' ');
}

/* ------------------------------------------------------------------ */
/*  Helper: Section collapse wrapper                                   */
/* ------------------------------------------------------------------ */
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  tokens: DesignTokens;
  isCollapsed: boolean;
  onToggle: () => void;
  glass: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
  Box: any;
  Text: any;
}

function CollapsibleSection({ title, icon, tokens, isCollapsed, onToggle, glass, children, badge, Box, Text }: SectionProps) {
  const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);
  const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

  return (
    <Box
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
      style={{
        ...createCardStyle(tokens, { glass, elevation: 'sm' }),
        marginBottom: tokens.spacing[4],
        overflow: 'hidden',
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${title}`}
        onClick={onToggle}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          gap: tokens.spacing[2],
          transition: `all ${tokens.motion.hover}`,
        }}
      >
        <Text style={{ color: tokens.colors.primaryScale[500], display: 'flex', alignItems: 'center' }}>
          {icon}
        </Text>
        <Text
          as="span"
          style={{
            flex: 1,
            textAlign: 'left',
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[800],
          }}
        >
          {title}
        </Text>
        {badge}
        <Text style={{ color: tokens.colors.neutral[400], display: 'flex', alignItems: 'center' }}>
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </Text>
      </Box>
      {!isCollapsed && (
        <Box style={{ padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px` }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Full Preset                                                        */
/* ------------------------------------------------------------------ */
export const FullBhAgentStudio = createPreset<BhAgentStudioProps>({
  name: 'BhAgentStudio.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAgentStudioProps>) => {
    const { Box, Text } = primitives;

    const {
      agentData: agentDataProp,
      onChange,
      onSave,
      onTest,
      onValidate,
      validationResults = BH_AGENT_STUDIO_DEFAULTS.validationResults ?? [],
      providers = BH_AGENT_STUDIO_DEFAULTS.providers ?? [],
      languages = BH_AGENT_STUDIO_DEFAULTS.languages ?? [],
      voices = BH_AGENT_STUDIO_DEFAULTS.voices ?? [],
      models = BH_AGENT_STUDIO_DEFAULTS.models ?? [],
      estimatedCost: estimatedCostProp = 0,
      isDirty: isDirtyProp = false,
      loading,
      className,
      style,
    } = props;

    /* ---------- State ---------- */
    const [internalAgentData, setInternalAgentData] = useState<AgentData>(
      agentDataProp ?? DEFAULT_AGENT_DATA,
    );
    const [activeSection, setActiveSection] = useState<string>('header');
    const [internalValidation, setInternalValidation] = useState<ValidationResult[]>(validationResults);
    const [isTestMode, setIsTestMode] = useState(false);
    const [voicePreviewPlaying, setVoicePreviewPlaying] = useState(false);
    const [dragState, setDragState] = useState<{ dragId: string | null; overId: string | null }>({
      dragId: null,
      overId: null,
    });
    const [internalIsDirty, setInternalIsDirty] = useState(isDirtyProp);
    const [internalEstimatedCost, setInternalEstimatedCost] = useState(estimatedCostProp);
    const [providerStatus, setProviderStatus] = useState<Record<VoiceProvider, 'idle' | 'loading' | 'ready' | 'error'>>({
      elevenlabs: 'idle',
      azure: 'idle',
      google: 'idle',
    });
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const agentData = agentDataProp ?? internalAgentData;
    const isDirty = isDirtyProp || internalIsDirty;
    const estimatedCost = estimatedCostProp || internalEstimatedCost;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    const agentTypeConfig = useMemo(() => getAgentTypeConfig(tokens), [tokens]);
    const providerConfig = useMemo(() => getProviderConfig(tokens), [tokens]);
    const validationColors = useMemo(() => getValidationStatusColors(tokens), [tokens]);

    /* ---------- Update helpers ---------- */
    const updateAgent = useCallback(
      (partial: Partial<AgentData>) => {
        const updated = { ...agentData, ...partial };
        if (onChange) {
          onChange(updated);
        } else {
          setInternalAgentData(updated);
        }
        setInternalIsDirty(true);
      },
      [agentData, onChange],
    );

    const updateCallSettings = useCallback(
      (partial: Partial<CallSettings>) => {
        updateAgent({ callSettings: { ...agentData.callSettings, ...partial } });
      },
      [agentData.callSettings, updateAgent],
    );

    const toggleSection = useCallback((key: string) => {
      setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    /* ---------- Script section helpers ---------- */
    const addScriptSection = useCallback(() => {
      const newSection: ScriptSection = {
        id: `section-${Date.now()}`,
        title: `Section ${agentData.scriptSections.length + 1}`,
        promptText: '',
        order: agentData.scriptSections.length,
      };
      updateAgent({ scriptSections: [...agentData.scriptSections, newSection] });
    }, [agentData.scriptSections, updateAgent]);

    const removeScriptSection = useCallback(
      (id: string) => {
        const updated = agentData.scriptSections
          .filter((s) => s.id !== id)
          .map((s, i) => ({ ...s, order: i }));
        updateAgent({ scriptSections: updated });
      },
      [agentData.scriptSections, updateAgent],
    );

    const updateScriptSection = useCallback(
      (id: string, partial: Partial<ScriptSection>) => {
        const updated = agentData.scriptSections.map((s, i) =>
          s.id === id ? { ...s, ...partial } : s,
        );
        updateAgent({ scriptSections: updated });
      },
      [agentData.scriptSections, updateAgent],
    );

    /* ---------- Script drag-and-drop ---------- */
    const handleScriptDragStart = useCallback((e: React.DragEvent, id: string) => {
      setDragState({ dragId: id, overId: null });
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }, []);

    const handleScriptDragOver = useCallback(
      (e: React.DragEvent, overId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragState((prev) => ({ ...prev, overId }));
      },
      [],
    );

    const handleScriptDrop = useCallback(
      (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const { dragId } = dragState;
        if (!dragId || dragId === targetId) {
          setDragState({ dragId: null, overId: null });
          return;
        }
        const sections = [...agentData.scriptSections];
        const fromIdx = sections.findIndex((s) => s.id === dragId);
        const toIdx = sections.findIndex((s) => s.id === targetId);
        if (fromIdx === -1 || toIdx === -1) return;
        const [moved] = sections.splice(fromIdx, 1);
        sections.splice(toIdx, 0, moved);
        const reordered = sections.map((s, i) => ({ ...s, order: i }));
        updateAgent({ scriptSections: reordered });
        setDragState({ dragId: null, overId: null });
      },
      [dragState, agentData.scriptSections, updateAgent],
    );

    const handleScriptDragEnd = useCallback(() => {
      setDragState({ dragId: null, overId: null });
    }, []);

    /* ---------- Tool toggle ---------- */
    const toggleTool = useCallback(
      (toolId: string) => {
        const updated = agentData.tools.map((t) =>
          t.id === toolId ? { ...t, enabled: !t.enabled } : t,
        );
        updateAgent({ tools: updated });
      },
      [agentData.tools, updateAgent],
    );

    /* ---------- Personality trait update ---------- */
    const updateTrait = useCallback(
      (name: string, value: number) => {
        const updated = agentData.personalityTraits.map((t, i) =>
          t.name === name ? { ...t, value } : t,
        );
        updateAgent({ personalityTraits: updated });
      },
      [agentData.personalityTraits, updateAgent],
    );

    /* ---------- Voice preview ---------- */
    const handleVoicePreview = useCallback(() => {
      setVoicePreviewPlaying((prev) => !prev);
    }, []);

    /* ---------- Insert variable into system prompt ---------- */
    const insertVariable = useCallback(
      (variable: string) => {
        updateAgent({ systemPrompt: agentData.systemPrompt + ' ' + variable });
      },
      [agentData.systemPrompt, updateAgent],
    );

    /* ---------- Agent type icon ---------- */
    const getAgentTypeIcon = (type: AgentType, size: number) => {
      switch (type) {
        case 'conversation':
          return <Bot size={size} />;
        case 'phone':
          return <Phone size={size} />;
        case 'chat':
          return <MessageSquare size={size} />;
      }
    };

    const sortedSections = useMemo(() => {
      return [...agentData.scriptSections].sort((a, b) => a.order - b.order);
    }, [agentData.scriptSections]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    const passCount = validationResults.filter((v) => v.status === 'pass').length;
    const failCount = validationResults.filter((v) => v.status === 'fail').length;
    const warnCount = validationResults.filter((v) => v.status === 'warning').length;

    /* ================================================================ */
    /*  Render                                                          */
    /* ================================================================ */
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
        {/* =========================================================== */}
        {/*  Top Bar: Title + Action Buttons                            */}
        {/* =========================================================== */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[6],
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box
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
              <Sparkles size={24} />
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                }}
              >
                AI Agent Studio
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                Configure and deploy intelligent interview agents
              </Text>
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {isDirty && (
              <Text as="span"
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.warningScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                  marginRight: tokens.spacing[2],
                }}
              >
                Unsaved changes
              </Text>
            )}
            <Box
              role="button"
              tabIndex={0}
              aria-label="Validate agent configuration"
              onClick={() => onValidate?.(agentData)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onValidate?.(agentData); } }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                ...hoverStyle,
              }}
            >
              <ShieldCheck size={14} />
              Validate
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label={isTestMode ? 'Stop testing agent' : 'Test agent'}
              aria-pressed={isTestMode}
              onClick={() => {
                setIsTestMode(!isTestMode);
                onTest?.(agentData);
              }}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsTestMode(!isTestMode); onTest?.(agentData); } }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.secondaryScale[300]}`,
                backgroundColor: isTestMode ? tokens.colors.secondaryScale[50] : tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.secondaryScale[700],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                ...hoverStyle,
              }}
            >
              <TestTube size={14} />
              {isTestMode ? 'Testing...' : 'Test Agent'}
            </Box>
            <Box
              role="button"
              tabIndex={isDirty ? 0 : -1}
              aria-label="Save agent"
              aria-disabled={!isDirty}
              onClick={isDirty ? () => onSave?.(agentData) : undefined}
              onKeyDown={isDirty ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSave?.(agentData); } } : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: isDirty ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: isDirty ? tokens.colors.common.white : tokens.colors.neutral[400],
                cursor: isDirty ? 'pointer' : 'not-allowed',
                ...hoverStyle,
              }}
            >
              <Save size={14} />
              Save Agent
            </Box>
          </Box>
        </Box>

        {/* =========================================================== */}
        {/*  1. Agent Header: Name, Description, Type                   */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Agent Identity"
          icon={<Bot size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['header']}
          onToggle={() => toggleSection('header')}
          glass={isGlass}
          Box={Box}
          Text={Text}
          badge={
            agentData.name ? (
              <Text as="span"
                style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  fontSize: tokens.typography.fontSize.xs,
                }}
              >
                {agentTypeConfig[agentData.type].label}
              </Text>
            ) : undefined
          }
        >
          {/* Name input */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[1],
              }}
            >
              Agent Name
            </Text>
            <input
              type="text"
              value={agentData.name}
              onChange={(e) => updateAgent({ name: e.target.value })}
              placeholder="e.g. Technical Screen Agent"
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
                outline: 'none',
                boxSizing: 'border-box',
                transition: `border-color ${tokens.transitions?.fast || tokens.motion.hover}`,
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
          </Box>

          {/* Description */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[1],
              }}
            >
              Description
            </Text>
            <textarea
              value={agentData.description}
              onChange={(e) => updateAgent({ description: e.target.value })}
              placeholder="Describe the agent's purpose and role..."
              rows={3}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                backgroundColor: tokens.colors.common.white,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: `border-color ${tokens.transitions?.fast || tokens.motion.hover}`,
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
          </Box>

          {/* Type selector cards */}
          <Box>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[2],
              }}
            >
              Agent Type
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: tokens.spacing[3],
              }}
            >
              {(Object.keys(agentTypeConfig) as AgentType[]).map((type) => {
                const config = agentTypeConfig[type];
                const isSelected = agentData.type === type;
                return (
                  <Box
                    key={type}
                    onClick={() => updateAgent({ type })}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateAgent({ type }); } }}
                    role="radio"
                    tabIndex={0}
                    aria-checked={isSelected}
                    aria-label={`Agent type: ${config.label}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: tokens.spacing[4],
                      borderRadius: tokens.borderRadius.lg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? config.color : tokens.colors.neutral[200]}`,
                      backgroundColor: isSelected ? config.bgColor : tokens.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Box
                      style={{
                        width: tokens.spacing[10],
                        height: tokens.spacing[10],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: isSelected ? config.color : tokens.colors.neutral[100],
                        color: isSelected ? tokens.colors.common.white : tokens.colors.neutral[500],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {getAgentTypeIcon(type, 20)}
                    </Box>
                    <Text
                      as="span"
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: isSelected ? config.color : tokens.colors.neutral[700],
                      }}
                    >
                      {config.label}
                    </Text>
                    <Text
                      as="span"
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        textAlign: 'center',
                        lineHeight: tokens.typography.lineHeight.normal,
                      }}
                    >
                      {config.description}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  2. Language Panel                                           */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Language & Accent"
          icon={<Globe size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['language']}
          onToggle={() => toggleSection('language')}
          glass={isGlass}
          Box={Box}
          Text={Text}
        >
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
            <Box>
              <Text
                style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Language
              </Text>
              <select
                value={agentData.language}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateAgent({ language: e.target.value })}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {languages.map((lang, i) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </Box>
            <Box>
              <Text
                style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Accent / Dialect
              </Text>
              <input
                type="text"
                value={agentData.accent}
                onChange={(e) => updateAgent({ accent: e.target.value })}
                placeholder="e.g. US, British, Australian"
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                }}
              />
            </Box>
          </Box>
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  3. Voice Panel                                              */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Voice Configuration"
          icon={<Mic size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['voice']}
          onToggle={() => toggleSection('voice')}
          glass={isGlass}
          Box={Box}
          Text={Text}
        >
          {/* Provider selector cards */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[2],
              }}
            >
              Voice Provider
            </Text>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
              {providers.map((provider, i) => {
                const config = providerConfig[provider];
                const isSelected = agentData.voiceProvider === provider;
                return (
                  <Box
                    key={provider}
                    onClick={() => updateAgent({ voiceProvider: provider })}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateAgent({ voiceProvider: provider }); } }}
                    role="radio"
                    tabIndex={0}
                    aria-checked={isSelected}
                    aria-label={`Voice provider: ${config.label}`}
                    style={{
                      ...animStyle(i),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? config.color : tokens.colors.neutral[200]}`,
                      backgroundColor: isSelected ? config.bgColor : tokens.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Volume2
                      size={20}
                      style={{
                        color: isSelected ? config.color : tokens.colors.neutral[400],
                      }}
                    />
                    <Text
                      as="span"
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: isSelected ? config.color : tokens.colors.neutral[700],
                      }}
                    >
                      {config.label}
                    </Text>
                    <Text
                      as="span"
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {config.description}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Voice ID input */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[1],
              }}
            >
              Voice ID
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <input
                type="text"
                value={agentData.voiceId}
                onChange={(e) => updateAgent({ voiceId: e.target.value })}
                placeholder="Enter voice ID or select from available voices"
                style={{
                  flex: 1,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                }}
              
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                }}
              />
              <Box
                onClick={() => {
                  if (agentData.voiceId) {
                    navigator.clipboard?.writeText(agentData.voiceId);
                  }
                }}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (agentData.voiceId) { navigator.clipboard?.writeText(agentData.voiceId); } } }}
                role="button"
                tabIndex={0}
                aria-label="Copy voice ID"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  backgroundColor: tokens.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  color: tokens.colors.neutral[500],
                  ...hoverStyle,
                }}
              >
                <Copy size={14} />
              </Box>
            </Box>
          </Box>

          {/* Voice preview player with waveform SVG */}
          <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.neutral[100],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                }}
              >
                Voice Preview
              </Text>
              <Box
                onClick={handleVoicePreview}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVoicePreview(); } }}
                role="button"
                tabIndex={0}
                aria-label={voicePreviewPlaying ? 'Stop voice preview' : 'Play voice sample'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.full,
                  border: 'none',
                  backgroundColor: voicePreviewPlaying
                    ? tokens.colors.errorScale[500]
                    : tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  ...hoverStyle,
                }}
              >
                {voicePreviewPlaying ? <Pause size={12} /> : <Play size={12} />}
                {voicePreviewPlaying ? 'Stop' : 'Play Sample'}
              </Box>
            </Box>
            {/* Waveform SVG */}
            <svg
              width="100%"
              height="48"
              viewBox="0 0 400 48"
              preserveAspectRatio="none"
              style={{ display: 'block' }}
            >
              {Array.from({ length: 50 }).map((_, i) => {
                const x = (i / 50) * 400;
                const barHeight = (Math.sin(i * 0.5 + 2.5) * 0.4 + 0.5) * 36;
                const y = (48 - barHeight) / 2;
                const isActive = voicePreviewPlaying && i < 25;
                return (
                  <rect
                    key={i}
                    x={x + 1}
                    y={y}
                    width={5}
                    height={barHeight}
                    rx={2}
                    fill={
                      isActive
                        ? tokens.colors.primaryScale[500]
                        : tokens.colors.neutral[300]
                    }
                    style={{
                      transition: `fill ${tokens.transitions?.fast || tokens.motion.hover}`,
                    }}
                  />
                );
              })}
            </svg>
          </Box>

          {/* Available voices list */}
          {voices.length > 0 && (
            <Box style={{ marginTop: tokens.spacing[4] }}>
              <Text
                style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[2],
                }}
              >
                Available Voices
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {voices
                  .filter((v) => v.provider === agentData.voiceProvider)
                  .map((voice, i) => (
                    <Box
                      key={voice.id}
                      onClick={() => updateAgent({ voiceId: voice.id })}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateAgent({ voiceId: voice.id }); } }}
                      role="radio"
                      tabIndex={0}
                      aria-checked={agentData.voiceId === voice.id}
                      aria-label={`Voice: ${voice.name}${voice.accent ? ` (${voice.accent})` : ''}`}
                      style={{
                        ...animStyle(i),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                          agentData.voiceId === voice.id
                            ? tokens.colors.primaryScale[300]
                            : tokens.colors.neutral[200]
                        }`,
                        backgroundColor:
                          agentData.voiceId === voice.id
                            ? tokens.colors.primaryScale[50]
                            : tokens.colors.common.white,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        ...hoverStyle,
                      }}
                    >
                      <Box>
                        <Text
                          as="span"
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                          }}
                        >
                          {voice.name}
                        </Text>
                        {voice.accent && (
                          <Text
                            as="span"
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                              marginLeft: tokens.spacing[2],
                            }}
                          >
                            ({voice.accent})
                          </Text>
                        )}
                      </Box>
                      {agentData.voiceId === voice.id && (
                        <CheckCircle
                          size={16}
                          style={{ color: tokens.colors.primaryScale[600] }}
                        />
                      )}
                    </Box>
                  ))}
              </Box>
            </Box>
          )}
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  4. Personality Panel                                        */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Personality & Tone"
          icon={<Brain size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['personality']}
          onToggle={() => toggleSection('personality')}
          glass={isGlass}
          Box={Box}
          Text={Text}
        >
          {/* Tone selector with visual scale SVG */}
          <Box style={{ marginBottom: tokens.spacing[5] }}>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[2],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                }}
              >
                Tone Level
              </Text>
              <Text
                as="span"
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.primaryScale[600],
                }}
              >
                {getToneLevelLabel(agentData.toneLevel)}
              </Text>
            </Box>
            {/* Gradient bar SVG */}
            <svg width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tone-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={tokens.colors.primaryScale[700]} />
                  <stop offset="50%" stopColor={tokens.colors.primaryScale[400]} />
                  <stop offset="100%" stopColor={tokens.colors.secondaryScale[500]} />
                </linearGradient>
              </defs>
              <rect x="0" y="10" width="400" height="12" rx="6" fill={tokens.colors.neutral[200]} />
              <rect
                x="0"
                y="10"
                width={agentData.toneLevel * 4}
                height="12"
                rx="6"
                fill="url(#tone-gradient)"
              />
              <circle
                cx={agentData.toneLevel * 4}
                cy="16"
                r="8"
                fill={tokens.colors.common.white}
                stroke={tokens.colors.primaryScale[500]}
                strokeWidth="2"
              />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={agentData.toneLevel}
              onChange={(e) => updateAgent({ toneLevel: parseInt(e.target.value, 10) })}
              style={{
                width: '100%',
                marginTop: tokens.spacing[1],
                accentColor: tokens.colors.primaryScale[600],
              }}
            />
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              <Text>Formal</Text>
              <Text>Casual</Text>
            </Box>
          </Box>

          {/* Personality trait sliders */}
          <Box>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[3],
              }}
            >
              Personality Traits
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
              {agentData.personalityTraits.map((trait, i) => (
                <Box key={trait.name}>
                  <Box
                    style={{
                      ...animStyle(i),
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Text
                      as="span"
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {trait.name}
                    </Text>
                    <Text
                      as="span"
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.primaryScale[600],
                        minWidth: tokens.spacing[8],
                        textAlign: 'right',
                      }}
                    >
                      {trait.value}%
                    </Text>
                  </Box>
                  <Box style={{ position: 'relative' }}>
                    <Box
                      style={{
                        height: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[200],
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          height: '100%',
                          width: `${trait.value}%`,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[500],
                          transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                        }}
                      />
                    </Box>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={trait.value}
                      onChange={(e) => updateTrait(trait.name, parseInt(e.target.value, 10))}
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: 0,
                        width: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        height: tokens.spacing[4],
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  5. LLM Configuration Panel                                  */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="LLM Configuration"
          icon={<Settings size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['llm']}
          onToggle={() => toggleSection('llm')}
          glass={isGlass}
          Box={Box}
          Text={Text}
        >
          {/* Model selector */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[1],
              }}
            >
              Model
            </Text>
            <select
              value={agentData.model}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateAgent({ model: e.target.value })}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                backgroundColor: tokens.colors.common.white,
                outline: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {models.map((model, i) => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.description ? `- ${model.description}` : ''}
                </option>
              ))}
            </select>
          </Box>

          {/* Temperature slider */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[1],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                }}
              >
                Temperature
              </Text>
              <Text
                as="span"
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.primaryScale[600],
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}
              >
                {(agentData.temperature ?? 0).toFixed(1)} - {getTemperatureLabel(agentData.temperature)}
              </Text>
            </Box>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={agentData.temperature}
              onChange={(e) => updateAgent({ temperature: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                accentColor: tokens.colors.primaryScale[600],
              }}
            />
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              <Text>Deterministic</Text>
              <Text>Balanced</Text>
              <Text>Creative</Text>
            </Box>
          </Box>

          {/* Max tokens & Top-P in a grid */}
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
            <Box>
              <Text
                style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Max Tokens
              </Text>
              <input
                type="number"
                value={agentData.maxTokens}
                onChange={(e) => updateAgent({ maxTokens: parseInt(e.target.value, 10) || 0 })}
                min={1}
                max={200000}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                }}
              />
            </Box>
            <Box>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Top-P
                </Text>
                <Text as="span"
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {(agentData.topP ?? 0).toFixed(2)}
                </Text>
              </Box>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={agentData.topP}
                onChange={(e) => updateAgent({ topP: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  accentColor: tokens.colors.primaryScale[600],
                  marginTop: tokens.spacing[1],
                }}
              />
            </Box>
          </Box>
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  6. System Prompt Editor                                     */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="System Prompt"
          icon={<Code2 size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['prompt']}
          onToggle={() => toggleSection('prompt')}
          glass={isGlass}
          Box={Box}
          Text={Text}
          badge={
            agentData.systemPrompt ? (
              <Text as="span"
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.successScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {agentData.systemPrompt.length} chars
              </Text>
            ) : undefined
          }
        >
          {/* Variable helpers */}
          <Box style={{ marginBottom: tokens.spacing[3] }}>
            <Text
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase',
                letterSpacing: typo.labelLetterSpacing,
                marginBottom: tokens.spacing[2],
              }}
            >
              Available Variables
            </Text>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
              {SYSTEM_PROMPT_VARIABLES.map((variable, i) => (
                <Box
                  key={variable}
                  onClick={() => insertVariable(variable)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); insertVariable(variable); } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Insert variable ${variable}`}
                  style={{
                    ...animStyle(i),
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[700],
                    fontSize: tokens.typography.fontSize.xs,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {variable}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Code-editor style textarea */}
          <textarea
            value={agentData.systemPrompt}
            onChange={(e) => updateAgent({ systemPrompt: e.target.value })}
            placeholder="You are an AI interview agent for {company_name}. Your role is to conduct a structured technical screening for the {job_title} position with {candidate_name}..."
            rows={12}
            style={{
              width: '100%',
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
              fontSize: tokens.typography.fontSize.sm,
              fontFamily: 'inherit',
              lineHeight: tokens.typography.lineHeight.relaxed,
              color: tokens.colors.neutral[100],
              backgroundColor: tokens.colors.neutral[900],
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              tabSize: 2,
            }}
          
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
              e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = tokens.colors.neutral[300];
            }}
          />
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  7. Script Builder                                           */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Interview Script"
          icon={<FileText size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['script']}
          onToggle={() => toggleSection('script')}
          glass={isGlass}
          Box={Box}
          Text={Text}
          badge={
            <Text as="span"
              style={{
                ...createBadgeStyle(tokens, 'secondary'),
                fontSize: tokens.typography.fontSize.xs,
              }}
            >
              {sortedSections.length} section{sortedSections.length !== 1 ? 's' : ''}
            </Text>
          }
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {sortedSections.map((section, idx) => {
              const isDragging = dragState.dragId === section.id;
              const isDragOver = dragState.overId === section.id;
              return (
                <Box key={section.id}>
                  <Box
                    draggable
                    onDragStart={(e) => handleScriptDragStart(e, section.id)}
                    onDragOver={(e) => handleScriptDragOver(e, section.id)}
                    onDrop={(e) => handleScriptDrop(e, section.id)}
                    onDragEnd={handleScriptDragEnd}
                    style={{
                      ...animStyle(idx),
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                        isDragOver
                          ? tokens.colors.primaryScale[400]
                          : tokens.colors.neutral[200]
                      }`,
                      backgroundColor: isDragging
                        ? tokens.colors.primaryScale[50]
                        : tokens.colors.common.white,
                      opacity: isDragging ? 0.6 : 1,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {/* Section header */}
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <Text as="span"
                        style={{
                          cursor: 'grab',
                          color: tokens.colors.neutral[400],
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <GripVertical size={16} />
                      </Text>
                      <Text as="span"
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[400],
                          minWidth: tokens.spacing[6],
                        }}
                      >
                        #{idx + 1}
                      </Text>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) =>
                          updateScriptSection(section.id, { title: e.target.value })
                        }
                        style={{
                          flex: 1,
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          borderRadius: tokens.borderRadius.sm,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[800],
                          backgroundColor: tokens.colors.common.white,
                          outline: 'none',
                        }}
                      
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                          e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                        }}
                      />
                      <Box
                        onClick={() => removeScriptSection(section.id)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeScriptSection(section.id); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Delete section ${section.title || idx + 1}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: tokens.spacing[1],
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: tokens.colors.neutral[400],
                          transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
                          borderRadius: tokens.borderRadius.sm,
                        }}
                      >
                        <Trash2 size={14} />
                      </Box>
                    </Box>

                    {/* Prompt textarea */}
                    <textarea
                      value={section.promptText}
                      onChange={(e) =>
                        updateScriptSection(section.id, { promptText: e.target.value })
                      }
                      placeholder="Enter the prompt for this interview section..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[800],
                        backgroundColor: tokens.colors.neutral[50],
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        lineHeight: tokens.typography.lineHeight.relaxed,
                        boxSizing: 'border-box',
                      }}
                    
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                      }}
                    />

                    {/* Branching conditions */}
                    <Box style={{ marginTop: tokens.spacing[2] }}>
                      <input
                        type="text"
                        value={section.conditions ?? ''}
                        onChange={(e) =>
                          updateScriptSection(section.id, { conditions: e.target.value })
                        }
                        placeholder="Branching conditions (optional, e.g. 'if candidate has 5+ years experience')"
                        style={{
                          width: '100%',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          backgroundColor: 'transparent',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                          e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Add section button between items */}
                  {idx < sortedSections.length - 1 && (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: `${tokens.spacing[1]}px 0`,
                      }}
                    >
                      <Box
                        style={{
                          flex: 1,
                          height: 1,
                          backgroundColor: tokens.colors.neutral[200],
                        }}
                      />
                      <Box
                        onClick={addScriptSection}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addScriptSection(); } }}
                        role="button"
                        tabIndex={0}
                        aria-label="Add script section"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: tokens.spacing[6],
                          height: tokens.spacing[6],
                          borderRadius: tokens.borderRadius.full,
                          border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                          backgroundColor: tokens.colors.common.white,
                          cursor: 'pointer',
                          color: tokens.colors.neutral[400],
                          transition: `all ${tokens.motion.hover}`,
                          margin: `0 ${tokens.spacing[2]}px`,
                        }}
                      >
                        <Plus size={14} />
                      </Box>
                      <Box
                        style={{
                          flex: 1,
                          height: 1,
                          backgroundColor: tokens.colors.neutral[200],
                        }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* Add first/last section button */}
            <Box
              onClick={addScriptSection}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addScriptSection(); } }}
              role="button"
              tabIndex={0}
              aria-label="Add script section"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[2],
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                border: `2px dashed ${tokens.colors.neutral[300]}`,
                backgroundColor: 'transparent',
                color: tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Plus size={16} />
              Add Section
            </Box>
          </Box>
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  8. Tool Configuration                                       */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Function Tools"
          icon={<Wrench size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['tools']}
          onToggle={() => toggleSection('tools')}
          glass={isGlass}
          Box={Box}
          Text={Text}
          badge={
            agentData.tools.length > 0 ? (
              <Text as="span"
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.successScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {agentData.tools.filter((t) => t.enabled).length}/{agentData.tools.length} enabled
              </Text>
            ) : undefined
          }
        >
          {agentData.tools.length === 0 ? (
            <Box
              style={{
                textAlign: 'center',
                padding: tokens.spacing[6],
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              No function tools configured. Add tools to extend agent capabilities.
            </Box>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {agentData.tools.map((tool) => (
                <Box
                  key={tool.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                      tool.enabled
                        ? tokens.colors.primaryScale[200]
                        : tokens.colors.neutral[200]
                    }`,
                    backgroundColor: tool.enabled
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.common.white,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Box style={{ flex: 1 }}>
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {tool.name}
                    </Box>
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        lineHeight: tokens.typography.lineHeight.normal,
                      }}
                    >
                      {tool.description}
                    </Box>
                  </Box>
                  <Box
                    onClick={() => toggleTool(tool.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTool(tool.id); } }}
                    role="switch"
                    tabIndex={0}
                    aria-checked={tool.enabled}
                    aria-label={`Toggle ${tool.name}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: tool.enabled
                        ? tokens.colors.primaryScale[600]
                        : tokens.colors.neutral[400],
                      transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      marginLeft: tokens.spacing[3],
                      flexShrink: 0,
                    }}
                  >
                    {tool.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  9. Call Settings                                            */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Call Settings"
          icon={<PhoneCall size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['call']}
          onToggle={() => toggleSection('call')}
          glass={isGlass}
          Box={Box}
          Text={Text}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
            {/* Recording toggle */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                  }}
                >
                  Call Recording
                </Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Record all agent calls for quality assurance
                </Box>
              </Box>
              <Box
                onClick={() =>
                  updateCallSettings({ recordingEnabled: !agentData.callSettings.recordingEnabled })
                }
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateCallSettings({ recordingEnabled: !agentData.callSettings.recordingEnabled }); } }}
                role="switch"
                tabIndex={0}
                aria-checked={agentData.callSettings.recordingEnabled}
                aria-label="Toggle call recording"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: agentData.callSettings.recordingEnabled
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[400],
                  transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }}
              >
                {agentData.callSettings.recordingEnabled ? (
                  <ToggleRight size={28} />
                ) : (
                  <ToggleLeft size={28} />
                )}
              </Box>
            </Box>

            {/* Max duration slider */}
            <Box>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Max Duration
                </Text>
                <Text
                  as="span"
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[600],
                  }}
                >
                  {agentData.callSettings.maxDurationMinutes} min
                </Text>
              </Box>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={agentData.callSettings.maxDurationMinutes}
                onChange={(e) =>
                  updateCallSettings({ maxDurationMinutes: parseInt(e.target.value, 10) })
                }
                style={{
                  width: '100%',
                  accentColor: tokens.colors.primaryScale[600],
                }}
              />
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}
              >
                <Text>5 min</Text>
                <Text>120 min</Text>
              </Box>
            </Box>

            {/* Voicemail detection toggle */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                  }}
                >
                  Voicemail Detection
                </Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Detect voicemail and leave a scripted message
                </Box>
              </Box>
              <Box
                onClick={() =>
                  updateCallSettings({
                    voicemailDetection: !agentData.callSettings.voicemailDetection,
                  })
                }
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateCallSettings({ voicemailDetection: !agentData.callSettings.voicemailDetection }); } }}
                role="switch"
                tabIndex={0}
                aria-checked={agentData.callSettings.voicemailDetection}
                aria-label="Toggle voicemail detection"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: agentData.callSettings.voicemailDetection
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[400],
                  transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }}
              >
                {agentData.callSettings.voicemailDetection ? (
                  <ToggleRight size={28} />
                ) : (
                  <ToggleLeft size={28} />
                )}
              </Box>
            </Box>

            {/* Retry config */}
            <Box>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Retry Attempts
                </Text>
                <Text
                  as="span"
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[600],
                  }}
                >
                  {agentData.callSettings.retryCount}
                </Text>
              </Box>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={agentData.callSettings.retryCount}
                onChange={(e) =>
                  updateCallSettings({ retryCount: parseInt(e.target.value, 10) })
                }
                style={{
                  width: '100%',
                  accentColor: tokens.colors.primaryScale[600],
                }}
              />
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}
              >
                <Text>No retry</Text>
                <Text>5 retries</Text>
              </Box>
            </Box>
          </Box>
        </CollapsibleSection>

        {/* =========================================================== */}
        {/*  10. Validation Panel                                        */}
        {/* =========================================================== */}
        <CollapsibleSection
          title="Validation & Cost"
          icon={<ShieldCheck size={18} />}
          tokens={tokens}
          isCollapsed={!!collapsedSections['validation']}
          onToggle={() => toggleSection('validation')}
          glass={isGlass}
          Box={Box}
          Text={Text}
          badge={
            validationResults.length > 0 ? (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {passCount > 0 && (
                  <Text as="span"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.successScale[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    <CheckCircle size={12} /> {passCount}
                  </Text>
                )}
                {failCount > 0 && (
                  <Text as="span"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.errorScale[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    <XCircle size={12} /> {failCount}
                  </Text>
                )}
                {warnCount > 0 && (
                  <Text as="span"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.warningScale[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    <AlertTriangle size={12} /> {warnCount}
                  </Text>
                )}
              </Box>
            ) : undefined
          }
        >
          {/* Estimated cost */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
              marginBottom: tokens.spacing[4],
            }}
          >
            <Box
              style={{
                width: tokens.spacing[10],
                height: tokens.spacing[10],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.primaryScale[600],
                flexShrink: 0,
              }}
            >
              <DollarSign size={20} />
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.primaryScale[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                  textTransform: 'uppercase',
                  letterSpacing: typo.labelLetterSpacing,
                  display: 'block',
                }}
              >
                Estimated Cost per Interview
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[700],
                }}
              >
                {formatEstimatedCost(estimatedCost)}
              </Text>
            </Box>
          </Box>

          {/* Validation checks */}
          {validationResults.length === 0 ? (
            <Box
              style={{
                textAlign: 'center',
                padding: tokens.spacing[6],
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              Click "Validate" to run configuration checks.
            </Box>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {validationResults.map((result, idx) => {
                const colors = validationColors[result.status];
                const StatusIcon =
                  result.status === 'pass'
                    ? CheckCircle
                    : result.status === 'fail'
                    ? XCircle
                    : AlertTriangle;
                return (
                  <Box
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: colors.bgColor,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.borderColor}`,
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: tokens.spacing[1],
                        flexShrink: 0,
                        color: colors.dotColor,
                      }}
                    >
                      <StatusIcon size={16} />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: colors.color,
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {result.check}
                      </Box>
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: colors.color,
                          opacity: 0.8,
                          lineHeight: tokens.typography.lineHeight.normal,
                        }}
                      >
                        {result.message}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </CollapsibleSection>
      </Box>
    );
  },
});
