'use client';

/**
 * BhTemplateDesigner - Canvas Preset
 * Visual stage builder with drag-connected pipeline, side config panel,
 * automation rules, validation summary, and version history.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type {
  BhTemplateDesignerProps,
  TemplateStage,
  AutomationRule,
  TemplateVersion,
  ValidationItem,
  StageType,
  TemplateStatus,
  ValidationStatus,
  AvailableAgent,
  AvailableRubric,
} from '../../core';
import {
  getStageTypeColors,
  getStatusColors,
  getValidationStatusColors,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Save,
  Send,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Bot,
  User,
  FileText,
  Eye,
  History,
  Undo2,
  Settings2,
  Zap,
  Shield,
  Target,
  Layers,
  ArrowDownUp,
  CircleDot,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: generate SVG pie chart paths for weight distribution       */
/* ------------------------------------------------------------------ */
function generatePieSlices(
  weights: { label: string; value: number; color: string }[],
  cx: number,
  cy: number,
  radius: number
): { d: string; color: string; label: string; value: number }[] {
  const total = weights.reduce((sum, w) => sum + w.value, 0);
  if (total === 0) return [];

  const slices: { d: string; color: string; label: string; value: number }[] = [];
  let currentAngle = -Math.PI / 2;

  for (const w of weights) {
    const sliceAngle = (w.value / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(currentAngle);
    const y1 = cy + radius * Math.sin(currentAngle);
    const x2 = cx + radius * Math.cos(currentAngle + sliceAngle);
    const y2 = cy + radius * Math.sin(currentAngle + sliceAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    slices.push({ d, color: w.color, label: w.label, value: w.value });
    currentAngle += sliceAngle;
  }

  return slices;
}

/* ------------------------------------------------------------------ */
/*  Helper: stage type icon                                            */
/* ------------------------------------------------------------------ */
function stageTypeIcon(type: StageType, size: number, color: string) {
  const props = { size, color, strokeWidth: 1.5 };
  switch (type) {
    case 'ai_interview':
      return <Bot {...props} />;
    case 'human_interview':
      return <User {...props} />;
    case 'assessment':
      return <FileText {...props} />;
    case 'review':
      return <Eye {...props} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: stage type label                                           */
/* ------------------------------------------------------------------ */
function stageTypeLabel(type: StageType): string {
  switch (type) {
    case 'ai_interview':
      return 'AI Interview';
    case 'human_interview':
      return 'Human Interview';
    case 'assessment':
      return 'Assessment';
    case 'review':
      return 'Review';
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: validation status icon                                     */
/* ------------------------------------------------------------------ */
function validationIcon(status: ValidationStatus, size: number, color: string) {
  const props = { size, color, strokeWidth: 1.5 };
  switch (status) {
    case 'pass':
      return <CheckCircle2 {...props} />;
    case 'fail':
      return <XCircle {...props} />;
    case 'warning':
      return <AlertTriangle {...props} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Weight color palette (uses token scales)                           */
/* ------------------------------------------------------------------ */
function getWeightColors(tokens: DesignTokens): string[] {
  return [
    tokens.colors.primaryScale[500],
    tokens.colors.infoScale[500],
    tokens.colors.warningScale[500],
    tokens.colors.successScale[500],
    tokens.colors.errorScale[500],
    tokens.colors.secondaryScale[500],
    tokens.colors.primaryScale[300],
    tokens.colors.infoScale[300],
    tokens.colors.warningScale[300],
    tokens.colors.successScale[300],
  ];
}

/* ------------------------------------------------------------------ */
/*  Canvas Preset                                                      */
/* ------------------------------------------------------------------ */
export const CanvasBhTemplateDesigner = createPreset<BhTemplateDesignerProps>({
  name: 'BhTemplateDesigner.Canvas',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhTemplateDesignerProps>) => {
    const { Box, Text } = primitives;

    const {
      templateName,
      category,
      industry,
      status,
      stages,
      selectedStage: selectedStageProp = null,
      automationRules,
      validationResults,
      versions,
      isDirty: isDirtyProp,
      onChange,
      onStageAdd,
      onStageRemove,
      onStageReorder,
      onStageSelect,
      onRuleAdd,
      onRuleRemove,
      onSave,
      onPublish,
      onVersionRollback,
      agents: rawAgents = [],
      rubrics: rawRubrics = [],
      className,
      style,
    } = props;

    const agents = Array.isArray(rawAgents) ? rawAgents : [];
    const rubrics = Array.isArray(rawRubrics) ? rawRubrics : [];

    /* ── Local State ──────────────────────────────────────────────── */
    const [localStages, setLocalStages] = useState<TemplateStage[]>(stages);
    const [localSelectedStage, setLocalSelectedStage] = useState<string | null>(selectedStageProp);
    const [dragState, setDragState] = useState<{ dragging: string | null; over: string | null }>({
      dragging: null,
      over: null,
    });
    const [localValidation, setLocalValidation] = useState<ValidationItem[]>(validationResults);
    const [showVersions, setShowVersions] = useState(false);
    const [localRules, setLocalRules] = useState<AutomationRule[]>(automationRules);
    const [localIsDirty, setLocalIsDirty] = useState(isDirtyProp);
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

    /* ── Derived ──────────────────────────────────────────────────── */
    const sortedStages = useMemo(
      () => [...localStages].sort((a, b) => a.order - b.order),
      [localStages]
    );

    const activeStage = useMemo(
      () => localStages.find((s) => s.id === localSelectedStage) ?? null,
      [localStages, localSelectedStage]
    );

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const stageColors = useMemo(() => getStageTypeColors(tokens), [tokens]);
    const statusColors = useMemo(() => getStatusColors(tokens), [tokens]);
    const valColors = useMemo(() => getValidationStatusColors(tokens), [tokens]);
    const weightColors = useMemo(() => getWeightColors(tokens), [tokens]);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const hoverTransform = getHoverTransform(tokens);

    /* ── Handlers ─────────────────────────────────────────────────── */
    const handleStageSelect = useCallback(
      (stageId: string | null) => {
        setLocalSelectedStage(stageId);
        onStageSelect?.(stageId);
      },
      [onStageSelect]
    );

    const handleStageAdd = useCallback(
      (afterOrder?: number) => {
        onStageAdd?.(afterOrder);
        setLocalIsDirty(true);
      },
      [onStageAdd]
    );

    const handleStageRemove = useCallback(
      (stageId: string) => {
        setLocalStages((prev) => prev.filter((s) => s.id !== stageId));
        if (localSelectedStage === stageId) setLocalSelectedStage(null);
        onStageRemove?.(stageId);
        setLocalIsDirty(true);
      },
      [onStageRemove, localSelectedStage]
    );

    const handleDragStart = useCallback((stageId: string) => {
      setDragState({ dragging: stageId, over: null });
    }, []);

    const handleDragOver = useCallback(
      (stageId: string) => {
        if (dragState.dragging && dragState.dragging !== stageId) {
          setDragState((prev) => ({ ...prev, over: stageId }));
        }
      },
      [dragState.dragging]
    );

    const handleDragEnd = useCallback(() => {
      if (dragState.dragging && dragState.over) {
        const fromStage = localStages.find((s) => s.id === dragState.dragging);
        const toStage = localStages.find((s) => s.id === dragState.over);
        if (fromStage && toStage) {
          onStageReorder?.(fromStage.id, toStage.order);
          setLocalIsDirty(true);
        }
      }
      setDragState({ dragging: null, over: null });
    }, [dragState, localStages, onStageReorder]);

    const handleRuleRemove = useCallback(
      (ruleId: string) => {
        setLocalRules((prev) => prev.filter((r) => r.id !== ruleId));
        onRuleRemove?.(ruleId);
        setLocalIsDirty(true);
      },
      [onRuleRemove]
    );

    const handleSave = useCallback(() => {
      onSave?.();
      setLocalIsDirty(false);
    }, [onSave]);

    const handleVersionRollback = useCallback(
      (version: number) => {
        onVersionRollback?.(version);
        setSelectedVersion(version);
      },
      [onVersionRollback]
    );

    /* ── SVG connection line height calc ──────────────────────────── */
    const connectionLineHeight = 40;
    const stageCardHeight = 120;

    /* ================================================================ */
    /*  RENDER                                                          */
    /* ================================================================ */
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* ── Template Header ──────────────────────────────────────── */}
        <div
          style={{
            ...cardBase,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.none,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}
        >
          {/* Left: Name + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Layers size={20} color={tokens.colors.primaryScale[600]} strokeWidth={1.5} />
              <input
                type="text"
                value={templateName}
                onChange={(e) => {
                  onChange?.('templateName', e.target.value);
                  setLocalIsDirty(true);
                }}
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  minWidth: 200,
                }}
                placeholder="Template Name"
              
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

            {/* Category badge */}
            <span
              style={{
                ...createBadgeStyle(tokens, 'primary'),
                borderRadius: badgeRadius,
                gap: tokens.spacing[1],
              }}
            >
              {category}
            </span>

            {/* Industry badge */}
            <span
              style={{
                ...createBadgeStyle(tokens, 'secondary'),
                borderRadius: badgeRadius,
                gap: tokens.spacing[1],
              }}
            >
              {industry}
            </span>

            {/* Status badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: statusColors[status].bg,
                color: statusColors[status].color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColors[status].border}`,
                gap: tokens.spacing[1],
              }}
            >
              <CircleDot size={10} />
              {(status || '').charAt(0).toUpperCase() + (status || '').slice(1)}
            </span>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {localIsDirty && (
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
            <button
              onClick={() => setShowVersions(!showVersions)}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
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
              <History size={14} />
              History
            </button>
            <button
              onClick={handleSave}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
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
              <Save size={14} />
              Save
            </button>
            <button
              onClick={onPublish}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Send size={14} />
              Publish
            </button>
          </div>
        </div>

        {/* ── Main Content Area ────────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ── Stage Builder Canvas (left) ──────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[5],
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
            }}
          >
            {/* Stage Pipeline */}
            <div style={{ width: '100%', maxWidth: 480 }}>
              {sortedStages.map((stage, idx) => (
                <div key={stage.id}>
                  {/* Connection line above (except first) */}
                  {idx > 0 && (
                    <div
                      style={{
                        ...animStyle(idx),
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        position: 'relative' as const,
                        height: connectionLineHeight,
                      }}
                    >
                      <svg
                        width="2"
                        height={connectionLineHeight}
                        style={{ overflow: 'visible' }}
                      >
                        <line
                          x1="1"
                          y1="0"
                          x2="1"
                          y2={connectionLineHeight}
                          stroke={tokens.colors.neutral[300]}
                          strokeWidth={2}
                          strokeDasharray="4 3"
                        />
                        <circle
                          cx="1"
                          cy="0"
                          r="4"
                          fill={tokens.colors.neutral[300]}
                        />
                        <circle
                          cx="1"
                          cy={connectionLineHeight}
                          r="4"
                          fill={tokens.colors.neutral[300]}
                        />
                      </svg>
                      {/* Add stage button between connections */}
                      <button
                        onClick={() => handleStageAdd(stage.order - 1)}
                        style={{
                          ...hoverStyle,
                          position: 'absolute' as const,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 24,
                          height: 24,
                          borderRadius: tokens.borderRadius.full,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          backgroundColor: tokens.colors.common.white,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          padding: 0,
                          zIndex: 2,
                        }}
                        title="Add stage here"
                      >
                        <Plus size={12} color={tokens.colors.neutral[500]} />
                      </button>
                    </div>
                  )}

                  {/* Stage Card */}
                  <div
                    draggable
                    role="button"
                    tabIndex={0}
                    aria-label={`Select stage ${stage.name}`}
                    aria-pressed={localSelectedStage === stage.id}
                    onDragStart={() => handleDragStart(stage.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      handleDragOver(stage.id);
                    }}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleStageSelect(stage.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageSelect(stage.id); } }}
                    style={{
                      ...cardInteractive,
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: tokens.spacing[3],
                      padding: 0,
                      overflow: 'hidden',
                      borderColor:
                        localSelectedStage === stage.id
                          ? tokens.colors.primaryScale[400]
                          : dragState.over === stage.id
                          ? tokens.colors.primaryScale[200]
                          : tokens.colors.neutral[200],
                      borderWidth: localSelectedStage === stage.id ? '2px' : tokens.surface.borderWidth,
                      borderStyle: 'solid',
                      backgroundColor:
                        dragState.dragging === stage.id
                          ? tokens.colors.neutral[50]
                          : tokens.colors.common.white,
                      opacity: dragState.dragging === stage.id ? 0.6 : 1,
                    }}
                  >
                    {/* Drag handle + order */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        backgroundColor: tokens.colors.neutral[50],
                        borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        cursor: 'grab',
                        minWidth: 44,
                      }}
                    >
                      <GripVertical size={14} color={tokens.colors.neutral[400]} />
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: stageColors[stage.type].bg,
                          color: stageColors[stage.type].color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.bold,
                          marginTop: tokens.spacing[1],
                        }}
                      >
                        {stage.order}
                      </div>
                    </div>

                    {/* Stage Content */}
                    <div
                      style={{
                        flex: 1,
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px ${tokens.spacing[3]}px 0`,
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: tokens.spacing[2],
                      }}
                    >
                      {/* Name + Type */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {stage.name}
                        </Text>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            padding: `2px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: stageColors[stage.type].bg,
                            color: stageColors[stage.type].color,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${stageColors[stage.type].border}`,
                          }}
                        >
                          {stageTypeIcon(stage.type, 10, stageColors[stage.type].color)}
                          {stageTypeLabel(stage.type)}
                        </span>
                      </div>

                      {/* Details row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[3],
                          flexWrap: 'wrap' as const,
                        }}
                      >
                        {stage.agentName && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[600],
                            }}
                          >
                            <Bot size={12} color={tokens.colors.neutral[400]} />
                            {stage.agentName}
                          </span>
                        )}
                        {stage.rubricName && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[600],
                            }}
                          >
                            <Target size={12} color={tokens.colors.neutral[400]} />
                            {stage.rubricName}
                          </span>
                        )}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          <Clock size={12} color={tokens.colors.neutral[400]} />
                          {stage.slaHours}h SLA
                        </span>
                        {stage.isKnockout && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.errorScale[600],
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            <Flag size={12} color={tokens.colors.errorScale[500]} />
                            Knockout
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: tokens.spacing[2],
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStageRemove(stage.id);
                        }}
                        style={{
                          ...hoverStyle,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          padding: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.md,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Remove stage"
                      >
                        <Trash2 size={14} color={tokens.colors.neutral[400]} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add stage at end */}
              {sortedStages.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    height: connectionLineHeight,
                    position: 'relative' as const,
                  }}
                >
                  <svg width="2" height={connectionLineHeight} style={{ overflow: 'visible' }}>
                    <line
                      x1="1"
                      y1="0"
                      x2="1"
                      y2={connectionLineHeight}
                      stroke={tokens.colors.neutral[300]}
                      strokeWidth={2}
                      strokeDasharray="4 3"
                    />
                    <circle cx="1" cy="0" r="4" fill={tokens.colors.neutral[300]} />
                  </svg>
                </div>
              )}

              <button
                onClick={() => handleStageAdd(sortedStages.length)}
                style={{
                  ...hoverStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[2],
                  width: '100%',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.lg,
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
                Add Stage
              </button>
            </div>

            {/* ── Automation Rules Section ─────────────────────────── */}
            <div
              style={{
                width: '100%',
                maxWidth: 480,
                marginTop: tokens.spacing[6],
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[3],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Zap size={16} color={tokens.colors.warningScale[600]} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                    }}
                  >
                    Automation Rules
                  </Text>
                </div>
                <button
                  onClick={onRuleAdd}
                  style={{
                    ...hoverStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Plus size={12} />
                  Add Rule
                </button>
              </div>

              {localRules.length === 0 ? (
                <div
                  style={{
                    ...cardBase,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    padding: tokens.spacing[5],
                    color: tokens.colors.neutral[400],
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                >
                  <Zap size={24} color={tokens.colors.neutral[300]} />
                  <Text
                    style={{
                      marginTop: tokens.spacing[2],
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    No automation rules configured
                  </Text>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                  {localRules.map((rule, i) => (
                    <div
                      key={rule.id}
                      style={{
                        ...animStyle(i),
                        ...cardBase,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: tokens.spacing[3],
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.warningScale[700],
                              textTransform: 'uppercase' as const,
                            }}
                          >
                            IF
                          </span>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[700],
                            }}
                          >
                            {rule.condition}
                            {rule.threshold !== undefined && (
                              <span
                                style={{
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.neutral[900],
                                }}
                              >
                                {' '}
                                &gt; {rule.threshold}
                              </span>
                            )}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.primaryScale[700],
                              textTransform: 'uppercase' as const,
                            }}
                          >
                            THEN
                          </span>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[600],
                            }}
                          >
                            {rule.action}
                          </Text>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRuleRemove(rule.id)}
                        style={{
                          ...hoverStyle,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          padding: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.md,
                        }}
                      >
                        <Trash2 size={14} color={tokens.colors.neutral[400]} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Validation Summary ──────────────────────────────── */}
            <div
              style={{
                width: '100%',
                maxWidth: 480,
                marginTop: tokens.spacing[6],
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <Shield size={16} color={tokens.colors.successScale[600]} />
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                  }}
                >
                  Validation Summary
                </Text>
              </div>

              <div
                style={{
                  ...cardBase,
                  padding: tokens.spacing[3],
                }}
              >
                {localValidation.length === 0 ? (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                      textAlign: 'center' as const,
                      padding: tokens.spacing[3],
                    }}
                  >
                    No validation checks available
                  </Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {localValidation.map((item, idx) => {
                      const vc = valColors[item.status];
                      return (
                        <div
                          key={idx}
                          style={{
                            ...animStyle(idx),
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: vc.bg,
                          }}
                        >
                          {validationIcon(item.status, 16, vc.icon)}
                          <div style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.medium,
                                color: vc.color,
                              }}
                            >
                              {item.check}
                            </Text>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: vc.color,
                                opacity: 0.8,
                              }}
                            >
                              {item.message}
                            </Text>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Side Config Panel (right) ────────────────────────── */}
          <div
            style={{
              width: 360,
              borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column' as const,
            }}
          >
            {activeStage ? (
              <div style={{ padding: tokens.spacing[4] }}>
                {/* Panel header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Settings2 size={16} color={tokens.colors.neutral[600]} />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: ptypo.headingWeight,
                        letterSpacing: ptypo.headingLetterSpacing,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      Stage Config
                    </Text>
                  </div>
                  <button
                    onClick={() => handleStageSelect(null)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      padding: tokens.spacing[1],
                      borderRadius: tokens.borderRadius.md,
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    Close
                  </button>
                </div>

                {/* Stage Name */}
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[1],
                      display: 'block',
                    }}
                  >
                    Stage Name
                  </Text>
                  <div
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {activeStage.name}
                  </div>
                </div>

                {/* Agent Assignment */}
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[1],
                      display: 'block',
                    }}
                  >
                    Agent Assignment
                  </Text>
                  <select
                    value={activeStage.agentId ?? ''}
                    onChange={(e) => {
                      onChange?.(`stages.${activeStage.id}.agentId`, e.target.value);
                      setLocalIsDirty(true);
                    }}
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      outline: 'none',
                    }}
                  >
                    <option value="">Select agent...</option>
                    {agents.map((a, i) => (
                      <option key={a.id} value={a.id}>
                        {a.name} {a.compatible === false ? '(incompatible)' : ''}
                      </option>
                    ))}
                  </select>
                  {activeStage.agentId && (() => {
                    const agent = agents.find((a) => a.id === activeStage.agentId);
                    if (agent && agent.compatible !== undefined) {
                      return (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            marginTop: tokens.spacing[1],
                            fontSize: tokens.typography.fontSize.xs,
                            color: agent.compatible
                              ? tokens.colors.successScale[600]
                              : tokens.colors.warningScale[600],
                          }}
                        >
                          {agent.compatible ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}
                          {agent.compatible ? 'Compatible' : 'May have compatibility issues'}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Rubric Selector */}
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[1],
                      display: 'block',
                    }}
                  >
                    Rubric
                  </Text>
                  <select
                    value={activeStage.rubricId ?? ''}
                    onChange={(e) => {
                      onChange?.(`stages.${activeStage.id}.rubricId`, e.target.value);
                      setLocalIsDirty(true);
                    }}
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      outline: 'none',
                    }}
                  >
                    <option value="">Select rubric...</option>
                    {rubrics.map((r, i) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Criteria Weight Editor (pie chart) */}
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[2],
                      display: 'block',
                    }}
                  >
                    Weight Distribution
                  </Text>

                  {/* Pie Chart SVG */}
                  {sortedStages.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: tokens.spacing[3] }}>
                      <svg width="140" height="140" viewBox="0 0 140 140">
                        {(() => {
                          const weights = sortedStages.map((s, i) => ({
                            label: s.name,
                            value: 1 / sortedStages.length,
                            color: weightColors[i % weightColors.length],
                          }));
                          const slices = generatePieSlices(weights, 70, 70, 60);
                          return slices.map((slice, i) => (
                            <path
                              key={i}
                              d={slice.d}
                              fill={slice.color}
                              stroke={tokens.colors.common.white}
                              strokeWidth={2}
                            />
                          ));
                        })()}
                        {/* Center circle */}
                        <circle
                          cx="70"
                          cy="70"
                          r="30"
                          fill={tokens.colors.common.white}
                          stroke={tokens.colors.neutral[100]}
                          strokeWidth={1}
                        />
                        <text
                          x="70"
                          y="66"
                          textAnchor="middle"
                          fontSize={tokens.typography.fontSize.xs}
                          fill={tokens.colors.neutral[500]}
                          fontWeight={tokens.typography.fontWeight.medium}
                        >
                          {sortedStages.length}
                        </text>
                        <text
                          x="70"
                          y="80"
                          textAnchor="middle"
                          fontSize="9"
                          fill={tokens.colors.neutral[400]}
                        >
                          stages
                        </text>
                      </svg>
                    </div>
                  )}

                  {/* Weight legend */}
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    {sortedStages.map((s, i) => (
                      <div
                        key={s.id}
                        style={{
                          ...animStyle(i),
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: weightColors[i % weightColors.length],
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1 }}>{s.name}</span>
                        <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>
                          {(100 / sortedStages.length).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knockout Rules */}
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[2],
                      display: 'block',
                    }}
                  >
                    Knockout Configuration
                  </Text>
                  <div
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: activeStage.isKnockout
                        ? tokens.colors.errorScale[50]
                        : tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                        activeStage.isKnockout
                          ? tokens.colors.errorScale[200]
                          : tokens.colors.neutral[200]
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: activeStage.isKnockout ? tokens.spacing[2] : 0,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Flag
                          size={14}
                          color={
                            activeStage.isKnockout
                              ? tokens.colors.errorScale[500]
                              : tokens.colors.neutral[400]
                          }
                        />
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: activeStage.isKnockout
                              ? tokens.colors.errorScale[700]
                              : tokens.colors.neutral[600],
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          {activeStage.isKnockout
                            ? 'Knockout stage enabled'
                            : 'Knockout stage disabled'}
                        </Text>
                      </div>
                      <div
                        role="switch"
                        tabIndex={0}
                        aria-checked={activeStage.isKnockout}
                        aria-label="Knockout stage"
                        style={{
                          width: 32,
                          height: 18,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: activeStage.isKnockout
                            ? tokens.colors.errorScale[500]
                            : tokens.colors.neutral[300],
                          position: 'relative' as const,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          ...hoverStyle,
                        }}
                        onClick={() => {
                          onChange?.(`stages.${activeStage.id}.isKnockout`, !activeStage.isKnockout);
                          setLocalIsDirty(true);
                        }}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange?.(`stages.${activeStage.id}.isKnockout`, !activeStage.isKnockout); setLocalIsDirty(true); } }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.common.white,
                            position: 'absolute' as const,
                            top: 2,
                            left: activeStage.isKnockout ? 16 : 2,
                            transition: `left ${tokens.transitions?.normal || tokens.motion.hover}`,
                            boxShadow: tokens.shadows.sm,
                          }}
                        />
                      </div>
                    </div>
                    {activeStage.isKnockout && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.errorScale[600],
                        }}
                      >
                        Candidates who fail this stage will be automatically rejected.
                      </Text>
                    )}
                  </div>
                </div>

                {/* Auto-advance Conditions */}
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[2],
                      display: 'block',
                    }}
                  >
                    Auto-Advance Conditions
                  </Text>
                  <div
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <ArrowDownUp size={14} color={tokens.colors.neutral[400]} />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        Auto-advance when score passes threshold
                      </Text>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        SLA:
                      </Text>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `2px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.infoScale[50],
                          color: tokens.colors.infoScale[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        <Clock size={10} />
                        {activeStage.slaHours} hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state when no stage selected */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  padding: tokens.spacing[6],
                  textAlign: 'center' as const,
                }}
              >
                <Settings2 size={32} color={tokens.colors.neutral[300]} />
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[400],
                    marginTop: tokens.spacing[3],
                  }}
                >
                  Select a stage to configure its settings
                </Text>
              </div>
            )}

            {/* ── Version History Panel ─────────────────────────── */}
            {showVersions && (
              <div
                style={{
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  padding: tokens.spacing[4],
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <History size={16} color={tokens.colors.neutral[600]} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                    }}
                  >
                    Version History
                  </Text>
                </div>

                {versions.length === 0 ? (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      textAlign: 'center' as const,
                      padding: tokens.spacing[3],
                    }}
                  >
                    No versions recorded yet
                  </Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                    {versions.map((ver, i) => (
                      <div
                        key={ver.version}
                        style={{
                          ...animStyle(i),
                          position: 'relative' as const,
                          paddingLeft: tokens.spacing[5],
                        }}
                      >
                        {/* Timeline dot */}
                        <div
                          style={{
                            position: 'absolute' as const,
                            left: 0,
                            top: 4,
                            width: 10,
                            height: 10,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor:
                              selectedVersion === ver.version
                                ? tokens.colors.primaryScale[500]
                                : tokens.colors.neutral[300],
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                              selectedVersion === ver.version
                                ? tokens.colors.primaryScale[200]
                                : tokens.colors.common.white
                            }`,
                          }}
                        />
                        {/* Timeline line */}
                        <div
                          style={{
                            position: 'absolute' as const,
                            left: 4,
                            top: 18,
                            bottom: -tokens.spacing[3],
                            width: 2,
                            backgroundColor: tokens.colors.neutral[200],
                          }}
                        />

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: tokens.spacing[2],
                          }}
                        >
                          <div>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[800],
                              }}
                            >
                              v{ver.version}
                            </Text>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                              }}
                            >
                              {ver.date} by {ver.author}
                            </Text>
                            <div
                              style={{
                                marginTop: tokens.spacing[1],
                                display: 'flex',
                                flexDirection: 'column' as const,
                                gap: 2,
                              }}
                            >
                              {ver.changes.map((change, ci) => (
                                <Text
                                  key={ci}
                                  style={{
                                    fontSize: tokens.typography.fontSize.xs,
                                    color: tokens.colors.neutral[500],
                                  }}
                                >
                                  - {change}
                                </Text>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleVersionRollback(ver.version)}
                            style={{
                              ...hoverStyle,
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              padding: `2px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              backgroundColor: tokens.colors.common.white,
                              color: tokens.colors.neutral[600],
                              fontSize: tokens.typography.fontSize.xs,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              flexShrink: 0,
                            }}
                          >
                            <Undo2 size={10} />
                            Rollback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
