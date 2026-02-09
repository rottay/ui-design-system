'use client';

/**
 * BhInterviewScheduler - Standard Preset
 * Interview scheduling flow with candidate selector, type picker,
 * scheduling controls, AI agent configuration, and confirmation summary.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type {
  BhInterviewSchedulerProps,
  ScheduleCandidate,
  InterviewTypeConfig,
  ScheduleData,
  AgentOverride,
  AvailableAgent,
  AvailableInterviewer,
} from '../../core';
import {
  Bot,
  User,
  Calendar,
  Clock,
  Globe,
  Timer,
  Settings,
  Send,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  DollarSign,
  Mail,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Tag,
  Thermometer,
  MessageSquare,
  FileText,
  Search,
} from 'lucide-react';

const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export const StandardBhInterviewScheduler = createPreset<BhInterviewSchedulerProps>({
  name: 'BhInterviewScheduler.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewSchedulerProps>) => {
    const { Box, Stack } = primitives;

    const {
      candidate: externalCandidate,
      interviewType: externalType,
      onTypeChange,
      templateStage,
      scheduleData: externalSchedule,
      onScheduleChange,
      agentConfig: externalAgentConfig,
      onAgentConfigChange,
      agents = [],
      interviewers = [],
      onConfirm,
      onCancel,
      estimatedCost,
      showConfirmation: externalShowConfirmation = false,
      className,
      style,
    } = props;

    const [selectedCandidate, setSelectedCandidate] = useState<ScheduleCandidate | null>(
      externalCandidate ?? null
    );
    const [interviewType, setInterviewType] = useState<InterviewTypeConfig>(
      externalType ?? { type: 'ai' }
    );
    const [scheduleData, setScheduleData] = useState<ScheduleData>(
      externalSchedule ?? {
        date: '',
        time: '',
        timezone: 'America/New_York',
        estimatedDuration: 30,
      }
    );
    const [agentConfig, setAgentConfig] = useState<AgentOverride>(
      externalAgentConfig ?? {}
    );
    const [showConfirmation, setShowConfirmation] = useState(externalShowConfirmation);

    const handleTypeChange = useCallback(
      (config: InterviewTypeConfig) => {
        setInterviewType(config);
        onTypeChange?.(config);
      },
      [onTypeChange]
    );

    const handleScheduleChange = useCallback(
      (data: Partial<ScheduleData>) => {
        const updated = { ...scheduleData, ...data };
        setScheduleData(updated);
        onScheduleChange?.(updated);
      },
      [scheduleData, onScheduleChange]
    );

    const handleAgentConfigChange = useCallback(
      (config: Partial<AgentOverride>) => {
        const updated = { ...agentConfig, ...config };
        setAgentConfig(updated);
        onAgentConfigChange?.(updated);
      },
      [agentConfig, onAgentConfigChange]
    );

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isGlass,
      interactive: true,
    }), [tokens, isGlass]);
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

    const labelStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      marginBottom: tokens.spacing[1],
      display: 'block',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      backgroundColor: tokens.colors.common.white,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      outline: 'none',
      boxSizing: 'border-box' as const,
    };

    const selectStyle: React.CSSProperties = {
      ...inputStyle,
      appearance: 'none' as const,
      backgroundImage: 'none',
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    };

    /* ---- Candidate Selector ---- */
    const renderCandidateSelector = () => {
      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <User size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Candidate</h3>
          </Stack>

          {selectedCandidate ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {selectedCandidate.avatar ? (
                  <img
                    src={selectedCandidate.avatar}
                    alt={selectedCandidate.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover' as const,
                    }}
                  />
                ) : (
                  <User
                    size={20}
                    color={tokens.colors.primaryScale[600]}
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    margin: 0,
                  }}
                >
                  {selectedCandidate.name}
                </p>
                <Stack
                  direction="horizontal"
                  align="center"
                  gap={tokens.spacing[2]}
                  style={{ marginTop: tokens.spacing[1] }}
                >
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {selectedCandidate.jobTitle}
                  </span>
                  <span
                    style={{
                      ...createBadgeStyle(tokens, 'info'),
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    {selectedCandidate.currentStage}
                  </span>
                </Stack>
              </div>
            </div>
          ) : (
            <div
              style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                color: tokens.colors.neutral[400],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Search size={14} />
              <span>Search for a candidate...</span>
            </div>
          )}
        </div>
      );
    };

    /* ---- Interview Type ---- */
    const renderInterviewType = () => {
      const isAI = interviewType.type === 'ai';
      const isHuman = interviewType.type === 'human';

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Sparkles size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Interview Type</h3>
          </Stack>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[3],
              marginBottom: tokens.spacing[4],
            }}
          >
            {/* AI Interview Card */}
            <div
              onClick={() =>
                handleTypeChange({ ...interviewType, type: 'ai' })
              }
              style={{
                ...cardInteractive,
                padding: tokens.spacing[4],
                textAlign: 'center' as const,
                backgroundColor: isAI
                  ? tokens.colors.primaryScale[50]
                  : tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  isAI
                    ? tokens.colors.primaryScale[400]
                    : tokens.colors.neutral[200]
                }`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: isAI
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: `0 auto ${tokens.spacing[3]}px`,
                }}
              >
                <Bot
                  size={24}
                  color={
                    isAI
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[500]
                  }
                />
              </div>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: isAI
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[900],
                  margin: 0,
                }}
              >
                AI Interview
              </p>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  margin: `${tokens.spacing[1]}px 0 0`,
                }}
              >
                Automated AI agent conducts the interview
              </p>
            </div>

            {/* Human Interview Card */}
            <div
              onClick={() =>
                handleTypeChange({ ...interviewType, type: 'human' })
              }
              style={{
                ...cardInteractive,
                padding: tokens.spacing[4],
                textAlign: 'center' as const,
                backgroundColor: isHuman
                  ? tokens.colors.primaryScale[50]
                  : tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  isHuman
                    ? tokens.colors.primaryScale[400]
                    : tokens.colors.neutral[200]
                }`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: isHuman
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: `0 auto ${tokens.spacing[3]}px`,
                }}
              >
                <User
                  size={24}
                  color={
                    isHuman
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[500]
                  }
                />
              </div>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: isHuman
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[900],
                  margin: 0,
                }}
              >
                Human Interview
              </p>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  margin: `${tokens.spacing[1]}px 0 0`,
                }}
              >
                Live interviewer conducts the session
              </p>
            </div>
          </div>

          {/* Agent / Interviewer selector */}
          {isAI && agents.length > 0 && (
            <div>
              <label style={labelStyle}>Select AI Agent</label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: tokens.spacing[2],
                }}
              >
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() =>
                      handleTypeChange({
                        ...interviewType,
                        agentId: agent.id,
                        agentName: agent.name,
                      })
                    }
                    style={{
                      ...hoverTransition,
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor:
                        interviewType.agentId === agent.id
                          ? tokens.colors.primaryScale[50]
                          : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                        interviewType.agentId === agent.id
                          ? tokens.colors.primaryScale[300]
                          : tokens.colors.neutral[200]
                      }`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                    }}
                  >
                    <Bot
                      size={16}
                      color={
                        interviewType.agentId === agent.id
                          ? tokens.colors.primaryScale[600]
                          : tokens.colors.neutral[500]
                      }
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                          margin: 0,
                        }}
                      >
                        {agent.name}
                      </p>
                      <p
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          margin: 0,
                        }}
                      >
                        {agent.type} &middot; {agent.language}
                      </p>
                    </div>
                    {interviewType.agentId === agent.id && (
                      <CheckCircle
                        size={16}
                        color={tokens.colors.primaryScale[600]}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isHuman && interviewers.length > 0 && (
            <div>
              <label style={labelStyle}>Select Interviewer</label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: tokens.spacing[2],
                }}
              >
                {interviewers.map((interviewer) => (
                  <div
                    key={interviewer.id}
                    onClick={() =>
                      handleTypeChange({
                        ...interviewType,
                        interviewerId: interviewer.id,
                        interviewerName: interviewer.name,
                      })
                    }
                    style={{
                      ...hoverTransition,
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor:
                        interviewType.interviewerId === interviewer.id
                          ? tokens.colors.primaryScale[50]
                          : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                        interviewType.interviewerId === interviewer.id
                          ? tokens.colors.primaryScale[300]
                          : tokens.colors.neutral[200]
                      }`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[200],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {interviewer.avatar ? (
                        <img
                          src={interviewer.avatar}
                          alt={interviewer.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover' as const,
                          }}
                        />
                      ) : (
                        <User
                          size={14}
                          color={tokens.colors.neutral[500]}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                          margin: 0,
                        }}
                      >
                        {interviewer.name}
                      </p>
                      <p
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          margin: 0,
                        }}
                      >
                        {interviewer.role}
                      </p>
                    </div>
                    {interviewType.interviewerId === interviewer.id && (
                      <CheckCircle
                        size={16}
                        color={tokens.colors.primaryScale[600]}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    /* ---- Template Stage ---- */
    const renderTemplateStage = () => {
      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Tag size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Template Stage</h3>
          </Stack>

          <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
            {templateStage ? (
              <span
                style={{
                  ...createBadgeStyle(tokens, 'success'),
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                }}
              >
                <CheckCircle size={14} style={{ marginRight: tokens.spacing[1] }} />
                Auto-detected: {templateStage}
              </span>
            ) : (
              <span
                style={{
                  ...createBadgeStyle(tokens, 'warning'),
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                }}
              >
                <AlertCircle size={14} style={{ marginRight: tokens.spacing[1] }} />
                No stage detected
              </span>
            )}
          </Stack>
        </div>
      );
    };

    /* ---- Scheduling ---- */
    const renderScheduling = () => {
      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Calendar size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Schedule</h3>
          </Stack>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[3],
              marginBottom: tokens.spacing[3],
            }}
          >
            {/* Date */}
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={scheduleData.date}
                onChange={(e) =>
                  handleScheduleChange({ date: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            {/* Time */}
            <div>
              <label style={labelStyle}>Time</label>
              <input
                type="time"
                value={scheduleData.time}
                onChange={(e) =>
                  handleScheduleChange({ time: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[3],
              marginBottom: tokens.spacing[3],
            }}
          >
            {/* Timezone */}
            <div>
              <label style={labelStyle}>
                <Globe
                  size={12}
                  style={{
                    marginRight: tokens.spacing[1],
                    verticalAlign: 'middle',
                  }}
                />
                Timezone
              </label>
              <select
                value={scheduleData.timezone}
                onChange={(e) =>
                  handleScheduleChange({ timezone: e.target.value })
                }
                style={selectStyle}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label style={labelStyle}>
                <Timer
                  size={12}
                  style={{
                    marginRight: tokens.spacing[1],
                    verticalAlign: 'middle',
                  }}
                />
                Duration
              </label>
              <select
                value={scheduleData.estimatedDuration}
                onChange={(e) =>
                  handleScheduleChange({
                    estimatedDuration: parseInt(e.target.value, 10),
                  })
                }
                style={selectStyle}
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability indicator */}
          {scheduleData.date && scheduleData.time && (
            <div
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.successScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}
            >
              <CheckCircle
                size={14}
                color={tokens.colors.successScale[600]}
              />
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.successScale[700],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Time slot available
              </span>
            </div>
          )}
        </div>
      );
    };

    /* ---- Configuration ---- */
    const renderConfiguration = () => {
      if (interviewType.type === 'ai') {
        return (
          <div style={cardBase}>
            <Stack
              direction="horizontal"
              align="center"
              gap={tokens.spacing[2]}
              style={{ marginBottom: tokens.spacing[4] }}
            >
              <Settings size={18} color={tokens.colors.neutral[600]} />
              <h3 style={sectionTitleStyle}>Agent Configuration</h3>
            </Stack>

            {/* Temperature */}
            <div style={{ marginBottom: tokens.spacing[3] }}>
              <label style={labelStyle}>
                <Thermometer
                  size={12}
                  style={{
                    marginRight: tokens.spacing[1],
                    verticalAlign: 'middle',
                  }}
                />
                Temperature: {agentConfig.temperature ?? 0.7}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={agentConfig.temperature ?? 0.7}
                onChange={(e) =>
                  handleAgentConfigChange({
                    temperature: parseFloat(e.target.value),
                  })
                }
                style={{
                  width: '100%',
                  accentColor: tokens.colors.primaryScale[500],
                }}
              />
              <Stack
                direction="horizontal"
                justify="space-between"
                style={{ marginTop: tokens.spacing[1] }}
              >
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  Focused
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  Creative
                </span>
              </Stack>
            </div>

            {/* Max Duration */}
            <div style={{ marginBottom: tokens.spacing[3] }}>
              <label style={labelStyle}>
                <Timer
                  size={12}
                  style={{
                    marginRight: tokens.spacing[1],
                    verticalAlign: 'middle',
                  }}
                />
                Max Duration (minutes)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                step="5"
                value={agentConfig.maxDuration ?? scheduleData.estimatedDuration}
                onChange={(e) =>
                  handleAgentConfigChange({
                    maxDuration: parseInt(e.target.value, 10),
                  })
                }
                style={inputStyle}
              />
            </div>

            {/* Custom Prompt */}
            <div>
              <label style={labelStyle}>
                <MessageSquare
                  size={12}
                  style={{
                    marginRight: tokens.spacing[1],
                    verticalAlign: 'middle',
                  }}
                />
                Custom Prompt (optional)
              </label>
              <textarea
                value={agentConfig.customPrompt ?? ''}
                onChange={(e) =>
                  handleAgentConfigChange({
                    customPrompt: e.target.value,
                  })
                }
                placeholder="Add specific instructions for the AI agent..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical' as const,
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        );
      }

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <FileText size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Interviewer Notes</h3>
          </Stack>

          <textarea
            placeholder="Add notes for the interviewer..."
            rows={6}
            style={{
              ...inputStyle,
              resize: 'vertical' as const,
              fontFamily: 'inherit',
            }}
          />
        </div>
      );
    };

    /* ---- Preview & Confirm ---- */
    const renderConfirmation = () => {
      return (
        <div
          style={{
            ...cardBase,
            borderLeft: `4px solid ${tokens.colors.primaryScale[500]}`,
          }}
        >
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Send size={18} color={tokens.colors.primaryScale[600]} />
            <h3 style={sectionTitleStyle}>Preview & Confirm</h3>
          </Stack>

          {/* Summary */}
          <div
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              marginBottom: tokens.spacing[4],
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              <span
                style={{
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Candidate
              </span>
              <span style={{ color: tokens.colors.neutral[900] }}>
                {selectedCandidate?.name ?? 'Not selected'}
              </span>

              <span
                style={{
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Type
              </span>
              <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                {interviewType.type === 'ai' ? (
                  <Bot size={14} color={tokens.colors.primaryScale[600]} />
                ) : (
                  <User size={14} color={tokens.colors.primaryScale[600]} />
                )}
                <span style={{ color: tokens.colors.neutral[900] }}>
                  {interviewType.type === 'ai'
                    ? `AI - ${interviewType.agentName ?? 'No agent'}`
                    : `Human - ${interviewType.interviewerName ?? 'No interviewer'}`}
                </span>
              </Stack>

              <span
                style={{
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Date & Time
              </span>
              <span style={{ color: tokens.colors.neutral[900] }}>
                {scheduleData.date && scheduleData.time
                  ? `${scheduleData.date} at ${scheduleData.time} (${scheduleData.timezone.replace(/_/g, ' ')})`
                  : 'Not scheduled'}
              </span>

              <span
                style={{
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Duration
              </span>
              <span style={{ color: tokens.colors.neutral[900] }}>
                {scheduleData.estimatedDuration} minutes
              </span>

              {templateStage && (
                <>
                  <span
                    style={{
                      color: tokens.colors.neutral[500],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Stage
                  </span>
                  <span style={{ color: tokens.colors.neutral[900] }}>
                    {templateStage}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Estimated cost (AI only) */}
          {interviewType.type === 'ai' && estimatedCost !== undefined && (
            <div
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[4],
              }}
            >
              <DollarSign
                size={14}
                color={tokens.colors.infoScale[600]}
              />
              <span
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.infoScale[700],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Estimated cost: ${estimatedCost.toFixed(2)}
              </span>
            </div>
          )}

          {/* Send invitation toggle */}
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Mail size={14} color={tokens.colors.neutral[600]} />
            <span
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
              }}
            >
              Send invitation email to candidate
            </span>
          </Stack>

          {/* Actions */}
          <Stack direction="horizontal" gap={tokens.spacing[3]} justify="end">
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  ...hoverTransition,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[700],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <X size={14} />
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                setShowConfirmation(true);
                onConfirm?.();
              }}
              style={{
                ...hoverTransition,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}
            >
              <Send size={14} />
              Schedule Interview
            </button>
          </Stack>
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
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {renderCandidateSelector()}
          {renderInterviewType()}
          {renderTemplateStage()}
          {renderScheduling()}
          {renderConfiguration()}
          {renderConfirmation()}
        </div>
      </div>
    );
  },
});
