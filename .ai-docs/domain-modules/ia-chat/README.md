# IA-Chat Module (dm-ia-chat)

> **Comprehensive AI/ML infrastructure - the most complex module in the platform**

## What It Does

The IA-Chat module provides unified access to multiple AI/ML providers for chat, speech, transcription, and more. With 160+ use cases, it's the most feature-rich module in the platform, abstracting provider differences behind consistent interfaces.

The module supports chat completions with streaming, voice synthesis and transcription, phone call integration, batch processing, and real-time health monitoring with circuit breakers. It manages quotas, tracks usage costs, and provides automatic fallback between providers.

## When to Use

- **Chat Completions**: Send messages to LLM providers
- **Voice/Speech**: Text-to-speech and speech-to-text
- **Phone Calls**: AI-powered phone conversations
- **Transcription**: Audio/video transcription
- **Batch Processing**: Large-scale AI operations
- **Provider Management**: Configure and monitor AI providers

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | Configured AI assistant |
| **Provider** | AI service provider (OpenAI, Anthropic, etc.) |
| **Model** | Specific AI model |
| **Config** | Provider configuration per tenant |
| **Quota** | Usage limits and tracking |
| **Circuit** | Health monitoring circuit breaker |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 141 use cases (75 mutations + 66 queries) |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- all 141 use cases migrated
- **Pattern**: All use cases now return `Result<T>` via `createSuccessResult(data)` and `createErrorResult(code, message, details)` from `@rottay/core` instead of throwing errors or returning manual `{ success: true/false }` objects
- **Multi-provider AI module**: OpenAI, Anthropic, Google, Mistral, Groq, Azure, ElevenLabs, Deepgram, AssemblyAI, Retell, VAPI, Bland
- **Codebase size**: ~56K LOC

## Import

```typescript
// Chat
import { makeSendMessageUC, makeSendMessageStreamUC, makeChatWithThinkingUC } from '@rottay/ia-chat';

// Agents
import { makeCreateAgentUC, makeUpdateAgentUC, makeSetDefaultAgentUC } from '@rottay/ia-chat';

// Voice
import { makeSynthesizeSpeechUC, makeTranscribeAudioUC } from '@rottay/ia-chat';

// Phone
import { makeInitiateCallUC, makeEndCallUC, makeTransferCallUC } from '@rottay/ia-chat';

// Providers
import { makeCreateProviderUC, makeGetProviderHealthUC } from '@rottay/ia-chat';
```

## Supported Providers

```typescript
// Chat/LLM Providers
const chatProviders = ['openai', 'anthropic', 'mistral', 'groq', 'together', 'replicate'];

// Voice Providers
const voiceProviders = ['elevenlabs', 'deepgram', 'assembly', 'retell'];
```

## Token Economy (2026-02-06 Audit)

The ia-chat module is the pricing engine layer of the AI Token Economy:

- **DB-driven pricing**: `ai_provider_pricing` and `ai_pricing_config` tables replace hardcoded rates. `CostCalculatorService` reads rates from DB and applies the markup formula: `rottayCost = providerCost * (1 + markupPercent/100) * multiplier * (1 - discountPercent/100)`
- **Provider settings schema**: `ProviderConfigSchema` enables dynamic UI generation for per-provider settings in the admin panel
- **Normalized conversation output**: `ConversationOutput` with `NormalizedTranscript` and `TranscriptTurn` for structured data exchange with dm-scoring
- **Self-hosted provider adapters**: `rottay_tts` (Qwen3-TTS), `rottay_stt` (Faster-Whisper), `rottay_voice` (Pipecat/Daily.co) -- $0 provider cost with flat infra fee (~$0.02/min)

## Session 2026-02-06 Changes

- **Deprecated shims + placeholder dirs cleaned**: Removed legacy re-export shims and empty placeholder directories that were no longer serving any purpose
- **ESLint v9 flat config**: Migrated from `.eslintrc.json` to ESLint v9 flat config (`eslint.config.js`). Legacy `.eslintrc.json` deleted.

## Related Modules

- [Recruiter](../recruiter/) - AI interviews
- [Scoring](../scoring/) - LLM-based evaluation
