'use client';

/**
 * @fileoverview SearchCommandBar — page-structure-tier command/search bar
 * with voice input, suggestion chips, and an actions slot.
 *
 * @description
 * Engine-free command bar that pairs with the EntityTableWorkspace family.
 * Wraps a focused search input in a raised pill shell, exposes the DS
 * `useVoiceInput` hook for browser-native dictation (with a microphone-
 * permission help drawer), supports a row of "smart refine" suggestion
 * chips, and accepts a free-form actions slot for utility buttons rendered
 * to the right of the input.
 *
 * Voice input is gated behind the DS `useVoiceInput` hook (added in Wave
 * 4.2). When the browser does not support speech recognition, the voice
 * UI is hidden entirely and the bar degrades to a plain search input.
 *
 * The family stays domain-agnostic. The `command` prop carries
 * `placeholder`, `value`, `onSearch`, optional `hint` and optional
 * `suggestions` -- nothing about tenants, users, or any specific entity.
 *
 * Keyboard shortcut: pressing `/` outside an input focuses the command
 * input (matches the original app-platform behavior).
 */

import { useEffect, useMemo, useState } from 'react';

import { AudioLines, ExternalLink, LoaderCircle, Mic, X } from 'lucide-react';

import { useVoiceInput } from '../../../../hooks/voice';
import { Box, Flex, Input, Text } from '../../../primitives';

/** A single suggestion chip rendered in the "Smart refine" cluster. */
export interface SearchCommandSuggestion {
  key: string;
  label: string;
  query?: string;
  description?: string;
  onSelect?: () => void;
}

/** Configuration object consumed by the command bar. */
export interface SearchCommandBarConfig {
  placeholder: string;
  value: string;
  onSearch: (query: string) => void;
  hint?: string;
  suggestions?: SearchCommandSuggestion[];
  recentQueries?: SearchCommandSuggestion[];
}

export interface SearchCommandBarProps {
  command: SearchCommandBarConfig;
  /** Optional right-rail slot for utility buttons (views/columns/etc.). */
  actionsSlot?: React.ReactNode;
}

// -- Inline SVG icons (private to the pattern) ---------------------------------

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VoiceInputIcon({ status }: { status: 'idle' | 'listening' | 'transcribing' | 'error' | 'unsupported' }) {
  if (status === 'transcribing') {
    return <LoaderCircle style={{ width: 15, height: 15, animation: 'workspaceCommandSpin 1s linear infinite' }} />;
  }

  if (status === 'listening') {
    return <AudioLines style={{ width: 15, height: 15 }} />;
  }

  return <Mic style={{ width: 15, height: 15 }} />;
}

function CommandSuggestionChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 30,
        padding: '0 11px',
        borderRadius: 999,
        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 88%, white 12%), color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%))',
        color: 'var(--ds-color-text-secondary)',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'border-color 0.12s ease, background 0.12s ease, color 0.12s ease',
      }}
    >
      {label}
    </Box>
  );
}

// -- Component ------------------------------------------------------------------

