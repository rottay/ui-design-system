'use client';

/**
 * BhTemplateDesigner - Form Preset
 * Structured form layout version of the evaluation template builder.
 * Linear sections with expandable/collapsible stage rows.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhTemplateDesignerProps,
  TemplateStage,
  AutomationRule,
  TemplateVersion,
  ValidationItem,
  StageType,
  ValidationStatus,
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
  CircleDot,
  ArrowDownUp,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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
/*  Form Preset                                                        */
/* ------------------------------------------------------------------ */
export const FormBhTemplateDesigner = createPreset<BhTemplateDesignerProps>({
  name: 'BhTemplateDesigner.Form',
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
    const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
    const [localRules, setLocalRules] = useState<AutomationRule[]>(automationRules);
    const [localIsDirty, setLocalIsDirty] = useState(isDirtyProp);
    const [showVersions, setShowVersions] = useState(false);
    const [showValidation, setShowValidation] = useState(true);
    const [showRules, setShowRules] = useState(true);

    /* ── Derived ──────────────────────────────────────────────────── */
    const sortedStages = useMemo(
      () => [...stages].sort((a, b) => a.order - b.order),
      [stages]
    );

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const stageColors = useMemo(() => getStageTypeColors(tokens), [tokens]);
    const statusColors = useMemo(() => getStatusColors(tokens), [tokens]);
    const valColors = useMemo(() => getValidationStatusColors(tokens), [tokens]);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    /* ── Handlers ─────────────────────────────────────────────────── */
    const toggleStageExpand = useCallback((stageId: string) => {
      setExpandedStages((prev) => {
        const next = new Set(prev);
        if (next.has(stageId)) {
          next.delete(stageId);
        } else {
          next.add(stageId);
        }
        return next;
      });
    }, []);

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

    /* ── Section header builder ───────────────────────────────────── */
    const sectionHeaderStyle = {
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    };

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
        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          style={{
            ...cardBase,
            borderRadius: tokens.borderRadius.none,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            padding: tokens.spacing[4],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: tokens.colors.common.white,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
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
            <span style={{ ...createBadgeStyle(tokens, 'primary') }}>{category}</span>
            <span style={{ ...createBadgeStyle(tokens, 'secondary') }}>{industry}</span>
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

        {/* ── Form Body ────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: tokens.spacing[5],
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[5],
            maxWidth: 800,
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* ── Stages Section ─────────────────────────────────────── */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Layers size={16} color={tokens.colors.primaryScale[600]} />
                <Text style={{ ...sectionHeaderStyle }}>Pipeline Stages ({sortedStages.length})</Text>
              </div>
              <button
                onClick={() => onStageAdd?.(sortedStages.length)}
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
                Add Stage
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {sortedStages.map((stage) => {
                const isExpanded = expandedStages.has(stage.id);
                const sc = stageColors[stage.type];

                return (
                  <div
                    key={stage.id}
                    style={{
                      ...cardBase,
                      padding: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Stage row header */}
                    <div
                      onClick={() => toggleStageExpand(stage.id)}
                      style={{
                        ...hoverStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: tokens.spacing[3],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} color={tokens.colors.neutral[400]} />
                      ) : (
                        <ChevronRight size={16} color={tokens.colors.neutral[400]} />
                      )}

                      {/* Order circle */}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: sc.bg,
                          color: sc.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.bold,
                          flexShrink: 0,
                        }}
                      >
                        {stage.order}
                      </div>

                      <div style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {stage.name}
                        </Text>
                      </div>

                      {/* Type badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `2px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: sc.bg,
                          color: sc.color,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
                        }}
                      >
                        {stageTypeIcon(stage.type, 10, sc.color)}
                        {stageTypeLabel(stage.type)}
                      </span>

                      {/* SLA */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        <Clock size={12} />
                        {stage.slaHours}h
                      </span>

                      {/* Knockout flag */}
                      {stage.isKnockout && (
                        <Flag size={14} color={tokens.colors.errorScale[500]} />
                      )}

                      {/* Remove */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStageRemove?.(stage.id);
                          setLocalIsDirty(true);
                        }}
                        style={{
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

                    {/* Expanded form fields */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: tokens.spacing[3],
                          paddingTop: tokens.spacing[3],
                        }}
                      >
                        {/* Agent */}
                        <div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[500],
                              marginBottom: tokens.spacing[1],
                              display: 'block',
                            }}
                          >
                            Agent
                          </Text>
                          <select
                            value={stage.agentId ?? ''}
                            onChange={(e) => {
                              onChange?.(`stages.${stage.id}.agentId`, e.target.value);
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
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rubric */}
                        <div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[500],
                              marginBottom: tokens.spacing[1],
                              display: 'block',
                            }}
                          >
                            Rubric
                          </Text>
                          <select
                            value={stage.rubricId ?? ''}
                            onChange={(e) => {
                              onChange?.(`stages.${stage.id}.rubricId`, e.target.value);
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
                            {rubrics.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* SLA Hours */}
                        <div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[500],
                              marginBottom: tokens.spacing[1],
                              display: 'block',
                            }}
                          >
                            SLA (hours)
                          </Text>
                          <input
                            type="number"
                            value={stage.slaHours}
                            onChange={(e) => {
                              onChange?.(`stages.${stage.id}.slaHours`, Number(e.target.value));
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
                            min={1}
                          
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

                        {/* Knockout toggle */}
                        <div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[500],
                              marginBottom: tokens.spacing[1],
                              display: 'block',
                            }}
                          >
                            Knockout Stage
                          </Text>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacing[2],
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 20,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: stage.isKnockout
                                  ? tokens.colors.errorScale[500]
                                  : tokens.colors.neutral[300],
                                position: 'relative' as const,
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                ...hoverStyle,
                              }}
                              onClick={() => {
                                onChange?.(`stages.${stage.id}.isKnockout`, !stage.isKnockout);
                                setLocalIsDirty(true);
                              }}
                            >
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: tokens.colors.common.white,
                                  position: 'absolute' as const,
                                  top: 2,
                                  left: stage.isKnockout ? 18 : 2,
                                  transition: `left ${tokens.transitions?.normal || tokens.motion.hover}`,
                                  boxShadow: tokens.shadows.sm,
                                }}
                              />
                            </div>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: stage.isKnockout
                                  ? tokens.colors.errorScale[600]
                                  : tokens.colors.neutral[500],
                              }}
                            >
                              {stage.isKnockout ? 'Enabled' : 'Disabled'}
                            </Text>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Automation Rules Section ────────────────────────────── */}
          <div>
            <div
              onClick={() => setShowRules(!showRules)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Zap size={16} color={tokens.colors.warningScale[600]} />
                <Text style={{ ...sectionHeaderStyle }}>
                  Automation Rules ({localRules.length})
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRuleAdd?.();
                    setLocalIsDirty(true);
                  }}
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
                  Add
                </button>
                {showRules ? (
                  <ChevronDown size={16} color={tokens.colors.neutral[400]} />
                ) : (
                  <ChevronRight size={16} color={tokens.colors.neutral[400]} />
                )}
              </div>
            </div>

            {showRules && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {localRules.length === 0 ? (
                  <div
                    style={{
                      ...cardBase,
                      padding: tokens.spacing[4],
                      textAlign: 'center' as const,
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    No automation rules configured
                  </div>
                ) : (
                  localRules.map((rule) => (
                    <div
                      key={rule.id}
                      style={{
                        ...cardBase,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: tokens.spacing[3],
                      }}
                    >
                      <Zap size={14} color={tokens.colors.warningScale[500]} />
                      <div style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[700],
                          }}
                        >
                          <span
                            style={{
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.warningScale[700],
                            }}
                          >
                            IF
                          </span>{' '}
                          {rule.condition}
                          {rule.threshold !== undefined && ` > ${rule.threshold}`}{' '}
                          <span
                            style={{
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.primaryScale[700],
                            }}
                          >
                            THEN
                          </span>{' '}
                          {rule.action}
                        </Text>
                      </div>
                      <button
                        onClick={() => handleRuleRemove(rule.id)}
                        style={{
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
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Validation Section ──────────────────────────────────── */}
          <div>
            <div
              onClick={() => setShowValidation(!showValidation)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Shield size={16} color={tokens.colors.successScale[600]} />
                <Text style={{ ...sectionHeaderStyle }}>
                  Validation ({validationResults.filter((v) => v.status === 'pass').length}/{validationResults.length} passed)
                </Text>
              </div>
              {showValidation ? (
                <ChevronDown size={16} color={tokens.colors.neutral[400]} />
              ) : (
                <ChevronRight size={16} color={tokens.colors.neutral[400]} />
              )}
            </div>

            {showValidation && (
              <div
                style={{
                  ...cardBase,
                  padding: tokens.spacing[3],
                }}
              >
                {validationResults.length === 0 ? (
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
                    {validationResults.map((item, idx) => {
                      const vc = valColors[item.status];
                      return (
                        <div
                          key={idx}
                          style={{
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
            )}
          </div>

          {/* ── Version History Section ─────────────────────────────── */}
          <div>
            <div
              onClick={() => setShowVersions(!showVersions)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <History size={16} color={tokens.colors.neutral[600]} />
                <Text style={{ ...sectionHeaderStyle }}>
                  Version History ({versions.length})
                </Text>
              </div>
              {showVersions ? (
                <ChevronDown size={16} color={tokens.colors.neutral[400]} />
              ) : (
                <ChevronRight size={16} color={tokens.colors.neutral[400]} />
              )}
            </div>

            {showVersions && (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {versions.length === 0 ? (
                  <div
                    style={{
                      ...cardBase,
                      padding: tokens.spacing[4],
                      textAlign: 'center' as const,
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    No versions recorded yet
                  </div>
                ) : (
                  versions.map((ver) => (
                    <div
                      key={ver.version}
                      style={{
                        ...cardBase,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: tokens.spacing[3],
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
                        onClick={() => onVersionRollback?.(ver.version)}
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
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
