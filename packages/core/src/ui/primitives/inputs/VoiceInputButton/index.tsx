'use client';

/**
 * @fileoverview VoiceInputButton - Reusable microphone button
 *
 * @description
 * Thin wrapper around `useVoiceInput` (re-exported from `@rottay/design-system`)
 * that exposes a microphone button with visual states (idle, listening,
 * transcribing, error) and a tooltip for permission errors and live
 * transcript preview.
 *
 * Fires `onTranscript(text)` with the final transcript when the user
 * stops speaking. The consumer decides what to do with the text
 * (populate an input, trigger a search, etc.).
 *
 * Automatically renders nothing when the browser does not support
 * the Web Speech API (e.g. Firefox without the flag) — consumers
 * don't need to gate on `isSupported` themselves.
 *
 * Originally lived in app-platform's `_shared/voice-input/` and was
 * relocated to the design system as part of Wave 4.2 of the canonical
 * execution plan (correcting the Wave 1 misclassification — voice
 * input has zero domain semantics, only a browser API dependency).
 */

import { Box, Tooltip } from '../..';
import { AudioLines, LoaderCircle, Mic, MicOff } from 'lucide-react';

import { useVoiceInput } from '../../../../infrastructure/runtime/application/automation/voice';

export interface VoiceInputButtonProps {
  /** BCP 47 language tag, e.g. 'en-US', 'es-AR'. Default: 'en-US'. */
  lang?: string;
  /** Called with the final transcript when recording stops. */
  onTranscript: (transcript: string) => void;
  /** Visual size preset. Default: 'md'. */
  size?: 'sm' | 'md';
  /** Visual variant. Default: 'ghost'. */
  variant?: 'ghost' | 'filled';
  /** Optional aria-label override. */
  ariaLabel?: string;
}

const SIZE_MAP = {
  sm: { button: 28, icon: 13 },
  md: { button: 34, icon: 15 },
} as const;

export function VoiceInputButton({
  lang = 'en-US',
  onTranscript,
  size = 'md',
  variant = 'ghost',
  ariaLabel,
}: VoiceInputButtonProps) {
  const {
    isSupported,
    status,
    permissionState,
    transcriptPreview,
    errorMessage,
    startListening,
    stopListening,
  } = useVoiceInput({ lang, onTranscript });

  // Hide entirely on browsers without Web Speech API support
  if (!isSupported) {
    return null;
  }

  const dims = SIZE_MAP[size];
  const isActive = status === 'listening' || status === 'transcribing';
  const isError = status === 'error';
  const isBlocked = permissionState === 'denied';

  const handleClick = () => {
    if (isActive) {
      stopListening();
    } else {
      startListening();
    }
  };

  const title = isBlocked
    ? 'Microphone blocked. Allow access in browser settings.'
    : status === 'listening'
      ? 'Listening… click to stop'
      : status === 'transcribing'
        ? 'Transcribing…'
        : isError
          ? errorMessage ?? 'Voice input unavailable'
          : 'Speak';

  const resolvedAriaLabel =
    ariaLabel ??
    (isActive ? 'Stop voice input' : 'Start voice input');

  const tooltipContent = isError ? errorMessage ?? '' : transcriptPreview ?? '';
  const tooltipDisabled = !isError && !transcriptPreview;

  return (
    <>
      <Tooltip
        content={tooltipContent}
        disabled={tooltipDisabled}
        placement="top"
        color={isError ? 'error' : 'default'}
        maxWidth={280}
      >
        <Box
          as="button"
          className="ds-voice-input-button"
          data-part="root"
          data-status={status}
          data-active={isActive ? 'true' : 'false'}
          data-error={isError ? 'true' : 'false'}
          data-variant={variant}
          data-blocked={isBlocked ? 'true' : 'false'}
          onClick={handleClick}
          aria-label={resolvedAriaLabel}
          title={title}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: dims.button,
            height: dims.button,
            minWidth: dims.button,
            padding: 0,
            cursor: 'pointer',
            transition: 'background 0.14s ease, border-color 0.14s ease, color 0.14s ease',
            animation: status === 'listening' ? 'ds-voice-input-button-pulse 1.6s ease-out infinite' : undefined,
            flexShrink: 0,
          }}
        >
          {status === 'transcribing' ? (
            <LoaderCircle
              style={{
                width: dims.icon,
                height: dims.icon,
                animation: 'ds-voice-input-button-spin 1s linear infinite',
              }}
            />
          ) : status === 'listening' ? (
            <AudioLines style={{ width: dims.icon, height: dims.icon }} />
          ) : isBlocked ? (
            <MicOff style={{ width: dims.icon, height: dims.icon }} />
          ) : (
            <Mic style={{ width: dims.icon, height: dims.icon }} />
          )}
        </Box>
      </Tooltip>
    </>
  );
}
