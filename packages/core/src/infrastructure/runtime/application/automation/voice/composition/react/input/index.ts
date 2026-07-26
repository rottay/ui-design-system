'use client';

/**
 * @fileoverview useVoiceInput Hook - Web Speech API wrapper
 *
 * @description
 * Reusable React hook that wraps the browser's Web Speech API
 * (SpeechRecognition) with permission handling, error states,
 * and transcript preview.
 *
 * Returns `isSupported: false` in browsers without SpeechRecognition
 * (e.g. Firefox without the flag). Consumers should hide UI in that
 * case and gracefully fall back to text input.
 *
 * Error strings resolve through the guarded `components` i18n channel
 * (`voiceInput.error.*` keys, endsWith echo guard) with the documented
 * English fallbacks from `getErrorMessage` — byte-identical behavior until
 * the locale JSONs land (K4-B).
 *
 * Originally lived in app-platform's `_shared/voice-input/` and was
 * relocated to the design system as part of Wave 4.2 of the canonical
 * execution plan (correcting the Wave 1 misclassification — voice
 * input has zero domain semantics, only a browser API dependency).
 *
 * @status app-facing (narrowed: Web Speech API wrapper)
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

type VoiceStatus = 'unsupported' | 'idle' | 'listening' | 'transcribing' | 'error';
type MicrophonePermissionState = 'unknown' | 'prompt' | 'granted' | 'denied';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternativeLike;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  item(index: number): SpeechRecognitionResultLike;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onspeechend: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type NavigatorWithMicrophoneSupport = Navigator & {
  permissions?: {
    query: (descriptor: { name: string }) => Promise<{
      state: 'granted' | 'prompt' | 'denied';
      onchange: ((this: PermissionStatus, ev: Event) => void) | null;
    }>;
  };
};

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function getErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is blocked for this site. Allow the microphone in your browser settings and retry.';
    case 'no-speech':
      return 'No speech detected. Try again or type your query.';
    case 'audio-capture':
      return 'No microphone was found. You can still type your query.';
    case 'network':
      return 'Voice transcription had a network issue. Try again or type your query.';
    default:
      return 'Voice input was unavailable. You can still type your query.';
  }
}

/**
 * Catalog keys for the hook-owned error strings (K4-B guarded i18n channel,
 * `components` namespace). English defaults stay in {@link getErrorMessage}
 * and remain the byte-identical fallback until the locale JSONs land.
 */
const VOICE_ERROR_KEY_BY_CODE: Record<string, string> = {
  'not-allowed': 'voiceInput.error.notAllowed',
  'service-not-allowed': 'voiceInput.error.notAllowed',
  'no-speech': 'voiceInput.error.noSpeech',
  'audio-capture': 'voiceInput.error.audioCapture',
  network: 'voiceInput.error.network',
};

export interface UseVoiceInputOptions {
  lang?: string;
  onTranscript: (transcript: string) => void;
}

export interface UseVoiceInputResult {
  isSupported: boolean;
  status: VoiceStatus;
  permissionState: MicrophonePermissionState;
  transcriptPreview: string;
  errorMessage: string | null;
  requestPermission: () => Promise<boolean>;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
  resetVoiceFeedback: () => void;
}

