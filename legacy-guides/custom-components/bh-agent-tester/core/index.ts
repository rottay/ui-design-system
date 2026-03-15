/**
 * BhAgentTester - Core Interface
 * Agent Validation Console for BitHire ATS platform
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBAgent } from '@rottay/ia-chat';

export type BhAgentTesterPreset = 'standard';

export type ChatRole = 'user' | 'agent';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface TestConfig {
  personaName: string;
  personaDescription: string;
  scenario: string;
  maxTurns: number;
}

export type ValidationStatus = 'pass' | 'fail' | 'warning' | 'pending';

export interface ValidationCheck {
  name: string;
  status: ValidationStatus;
  value?: string | number;
  message?: string;
}

export interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: string;
}

export interface CostEstimate {
  tokens: number;
  voiceMinutes: number;
  apiCalls: number;
  totalCost: number;
}

export interface AgentInfo {
  name: string;
  type: string;
  voice: string;
  language: string;
  model: string;
}

export type AudioPlaybackState = 'idle' | 'playing' | 'paused';

export interface AudioState {
  playback: AudioPlaybackState;
  currentTime: number;
  duration: number;
  speed: number;
}

export interface BhAgentTesterProps extends EngineAwareProps {
  preset?: BhAgentTesterPreset;

  /** Agent information displayed in the header */
  agentInfo?: AgentInfo;

  /** Chat messages in the simulation */
  messages?: ChatMessage[];

  /** Current test configuration */
  testConfig?: TestConfig;

  /** Callback when test config changes */
  onConfigChange?: (config: TestConfig) => void;

  /** Callback to start a test run */
  onStartTest?: () => void;

  /** Callback to stop a running test */
  onStopTest?: () => void;

  /** Whether a test is currently running */
  isRunning?: boolean;

  /** Validation check results */
  validationResults?: ValidationCheck[];

  /** Full transcript of the conversation */
  transcript?: TranscriptLine[];

  /** Cost estimate for the test */
  costEstimate?: CostEstimate;

  /** Current audio playback state */
  audioState?: AudioState;

  /** Callback when audio play/pause is toggled */
  onAudioToggle?: () => void;

  /** Callback when audio seek position changes */
  onAudioSeek?: (time: number) => void;

  /** Callback when playback speed changes */
  onSpeedChange?: (speed: number) => void;

  /** Whether the agent is currently typing */
  isTyping?: boolean;

  /** Callback to send a message manually */
  onSendMessage?: (content: string) => void;

  /** Callback to reset the test */
  onReset?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_AGENT_TESTER_DEFAULTS: Partial<BhAgentTesterProps> = {
  preset: 'standard',
  isRunning: false,
  isTyping: false,
};
