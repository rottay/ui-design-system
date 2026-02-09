'use client';

/**
 * BhInterviewPrep - Standard Preset
 * Interview preparation briefing with interview info, candidate summary,
 * evaluation rubric, script overview, and pre-interview checklist.
 */

import {useState, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type {
  BhInterviewPrepProps,
  InterviewBrief,
  CandidateBrief,
  EvaluationFocus,
  ScriptOverview,
  ChecklistItem,
} from '../../core';
import {
  Bot,
  User,
  Calendar,
  Clock,
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Award,
  BarChart3,
  Briefcase,
  BookOpen,
  ListChecks,
  Star,
  Zap,
  Shield,
  Eye,
} from 'lucide-react';

const CHECKLIST_STATUS_CONFIG: Record<
  ChecklistItem['status'],
  { colorKey: 'success' | 'error' | 'warning'; label: string }
> = {
  pass: { colorKey: 'success', label: 'Pass' },
  fail: { colorKey: 'error', label: 'Fail' },
  pending: { colorKey: 'warning', label: 'Pending' },
};

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const StandardBhInterviewPrep = createPreset<BhInterviewPrepProps>({
  name: 'BhInterviewPrep.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewPrepProps>) => {
    const { Box, Stack } = primitives;

    const {
      interviewBrief,
      candidateBrief,
      evaluationFocus,
      scriptOverview,
      checklist: externalChecklist = [],
      onChecklistUpdate,
      expandedSections: externalExpandedSections,
      onSectionToggle,
      showFullRubric: externalShowFullRubric = false,
      onRubricToggle,
      className,
      style,
    } = props;

    const [checklistStatus, setChecklistStatus] = useState<Record<string, ChecklistItem['status']>>(
      () => {
        const map: Record<string, ChecklistItem['status']> = {};
        externalChecklist.forEach((item) => {
          map[item.key] = item.status;
        });
        return map;
      }
    );
    const [expandedSections, setExpandedSections] = useState<string[]>(
      externalExpandedSections ?? []
    );
    const [showFullRubric, setShowFullRubric] = useState(externalShowFullRubric);

    const handleChecklistUpdate = useCallback(
      (key: string, status: ChecklistItem['status']) => {
        setChecklistStatus((prev) => ({ ...prev, [key]: status }));
        onChecklistUpdate?.(key, status);
      },
      [onChecklistUpdate]
    );

    const handleSectionToggle = useCallback(
      (title: string) => {
        setExpandedSections((prev) =>
          prev.includes(title)
            ? prev.filter((s) => s !== title)
            : [...prev, title]
        );
        onSectionToggle?.(title);
      },
      [onSectionToggle]
    );

    const handleRubricToggle = useCallback(() => {
      const next = !showFullRubric;
      setShowFullRubric(next);
      onRubricToggle?.(next);
    }, [showFullRubric, onRubricToggle]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      padding: tokens.spacing[5],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      ...style,
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
    };

    /* ---- Interview Info ---- */
    const renderInterviewInfo = () => {
      if (!interviewBrief) return null;

      const heroStyle: React.CSSProperties = {
        ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
        padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
        background:
          isGlass && tokens.glass
            ? tokens.glass.bg
            : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.primaryScale[100]})`,
        position: 'relative' as const,
        overflow: 'hidden',
      };

      return (
        <div style={heroStyle}>
          {isGlass && tokens.glass && (
            <div
              style={{
                position: 'absolute' as const,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: tokens.glass.blur,
                WebkitBackdropFilter: tokens.glass.blur,
                pointerEvents: 'none' as const,
              }}
            />
          )}
          <div style={{ position: 'relative' as const, zIndex: 1 }}>
            <Stack
              direction="horizontal"
              align="center"
              gap={tokens.spacing[3]}
              style={{ marginBottom: tokens.spacing[3] }}
            >
              <Briefcase
                size={20}
                color={tokens.colors.primaryScale[600]}
              />
              <h2
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}
              >
                {interviewBrief.jobTitle}
              </h2>
            </Stack>

            <Stack
              direction="horizontal"
              align="center"
              gap={tokens.spacing[3]}
              style={{ flexWrap: 'wrap' as const }}
            >
              <span
                style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                }}
              >
                {interviewBrief.stageName}
              </span>

              <span
                style={{
                  ...createBadgeStyle(
                    tokens,
                    interviewBrief.type === 'ai' ? 'info' : 'secondary'
                  ),
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}
              >
                {interviewBrief.type === 'ai' ? (
                  <Bot size={14} />
                ) : (
                  <User size={14} />
                )}
                {interviewBrief.type === 'ai'
                  ? 'AI Interview'
                  : 'Human Interview'}
              </span>

              <Stack
                direction="horizontal"
                align="center"
                gap={tokens.spacing[1]}
              >
                <Calendar
                  size={14}
                  color={tokens.colors.neutral[600]}
                />
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  {formatDateTime(interviewBrief.dateTime)}
                </span>
              </Stack>

              <Stack
                direction="horizontal"
                align="center"
                gap={tokens.spacing[1]}
              >
                <Clock
                  size={14}
                  color={tokens.colors.neutral[600]}
                />
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  {interviewBrief.estimatedDuration} min
                </span>
              </Stack>
            </Stack>
          </div>
        </div>
      );
    };

    /* ---- Candidate Briefing ---- */
    const renderCandidateBriefing = () => {
      if (!candidateBrief) return null;

      const maxScore = Math.max(
        ...candidateBrief.previousScores.map((s) => s.score),
        100
      );
      const chartWidth = 300;
      const chartHeight = 80;
      const barWidth =
        candidateBrief.previousScores.length > 0
          ? Math.min(
              40,
              (chartWidth - 20) / candidateBrief.previousScores.length - 4
            )
          : 40;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <User size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Candidate Briefing</h3>
          </Stack>

          {/* Candidate header */}
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[3]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[200],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {candidateBrief.avatar ? (
                <img
                  src={candidateBrief.avatar}
                  alt={candidateBrief.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as const,
                  }}
                />
              ) : (
                <User
                  size={22}
                  color={tokens.colors.primaryScale[600]}
                />
              )}
            </div>
            <div>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}
              >
                {candidateBrief.name}
              </p>
            </div>
          </Stack>

          {/* Summary */}
          <div
            style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              marginBottom: tokens.spacing[4],
            }}
          >
            <p
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                margin: 0,
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}
            >
              {candidateBrief.summary}
            </p>
          </div>

          {/* Resume highlights */}
          {candidateBrief.resumeHighlights.length > 0 && (
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <p style={{ ...sectionHeader, marginBottom: tokens.spacing[2] }}>
                Resume Highlights
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap' as const,
                  gap: tokens.spacing[2],
                }}
              >
                {candidateBrief.resumeHighlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                    }}
                  >
                    <Star
                      size={12}
                      color={tokens.colors.warningScale[500]}
                    />
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[800],
                      }}
                    >
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous scores mini-chart */}
          {candidateBrief.previousScores.length > 0 && (
            <div>
              <p style={{ ...sectionHeader, marginBottom: tokens.spacing[2] }}>
                Previous Scores
              </p>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
                width="100%"
                height={chartHeight + 24}
                style={{ display: 'block' }}
              >
                {candidateBrief.previousScores.map((score, idx) => {
                  const x =
                    10 +
                    idx *
                      ((chartWidth - 20) /
                        candidateBrief.previousScores.length) +
                    ((chartWidth - 20) /
                      candidateBrief.previousScores.length -
                      barWidth) /
                      2;
                  const barHeight =
                    (score.score / maxScore) * (chartHeight - 10);
                  const y = chartHeight - barHeight;
                  const fillColor =
                    score.score >= 80
                      ? tokens.colors.successScale[500]
                      : score.score >= 50
                      ? tokens.colors.warningScale[500]
                      : tokens.colors.errorScale[500];

                  return (
                    <g key={idx}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx={4}
                        fill={fillColor}
                        opacity={0.8}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        textAnchor="middle"
                        fontSize={tokens.typography.fontSize.xs}
                        fill={tokens.colors.neutral[700]}
                        fontWeight={tokens.typography.fontWeight.medium as any}
                      >
                        {score.score}%
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight + 16}
                        textAnchor="middle"
                        fontSize="10"
                        fill={tokens.colors.neutral[500]}
                      >
                        {score.stage.length > 8
                          ? score.stage.slice(0, 7) + '...'
                          : score.stage}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      );
    };

    /* ---- Evaluation Focus ---- */
    const renderEvaluationFocus = () => {
      if (!evaluationFocus || evaluationFocus.dimensions.length === 0)
        return null;

      const maxWeight = Math.max(
        ...evaluationFocus.dimensions.map((d) => d.weight)
      );

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Stack
              direction="horizontal"
              align="center"
              gap={tokens.spacing[2]}
            >
              <Target size={18} color={tokens.colors.neutral[600]} />
              <h3 style={sectionTitleStyle}>Evaluation Focus</h3>
            </Stack>
            <button
              onClick={handleRubricToggle}
              style={{
                ...hoverTransition,
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primaryScale[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Eye size={12} />
              {showFullRubric ? 'Collapse' : 'Full Rubric'}
            </button>
          </Stack>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[3],
            }}
          >
            {evaluationFocus.dimensions.map((dim, idx) => {
              const weightPercent = (dim.weight / maxWeight) * 100;

              return (
                <div
                  key={idx}
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: dim.isKnockout
                      ? tokens.colors.errorScale[50]
                      : tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                      dim.isKnockout
                        ? tokens.colors.errorScale[200]
                        : tokens.colors.neutral[200]
                    }`,
                  }}
                >
                  <Stack
                    direction="horizontal"
                    align="center"
                    justify="space-between"
                    style={{ marginBottom: tokens.spacing[2] }}
                  >
                    <Stack
                      direction="horizontal"
                      align="center"
                      gap={tokens.spacing[2]}
                    >
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {dim.name}
                      </span>
                      {dim.isKnockout && (
                        <span
                          style={{
                            ...createBadgeStyle(tokens, 'error'),
                            fontSize: tokens.typography.fontSize.xs,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                          }}
                        >
                          <Shield size={10} />
                          Knockout
                        </span>
                      )}
                    </Stack>
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[600],
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      Weight: {dim.weight}
                    </span>
                  </Stack>

                  {/* Weight bar */}
                  <div
                    style={{
                      width: '100%',
                      height: 6,
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${weightPercent}%`,
                        height: '100%',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: dim.isKnockout
                          ? tokens.colors.errorScale[500]
                          : tokens.colors.primaryScale[500],
                        transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Script Overview ---- */
    const renderScriptOverview = () => {
      if (!scriptOverview || scriptOverview.sections.length === 0)
        return null;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <BookOpen size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Script Overview</h3>
          </Stack>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[2],
            }}
          >
            {scriptOverview.sections.map((section, idx) => {
              const isExpanded = expandedSections.includes(section.title);

              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    onClick={() => handleSectionToggle(section.title)}
                    style={{
                      ...hoverTransition,
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Stack
                      direction="horizontal"
                      align="center"
                      gap={tokens.spacing[2]}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.primaryScale[700],
                          }}
                        >
                          {idx + 1}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {section.title}
                      </span>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[400],
                        }}
                      >
                        {section.keyQuestions.length} questions
                      </span>
                    </Stack>
                    {isExpanded ? (
                      <ChevronDown
                        size={16}
                        color={tokens.colors.neutral[500]}
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        color={tokens.colors.neutral[500]}
                      />
                    )}
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        paddingTop: tokens.spacing[3],
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column' as const,
                          gap: tokens.spacing[2],
                        }}
                      >
                        {section.keyQuestions.map((question, qIdx) => (
                          <div
                            key={qIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: tokens.spacing[2],
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              backgroundColor:
                                tokens.colors.neutral[50],
                            }}
                          >
                            <HelpCircle
                              size={14}
                              color={tokens.colors.primaryScale[500]}
                              style={{
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            />
                            <span
                              style={{
                                fontSize:
                                  tokens.typography.fontSize.sm,
                                color: tokens.colors.neutral[800],
                                lineHeight:
                                  tokens.typography.lineHeight.normal,
                              }}
                            >
                              {question}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Checklist ---- */
    const renderChecklist = () => {
      if (externalChecklist.length === 0) return null;

      const passCount = externalChecklist.filter(
        (item) => (checklistStatus[item.key] ?? item.status) === 'pass'
      ).length;
      const totalCount = externalChecklist.length;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Stack
              direction="horizontal"
              align="center"
              gap={tokens.spacing[2]}
            >
              <ListChecks size={18} color={tokens.colors.neutral[600]} />
              <h3 style={sectionTitleStyle}>Pre-Interview Checklist</h3>
            </Stack>
            <span
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color:
                  passCount === totalCount
                    ? tokens.colors.successScale[600]
                    : tokens.colors.neutral[500],
              }}
            >
              {passCount}/{totalCount} passed
            </span>
          </Stack>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 4,
              backgroundColor: tokens.colors.neutral[100],
              borderRadius: tokens.borderRadius.full,
              marginBottom: tokens.spacing[4],
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${totalCount > 0 ? (passCount / totalCount) * 100 : 0}%`,
                height: '100%',
                backgroundColor:
                  passCount === totalCount
                    ? tokens.colors.successScale[500]
                    : tokens.colors.primaryScale[500],
                borderRadius: tokens.borderRadius.full,
                transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[2],
            }}
          >
            {externalChecklist.map((item) => {
              const currentStatus = checklistStatus[item.key] ?? item.status;
              const statusCfg = CHECKLIST_STATUS_CONFIG[currentStatus];
              const scale = tokens.colors[
                `${statusCfg.colorKey}Scale` as const
              ] as any;

              const StatusIcon =
                currentStatus === 'pass'
                  ? CheckCircle
                  : currentStatus === 'fail'
                  ? XCircle
                  : AlertTriangle;

              const nextStatus: ChecklistItem['status'] =
                currentStatus === 'pending'
                  ? 'pass'
                  : currentStatus === 'pass'
                  ? 'fail'
                  : 'pending';

              return (
                <div
                  key={item.key}
                  onClick={() => handleChecklistUpdate(item.key, nextStatus)}
                  style={{
                    ...hoverTransition,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor:
                      currentStatus === 'pass'
                        ? tokens.colors.successScale[50]
                        : currentStatus === 'fail'
                        ? tokens.colors.errorScale[50]
                        : tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                      currentStatus === 'pass'
                        ? tokens.colors.successScale[200]
                        : currentStatus === 'fail'
                        ? tokens.colors.errorScale[200]
                        : tokens.colors.neutral[200]
                    }`,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <StatusIcon size={18} color={scale[500]} />
                  <span
                    style={{
                      flex: 1,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color:
                        currentStatus === 'pass'
                          ? tokens.colors.neutral[500]
                          : tokens.colors.neutral[900],
                      textDecoration:
                        currentStatus === 'pass'
                          ? 'line-through'
                          : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: scale[700],
                    }}
                  >
                    {statusCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Main Layout ---- */
    return (
      <div className={className} style={containerStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[5],
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          {/* Interview info hero */}
          {renderInterviewInfo()}

          {/* Two-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
              gap: tokens.spacing[5],
            }}
          >
            {/* Left column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: tokens.spacing[5],
              }}
            >
              {renderCandidateBriefing()}
              {renderScriptOverview()}
            </div>

            {/* Right column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: tokens.spacing[5],
              }}
            >
              {renderEvaluationFocus()}
              {renderChecklist()}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
