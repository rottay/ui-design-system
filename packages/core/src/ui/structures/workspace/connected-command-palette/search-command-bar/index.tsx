'use client';

/**
 * @fileoverview SearchCommandBar — structures-tier command/search bar
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

import {
  AudioLinesIcon as AudioLines,
  ExternalLinkIcon as ExternalLink,
  LoaderCircleIcon as LoaderCircle,
  MicIcon as Mic,
  XIcon as X,
} from '../../../../../graphics/icons';

import { useVoiceInput } from '@/infrastructure/runtime/application/automation/voice/composition/react/input';
import { useRegisterCommands } from '@/infrastructure/runtime/application/commands';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ConnectedCommandPalette } from '..';
import { Box, Flex, Input, Text } from '@ui/primitives';

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

/** A command definition for the built-in command palette. */
export interface SearchCommandBarCommand {
  id: string;
  label: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void | Promise<void>;
}

export interface SearchCommandBarProps {
  command: SearchCommandBarConfig;
  /** Optional right-rail slot for utility buttons (views/columns/etc.). */
  actionsSlot?: React.ReactNode;
  /** Optional compact rail rendered above the search input. */
  topRailSlot?: React.ReactNode;
  /** Surface style when the command bar lives inside a larger shell. */
  surfaceVariant?: 'default' | 'embedded';
  /** Shared layout language with the surrounding workspace header/shell. */
  layoutVariant?: 'default' | 'editorial-tech';
  /**
   * Commands to register in the global registry. When provided, these are
   * auto-registered on mount and available in the Cmd+K palette.
   */
  commands?: SearchCommandBarCommand[];
  /**
   * Whether to render the built-in ConnectedCommandPalette (Cmd+K palette).
   * @default true when commands are provided, false otherwise
   */
  showCommandPalette?: boolean;
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
    // The spin motion lives in the skin (reduced-motion guarded); the engine
    // only names the node.
    return <LoaderCircle className="ds-search-command-bar__spinning-icon" style={{ width: 15, height: 15 }} />;
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
      data-part="suggestion-chip"
      className="ds-search-command-bar__suggestion-chip"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 30,
        padding: '0 11px',
        cursor: 'pointer',
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
  topRailSlot,
  surfaceVariant = 'default',
  layoutVariant = 'default',
  commands: commandsProp,
  showCommandPalette,
}: SearchCommandBarProps) {
  const embedded = surfaceVariant === 'embedded';
  const editorialTech = layoutVariant === 'editorial-tech';
  // Register commands in the global registry when provided
  useRegisterCommands(commandsProp ?? []);
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (resolved === undefined || resolved === key || resolved === `components.${key}`) {
      return fallback;
    }
    return resolved;
  };

  const renderPalette = showCommandPalette ?? (commandsProp && commandsProp.length > 0);
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
  const [isCompactViewport, setIsCompactViewport] = useState(false);

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
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 959px)');
    const syncViewport = () => setIsCompactViewport(mediaQuery.matches);
    syncViewport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport);
      return () => mediaQuery.removeEventListener('change', syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

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
      return tOr('searchCommandBar.statusListening', 'Listening. Speak naturally. We will turn your speech into a table query.');
    }

    if (voiceStatus === 'transcribing') {
      return tOr('searchCommandBar.statusTranscribing', 'Transcribing your request and preparing the search input.');
    }

    if (voiceStatus === 'error' && errorMessage) {
      return errorMessage;
    }

    if (command.hint) {
      return command.hint;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command.hint, errorMessage, voiceStatus, i18n?.t]);

  // Derived 5-way state for the skin's data-voice-status hook: raw `voiceStatus`
  // has no "needs-permission" member, but the paint conditionals throughout this
  // file treat needsVoicePermission as a peer of the error/listening/transcribing
  // branches, so the anatomy mirrors that rather than the hook's own type.
  const voiceStatusForSkin: 'idle' | 'listening' | 'transcribing' | 'error' | 'needs-permission' =
    voiceStatus === 'error'
      ? 'error'
      : needsVoicePermission
        ? 'needs-permission'
        : voiceStatus === 'listening' || voiceStatus === 'transcribing'
          ? voiceStatus
          : 'idle';

  // Keep the idle command bar quiet. Permission guidance becomes relevant only
  // after the user invokes voice; the mic affordance remains available for that
  // explicit action. Persistent permission badges compete with collection tools.
  const showVoiceBadge = voiceSupported && (voiceStatus !== 'idle' || isVoicePermissionBlocked);
  const hideInlinePermissionBadge = needsVoicePermission && isCompactViewport;
  const showInlineVoiceBadge = showVoiceBadge && !hideInlinePermissionBadge;
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
    ? tOr('searchCommandBar.badgeListening', 'Listening')
    : voiceStatus === 'transcribing'
      ? tOr('searchCommandBar.badgeTranscribing', 'Transcribing')
      : voiceStatus === 'error'
        ? (isVoicePermissionBlocked ? tOr('searchCommandBar.badgeMicBlocked', 'Mic blocked') : tOr('searchCommandBar.badgeRetryVoice', 'Retry voice'))
        : needsVoicePermission
          ? tOr('searchCommandBar.badgePermissionNeeded', 'Mic permission needed')
          : tOr('searchCommandBar.badgeIdle', 'Ask the table');

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
    <>
    {renderPalette && <ConnectedCommandPalette />}
    <Box
      data-part="root"
      data-embedded={embedded}
      data-editorial-tech={editorialTech}
      className="ds-structure ds-search-command-bar"
      style={{
        position: 'relative',
        overflow: 'visible',
        zIndex: 30,
        padding: embedded
          ? editorialTech
            ? topRailSlot
              ? '0 20px 10px'
              : '2px 20px 10px'
            : '8px 16px 8px'
          : '10px 16px 12px',
      }}
    >
      <Box style={{ position: 'relative', zIndex: 1 }}>
        {topRailSlot && (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              minHeight: editorialTech ? 24 : 22,
              marginBottom: editorialTech ? 8 : 6,
            }}
          >
            {topRailSlot}
          </Box>
        )}
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
              data-part="search-shell"
              className="ds-search-command-bar__search-shell"
              data-voice-status={voiceStatusForSkin}
              data-voice-active={isVoiceActive}
              data-editorial-tech={editorialTech}
              data-embedded={embedded}
              style={{
                position: 'relative',
                padding: editorialTech ? 5 : 6,
              }}
            >
              <Box
                data-part="search-icon"
                className="ds-search-command-bar__search-icon"
                style={{
                  position: 'absolute',
                  insetInlineStart: 24,
                  top: '50%',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SearchIcon />
              </Box>
              <Input
                id="entity-workspace-command-input"
                data-part="input"
                className="ds-search-command-bar__input"
                data-voice-status={voiceStatusForSkin}
                data-voice-active={isVoiceActive}
                data-editorial-tech={editorialTech}
                data-embedded={embedded}
                placeholder={command.placeholder}
                value={displayValue}
                onChange={handleInputChange}
                style={{
                  height: editorialTech ? 44 : 42,
                  paddingInlineStart: 46,
                  paddingInlineEnd: inputRightPadding,
                }}
              />

              {voiceSupported && (
                <Box
                  className="ds-search-command-bar__voice-controls"
                  style={{
                    position: 'absolute',
                    insetInlineEnd: 18,
                    top: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    maxWidth: 'min(48%, 304px)',
                  }}
                >
                  {hasClearButton && (
                    <Box
                      as="button"
                      data-part="clear"
                      className="ds-search-command-bar__clear"
                      onClick={() => handleInputChange('')}
                      aria-label={tOr('searchCommandBar.clearSearch', 'Clear search')}
                      title={tOr('searchCommandBar.clearSearch', 'Clear search')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 28,
                        width: 28,
                        minWidth: 28,
                        padding: 0,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <X style={{ width: 13, height: 13 }} />
                    </Box>
                  )}

                  {showInlineVoiceBadge && (
                    <Box
                      data-part="voice-badge"
                      className="ds-search-command-bar__voice-badge"
                      data-voice-status={voiceStatusForSkin}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        minHeight: 24,
                        padding: '0 8px',
                        flexShrink: 1,
                        minWidth: 0,
                      }}
                    >
                      <VoiceInputIcon status={voiceStatus} />
                      <Text
                        data-part="voice-badge-label"
                        className="ds-search-command-bar__voice-badge-label"
                        size="xs"
                        style={{
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {voiceBadgeLabel}
                      </Text>
                    </Box>
                  )}

                  <Box
                    as="button"
                    data-part="voice-toggle"
                    className="ds-search-command-bar__voice-toggle"
                    data-voice-status={voiceStatusForSkin}
                    data-voice-active={isVoiceActive}
                    onClick={handleVoiceToggle}
                    aria-label={isVoiceActive ? tOr('searchCommandBar.stopVoiceInput', 'Stop voice input') : tOr('searchCommandBar.startVoiceInput', 'Start voice input')}
                    title={
                      voiceStatus === 'listening'
                        ? tOr('searchCommandBar.badgeListening', 'Listening')
                        : voiceStatus === 'transcribing'
                          ? tOr('searchCommandBar.titleWorking', 'Working')
                          : isRequestingMicPermission
                            ? tOr('searchCommandBar.titleCheckPermission', 'Check permission prompt')
                            : needsVoicePermission
                              ? tOr('searchCommandBar.enableMicrophone', 'Enable microphone')
                              : voiceStatus === 'error'
                                ? (isVoicePermissionBlocked ? tOr('searchCommandBar.enableMicrophone', 'Enable microphone') : tOr('searchCommandBar.titleRetryVoice', 'Retry voice input'))
                                : tOr('searchCommandBar.titleSpeak', 'Speak')
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 32,
                      width: 32,
                      minWidth: 32,
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <VoiceInputIcon status={voiceStatus} />
                  </Box>
                </Box>
              )}

              {showVoiceHelp && (
                <Box
                  data-part="voice-help"
                  className="ds-search-command-bar__voice-help"
                  data-permission-blocked={isVoicePermissionBlocked}
                  role="dialog"
                  aria-label={tOr('searchCommandBar.enableMicrophone', 'Enable microphone')}
                  style={{
                    position: 'absolute',
                    insetInlineEnd: 0,
                    top: 'calc(100% + 12px)',
                    width: 420,
                    zIndex: 180,
                    padding: 18,
                  }}
                >
                  <Flex align="start" justify="between" gap={10}>
                    <Box style={{ minWidth: 0 }}>
                      <Text data-part="voice-help-title" size="sm" weight="medium" style={{ display: 'block' }}>
                        {isVoicePermissionBlocked
                          ? tOr('searchCommandBar.enableMicrophone', 'Enable microphone')
                          : tOr('searchCommandBar.allowMicrophoneAccess', 'Allow microphone access')}
                      </Text>
                      <Text
                        data-part="voice-help-description"
                        className="ds-search-command-bar__voice-help-description"
                        size="xs"
                        style={{
                          display: 'block',
                          marginTop: 4,
                        }}
                      >
                        {isVoicePermissionBlocked
                          ? tOr('searchCommandBar.voiceHelpBlockedDescription', 'Browser voice is available, but this site is blocked from using the mic.')
                          : isRequestingMicPermission
                            ? tOr('searchCommandBar.voiceHelpRequestingDescription', 'A browser permission sheet should appear near the address bar. Approve it to start dictation.')
                            : tOr('searchCommandBar.voiceHelpIdleDescription', 'Press the button below and approve the browser prompt so dictation can start from this workspace.')}
                      </Text>
                    </Box>
                    <Box
                      as="button"
                      data-part="close"
                      className="ds-search-command-bar__voice-help-close"
                      onClick={() => setShowVoiceHelp(false)}
                      aria-label={tOr('searchCommandBar.closeMicHelp', 'Close microphone help')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </Box>
                  </Flex>

                  <Box
                    as="ol"
                    data-part="voice-help-list"
                    className="ds-search-command-bar__voice-help-list"
                    style={{
                      margin: '12px 0 0',
                      paddingInlineStart: 18,
                    }}
                  >
                    {isVoicePermissionBlocked ? (
                      <>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          {tOr('searchCommandBar.voiceHelpStepClickSiteControls', 'Click the site controls icon next to the URL.')}
                        </Box>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          {tOr('searchCommandBar.voiceHelpStepSetPrefix', 'Set')} <strong>{tOr('searchCommandBar.microphone', 'Microphone')}</strong> {tOr('searchCommandBar.voiceHelpStepSetMiddle', 'to')} <strong>{tOr('searchCommandBar.voiceHelpAllow', 'Allow')}</strong>.
                        </Box>
                        <Box as="li">{tOr('searchCommandBar.voiceHelpStepReturnPrefix', 'Return here and press')} <strong>{tOr('searchCommandBar.titleSpeak', 'Speak')}</strong> {tOr('searchCommandBar.voiceHelpStepReturnSuffix', 'again.')}</Box>
                      </>
                    ) : (
                      <>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          {tOr('searchCommandBar.voiceHelpStepPressPrefix', 'Press')} <strong>{tOr('searchCommandBar.enableMicrophone', 'Enable microphone')}</strong> {tOr('searchCommandBar.voiceHelpStepPressSuffix', 'below.')}
                        </Box>
                        <Box as="li" style={{ marginBottom: 6 }}>
                          {tOr('searchCommandBar.voiceHelpStepApprove', 'Approve the browser permission prompt for this site.')}
                        </Box>
                        <Box as="li">{tOr('searchCommandBar.voiceHelpStepAutoStart', 'We will start listening as soon as access is granted.')}</Box>
                      </>
                    )}
                  </Box>

                  <Flex align="center" justify="between" gap={12} style={{ marginTop: 16 }}>
                    <Text
                      data-part="voice-help-hint"
                      className="ds-search-command-bar__voice-help-hint"
                      size="xs"
                      style={{
                        flex: 1,
                      }}
                    >
                      {isVoicePermissionBlocked
                        ? tOr('searchCommandBar.voiceHelpHintBlocked', 'If you already changed it, retry immediately.')
                        : isRequestingMicPermission
                          ? tOr('searchCommandBar.voiceHelpHintRequesting', 'If you do not see the prompt, check the browser site controls near the URL.')
                          : tOr('searchCommandBar.voiceHelpHintIdle', 'Grant access once and the mic button will switch to Speak.')}
                    </Text>
                    <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
                      <Box
                        as="button"
                        data-part="voice-help-cancel"
                        className="ds-search-command-bar__voice-help-cancel"
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
                          cursor: 'pointer',
                        }}
                      >
                        <ExternalLink style={{ width: 12, height: 12 }} />
                        {tOr('searchCommandBar.gotIt', 'Got it')}
                      </Box>
                      <Box
                        as="button"
                        data-part="voice-help-confirm"
                        className="ds-search-command-bar__voice-help-confirm"
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
                          cursor: 'pointer',
                        }}
                      >
                        {isVoicePermissionBlocked
                          ? tOr('searchCommandBar.retry', 'Retry')
                          : isRequestingMicPermission
                            ? tOr('searchCommandBar.waitingForPrompt', 'Waiting for prompt')
                            : tOr('searchCommandBar.enableMicrophone', 'Enable microphone')}
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
                  data-part="status"
                  className="ds-search-command-bar__status"
                  data-voice-status={voiceStatus}
                  size="xs"
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
                  data-ds-search-shell-slot="true"
                  data-part="suggestions"
                  className="ds-search-command-bar__suggestions"
                  data-editorial-tech={editorialTech}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                    minHeight: 44,
                    paddingBlock: 6,
                    paddingInlineStart: editorialTech ? 16 : 18,
                  }}
                >
                  <Text
                    data-part="suggestions-label"
                    className="ds-search-command-bar__suggestions-label"
                    size="xs"
                  >
                    {tOr('searchCommandBar.smartRefine', 'Smart refine')}
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
                  data-ds-search-shell-slot="true"
                  data-part="actions-slot"
                  className="ds-search-command-bar__actions-slot"
                  data-editorial-tech={editorialTech}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 44,
                    paddingBlock: 6,
                    paddingInlineStart: editorialTech ? 16 : 18,
                  }}
                >
                  {actionsSlot}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
      {embedded && editorialTech && (
        <Box
          data-part="divider"
          className="ds-search-command-bar__divider"
          style={{
            marginTop: 10,
            height: 1,
          }}
        />
      )}
    </Box>
    </>
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