export function useVoiceInput({
  lang = 'en-US',
  onTranscript,
}: UseVoiceInputOptions): UseVoiceInputResult {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const shouldCommitOnEndRef = useRef(true);
  const onTranscriptRef = useRef(onTranscript);

  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>('unsupported');
  const [permissionState, setPermissionState] = useState<MicrophonePermissionState>('unknown');
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Guarded i18n channel (K4-B): error strings resolve through the
  // `components` catalog when an I18nProvider is mounted; a missing key
  // echoes the full key back, the endsWith guard detects it, and the
  // documented English fallback is used, so behavior is byte-identical until
  // the locale JSONs land. A ref carries the resolver into effect-assigned
  // recognition handlers and stable callbacks without re-running the
  // recognition setup effect or growing dependency arrays.
  const i18n = useOptionalTranslation('components');
  const resolveErrorRef = useRef<(errorCode?: string, fallback?: string) => string>(
    (errorCode, fallback) => fallback ?? getErrorMessage(errorCode),
  );
  useEffect(() => {
    resolveErrorRef.current = (errorCode?: string, fallback?: string): string => {
      const key =
        (errorCode ? VOICE_ERROR_KEY_BY_CODE[errorCode] : undefined) ??
        'voiceInput.error.generic';
      const english = fallback ?? getErrorMessage(errorCode);
      const translated = i18n?.t(key);
      return translated && !translated.endsWith(key) ? translated : english;
    };
  });

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setIsSupported(false);
      setStatus('unsupported');
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setErrorMessage(null);
      setStatus('listening');
      setTranscriptPreview('');
    };

    recognition.onresult = (event) => {
      let finalText = finalTranscriptRef.current;
      let interimText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result?.[0] ?? result?.item(0);
        const transcript = alternative?.transcript?.trim() ?? '';
        if (!transcript) continue;

        if (result.isFinal) {
          finalText = `${finalText} ${transcript}`.trim();
        } else {
          interimText = `${interimText} ${transcript}`.trim();
        }
      }

      finalTranscriptRef.current = finalText;
      interimTranscriptRef.current = interimText;
      setTranscriptPreview(`${finalText} ${interimText}`.trim());
      setStatus(interimText ? 'transcribing' : 'listening');
    };

    recognition.onspeechend = () => {
      setStatus((current) => (current === 'unsupported' || current === 'error' ? current : 'transcribing'));
      recognition.stop();
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionState('denied');
      }

      setStatus('error');
      setErrorMessage(resolveErrorRef.current(event.error));
      setTranscriptPreview('');
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      shouldCommitOnEndRef.current = false;
    };

    recognition.onend = () => {
      if (shouldCommitOnEndRef.current) {
        const transcript = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
        if (transcript) {
          onTranscriptRef.current(transcript);
        }
      }

      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      shouldCommitOnEndRef.current = true;
      setTranscriptPreview('');
      setStatus((current) => (current === 'error' ? 'error' : 'idle'));
    };

    recognitionRef.current = recognition;
    setIsSupported(true);
    setStatus('idle');

    const voiceNavigator = navigator as NavigatorWithMicrophoneSupport;

    if (voiceNavigator.permissions?.query) {
      voiceNavigator.permissions
        .query({ name: 'microphone' })
        .then((permissionStatus) => {
          permissionStatusRef.current = permissionStatus as PermissionStatus;
          setPermissionState(permissionStatus.state);
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state);
            if (permissionStatus.state !== 'denied') {
              setErrorMessage(null);
              setStatus('idle');
            }
          };
        })
        .catch(() => {
          setPermissionState('unknown');
        });
    }

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onspeechend = null;
      recognition.onend = null;
      recognition.onerror = null;
      if (permissionStatusRef.current) {
        permissionStatusRef.current.onchange = null;
      }
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [lang]);

  const requestMicrophoneAccess = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState('granted');
      return true;
    } catch (error) {
      const errorName =
        error instanceof DOMException
          ? error.name
          : error && typeof error === 'object' && 'name' in error
            ? String((error as { name?: string }).name)
            : '';

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setPermissionState('denied');
        setStatus('error');
        setErrorMessage(resolveErrorRef.current('not-allowed'));
        return false;
      }

      if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setStatus('error');
        setErrorMessage(resolveErrorRef.current('audio-capture'));
        return false;
      }

      setStatus('error');
      setErrorMessage(
        resolveErrorRef.current(
          undefined,
          'We could not access the microphone. Try again or type your query.',
        ),
      );
      return false;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    void (async () => {
      if (permissionState === 'denied') {
        setStatus('error');
        setErrorMessage(resolveErrorRef.current('not-allowed'));
        return;
      }

      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      shouldCommitOnEndRef.current = true;
      setTranscriptPreview('');
      setErrorMessage(null);

      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) return;

      try {
        recognitionRef.current?.start();
      } catch {
        setStatus('error');
        setErrorMessage(
          resolveErrorRef.current(
            undefined,
            'Voice input could not start. Try again or type your query.',
          ),
        );
      }
    })();
  }, [isSupported, permissionState, requestMicrophoneAccess]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    shouldCommitOnEndRef.current = true;
    recognitionRef.current.stop();
    setStatus((current) => (current === 'listening' ? 'transcribing' : current));
  }, [isSupported]);

  const cancelListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    shouldCommitOnEndRef.current = false;
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setTranscriptPreview('');
    recognitionRef.current.abort();
    setStatus('idle');
  }, [isSupported]);

  const resetVoiceFeedback = useCallback(() => {
    if (permissionState === 'denied') {
      setErrorMessage(resolveErrorRef.current('not-allowed'));
      setStatus('error');
      return;
    }

    setErrorMessage(null);
    setTranscriptPreview('');
    setStatus((current) => (current === 'unsupported' ? current : 'idle'));
  }, [permissionState]);

  return {
    isSupported,
    status,
    permissionState,
    transcriptPreview,
    errorMessage,
    requestPermission: requestMicrophoneAccess,
    startListening,
    stopListening,
    cancelListening,
    resetVoiceFeedback,
  };
}
