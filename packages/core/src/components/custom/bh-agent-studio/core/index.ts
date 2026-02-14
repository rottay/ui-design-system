/**
 * BhAgentStudio - Core Interface
 * AI Agent Builder for BitHire ATS platform
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBAgent.type enum: 'conversation' | 'phone' | 'chat'
 * DBAgent.provider enum: 'vapi' | 'retell' | 'bland' | 'elevenlabs' | 'openai' | 'anthropic' | 'groq' | 'google' | 'mistral' | 'azure'
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBAgent } from '@rottay/ia-chat';

export type BhAgentStudioPreset = 'full' | 'guided';

/** Maps to DBAgent.type enum values */
export type AgentType = 'conversation' | 'phone' | 'chat';

/** Subset of DBAgent.provider values relevant for voice */
export type VoiceProvider = 'elevenlabs' | 'azure' | 'google';

export interface PersonalityTrait {
  name: string;
  /** 0-100 scale for empathy, directness, warmth, technicality */
  value: number;
}

export interface ScriptSection {
  id: string;
  title: string;
  promptText: string;
  order: number;
  conditions?: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export interface CallSettings {
  recordingEnabled: boolean;
  maxDurationMinutes: number;
  voicemailDetection: boolean;
  retryCount: number;
}

export type ValidationStatus = 'pass' | 'fail' | 'warning';

export interface ValidationResult {
  check: string;
  status: ValidationStatus;
  message: string;
}

export interface AgentData {
  name: string;
  description: string;
  type: AgentType;
  language: string;
  accent: string;
  voiceProvider: VoiceProvider;
  voiceId: string;
  toneLevel: number;
  personalityTraits: PersonalityTrait[];
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  scriptSections: ScriptSection[];
  tools: ToolConfig[];
  callSettings: CallSettings;
}

export interface VoiceOption {
  id: string;
  name: string;
  provider: VoiceProvider;
  accent?: string;
  previewUrl?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
}

export interface BhAgentStudioProps extends EngineAwareProps {
  preset?: BhAgentStudioPreset;
  agentData?: AgentData;
  onChange?: (data: AgentData) => void;
  onSave?: (data: AgentData) => void;
  onTest?: (data: AgentData) => void;
  onValidate?: (data: AgentData) => void;
  validationResults?: ValidationResult[];
  providers?: VoiceProvider[];
  languages?: string[];
  voices?: VoiceOption[];
  models?: ModelOption[];
  estimatedCost?: number;
  isDirty?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const DEFAULT_AGENT_DATA: AgentData = {
  name: '',
  description: '',
  type: 'conversation',
  language: 'English',
  accent: 'US',
  voiceProvider: 'elevenlabs',
  voiceId: '',
  toneLevel: 50,
  personalityTraits: [
    { name: 'Empathy', value: 70 },
    { name: 'Directness', value: 50 },
    { name: 'Warmth', value: 60 },
    { name: 'Technicality', value: 40 },
  ],
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  systemPrompt: '',
  scriptSections: [],
  tools: [],
  callSettings: {
    recordingEnabled: true,
    maxDurationMinutes: 30,
    voicemailDetection: true,
    retryCount: 2,
  },
};

export const BH_AGENT_STUDIO_DEFAULTS: Partial<BhAgentStudioProps> = {
  preset: 'full',
  providers: ['elevenlabs', 'azure', 'google'],
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Korean', 'Mandarin'],
  models: [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', maxTokens: 8192 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster with large context', maxTokens: 128000 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective', maxTokens: 4096 },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Advanced reasoning', maxTokens: 200000 },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance', maxTokens: 200000 },
  ],
  voices: [],
  validationResults: [],
  estimatedCost: 0,
  isDirty: false,
};

export function getAgentTypeConfig(tokens: DesignTokens) {
  return {
    conversation: {
      label: 'Conversation',
      description: 'Free-form dialogue agent for screening and assessments',
      color: tokens.colors.primaryScale[500],
      bgColor: tokens.colors.primaryScale[50],
      borderColor: tokens.colors.primaryScale[200],
    },
    phone: {
      label: 'Phone',
      description: 'Voice-based agent for phone interviews and calls',
      color: tokens.colors.secondaryScale[500],
      bgColor: tokens.colors.secondaryScale[50],
      borderColor: tokens.colors.secondaryScale[200],
    },
    chat: {
      label: 'Chat',
      description: 'Text-based agent for chat-based interactions',
      color: tokens.colors.infoScale[500],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
    },
  };
}

export function getProviderConfig(tokens: DesignTokens) {
  return {
    elevenlabs: {
      label: 'ElevenLabs',
      description: 'High-quality neural voices',
      color: tokens.colors.primaryScale[600],
      bgColor: tokens.colors.primaryScale[50],
      borderColor: tokens.colors.primaryScale[200],
    },
    azure: {
      label: 'Azure',
      description: 'Microsoft Azure TTS',
      color: tokens.colors.infoScale[600],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
    },
    google: {
      label: 'Google',
      description: 'Google Cloud TTS',
      color: tokens.colors.successScale[600],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
    },
  };
}

export function getValidationStatusColors(tokens: DesignTokens) {
  return {
    pass: {
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
    },
    fail: {
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
    },
    warning: {
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
    },
  };
}

export const SYSTEM_PROMPT_VARIABLES = [
  '{candidate_name}',
  '{job_title}',
  '{company_name}',
  '{interviewer_name}',
  '{interview_stage}',
  '{resume_summary}',
  '{job_description}',
  '{candidate_skills}',
];

export function formatEstimatedCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

export function getTemperatureLabel(value: number): string {
  if (value <= 0.3) return 'Deterministic';
  if (value <= 0.7) return 'Balanced';
  if (value <= 1.2) return 'Creative';
  return 'Highly Creative';
}

export function getToneLevelLabel(value: number): string {
  if (value <= 25) return 'Very Formal';
  if (value <= 45) return 'Formal';
  if (value <= 55) return 'Balanced';
  if (value <= 75) return 'Casual';
  return 'Very Casual';
}