export function SearchCommandBar({
  command,
  actionsSlot,
}: SearchCommandBarProps) {
  const {
    isSupported: voiceSupported,
    status: voiceStatus,
    permissionState,
    transcriptPreview,
    errorMessage,
    requestPermission,
    startListening,
    stopListening,
    cancelListening,
    resetVoiceFeedback,
  } = useVoiceInput({
    onTranscript: (transcript) => {
      command.onSearch(transcript);
    },
  });

  const isVoiceActive = voiceStatus === 'listening' || voiceStatus === 'transcribing';
  const displayValue = transcriptPreview || command.value;
  const isVoicePermissionBlocked =
    voiceStatus === 'error' && Boolean(errorMessage?.toLowerCase().includes('blocked'));
  const needsVoicePermission = voiceSupported && permissionState !== 'granted';
  const commandSuggestions = command.suggestions ?? [];
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [isRequestingMicPermission, setIsRequestingMicPermission] = useState(false);

  useEffect(() => {
    if (!isVoicePermissionBlocked && !needsVoicePermission) {
      setShowVoiceHelp(false);
    }
  }, [isVoicePermissionBlocked, needsVoicePermission]);

  useEffect(() => {
    if (!needsVoicePermission) {
      setIsRequestingMicPermission(false);
    }
  }, [needsVoicePermission]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingContext =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        Boolean(target?.isContentEditable);

      if (!isTypingContext && event.key === '/') {
        event.preventDefault();
        const searchInput = document.getElementById('entity-workspace-command-input') as HTMLInputElement | null;
        searchInput?.focus();
        searchInput?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const statusMessage = useMemo(() => {
    if (voiceStatus === 'listening') {
      return 'Listening. Speak naturally. We will turn your speech into a table query.';
    }

    if (voiceStatus === 'transcribing') {
      return 'Transcribing your request and preparing the search input.';
    }

    if (voiceStatus === 'error' && errorMessage) {
      return errorMessage;
    }

    if (command.hint) {
      return command.hint;
    }

    return null;
  }, [command.hint, errorMessage, voiceStatus]);

  const statusTone = voiceStatus === 'error'
    ? 'var(--ds-color-error)'
    : voiceStatus === 'listening'
      ? 'var(--ds-color-primary)'
      : voiceStatus === 'transcribing'
        ? 'var(--ds-color-warning)'
        : 'var(--ds-color-text-muted)';

  const showVoiceBadge = voiceSupported && (voiceStatus !== 'idle' || isVoicePermissionBlocked || needsVoicePermission);
  const showInlineVoiceBadge = showVoiceBadge;
  const hasClearButton = Boolean(command.value.trim()) && !isVoiceActive;
  const inputRightPadding = voiceSupported
    ? showInlineVoiceBadge
      ? hasClearButton ? 278 : 244
      : hasClearButton
        ? 122
        : 88
    : hasClearButton
      ? 52
      : 14;

  const voiceBadgeLabel = voiceStatus === 'listening'
    ? 'Listening'
    : voiceStatus === 'transcribing'
      ? 'Transcribing'
      : voiceStatus === 'error'
        ? (isVoicePermissionBlocked ? 'Mic blocked' : 'Retry voice')
        : needsVoicePermission
          ? 'Mic permission needed'
          : 'Ask the table';

  const handleVoiceToggle = () => {
    if (!voiceSupported) return;

    if (needsVoicePermission && !isVoicePermissionBlocked) {
      setShowVoiceHelp(true);
      void handleEnableMic();
      return;
    }

    if (isVoicePermissionBlocked) {
      setShowVoiceHelp((current) => !current);
      return;
    }

    if (isVoiceActive) {
      stopListening();
      return;
    }

    startListening();
  };

  const handleEnableMic = async () => {
    setShowVoiceHelp(true);
    setIsRequestingMicPermission(true);

    try {
      const granted = await requestPermission();
      if (granted) {
        setShowVoiceHelp(false);
        resetVoiceFeedback();
        startListening();
      } else {
        setShowVoiceHelp(true);
      }
    } finally {
      setIsRequestingMicPermission(false);
    }
  };

  const handleInputChange = (value: string) => {
    if (isVoiceActive) {
      cancelListening();
    } else if (voiceStatus === 'error') {
      resetVoiceFeedback();
      setShowVoiceHelp(false);
    }

    command.onSearch(value);
  };

  const handleSuggestionClick = (query: string) => {
    if (isVoiceActive) {
      cancelListening();
    } else if (voiceStatus === 'error') {
      resetVoiceFeedback();
      setShowVoiceHelp(false);
    }

    command.onSearch(query);
  };

  const handleSuggestionSelect = (suggestion: SearchCommandSuggestion) => {
    if (suggestion.onSelect) {
      suggestion.onSelect();
      return;
    }

    if (suggestion.query) {
      handleSuggestionClick(suggestion.query);
    }
  };

  return (
    <Box
      style={{
        position: 'relative',
        overflow: 'visible',
        zIndex: 30,
        padding: '10px 16px 12px',
        borderBottom: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 97%, white 3%), color-mix(in srgb, var(--ds-surface-card) 95%, var(--ds-color-bg-primary) 5%))',
      }}
    >
      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--ds-color-primary) 4%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--ds-color-primary) 4%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: '34px 34px',
          opacity: 0.1,
        }}
      />
      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, white 3%, transparent) 52%, transparent 82%)',
        }}
      />
      <style>
        {`
          @keyframes workspaceCommandPulse {
            0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ds-color-primary) 22%, transparent); }
            70% { box-shadow: 0 0 0 10px color-mix(in srgb, var(--ds-color-primary) 0%, transparent); }
            100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ds-color-primary) 0%, transparent); }
          }
          @keyframes workspaceCommandSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <Box style={{ position: 'relative', zIndex: 1 }}>
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Box style={{ minWidth: 0, flex: '1 1 720px' }}>
            <Box
              style={{
                position: 'relative',
                padding: 6,
                borderRadius: 15,
                border:
                  voiceStatus === 'error'
                    ? '1px solid color-mix(in srgb, var(--ds-color-error) 28%, transparent)'
                    : isVoiceActive
                      ? '1px solid color-mix(in srgb, var(--ds-color-primary) 28%, transparent)'
                      : '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 95%, white 5%), color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%))',
                boxShadow:
                  voiceStatus === 'error'
                    ? '0 12px 34px color-mix(in srgb, var(--ds-color-error) 10%, transparent)'
                    : isVoiceActive
                      ? '0 14px 38px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)'
                      : '0 12px 30px color-mix(in srgb, black 8%, transparent)',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  left: 24,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--ds-color-text-muted)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SearchIcon />
              </Box>
              <Input
                id="entity-workspace-command-input"
                placeholder={command.placeholder}
                value={displayValue}
                onChange={handleInputChange}
                style={{
                  height: 42,
                  paddingLeft: 46,
                  paddingRight: inputRightPadding,
                  fontSize: 14,
                  letterSpacing: '-0.01em',
                  background: 'color-mix(in srgb, var(--ds-color-bg-primary) 70%, var(--ds-surface-card))',
                  border:
                    voiceStatus === 'error'
                      ? '1px solid color-mix(in srgb, var(--ds-color-error) 24%, transparent)'
                      : isVoiceActive
                        ? '1px solid color-mix(in srgb, var(--ds-color-primary) 28%, transparent)'
                        : '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 86%, transparent)',
                  borderRadius: 'var(--ds-radius-xl, 16px)',
                  boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 5%, transparent)',
                }}
              />

              {voiceSupported && (
                <Box
                  style={{
                    position: 'absolute',
                    right: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    maxWidth: 'min(48%, 304px)',
                  }}
                >
                  {hasClearButton && (
                    <Box
                      as="button"
                      onClick={() => handleInputChange('')}
                      aria-label="Clear search"
                      title="Clear search"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 28,
                        width: 28,
                        minWidth: 28,
                        padding: 0,
                        borderRadius: 999,
                        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 88%, transparent)',
                        background: 'color-mix(in srgb, var(--ds-surface-card) 82%, var(--ds-color-bg-primary) 18%)',
                        color: 'var(--ds-color-text-secondary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <X style={{ width: 13, height: 13 }} />
                    </Box>
                  )}

                  {showInlineVoiceBadge && (
                    <Box
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        minHeight: 24,
                        padding: '0 8px',
                        borderRadius: 999,
                        border: voiceStatus === 'error'
                          ? '1px solid color-mix(in srgb, var(--ds-color-error) 24%, transparent)'
                          : needsVoicePermission
                            ? '1px solid color-mix(in srgb, var(--ds-color-warning) 24%, transparent)'
                            : '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 88%, transparent)',
                        background: voiceStatus === 'error'
                          ? 'color-mix(in srgb, var(--ds-color-error) 8%, transparent)'
                          : needsVoicePermission
                            ? 'color-mix(in srgb, var(--ds-color-warning) 8%, transparent)'
                            : 'color-mix(in srgb, var(--ds-surface-card) 76%, var(--ds-color-bg-primary) 24%)',
                        color: voiceStatus === 'error'
                          ? 'var(--ds-color-error)'
                          : needsVoicePermission
                            ? 'var(--ds-color-warning)'
                            : voiceStatus === 'listening'
                              ? 'var(--ds-color-primary)'
                              : voiceStatus === 'transcribing'
                                ? 'var(--ds-color-warning)'
                                : 'var(--ds-color-text-secondary)',
                        flexShrink: 1,
                        minWidth: 0,
                      }}
                    >
                      <VoiceInputIcon status={voiceStatus} />
                      <Text
                        size="xs"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'inherit',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {voiceBadgeLabel}
                      </Text>
                    </Box>
                  )}

                  <Box
                    as="button"
                    onClick={handleVoiceToggle}
                    aria-label={isVoiceActive ? 'Stop voice input' : 'Start voice input'}
                    title={
                      voiceStatus === 'listening'
                        ? 'Listening'
                        : voiceStatus === 'transcribing'
                          ? 'Working'
                          : isRequestingMicPermission
                            ? 'Check permission prompt'
                            : needsVoicePermission
                              ? 'Enable microphone'
                              : voiceStatus === 'error'
                                ? (isVoicePermissionBlocked ? 'Enable microphone' : 'Retry voice input')
                                : 'Speak'
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 32,
                      width: 32,
                      minWidth: 32,
                      padding: 0,
                      borderRadius: 999,
                      border: voiceStatus === 'error'
                        ? '1px solid color-mix(in srgb, var(--ds-color-error) 36%, transparent)'
                        : isVoiceActive
                          ? '1px solid color-mix(in srgb, var(--ds-color-primary) 44%, transparent)'
                          : '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 88%, transparent)',
                      background: voiceStatus === 'error'
                        ? 'color-mix(in srgb, var(--ds-color-error) 10%, var(--ds-surface-card))'
                        : isVoiceActive
                          ? 'color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card))'
                          : 'color-mix(in srgb, var(--ds-surface-card) 85%, var(--ds-color-bg-primary) 15%)',
                      color: voiceStatus === 'error'
                        ? 'var(--ds-color-error)'
                        : isVoiceActive
                          ? 'var(--ds-color-primary)'
                          : 'var(--ds-color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'background 0.14s ease, border-color 0.14s ease, color 0.14s ease',
                      animation: voiceStatus === 'listening' ? 'workspaceCommandPulse 1.6s ease-out infinite' : undefined,
                    }}
                  >
                    <VoiceInputIcon status={voiceStatus} />
                  </Box>
                </Box>
              )}

              {showVoiceHelp && (
                <Box
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 12px)',
                    width: 420,
                    zIndex: 180,
                    padding: 18,
                    borderRadius: 18,
                    border: isVoicePermissionBlocked
                      ? '1px solid color-mix(in srgb, var(--ds-color-error) 18%, var(--ds-color-border-secondary))'
                      : '1px solid color-mix(in srgb, var(--ds-color-warning) 18%, var(--ds-color-border-secondary))',
                    background:
                      'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 98%, white 2%), color-mix(in srgb, var(--ds-color-bg-primary) 20%, var(--ds-surface-card)))',
                    boxShadow: '0 28px 60px color-mix(in srgb, black 22%, transparent)',
                  }}
                >
                  <Flex align="start" justify="between" gap={10}>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" weight="medium" style={{ display: 'block', fontSize: 14 }}>
                        {isVoicePermissionBlocked ? 'Enable microphone' : 'Allow microphone access'}
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          display: 'block',
                          marginTop: 4,
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: 'var(--ds-color-text-secondary)',
                        }}
                      >
                        {isVoicePermissionBlocked
                          ? 'Browser voice is available, but this site is blocked from using the mic.'
                          : isRequestingMicPermission
                            ? 'A browser permission sheet should appear near the address bar. Approve it to start dictation.'
                            : 'Press the button below and approve the browser prompt so dictation can start from this workspace.'}
                      </Text>
                    </Box>
                    <Box
                      as="button"
                      onClick={() => setShowVoiceHelp(false)}
                      aria-label="Close microphone help"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 88%, transparent)',
                        background: 'transparent',
                        color: 'var(--ds-color-text-secondary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </Box>
                  </Flex>

                  <Box
                    as="ol"
                    style={{
                      margin: '12px 0 0',
                      paddingLeft: 18,
                      color: 'var(--ds-color-text-secondary)',
                      fontSize: 12,
                      lineHeight: 1.55,
                    }}
                  >
                    {isVoicePermissionBlocked ? (
                      <>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          Click the site controls icon next to the URL.
                        </Box>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          Set <strong>Microphone</strong> to <strong>Allow</strong>.
                        </Box>
                        <Box as="li">Return here and press <strong>Speak</strong> again.</Box>
                      </>
                    ) : (
                      <>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          Press <strong>Enable microphone</strong> below.
                        </Box>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          Approve the browser permission prompt for this site.
                        </Box>
                        <Box as="li">We will start listening as soon as access is granted.</Box>
                      </>
                    )}
                  </Box>

                  <Flex align="center" justify="between" gap={12} style={{ marginTop: 16 }}>
                    <Text
                      size="xs"
                      style={{
                        flex: 1,
                        fontSize: 11,
                        color: 'var(--ds-color-text-muted)',
                        lineHeight: 1.45,
                      }}
                    >
                      {isVoicePermissionBlocked
                        ? 'If you already changed it, retry immediately.'
                        : isRequestingMicPermission
                          ? 'If you do not see the prompt, check the browser site controls near the URL.'
                          : 'Grant access once and the mic button will switch to Speak.'}
                    </Text>
                    <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
                      <Box
                        as="button"
                        onClick={() => {
                          setShowVoiceHelp(false);
                          resetVoiceFeedback();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          justifyContent: 'center',
                          minHeight: 38,
                          minWidth: 96,
                          padding: '0 14px',
                          borderRadius: 999,
                          border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 88%, transparent)',
                          background: 'transparent',
                          color: 'var(--ds-color-text-secondary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <ExternalLink style={{ width: 12, height: 12 }} />
                        Got it
                      </Box>
                      <Box
                        as="button"
                        onClick={
                          isVoicePermissionBlocked
                            ? () => {
                                setShowVoiceHelp(false);
                                resetVoiceFeedback();
                                startListening();
                              }
                            : handleEnableMic
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          justifyContent: 'center',
                          minHeight: 38,
                          minWidth: 156,
                          padding: '0 16px',
                          borderRadius: 999,
                          border: '1px solid color-mix(in srgb, var(--ds-color-primary) 26%, transparent)',
                          background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
                          color: 'var(--ds-color-primary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {isVoicePermissionBlocked ? 'Retry' : isRequestingMicPermission ? 'Waiting for prompt' : 'Enable microphone'}
                      </Box>
                    </Flex>
                  </Flex>
                </Box>
              )}
            </Box>

            {statusMessage && (
              <Flex
                align="center"
                justify="start"
                gap={10}
                wrap="wrap"
                style={{ marginTop: 6 }}
              >
                <Text
                  size="xs"
                  style={{
                    color: statusTone,
                    fontSize: 11,
                    lineHeight: 1.45,
                  }}
                >
                  {statusMessage}
                </Text>
              </Flex>
            )}
          </Box>

          {(commandSuggestions.length > 0 || actionsSlot) && (
            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'stretch',
                gap: 18,
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                flexShrink: 0,
                paddingTop: 2,
                rowGap: 8,
                minWidth: 0,
                flex: '0 1 auto',
              }}
            >
              {commandSuggestions.length > 0 && (
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                    minHeight: 44,
                    padding: '6px 0 6px 18px',
                    borderLeft: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 92%, transparent)',
                  }}
                >
                  <Text
                    size="xs"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    Smart refine
                  </Text>
                  <Flex align="center" gap={8} wrap="wrap" justify="end">
                    {commandSuggestions.map((suggestion) => (
                      <CommandSuggestionChip
                        key={suggestion.key}
                        label={suggestion.label}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      />
                    ))}
                  </Flex>
                </Box>
              )}

              {actionsSlot && (
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 44,
                    padding: '6px 0 6px 18px',
                    borderLeft: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 92%, transparent)',
                  }}
                >
                  {actionsSlot}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { SearchCommandBar as WorkspaceCommandBar };
export type {
  SearchCommandBarProps as WorkspaceCommandBarProps,
  SearchCommandBarConfig as WorkspaceCommandBarConfig,
  SearchCommandSuggestion as WorkspaceCommandSuggestion,
};
