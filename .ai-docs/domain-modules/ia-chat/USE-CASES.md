# dm-ia-chat - Use Cases

> **AI Chat Module - Most complex module in the system**

**Total: 141 use cases (75 mutations, 66 queries) | 141 zero-arg factories (100% coverage)**

> **REVIEW-2026 Result Pattern Migration**: Complete. All 141 use cases return `Result<T>` using `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. Multi-provider AI module (OpenAI, Anthropic, Google, Mistral, Groq, Azure, ElevenLabs, Deepgram, AssemblyAI, Retell, VAPI, Bland). ~56K LOC.

---

## Quick Index

### Mutations
- [chat](#chat)
- [chat-extensions](#chat-extensions)
- [phone](#phone)
- [agent](#agent)
- [api-key](#api-key)
- [config](#config)
- [provider](#provider)
- [model](#model)
- [batch](#batch)
- [transcription](#transcription)
- [voice](#voice)
- [conversation](#conversation)
- [knowledge](#knowledge)
- [ocr](#ocr)
- [dubbing](#dubbing)
- [intelligence](#intelligence)
- [openai](#openai)
- [quota](#quota)
- [usage](#usage)
- [health](#health)
- [squad](#squad)
- [project](#project)

### Queries
- [chat (queries)](#chat-1)
- [phone (queries)](#phone-1)
- [agent (queries)](#agent-1)
- [config (queries)](#config-1)
- [provider (queries)](#provider-1)
- [model (queries)](#model-1)
- [batch (queries)](#batch-1)
- [health (queries)](#health-1)
- [usage (queries)](#usage-1)
- [analytics](#analytics)
- [transcription (queries)](#transcription-1)
- [intelligence (queries)](#intelligence-1)
- [voice (queries)](#voice-1)

### Other
- [Orchestrators](#orchestrators)
- [Supported Providers](#supported-providers)
- [Entities](#entities)
- [Related](#related)

---

## Overview

The **dm-ia-chat** module is the most complex domain module in the Rottay system, providing a unified interface for AI-powered chat, voice, and transcription capabilities across multiple providers.

### Key Capabilities

- **Multi-Provider Chat**: Unified API for OpenAI, Anthropic, Google, Mistral, Groq, Azure
- **Voice Synthesis & Recognition**: Text-to-Speech (TTS) and Speech-to-Text (STT) with ElevenLabs, Deepgram, AssemblyAI
- **Phone Integration**: AI-powered phone calls with Retell, VAPI, Bland voice AI
- **Batch Processing**: Bulk operations for cost-efficient processing
- **Health Monitoring**: Circuit breakers and fallback orchestration for high availability
- **Quota Management**: Usage tracking and cost estimation across providers
- **OpenAI Ecosystem**: Images, files, moderation, and batch management

### Architecture Highlights

- **Fallback System**: Automatic provider switching when primary is unavailable
- **Agent Versioning**: Track and manage different versions of AI agents
- **Knowledge Bases**: RAG-enabled document processing and retrieval
- **Session Management**: Maintain conversation context across interactions

---

## Mutations

### chat
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| send-message | Sends message to chat | `SendChatMessageUseCase` | `makeSendChatMessageUseCase` |
| send-message-stream | Sends message with streaming | `SendChatMessageStreamUseCase` | `makeSendChatMessageStreamUseCase` |

### chat-extensions
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| chat-with-thinking | Chat with "thinking" mode (visible reasoning) | `ChatWithThinkingUseCase` | `makeChatWithThinkingUseCase` |
| execute-code | Executes code in sandbox | `ExecuteCodeUseCase` | `makeExecuteCodeUseCase` |
| scale-deployment | Scales model deployment | `ScaleDeploymentUseCase` | `makeScaleDeploymentUseCase` |
| process-pdf | Processes PDF document | `ProcessPDFUseCase` | `makeProcessPDFUseCase` |

### phone
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| initiate-call | Initiates phone call | `InitiatePhoneCallUseCase` | `makeInitiatePhoneCallUseCase` |
| end-call | Ends call | `EndPhoneCallUseCase` | `makeEndPhoneCallUseCase` |
| transfer-call | Transfers call | `TransferPhoneCallUseCase` | `makeTransferPhoneCallUseCase` |
| hold-call | Puts call on hold | `HoldCallUseCase` | `makeHoldCallUseCase` |
| mute-call | Mutes call | `MuteCallUseCase` | `makeMuteCallUseCase` |

### agent
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates new AI agent | `CreateAgentUseCase` | `makeCreateAgentUseCase` |
| update | Updates agent configuration | `UpdateAgentUseCase` | `makeUpdateAgentUseCase` |
| delete | Deletes agent | `DeleteAgentUseCase` | `makeDeleteAgentUseCase` |
| duplicate | Duplicates existing agent | `DuplicateAgentUseCase` | `makeDuplicateAgentUseCase` |
| set-default | Sets default agent | `SetDefaultAgentUseCase` | `makeSetDefaultAgentUseCase` |
| create-agent-version | Creates new agent version | `CreateAgentVersionUseCase` | `makeCreateAgentVersionUseCase` |
| create-mistral-agent | Creates Mistral-specific agent | `CreateMistralAgentUseCase` | `makeCreateMistralAgentUseCase` |

### api-key
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates API key for access | `CreateApiKeyUseCase` | `makeCreateApiKeyUseCase` |
| rotate | Rotates API key | `RotateApiKeyUseCase` | `makeRotateApiKeyUseCase` |
| revoke | Revokes API key | `RevokeApiKeyUseCase` | `makeRevokeApiKeyUseCase` |

### config
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates provider configuration | `CreateConfigUseCase` | `makeCreateConfigUseCase` |
| update | Updates configuration | `UpdateConfigUseCase` | `makeUpdateConfigUseCase` |
| delete | Deletes configuration | `DeleteConfigUseCase` | `makeDeleteConfigUseCase` |
| set-priority | Sets configuration priority | `SetConfigPriorityUseCase` | `makeSetConfigPriorityUseCase` |

### provider
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Registers new provider | `CreateProviderUseCase` | `makeCreateProviderUseCase` |
| update | Updates provider | `UpdateProviderUseCase` | `makeUpdateProviderUseCase` |
| delete | Deletes provider | `DeleteProviderUseCase` | `makeDeleteProviderUseCase` |
| activate | Activates provider | `ActivateProviderUseCase` | `makeActivateProviderUseCase` |
| deactivate | Deactivates provider | `DeactivateProviderUseCase` | `makeDeactivateProviderUseCase` |
| set-default | Sets default provider | `SetDefaultProviderUseCase` | `makeSetDefaultProviderUseCase` |

### model
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Registers new model | `CreateModelUseCase` | `makeCreateModelUseCase` |
| update-meta | Updates model metadata | `UpdateModelMetaUseCase` | `makeUpdateModelMetaUseCase` |
| delete | Deletes model | `DeleteModelUseCase` | `makeDeleteModelUseCase` |
| deprecate | Marks model as deprecated | `DeprecateModelUseCase` | `makeDeprecateModelUseCase` |

### batch
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-batch-job | Creates a batch processing job | `CreateBatchJobUseCase` | `makeCreateBatchJobUseCase` |
| get-batch-status | Gets batch job status | `GetBatchStatusUseCase` | `makeGetBatchStatusUseCase` |
| cancel-batch | Cancels a batch job | `CancelBatchUseCase` | `makeCancelBatchUseCase` |
| create-batch-call | Creates batch call | `CreateBatchCallUseCase` | `makeCreateBatchCallUseCase` |
| create-anthropic-batch | Creates Anthropic batch | `CreateAnthropicBatchUseCase` | `makeCreateAnthropicBatchUseCase` |
| cancel-anthropic-batch | Cancels Anthropic batch | `CancelAnthropicBatchUseCase` | `makeCancelAnthropicBatchUseCase` |
| create-groq-batch | Creates Groq batch | `CreateGroqBatchUseCase` | `makeCreateGroqBatchUseCase` |

### transcription
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| transcribe-with-pii-redaction | Transcribes with PII redaction | `TranscribeWithPIIRedactionUseCase` | `makeTranscribeWithPIIRedactionUseCase` |
| groq-transcribe | Transcribes with Groq | `GroqTranscribeUseCase` | `makeGroqTranscribeUseCase` |

### voice
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| synthesize-speech | Synthesizes voice (TTS) | `SynthesizeSpeechUseCase` | `makeSynthesizeSpeechUseCase` |
| transcribe-audio | Transcribes audio (STT) | `TranscribeAudioUseCase` | `makeTranscribeAudioUseCase` |
| translate-audio | Translates audio | `TranslateAudioUseCase` | `makeTranslateAudioUseCase` |
| isolate-voice | Isolates voice from audio | `IsolateVoiceUseCase` | `makeIsolateVoiceUseCase` |
| generate-sound-effect | Generates sound effect | `GenerateSoundEffectUseCase` | `makeGenerateSoundEffectUseCase` |
| create-batch-transcription | Batch transcription | `CreateBatchTranscriptionUseCase` | `makeCreateBatchTranscriptionUseCase` |

### conversation
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| start | Starts conversation | `StartConversationUseCase` | `makeStartConversationUseCase` |
| end | Ends conversation | `EndConversationUseCase` | `makeEndConversationUseCase` |
| get-status | Gets conversation status | `GetConversationStatusUseCase` | `makeGetConversationStatusUseCase` |

### knowledge
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-knowledge-base | Creates knowledge base | `CreateKnowledgeBaseUseCase` | `makeCreateKnowledgeBaseUseCase` |
| create-retell-kb | Creates KB for Retell | `CreateRetellKnowledgeBaseUseCase` | `makeCreateRetellKnowledgeBaseUseCase` |

### ocr
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| extract-text | Extracts text from image | `ExtractTextUseCase` | `makeExtractTextUseCase` |

### dubbing
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-dubbing | Creates audio/video dubbing | `CreateDubbingUseCase` | `makeCreateDubbingUseCase` |

### intelligence
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| summarize-transcript | Summarizes transcription | `SummarizeTranscriptUseCase` | `makeSummarizeTranscriptUseCase` |

### openai
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| moderate-content | Moderates text content | `ModerateContentUseCase` | `makeModerateContentUseCase` |
| moderate-images | Moderates image content | `ModerateImagesUseCase` | `makeModerateImagesUseCase` |
| generate-image | Generates images with DALL-E | `GenerateImageUseCase` | `makeGenerateImageUseCase` |
| edit-image | Edits an existing image | `EditImageUseCase` | `makeEditImageUseCase` |
| create-image-variation | Creates image variation | `CreateImageVariationUseCase` | `makeCreateImageVariationUseCase` |
| upload-file | Uploads file to OpenAI | `UploadFileUseCase` | `makeUploadFileUseCase` |
| list-files | Lists OpenAI files | `ListFilesUseCase` | `makeListFilesUseCase` |
| delete-file | Deletes an OpenAI file | `DeleteFileUseCase` | `makeDeleteFileUseCase` |

### quota
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| consume | Consumes quota | `ConsumeQuotaUseCase` | `makeConsumeQuotaUseCase` |
| reset | Resets quota | `ResetQuotaUseCase` | `makeResetQuotaUseCase` |
| upsert | Creates/updates quota | `UpsertQuotaUseCase` | `makeUpsertQuotaUseCase` |

### usage
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| record | Records usage | `RecordUsageUseCase` | `makeRecordUsageUseCase` |

### health
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| record-check | Records health check | `RecordHealthCheckUseCase` | `makeRecordHealthCheckUseCase` |
| update-circuit | Updates circuit breaker | `UpdateCircuitUseCase` | `makeUpdateCircuitUseCase` |

### squad
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-squad | Creates agent squad | `CreateSquadUseCase` | `makeCreateSquadUseCase` |

### project
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-audio-project | Creates audio project | `CreateAudioProjectUseCase` | `makeCreateAudioProjectUseCase` |

---

## Queries

### chat
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| list-deployments | Lists deployments | `ListDeploymentsQuery` | `makeListDeploymentsQuery` |

### phone
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-call-status | Gets call status | `GetCallStatusQuery` | `makeGetCallStatusQuery` |
| get-recording | Gets recording | `GetCallRecordingQuery` | `makeGetCallRecordingQuery` |
| get-transcript | Gets transcription | `GetCallTranscriptQuery` | `makeGetCallTranscriptQuery` |
| list-calls | Lists calls | `ListCallsQuery` | `makeListCallsQuery` |
| get-call-sentiment | Gets call sentiment analysis | `GetCallSentimentQuery` | `makeGetCallSentimentQuery` |

### agent
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets agent by ID | `GetAgentByIdQuery` | `makeGetAgentByIdQuery` |
| get-by-name | Gets agent by name | `GetAgentByNameQuery` | `makeGetAgentByNameQuery` |
| list | Lists agents | `ListAgentsQuery` | `makeListAgentsQuery` |
| get-default | Gets default agent | `GetDefaultAgentQuery` | `makeGetDefaultAgentQuery` |
| count | Counts agents | `CountAgentsQuery` | `makeCountAgentsQuery` |

### config
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets configuration by ID | `GetConfigByIdQuery` | `makeGetConfigByIdQuery` |
| list-by-tenant | Lists configs by tenant | `ListConfigsByTenantQuery` | `makeListConfigsByTenantQuery` |
| list-by-provider | Lists configs by provider | `ListConfigsByProviderQuery` | `makeListConfigsByProviderQuery` |
| get-primary-for-type | Gets primary config by type | `GetPrimaryConfigForTypeQuery` | `makeGetPrimaryConfigForTypeQuery` |
| get-with-fallbacks | Gets config with fallbacks | `GetConfigWithFallbacksQuery` | `makeGetConfigWithFallbacksQuery` |
| check-exists | Checks if config exists | `CheckConfigExistsQuery` | `makeCheckConfigExistsQuery` |
| count | Counts configs | `CountConfigsQuery` | `makeCountConfigsQuery` |
| get-summary | Gets tenant config summary | `GetTenantConfigSummaryQuery` | `makeGetTenantConfigSummaryQuery` |

### provider
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets provider by ID | `GetProviderByIdQuery` | `makeGetProviderByIdQuery` |
| get-by-code | Gets by code | `GetProviderByCodeQuery` | `makeGetProviderByCodeQuery` |
| list | Lists providers | `ListProvidersQuery` | `makeListProvidersQuery` |
| list-active | Lists active providers | `ListActiveProvidersQuery` | `makeListActiveProvidersQuery` |
| list-active-for-tenant | Lists active providers for tenant | `ListActiveProvidersForTenantQuery` | `makeListActiveProvidersForTenantQuery` |
| list-by-type | Lists by type | `ListProvidersByTypeQuery` | `makeListProvidersByTypeQuery` |
| get-default | Gets default | `GetDefaultProviderQuery` | `makeGetDefaultProviderQuery` |
| get-menu | Gets provider menu | `GetProviderMenuQuery` | `makeGetProviderMenuQuery` |
| get-stats | Gets statistics | `GetProviderStatsQuery` | `makeGetProviderStatsQuery` |
| get-health | Gets provider health | `GetProviderHealthQuery` | `makeGetProviderHealthQuery` |
| check-exists | Checks existence | `CheckProviderExistsQuery` | `makeCheckProviderExistsQuery` |
| count | Counts providers | `CountProvidersQuery` | `makeCountProvidersQuery` |

### model
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets model by ID | `GetModelByIdQuery` | `makeGetModelByIdQuery` |
| get-by-external-id | Gets by external ID | `GetModelByExternalIdQuery` | `makeGetModelByExternalIdQuery` |
| list | Lists models | `ListModelsQuery` | `makeListModelsQuery` |
| list-by-provider | Lists by provider | `ListModelsByProviderQuery` | `makeListModelsByProviderQuery` |
| list-chat-models | Lists chat models | `ListChatModelsQuery` | `makeListChatModelsQuery` |
| list-stt-models | Lists STT models | `ListSTTModelsQuery` | `makeListSTTModelsQuery` |
| list-voices | Lists available voices | `ListVoicesQuery` | `makeListVoicesQuery` |
| get-default | Gets default | `GetDefaultModelQuery` | `makeGetDefaultModelQuery` |
| search | Searches models | `SearchModelsQuery` | `makeSearchModelsQuery` |
| count | Counts models | `CountModelsQuery` | `makeCountModelsQuery` |
| list-provider-chat-models | Lists chat models by provider | `ListProviderChatModelsQuery` | `makeListProviderChatModelsQuery` |
| get-chat-capabilities | Gets chat capabilities | `GetChatCapabilitiesQuery` | `makeGetChatCapabilitiesQuery` |

### batch
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-batch-status | Gets batch status | `GetBatchStatusQuery` | `makeGetBatchStatusQuery` |
| get-batch-results | Gets batch results | `GetBatchResultsQuery` | `makeGetBatchResultsQuery` |
| list-batches | Lists batches | `ListBatchesQuery` | `makeListBatchesQuery` |

### health
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| check-available | Checks provider availability | `CheckProviderAvailableQuery` | `makeCheckProviderAvailableQuery` |
| get-all-health | Gets all health status | `GetAllProvidersHealthQuery` | `makeGetAllProvidersHealthQuery` |
| get-summary | Gets health summary | `GetHealthSummaryQuery` | `makeGetHealthSummaryQuery` |
| get-circuit-state | Gets circuit state | `GetCircuitStateQuery` | `makeGetCircuitStateQuery` |
| get-history | Gets health history | `GetHealthHistoryQuery` | `makeGetHealthHistoryQuery` |
| get-availability | Gets availability stats | `GetAvailabilityStatsQuery` | `makeGetAvailabilityStatsQuery` |
| list-unhealthy | Lists unhealthy providers | `ListUnhealthyProvidersQuery` | `makeListUnhealthyProvidersQuery` |
| list-open-circuits | Lists open circuits | `ListOpenCircuitsQuery` | `makeListOpenCircuitsQuery` |

### usage
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-summary | Gets usage summary | `GetUsageSummaryQuery` | `makeGetUsageSummaryQuery` |
| get-trend | Gets usage trend | `GetUsageTrendQuery` | `makeGetUsageTrendQuery` |
| get-cost-breakdown | Gets cost breakdown | `GetCostBreakdownQuery` | `makeGetCostBreakdownQuery` |
| get-current-quota | Gets current quota | `GetCurrentQuotaQuery` | `makeGetCurrentQuotaQuery` |
| get-quota-by-id | Gets quota by ID | `GetQuotaByIdQuery` | `makeGetQuotaByIdQuery` |
| check-available | Checks quota availability | `CheckQuotaAvailableQuery` | `makeCheckQuotaAvailableQuery` |
| estimate-cost | Estimates cost | `EstimateCostQuery` | `makeEstimateCostQuery` |
| list-quotas | Lists quotas | `ListQuotasQuery` | `makeListQuotasQuery` |
| list-records | Lists usage records | `ListUsageRecordsQuery` | `makeListUsageRecordsQuery` |

### analytics
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-call-analytics | Gets call analytics | `GetCallAnalyticsQuery` | `makeGetCallAnalyticsQuery` |

### transcription
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-auto-highlights | Gets auto highlights | `GetAutoHighlightsQuery` | `makeGetAutoHighlightsQuery` |

### intelligence
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| extract-action-items | Extracts action items | `ExtractActionItemsQuery` | `makeExtractActionItemsQuery` |

### voice
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| search-voice-library | Searches voice library | `SearchVoiceLibraryQuery` | `makeSearchVoiceLibraryQuery` |

---

## Orchestrators

| Orchestrator | Description |
|--------------|-------------|
| `FallbackOrchestrator` | Manages fallback between providers |
| `ProviderSelectionOrchestrator` | Selects optimal provider |
| `SessionOrchestrator` | Manages chat sessions |

---

## Supported Providers

```typescript
type ProviderType =
  | 'chat'          // Chat/LLM
  | 'stt'           // Speech-to-Text
  | 'tts'           // Text-to-Speech
  | 'embedding'     // Embeddings
  | 'image'         // Image generation
  | 'moderation';   // Content moderation

