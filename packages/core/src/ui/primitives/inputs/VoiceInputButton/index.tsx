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
 * All paint and geometry lives in the family skin
 * (`foundation/tokens/css/presentation/components/skin/voice-input-button.css`),
 * keyed by `data-part`/`data-status`/`data-variant`/`data-size` — the skin is
 * the single paint owner and also owns the `ds-voice-input-button-pulse` /
 * `-spin` keyframes referenced below. This file carries no inline paint.
 *
 * Originally lived in app-platform's `_shared/voice-input/` and was
 * relocated to the design system as part of Wave 4.2 of the canonical
 * execution plan (correcting the Wave 1 misclassification — voice
 * input has zero domain semantics, only a browser API dependency).
 */

import { Box, Tooltip } from '../..';
import {
  AudioLinesIcon as AudioLines,
  LoaderCircleIcon as LoaderCircle,
  MicIcon as Mic,
  MicOffIcon as MicOff,
} from '../../../../graphics/icons';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useVoiceInput } from '../../../../infrastructure/runtime/application/automation/voice/composition/react/input';

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

  // Component-owned strings: translated when an I18nProvider is mounted, with
  // the documented English fallbacks otherwise (a missing catalog key echoes
  // back the full key, which the endsWith guard detects). Behavior is
  // byte-identical until the locale JSONs land (K4-B guarded i18n channel).
  // The hook-owned error strings resolve through the same guard inside
  // `useVoiceInput` (keys `voiceInput.error.*`). NOTE: this hook call must
  // stay above the `isSupported` early return — hooks are unconditional.
  const i18n = useOptionalTranslation('components');
  const voiceLabel = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };

  // Hide entirely on browsers without Web Speech API support
  if (!isSupported) {
    return null;
  }

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
    ? voiceLabel('voiceInput.blocked', 'Microphone blocked. Allow access in browser settings.')
    : status === 'listening'
      ? voiceLabel('voiceInput.listeningStop', 'Listening… click to stop')
      : status === 'transcribing'
        ? voiceLabel('voiceInput.transcribing', 'Transcribing…')
        : isError
          ? errorMessage ?? voiceLabel('voiceInput.unavailable', 'Voice input unavailable')
          : voiceLabel('voiceInput.speak', 'Speak');

  const resolvedAriaLabel =
    ariaLabel ??
    (isActive
      ? voiceLabel('voiceInput.stop', 'Stop voice input')
      : voiceLabel('voiceInput.start', 'Start voice input'));

  const tooltipContent = isError ? errorMessage ?? '' : transcriptPreview ?? '';
  const tooltipDisabled = !isError && !transcriptPreview;

  return (
    <Tooltip
      content={tooltipContent}
      disabled={tooltipDisabled}
      placement="top"
      color={isError ? 'error' : 'default'}
      maxWidth="var(--ds-voice-input-tooltip-max-width, 280px)"
    >
      <Box
        as="button"
        className="ds-voice-input-button"
        data-part="root"
        data-size={size}
        data-status={status}
        data-active={isActive ? 'true' : 'false'}
        data-error={isError ? 'true' : 'false'}
        data-variant={variant}
        data-blocked={isBlocked ? 'true' : 'false'}
        onClick={handleClick}
        aria-label={resolvedAriaLabel}
        title={title}
      >
        {status === 'transcribing' ? (
          <LoaderCircle />
        ) : status === 'listening' ? (
          <AudioLines />
        ) : isBlocked ? (
          <MicOff />
        ) : (
          <Mic />
        )}
      </Box>
    </Tooltip>
  );
}
