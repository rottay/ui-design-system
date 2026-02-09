'use client';

/**
 * BhAgentTester - Standard Preset
 * Agent validation console with chat simulation, audio controls,
 * test config, validation results, transcript, and cost estimator.
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhAgentTesterProps,
  ChatMessage,
  TestConfig,
  ValidationCheck,
  TranscriptLine,
  CostEstimate,
  AgentInfo,
  AudioState,
  AudioPlaybackState,
  ValidationStatus,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Send,
  Bot,
  User,
  Check,
  X,
  AlertTriangle,
  Clock,
  Volume2,
  Mic,
  MessageSquare,
  Settings,
  FileText,
  DollarSign,
  Zap,
  Globe,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: format timestamp                                           */
/* ------------------------------------------------------------------ */
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ------------------------------------------------------------------ */
/*  Helper: format currency                                            */
/* ------------------------------------------------------------------ */
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(4)}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: format duration                                            */
/* ------------------------------------------------------------------ */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: validation status icon and color                           */
/* ------------------------------------------------------------------ */
function getValidationVisuals(status: ValidationStatus, tokens: DesignTokens): { icon: React.ReactNode; color: string; bg: string } {
  switch (status) {
    case 'pass':
      return {
        icon: <Check size={14} strokeWidth={2} />,
        color: tokens.colors.successScale[600],
        bg: tokens.colors.successScale[50],
      };
    case 'fail':
      return {
        icon: <X size={14} strokeWidth={2} />,
        color: tokens.colors.errorScale[600],
        bg: tokens.colors.errorScale[50],
      };
    case 'warning':
      return {
        icon: <AlertTriangle size={14} strokeWidth={2} />,
        color: tokens.colors.warningScale[600],
        bg: tokens.colors.warningScale[50],
      };
    case 'pending':
      return {
        icon: <Clock size={14} strokeWidth={2} />,
        color: tokens.colors.neutral[400],
        bg: tokens.colors.neutral[50],
      };
    default:
      return {
        icon: <CircleDot size={14} strokeWidth={2} />,
        color: tokens.colors.neutral[400],
        bg: tokens.colors.neutral[50],
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: waveform bar heights                                       */
/* ------------------------------------------------------------------ */
function generateWaveformBars(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const normalized = Math.sin((i / count) * Math.PI);
    bars.push(4 + normalized * 20 + Math.random() * 8);
  }
  return bars;
}

/* ------------------------------------------------------------------ */
/*  Standard Preset                                                    */
/* ------------------------------------------------------------------ */
export const StandardBhAgentTester = createPreset<BhAgentTesterProps>({
  name: 'BhAgentTester.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAgentTesterProps>) => {
    const { Box, Text } = primitives;

    const {
      agentInfo,
      messages: controlledMessages,
      testConfig: controlledConfig,
      onConfigChange,
      onStartTest,
      onStopTest,
      isRunning: controlledIsRunning,
      validationResults: controlledValidation,
      transcript: controlledTranscript,
      costEstimate: controlledCost,
      audioState: controlledAudio,
      onAudioToggle,
      onAudioSeek,
      onSpeedChange,
      isTyping: controlledIsTyping,
      onSendMessage,
      onReset,
      className,
      style,
    } = props;

    /* ---- Local state ---- */
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const [localIsRunning, setLocalIsRunning] = useState(false);
    const [localConfig, setLocalConfig] = useState<TestConfig>({
      personaName: 'Sarah Chen',
      personaDescription: 'Mid-level software engineer, 5 years experience, looking for senior roles',
      scenario: 'Initial phone screen',
      maxTurns: 10,
    });
    const [localValidation, setLocalValidation] = useState<ValidationCheck[]>([]);
    const [localTranscript, setLocalTranscript] = useState<TranscriptLine[]>([]);
    const [localCost, setLocalCost] = useState<CostEstimate>({ tokens: 0, voiceMinutes: 0, apiCalls: 0, totalCost: 0 });
    const [localAudio, setLocalAudio] = useState<AudioState>({ playback: 'idle', currentTime: 0, duration: 0, speed: 1 });

    const [messageInput, setMessageInput] = useState('');
    const [activePanel, setActivePanel] = useState<'config' | 'validation' | 'transcript' | 'cost'>('config');

    const messages = controlledMessages ?? localMessages;
    const isRunning = controlledIsRunning ?? localIsRunning;
    const testConfig = controlledConfig ?? localConfig;
    const validationResults = controlledValidation ?? localValidation;
    const transcript = controlledTranscript ?? localTranscript;
    const costEstimate = controlledCost ?? localCost;
    const audioState = controlledAudio ?? localAudio;
    const isTyping = controlledIsTyping ?? false;

    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleConfigChange = (config: TestConfig) => {
      onConfigChange?.(config);
      if (controlledConfig === undefined) setLocalConfig(config);
    };

    const handleSendMessage = () => {
      if (!messageInput.trim()) return;
      onSendMessage?.(messageInput.trim());
      setMessageInput('');
    };

    /* ---- Auto-scroll chat ---- */
    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const waveformBars = useMemo(() => generateWaveformBars(60), []);

    /* ---- Speed options ---- */
    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

    /* ---- Validation summary ---- */
    const validationSummary = useMemo(() => {
      const pass = validationResults.filter((v) => v.status === 'pass').length;
      const fail = validationResults.filter((v) => v.status === 'fail').length;
      const warn = validationResults.filter((v) => v.status === 'warning').length;
      return { pass, fail, warn, total: validationResults.length };
    }, [validationResults]);

    /* ---- Panel tabs ---- */
    const panels: { key: typeof activePanel; label: string; icon: React.ReactNode }[] = [
      { key: 'config', label: 'Config', icon: <Settings size={14} strokeWidth={1.5} /> },
      { key: 'validation', label: 'Validation', icon: <Check size={14} strokeWidth={1.5} /> },
      { key: 'transcript', label: 'Transcript', icon: <FileText size={14} strokeWidth={1.5} /> },
      { key: 'cost', label: 'Cost', icon: <DollarSign size={14} strokeWidth={1.5} /> },
    ];

    /* ---- Input field style ---- */
    const inputFieldStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[800],
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: 'inherit',
      outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[600],
      marginBottom: tokens.spacing[1],
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
        {/*  1. Agent Info Bar                                           */}
        {/* =========================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
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
          {/* Agent avatar */}
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
            <Bot size={20} strokeWidth={1.5} />
          </div>

          {/* Agent details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {agentInfo?.name || 'Untitled Agent'}
              </Text>
              {isRunning && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    ...createBadgeStyle(tokens, 'success'),
                    fontSize: tokens.typography.fontSize.xs,
                    padding: `0 ${tokens.spacing[2]}px`,
                  }}
                >
                  <div
                    style={{
                      width: tokens.spacing[2],
                      height: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.successScale[500],
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  Running
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[1] }}>
              {agentInfo?.type && (
                <span style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px`, textTransform: 'capitalize' as const }}>
                  {agentInfo.type}
                </span>
              )}
              {agentInfo?.voice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Volume2 size={12} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{agentInfo.voice}</Text>
                </div>
              )}
              {agentInfo?.language && (
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Globe size={12} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{agentInfo.language}</Text>
                </div>
              )}
              {agentInfo?.model && (
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Zap size={12} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{agentInfo.model}</Text>
                </div>
              )}
            </div>
          </div>

          {/* Estimated cost badge */}
          {costEstimate.totalCost > 0 && (
            <div
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                textAlign: 'center' as const,
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[600], display: 'block' }}>Est. Cost</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[800] }}>
                {formatCurrency(costEstimate.totalCost)}
              </Text>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: tokens.spacing[2], flexShrink: 0 }}>
            {!isRunning ? (
              <button
                onClick={onStartTest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.successScale[600],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  ...hoverStyle,
                }}
              >
                <Play size={16} strokeWidth={2} />
                Start Test
              </button>
            ) : (
              <button
                onClick={onStopTest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.errorScale[600],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  ...hoverStyle,
                }}
              >
                <Square size={16} strokeWidth={2} />
                Stop
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tokens.spacing[9],
                  height: tokens.spacing[9],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[500],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  ...hoverStyle,
                }}
                title="Reset"
              >
                <RotateCcw size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================== */}
        {/*  2. Main Content: Chat + Analysis Split                      */}
        {/* =========================================================== */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* ===================== LEFT: Chat ===================== */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            {/* Chat messages area */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: tokens.spacing[5],
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[3],
              }}
            >
              {messages.length === 0 && !isRunning && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    textAlign: 'center' as const,
                    padding: tokens.spacing[8],
                  }}
                >
                  <div
                    style={{
                      width: tokens.spacing[14] ?? 56,
                      height: tokens.spacing[14] ?? 56,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tokens.colors.primaryScale[400],
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    <MessageSquare size={28} strokeWidth={1.5} />
                  </div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[600],
                      display: 'block',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    Ready to Test
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                      maxWidth: 320,
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    Configure a test persona and scenario, then start the test to simulate a conversation with this agent.
                  </Text>
                </div>
              )}

              {messages.map((msg) => {
                const isAgent = msg.role === 'agent';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: isAgent ? 'row' : 'row-reverse',
                      gap: tokens.spacing[2],
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: isAgent ? tokens.colors.primaryScale[100] : tokens.colors.secondaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isAgent ? tokens.colors.primaryScale[600] : tokens.colors.secondaryScale[600],
                        flexShrink: 0,
                      }}
                    >
                      {isAgent ? <Bot size={14} strokeWidth={1.5} /> : <User size={14} strokeWidth={1.5} />}
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: '70%', minWidth: 0 }}>
                      <div
                        style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                          borderRadius: tokens.borderRadius.lg,
                          backgroundColor: isAgent ? tokens.colors.common.white : tokens.colors.primaryScale[600],
                          color: isAgent ? tokens.colors.neutral[800] : tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.sm,
                          lineHeight: tokens.typography.lineHeight.relaxed,
                          boxShadow: isAgent ? tokens.shadows.sm : 'none',
                          border: isAgent
                            ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`
                            : 'none',
                          ...(isGlass && isAgent
                            ? {
                                backdropFilter: tokens.glass?.blurSm,
                                WebkitBackdropFilter: tokens.glass?.blurSm,
                                backgroundColor: tokens.glass?.bgLight,
                              }
                            : {}),
                        }}
                      >
                        {msg.content}
                      </div>

                      {/* Timestamp + Audio */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          marginTop: tokens.spacing[1],
                          justifyContent: isAgent ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          {formatTimestamp(msg.timestamp)}
                        </Text>
                        {msg.audioUrl && (
                          <button
                            onClick={onAudioToggle}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              border: 'none',
                              backgroundColor: tokens.colors.neutral[100],
                              color: tokens.colors.neutral[500],
                              fontSize: tokens.typography.fontSize.xs,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              ...hoverStyle,
                            }}
                          >
                            <Volume2 size={10} strokeWidth={1.5} />
                            Audio
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[2],
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: tokens.spacing[8],
                      height: tokens.spacing[8],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tokens.colors.primaryScale[600],
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={14} strokeWidth={1.5} />
                  </div>
                  <div
                    style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: tokens.colors.common.white,
                      boxShadow: tokens.shadows.sm,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      display: 'flex',
                      gap: tokens.spacing[1],
                      alignItems: 'center',
                    }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        style={{
                          width: tokens.spacing[2],
                          height: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[400],
                          animation: `pulse 1.4s ease-in-out ${dot * 0.2}s infinite`,
                          opacity: 0.4,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* =========================================================== */}
            {/*  3. Audio Controls Bar                                       */}
            {/* =========================================================== */}
            {audioState.duration > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                  backgroundColor: tokens.colors.common.white,
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                {/* Play/pause */}
                <button
                  onClick={onAudioToggle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[8],
                    height: tokens.spacing[8],
                    borderRadius: tokens.borderRadius.full,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    flexShrink: 0,
                    ...hoverStyle,
                  }}
                >
                  {audioState.playback === 'playing' ? <Pause size={14} strokeWidth={2} /> : <Play size={14} strokeWidth={2} />}
                </button>

                {/* Time display */}
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: 80, textAlign: 'center' as const }}>
                  {formatDuration(audioState.currentTime)} / {formatDuration(audioState.duration)}
                </Text>

                {/* Waveform / seek bar */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    height: 32,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    position: 'relative' as const,
                  }}
                  onClick={(e) => {
                    if (!onAudioSeek) return;
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    onAudioSeek(ratio * audioState.duration);
                  }}
                >
                  {waveformBars.map((height, i) => {
                    const progress = audioState.duration > 0 ? audioState.currentTime / audioState.duration : 0;
                    const isPlayed = i / waveformBars.length <= progress;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: isPlayed ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200],
                          transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Speed selector */}
                <select
                  value={audioState.speed}
                  onChange={(e) => onSpeedChange?.(parseFloat(e.target.value))}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[700],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                    flexShrink: 0,
                    minWidth: 60,
                    fontFamily: 'inherit',
                  }}
                >
                  {speedOptions.map((s) => (
                    <option key={s} value={s}>{s}x</option>
                  ))}
                </select>
              </div>
            )}

            {/* =========================================================== */}
            {/*  Message Input                                               */}
            {/* =========================================================== */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                backgroundColor: tokens.colors.common.white,
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.neutral[50],
                }}
              >
                <input
                  type="text"
                  placeholder={isRunning ? 'Type a message as the test persona...' : 'Start a test to begin chatting...'}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  disabled={!isRunning}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    flex: 1,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                    fontFamily: 'inherit',
                    opacity: isRunning ? 1 : 0.5,
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
              <button
                onClick={handleSendMessage}
                disabled={!isRunning || !messageInput.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tokens.spacing[9],
                  height: tokens.spacing[9],
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: isRunning && messageInput.trim() ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                  color: isRunning && messageInput.trim() ? tokens.colors.common.white : tokens.colors.neutral[400],
                  cursor: isRunning && messageInput.trim() ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                  ...hoverStyle,
                }}
              >
                <Send size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ===================== RIGHT: Analysis Panel ===================== */}
          <div
            style={{
              width: 380,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: tokens.colors.common.white,
              overflow: 'hidden',
              ...(isGlass
                ? {
                    backdropFilter: tokens.glass?.blur,
                    WebkitBackdropFilter: tokens.glass?.blur,
                    backgroundColor: tokens.glass?.bgHeavy,
                  }
                : {}),
            }}
          >
            {/* Panel tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              {panels.map((panel) => {
                const isActive = activePanel === panel.key;
                return (
                  <button
                    key={panel.key}
                    onClick={() => setActivePanel(panel.key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`,
                      border: 'none',
                      borderBottom: isActive ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                      backgroundColor: 'transparent',
                      color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      ...hoverStyle,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400] }}>
                      {panel.icon}
                    </span>
                    {panel.label}
                    {panel.key === 'validation' && validationSummary.total > 0 && (
                      <span
                        style={{
                          marginLeft: tokens.spacing[1],
                          padding: `0 ${tokens.spacing[1]}px`,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: validationSummary.fail > 0 ? tokens.colors.errorScale[100] : tokens.colors.successScale[100],
                          color: validationSummary.fail > 0 ? tokens.colors.errorScale[700] : tokens.colors.successScale[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.bold,
                        }}
                      >
                        {validationSummary.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
              {/* ---- CONFIG PANEL ---- */}
              {activePanel === 'config' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                      display: 'block',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    Test Persona
                  </Text>

                  <div>
                    <label style={labelStyle}>Persona Name</label>
                    <input
                      type="text"
                      value={testConfig.personaName}
                      onChange={(e) => handleConfigChange({ ...testConfig, personaName: e.target.value })}
                      style={inputFieldStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Persona Description</label>
                    <textarea
                      value={testConfig.personaDescription}
                      onChange={(e) => handleConfigChange({ ...testConfig, personaDescription: e.target.value })}
                      rows={3}
                      style={{
                        ...inputFieldStyle,
                        resize: 'vertical' as const,
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Scenario</label>
                    <select
                      value={testConfig.scenario}
                      onChange={(e) => handleConfigChange({ ...testConfig, scenario: e.target.value })}
                      style={{
                        ...inputFieldStyle,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        appearance: 'none' as const,
                        WebkitAppearance: 'none' as const,
                      }}
                    >
                      <option value="Initial phone screen">Initial phone screen</option>
                      <option value="Technical interview">Technical interview</option>
                      <option value="Behavioral interview">Behavioral interview</option>
                      <option value="Follow-up call">Follow-up call</option>
                      <option value="Offer discussion">Offer discussion</option>
                      <option value="Scheduling coordination">Scheduling coordination</option>
                      <option value="Custom scenario">Custom scenario</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Max Conversation Turns</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <input
                        type="range"
                        min={2}
                        max={30}
                        value={testConfig.maxTurns}
                        onChange={(e) => handleConfigChange({ ...testConfig, maxTurns: parseInt(e.target.value) })}
                        style={{ flex: 1, accentColor: tokens.colors.primaryScale[600] }}
                      />
                      <span
                        style={{
                          minWidth: tokens.spacing[8],
                          textAlign: 'center' as const,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[700],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.primaryScale[50],
                        }}
                      >
                        {testConfig.maxTurns}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- VALIDATION PANEL ---- */}
              {activePanel === 'validation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {/* Summary bar */}
                  {validationSummary.total > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: tokens.spacing[3],
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.neutral[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Check size={14} strokeWidth={2} style={{ color: tokens.colors.successScale[600] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>
                          {validationSummary.pass}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <X size={14} strokeWidth={2} style={{ color: tokens.colors.errorScale[600] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700] }}>
                          {validationSummary.fail}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <AlertTriangle size={14} strokeWidth={2} style={{ color: tokens.colors.warningScale[600] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700] }}>
                          {validationSummary.warn}
                        </Text>
                      </div>
                    </div>
                  )}

                  {validationResults.length === 0 && (
                    <div style={{ textAlign: 'center' as const, padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px` }}>
                      <Check size={32} strokeWidth={1} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], display: 'block' }}>
                        Run a test to see validation results
                      </Text>
                    </div>
                  )}

                  {validationResults.map((check, i) => {
                    const visuals = getValidationVisuals(check.status, tokens);
                    return (
                      <div
                        key={`${check.name}-${i}`}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[3],
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: visuals.bg,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        }}
                      >
                        <div
                          style={{
                            width: tokens.spacing[6],
                            height: tokens.spacing[6],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.common.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: visuals.color,
                            flexShrink: 0,
                            boxShadow: tokens.shadows.sm,
                          }}
                        >
                          {visuals.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                              {check.name}
                            </Text>
                            {check.value !== undefined && (
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: visuals.color }}>
                                {check.value}
                              </Text>
                            )}
                          </div>
                          {check.message && (
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], lineHeight: tokens.typography.lineHeight.relaxed }}>
                              {check.message}
                            </Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ---- TRANSCRIPT PANEL ---- */}
              {activePanel === 'transcript' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[0] }}>
                  {transcript.length === 0 && (
                    <div style={{ textAlign: 'center' as const, padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px` }}>
                      <FileText size={32} strokeWidth={1} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], display: 'block' }}>
                        Transcript will appear here during the test
                      </Text>
                    </div>
                  )}

                  {transcript.map((line, i) => {
                    const isAgent = line.speaker.toLowerCase() === 'agent';
                    return (
                      <div
                        key={`transcript-${i}`}
                        style={{
                          display: 'flex',
                          gap: tokens.spacing[2],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          ...hoverStyle,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50];
                          e.currentTarget.style.transform = tokens.motion.transform;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                            fontVariantNumeric: 'tabular-nums',
                            flexShrink: 0,
                            minWidth: 56,
                          }}
                        >
                          {line.timestamp}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: isAgent ? tokens.colors.primaryScale[600] : tokens.colors.secondaryScale[600],
                            flexShrink: 0,
                            minWidth: 48,
                          }}
                        >
                          {line.speaker}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[700],
                            lineHeight: tokens.typography.lineHeight.relaxed,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {line.text}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ---- COST PANEL ---- */}
              {activePanel === 'cost' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                      display: 'block',
                    }}
                  >
                    Cost Breakdown
                  </Text>

                  {/* Cost table */}
                  <div
                    style={{
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      overflow: 'hidden',
                    }}
                  >
                    {[
                      { label: 'LLM Tokens', value: costEstimate.tokens.toLocaleString(), unit: 'tokens', cost: costEstimate.tokens * 0.000003 },
                      { label: 'Voice Minutes', value: costEstimate.voiceMinutes.toFixed(1), unit: 'min', cost: costEstimate.voiceMinutes * 0.02 },
                      { label: 'API Calls', value: costEstimate.apiCalls.toString(), unit: 'calls', cost: costEstimate.apiCalls * 0.001 },
                    ].map((row, i) => (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                          backgroundColor: i % 2 === 0 ? tokens.colors.neutral[50] : tokens.colors.common.white,
                          borderBottom: i < 2 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                        }}
                      >
                        <div>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], display: 'block' }}>
                            {row.label}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            {row.value} {row.unit}
                          </Text>
                        </div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          {formatCurrency(row.cost)}
                        </Text>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isGlass
                        ? tokens.glass?.bg
                        : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.secondaryScale[50]})`,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      Total Estimated Cost
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                      {formatCurrency(costEstimate.totalCost)}
                    </Text>
                  </div>

                  {/* Projected costs info */}
                  <div
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.warningScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2] }}>
                      <AlertTriangle size={14} strokeWidth={1.5} style={{ color: tokens.colors.warningScale[600], flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[800], display: 'block', marginBottom: tokens.spacing[1] }}>
                          Projected Monthly Cost
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700], lineHeight: tokens.typography.lineHeight.relaxed }}>
                          At 100 conversations/day: ~{formatCurrency(costEstimate.totalCost * 100 * 30)}/mo
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Cost per component bar chart */}
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[2] }}>
                      Cost Distribution
                    </Text>
                    {(() => {
                      const tokenCost = costEstimate.tokens * 0.000003;
                      const voiceCost = costEstimate.voiceMinutes * 0.02;
                      const apiCost = costEstimate.apiCalls * 0.001;
                      const total = tokenCost + voiceCost + apiCost || 1;
                      const segments = [
                        { label: 'LLM', pct: (tokenCost / total) * 100, color: tokens.colors.primaryScale[500] },
                        { label: 'Voice', pct: (voiceCost / total) * 100, color: tokens.colors.secondaryScale[500] },
                        { label: 'API', pct: (apiCost / total) * 100, color: tokens.colors.infoScale[500] },
                      ];
                      return (
                        <>
                          <div
                            style={{
                              display: 'flex',
                              height: tokens.spacing[3],
                              borderRadius: tokens.borderRadius.full,
                              overflow: 'hidden',
                              marginBottom: tokens.spacing[2],
                            }}
                          >
                            {segments.map((seg) => (
                              <div
                                key={seg.label}
                                style={{
                                  width: `${seg.pct}%`,
                                  backgroundColor: seg.color,
                                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                                }}
                              />
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
                            {segments.map((seg) => (
                              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                <div style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: seg.color }} />
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                                  {seg.label} ({Math.round(seg.pct)}%)
                                </Text>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