// Chat Providers
const chatProviders = [
  'openai',       // GPT-4, GPT-4 Turbo
  'anthropic',    // Claude
  'google',       // Gemini
  'mistral',      // Mistral AI
  'groq',         // Groq (LPU)
  'azure',        // Azure OpenAI
];

// Voice Providers
const voiceProviders = [
  'elevenlabs',   // Premium Text-to-Speech
  'deepgram',     // STT
  'assemblyai',   // AssemblyAI STT
];

// Phone Providers
const phoneProviders = [
  'retell',       // Retell Voice AI
  'vapi',         // VAPI
  'bland',        // Bland AI
];
```

---

## Entities

| Entity | Description |
|--------|-------------|
| `Agent` | AI agent with configuration and behavior settings |
| `AgentVersion` | Versioned snapshot of agent configuration |
| `ApiKey` | API key for external access |
| `Provider` | AI service provider (OpenAI, Anthropic, etc.) |
| `ProviderConfig` | Tenant-specific provider configuration |
| `Model` | AI model definition with capabilities |
| `Conversation` | Chat conversation session |
| `Message` | Individual message in conversation |
| `KnowledgeBase` | RAG knowledge base for retrieval |
| `Document` | Processed document in knowledge base |
| `Call` | Phone call session |
| `CallRecording` | Recording of phone call |
| `Transcription` | Audio transcription result |
| `Batch` | Batch processing job |
| `BatchResult` | Result of batch processing |
| `Quota` | Usage quota for tenant |
| `UsageRecord` | Individual usage record |
| `HealthCheck` | Provider health check result |
| `CircuitBreaker` | Circuit breaker state for provider |
| `Squad` | Group of agents working together |
| `AudioProject` | Audio processing project |

---

## Related

### Cross-Module Dependencies

| Module | Relationship |
|--------|--------------|
| **dm-recruiter** | Uses AI chat for candidate interviews, resume analysis, and automated screening. Phone integration enables voice interviews. |
| **dm-scoring** | Leverages AI models for candidate scoring algorithms, skill assessment analysis, and personality trait evaluation. |
| **dm-events** | AI-powered event recommendations and attendee matching. Voice synthesis for event announcements. |
| **dm-staff** | Uses chat for staff scheduling optimization and automated shift notifications. |

### Integration Points

- **Recruiter Module**: `dm-recruiter` calls `ia-chat` for:
  - AI-powered candidate screening conversations
  - Resume parsing and analysis
  - Interview transcription and summarization
  - Automated phone interview scheduling

- **Scoring Module**: `dm-scoring` integrates with `ia-chat` for:
  - AI model inference for scoring calculations
  - Natural language processing of candidate responses
  - Sentiment analysis of interview transcripts
  - Skill extraction from conversation data

### See Also

- [dm-recruiter USE-CASES.md](../recruiter/USE-CASES.md)
- [dm-scoring USE-CASES.md](../scoring/USE-CASES.md)
