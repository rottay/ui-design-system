'use client';

/**
 * BhAgentStudio - Guided Preset
 * Step-by-step wizard mode guiding users through agent configuration.
 * Steps: Identity -> Language & Voice -> Personality -> LLM Config -> Script -> Tools -> Settings -> Review
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
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
  Check,
  Copy,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Wizard step definition                                             */
/* ------------------------------------------------------------------ */
interface WizardStep {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Guided Preset                                                      */
/* ------------------------------------------------------------------ */
export const GuidedBhAgentStudio = createPreset<BhAgentStudioProps>({
  name: 'BhAgentStudio.Guided',
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
    const [currentStep, setCurrentStep] = useState(0);
    const [voicePreviewPlaying, setVoicePreviewPlaying] = useState(false);
    const [internalIsDirty, setInternalIsDirty] = useState(isDirtyProp);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const agentData = agentDataProp ?? internalAgentData;
    const isDirty = isDirtyProp || internalIsDirty;
    const estimatedCost = estimatedCostProp;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);

    const agentTypeConfig = useMemo(() => getAgentTypeConfig(tokens), [tokens]);
    const providerConfig = useMemo(() => getProviderConfig(tokens), [tokens]);
    const validationColors = useMemo(() => getValidationStatusColors(tokens), [tokens]);

    const steps: WizardStep[] = useMemo(
      () => [
        { key: 'identity', label: 'Agent Identity', description: 'Name, description, and type', icon: <Bot size={18} /> },
        { key: 'language-voice', label: 'Language & Voice', description: 'Language, accent, and voice provider', icon: <Mic size={18} /> },
        { key: 'personality', label: 'Personality', description: 'Tone and personality traits', icon: <Brain size={18} /> },
        { key: 'llm', label: 'LLM Config', description: 'Model and parameters', icon: <Settings size={18} /> },
        { key: 'prompt', label: 'System Prompt', description: 'Base instructions for the agent', icon: <Code2 size={18} /> },
        { key: 'script', label: 'Interview Script', description: 'Script sections and flow', icon: <FileText size={18} /> },
        { key: 'tools', label: 'Function Tools', description: 'Enable agent capabilities', icon: <Wrench size={18} /> },
        { key: 'review', label: 'Review & Deploy', description: 'Validate and save', icon: <ShieldCheck size={18} /> },
      ],
      [],
    );

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

    const updateTrait = useCallback(
      (name: string, value: number) => {
        const updated = agentData.personalityTraits.map((t) =>
          t.name === name ? { ...t, value } : t,
        );
        updateAgent({ personalityTraits: updated });
      },
      [agentData.personalityTraits, updateAgent],
    );

    /* ---------- Script helpers ---------- */
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
        const updated = agentData.scriptSections.map((s) =>
          s.id === id ? { ...s, ...partial } : s,
        );
        updateAgent({ scriptSections: updated });
      },
      [agentData.scriptSections, updateAgent],
    );

    const toggleTool = useCallback(
      (toolId: string) => {
        const updated = agentData.tools.map((t) =>
          t.id === toolId ? { ...t, enabled: !t.enabled } : t,
        );
        updateAgent({ tools: updated });
      },
      [agentData.tools, updateAgent],
    );

    const insertVariable = useCallback(
      (variable: string) => {
        updateAgent({ systemPrompt: agentData.systemPrompt + ' ' + variable });
      },
      [agentData.systemPrompt, updateAgent],
    );

    /* ---------- Navigation ---------- */
    const goNext = useCallback(() => {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStep);
        return next;
      });
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, [currentStep, steps.length]);

    const goBack = useCallback(() => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    }, [currentStep]);

    const goToStep = useCallback(
      (idx: number) => {
        if (idx <= Math.max(currentStep, Math.max(...Array.from(completedSteps), -1) + 1)) {
          setCurrentStep(idx);
        }
      },
      [currentStep, completedSteps],
    );

    /* ---------- Agent type icon ---------- */
    const getAgentTypeIcon = (type: AgentType, size: number) => {
      switch (type) {
        case 'conversational':
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

    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    const currentStepData = steps[currentStep];

    const passCount = validationResults.filter((v) => v.status === 'pass').length;
    const failCount = validationResults.filter((v) => v.status === 'fail').length;
    const warnCount = validationResults.filter((v) => v.status === 'warning').length;

    /* ================================================================ */
    /*  Step Content Renderers                                          */
    /* ================================================================ */

    const renderIdentityStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
        {/* Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[1],
            }}
          >
            Agent Name
          </label>
          <input
            type="text"
            value={agentData.name}
            onChange={(e) => updateAgent({ name: e.target.value })}
            placeholder="e.g. Technical Screen Agent"
            style={{
              width: '100%',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[900],
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
        </div>

        {/* Description */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[1],
            }}
          >
            Description
          </label>
          <textarea
            value={agentData.description}
            onChange={(e) => updateAgent({ description: e.target.value })}
            placeholder="Describe the agent's purpose and role..."
            rows={4}
            style={{
              width: '100%',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[800],
              backgroundColor: tokens.colors.common.white,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
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
        </div>

        {/* Type selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[2],
            }}
          >
            Agent Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
            {(Object.keys(agentTypeConfig) as AgentType[]).map((type) => {
              const config = agentTypeConfig[type];
              const isSelected = agentData.type === type;
              return (
                <button
                  key={type}
                  onClick={() => updateAgent({ type })}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: tokens.spacing[5],
                    borderRadius: tokens.borderRadius.lg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? config.color : tokens.colors.neutral[200]}`,
                    backgroundColor: isSelected ? config.bgColor : tokens.colors.common.white,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <div
                    style={{
                      width: tokens.spacing[12],
                      height: tokens.spacing[12],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: isSelected ? config.color : tokens.colors.neutral[100],
                      color: isSelected ? tokens.colors.common.white : tokens.colors.neutral[500],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {getAgentTypeIcon(type, 24)}
                  </div>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: isSelected ? config.color : tokens.colors.neutral[700],
                    }}
                  >
                    {config.label}
                  </span>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      textAlign: 'center',
                      lineHeight: tokens.typography.lineHeight.normal,
                    }}
                  >
                    {config.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );

    const renderLanguageVoiceStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
        {/* Language + Accent */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[1],
              }}
            >
              Language
            </label>
            <select
              value={agentData.language}
              onChange={(e) => updateAgent({ language: e.target.value })}
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
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[1],
              }}
            >
              Accent / Dialect
            </label>
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
          </div>
        </div>

        {/* Voice provider cards */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[2],
            }}
          >
            Voice Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
            {providers.map((provider) => {
              const config = providerConfig[provider];
              const isSelected = agentData.voiceProvider === provider;
              return (
                <button
                  key={provider}
                  onClick={() => updateAgent({ voiceProvider: provider })}
                  style={{
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
                    style={{ color: isSelected ? config.color : tokens.colors.neutral[400] }}
                  />
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: isSelected ? config.color : tokens.colors.neutral[700],
                    }}
                  >
                    {config.label}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {config.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice ID + Preview */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[1],
            }}
          >
            Voice ID
          </label>
          <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
            <input
              type="text"
              value={agentData.voiceId}
              onChange={(e) => updateAgent({ voiceId: e.target.value })}
              placeholder="Enter voice ID"
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
            <button
              onClick={() => setVoicePreviewPlaying(!voicePreviewPlaying)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: voicePreviewPlaying ? tokens.colors.errorScale[500] : tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                ...hoverStyle,
              }}
            >
              {voicePreviewPlaying ? <Pause size={14} /> : <Play size={14} />}
              {voicePreviewPlaying ? 'Stop' : 'Preview'}
            </button>
          </div>

          {/* Waveform */}
          <div
            style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[100],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none">
              {Array.from({ length: 50 }).map((_, i) => {
                const x = (i / 50) * 400;
                const barHeight = (Math.sin(i * 0.5 + 2.5) * 0.4 + 0.5) * 30;
                const y = (40 - barHeight) / 2;
                const isActive = voicePreviewPlaying && i < 25;
                return (
                  <rect
                    key={i}
                    x={x + 1}
                    y={y}
                    width={5}
                    height={barHeight}
                    rx={2}
                    fill={isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}
                    style={{ transition: `fill ${tokens.transitions?.fast || tokens.motion.hover}` }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Available voices */}
          {voices.filter((v) => v.provider === agentData.voiceProvider).length > 0 && (
            <div style={{ marginTop: tokens.spacing[3] }}>
              <label
                style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[2],
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Available Voices
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                {voices
                  .filter((v) => v.provider === agentData.voiceProvider)
                  .map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => updateAgent({ voiceId: voice.id })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${agentData.voiceId === voice.id ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                        backgroundColor: agentData.voiceId === voice.id ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        ...hoverStyle,
                      }}
                    >
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                        {voice.name}
                        {voice.accent && (
                          <span style={{ color: tokens.colors.neutral[500], marginLeft: tokens.spacing[1] }}>
                            ({voice.accent})
                          </span>
                        )}
                      </span>
                      {agentData.voiceId === voice.id && (
                        <CheckCircle size={16} style={{ color: tokens.colors.primaryScale[600] }} />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    const renderPersonalityStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
        {/* Tone scale */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
            <label
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
              }}
            >
              Tone Level
            </label>
            <span
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
              }}
            >
              {getToneLevelLabel(agentData.toneLevel)}
            </span>
          </div>
          <svg width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none">
            <defs>
              <linearGradient id="guided-tone-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={tokens.colors.primaryScale[700]} />
                <stop offset="50%" stopColor={tokens.colors.primaryScale[400]} />
                <stop offset="100%" stopColor={tokens.colors.secondaryScale[500]} />
              </linearGradient>
            </defs>
            <rect x="0" y="10" width="400" height="12" rx="6" fill={tokens.colors.neutral[200]} />
            <rect x="0" y="10" width={agentData.toneLevel * 4} height="12" rx="6" fill="url(#guided-tone-gradient)" />
            <circle cx={agentData.toneLevel * 4} cy="16" r="8" fill={tokens.colors.common.white} stroke={tokens.colors.primaryScale[500]} strokeWidth="2" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={agentData.toneLevel}
            onChange={(e) => updateAgent({ toneLevel: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: tokens.colors.primaryScale[600], marginTop: tokens.spacing[1] }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}
          >
            <span>Formal</span>
            <span>Casual</span>
          </div>
        </div>

        {/* Personality traits */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[3],
            }}
          >
            Personality Traits
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
            {agentData.personalityTraits.map((trait) => (
              <div key={trait.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                    {trait.name}
                  </span>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.primaryScale[600],
                    }}
                  >
                    {trait.value}%
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      height: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.neutral[200],
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${trait.value}%`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[500],
                        transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                      }}
                    />
                  </div>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const renderLLMStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
        {/* Model */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[1],
            }}
          >
            Model
          </label>
          <select
            value={agentData.model}
            onChange={(e) => updateAgent({ model: e.target.value })}
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
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.description ? `- ${m.description}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
            <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
              Temperature
            </label>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primaryScale[600], fontWeight: tokens.typography.fontWeight.semibold }}>
              {agentData.temperature.toFixed(1)} - {getTemperatureLabel(agentData.temperature)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={agentData.temperature}
            onChange={(e) => updateAgent({ temperature: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: tokens.colors.primaryScale[600] }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
            <span>Deterministic</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max tokens + Top-P */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          <div>
            <label style={{ display: 'block', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[1] }}>
              Max Tokens
            </label>
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
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                Top-P
              </label>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {agentData.topP.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={agentData.topP}
              onChange={(e) => updateAgent({ topP: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: tokens.colors.primaryScale[600], marginTop: tokens.spacing[1] }}
            />
          </div>
        </div>
      </div>
    );

    const renderPromptStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        {/* Variables */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: tokens.spacing[2],
            }}
          >
            Click to insert variable
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
            {SYSTEM_PROMPT_VARIABLES.map((variable) => (
              <button
                key={variable}
                onClick={() => insertVariable(variable)}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  backgroundColor: tokens.colors.primaryScale[50],
                  color: tokens.colors.primaryScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {variable}
              </button>
            ))}
          </div>
        </div>

        {/* Code-editor textarea */}
        <textarea
          value={agentData.systemPrompt}
          onChange={(e) => updateAgent({ systemPrompt: e.target.value })}
          placeholder="You are an AI interview agent for {company_name}..."
          rows={16}
          style={{
            width: '100%',
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
            fontSize: tokens.typography.fontSize.sm,
            fontFamily: 'monospace',
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
      </div>
    );

    const renderScriptStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
        {sortedSections.map((section, idx) => (
          <div
            key={section.id}
            style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
              <span style={{ color: tokens.colors.neutral[400], display: 'flex', alignItems: 'center' }}>
                <GripVertical size={16} />
              </span>
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[400],
                  minWidth: tokens.spacing[6],
                }}
              >
                #{idx + 1}
              </span>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateScriptSection(section.id, { title: e.target.value })}
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
              <button
                onClick={() => removeScriptSection(section.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: tokens.spacing[1],
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  color: tokens.colors.neutral[400],
                  borderRadius: tokens.borderRadius.sm,
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={section.promptText}
              onChange={(e) => updateScriptSection(section.id, { promptText: e.target.value })}
              placeholder="Enter the prompt for this interview section..."
              rows={3}
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
            <input
              type="text"
              value={section.conditions ?? ''}
              onChange={(e) => updateScriptSection(section.id, { conditions: e.target.value })}
              placeholder="Branching conditions (optional)"
              style={{
                width: '100%',
                marginTop: tokens.spacing[2],
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
          </div>
        ))}
        <button
          onClick={addScriptSection}
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
        </button>
      </div>
    );

    const renderToolsStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
        {agentData.tools.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: tokens.spacing[8],
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}
          >
            No function tools configured. Tools can be added via the API or admin panel.
          </div>
        ) : (
          agentData.tools.map((tool) => (
            <div
              key={tool.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tool.enabled ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                backgroundColor: tool.enabled ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], marginBottom: tokens.spacing[1] }}>
                  {tool.name}
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {tool.description}
                </div>
              </div>
              <button
                onClick={() => toggleTool(tool.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: tool.enabled ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                  transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
                  marginLeft: tokens.spacing[3],
                  flexShrink: 0,
                }}
              >
                {tool.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))
        )}
      </div>
    );

    const renderReviewStep = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
          {/* Agent summary */}
          <div
            style={{
              ...cardBase,
              padding: tokens.spacing[4],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <Bot size={16} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                Agent Identity
              </Text>
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], lineHeight: tokens.typography.lineHeight.relaxed }}>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Name:</strong> {agentData.name || 'Not set'}</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Type:</strong> {agentTypeConfig[agentData.type].label}</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Language:</strong> {agentData.language} ({agentData.accent})</div>
            </div>
          </div>

          {/* LLM summary */}
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <Settings size={16} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                LLM Configuration
              </Text>
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], lineHeight: tokens.typography.lineHeight.relaxed }}>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Model:</strong> {agentData.model}</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Temperature:</strong> {agentData.temperature.toFixed(1)}</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Max Tokens:</strong> {agentData.maxTokens}</div>
            </div>
          </div>

          {/* Voice summary */}
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <Mic size={16} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                Voice
              </Text>
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], lineHeight: tokens.typography.lineHeight.relaxed }}>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Provider:</strong> {providerConfig[agentData.voiceProvider].label}</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Voice ID:</strong> {agentData.voiceId || 'Not set'}</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Tone:</strong> {getToneLevelLabel(agentData.toneLevel)}</div>
            </div>
          </div>

          {/* Script summary */}
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <FileText size={16} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                Script & Tools
              </Text>
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], lineHeight: tokens.typography.lineHeight.relaxed }}>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Script Sections:</strong> {agentData.scriptSections.length}</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>Tools:</strong> {agentData.tools.filter((t) => t.enabled).length}/{agentData.tools.length} enabled</div>
              <div><strong style={{ color: tokens.colors.neutral[800] }}>System Prompt:</strong> {agentData.systemPrompt ? `${agentData.systemPrompt.length} chars` : 'Not set'}</div>
            </div>
          </div>
        </div>

        {/* Estimated cost */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.primaryScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
          }}
        >
          <div
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
          </div>
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.primaryScale[500],
                fontWeight: tokens.typography.fontWeight.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
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
          </div>
        </div>

        {/* Validation */}
        {validationResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
                marginBottom: tokens.spacing[1],
              }}
            >
              Validation Results
            </Text>
            {validationResults.map((result, idx) => {
              const colors = validationColors[result.status];
              const StatusIcon = result.status === 'pass' ? CheckCircle : result.status === 'fail' ? XCircle : AlertTriangle;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: colors.bgColor,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.borderColor}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 2, flexShrink: 0, color: colors.dotColor }}>
                    <StatusIcon size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: colors.color }}>
                      {result.check}
                    </span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.color, opacity: 0.8, marginLeft: tokens.spacing[2] }}>
                      {result.message}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], justifyContent: 'center', paddingTop: tokens.spacing[2] }}>
          <button
            onClick={() => onValidate?.(agentData)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
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
          </button>
          <button
            onClick={() => onSave?.(agentData)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: tokens.colors.primaryScale[600],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.common.white,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              ...hoverStyle,
            }}
          >
            <Save size={14} />
            Save & Deploy Agent
          </button>
        </div>
      </div>
    );

    /* ---------- Step content dispatcher ---------- */
    const renderCurrentStep = () => {
      switch (currentStep) {
        case 0:
          return renderIdentityStep();
        case 1:
          return renderLanguageVoiceStep();
        case 2:
          return renderPersonalityStep();
        case 3:
          return renderLLMStep();
        case 4:
          return renderPromptStep();
        case 5:
          return renderScriptStep();
        case 6:
          return renderToolsStep();
        case 7:
          return renderReviewStep();
        default:
          return null;
      }
    };

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
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            ...(isGlass && tokens.glass
              ? {
                  backdropFilter: tokens.glass.blur,
                  WebkitBackdropFilter: tokens.glass.blur,
                  backgroundColor: tokens.glass.bg,
                }
              : {}),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
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
              <Sparkles size={24} />
            </div>
            <div>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                }}
              >
                AI Agent Studio
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                Step-by-step agent configuration wizard
              </Text>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100% - 82px)' }}>
          {/* =========================================================== */}
          {/*  Left: Step Navigation Sidebar                              */}
          {/* =========================================================== */}
          <div
            style={{
              width: '280px',
              flexShrink: 0,
              borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              padding: `${tokens.spacing[4]}px 0`,
              overflow: 'auto',
              ...(isGlass && tokens.glass
                ? {
                    backdropFilter: tokens.glass.blurSm,
                    WebkitBackdropFilter: tokens.glass.blurSm,
                    backgroundColor: tokens.glass.bgLight,
                  }
                : {}),
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              {steps.map((step, idx) => {
                const isCurrent = idx === currentStep;
                const isCompleted = completedSteps.has(idx);
                const isAccessible = idx <= Math.max(currentStep, Math.max(...Array.from(completedSteps), -1) + 1);
                return (
                  <button
                    key={step.key}
                    onClick={() => goToStep(idx)}
                    disabled={!isAccessible}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      backgroundColor: isCurrent ? tokens.colors.primaryScale[50] : 'transparent',
                      border: 'none',
                      borderLeft: `3px solid ${isCurrent ? tokens.colors.primaryScale[600] : 'transparent'}`,
                      cursor: isAccessible ? 'pointer' : 'default',
                      opacity: isAccessible ? 1 : 0.5,
                      transition: `all ${tokens.motion.hover}`,
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: isCompleted
                          ? tokens.colors.successScale[500]
                          : isCurrent
                          ? tokens.colors.primaryScale[600]
                          : tokens.colors.neutral[200],
                        color: isCompleted || isCurrent ? tokens.colors.common.white : tokens.colors.neutral[500],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {isCompleted ? <Check size={14} /> : step.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                          color: isCurrent ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {step.label}
                      </div>
                      <div
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {step.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div
              style={{
                margin: `${tokens.spacing[4]}px ${tokens.spacing[4]}px 0`,
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[2],
                }}
              >
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Progress
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[600],
                  }}
                >
                  {Math.round(((completedSteps.size) / steps.length) * 100)}%
                </span>
              </div>
              <div
                style={{
                  height: tokens.spacing[1],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[200],
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(completedSteps.size / steps.length) * 100}%`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[500],
                    transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* =========================================================== */}
          {/*  Right: Step Content                                         */}
          {/* =========================================================== */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Step header */}
            <div
              style={{
                padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[8],
                    height: tokens.spacing[8],
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    color: tokens.colors.primaryScale[600],
                  }}
                >
                  {currentStepData.icon}
                </span>
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                    }}
                  >
                    {currentStepData.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    Step {currentStep + 1} of {steps.length} &mdash; {currentStepData.description}
                  </Text>
                </div>
              </div>
            </div>

            {/* Scrollable step content */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: tokens.spacing[6],
              }}
            >
              {renderCurrentStep()}
            </div>

            {/* Footer navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
              }}
            >
              <button
                onClick={goBack}
                disabled={isFirstStep}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: isFirstStep ? tokens.colors.neutral[400] : tokens.colors.neutral[700],
                  cursor: isFirstStep ? 'not-allowed' : 'pointer',
                  ...hoverStyle,
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {isDirty && (
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.warningScale[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Unsaved changes
                  </span>
                )}
                {isLastStep ? (
                  <button
                    onClick={() => onSave?.(agentData)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: tokens.colors.primaryScale[600],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      ...hoverStyle,
                    }}
                  >
                    <Save size={16} />
                    Save & Deploy
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: tokens.colors.primaryScale[600],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      ...hoverStyle,
                    }}
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
